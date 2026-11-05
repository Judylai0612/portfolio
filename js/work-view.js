import { CATEGORIES } from "./firebase-config.js";
import { getWork, getWorksByCategory } from "./firebase-app.js";

const params = new URLSearchParams(location.search);
const workId = params.get("id");

const backLink = document.getElementById("backLink");
const workTitle = document.getElementById("workTitle");
const workDesc = document.getElementById("workDesc");
const workMosaic = document.getElementById("workMosaic");
const workNav = document.getElementById("workNav");
const prevArrow = document.getElementById("prevArrow");
const nextArrow = document.getElementById("nextArrow");
const workCounter = document.getElementById("workCounter");

function categoryInfo(id) {
  return CATEGORIES.find((c) => c.id === id);
}

function renderMosaic(images) {
  const count = Math.min(images.length, 3);
  const cls = count === 1 ? "mosaic-1" : count === 2 ? "mosaic-2" : "mosaic-3";
  const wrap = document.createElement("div");
  wrap.className = "work-mosaic " + cls + " fade-in";
  images.slice(0, 3).forEach((img, i) => {
    const item = document.createElement("div");
    item.className = "mosaic-item" + (count === 3 && i === 0 ? " mosaic-main" : "");
    item.innerHTML = '<img src="' + img.url + '" alt="">';
    wrap.appendChild(item);
  });
  workMosaic.appendChild(wrap);
}

async function render() {
  if (!workId) {
    workTitle.textContent = "找不到這個作品";
    return;
  }

  const work = await getWork(workId);
  if (!work) {
    workTitle.textContent = "找不到這個作品";
    return;
  }

  const cat = categoryInfo(work.category);
  if (cat) {
    backLink.href = "category-" + cat.id + ".html";
    backLink.textContent = "← 返回 " + cat.name_zh;
    backLink.dataset.en = "← Back to " + cat.name_en;
  }

  document.title = (work.title_zh || "作品詳情") + " | Judy Lai Portfolio";

  workTitle.textContent = work.title_zh || "";
  if (work.title_en) workTitle.dataset.en = work.title_en;

  if (work.desc_zh) {
    workDesc.hidden = false;
    workDesc.textContent = work.desc_zh;
    if (work.desc_en) workDesc.dataset.en = work.desc_en;
  }

  if (work.images && work.images.length) {
    renderMosaic(work.images);
  }

  if (work.visitUrl) {
    const btn = document.createElement("a");
    btn.href = work.visitUrl;
    btn.className = "work-visit-btn fade-in";
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.textContent = "前往網站 ↗";
    btn.dataset.en = "Visit Website ↗";
    workMosaic.appendChild(btn);
  }

  // Prev/next within the same category, ordered the same way the admin list is.
  const siblings = await getWorksByCategory(work.category);
  const index = siblings.findIndex((w) => w.id === work.id);
  if (siblings.length > 1 && index !== -1) {
    workNav.hidden = false;
    const prev = siblings[(index - 1 + siblings.length) % siblings.length];
    const next = siblings[(index + 1) % siblings.length];
    prevArrow.href = "work.html?id=" + prev.id;
    nextArrow.href = "work.html?id=" + next.id;
    workCounter.textContent = (index + 1) + " / " + siblings.length;
  }

  if (window.observeFadeEls) window.observeFadeEls();
  if (window.rebindLightboxImages) window.rebindLightboxImages();
  if (window.applyCurrentLang) window.applyCurrentLang();
}

render();
