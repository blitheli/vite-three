import { StrictMode, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AgXToneMapping, TextureLoader } from "three";
import {
  mix, mrt, mul, output, pass, texture, toneMapping, uniform, vec3,
} from "three/tsl";
import {
  MeshPhysicalNodeMaterial, PostProcessing, WebGPURenderer,
} from "three/webgpu";

import {
  getECIToECEFRotationMatrix,
  getMoonDirectionECI,
  getSunDirectionECI,
} from "@takram/three-atmosphere";
import {
  aerialPerspective,
  AtmosphereContextNode,
  AtmosphereLight,
  AtmosphereLightNode,
} from "@takram/three-atmosphere/webgpu";
import { Ellipsoid } from "@takram/three-geospatial";
import { EllipsoidMesh } from "@takram/three-geospatial/r3f";
import {
  dithering,
  highpVelocity,
  lensFlare,
  temporalAntialias,
} from "@takram/three-geospatial/webgpu";

/*
  WebGPU 大气效果演示 —— 移植自 @takram/three-atmosphere story.js
  剔除了 Storybook 相关依赖（useLocalDateControls / useOutputPassControls / useToneMappingControls 等）

  功能：
  - 地球 WGS84 椭球体 + NASA Blue Marble 纹理
  - AtmosphereLight / AtmosphereLightNode 大气光照
  - 后处理管线: AerialPerspective → LensFlare → ToneMapping(AgX) → TAA → Dithering
  - WebGPU 渲染器 (需要浏览器支持，Chrome 113+)

  纹理文件（放到 public/blue_marble/ 下）：
    color.webp, ocean.webp, clouds.webp, emissive.webp
    来源: NASA Blue Marble Collection
    https://visibleearth.nasa.gov/collection/1484/blue-marble

  20260318  blitheli
*/

// ---- 注册 AtmosphereLight 到 R3F JSX 元素 ----
extend({ AtmosphereLight });

// ---- 大气上下文（模块级单例，three.js 对象需要可变引用）----
const atmosphereContext = new AtmosphereContextNode();

// ---- Blue Marble 纹理材质 ----
const blueMarble = ({
  cloudAlbedo = 0.95,
  oceanRoughness = 0.4,
  oceanIOR = 1.33,
  emissiveColor = vec3(1, 0.6, 0.5).mul(0.002),
} = {}) => {
  const color = new TextureLoader().load("/blue_marble/color.webp");
  const ocean = new TextureLoader().load("/blue_marble/ocean.webp");
  const clouds = new TextureLoader().load("/blue_marble/clouds.webp");
  const emissive = new TextureLoader().load("/blue_marble/emissive.webp");
  color.anisotropy = 16;
  ocean.anisotropy = 16;
  clouds.anisotropy = 16;
  emissive.anisotropy = 16;

  const oceanSubClouds = mul(texture(ocean).r, texture(clouds).r.oneMinus());
  return {
    colorNode: mix(texture(color).rgb, vec3(cloudAlbedo), texture(clouds).r),
    emissiveNode: texture(emissive).r.mul(emissiveColor),
    roughnessNode: oceanSubClouds.remap(1, 0, oceanRoughness, 1),
    ior: oceanIOR,
  };
};

