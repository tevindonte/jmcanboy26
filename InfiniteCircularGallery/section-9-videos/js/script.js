const videos = [
  'https://youtu.be/ZEx2yrisb54',
  'https://youtu.be/TyPQ4eMi-L0',
  'https://youtu.be/bEd8W5gazR0',
  'https://youtu.be/tnqhWK0mPB4',
  'https://youtu.be/ipuCX87e0_U',
  'https://youtu.be/mw-Qc7JWibg',
  'https://youtu.be/ue0BYRr8i7A',
  'https://youtu.be/gfjxB2brzRk',
  'https://youtu.be/gLYCgUPAbk0',
  'https://youtu.be/VOlb4t2SSAI',
  'https://youtu.be/1wZmu9zesuY',
  'https://youtu.be/S7ZwhQqo6l8',
  'https://youtu.be/KpRikeWHd9A',
  'https://youtu.be/jIL63ctgrEQ',
  'https://youtu.be/wi2KuzmIsEE',
  'https://youtu.be/msTNTKAGRPY',
  'https://youtu.be/YwecpqHYvJw'
];

function getVideoId(url) {
  const m = url.match(/(?:youtu\.be\/|v=)([^&#?]+)/);
  return m ? m[1] : '';
}

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('video-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxIframe = document.getElementById('lightbox-iframe');
  const lightboxClose = document.getElementById('lightbox-close');

  videos.forEach((url) => {
    const id = getVideoId(url);
    if (!id) return;
    const item = document.createElement('div');
    item.className = 'video_grid_item';
    item.innerHTML = `
      <div class="thumb" style="background-image:url(https://img.youtube.com/vi/${id}/hqdefault.jpg)"></div>
      <div class="play">&#9658;</div>
    `;
    item.addEventListener('click', () => {
      lightboxIframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
    grid.appendChild(item);
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxIframe.src = '';
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });
});
