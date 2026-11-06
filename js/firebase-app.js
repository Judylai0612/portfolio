// Shared Firebase app/service singletons + small data-layer helpers used by
// both the admin panel (js/admin.js) and the public dynamic pages
// (work.html, category pages' dynamic-works loader).
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ---- Auth ----
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function logout() {
  return fbSignOut(auth);
}
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ---- Works ----
const worksCol = collection(db, "works");

export async function getWorksByCategory(categoryId) {
  const q = query(worksCol, where("category", "==", categoryId), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllWorks() {
  const snap = await getDocs(query(worksCol, orderBy("order", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getWork(id) {
  const snap = await getDoc(doc(db, "works", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function addWork(data) {
  return addDoc(worksCol, data);
}

export function updateWork(id, data) {
  return updateDoc(doc(db, "works", id), data);
}

export function deleteWork(id) {
  return deleteDoc(doc(db, "works", id));
}

// ---- Image uploads ----
// Returns { url, path } — path is kept so the admin can delete the file from
// Storage later when a work/image is removed.
export async function uploadWorkImage(categoryId, file) {
  const path = `works/${categoryId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export function deleteWorkImage(path) {
  return deleteObject(ref(storage, path));
}

// ---- Portfolio page banners (one image per category) ----
const bannersCol = collection(db, "banners");

export async function getBanners() {
  const snap = await getDocs(bannersCol);
  const map = {};
  snap.docs.forEach((d) => {
    map[d.id] = d.data();
  });
  return map;
}

export function setBanner(categoryId, data) {
  return setDoc(doc(db, "banners", categoryId), data);
}

export async function uploadBannerImage(categoryId, file) {
  const path = `banners/${categoryId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export function deleteBannerImage(path) {
  return deleteObject(ref(storage, path));
}
