import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { Canvas } from '@react-three/fiber';
import StageGlb from './StageGlb.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Canvas>
      <StageGlb />
    </Canvas>

  </StrictMode>
)
