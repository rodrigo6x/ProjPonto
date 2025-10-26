// screens/Login.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { autenticarUsuario } from '../db/database';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validação básica
    if (!email || !cpf) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e o CPF!');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Tentando autenticar usuário:', { email, cpf });
      
      // Autentica no banco de dados
      const resultado = await autenticarUsuario(email, cpf);
      
      if (resultado.success) {
        console.log('✅ Login bem-sucedido para:', resultado.usuario.nome);
        
        // Salva informações do usuário logado (opcional)
        // Você pode usar AsyncStorage ou Context para manter o usuário logado
        
        Alert.alert(
          'Sucesso!',
          `Bem-vindo, ${resultado.usuario.nome}!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Home', { usuario: resultado.usuario })
            }
          ]
        );
      } else {
        console.log('❌ Login falhou:', resultado.message);
        Alert.alert('Erro', resultado.message || 'Email ou CPF incorretos!');
      }
    } catch (error) {
      console.error('❌ Erro durante login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
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


      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
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
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
});


export default LoginScreen;