import * as THREE from "three";

const PixelShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    scale: { value: 0.72 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float scale;
    varying vec2 vUv;

    void main() {
      vec2 scaledRes = resolution * scale;
      vec2 uv = floor(vUv * scaledRes) / scaledRes;
      vec2 offset = vec2(0.5) / scaledRes;
      gl_FragColor = texture2D(tDiffuse, uv + offset);
    }
  `,
};

export default PixelShader;
