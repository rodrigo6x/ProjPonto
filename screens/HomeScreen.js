import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation, route }) => {
  // Recebe o usuário vindo do login
  const usuario = route?.params?.usuario || null;

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
      {usuario?.funcao === 'admin' && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cadastro', { usuario })}>
          <Text style={styles.buttonText}>Cadastro</Text>
        </TouchableOpacity>
      )}
      
      {/* Só mostrar os outros botões se houver um usuário logado */}
      {usuario ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Consulta', { usuario })}>
            <Text style={styles.buttonText}>Consulta</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Ponto', { usuario })}>
            <Text style={styles.buttonText}>Ponto</Text>
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
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 12,
    fontSize: 20,
    paddingTop: 4
  },
  welcomeName: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.95
  }
});

export default HomeScreen;
