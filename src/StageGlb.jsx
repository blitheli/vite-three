import {
  OrbitControls,
  TransformControls,
  PivotControls,
  Stage,
  useGLTF,
  Html,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function StageGlb() {
  
  //  加载glb模型
  const model = useGLTF("/models/hubble.glb");

  useFrame((state, delta) => {
    model.scene.rotation.y += delta * 0.5; // 每秒旋转0.5弧度
  });

  return (
    <>
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.3} />

      <Stage environment="city" intensity={0.6}>
        <primitive object={model.scene} scale={0.1} />
      </Stage>
    </>
  );
}
