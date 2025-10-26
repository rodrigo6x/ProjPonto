import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
// IMPORTANTE: Substitua estas configurações pelas suas próprias do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCYhJOD0l9FcfwCSW5WWMYCA0xfLEkNy14",
  authDomain: "projeto-ponto-eletronico-20be7.firebaseapp.com",
  projectId: "projeto-ponto-eletronico-20be7",
  storageBucket: "projeto-ponto-eletronico-20be7.firebasestorage.app",
  messagingSenderId: "980946615049",
  appId: "1:980946615049:web:4c4977f5adbebc4df231d8"
};

console.log('🔥 Inicializando Firebase com configuração:', firebaseConfig);

// Inicializa o Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app inicializado com sucesso');
  
  // Inicializa o Firestore
  db = getFirestore(app);
  console.log('✅ Firestore inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  throw error;
}

export { db };
export default app;
