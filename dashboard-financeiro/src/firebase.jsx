import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "dashboard-financeiro-906d7.firebaseapp.com",
  projectId: "dashboard-financeiro-906d7",
  storageBucket: "dashboard-financeiro-906d7.appspot.com",
  messagingSenderId: "697608172310",
  appId: "1:697608172310:web:90dc9aed065775362d5637"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Conecta ao Firestore
const db = getFirestore(app);

// Exporta para usar no app
export { db };
