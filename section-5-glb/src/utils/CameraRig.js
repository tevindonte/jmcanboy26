import * as THREE from "three";

export class CameraRig {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.target = options.target || new THREE.Vector3(0, 0, 0);
    this.xLimit = options.xLimit || [-10, 10];
    this.yLimit = options.yLimit || null;
    this.damping = options.damping ?? 2;
    this.elapsed = 0;
    this.pointer = { x: 0, y: 0 };
    this.boundElement = options.boundElement || null;

    this.basePosition = options.basePosition || null;
    this.pointerScaleX = options.pointerScaleX ?? 2;
    this.pointerScaleY = options.pointerScaleY ?? 10;
    this.zOscillationAmp = options.zOscillationAmp ?? 1;
    this.zOscillationFreq = options.zOscillationFreq ?? 0.5;
    this.rollOscillationAmp = options.rollOscillationAmp ?? 0.1;
    this.rollOscillationFreq = options.rollOscillationFreq ?? 0.5;

    this.orbitMode = options.orbitMode ?? false;
    this._azimuth = 0;
    this._elevation = 0;
    this._distance = 0;
    this.interactiveCheck = options.interactive || (() => true);

    this._bindEvents();
  }

  _bindEvents() {
    const el = this.boundElement || window;
    el.addEventListener("mousemove", (e) => {
      if (!this.interactiveCheck()) return;
      const w = this.boundElement ? this.boundElement.offsetWidth : window.innerWidth;
      const h = this.boundElement ? this.boundElement.offsetHeight : window.innerHeight;
      const rect = this.boundElement ? this.boundElement.getBoundingClientRect() : { left: 0, top: 0 };
      this.pointer.x = ((e.clientX - rect.left) / w) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / h) * 2 + 1;
    });
  }

  update(delta) {
    this.elapsed += delta;

    if (this.orbitMode && this.basePosition !== null) {
      const dt = this.basePosition.clone().sub(this.target);
      this._distance = dt.length();
      this._azimuth = Math.atan2(dt.x, dt.z);
      this._elevation = Math.asin(THREE.MathUtils.clamp(dt.y / this._distance, -0.99, 0.99));

      const azimuth = this._azimuth + this.pointer.x * this.pointerScaleX * 0.03;
      const elevation = this._elevation + this.pointer.y * this.pointerScaleY * 0.02;
      const limitedAzimuth = Math.max(-0.8, Math.min(0.8, azimuth));
      const limitedElevation = Math.max(0.00, Math.min(0.35, elevation));

      const rx = Math.cos(limitedElevation) * Math.sin(limitedAzimuth);
      const ry = Math.sin(limitedElevation);
      const rz = Math.cos(limitedElevation) * Math.cos(limitedAzimuth);
      const targetPos = this.target.clone().add(new THREE.Vector3(rx, ry, rz).multiplyScalar(this._distance));

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetPos.x, this.damping, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetPos.y, this.damping, delta);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetPos.z, this.damping, delta);
    } else {
      const useBase = this.basePosition !== null;
      const targetX = useBase
        ? this.basePosition.x + this.pointer.x * this.pointerScaleX
        : this.target.x + this.pointer.x * this.pointerScaleX;
      const targetY = useBase
        ? this.basePosition.y + this.pointer.y * this.pointerScaleY
        : this.target.y + this.pointer.y * this.pointerScaleY;
      const targetZ = useBase
        ? this.basePosition.z + Math.sin(this.elapsed * this.zOscillationFreq) * this.zOscillationAmp
        : 3 + Math.sin(this.elapsed * this.zOscillationFreq) * this.zOscillationAmp;

      const limitedX = Math.max(this.xLimit[0], Math.min(this.xLimit[1], targetX));
      const limitedY = this.yLimit
        ? Math.max(this.yLimit[0], Math.min(this.yLimit[1], targetY))
        : targetY;

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, limitedX, this.damping, delta);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, limitedY, this.damping, delta);
      this.camera.position.z = targetZ;
    }

    this.camera.lookAt(this.target);
    this.camera.rotation.z = Math.sin(this.elapsed * this.rollOscillationFreq) * this.rollOscillationAmp;
  }
}
