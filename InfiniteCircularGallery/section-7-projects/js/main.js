(function () {
  'use strict';

  const previewEl = document.getElementById('previewImage');
  const items = document.querySelectorAll('.project-item[data-preview]');

  if (!previewEl || items.length === 0) return;

  // Preload all preview images so they display immediately on hover
  var previewSrcs = ['images/Citibike.JPG', 'images/Sector_types.png', 'images/mental_health.jpg'];
  previewSrcs.forEach(function (src) {
    var img = new Image();
    img.src = src;
  });

  let raf = null;
  let mouseX = 0;
  let mouseY = 0;
  let posX = 0;
  let posY = 0;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function updatePosition() {
    posX = lerp(posX, mouseX + 20, 0.15);
    posY = lerp(posY, mouseY + 20, 0.15);
    previewEl.style.left = posX + 'px';
    previewEl.style.top = posY + 'px';
    raf = requestAnimationFrame(updatePosition);
  }

  items.forEach(function (item) {
    item.addEventListener('mouseenter', function (e) {
      const src = item.getAttribute('data-preview');
      if (src) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        posX = mouseX + 20;
        posY = mouseY + 20;
        previewEl.src = src;
        previewEl.classList.add('visible');
        if (!raf) raf = requestAnimationFrame(updatePosition);
      }
    });

    item.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    item.addEventListener('mouseleave', function () {
      previewEl.src = '';
      previewEl.classList.remove('visible');
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  });
})();
