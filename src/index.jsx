import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Canvas
    gl={
      {
        antialias: true
      }
    }
      camera={{
        fov: 45,
        near: 0.1,
        far: 300,
        position: [3,2,6]
      }}
    >

      <Experience /> 

    </Canvas>
  </StrictMode>
)
