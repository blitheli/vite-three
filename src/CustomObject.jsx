import * as THREE from "three";
import { useMemo, useRef, useEffect } from "react";

export default function CustomObject() {

  const geometryRef = useRef();
  //geometryRef.current.computeVertexNormals();

  // 顶点数量
  const verticesCount = 10 * 3;

  // useMemo 用于优化性能，只有当依赖项发生变化时才会重新计算
  // 计算顶点位置，并一直保持不变，除非 verticesCount 发生变化
  const positions = useMemo(() => {
    const positions = new Float32Array(verticesCount * 3);
    for (let i = 0; i < verticesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2;
    }
    return positions;

  }, []);

  // 第1次渲染后，计算顶点法线，以确保正确的光照效果
  useEffect(() => {
    geometryRef.current.computeVertexNormals();
  }, []);

  return (
    <mesh position={[0, 0, 0]}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={verticesCount}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <meshStandardMaterial color={"red"} side={THREE.DoubleSide} />
    </mesh>
  );
}
