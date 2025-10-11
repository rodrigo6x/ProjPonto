// screens/Login.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');


  const handleLogin = () => {
    // --- LÓGICA DE LOGIN ---
    // Por enquanto, vamos fazer uma validação simples.
    // O ideal aqui seria chamar uma função do seu 'database.js'
    // para verificar se o usuário e a senha existem no banco de dados.


    if (!email || !cpf) {
      Alert.alert('Opa!', 'Preenche aí o e-mail e a senha, pô!');
      return;
    }


    // Simulação de login bem-sucedido
    // No seu caso real, isso aconteceria após a confirmação do banco de dados
    console.log(`Tentativa de login com: ${email}`);


    // Se o login for um sucesso, a gente joga o usuário pra tela principal.
    // Usamos o 'replace' pra ele não conseguir voltar pra tela de login apertando o botão de voltar.
    navigation.replace('Home');
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar no App</Text>
      <Text style={styles.subtitle}>Faça o login para continuar</Text>


      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />


      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        placeholderTextColor="#888"
        value={cpf}
        onChangeText={setCpf}
        secureTextEntry // Isso aqui esconde a senha
      />


      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};


// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F1218', // Um fundo escuro pra combinar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1E242E',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2196F3', // Azul do seu menu
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default LoginScreen;