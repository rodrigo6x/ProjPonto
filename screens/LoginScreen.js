// screens/Login.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { autenticarUsuario } from '../db/database';
import styles from '../Style/LoguinScreenStyle.js';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const cpfInputRef = useRef(null);
  
  // ADICIONE ESTE NOVO STATE
  const [isCpfSecure, setIsCpfSecure] = useState(false);

  // Animação do ícone
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // const colorAnim = useRef(new Animated.Value(0)).current; // <-- COMENTE ESTA LINHA
  const sound = useRef(new Audio.Sound());

  // Cria um componente de ícone animável
  
  // ADICIONE ESTE REF
  const secureTimerRef = useRef(null);
  const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);
  // Interpola a cor do ícone
  // const interpolatedColor = colorAnim.interpolate({ // <-- COMENTE ESTA LINHA
  //   inputRange: [0, 1],                             // <-- COMENTE ESTA LINHA
  //   outputRange: ['#466d5aff', '#89CFF0']           // <-- COMENTE ESTA LINHA
  // });                                               // <-- COMENTE ESTA LINHA

  // Carrega e descarrega o som
  useEffect(() => {
    const loadSound = async () => {
      try {
        // Configura o modo de áudio para tocar som mesmo no modo silencioso (importante para iOS)
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
        });
        await sound.current.loadAsync(require('../assets/sounds/SomLogin.mp3'));
      } catch (error) {
        console.warn("Não foi possível carregar o som de login:", error);
      }
    };

    loadSound();

    return () => {
      // Descarrega o som quando o componente é desmontado
      sound.current.unloadAsync();
    };
  }, []);

  // CRIE ESTA FUNÇÃO
  const handleCpfChange = (text) => {
    // 1. Atualiza o valor do CPF
    setCpf(text);
    
    // 2. Mostra o texto (desativa a máscara)
    setIsCpfSecure(false);

    // 3. Limpa qualquer timer que já estivesse rodando
    // (Se o usuário digitar rápido, o timer antigo é cancelado)
    if (secureTimerRef.current) {
      clearTimeout(secureTimerRef.current);
    }

    // 4. Inicia um novo timer. 
    // Se o usuário não digitar por 1 segundo, a máscara será ativada.
    secureTimerRef.current = setTimeout(() => {
      setIsCpfSecure(true);
    }, 1000); // 1000ms = 1 segundo. Ajuste esse valor como quiser!
  };

  // É uma boa prática limpar o timer quando o usuário sair da tela
  useEffect(() => {
    // A função de retorno do useEffect é chamada quando o componente "morre"
    return () => clearTimeout(secureTimerRef.current);
  }, []); // O [] significa que isso só roda na "montagem" e "desmontagem"

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
        
        // Toca o som de sucesso
        try {
          await sound.current.replayAsync();
          // Agenda a parada do som após 3 segundos
          setTimeout(() => {
            if (sound.current) {
              sound.current.stopAsync();
            }
          }, 3000); // 3000ms = 3 segundos
        } catch (error) {
          console.warn("Não foi possível tocar o som:", error);
        }
        // Inicia as animações em paralelo (escala e cor)
        Animated.parallel([
          // Animação de escala (pulsar)
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.3, // Aumenta o ícone
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1, // Retorna ao normal
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          // Animação de mudança de cor
          // Animated.timing(colorAnim, {           // <-- COMENTE ESTA LINHA
          //   toValue: 1,                          // <-- COMENTE ESTA LINHA
          //   duration: 600,                     // <-- COMENTE ESTA LINHA
          //   useNativeDriver: false,              // <-- COMENTE ESTA LINHA
          // })                                     // <-- COMENTE ESTA LINHA
        ]).start(() => {
          // Navega para a Home após a animação
          navigation.replace('Home', { usuario: resultado.usuario });
        });
      } else {
        console.log('❌ Login falhou:', resultado.message);
        Alert.alert('Erro', resultado.message || 'Email ou CPF incorretos!');
        setLoading(false); // Para o loading em caso de falha
      }
    } catch (error) {
      console.error('❌ Erro durante login:', error);
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
      setLoading(false);
    } finally {
      // O setLoading(false) foi movido para o bloco de falha para permitir que a animação ocorra.
    }
  };


  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 25 }}>
          <AnimatedIcon 
            name="fingerprint" 
            style={[styles.icon, { marginBottom: 0 }]} // Estilo combinado
          />
        </Animated.View>

        <Text style={styles.title}>Acesso ao Sistema</Text>
        <Text style={styles.subtitle}>Faça o login para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => cpfInputRef.current?.focus()}
          blurOnSubmit={false}
          accessibilityLabel="Campo de e-mail"
        />

        <TextInput
          ref={cpfInputRef}
          style={styles.input}
          placeholder="Digite seu CPF"
          placeholderTextColor="#888"
          value={cpf}
          onChangeText={handleCpfChange}
          returnKeyType="done"
          secureTextEntry={isCpfSecure} // <-- ADICIONE ESTA LINHA
          onSubmitEditing={handleLogin}
          accessibilityLabel="Campo de CPF"
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Botão para entrar no aplicativo"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;