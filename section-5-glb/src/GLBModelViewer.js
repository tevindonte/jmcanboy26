import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CameraRig } from "./utils/CameraRig.js";
import RainEffect from "./effects/RainEffect.js";
import SteamEffect from "./effects/SteamEffect.js";
import PixelShader from "./PixelShader.js";

/**
 * Hong Kong + red sky Three.js viewer: GLB model with environment map,
 * bloom, pixel shader, rain, steam, orbit CameraRig. No click overlay.
 */
export default class GLBModelViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      modelPath: options.modelPath ?? "/hongkong.glb",
      envPath: options.envPath ?? "/sky-red-flashback.jpg",
      dayMode: options.dayMode ?? true,
  cameraPosition: options.cameraPosition ?? { x: 16.2, y: 6.2, z: -4 },
  cameraTarget: options.cameraTarget ?? { x: 1.1, y: -7.6, z: -7 },
      onLoad: options.onLoad ?? (() => {}),
      onError: options.onError ?? (() => {}),
      onProgress: options.onProgress ?? (() => {}),
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.bloomPass = null;
    this.pixelPass = null;
    this.cameraRig = null;
    this.rainEffect = null;
    this.steamEffect = null;
    this.clock = new THREE.Clock();
    this.rafId = null;
    this.running = false;
    this.fogBaseNear = 80;
    this.fogBaseFar = 350;
    this.isInteractive = false; // Click-to-activate: start inactive
  }

  setInteractive(active) {
    this.isInteractive = !!active;
  }

  init() {
    const { width, height } = this._getSize();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8b2020);
    this.scene.fog = new THREE.Fog(0x6b1818, 120, 400);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    // Camera: set cameraPosition/cameraTarget in options to customize
    const pos = this.options.cameraPosition;
    const tgt = this.options.cameraTarget;
    this.camera.position.set(pos.x, pos.y, pos.z);
    const target = new THREE.Vector3(tgt.x, tgt.y, tgt.z);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this._loadEnvironment();
    this._setupLights();
    this._setupComposer(width, height);
    this._setupCameraRig(target);
    this._setupEffects();
    this._loadModel();
    this._bindResize();

    this.running = true;
    this.animate();
  }

  _getSize() {
    const w = this.container?.offsetWidth || 1;
    const h = this.container?.offsetHeight || 1;
    return { width: w, height: h };
  }

  _loadEnvironment() {
    const texLoader = new THREE.TextureLoader();
    texLoader.load(
      this.options.envPath,
      (tex) => {
        this.scene.background = tex;
        this.scene.fog.color.setHex(this.options.dayMode ? 0x8b5060 : 0x6b1818);
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmrem.fromEquirectangular(tex).texture;
      },
      undefined,
      () => {}
    );
  }

  _setupLights() {
    // Day: bright sky/ground hemisphere
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0xb8860b, 0.6);
    this.scene.add(hemiLight);

    // Sun
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sunLight.position.set(80, 120, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    sunLight.shadow.bias = -0.0001;
    this.scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.4);
    fillLight.position.set(-60, 40, -40);
    this.scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.25);
    this.scene.add(ambientLight);
  }

  _setupComposer(width, height) {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.22,
      0.5,
      0.8
    );
    this.bloomPass.enabled = true;
    this.composer.addPass(this.bloomPass);

    this.pixelPass = new ShaderPass(PixelShader);
    this.pixelPass.uniforms.resolution.value.set(width, height);
    this.pixelPass.uniforms.scale.value = 0.72;
    this.composer.addPass(this.pixelPass);
    this.composer.addPass(new OutputPass());
  }

  _setupCameraRig(target) {
    const basePos = this.camera.position.clone();
    this.cameraRig = new CameraRig(this.camera, {
      target,
      basePosition: basePos,
      xLimit: [-5, 35],
      yLimit: [-5, 12],
      damping: 2,
      pointerScaleX: 18,
      pointerScaleY: 8,
      orbitMode: false,
      zOscillationAmp: 0.3,
      zOscillationFreq: 0.5,
      rollOscillationAmp: 0.05,
      rollOscillationFreq: 0.5,
      boundElement: this.renderer.domElement,
      interactive: () => this.isInteractive,
    });
  }

  _setupEffects() {
    this.rainEffect = new RainEffect(this.scene, {
      count: 10000,
      speed: 110,
    });
    this.rainEffect.init();

    // SteamEffect = particles that rise from "vents", reset when life>1 (~2–3s) – that's the "random particle things"
    // Disabled for day scene
    // this.steamEffect = new SteamEffect(this.scene);
    // this.steamEffect.init();
    this.steamEffect = null;
  }

  _loadModel() {
    this.options.onProgress({ loaded: 0, total: 1, lengthComputable: false });
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      this.options.modelPath,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 100 / maxDim;
        model.scale.setScalar(scale);

        this.scene.add(model);

        this.options.onLoad(model);
      },
      (xhr) => this.options.onProgress(xhr),
      (err) => this.options.onError(err)
    );
  }

  _bindResize() {
    const onResize = () => {
      const { width, height } = this._getSize();
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.composer.setSize(width, height);
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
      this.bloomPass.resolution.set(width, height);
      this.pixelPass.uniforms.resolution.value.set(width, height);
    };
    window.addEventListener("resize", onResize);
    if (this.container && typeof ResizeObserver !== "undefined") {
      new ResizeObserver(onResize).observe(this.container);
    }
  }

  animate() {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    const t = this.clock.getElapsedTime();

    if (this.cameraRig) this.cameraRig.update(delta);
    if (this.rainEffect) this.rainEffect.update(delta);
    if (this.steamEffect) this.steamEffect.update(delta);

    this.scene.fog.near = this.fogBaseNear + Math.sin(t * 0.15) * 15;
    this.scene.fog.far = this.fogBaseFar + Math.sin(t * 0.12) * 40;

    this.composer.render();
  }

  pause() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    this.running = true;
    this.clock.getDelta();
    this.animate();
  }

  dispose() {
    this.pause();
    this.renderer?.dispose();
    this.container?.removeChild(this.renderer?.domElement);
  }

  getCameraState() {
    if (!this.camera || !this.cameraRig) return null;
    const target = this.cameraRig.target;
    return {
      position: this.camera.position.clone(),
      target: target ? target.clone() : new THREE.Vector3(0, 0, 0),
    };
  }

  /**
   * Set camera position and target. Use for the "Set camera" debug button.
   * @param {{ x: number, y: number, z: number }} position
   * @param {{ x: number, y: number, z: number }} target
   */
  setCameraState(position, target) {
    if (!this.camera || !this.cameraRig) return;
    this.camera.position.set(position.x, position.y, position.z);
    this.cameraRig.target.set(target.x, target.y, target.z);
    this.cameraRig.basePosition = this.camera.position.clone();
  }
}
