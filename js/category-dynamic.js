// Appends any works added through the admin panel (stored in Firestore) to
// the end of this category page's existing static work cards.
import { getWorksByCategory } from "./firebase-app.js";

const grid = document.getElementById("categoryCardsGrid");
const categoryId = document.body.dataset.category;

async function render() {
  if (!grid || !categoryId) return;
  let works = [];
  try {
    works = await getWorksByCategory(categoryId);
  } catch (err) {
    return; // fail silently — the static cards on the page still work fine
  }
  if (works.length === 0) return;

  works.forEach((work) => {
    const thumbUrl = (work.images && work.images[0] && work.images[0].url) || "";
    const card = document.createElement("a");
    card.href = "work.html?id=" + work.id;
    card.className = "category-card image-only fade-in";
    card.setAttribute("aria-label", work.title_zh || "");
    if (work.title_en) card.dataset.enAria = work.title_en;

    const img = document.createElement("img");
    img.src = thumbUrl;
    img.alt = "";
    img.className = "category-card-img";
    card.appendChild(img);

    const title = document.createElement("h3");
    title.className = "category-card-title sr-only";
    title.textContent = work.title_zh || "";
    if (work.title_en) title.dataset.en = work.title_en;
    card.appendChild(title);

    grid.appendChild(card);
  });

  if (window.observeFadeEls) window.observeFadeEls(grid);
  if (window.applyCurrentLang) window.applyCurrentLang();
}

render();
