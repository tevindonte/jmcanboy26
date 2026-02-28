import * as THREE from "three";

export default class RainEffect {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.count = options.count ?? 8000;
    this.speed = options.speed ?? 100;
    this.spread = options.spread ?? { x: 150, y: 80, z: 150 };
    this.mesh = null;
    this.bounds = options.bounds ?? { minY: -30, maxY: 80 };
  }

  init() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const velocities = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * this.spread.x;
      positions[i * 3 + 1] = this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY);
      positions[i * 3 + 2] = (Math.random() - 0.5) * this.spread.z;
      velocities[i * 3] = (Math.random() - 0.5) * 3;
      velocities[i * 3 + 1] = -this.speed * (0.85 + Math.random() * 0.3);
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: 0xb8d4f0,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.mesh = new THREE.Points(geometry, material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  update(delta) {
    if (!this.mesh?.geometry) return;
    const pos = this.mesh.geometry.attributes.position.array;
    const vel = this.mesh.geometry.attributes.velocity.array;
    const range = this.bounds.maxY - this.bounds.minY;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      pos[i3 + 1] += vel[i3 + 1] * delta;
      pos[i3] += vel[i3] * delta;
      pos[i3 + 2] += vel[i3 + 2] * delta;
      if (pos[i3 + 1] < this.bounds.minY) pos[i3 + 1] += range;
      if (pos[i3 + 1] > this.bounds.maxY) pos[i3 + 1] -= range;
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}
