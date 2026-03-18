import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, extend } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'
import { WebGPURenderer, MeshPhysicalNodeMaterial } from 'three/webgpu'
import { time } from 'three/tsl'

extend({ MeshPhysicalNodeMaterial })

function WebGPUObject() {
  const clearcoatNode = useMemo(() => time.mul(2).sin().add(1).mul(0.5), [])

  return (
    <mesh>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshPhysicalNodeMaterial
        color="#ff4400"
        roughness={0.1}
        metalness={0.5}
        clearcoat={1}
        clearcoatNode={clearcoatNode}
      />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={async (glProps) => {
        const renderer = new WebGPURenderer(glProps)
        await renderer.init()
        return renderer
      }}
    >
      <color attach="background" args={['blue']} />

      <ambientLight intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={1} />

      <WebGPUObject />
      <Environment
        preset="sunset"
        background={true}
        backgroundBlurriness={0.9}
        environmentIntensity={1}
      />

      <Stats />
      <OrbitControls />
    </Canvas>
  )
}

// ---- 页面渲染入口（兼容 HMR 热更新）----
const container = document.getElementById('root')
if (!container._reactRoot) {
  container._reactRoot = createRoot(container)
}
container._reactRoot.render(
  <StrictMode>
    <App />
  </StrictMode>
)
