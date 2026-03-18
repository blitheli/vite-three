import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, Html } from "@react-three/drei";
import { TilesRenderer, TilesPlugin, EnvironmentControls } from "3d-tiles-renderer/r3f";
import {
  CesiumIonAuthPlugin,
  GoogleCloudAuthPlugin,
} from "3d-tiles-renderer/core/plugins";

function GoogleTilesRenderer({ children, apiToken, ...rest }) {
  return (
    <TilesRenderer {...rest} key={apiToken}>
      <TilesPlugin plugin={GoogleCloudAuthPlugin} args={{ apiToken }} />
      {children}
    </TilesRenderer>
  );
}

function CesiumIonTilesRenderer({ children, apiToken, assetId, ...rest }) {
  return (
    <TilesRenderer {...rest} key={apiToken + assetId}>
      <TilesPlugin
        plugin={CesiumIonAuthPlugin}
        args={{ apiToken, assetId }}
      />
      {children}
    </TilesRenderer>
  );
}

function App() {
  //  加载glb模型,并使用Drei的html标注进行兴趣点标注
  //-----------------------------------------------------------------
  return (
    <Canvas>
      <perspectiveCamera position={[300, 300, 300]} near={1} far={1e6} />
      style={ {
				width: '100%',
				height: '100%',
				position: 'absolute',
				margin: 0,
				left: 0,
				top: 0,
			} }
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.3} />

      <CesiumIonTilesRenderer
        apiToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4M2ZhYzM4My1lN2NhLTRjNTktODY1OC1jZDdmOTU3Y2ZjMGEiLCJpZCI6MTMwNTAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NjI0NzA5NzB9.rRTs6chsWJdo9KNYe5VjJj2fUzMHeniIJvFQOd0aLJU"
        assetId={2275207}
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
