// Configuración web de Firebase de ECORECANJE
const firebaseConfig = {
  apiKey: "AIzaSyCDmS-YOrpfCstU3ZxEH8jOdDCz_3ndY0",
  authDomain: "ecorecanje-web.firebaseapp.com",
  projectId: "ecorecanje-web",
  storageBucket: "ecorecanje-web.firebasestorage.app",
  messagingSenderId: "428820522291",
  appId: "1:428820522291:web:9dc127f8bd0715e4beca46",
  measurementId: "G-50040CY3LJ"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
