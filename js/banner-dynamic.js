// Applies banner images uploaded through the admin panel (stored in
// Firestore's "banners" collection) onto the portfolio page's banner
// carousel slides. If a category has no uploaded banner yet, its slide
// keeps the existing flat-color placeholder untouched.
import { getBanners } from "./firebase-app.js";

async function render() {
  let banners = {};
  try {
    banners = await getBanners();
  } catch (err) {
    return; // fail silently — the flat-color slides still work fine
  }

  document.querySelectorAll(".banner-slide[data-category]").forEach((slide) => {
    const banner = banners[slide.dataset.category];
    if (banner && banner.url) {
      slide.style.backgroundImage = `url("${banner.url}")`;
      slide.classList.add("has-image");
    }
  });
}

render();
