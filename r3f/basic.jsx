import { StrictMode, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, GizmoHelper, GizmoViewport, MeshTransmissionMaterial } from "@react-three/drei";
import {
  TilesRenderer, TilesPlugin, EnvironmentControls,
} from "3d-tiles-renderer/r3f";
import { TilesFadePlugin } from "3d-tiles-renderer/plugins";

/*
  1. 独立的3D Tiles
  2. 单独一个旋转的mesh

  来源： https://github.com/NASA-AMMOS/3DTilesRendererJS/blob/master/example/r3f/basic.jsx
  20260318  blitheli
*/

//  独立的3D Tiles
const tilesetUrl = 'https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize_tileset.json';

//  单独一个旋转的mesh
function RotatingMesh(props) {

  const ref = useRef();

  useFrame(() => {

    const mesh = ref.current;
    mesh.rotation.x = Math.sin(window.performance.now() * 0.0005) * 2;
    mesh.rotation.y = Math.cos(window.performance.now() * 0.0015);

  });

  return <mesh {...props} ref={ref}>
    <icosahedronGeometry />
    <MeshTransmissionMaterial thickness={1.5} chromaticAberration={0.25} color={0x80DEEA} />
  </mesh>;

}

function App() {

  return (
    <Canvas camera={{ position: [12, 7.5, 12], }}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        margin: 0,
        left: 0,
        top: 0,
      }}
    >
      {/* 注意这里的旋转不要反了，否则旋转的mesh会反了 */}
      <group rotation-x={Math.PI * 0.5}>
        <TilesRenderer url={tilesetUrl}>
          {/* displayBoxBounds 仅用于调试，确认能看到表面后可关闭 */}
          <TilesPlugin plugin={TilesFadePlugin} fadeDuration={500} />

          {/* add mesh to local frame of the tileset*/}
          <RotatingMesh position={[0, - 4, - 4]} scale={2} />
        </TilesRenderer>
      </group>

      {/* Controls */}
      <EnvironmentControls enableDamping={true} maxDistance={50} />

      <Environment
        preset="sunset"
        background={true}
        backgroundBlurriness={0.9}
        environmentIntensity={1}
      />

      <GizmoHelper alignment="bottom-right">
        <GizmoViewport />
      </GizmoHelper>
    </Canvas>
  );
}

// ---- 页面渲染入口（兼容 HMR 热更新）----
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
