// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

console.log("Firebase ve Çevrimdışı Firestore başarıyla bağlandı!");