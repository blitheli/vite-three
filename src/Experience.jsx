import {
  OrbitControls,
  TransformControls,
  PivotControls,
  Html,
} from "@react-three/drei";
import { useRef } from "react";

export default function Experience() {
  const cubeRef = useRef();
  return (
    <>
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.3} />

      <mesh ref={cubeRef} position-x={-2}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={"orange"} />
      </mesh>

      <TransformControls object={cubeRef} mode="rotate"></TransformControls>

      <PivotControls anchor={[0, 0, 0]} depthTest={false} lineWidth={4}>
        <mesh position={[2, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={"blue"} />
        </mesh>
      </PivotControls>

      <mesh position-y={-1} rotation-x={-Math.PI * 0.5}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={"green"} />
      </mesh>

      <Html>heloo world</Html>
    </>
  );
}
