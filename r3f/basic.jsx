import { StrictMode, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Html, Environment } from "@react-three/drei";
import * as THREE from "three";
import {
  TilesRenderer, TilesPlugin, EnvironmentControls,
  GlobeControls, TilesAttributionOverlay,
} from "3d-tiles-renderer/r3f";
import { DebugTilesPlugin, GoogleCloudAuthPlugin, TilesFadePlugin } from "3d-tiles-renderer/plugins";




const tilesetUrl = 'https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize_tileset.json';

const cameraPosition = [12, 7.5, 12]; // Set the camera position so the tiles are visible

export default function App() {
  // tile 加载后，将所有材质设为双面渲染（修复法线方向导致的面片不可见问题）
  const handleLoadModel = useCallback((event) => {
    event.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
      }
    });
  }, []);

  return (
    <Canvas camera={{ position: cameraPosition }}>

      {/* 光源 - 3D Tiles 的 PBR 材质需要光照才能显示表面 */}
      <ambientLight intensity={1} />
      <directionalLight position={[1, 2, 3]} intensity={1.5} />

      <group rotation-x={-Math.PI * 0.5}>
        <TilesRenderer url={tilesetUrl} onLoadModel={handleLoadModel}>
          {/* displayBoxBounds 仅用于调试，确认能看到表面后可关闭 */}
          <TilesPlugin plugin={DebugTilesPlugin} displayBoxBounds={false} />
          <TilesPlugin plugin={TilesFadePlugin} fadeDuration={500} />
        </TilesRenderer>
      </group>

      {/* Controls */}
      <EnvironmentControls enableDamping={true} maxDistance={50} />

      <Environment
        preset="sunset" 
        background={true}
        backgroundBlurriness={0.9}
        backgroundIntensity={1}
      />

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
