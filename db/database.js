// =============================================================
//  DATABASE.JS — FIREBASE + SQLITE + MATRÍCULA ALEATÓRIA
// =============================================================

import { Platform } from 'react-native';
import { initializeApp } from "firebase/app";
import { 
    getFirestore, doc, setDoc, getDoc, getDocs, collection, 
    updateDoc, deleteDoc, query, where
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCYhJOD0l9FcfwCSW5WWMYCA0xfLEkNy14",
    authDomain: "projeto-ponto-eletronico-20be7.firebaseapp.com",
    projectId: "projeto-ponto-eletronico-20be7",
    storageBucket: "projeto-ponto-eletronico-20be7.firebasestorage.app",
    messagingSenderId: "980946615049",
    appId: "1:980946615049:web:4c4977f5adbebc4df231d8"
};

const app = initializeApp(firebaseConfig);
export const dbFirebase = getFirestore(app);

// -------------------------------------------------------------
//  🟦 SQLITE
// -------------------------------------------------------------
let SQLite = null;
let dbLocal = null;

try {
    SQLite = require("expo-sqlite/legacy");
} catch {
    console.log("SQLite não disponível — rodando apenas Firebase.");
}

function getLocalDB() {
    if (!SQLite) return null;
    if (!dbLocal) dbLocal = SQLite.openDatabase("projetoponto4.db");
    return dbLocal;
}

function executeSqlAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const database = getLocalDB();
        if (!database) return resolve({ rows: { _array: [] } });

        database.transaction(tx => {
            tx.executeSql(
                sql, params,
                (_, result) => resolve(result),
                (_, error) => reject(error)
            );
        });
    });
}

// -------------------------------------------------------------
//  🔢 GERAR MATRÍCULA ALEATÓRIA
// -------------------------------------------------------------
export async function gerarMatricula() {
    function gerar() {
        const parte1 = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
        const parte2 = String(Math.floor(Math.random() * 100)).padStart(2, "0");
        return `${parte1}-${parte2}`;
    }

    let matricula = gerar();
    let ref = doc(dbFirebase, "usuarios", matricula);
    let snap = await getDoc(ref);

    while (snap.exists()) {
        matricula = gerar();
        ref = doc(dbFirebase, "usuarios", matricula);
        snap = await getDoc(ref);
    }

    return matricula;
}

// -------------------------------------------------------------
//  🏁 INIT DB
// -------------------------------------------------------------
export async function initDB() {
    if (!SQLite) return;

    await executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS usuarios (
            matricula TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            funcao TEXT NOT NULL,
            cpf TEXT NOT NULL,
            filialMatriz TEXT,
            turno TEXT
        );
    `);

    await executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS pontos (
            id TEXT PRIMARY KEY,
            matricula TEXT,
            tipo TEXT,
            data TEXT,
            hora TEXT,
            timestamp INTEGER
        );
    `);
}

