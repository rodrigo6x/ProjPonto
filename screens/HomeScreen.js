import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../Style/HomeScreenStyle.js';

const HomeScreen = ({ navigation, route }) => {
  const usuario = route?.params?.usuario;
  const isRH = usuario?.funcao === 'RH';
  const isAdmin = usuario?.funcao === 'admin' || isRH;

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen, { usuario });
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        {usuario?.nome && (
          <Text style={styles.welcomeName}>Olá, {usuario.nome}</Text>
        )}
      </View>

      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>Escolha uma opção:</Text>

      {/* Botões exclusivos para RH/Admin */}
      {isAdmin && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('Cadastro')}>
            <Text style={styles.buttonText}>Cadastro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('Consulta')}>
            <Text style={styles.buttonText}>Consulta</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Botões visíveis a todos os usuários logados */}
      {usuario ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('Ponto')}>
            <Text style={styles.buttonText}>Ponto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => handleNavigate('ConsultaPonto')}>
            <Text style={styles.buttonText}>Consulta Pontos</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={[styles.subtitle, { color: '#ff6b6b' }]}>
          Sessão expirada. Por favor, faça login novamente.
        </Text>
      )}

      {/* Botão de Sair */}
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
