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

  // Estado da máscara
  const [isCpfSecure, setIsCpfSecure] = useState(false);

  // Controle do timer
  const secureTimerRef = useRef(null);

  // Animações
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

  const sound = useRef(new Audio.Sound());

  useEffect(() => {
    const loadSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
        });
        await sound.current.loadAsync(require('../assets/sounds/SomLogin.mp3'));
      } catch (error) {
        console.warn("Erro ao carregar som:", error);
      }
    };

    loadSound();
    return () => sound.current.unloadAsync();
  }, []);

  // Máscara automática com timer
  const handleCpfChange = (text) => {
    setCpf(text);
    setIsCpfSecure(false);

    if (secureTimerRef.current) clearTimeout(secureTimerRef.current);

    secureTimerRef.current = setTimeout(() => {
      setIsCpfSecure(true);
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimeout(secureTimerRef.current);
  }, []);

  // Login
  const handleLogin = async () => {
    if (!email || !cpf) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e o CPF!');
      return;
    }

    setLoading(true);

    try {
      const resultado = await autenticarUsuario(email, cpf);

      if (resultado.success) {
        try {
          await sound.current.replayAsync();
          setTimeout(() => sound.current.stopAsync(), 3000);
        } catch {}

        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          navigation.replace('Home', { usuario: resultado.usuario });
        });
      } else {
        Alert.alert('Erro', resultado.message || 'Email ou CPF incorretos!');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
      setLoading(false);
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
            style={[styles.icon, { marginBottom: 0 }]} 
          />
        </Animated.View>

        <Text style={styles.title}>Acesso ao Sistema</Text>
        <Text style={styles.subtitle}>Faça o login para continuar</Text>

        {/* EMAIL */}
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
        />

        {/* CPF */}
        <TextInput
          ref={cpfInputRef}
          style={styles.input}
          placeholder="Digite seu CPF"
          placeholderTextColor="#888"
          value={cpf}
          onChangeText={handleCpfChange}
          returnKeyType="done"
          keyboardType="numeric"
          secureTextEntry={isCpfSecure}
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
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
