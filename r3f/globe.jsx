import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
// TilesRenderer, controls and attribution imports
import {
  TilesPlugin, TilesRenderer, TilesAttributionOverlay,
  GlobeControls, CameraTransition, CompassGizmo,
} from '3d-tiles-renderer/r3f';
import {
  UpdateOnChangePlugin, GLTFExtensionsPlugin,
  ReorientationPlugin, TileCompressionPlugin, TilesFadePlugin,
} from '3d-tiles-renderer/plugins';
import { CesiumIonAuthPlugin } from '3d-tiles-renderer/core/plugins';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
// R3F, DREI and LEVA imports
import { Environment, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Perf } from "r3f-perf";

/*
  1. 使用Cesium Ion的API Token和资产ID加载3D Tiles 全球: Google Photorealistic 3D Tiles

*/
//Plugins


const dracoLoader = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const assetId = 2275207;
const apiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4M2ZhYzM4My1lN2NhLTRjNTktODY1OC1jZDdmOTU3Y2ZjMGEiLCJpZCI6MTMwNTAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjI0NzA5NzB9.rRTs6chsWJdo9KNYe5VjJj2fUzMHeniIJvFQOd0aLJU";

function App() {
  //  加载glb模型,并使用Drei的html标注进行兴趣点标注
  //-----------------------------------------------------------------
  return (
    <Canvas
      frameloop='always'  // 使用 Perf 监控时需要 always，调试完可改回 demand
      camera={{
        position: [0, 0.5 * 1e7, 1.5 * 1e7],
        near: 1,
        far: 1e5,
      }}
      flat
    >
      {/* 性能监控 */}
      <Perf position="top-left" />

      {/* 加载3D Tiles 全球 */}
      <TilesRenderer group={{ rotation: [- Math.PI / 2, 0, 0] }}>
        <TilesPlugin plugin={CesiumIonAuthPlugin} args={{ apiToken: apiToken, assetId }} />
        <TilesPlugin plugin={GLTFExtensionsPlugin} dracoLoader={dracoLoader} />
        <TilesPlugin plugin={TileCompressionPlugin} />
        <TilesPlugin plugin={UpdateOnChangePlugin} />
        <TilesPlugin plugin={TilesFadePlugin} fadeDuration={500} />

        {/* Controls */}
        <GlobeControls enableDamping={true} />
        <CameraTransition mode={'perspective'} />

        <TilesAttributionOverlay />

        {/* Add compass gizmo */}
        <CompassGizmo />
        {/* <TilesLoadingBar /> */}
      </TilesRenderer>

      {/* other r3f staging */}
      <Environment
        preset="sunset" background={true}
        backgroundBlurriness={0.9}
        environmentIntensity={1}
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
