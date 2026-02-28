/**
 * Preloads images specified by the CSS selector.
 * @function
 * @param {string} [selector='img'] - CSS selector for target images.
 * @returns {Promise} - Resolves when all specified images are loaded.
 */
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
      const elements = document.querySelectorAll(selector);
      if (!elements.length) return resolve();
      // The imagesLoaded library is used to ensure all images (including backgrounds) are fully loaded.
      imagesLoaded(elements, {background: true}, resolve);
  });
};

// Exporting utility functions for use in other modules.
export {
  preloadImages
};