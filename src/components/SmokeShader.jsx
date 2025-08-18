import React, { useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const vertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  float noise(vec2 p){
    return 0.5 + 0.5*sin(1.5*p.x+uTime*0.19)*cos(1.2*p.y-uTime*0.15);
  }
  vec3 palette(float t) {
    return mix(
      mix(vec3(0.17,0.07,0.17), vec3(0.65,0.24,0.82), smoothstep(0.0,0.65,t)),
      vec3(0.24,0.82,0.82),
      smoothstep(0.6,1.0,t)
    );
  }
  void main(){
    vec2 uv = vUv-.5;
    uv.x *= 1.8;
    float f = 0.48*noise(uv*2.1) + 0.53*noise(uv*6.9);
    float t = smoothstep(-.25,.85, f);
    vec3 color = palette(t);

    // Central subtle bloom
    float glow = 0.17 / (length(vUv-0.5)*4.5 + 0.07);
    color += vec3(1.0,0.28,0.43)*glow*0.73;
    gl_FragColor = vec4(color, 1.0);
  }
`;

const SmokeMaterial = () => {
  const matRef = useRef();
  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta * 1.19;
  });
  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{ uTime: { value: 0 } }}
      side={THREE.DoubleSide}
      depthWrite={false}
      transparent
    />
  );
};

const SmokeShader = () => (
  <Canvas
    camera={{ position: [0, 0, 1.2], fov: 27 }}
    style={{
      position: "absolute",
      zIndex: 1,
      inset: 0,
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
    }}
    gl={{ alpha: false, antialias: true }}
  >
    {/* Optional: Drei fog/ambient light */}
    <color attach="background" args={["#0c0c17"]} />
    <ambientLight intensity={1.1} />
    <mesh scale={[3.65, 2.1, 1]}>
      <planeGeometry args={[2, 1, 128, 128]} />
      <SmokeMaterial />
    </mesh>
    <EffectComposer>
      <Bloom
        intensity={0.13}
        kernelSize={2}
        luminanceThreshold={0.02}
        luminanceSmoothing={0.38}
      />
    </EffectComposer>
  </Canvas>
);

export default SmokeShader;
