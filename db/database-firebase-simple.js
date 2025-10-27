// Versão simplificada do Firebase para web
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, Timestamp, setDoc, getDoc } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYhJOD0l9FcfwCSW5WWMYCA0xfLEkNy14",
  authDomain: "projeto-ponto-eletronico-20be7.firebaseapp.com",
  projectId: "projeto-ponto-eletronico-20be7",
  storageBucket: "projeto-ponto-eletronico-20be7.firebasestorage.app",
  messagingSenderId: "980946615049",
  appId: "1:980946615049:web:4c4977f5adbebc4df231d8"
};

console.log('🔥 Inicializando Firebase direto...');

// Inicializa o Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app inicializado');
  
  db = getFirestore(app);
  console.log('✅ Firestore inicializado');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  throw error;
}

const COLLECTION_NAME = 'usuarios';
const PONTOS_COLLECTION = 'registros_ponto';

/**
 * INICIALIZAR BANCO DE DADOS
 */
export async function initDB() {
  try {
    console.log('🔥 Inicializando Firebase Firestore...');
    
    if (!db) {
      throw new Error('Firebase database não está disponível');
    }
    
    console.log('🔥 Firebase db disponível, verificando admin...');
    
    // Verifica se o usuário admin existe
    const adminEmail = 'administrador';
    const adminQuery = query(
      collection(db, COLLECTION_NAME), 
      where('email', '==', adminEmail)
    );
    
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      // Cria o usuário admin se não existir
      await addDoc(collection(db, COLLECTION_NAME), {
        nome: 'Administrador',
        email: 'administrador',
        funcao: 'admin',
        cpf: 'admin',
        matricula: null,
        filialMatriz: null,
        turno: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Usuário admin criado com sucesso');
    } else {
      console.log('✅ Usuário admin já existe');
    }
    
    console.log('🔥 Firebase inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    console.error('❌ Detalhes do erro:', error.message);
    throw error;
  }
}

/**
 * INSERIR USUÁRIO
 */
export async function inserirUsuario(nome, email, funcao, cpf, matricula, filialMatriz, turno) {
  try {
    // Validação detalhada dos campos antes de inserir
    if (!nome) throw new Error('Nome é obrigatório');
    if (!email) throw new Error('Email é obrigatório');
    if (!funcao) throw new Error('Função é obrigatória');
    if (!cpf) throw new Error('CPF é obrigatório');
    if (!filialMatriz) throw new Error('Filial/Matriz é obrigatório');
    if (!turno) throw new Error('Turno é obrigatório');

    console.log('➕ Valores recebidos para inserção:', {
      nome: nome || 'null/undefined',
      email: email || 'null/undefined',
      funcao: funcao || 'null/undefined',
      cpf: cpf || 'null/undefined',
      matricula: matricula || 'null/undefined',
      filialMatriz: filialMatriz || 'null/undefined',
      turno: turno || 'null/undefined'
    });

    // Garantindo que todos os campos são strings
    const userData = {
      nome: String(nome),
      email: String(email),
      funcao: String(funcao),
      cpf: String(cpf),
      matricula: matricula ? String(matricula) : null,
      filialMatriz: String(filialMatriz),
      turno: String(turno),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('➕ Dados formatados para inserção:', userData);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), userData);
    
    console.log('✅ Usuário inserido com sucesso no Firebase, ID:', docRef.id);
    return { insertId: docRef.id, rowsAffected: 1 };
  } catch (error) {
    console.error('❌ Erro ao inserir usuário no Firebase:', error);
    console.error('❌ Stack trace:', error.stack);
    throw error;
  }
}

/**
 * LISTAR USUÁRIOS
 */
export async function listarUsuarios() {
  try {
    console.log('🗄️ Listando usuários do Firebase...');
    
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const usuarios = [];
    
    querySnapshot.forEach((doc) => {
      usuarios.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Ordena por data de criação (mais recentes primeiro)
    usuarios.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log('📋 Usuários encontrados no Firebase:', usuarios.length);
    return usuarios;
  } catch (error) {
    console.error('❌ Erro ao listar usuários do Firebase:', error);
    throw error;
  }
}

/**
 * BUSCAR USUÁRIOS
 */
export async function buscarUsuarios(termo) {
  try {
    console.log('🔍 Buscando usuários no Firebase com termo:', termo);
    
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const usuarios = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const termoLower = termo.toLowerCase();
      
      // Busca em nome, matrícula e CPF
      if (
        data.nome?.toLowerCase().includes(termoLower) ||
        data.matricula?.toLowerCase().includes(termoLower) ||
        data.cpf?.toLowerCase().includes(termoLower)
      ) {
        usuarios.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    console.log('🔍 Resultados da busca no Firebase:', usuarios.length);
    return usuarios;
  } catch (error) {
    console.error('❌ Erro ao buscar usuários no Firebase:', error);
    throw error;
  }
}

/**
 * ATUALIZAR USUÁRIO
 */
export async function atualizarUsuario(id, nome, email, funcao, cpf, matricula, filialMatriz, turno) {
  try {
    console.log('✏️ Atualizando usuário no Firebase:', { id, nome, email, funcao, cpf, matricula, filialMatriz, turno });
    
    const userRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(userRef, {
      nome,
      email,
      funcao,
      cpf,
      matricula,
      filialMatriz,
      turno,
      updatedAt: new Date()
    });
    
    console.log('✅ Usuário atualizado com sucesso no Firebase');
    return { rowsAffected: 1 };
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário no Firebase:', error);
    throw error;
  }
}

/**
 * DELETAR USUÁRIO
 */
export async function deletarUsuario(id) {
  try {
    console.log('🗑️ Deletando usuário do Firebase:', id);
    
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    
    console.log('✅ Usuário deletado com sucesso do Firebase');
    return { rowsAffected: 1 };
  } catch (error) {
    console.error('❌ Erro ao deletar usuário do Firebase:', error);
    throw error;
  }
}

/**
 * REGISTRAR PONTO
 */
export async function registrarPonto(usuarioId, tipoPonto, localizacao = null, nomeUsuario = null) {
  try {
    console.log('⏰ Registrando ponto no Firebase:', { usuarioId, tipoPonto, localizacao });
    
    // Cria ID do documento usando usuarioId e data atual (YYYY-MM-DD)
    const hoje = new Date();
    const dataFormatada = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const docId = `${usuarioId}_${dataFormatada}`;
    
    // Referência para o documento do dia
    const pontoRef = doc(db, PONTOS_COLLECTION, docId);
    
    // Tenta obter o documento existente
    const docSnap = await getDoc(pontoRef);
    
    if (!docSnap.exists()) {
      // Se não existe, cria novo documento para o dia
      await setDoc(pontoRef, {
        usuarioId,
        nomeUsuario,
        data: dataFormatada,
        registros: {
          [tipoPonto]: {
            hora: serverTimestamp(),
            localizacao: localizacao ? {
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
              accuracy: localizacao.accuracy
            } : null
          }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Se já existe, atualiza apenas o registro específico
      await updateDoc(pontoRef, {
        [`registros.${tipoPonto}`]: {
          hora: serverTimestamp(),
          localizacao: localizacao ? {
            latitude: localizacao.latitude,
            longitude: localizacao.longitude,
            accuracy: localizacao.accuracy
          } : null
        },
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('✅ Ponto registrado com sucesso no Firebase, ID:', docId);
    return { insertId: docId, rowsAffected: 1 };
  } catch (error) {
    console.error('❌ Erro ao registrar ponto no Firebase:', error);
    throw error;
  }
}

/**
 * LISTAR REGISTROS DE PONTO
 */
export async function listarRegistrosPonto(usuarioId = null) {
  try {
    console.log('📋 Listando registros de ponto do Firebase...');
    
    let q;
    if (usuarioId) {
      q = query(
        collection(db, PONTOS_COLLECTION),
        where('usuarioId', '==', usuarioId),
        orderBy('data', 'desc')
      );
    } else {
      q = query(
        collection(db, PONTOS_COLLECTION),
        orderBy('data', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const registros = [];
    
    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      if (dados.registros) {
        // Para cada tipo de registro (CHEGADA, ALMOCO, etc)
        Object.entries(dados.registros).forEach(([tipo, info]) => {
          registros.push({
            id: doc.id,
            usuarioId: dados.usuarioId,
            tipoPonto: tipo,
            data: info.hora,
            localizacao: info.localizacao
          });
        });
      }
    });
    
    // Ordena por data decrescente
    registros.sort((a, b) => {
      const da = a.data?.toDate?.() || new Date(a.data);
      const db = b.data?.toDate?.() || new Date(b.data);
      return db - da;
    });
    
    console.log('📋 Registros de ponto encontrados no Firebase:', registros.length);
    return registros;
  } catch (error) {
    console.error('❌ Erro ao listar registros de ponto do Firebase:', error);
    throw error;
  }
}

/**
 * BUSCAR REGISTROS DE PONTO POR PERÍODO
 */
export async function buscarRegistrosPontoPorPeriodo(dataInicio, dataFim, usuarioId = null) {
  try {
    console.log('🔍 Buscando registros de ponto por período no Firebase:', { dataInicio, dataFim, usuarioId });
    
    // Formata as datas para o padrão YYYY-MM-DD usado nos IDs
    const formatarData = (data) => {
      const d = new Date(data);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    const inicioFormatado = formatarData(dataInicio);
    const fimFormatado = formatarData(dataFim);

    let q;
    if (usuarioId) {
      // Busca documentos onde o ID começa com usuarioId_ e está entre as datas
      q = query(
        collection(db, PONTOS_COLLECTION),
        where('usuarioId', '==', usuarioId),
        where('data', '>=', inicioFormatado),
        where('data', '<=', fimFormatado),
        orderBy('data', 'desc')
      );
    } else {
      q = query(
        collection(db, PONTOS_COLLECTION),
        where('data', '>=', inicioFormatado),
        where('data', '<=', fimFormatado),
        orderBy('data', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const registros = [];
    
    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      if (dados.registros) {
        // Para cada tipo de registro (CHEGADA, ALMOCO, etc)
        Object.entries(dados.registros).forEach(([tipo, info]) => {
          registros.push({
            id: doc.id,
            usuarioId: dados.usuarioId,
            tipoPonto: tipo,
            data: info.hora,
            localizacao: info.localizacao
          });
        });
      }
    });
    
    console.log('🔍 Registros de ponto encontrados por período:', registros.length);
    return registros;
  } catch (error) {
    console.error('❌ Erro ao buscar registros de ponto por período no Firebase:', error);
    throw error;
  }
}

/**
 * AUTENTICAR USUÁRIO (LOGIN)
 */
export async function autenticarUsuario(email, cpf) {
  try {
    console.log('🔐 Autenticando usuário no Firebase:', { email, cpf });
    
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    for (const doc of querySnapshot.docs) {
      const userData = doc.data();
      
      // Verifica se email e CPF coincidem
      if (userData.email === email && userData.cpf === cpf) {
        console.log('✅ Usuário autenticado com sucesso:', userData.nome);
        return {
          success: true,
          usuario: {
            id: doc.id,
            ...userData
          }
        };
      }
    }
    
    console.log('❌ Usuário não encontrado ou credenciais inválidas');
    return {
      success: false,
      message: 'Email ou CPF incorretos'
    };
  } catch (error) {
    console.error('❌ Erro ao autenticar usuário no Firebase:', error);
    throw error;
  }
}

/**
 * ATUALIZAR REGISTRO DE PONTO
 */
export async function atualizarRegistroPonto(registroId, tipoPonto, novaData, usuarioAtualizacao) {
  try {
    console.log('✏️ Atualizando registro de ponto:', { registroId, tipoPonto, novaData, usuarioAtualizacao });
    
    // Verifica se o usuário tem permissão (admin ou RH)
    if (!usuarioAtualizacao || (usuarioAtualizacao.funcao !== 'admin' && usuarioAtualizacao.funcao !== 'rh')) {
      throw new Error('Sem permissão para atualizar registros de ponto');
    }

    const pontoRef = doc(db, PONTOS_COLLECTION, registroId);
    const docSnap = await getDoc(pontoRef);
    
    if (!docSnap.exists()) {
      throw new Error('Registro de ponto não encontrado');
    }
    
    // Atualiza apenas o registro específico
    await updateDoc(pontoRef, {
      [`registros.${tipoPonto}.hora`]: Timestamp.fromDate(new Date(novaData)),
      [`registros.${tipoPonto}.atualizadoPor`]: {
        usuarioId: usuarioAtualizacao.id,
        nome: usuarioAtualizacao.nome,
        funcao: usuarioAtualizacao.funcao,
        dataAtualizacao: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Registro de ponto atualizado com sucesso');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar registro de ponto:', error);
    throw error;
  }
}
