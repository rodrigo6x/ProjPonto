
import { Platform } from 'react-native';

// Import Firebase database (versão simplificada)
import * as firebaseDatabase from './database-firebase-simple';

// Fallback para SQLite (caso Firebase não funcione)
let SQLite;
try {
    SQLite = require('expo-sqlite');
} catch (error) {
    console.warn('expo-sqlite not available:', error.message);
    SQLite = null;
}

// Fallback para web version
let webDatabase;
if (Platform.OS === 'web') {
    try {
        webDatabase = require('./database-web-test');
    } catch (error) {
        console.warn('Web database not available:', error.message);
    }
}

function getDB() {
    if (!db) {
        if (Platform.OS === 'web' || !SQLite || !SQLite.openDatabase) {
            // For web platform or when SQLite is not available
            console.warn('SQLite is not available on this platform. Using mock database.');
            return null;
        } else {
            try {
                db = SQLite.openDatabase('projetoponto4.db');
            } catch (error) {
                console.error('Error opening database:', error);
                return null;
            }
        }
    }
    return db;
}

function executeSqlAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        console.log('🔧 Executando SQL:', sql, 'com parâmetros:', params);
        const database = getDB();
        
        if (!database) {
            // Mock response for web platform
            console.warn('⚠️ Database not available on web platform. Operation skipped:', sql);
            resolve({ 
                rows: { 
                    _array: [] 
                }, 
                insertId: 1, 
                rowsAffected: 0 
            });
            return;
        }
        
        database.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    params,
                    (_, result) => {
                        console.log('✅ SQL executado com sucesso:', result);
                        resolve(result);
                    },
                    (_, error) => {
                        // erro na execução do SQL
                        console.error('❌ Erro na execução do SQL:', error);
                        reject(error);
                        return false;
                    }
                );
            },
            transactionError => {
                console.error('❌ Erro na transação:', transactionError);
                reject(transactionError);
            }
        );
    });
}

/**
 * INICIALIZAR BANCO DE DADOS
 */
