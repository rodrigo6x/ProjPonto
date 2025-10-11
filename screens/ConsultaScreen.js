
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import { listarUsuarios, deletarUsuario } from '../db/database';

export default function ConsultaScreen({ navigation }) {
    const [usuarios, setUsuarios] = useState([]);

    const carregarUsuarios = async () => {
        try {
            const listaUsuarios = await listarUsuarios();
            setUsuarios(listaUsuarios);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    // useEffect - Função para atualizar a lista de usuários
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            carregarUsuarios();
        });
        return unsubscribe;
    }, [navigation]);

    // Função para deletar um usuário
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

    // Função para deletar um usuário
    const deletarUsuarioConfirmado = async (id) => {
        try {
            await deletarUsuario(id);
            alert('Usuário deletado com sucesso!');
            carregarUsuarios();
        } catch (error) {
            alert('Erro ao deletar usuário: ' + error.message);
        }
    };

    // Função para editar um usuário
    const editarUsuario = (usuario) => {
        navigation.navigate('Cadastro', {
            usuario: usuario,
            modoEdicao: true
        });
    };

    // Função para renderizar os usuários
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.infoContainer}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.telefone}>{item.telefone}</Text>
                <Text style={styles.cpf}>{item.cpf}</Text>
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

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Lista de Usuários</Text>
            <Button
                title="Cadastrar Usuario"
                onPress={() => navigation.navigate('Cadastro')}
            />

            <FlatList style={styles.flatList}
                data={usuarios}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhum usuário cadastrado</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 20
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
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 2
    },
    telefone: {
        fontSize: 16,
        color: '#666'
    },
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
