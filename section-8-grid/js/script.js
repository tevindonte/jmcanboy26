// Preloads images (and background images if used)
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    imagesLoaded(document.querySelectorAll(selector), { background: true }, resolve);
  });
};

document.addEventListener('DOMContentLoaded', async function () {
  const gridGallery = document.getElementById('grid-gallery');
  if (!gridGallery) return;

  await preloadImages('.image');
  document.body.classList.remove('loading');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  gridGallery.querySelectorAll('.grid_gallery_item').forEach((item) => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      if (src) openLightbox(src);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
});
