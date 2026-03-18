import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useEffect } from "react";
import { useControls } from "leva";

export default function Experience() {

  // 加载 Fox 模型，路径必须是 public 下的绝对路径
  const fox = useGLTF('/models/fox.glb');
  const animations = useAnimations(fox.animations, fox.scene);

  const { animationName } = useControls({
    animationName: {
      options: animations.names },
  });
  
  useEffect(() => {
    if (animations.actions) {
      // 先淡出所有动作
      Object.values(animations.actions).forEach(action => {
        action.fadeOut(0.5);
      });
  
      // 播放新动作
      const action = animations.actions[animationName];
      action.reset().fadeIn(0.5).play();
  
      console.log(`Playing animation: ${animationName}`);
    }
  }, [animationName, animations.actions]);

  return (
    <>
      {/* 性能监控 */}
      <Perf position="top-left" />
      <OrbitControls makeDefault />

      {/* 灯光 */}
      <directionalLight castShadow position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.3} />

      {/* Fox 模型渲染 */}
      {fox && (
        <primitive object={fox.scene} position={[0, 0, 0]} scale={0.2} />
      )}

      {/* 地面 */}
      <mesh position-y={-0.8} rotation-x={-Math.PI * 0.5} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={"greenyellow"} />
      </mesh>
    </>
  );
}
