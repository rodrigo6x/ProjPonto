// Tela de login com animação de cadeado (flip Y) e som antes de navegar para Home.
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Platform } from 'react-native';
import { Audio } from 'expo-av';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');

  const rotation = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  const unlockSound = useRef(null);

  // Carregar o som quando o componente montar
  useEffect(() => {
    async function setupAudio() {
      try {
        // Configura o Audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        console.log('🔊 Audio configurado com sucesso');
        
        // Carrega o som
        await loadUnlockSound();
      } catch (error) {
        console.error('❌ Erro ao configurar audio:', error);
      }
    }
    
    setupAudio();
    
    // Limpar o som quando o componente desmontar
    return () => {
      if (unlockSound.current) {
        console.log('🔇 Descarregando som...');
        unlockSound.current.unloadAsync();
      }
    };
  }, []);

  async function loadUnlockSound() {
    try {
      console.log('🎵 Carregando som...');
      
      // Configura o Audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true
      });
      
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/unlock.mp3'),
        { shouldPlay: false }
      );
      unlockSound.current = sound;
      console.log('✅ Som carregado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar som:', error);
      console.error('💡 Por favor, verifique se o arquivo unlock.mp3 está em:');
      console.error('   ProjPonto/assets/unlock.mp3');
    }
  }

  async function playUnlockSound() {
    try {
      console.log('🎵 Tentando tocar som...');
      if (!unlockSound.current) {
        console.warn('⚠️ Som não está carregado, tentando carregar novamente...');
        await loadUnlockSound();
      }
      
      if (unlockSound.current) {
        console.log('⏮️ Reiniciando posição do som...');
        await unlockSound.current.setPositionAsync(0);
        console.log('▶️ Tocando som...');
        const playbackStatus = await unlockSound.current.playAsync();
        console.log('✅ Status da reprodução:', playbackStatus);
      } else {
        console.error('❌ Som ainda não disponível após tentar carregar');
      }
    } catch (error) {
      console.error('❌ Erro ao tocar som:', error);
      // Mostra o erro completo para debug
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
    }
  }

  let closedImg = null;
  let openImg = null;
  try {
    closedImg = require('../assets/lock_closed.png');
    openImg = require('../assets/lock_open.png');
  } catch (e) {
    // fallback -> emoji
  }

  function flipOpen(onEnd) {
    setAnimating(true);
    rotation.setValue(0);
    // Primeira metade da animação sincronizada com a primeira parte do som (0.75s)
    Animated.timing(rotation, { toValue: 0.5, duration: 750, useNativeDriver: true }).start(() => {
      setIsOpen(true);
      // Segunda metade da animação sincronizada com a segunda parte do som (0.75s)
      Animated.timing(rotation, { toValue: 1, duration: 750, useNativeDriver: true }).start(() => {
        setAnimating(false);
        if (onEnd) onEnd();
      });
    });
  }

  async function handleLogin() {
    if (!email || !cpf) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios: e-mail e senha.');
      return;
    }

    console.log(`Tentativa de login com: ${email}`);
    playUnlockSound(); // Toca o som de cadeado abrindo junto com a animação
    flipOpen(() => setTimeout(() => navigation.replace('Home'), 1500)); // Espera o som/animação terminar (1.5s)
  }

  const rotateY = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.container}>
      <View style={styles.lockContainer}>
        {closedImg && openImg ? (
          <Animated.Image source={isOpen ? openImg : closedImg} style={[styles.lockImage, { transform: [{ rotateY }], backfaceVisibility: 'hidden' }]} resizeMode="contain" />
        ) : (
          <Animated.Text style={[styles.lockEmoji, { transform: [{ rotateY }], backfaceVisibility: 'hidden' }]}>🔒</Animated.Text>
        )}
        <Text style={styles.title}>LOGIN </Text>
      </View>

      <Text style={styles.subtitle}>Faça o login para continuar</Text>

      <TextInput style={styles.input} placeholder="Digite seu e-mail" placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#888" value={cpf} onChangeText={setCpf} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={animating}>
        <Text style={styles.buttonText}>{animating ? 'Aguarde...' : 'Entrar'}</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0F1218' },
  lockContainer: { alignItems: 'center', marginBottom: 12, ...Platform.select({ ios: { perspective: 1000 }, android: { transform: [{ perspective: 1000 }] } }) },
  lockImage: { width: 90, height: 90, marginBottom: 8 },
  lockEmoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#1E242E', color: '#fff', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, marginBottom: 15 },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2196F3', fontSize: 15, textAlign: 'center', marginTop: 25, textDecorationLine: 'underline' },
});