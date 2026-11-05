// Firebase project configuration.
// This config is safe to be public in client-side code — Firebase projects are
// protected by Firestore/Storage security rules, not by hiding this object.
export const firebaseConfig = {
  apiKey: "AIzaSyCl7C9oPYEhfyFzgzuVWBWjkOM6Vh41wzU",
  authDomain: "judy-portfolio-c6c02.firebaseapp.com",
  projectId: "judy-portfolio-c6c02",
  storageBucket: "judy-portfolio-c6c02.firebasestorage.app",
  messagingSenderId: "441892506799",
  appId: "1:441892506799:web:1bf89b5398e16ce0a4585a"
};

// The 7 fixed portfolio categories. Shared between the admin panel and the
// public category pages so both agree on slugs/labels.
export const CATEGORIES = [
  { id: "social", name_zh: "社群貼文設計", name_en: "Social Post Design" },
  { id: "graphic", name_zh: "平面設計", name_en: "Graphic Design" },
  { id: "branding", name_zh: "品牌規劃", name_en: "Branding" },
  { id: "photography", name_zh: "攝影作品", name_en: "Photography" },
  { id: "project", name_zh: "專案設計", name_en: "Project Design" },
  { id: "package", name_zh: "包裝設計", name_en: "Packaging Design" },
  { id: "onepage", name_zh: "一頁式網站", name_en: "One-page Website" }
];
