import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Html, Environment } from "@react-three/drei";
import {
  TilesRenderer, TilesPlugin, EnvironmentControls,
  GlobeControls, TilesAttributionOverlay,
} from "3d-tiles-renderer/r3f";
import { DebugTilesPlugin, GoogleCloudAuthPlugin, TilesFadePlugin } from "3d-tiles-renderer/plugins";




const tilesetUrl = 'https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize_tileset.json';

const cameraPosition = [12, 7.5, 12]; // Set the camera position so the tiles are visible

export default function App() {
  return (
    <Canvas camera={{ position: cameraPosition }}>

      <group rotation-x={-Math.PI * 0.5}>
        <TilesRenderer url={tilesetUrl}>
          <TilesPlugin plugin={DebugTilesPlugin} displayBoxBounds={true} />
          <TilesPlugin plugin={TilesFadePlugin} fadeDuration={500} />
        </TilesRenderer>
      </group>


      {/* Controls */}
      <EnvironmentControls enableDamping={true} maxDistance={50} />

      <Environment
        preset="sunset" 
        background = {true}
        backgroundBlurriness={0.9}
        backgroundIntensity={1}
      />

    </Canvas>
  );
}

// ---- 页面渲染入口 ----
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
