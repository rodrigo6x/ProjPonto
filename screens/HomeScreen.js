import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styles from '../Style/HomeScreenStyle.js';

const HomeScreen = ({ navigation, route }) => {
  // Recebe o usuário vindo do login
  const usuario = route?.params?.usuario || null;
  const isAdmin = usuario?.funcao === 'RH' || usuario?.funcao === 'admin';
  const handleLogout = () => {
    // Usamos 'reset' para limpar o histórico de navegação e voltar ao Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };


  return (
    <View style={styles.container}>
      {/* Header com nome do usuário logado (canto superior direito) */}
      <View style={styles.header}>
        {usuario?.nome ? (
          <Text style={styles.welcomeName}>{`Olá, ${usuario.nome}`}</Text>
        ) : null}
      </View>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>Escolha uma opção:</Text>

      {/* Mostrar botão de cadastro apenas para admin */}
      {usuario?.funcao === 'RH' && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cadastro', { usuario })}>
            <Text style={styles.buttonText}>Cadastro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Consulta', { usuario })}>
            <Text style={styles.buttonText}>Consulta</Text>
          </TouchableOpacity>
        </>
      )}
      
      {/* Só mostrar os outros botões se houver um usuário logado */}
      {usuario ? (
        <>                   
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Ponto', { usuario })}>
            <Text style={styles.buttonText}>Ponto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ConsultaPonto', { usuario })}>
            <Text style={styles.buttonText}>Consulta Pontos</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={[styles.subtitle, { color: '#ff6b6b' }]}>
          Sessão expirada. Por favor, faça login novamente.
        </Text>
      )}

      {/* --- Botão Sair --- */}
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

    </View>
  );
};

export default HomeScreen;