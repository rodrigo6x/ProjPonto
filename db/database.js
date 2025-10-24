
import * as SQLite from 'expo-sqlite';

let db;

function getDB() {
    if (!db) db = SQLite.openDatabase('projetoponto4.db');
    return db;
}

function executeSqlAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        const database = getDB();
        database.transaction(
            tx => {
                tx.executeSql(
                    sql,
                    params,
                    (_, result) => resolve(result),
                    (_, error) => {
                        // erro na execução do SQL
                        reject(error);
                        return false;
                    }
                );
            },
            transactionError => reject(transactionError)
        );
    });
}

/**
 * INICIALIZAR BANCO DE DADOS
 */
export async function initDB() {
    try {
        // garante que DB está aberto
        getDB();

        // cria tabela se não existir
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

        // Cria admin padrão se não existir
        const adminEmail = 'administrador';
        const adminCpf = 'admin';
        const adminFuncao = 'admin';
        const adminNome = 'Administrador';

        const selectRes = await executeSqlAsync('SELECT * FROM usuarios WHERE email = ?;', [adminEmail]);
        const rows = selectRes.rows && selectRes.rows._array ? selectRes.rows._array : [];
        if (rows.length === 0) {
            // passar valores nulos para os campos opcionais
            await executeSqlAsync(
                'INSERT INTO usuarios (nome, email, funcao, cpf, matricula, filialMatriz, turno) VALUES (?, ?, ?, ?, ?, ?, ?);',
                [adminNome, adminEmail, adminFuncao, adminCpf, null, null, null]
            );
        }
    } catch (error) {
        console.error('Erro ao inicializar banco:', error);
        throw error;
    }
}

/**
 * INSERIR USUÁRIO
 */
export async function inserirUsuario(nome, email, funcao, cpf, matricula, filialMatriz, turno) {
    try {
        await initDB();

        const res = await executeSqlAsync(
            'INSERT INTO usuarios (nome, email, funcao, cpf, matricula, filialMatriz, turno) VALUES (?, ?, ?, ?, ?, ?, ?);',
            [nome, email, funcao, cpf, matricula, filialMatriz, turno]
        );
        return res; // contém insertId e rowsAffected dependendo da plataforma
    } catch (error) {
        console.error('Erro ao inserir usuario:', error);
        throw error;
    }
}

/**
 * LISTAR USUÁRIOS
 */
export async function listarUsuarios() {
    try {
        await initDB();
        const res = await executeSqlAsync('SELECT * FROM usuarios;');
        return res.rows && res.rows._array ? res.rows._array : [];
    } catch (error) {
        console.error('Erro ao listar usuarios:', error);
        throw error;
    }
}

export async function atualizarUsuario(id, nome, email, funcao, cpf, matricula, filialMatriz, turno) {
    try {
        await initDB();
        const res = await executeSqlAsync(
            'UPDATE usuarios SET nome = ?, email = ?, funcao = ?, cpf = ?, matricula = ?, filialMatriz = ?, turno = ? WHERE id = ?;',
            [nome, email, funcao, cpf, matricula, filialMatriz, turno, id]
        );
        return res;
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
        await initDB();
        const termoBusca = `${termo}%`;
        const res = await executeSqlAsync(
            'SELECT * FROM usuarios WHERE nome LIKE ? OR matricula LIKE ? OR cpf LIKE ?;',
            [termoBusca, termoBusca, termoBusca]
        );
        return res.rows && res.rows._array ? res.rows._array : [];
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
        await initDB();
        const res = await executeSqlAsync('DELETE FROM usuarios WHERE id = ?;', [id]);
        return res;
    } catch (error) {
        console.error('Erro ao deletar usuario:', error);
        throw error;
    }
}