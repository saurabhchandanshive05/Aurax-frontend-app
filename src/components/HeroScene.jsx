import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Vertex shader for neural connections
const vertexShader = `
  varying vec3 vPosition;
  varying vec2 vUv;
  
  void main() {
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for neural connections
const fragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec3 vPosition;
  varying vec2 vUv;
  
  void main() {
    // Create pulsing neural pattern
    float pulse = sin(time * 2.0 + vPosition.x * 3.0) * cos(time * 1.5 + vPosition.y * 4.0);
    float pattern = smoothstep(0.3, 0.7, abs(pulse));
    
    // Create connection lines
    float line = smoothstep(0.02, 0.0, abs(fract(vUv.y * 10.0) - 0.5));
    
    // Combine effects
    vec3 color = mix(color1, color2, pattern);
    color = mix(color, vec3(1.0), line * 0.8);
    
    gl_FragColor = vec4(color, pattern * 0.7 + line * 0.3);
  }
`;

// Neural core component
function NeuralCore() {
  const coreRef = useRef();
  const connectionsRef = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // Pulsing core animation
    if (coreRef.current) {
      const scale = 1 + Math.sin(elapsed) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }

    // Neural connection animation
    if (connectionsRef.current) {
      connectionsRef.current.material.uniforms.time.value = elapsed * 0.5;
    }
  });

  return (
    <group>
      {/* Neural Core (Geometric structure) */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#5b77ff"
          emissive="#6d8cff"
          emissiveIntensity={0.8}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Neural Connections */}
      <mesh ref={connectionsRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            time: { value: 0 },
            color1: { value: new THREE.Color("#5b77ff") },
            color2: { value: new THREE.Color("#00d2ff") },
          }}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Floating hexagons (data particles)
function FloatingHexagons() {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(50)].map((_, i) => {
        const radius = 5 + Math.random() * 15;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 10;
        const speed = 0.1 + Math.random() * 0.2;
        const rotationSpeed = (Math.random() - 0.5) * 0.01;
        const size = 0.1 + Math.random() * 0.2;
        const opacity = 0.2 + Math.random() * 0.4;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius,
            ]}
          >
            <ringGeometry args={[size, size * 1.2, 6]} />
            <meshBasicMaterial
              color={Math.random() > 0.5 ? "#5b77ff" : "#00d2ff"}
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

const HeroScene = () => (
  <Canvas camera={{ position: [0, 1, 8], fov: 60 }}>
    <color attach="background" args={["#0c0c17"]} />
    <ambientLight intensity={0.3} />
    <pointLight position={[3, 3, 3]} intensity={1.5} color="#5b77ff" />
    <pointLight position={[-3, -3, -3]} intensity={1.2} color="#00d2ff" />

    <NeuralCore />
    <FloatingHexagons />

    <OrbitControls
      enableZoom={false}
      enablePan={false}
      autoRotate
      autoRotateSpeed={0.2}
      minPolarAngle={Math.PI / 3}
      maxPolarAngle={Math.PI / 2.5}
    />
  </Canvas>
);

export default HeroScene;
