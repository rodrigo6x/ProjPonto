
import * as SQLite from 'expo-sqlite';

let db;

/**
 * INICIALIZAR BANCO DE DADOS
 * Inicializa o banco de dados SQLite 
 */
export async function initDB() {
    try {
        if (!db) {
            db = await SQLite.openDatabaseAsync('projetoponto3.db');

            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL,
                    funcao TEXT NOT NULL,
                    cpf TEXT NOT NULL
                );
            `);
        }
        // Cria admin padrão se não existir
        const adminEmail = 'administrador';
        const adminCpf = 'admin';
        const adminFuncao = 'admin';
        const adminNome = 'Administrador';
        const result = await db.getAllAsync('SELECT * FROM usuarios WHERE email = ?;', [adminEmail]);
        if (result.length === 0) {
            await db.runAsync(
                'INSERT INTO usuarios (nome, email, funcao, cpf) VALUES (?, ?, ?, ?);',
                [adminNome, adminEmail, adminFuncao, adminCpf]
            );
        }
    } catch (error) {
        console.error('Erro ao inicializar banco:', error);
        throw error;
    }
}

/**
 * INSERIR USUÁRIO
 * Adiciona um novo usuário ao banco de dados
 */
export async function inserirUsuario(nome, email, funcao, cpf) {
    try {
        if (!db) await initDB();

        const result = await db.runAsync(
            'INSERT INTO usuarios (nome, email, funcao, cpf) VALUES (?, ?, ?, ?);',
            [nome, email, funcao, cpf]
        );
        return result;
    } catch (error) {
        console.error('Erro ao inserir usuario:', error);
        throw error;
    }
}

/**
 * LISTAR USUÁRIOS
 * Retorna todos os usuários do banco de dados
 */
export async function listarUsuarios() {
    try {
        if (!db) await initDB();

        const result = await db.getAllAsync('SELECT * FROM usuarios;');
        return result;
    } catch (error) {
        console.error('Erro ao listar usuarios:', error);
        throw error;
    }
}

export async function atualizarUsuario(id, nome, email, funcao, cpf) {
    try {
        if (!db) await initDB();

        const result = await db.runAsync(
            'UPDATE usuarios SET nome = ?, email = ?, funcao = ?, cpf = ? WHERE id = ?;',
            [nome, email, funcao, cpf, id]
        );
        return result;
    } catch (error) {
        console.error('Erro ao atualizar usuario:', error);
        throw error;
    }
}

/**
 * DELETAR USUÁRIO
 * Remove um usuário específico do banco de dados
 */
export async function deletarUsuario(id) {
    try {
        if (!db) await initDB();

        const result = await db.runAsync(
            'DELETE FROM usuarios WHERE id = ?;',
            [id]
        );
        return result;
    } catch (error) {
        console.error('Erro ao deletar usuario:', error);
        throw error;
    }
}