import { CATEGORIES } from "./firebase-config.js";
import {
  login,
  logout,
  watchAuth,
  getWorksByCategory,
  addWork,
  updateWork,
  deleteWork,
  uploadWorkImage,
  deleteWorkImage,
  getBanners,
  setBanner,
  uploadBannerImage,
  deleteBannerImage
} from "./firebase-app.js";

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const adminUserEmail = document.getElementById("adminUserEmail");
const logoutBtn = document.getElementById("logoutBtn");
const catTabs = document.getElementById("catTabs");
const workList = document.getElementById("workList");
const addWorkBtn = document.getElementById("addWorkBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const workForm = document.getElementById("workForm");
const fCategory = document.getElementById("fCategory");
const fTitleZh = document.getElementById("fTitleZh");
const fTitleEn = document.getElementById("fTitleEn");
const fDescZh = document.getElementById("fDescZh");
const fDescEn = document.getElementById("fDescEn");
const fVisitUrl = document.getElementById("fVisitUrl");
const fImages = document.getElementById("fImages");
const imageList = document.getElementById("imageList");
const uploadStatus = document.getElementById("uploadStatus");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const saveWorkBtn = document.getElementById("saveWorkBtn");
const formError = document.getElementById("formError");

let activeCategory = CATEGORIES[0].id;
let currentWorks = [];
let editingWorkId = null; // null => creating a new work
let stagedImages = []; // [{url, path}]

// ---------------- Auth ----------------
watchAuth((user) => {
  if (user) {
    loginView.hidden = true;
    adminView.hidden = false;
    adminUserEmail.textContent = user.email;
    renderCatTabs();
    loadWorks();
    loadBanners();
  } else {
    loginView.hidden = false;
    adminView.hidden = true;
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    await login(email, password);
  } catch (err) {
    loginError.textContent = "登入失敗，請確認帳號密碼是否正確。";
  }
});

logoutBtn.addEventListener("click", () => logout());

// ---------------- Category tabs ----------------
function renderCatTabs() {
  catTabs.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "cat-tab" + (cat.id === activeCategory ? " active" : "");
    btn.textContent = cat.name_zh;
    btn.addEventListener("click", () => {
      activeCategory = cat.id;
      renderCatTabs();
      loadWorks();
    });
    catTabs.appendChild(btn);
  });
}

// ---------------- Work list ----------------
async function loadWorks() {
  workList.innerHTML = '<p class="empty-msg">載入中…</p>';
  try {
    currentWorks = await getWorksByCategory(activeCategory);
  } catch (err) {
    workList.innerHTML = '<p class="empty-msg">載入失敗：' + err.message + "</p>";
    return;
  }
  renderWorkList();
}

function renderWorkList() {
  if (currentWorks.length === 0) {
    workList.innerHTML = '<p class="empty-msg">這個分類目前還沒有透過後台上架的作品。</p>';
    return;
  }
  workList.innerHTML = "";
  currentWorks.forEach((work, i) => {
    const row = document.createElement("div");
    row.className = "work-row";

    const thumb = document.createElement("img");
    thumb.className = "work-row-thumb";
    thumb.src = (work.images && work.images[0] && work.images[0].url) || "";
    thumb.alt = "";
    row.appendChild(thumb);

    const info = document.createElement("div");
    info.className = "work-row-info";
    info.innerHTML =
      '<div class="work-row-title">' + escapeHtml(work.title_zh || "（未命名）") + "</div>" +
      '<div class="work-row-sub">' + (work.images ? work.images.length : 0) + " 張圖片</div>";
    row.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "work-row-actions";

    const upBtn = document.createElement("button");
    upBtn.className = "icon-btn";
    upBtn.textContent = "↑";
    upBtn.title = "上移";
    upBtn.disabled = i === 0;
    upBtn.addEventListener("click", () => moveWork(i, -1));
    actions.appendChild(upBtn);

    const downBtn = document.createElement("button");
    downBtn.className = "icon-btn";
    downBtn.textContent = "↓";
    downBtn.title = "下移";
    downBtn.disabled = i === currentWorks.length - 1;
    downBtn.addEventListener("click", () => moveWork(i, 1));
    actions.appendChild(downBtn);

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-ghost btn-small";
    editBtn.textContent = "編輯";
    editBtn.addEventListener("click", () => openForm(work));
    actions.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger btn-small";
    delBtn.textContent = "刪除";
    delBtn.addEventListener("click", () => removeWork(work));
    actions.appendChild(delBtn);

    row.appendChild(actions);
    workList.appendChild(row);
  });
}

async function moveWork(index, direction) {
  const otherIndex = index + direction;
  if (otherIndex < 0 || otherIndex >= currentWorks.length) return;
  const a = currentWorks[index];
  const b = currentWorks[otherIndex];
  const aOrder = a.order;
  const bOrder = b.order;
  await Promise.all([
    updateWork(a.id, { order: bOrder }),
    updateWork(b.id, { order: aOrder })
  ]);
  await loadWorks();
}

async function removeWork(work) {
  if (!confirm('確定要刪除「' + (work.title_zh || "此作品") + '」嗎？此動作無法復原。')) return;
  await Promise.all((work.images || []).map((img) => deleteWorkImage(img.path).catch(() => {})));
  await deleteWork(work.id);
  await loadWorks();
}