// ---- 核心场景内容 ----
function Content() {
  const gl = useThree(({ gl }) => gl);
  const scene = useThree(({ scene }) => scene);
  const camera = useThree(({ camera }) => camera);

  // 同步 camera 引用到 atmosphereContext（camera 在 resize 时可能变化）
  useEffect(() => {
    atmosphereContext.camera = camera;
  }, [camera]);

  // 初始化太阳 / 月亮方向（基于当前系统时间）
  // story.js 原版通过 useLocalDateControls 交互调节日期，这里简化为一次性设置
  useEffect(() => {
    const date = new Date();
    const { matrixECIToECEF, sunDirectionECEF, moonDirectionECEF } =
      atmosphereContext;
    getECIToECEFRotationMatrix(date, matrixECIToECEF.value);
    getSunDirectionECI(date, sunDirectionECEF.value).applyMatrix4(
      matrixECIToECEF.value
    );
    getMoonDirectionECI(date, moonDirectionECEF.value).applyMatrix4(
      matrixECIToECEF.value
    );
  }, []);

  // ---- WebGPU 后处理管线 ----
  // story.js 原版通过 useResource 创建，这里用 useMemo 替代

  // 1. 主渲染 pass（启用 MRT：颜色 + 高精度速度缓冲）
  const passNode = useMemo(
    () =>
      pass(scene, camera, { samples: 0 }).setMRT(
        mrt({ output, velocity: highpVelocity })
      ),
    [scene, camera]
  );

  const colorNode = passNode.getTextureNode("output");
  const depthNode = passNode.getTextureNode("depth");
  const velocityNode = passNode.getTextureNode("velocity");

  // 2. 空气透视 (Aerial Perspective)
  const aerialNode = useMemo(
    () => aerialPerspective(atmosphereContext, colorNode, depthNode),
    [colorNode, depthNode]
  );

  // 3. 镜头光晕 (Lens Flare)
  const lensFlareNode = useMemo(
    () => lensFlare(aerialNode),
    [aerialNode]
  );

  // 4. 色调映射 (AgX Tone Mapping, 曝光度 = 2)
  // story.js 原版通过 useToneMappingControls 交互调节，这里固定为 2
  const toneMappingNode = useMemo(
    () => toneMapping(AgXToneMapping, uniform(2), lensFlareNode),
    [lensFlareNode]
  );

  // 5. 时域抗锯齿 (Temporal Anti-Aliasing)
  const taaNode = useMemo(
    () =>
      temporalAntialias(highpVelocity)(
        toneMappingNode,
        depthNode,
        velocityNode,
        camera
      ),
    [camera, depthNode, velocityNode, toneMappingNode]
  );

  // 6. 最终后处理（附加 Dithering 去色带）
  const postProcessing = useMemo(
    () => new PostProcessing(gl, taaNode.add(dithering)),
    [gl, taaNode]
  );

  // 渲染循环 —— 优先级 1 接管 R3F 默认渲染，由 PostProcessing 全权负责绘制
  // story.js 原版使用 useGuardedFrame，这里用 useFrame 替代
  useFrame(() => {
    postProcessing.render();
  }, 1);

  // 地球材质
  const material = useMemo(
    () => new MeshPhysicalNodeMaterial(blueMarble()),
    []
  );

  return (
    <>
      {/* 大气光照（注册到 WebGPU node library 后可作为 JSX 使用） */}
      <atmosphereLight args={[atmosphereContext]} />

      {/* 轨道控制器 */}
      <OrbitControls minDistance={1.2e7} enablePan={false} />

      {/* WGS84 椭球体 + Blue Marble 纹理 */}
      <EllipsoidMesh
        args={[Ellipsoid.WGS84.radii, 360, 180]}
        material={material}
      />
    </>
  );
}

// ---- App：WebGPU Canvas ----
function App() {
  return (
    <Canvas
      // R3F v9 的 gl prop 支持 async 回调 → 可在此初始化 WebGPU 渲染器
      gl={async (defaultProps) => {
        const renderer = new WebGPURenderer({
          canvas: defaultProps.canvas,
          logarithmicDepthBuffer: true,
        });
        await renderer.init();
        // 将 AtmosphereLightNode 注册到渲染器的 node library
        renderer.library.addLight(AtmosphereLightNode, AtmosphereLight);
        return renderer;
      }}
      camera={{
        fov: 60,
        position: [1e7, 0, 0],
        up: [0, 0, 1],
        near: 5e3,
        far: 1e8,
      }}
      frameloop="always"
    >
      <Content />
    </Canvas>
  );
}

// ---- 页面渲染入口（兼容 HMR 热更新）----
const container = document.getElementById("root");
if (!container._reactRoot) {
  container._reactRoot = createRoot(container);
}
container._reactRoot.render(
  <StrictMode>
    <App />
  </StrictMode>
);
