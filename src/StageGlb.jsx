import { OrbitControls, Stage, useGLTF, Html } from "@react-three/drei";
export default function StageGlb() {

  //  加载glb模型,并使用Drei的html标注进行兴趣点标注
  //-----------------------------------------------------------------
  //  加载glb模型
  const model = useGLTF("/models/hubble.glb");

  // 兴趣点配置：节点名与标注内容
  const interestPoints = [
    { label: "太阳帆板", position: [0.5, 0.5, 0] },
    { label: "相机盖", position: [0, 0.15, 0.2] },
    { label: "天线", position: [0.7, 0.0, 0.05] },
  ];

  return (
    <>
      <OrbitControls makeDefault />

      <directionalLight position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.3} />

      <Stage environment="city" intensity={0.6}>
        {model?.scene && (
          <>
            <primitive object={model.scene} scale={0.1} />
            {/* 兴趣点标注 */}
            {interestPoints.map((point) => (
              <Html
                key={point.label}
                position={point.position}
                center
                distanceFactor={4}
                occlude="blending"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  padding: "1px 6px",
                  borderRadius: "1px",
                  fontSize: "12px",
                  color: "#222",
                  border: "1px solid #aaa",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  writingMode: "horizontal-tb",
                }}
              >
                {point.label}
              </Html>
            ))}
          </>
        )}
      </Stage>
    </>
  );
}
