uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_speed;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vNormal = normal;

  // Calculate wave effect
  float wave = u_amplitude * sin(position.x * u_frequency + u_time * u_speed);
  
  // Mouse interaction
  float distanceToMouse = distance(vec2(position.x, position.y), u_mouse);
  float mouseEffect = 0.3 * sin(10.0 * distanceToMouse - u_time * 3.0) * exp(-5.0 * distanceToMouse);
  
  vec3 newPosition = position + normal * (wave + mouseEffect);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}