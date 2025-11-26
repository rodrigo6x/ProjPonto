import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, TextInput, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listarUsuarios, deletarUsuario, buscarUsuarios } from '../db/database';
import { Ionicons } from '@expo/vector-icons';
import styles from '../Style/ConsultaScreenStyle.js';

export default function ConsultaScreen({ navigation, route }) {
  const [usuarios, setUsuarios] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const usuario = route?.params?.usuario;

  
  const carregarUsuarios = useCallback(async (termo = '') => {
    try {
      console.log('🔍 Carregando usuários:', termo || 'Todos');
      const lista = termo.trim()
        ? await buscarUsuarios(termo)
        : await listarUsuarios();

      setUsuarios(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    }
  }, []);

  
  useEffect(() => {
    carregarUsuarios(termoBusca);
  }, [termoBusca, carregarUsuarios]);

  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setTermoBusca('');
      carregarUsuarios();
    });
    return unsubscribe;
  }, [navigation, carregarUsuarios]);

 
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

  
  const deletarUsuarioConfirmado = async (id) => {
    try {
      await deletarUsuario(id);
      Alert.alert('Sucesso', 'Usuário deletado com sucesso!');
      carregarUsuarios(termoBusca);
    } catch (error) {
      Alert.alert('Erro', `Erro ao deletar usuário: ${error.message}`);
    }
  };

  
  const editarUsuario = (usuarioParaEditar) => {
    navigation.navigate('Cadastro', {
      usuario,
      usuarioParaEditar,
      modoEdicao: true,
    });
  };

  
  const renderItem = ({ item }) => {
    if (!item) return null;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.nome}>{item.nome || 'Nome não informado'}</Text>
          <Text style={styles.infoText}>Matrícula: {item.matricula || 'N/A'}</Text>
          <Text style={styles.infoText}>Função: {item.funcao || 'N/A'}</Text>
          <Text style={styles.infoText}>CPF: {item.cpf || 'N/A'}</Text>
          <Text style={styles.infoText}>Sexo: {item.sexo || 'N/A'}</Text>
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

  
  const ListaHeader = () => (
    <View>
      <Text style={styles.titulo}>Lista de Usuários</Text>

      <TextInput
        style={styles.inputBusca}
        placeholder="Buscar por nome, matrícula ou CPF..."
        value={termoBusca}
        onChangeText={setTermoBusca}
      />

      <TouchableOpacity
        style={styles.botaoCadastrar}
        onPress={() => navigation.navigate('Cadastro', { usuario })}
      >
        <Text style={styles.textoBotaoCadastro}>Cadastrar Usuário</Text>
      </TouchableOpacity>
    </View>
  );

  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          style={styles.flatList}
          data={usuarios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          ListHeaderComponent={ListaHeader}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
          }
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'android' ? 60 : 30,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </View>

      
      <TouchableOpacity
        style={styles.botaoVoltarFlutuante}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
