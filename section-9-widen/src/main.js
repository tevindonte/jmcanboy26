import WidenViewer from "./WidenViewer.js";

const container = document.getElementById("widen-view");
const viewer = new WidenViewer(container);
viewer.init();

window.addEventListener("message", (e) => {
  if (e.data?.type === "section-activate") viewer.isInteractive = true;
  if (e.data?.type === "section-deactivate") viewer.isInteractive = false;
});

let rafId = null;

function animate() {
  if (document.hidden) return; // don't schedule next frame when tab is hidden
  rafId = requestAnimationFrame(animate);
  viewer.update();
  viewer.render();
}
animate();

document.addEventListener("visibilitychange", () => {
  if (document.hidden && rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  } else if (!document.hidden && !rafId) {
    rafId = requestAnimationFrame(animate);
  }
});
