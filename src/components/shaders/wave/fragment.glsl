uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform vec3 u_accentColor;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Base gradient
  vec3 color = mix(u_primaryColor, u_secondaryColor, vUv.y);
  
  // Add wave effect
  float wave = 0.5 * sin(vUv.x * 10.0 + u_time * 2.0) + 0.5;
  color = mix(color, u_accentColor * 0.3, wave * 0.1);
  
  // Add fresnel effect
  float fresnel = pow(1.0 - abs(dot(vec3(0.0, 0.0, 1.0), normalize(vNormal)), 2.0);
  color += u_accentColor * fresnel * 0.2;
  
  gl_FragColor = vec4(color, 1.0);
}