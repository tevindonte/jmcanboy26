import * as THREE from "three";

export default class SteamEffect {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.count = options.count ?? 600;
    this.ventPositions = options.ventPositions ?? [
      { x: -20, z: -15 },
      { x: 10, z: -20 },
      { x: 30, z: -10 },
      { x: -10, z: 10 },
      { x: 25, z: 15 },
    ];
    this.mesh = null;
    this.bounds = options.bounds ?? { minY: -5, maxY: 25 };
  }

  init() {
    const positions = [];
    const velocities = [];
    const sizes = [];
    const lifes = [];

    this.ventPositions.forEach((vent) => {
      for (let i = 0; i < this.count / this.ventPositions.length; i++) {
        positions.push(
          vent.x + (Math.random() - 0.5) * 4,
          this.bounds.minY + Math.random() * 2,
          vent.z + (Math.random() - 0.5) * 4
        );
        velocities.push(
          (Math.random() - 0.5) * 0.5,
          0.8 + Math.random() * 0.6,
          (Math.random() - 0.5) * 0.5
        );
        sizes.push(0.3 + Math.random() * 0.5);
        lifes.push(Math.random());
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(new Float32Array(velocities), 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(new Float32Array(sizes), 1));
    geometry.setAttribute("life", new THREE.BufferAttribute(new Float32Array(lifes), 1));

    const material = new THREE.PointsMaterial({
      color: 0xccccdd,
      size: 0.5,
      transparent: true,
      opacity: 0.35,
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
    const life = this.mesh.geometry.attributes.life.array;

    for (let i = 0; i < pos.length / 3; i++) {
      const i3 = i * 3;
      pos[i3] += vel[i3] * delta;
      pos[i3 + 1] += vel[i3 + 1] * delta;
      pos[i3 + 2] += vel[i3 + 2] * delta;
      life[i] += delta * 0.3;
      if (life[i] > 1) {
        life[i] = 0;
        const vent = this.ventPositions[i % this.ventPositions.length];
        pos[i3] = vent.x + (Math.random() - 0.5) * 4;
        pos[i3 + 1] = this.bounds.minY + Math.random() * 2;
        pos[i3 + 2] = vent.z + (Math.random() - 0.5) * 4;
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.life.needsUpdate = true;
  }
}