// ---------------- Add / edit form ----------------
function populateCategorySelect() {
  fCategory.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name_zh;
    fCategory.appendChild(opt);
  });
}
populateCategorySelect();

addWorkBtn.addEventListener("click", () => openForm(null));
cancelFormBtn.addEventListener("click", closeForm);

function openForm(work) {
  formError.textContent = "";
  uploadStatus.textContent = "";
  editingWorkId = work ? work.id : null;
  modalTitle.textContent = work ? "編輯作品" : "新增作品";
  fCategory.value = work ? work.category : activeCategory;
  fTitleZh.value = work ? work.title_zh || "" : "";
  fTitleEn.value = work ? work.title_en || "" : "";
  fDescZh.value = work ? work.desc_zh || "" : "";
  fDescEn.value = work ? work.desc_en || "" : "";
  fVisitUrl.value = work ? work.visitUrl || "" : "";
  stagedImages = work && work.images ? [...work.images] : [];
  fImages.value = "";
  renderImageList();
  modalOverlay.hidden = false;
}

function closeForm() {
  modalOverlay.hidden = true;
}

function renderImageList() {
  imageList.innerHTML = "";
  stagedImages.forEach((img, i) => {
    const thumb = document.createElement("div");
    thumb.className = "image-thumb";
    thumb.innerHTML = '<img src="' + img.url + '" alt="">';
    const removeBtn = document.createElement("button");
    removeBtn.className = "image-thumb-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", async () => {
      stagedImages.splice(i, 1);
      renderImageList();
      await deleteWorkImage(img.path).catch(() => {});
    });
    thumb.appendChild(removeBtn);
    imageList.appendChild(thumb);
  });
}

fImages.addEventListener("change", async () => {
  const files = Array.from(fImages.files || []);
  if (files.length === 0) return;
  const category = fCategory.value;
  uploadStatus.textContent = "上傳中…（0/" + files.length + "）";
  let done = 0;
  for (const file of files) {
    try {
      const result = await uploadWorkImage(category, file);
      stagedImages.push(result);
      done += 1;
      uploadStatus.textContent = "上傳中…（" + done + "/" + files.length + "）";
      renderImageList();
    } catch (err) {
      uploadStatus.textContent = "上傳失敗：" + err.message;
    }
  }
  uploadStatus.textContent = done === files.length ? "上傳完成" : uploadStatus.textContent;
  fImages.value = "";
});

workForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";
  if (stagedImages.length === 0) {
    formError.textContent = "請至少上傳一張圖片。";
    return;
  }
  saveWorkBtn.disabled = true;
  try {
    const data = {
      category: fCategory.value,
      title_zh: fTitleZh.value.trim(),
      title_en: fTitleEn.value.trim(),
      desc_zh: fDescZh.value.trim(),
      desc_en: fDescEn.value.trim(),
      visitUrl: fVisitUrl.value.trim(),
      images: stagedImages
    };
    if (editingWorkId) {
      await updateWork(editingWorkId, data);
    } else {
      const targetCategoryWorks = await getWorksByCategory(data.category);
      data.order = targetCategoryWorks.length;
      data.createdAt = Date.now();
      await addWork(data);
    }
    closeForm();
    if (data.category !== activeCategory) {
      activeCategory = data.category;
      renderCatTabs();
    }
    await loadWorks();
  } catch (err) {
    formError.textContent = "儲存失敗：" + err.message;
  } finally {
    saveWorkBtn.disabled = false;
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------------- Banner management ----------------
const bannerList = document.getElementById("bannerList");
let bannersMap = {};

async function loadBanners() {
  bannerList.innerHTML = '<p class="empty-msg">載入中…</p>';
  try {
    bannersMap = await getBanners();
  } catch (err) {
    bannerList.innerHTML = '<p class="empty-msg">載入失敗：' + err.message + "</p>";
    return;
  }
  renderBannerList();
}

function renderBannerList() {
  bannerList.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const banner = bannersMap[cat.id];

    const row = document.createElement("div");
    row.className = "banner-row";

    const thumb = document.createElement("img");
    thumb.className = "banner-row-thumb";
    thumb.src = (banner && banner.url) || "";
    thumb.alt = "";
    row.appendChild(thumb);

    const info = document.createElement("div");
    info.className = "banner-row-info";
    info.innerHTML =
      '<div class="banner-row-title">' + escapeHtml(cat.name_zh) + "</div>" +
      '<div class="banner-row-sub">' + (banner && banner.url ? "已上傳輪播圖" : "尚未上傳，目前顯示純色色塊") + "</div>";
    row.appendChild(info);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const sub = info.querySelector(".banner-row-sub");
      sub.textContent = "上傳中…";
      try {
        const oldPath = banner && banner.path;
        const result = await uploadBannerImage(cat.id, file);
        await setBanner(cat.id, result);
        if (oldPath) await deleteBannerImage(oldPath).catch(() => {});
        bannersMap[cat.id] = result;
        renderBannerList();
      } catch (err) {
        sub.textContent = "上傳失敗：" + err.message;
      }
    });
    row.appendChild(fileInput);

    bannerList.appendChild(row);
  });
}
