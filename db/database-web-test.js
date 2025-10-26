// Versão de teste para web - usando localStorage como mock do banco
import { Platform } from 'react-native';

let usuarios = [];

// Função para carregar dados do localStorage
function carregarDados() {
    try {
        // Verifica se localStorage está disponível
        if (typeof localStorage === 'undefined' || localStorage === null) {
            console.warn('⚠️ localStorage não disponível, usando dados em memória');
            usuarios = [{
                id: 1,
                nome: 'Administrador',
                email: 'administrador',
                funcao: 'admin',
                cpf: 'admin',
                matricula: null,
                filialMatriz: null,
                turno: null
            }];
            return;
        }

        const dados = localStorage.getItem('usuarios_projetoponto');
        if (dados) {
            usuarios = JSON.parse(dados);
        } else {
            // Cria usuário admin padrão
            usuarios = [{
                id: 1,
                nome: 'Administrador',
                email: 'administrador',
                funcao: 'admin',
                cpf: 'admin',
                matricula: null,
                filialMatriz: null,
                turno: null
            }];
            salvarDados();
        }
        console.log('📦 Dados carregados do localStorage:', usuarios);
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        usuarios = [{
            id: 1,
            nome: 'Administrador',
            email: 'administrador',
            funcao: 'admin',
            cpf: 'admin',
            matricula: null,
            filialMatriz: null,
            turno: null
        }];
    }
}

// Função para salvar dados no localStorage
function salvarDados() {
    try {
        // Verifica se localStorage está disponível
        if (typeof localStorage === 'undefined' || localStorage === null) {
            console.warn('⚠️ localStorage não disponível, dados não serão persistidos');
            return;
        }

        localStorage.setItem('usuarios_projetoponto', JSON.stringify(usuarios));
        console.log('💾 Dados salvos no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
    }
}

// Inicializa os dados quando o módulo é carregado
if (Platform.OS === 'web') {
    carregarDados();
}

export async function initDB() {
    console.log('🗄️ Inicializando banco de dados (versão web)');
    carregarDados();
    return true;
}

export async function inserirUsuario(nome, email, funcao, cpf, matricula, filialMatriz, turno) {
    try {
        console.log('➕ Inserindo usuário (versão web):', { nome, email, funcao, cpf, matricula, filialMatriz, turno });
        
        const novoUsuario = {
            id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
            nome,
            email,
            funcao,
            cpf,
            matricula,
            filialMatriz,
            turno
        };
        
        usuarios.push(novoUsuario);
        salvarDados();
        
        console.log('✅ Usuário inserido com sucesso (versão web):', novoUsuario);
        return { insertId: novoUsuario.id, rowsAffected: 1 };
    } catch (error) {
        console.error('❌ Erro ao inserir usuario (versão web):', error);
        throw error;
    }
}

export async function listarUsuarios() {
    try {
        console.log('🗄️ Listando usuários (versão web)');
        carregarDados();
        console.log('📋 Usuários encontrados (versão web):', usuarios);
        return usuarios;
    } catch (error) {
        console.error('❌ Erro ao listar usuarios (versão web):', error);
        throw error;
    }
}

export async function buscarUsuarios(termo) {
    try {
        console.log('🔍 Buscando usuários (versão web) com termo:', termo);
        carregarDados();
        
        const termoBusca = termo.toLowerCase();
        const resultados = usuarios.filter(usuario => 
            usuario.nome.toLowerCase().includes(termoBusca) ||
            usuario.matricula?.toLowerCase().includes(termoBusca) ||
            usuario.cpf.toLowerCase().includes(termoBusca)
        );
        
        console.log('🔍 Resultados da busca (versão web):', resultados);
        return resultados;
    } catch (error) {
        console.error('❌ Erro ao buscar usuarios (versão web):', error);
        throw error;
    }
}

export async function atualizarUsuario(id, nome, email, funcao, cpf, matricula, filialMatriz, turno) {
    try {
        console.log('✏️ Atualizando usuário (versão web):', { id, nome, email, funcao, cpf, matricula, filialMatriz, turno });
        
        const index = usuarios.findIndex(u => u.id === id);
        if (index !== -1) {
            usuarios[index] = { id, nome, email, funcao, cpf, matricula, filialMatriz, turno };
            salvarDados();
            console.log('✅ Usuário atualizado com sucesso (versão web)');
            return { rowsAffected: 1 };
        } else {
            throw new Error('Usuário não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar usuario (versão web):', error);
        throw error;
    }
}

export async function deletarUsuario(id) {
    try {
        console.log('🗑️ Deletando usuário (versão web):', id);
        
        const index = usuarios.findIndex(u => u.id === id);
        if (index !== -1) {
            usuarios.splice(index, 1);
            salvarDados();
            console.log('✅ Usuário deletado com sucesso (versão web)');
            return { rowsAffected: 1 };
        } else {
            throw new Error('Usuário não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao deletar usuario (versão web):', error);
        throw error;
    }
}

/**
 * AUTENTICAR USUÁRIO (LOGIN) - Versão Web
 */
export async function autenticarUsuario(email, cpf) {
    try {
        console.log('🔐 Autenticando usuário (versão web):', { email, cpf });
        
        carregarDados();
        
        const usuario = usuarios.find(u => u.email === email && u.cpf === cpf);
        
        if (usuario) {
            console.log('✅ Usuário autenticado com sucesso (versão web):', usuario.nome);
            return {
                success: true,
                usuario: usuario
            };
        } else {
            console.log('❌ Usuário não encontrado ou credenciais inválidas (versão web)');
            return {
                success: false,
                message: 'Email ou CPF incorretos'
            };
        }
    } catch (error) {
        console.error('❌ Erro ao autenticar usuário (versão web):', error);
        throw error;
    }
}