// -------------------------------------------------------------
//  ➕ INSERIR USUÁRIO
// -------------------------------------------------------------
export async function inserirUsuario(nome, email, funcao, cpf, filialMatriz, turno) {
    const matricula = await gerarMatricula();

    const dados = { matricula, nome, email, funcao, cpf, filialMatriz, turno };
    await setDoc(doc(dbFirebase, "usuarios", matricula), dados);

    if (SQLite) {
        await executeSqlAsync(
            `INSERT INTO usuarios (matricula, nome, email, funcao, cpf, filialMatriz, turno)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [matricula, nome, email, funcao, cpf, filialMatriz, turno]
        );
    }

    return matricula;
}

// -------------------------------------------------------------
//  📋 LISTAR USUÁRIOS
// -------------------------------------------------------------
export async function listarUsuarios() {
    const snap = await getDocs(collection(dbFirebase, "usuarios"));
    return snap.docs.map(d => d.data());
}

// -------------------------------------------------------------
//  ✏️ ATUALIZAR USUÁRIO
// -------------------------------------------------------------
export async function atualizarUsuario(matricula, nome, email, funcao, cpf, filialMatriz, turno) {
    await updateDoc(doc(dbFirebase, "usuarios", matricula), { nome, email, funcao, cpf, filialMatriz, turno });

    if (SQLite) {
        await executeSqlAsync(
            `UPDATE usuarios SET nome=?, email=?, funcao=?, cpf=?, filialMatriz=?, turno=? WHERE matricula=?`,
            [nome, email, funcao, cpf, filialMatriz, turno, matricula]
        );
    }
}

// -------------------------------------------------------------
//  🔍 BUSCAR USUÁRIOS
// -------------------------------------------------------------
export async function buscarUsuarios(termo) {
    const q = query(
        collection(dbFirebase, "usuarios"),
        where("nome", ">=", termo),
        where("nome", "<=", termo + "\uf8ff")
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
}

// -------------------------------------------------------------
//  🗑️ DELETAR USUÁRIO
// -------------------------------------------------------------
export async function deletarUsuario(matricula) {
    await deleteDoc(doc(dbFirebase, "usuarios", matricula));

    if (SQLite) {
        await executeSqlAsync(`DELETE FROM usuarios WHERE matricula=?`, [matricula]);
    }
}

// -------------------------------------------------------------
//  🔐 LOGIN
// -------------------------------------------------------------
export async function autenticarUsuario(email, cpf) {
    const q = query(
        collection(dbFirebase, "usuarios"),
        where("email", "==", email),
        where("cpf", "==", cpf)
    );

    const snap = await getDocs(q);
    if (snap.empty) return { success: false, message: "Email ou CPF incorretos" };

    return { success: true, usuario: snap.docs[0].data() };
}

// -------------------------------------------------------------
//  🕒 REGISTRAR PONTO
// -------------------------------------------------------------
export async function registrarPonto(matricula, tipo) {
    if (!matricula) throw new Error("Matrícula inválida ao registrar ponto.");

    const agora = new Date();
    const id = `${matricula}_${agora.getTime()}`;
    const dados = {
        id,
        matricula,
        tipo,
        data: agora.toLocaleDateString("pt-BR"),
        hora: agora.toLocaleTimeString("pt-BR"),
        timestamp: agora.getTime()
    };

    await setDoc(doc(dbFirebase, "pontos", id), dados);

    if (SQLite) {
        await executeSqlAsync(
            `INSERT INTO pontos (id, matricula, tipo, data, hora, timestamp)
             VALUES (?, ?, ?, ?, ?, ?);`,
            [id, matricula, tipo, dados.data, dados.hora, dados.timestamp]
        );
    }

    return id;
}

// -------------------------------------------------------------
//  📄 LISTAR PONTOS POR MATRÍCULA
// -------------------------------------------------------------
export async function listarPontos(matricula) {
    if (!matricula) return [];

    const q = query(collection(dbFirebase, "pontos"), where("matricula", "==", matricula));
    const snap = await getDocs(q);
    const dados = snap.docs.map(d => d.data());

    // Retorna ordenado
    return dados.sort((a, b) => a.timestamp - b.timestamp);
}

// -------------------------------------------------------------
//  📅 LISTAR PONTOS POR DATA
// -------------------------------------------------------------
export async function listarPontosPorData(matricula, inicioTimestamp, fimTimestamp) {
    if (!matricula) return [];

    const q = query(
        collection(dbFirebase, "pontos"),
        where("matricula", "==", matricula),
        where("timestamp", ">=", inicioTimestamp),
        where("timestamp", "<=", fimTimestamp)
    );

    const snap = await getDocs(q);
    const dados = snap.docs.map(d => d.data());

    // Retorna ordenado
    return dados.sort((a, b) => a.timestamp - b.timestamp);
}

// ✏️ ATUALIZAR PONTO (Corrigido para o SQLite)
export async function atualizarPonto(id, dados) {
    const ref = doc(dbFirebase, "pontos", id);
    await updateDoc(ref, dados); // Atualiza Firestore

    if (SQLite) {
        const campos = [];
        const valores = [];
        
        for (const key in dados) {
            if (dados.hasOwnProperty(key)) {
                campos.push(`${key}=?`);
                valores.push(dados[key]);
            }
        }
        
        // Adiciona o ID ao final da lista de valores para a cláusula WHERE
        valores.push(id); 

        if (campos.length > 0) {
            const sql = `UPDATE pontos SET ${campos.join(", ")} WHERE id=?`;
            await executeSqlAsync(sql, valores);
        }
    }
}


// -------------------------------------------------------------
//  🗑️ DELETAR PONTO
// -------------------------------------------------------------
export async function deletarPonto(id) {
    const ref = doc(dbFirebase, "pontos", id);
    await deleteDoc(ref);

    if (SQLite) {
        await executeSqlAsync(`DELETE FROM pontos WHERE id=?`, [id]);
    }
}

// -------------------------------------------------------------
//  📌 LISTAR REGISTROS COMPLETO
// -------------------------------------------------------------
export async function listarRegistrosPonto(matricula) {
    return await listarPontos(matricula);
}