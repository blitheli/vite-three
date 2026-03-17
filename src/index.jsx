import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { Canvas } from '@react-three/fiber';
import StageGlb from './StageGlb.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: 300,
        position: [3,2,6]
      }}
    >
      <StageGlb /> 

    </Canvas>
  </StrictMode>
)