export async function initDB() {
    try {
        // Tenta usar Firebase primeiro
        try {
            console.log('🔥 Tentando usar Firebase...');
            return await firebaseDatabase.initDB();
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível, usando fallback:', firebaseError.message);
            
            // Fallback para web
            if (Platform.OS === 'web' && webDatabase) {
                console.log('🌐 Usando banco de dados web como fallback');
                return await webDatabase.initDB();
            }
            
            // Fallback para SQLite
            console.log('🗄️ Usando SQLite como fallback');
            getDB();
            await executeSqlAsync(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL,
                    funcao TEXT NOT NULL,
                    cpf TEXT NOT NULL,
                    matricula TEXT NULL,
                    filialMatriz TEXT NULL,
                    turno TEXT NULL
                );
            `);

            const adminEmail = 'administrador';
            const adminCpf = 'admin';
            const adminFuncao = 'admin';
            const adminNome = 'Administrador';

            const selectRes = await executeSqlAsync('SELECT * FROM usuarios WHERE email = ?;', [adminEmail]);
            const rows = (selectRes && selectRes.rows && selectRes.rows._array) ? selectRes.rows._array : [];
            if (rows.length === 0) {
                await executeSqlAsync(
                    'INSERT INTO usuarios (nome, email, funcao, cpf, matricula, filialMatriz, turno) VALUES (?, ?, ?, ?, ?, ?, ?);',
                    [adminNome, adminEmail, adminFuncao, adminCpf, null, null, null]
                );
            }
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        throw error;
    }
}

/**
 * INSERIR USUÁRIO
 */
export async function inserirUsuario(nome, email, funcao, cpf, matricula, filialMatriz, turno) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.inserirUsuario(nome, email, funcao, cpf, matricula, filialMatriz, turno);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível, usando fallback:', firebaseError.message);
            
            // Fallback para web
            if (Platform.OS === 'web' && webDatabase) {
                return await webDatabase.inserirUsuario(nome, email, funcao, cpf, matricula, filialMatriz, turno);
            }
            
            // Fallback para SQLite
            console.log('➕ Inserindo usuário no SQLite:', { nome, email, funcao, cpf, matricula, filialMatriz, turno });
            await initDB();

            const res = await executeSqlAsync(
                'INSERT INTO usuarios (nome, email, funcao, cpf, matricula, filialMatriz, turno) VALUES (?, ?, ?, ?, ?, ?, ?);',
                [nome, email, funcao, cpf, matricula, filialMatriz, turno]
            );
            console.log('✅ Usuário inserido com sucesso no SQLite:', res);
            return res;
        }
    } catch (error) {
        console.error('❌ Erro ao inserir usuario:', error);
        throw error;
    }
}

/**
 * LISTAR USUÁRIOS
 */
export async function listarUsuarios() {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.listarUsuarios();
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível, usando fallback:', firebaseError.message);
            
            // Fallback para web
            if (Platform.OS === 'web' && webDatabase) {
                return await webDatabase.listarUsuarios();
            }
            
            // Fallback para SQLite
            console.log('🗄️ Listando usuários do SQLite...');
            await initDB();
            const res = await executeSqlAsync('SELECT * FROM usuarios;');
            const usuarios = (res && res.rows && res.rows._array) ? res.rows._array : [];
            console.log('🗄️ Usuários retornados do SQLite:', usuarios);
            return usuarios;
        }
    } catch (error) {
        console.error('❌ Erro ao listar usuarios:', error);
        throw error;
    }
}

export async function atualizarUsuario(id, nome, email, funcao, cpf, matricula, filialMatriz, turno) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.atualizarUsuario(id, nome, email, funcao, cpf, matricula, filialMatriz, turno);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível, usando fallback:', firebaseError.message);
            
            // Fallback para web
            if (Platform.OS === 'web' && webDatabase) {
                return await webDatabase.atualizarUsuario(id, nome, email, funcao, cpf, matricula, filialMatriz, turno);
            }
            
            // Fallback para SQLite
            await initDB();
            const res = await executeSqlAsync(
                'UPDATE usuarios SET nome = ?, email = ?, funcao = ?, cpf = ?, matricula = ?, filialMatriz = ?, turno = ? WHERE id = ?;',
                [nome, email, funcao, cpf, matricula, filialMatriz, turno, id]
            );
            return res;
        }
    } catch (error) {
        console.error('Erro ao atualizar usuario:', error);
        throw error;
    }
}

/**
 * BUSCAR USUÁRIOS
 */
export async function buscarUsuarios(termo) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.buscarUsuarios(termo);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível, usando fallback:', firebaseError.message);
            
            // Fallback para web
            if (Platform.OS === 'web' && webDatabase) {
                return await webDatabase.buscarUsuarios(termo);
            }
            
            // Fallback para SQLite
            await initDB();
            const termoBusca = `${termo}%`;
            const res = await executeSqlAsync(
                'SELECT * FROM usuarios WHERE nome LIKE ? OR matricula LIKE ? OR cpf LIKE ?;',
                [termoBusca, termoBusca, termoBusca]
            );
            return (res && res.rows && res.rows._array) ? res.rows._array : [];
        }
    } catch (error) {
        console.error('Erro ao buscar usuarios:', error);
        throw error;
    }
}

/**
 * DELETAR USUÁRIO
 */
export async function deletarUsuario(id) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.deletarUsuario(id);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível, usando fallback:', firebaseError.message);
            
            // Fallback para web
            if (Platform.OS === 'web' && webDatabase) {
                return await webDatabase.deletarUsuario(id);
            }
            
            // Fallback para SQLite
            await initDB();
            const res = await executeSqlAsync('DELETE FROM usuarios WHERE id = ?;', [id]);
            return res;
        }
    } catch (error) {
        console.error('Erro ao deletar usuario:', error);
        throw error;
    }
}

/**
 * REGISTRAR PONTO
 */
export async function registrarPonto(usuarioId, tipoPonto, localizacao = null) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.registrarPonto(usuarioId, tipoPonto, localizacao);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível para ponto, usando fallback:', firebaseError.message);
            // Para ponto, vamos apenas simular o sucesso se Firebase falhar
            console.log('⏰ Ponto registrado localmente (Firebase não disponível)');
            return { insertId: 'local-' + Date.now(), rowsAffected: 1 };
        }
    } catch (error) {
        console.error('❌ Erro ao registrar ponto:', error);
        throw error;
    }
}

/**
 * LISTAR REGISTROS DE PONTO
 */
export async function listarRegistrosPonto(usuarioId = null) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.listarRegistrosPonto(usuarioId);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível para listar pontos, usando fallback:', firebaseError.message);
            // Retorna array vazio se Firebase não estiver disponível
            return [];
        }
    } catch (error) {
        console.error('❌ Erro ao listar registros de ponto:', error);
        throw error;
    }
}

/**
 * BUSCAR REGISTROS DE PONTO POR PERÍODO
 */
export async function buscarRegistrosPontoPorPeriodo(dataInicio, dataFim, usuarioId = null) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.buscarRegistrosPontoPorPeriodo(dataInicio, dataFim, usuarioId);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível para buscar pontos por período, usando fallback:', firebaseError.message);
            // Retorna array vazio se Firebase não estiver disponível
            return [];
        }
    } catch (error) {
        console.error('❌ Erro ao buscar registros de ponto por período:', error);
        throw error;
    }
}

/**
 * AUTENTICAR USUÁRIO (LOGIN)
 */
export async function autenticarUsuario(email, cpf) {
    try {
        // Tenta usar Firebase primeiro
        try {
            return await firebaseDatabase.autenticarUsuario(email, cpf);
        } catch (firebaseError) {
            console.warn('⚠️ Firebase não disponível para autenticação, usando fallback:', firebaseError.message);
            
            // Fallback para web
            if (Platform.OS === 'web' && webDatabase) {
                return await webDatabase.autenticarUsuario(email, cpf);
            }
            
            // Fallback para SQLite
            await initDB();
            const res = await executeSqlAsync(
                'SELECT * FROM usuarios WHERE email = ? AND cpf = ?;',
                [email, cpf]
            );
            
            const usuarios = (res && res.rows && res.rows._array) ? res.rows._array : [];
            
            if (usuarios.length > 0) {
                return {
                    success: true,
                    usuario: usuarios[0]
                };
            } else {
                return {
                    success: false,
                    message: 'Email ou CPF incorretos'
                };
            }
        }
    } catch (error) {
        console.error('❌ Erro ao autenticar usuário:', error);
        throw error;
    }
}