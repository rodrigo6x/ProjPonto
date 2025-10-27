import React, { useState, useEffect } from 'react';
// Adicionei o TextInput
import { SafeAreaView, View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
// Adicionei a nova função 'buscarUsuarios' que você vai criar no database.js
import { listarUsuarios, deletarUsuario, buscarUsuarios } from '../db/database';

export default function ConsultaScreen({ navigation, route }) {
    const [usuarios, setUsuarios] = useState([]);
    const [termoBusca, setTermoBusca] = useState(''); // State para o texto da busca
    // Usuário enviado pela tela de login / home
    const usuario = route?.params?.usuario || null;

    // Removida verificação de função - todos os usuários têm acesso

    /**
     * Função de carregar usuários modificada.
     * Agora ela pode buscar todos ou filtrar por um termo.
     */
    const carregarUsuarios = async (termo = '') => {
        try {
            console.log('🔍 Carregando usuários, termo:', termo);
            let listaUsuarios;
            if (termo.trim().length > 0) {
                // Se tem termo, busca no banco
                console.log('🔍 Buscando usuários com termo:', termo);
                listaUsuarios = await buscarUsuarios(termo);
            } else {
                // Se não tem termo, lista todos
                console.log('🔍 Listando todos os usuários');
                listaUsuarios = await listarUsuarios();
            }
            console.log('📋 Usuários encontrados:', listaUsuarios);
            // Garante que listaUsuarios é um array válido
            const usuariosValidos = Array.isArray(listaUsuarios) ? listaUsuarios : [];
            setUsuarios(usuariosValidos);
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
        }
    };

    // Este useEffect agora é o "listener" da busca
    // Ele roda toda vez que o 'termoBusca' muda
    useEffect(() => {
        carregarUsuarios(termoBusca);
    }, [termoBusca]);

    // useEffect - Função para atualizar a lista quando a tela foca
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setTermoBusca(''); // Limpa o campo de busca
            carregarUsuarios(); // Carrega a lista completa
        });
        return unsubscribe;
    }, [navigation]);
    // Função para confirmar exclusão de um usuário
    const confirmarDeletar = (id, nome) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja deletar o usuário "${nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Deletar', style: 'destructive', onPress: () => deletarUsuarioConfirmado(id) }
            ]
        );
    };

    // Função para deletar um usuário (invocada pela confirmação)
    const deletarUsuarioConfirmado = async (id) => {
        try {
            await deletarUsuario(id);
            alert('Usuário deletado com sucesso!');
            // Recarrega a lista baseada no termo de busca atual
            carregarUsuarios(termoBusca);
        } catch (error) {
            alert('Erro ao deletar usuário: ' + error.message);
        }
    };

    // Função para editar um usuário: navegamos para Cadastro passando
    // dois objetos distintos: o usuário logado (route.params.usuario)
    // e o usuário que será editado (usuarioParaEditar). Assim não
    // substituímos a sessão do admin.
    const editarUsuario = (usuarioParaEditar) => {
        navigation.navigate('Cadastro', {
            usuario: route?.params?.usuario,
            usuarioParaEditar: usuarioParaEditar,
            modoEdicao: true
        });
    };
    // Função para renderizar os usuários (ATUALIZEI AQUI)
    // Mostrando os dados relevantes para a busca
    const renderItem = ({ item }) => {
        // Verifica se item é válido
        if (!item) {
            return null;
        }
        
        return (
            <View style={styles.itemContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.nome}>{item.nome || 'Nome não informado'}</Text>
                    {/* Ajustei para mostrar dados mais úteis do seu banco */}
                    <Text style={styles.infoText}>Matrícula: {item.matricula || 'N/A'}</Text>
                    <Text style={styles.infoText}>Função: {item.funcao || 'N/A'}</Text>
                    <Text style={styles.infoText}>CPF: {item.cpf || 'N/A'}</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => editarUsuario(item)}
                    >
                        <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => confirmarDeletar(item.id, item.nome)}
                    >
                        <Text style={styles.buttonText}>Deletar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Cabeçalho que será rolável junto com a lista
    const ListaHeader = () => (
        <View>
            <Text style={styles.titulo}>Lista de Usuários</Text>
            {/* --- CAMPO DE BUSCA ADICIONADO --- */}
            <TextInput
                style={styles.inputBusca}
                placeholder="Buscar por nome, matrícula ou CPF..."
                value={termoBusca}
                onChangeText={setTermoBusca} // Atualiza o state 'termoBusca' a cada letra digitada
            />
            <View style={{ marginBottom: 10 }}>
                <Button
                    title="Cadastrar Usuario"
                        onPress={() => navigation.navigate('Cadastro', { 
                            usuario: route?.params?.usuario // Mantém o usuário logado
                        })}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <FlatList
                    style={styles.flatList}
                    data={usuarios}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
                    }
                    ListHeaderComponent={ListaHeader}
                    // Espaço final moderado para evitar sobreposição pela barra do sistema
                    contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 60 : 30 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    keyboardDismissMode='on-drag'
                />
            </View>
        </SafeAreaView>
    );
}

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 20
    },
    // --- Estilo para o campo de busca ---
    inputBusca: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white',
        fontSize: 16
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    infoContainer: {
        flex: 1
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    // --- Estilo genérico para os outros textos ---
    infoText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 3
    },
    // Removi os estilos 'email' e 'telefone' que não estavam sendo usados
    buttonContainer: {
        flexDirection: 'row',
        gap: 10
    },
    editButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5
    },
    deleteButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20
    },
    flatList: {
        marginTop: 20
    }
});