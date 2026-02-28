import * as THREE from "three";
import PlyLoader from "./utils/PlyLoader.js";
import { CameraRig } from "./utils/CameraRig.js";

export default class WidenViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.sharedBoundElement = options.sharedBoundElement ?? null;
    this.isInteractive = false;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.plyLoader = null;
    this.cameraRig = null;
    this.clock = new THREE.Clock();
  }

  init() {
    const width = this.container.offsetWidth || 1;
    const height = this.container.offsetHeight || 1;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 40, 45);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(width, height);
    const pixelRatio = width < 768 ? 1 : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.cameraRig = new CameraRig(this.camera, {
      target: new THREE.Vector3(0, 0, -5),
      xLimit: [-10.25, 10.25],
      yLimit: [-1.25, 0.25],
      damping: 2.0,
      boundElement: this.sharedBoundElement || this.container,
      interactive: () => this.isInteractive,
    });

    // Resolve URL relative to current page so it works in iframe
    const plyUrl = new URL("widen_1220x0.min.ply", window.location.href).href;
    try { window.parent.postMessage({ type: "3d-load-progress", progress: 0 }, "*"); } catch {}
    this.plyLoader = new PlyLoader(plyUrl, {
      renderer: this.renderer,
      size: 0.05,
      flowFieldInfluence: 0.5,
      flowFieldStrength: 1.2,
      flowFieldFrequency: 0.5,
      width,
      height,
      onLoad: (points) => {
        points.rotation.x = Math.PI;
        this.scene.add(points);
        try { window.parent.postMessage({ type: "3d-load-complete" }, "*"); } catch {}
      },
      onProgress: (progress) => {
        try { window.parent.postMessage({ type: "3d-load-progress", progress }, "*"); } catch {}
      },
      onError: () => {
        const el = document.createElement("div");
        el.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);font:14px system-ui;flex-direction:column;gap:8px;text-align:center;padding:20px;";
        el.innerHTML = "Add <code style='font-size:12px'>widen_1220x0.min.ply</code> to <code style='font-size:11px'>section-9-widen/public/</code>";
        this.container.appendChild(el);
      },
    });

    let resizeTimeout = 0;
    new ResizeObserver(() => {
      if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
      resizeTimeout = requestAnimationFrame(() => {
        resizeTimeout = 0;
        this.onResize();
      });
    }).observe(this.container);
  }

  onResize() {
    const w = this.container.offsetWidth || 1;
    const h = this.container.offsetHeight || 1;
    const pixelRatio = w < 768 ? 1 : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.plyLoader?.onResize(w, h, pixelRatio);
  }

  update() {
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();
    this.cameraRig?.update(delta);
    this.plyLoader?.update(delta, elapsed);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
