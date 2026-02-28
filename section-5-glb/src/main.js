import GLBModelViewer from "./GLBModelViewer.js";

const container = document.querySelector("#model-view");
const loaderEl = document.getElementById("loader");
const loaderFill = document.getElementById("loader-fill");
const loaderText = document.getElementById("loader-text");

// Camera: set coordinates here. cameraPosition = where camera is, cameraTarget = what it looks at.
const viewer = new GLBModelViewer(container, {
  modelPath: "./hongkong.glb",
  envPath: "./sky-red-flashback.jpg",
  dayMode: true,
  cameraPosition: { x: 16.2, y: 6.2, z: -4 },
  cameraTarget: { x: 1.1, y: -7.6, z: -7 },
  onLoad: () => {
    loaderEl.classList.add("hidden");
    setTimeout(() => loaderEl.remove(), 600);
    try { window.parent.postMessage({ type: "3d-load-complete" }, "*"); } catch {}
  },
  onProgress: (xhr) => {
    const progress = xhr.lengthComputable ? xhr.loaded / xhr.total : 0;
    const pct = Math.round(progress * 100);
    loaderFill.style.width = `${pct}%`;
    loaderText.textContent = xhr.lengthComputable ? `Loading Hong Kong buildings... ${pct}%` : "Loading Hong Kong buildings...";
    try { window.parent.postMessage({ type: "3d-load-progress", progress }, "*"); } catch {}
  },
  onError: () => {
    loaderText.textContent = "";
    loaderEl.classList.add("hidden");
    const msg = document.createElement("div");
    msg.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.4);font:14px system-ui;flex-direction:column;gap:8px;";
    msg.innerHTML = "Add <code style='font-size:12px'>hongkong.glb</code> to <code style='font-size:11px'>section-5-glb/public/</code>";
    document.getElementById("model-view").appendChild(msg);
  },
});

viewer.init();

window.addEventListener("message", (e) => {
  if (e.data?.type === "section-activate") viewer.setInteractive?.(true);
  if (e.data?.type === "section-deactivate") viewer.setInteractive?.(false);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    viewer.pause();
  } else {
    viewer.resume();
  }
});
