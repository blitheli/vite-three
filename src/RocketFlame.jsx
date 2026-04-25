import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const flameVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vDistortion;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.05;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float vertical = uv.y;
    float plumeWidth = smoothstep(0.0, 0.75, vertical);
    float turbulence = fbm(vec2(uv.x * 8.0, vertical * 5.0 - uTime * 2.4));
    float wave = sin(vertical * 18.0 - uTime * 8.0 + uv.x * 6.28318);
    float distortion = (turbulence - 0.5) * 0.32 + wave * 0.045;

    transformed.x += distortion * plumeWidth;
    transformed.z += (fbm(vec2(uv.x * 6.0 + 11.0, vertical * 5.0 - uTime * 2.1)) - 0.5) * 0.34 * plumeWidth;
    transformed.y += sin(uTime * 7.0 + uv.x * 12.0) * 0.018 * (1.0 - vertical);

    vDistortion = turbulence;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const flameFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform vec3 uOuterColor;
  uniform vec3 uSmokeColor;
  varying vec2 vUv;
  varying float vDistortion;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.1;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    float center = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float risingNoise = fbm(vec2(vUv.x * 7.0, vUv.y * 6.0 - uTime * 3.2));
    float hotCore = smoothstep(0.32, 0.95, center + risingNoise * 0.32 - vUv.y * 0.2);
    float smokeMix = smoothstep(0.48, 1.0, vUv.y + vDistortion * 0.18);

    vec3 fireColor = mix(uOuterColor, uCoreColor, hotCore);
    vec3 color = mix(fireColor, uSmokeColor, smokeMix * 0.55);

    float topFade = smoothstep(0.0, 0.18, vUv.y);
    float bottomFade = 1.0 - smoothstep(0.78, 1.0, vUv.y);
    float edgeFade = smoothstep(0.02, 0.62, center + risingNoise * 0.28);
    float flicker = 0.74 + sin(uTime * 15.0 + vUv.y * 18.0) * 0.12 + risingNoise * 0.28;
    float alpha = topFade * bottomFade * edgeFade * flicker;

    gl_FragColor = vec4(color, alpha);
  }
`

function FlamePlume({ position, scale = 1, rotationZ = 0 }) {
  const materialRef = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCoreColor: { value: new THREE.Color('#fff2b0') },
      uOuterColor: { value: new THREE.Color('#ff6a24') },
      uSmokeColor: { value: new THREE.Color('#b06cff') },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <mesh position={position} scale={[scale, scale, scale]} rotation={[0, 0, rotationZ]}>
      <coneGeometry args={[0.2, 1.35, 48, 28, true]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function EngineNozzle({ position, scale = 1 }) {
  return (
    <mesh position={position} rotation={[Math.PI, 0, 0]} scale={scale}>
      <cylinderGeometry args={[0.08, 0.12, 0.16, 32]} />
      <meshStandardMaterial color="#27354a" metalness={0.7} roughness={0.28} />
    </mesh>
  )
}

function RocketBody() {
  const boosterOffsets = [-0.34, 0.34]
  const engineOffsets = [
    [0, -0.2, 0],
    [-0.17, -0.24, 0.1],
    [0.17, -0.24, 0.1],
    [-0.17, -0.24, -0.1],
    [0.17, -0.24, -0.1],
  ]

  return (
    <group position={[0, 0.35, 0]} rotation={[0, 0, -0.18]}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 1.35, 48]} />
        <meshStandardMaterial color="#edf4ff" metalness={0.2} roughness={0.42} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <coneGeometry args={[0.19, 0.42, 48]} />
        <meshStandardMaterial color="#f7fbff" metalness={0.15} roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.94, 0.184]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.12, 0.012, 0.11]} />
        <meshStandardMaterial color="#d0152c" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.25, 0.19]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.34, 0.012, 0.045]} />
        <meshStandardMaterial color="#2362b6" roughness={0.46} />
      </mesh>

      {boosterOffsets.map((x) => (
        <group key={x} position={[x, 0.12, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.12, 1.06, 32]} />
            <meshStandardMaterial color="#f3f7ff" metalness={0.1} roughness={0.44} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <coneGeometry args={[0.11, 0.22, 32]} />
            <meshStandardMaterial color="#f4f8ff" roughness={0.36} />
          </mesh>
          <EngineNozzle position={[0, -0.58, 0]} scale={0.95} />
        </group>
      ))}

      {engineOffsets.map((position) => (
        <EngineNozzle key={position.join(',')} position={position} />
      ))}
    </group>
  )
}

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 90 }, (_, index) => {
      const angle = index * 2.399963
      const radius = 1.8 + (index % 17) * 0.12
      return [
        Math.cos(angle) * radius,
        Math.sin(index * 1.7) * 1.45 + 0.25,
        -1.8 - (index % 13) * 0.16,
      ]
    })
  }, [])

  return (
    <group>
      {stars.map((position) => (
        <mesh key={position.join(',')} position={position}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshBasicMaterial color="#cbe9ff" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export default function RocketFlame() {
  const flamePositions = [
    { position: [-0.04, -0.56, 0], scale: 1.08, rotationZ: 0.04 },
    { position: [0.22, -0.6, 0.09], scale: 0.78, rotationZ: -0.07 },
    { position: [-0.22, -0.6, 0.09], scale: 0.78, rotationZ: 0.07 },
    { position: [0.22, -0.6, -0.09], scale: 0.72, rotationZ: -0.05 },
    { position: [-0.22, -0.6, -0.09], scale: 0.72, rotationZ: 0.05 },
  ]

  return (
    <>
      <color attach="background" args={['#06152a']} />
      <fog attach="fog" args={['#06152a', 2.8, 7]} />
      <OrbitControls makeDefault enablePan={false} minDistance={2.2} maxDistance={5} />
      <ambientLight intensity={0.48} />
      <directionalLight position={[2.4, 3.2, 2.8]} intensity={2.2} />
      <pointLight position={[0, -0.7, 0.7]} color="#ff7a1c" intensity={4} distance={3.2} />

      <StarField />
      <group position={[0, 0, 0]} rotation={[0.18, -0.36, 0.08]}>
        <RocketBody />
        {flamePositions.map(({ position, scale, rotationZ }) => (
          <FlamePlume key={position.join(',')} position={position} scale={scale} rotationZ={rotationZ} />
        ))}
      </group>
    </>
  )
}
