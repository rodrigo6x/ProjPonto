import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {

  const handleLogout = () => {
    // Usamos 'reset' para limpar o histórico de navegação e voltar ao Login
    // IMPORTANTE: Substitua 'Login' pelo nome exato da sua rota de Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], 
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>Escolha uma opção:</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.buttonText}>Cadastro</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Consulta')}>
        <Text style={styles.buttonText}>Consulta Cadastro</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Ponto')}>
        <Text style={styles.buttonText}>Ponto</Text>
      </TouchableOpacity>
      {/* --- Botão Sair Adicionado --- */}
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} // Adiciona um estilo extra (vermelho)
        onPress={handleLogout} // Chama a função de logout
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1218',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- Estilo novo para o botão de sair ---
  logoutButton: {
    backgroundColor: '#D32F2F', // Um tom de vermelho para diferenciar
  },
});

export default HomeScreen;
