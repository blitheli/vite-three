import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import {
  TilesPlugin, TilesRenderer, TilesAttributionOverlay,
  GlobeControls, CameraTransition, CompassGizmo,
} from "3d-tiles-renderer/r3f";
import {
  UpdateOnChangePlugin, GLTFExtensionsPlugin,
  TileCompressionPlugin, TilesFadePlugin,
} from "3d-tiles-renderer/plugins";
import { CesiumIonAuthPlugin } from "3d-tiles-renderer/core/plugins";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// @takram/three-atmosphere R3F 组件（WebGL 版，非 WebGPU）
import { Atmosphere, Sky, Stars, SunLight } from "@takram/three-atmosphere/r3f";

/*
  大气效果演示：使用 @takram/three-atmosphere 的 R3F 组件
  - Atmosphere: 上下文提供者，处理太阳方向、预计算纹理等
  - Sky:        天空渲染
  - Stars:      星空
  - SunLight:   太阳平行光

  20260318  blitheli
*/

const dracoLoader = new DRACOLoader().setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

const assetId = 2275207;
const apiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4M2ZhYzM4My1lN2NhLTRjNTktODY1OC1jZDdmOTU3Y2ZjMGEiLCJpZCI6MTMwNTAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjI0NzA5NzB9.rRTs6chsWJdo9KNYe5VjJj2fUzMHeniIJvFQOd0aLJU";

function App() {
  return (
    <Canvas
      camera={{
        position: [0, 0.5 * 1e7, 1.5 * 1e7],
        near: 1,
        far: 4e7,
      }}
    >
      {/* 大气效果：date 控制太阳位置（即当前时间的太阳角度） */}
      <Atmosphere date={new Date()}>
        <Sky />
        <Stars />
        <SunLight />

        {/* 加载 3D Tiles 全球 */}
        <TilesRenderer group={{ rotation: [-Math.PI / 2, 0, 0] }}>
          <TilesPlugin plugin={CesiumIonAuthPlugin} args={{ apiToken, assetId }} />
          <TilesPlugin plugin={GLTFExtensionsPlugin} dracoLoader={dracoLoader} />
          <TilesPlugin plugin={TileCompressionPlugin} />
          <TilesPlugin plugin={UpdateOnChangePlugin} />
          <TilesPlugin plugin={TilesFadePlugin} fadeDuration={500} />

          <GlobeControls enableDamping={true} />
          <CameraTransition mode={"perspective"} />

          <TilesAttributionOverlay />
          <CompassGizmo />
        </TilesRenderer>
      </Atmosphere>

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
