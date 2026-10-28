// 1. Firebase SDK'larını import edin
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiC9OL32uVZgDGoWFV98ny0tR5YS1X0SA",
  authDomain: "webapp-vezaif.firebaseapp.com",
  projectId: "webapp-vezaif",
  storageBucket: "webapp-vezaif.firebasestorage.app",
  messagingSenderId: "193300165429",
  appId: "1:193300165429:web:0c60f9b65139617535127c",
  measurementId: "G-007QWEY07K"
};

// 3. ÖNCE Firebase uygulamasını başlatın (EN ÖNEMLİ KISIM)
const app = initializeApp(firebaseConfig);

// 4. SONRA servisleri (Auth, Firestore, Storage) başlatıp app'e bağlayın
export const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);

// 5. app.js içinde kullanabilmek için global window nesnesine atayın
window.storage = storage;
window.FirebaseStorage = {
    ref,
    uploadBytes,
    getDownloadURL
};