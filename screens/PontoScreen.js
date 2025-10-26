import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { registrarPonto, listarRegistrosPonto } from '../db/database';

export default function PontoScreen({ navigation, route }) {
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [localizacao, setLocalizacao] = useState(null);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  // Pega o usuário passado pela navegação (do Login -> Home -> Ponto)
  const usuarioId = route?.params?.usuario?.id || route?.params?.usuarioId || 'usuario-teste'; // fallback para desenvolvimento

  useEffect(() => {
    atualizarDataHora();
    carregarUltimoRegistro();
  }, []);

  const atualizarDataHora = () => {
    const agora = new Date();
    const horaAtual = agora.toLocaleTimeString();
    const dataAtual = agora.toLocaleDateString();
    setHora(horaAtual);
    setData(dataAtual);
  };

  const carregarUltimoRegistro = async () => {
    try {
      const registros = await listarRegistrosPonto(usuarioId);
      if (registros.length > 0) {
        setUltimoRegistro(registros[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar último registro:', error);
    }
  };

  const registrarPontoFunc = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocalizacao(location.coords);

      // Determina o tipo de ponto baseado no último registro
      const tipoPonto = ultimoRegistro?.tipoPonto === 'entrada' ? 'saida' : 'entrada';

      // Registra no Firebase
      await registrarPonto(usuarioId, tipoPonto, location.coords);
      
      // Atualiza o último registro
      await carregarUltimoRegistro();
      
      Alert.alert('Sucesso', `Ponto de ${tipoPonto} registrado com sucesso!`);
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      Alert.alert('Erro', 'Falha ao registrar ponto. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Ponto</Text>
      <Text style={styles.info}>Data: {data}</Text>
      <Text style={styles.info}>Hora: {hora}</Text>
      
      {ultimoRegistro && (
        <View style={styles.ultimoRegistro}>
          <Text style={styles.ultimoRegistroTitle}>Último Registro:</Text>
          <Text style={styles.ultimoRegistroInfo}>
            {ultimoRegistro.tipoPonto === 'entrada' ? 'Entrada' : 'Saída'} - {' '}
            {ultimoRegistro.data?.toDate?.()?.toLocaleString() || 'Data não disponível'}
          </Text>
        </View>
      )}
      
      {localizacao && (
        <Text style={styles.info}>
          Localização: {localizacao.latitude.toFixed(5)}, {localizacao.longitude.toFixed(5)}
        </Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title={ultimoRegistro?.tipoPonto === 'entrada' ? 'Registrar Saída' : 'Registrar Entrada'} 
          onPress={registrarPontoFunc} 
        />
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333'
  },
  info: { 
    fontSize: 16, 
    marginBottom: 10,
    color: '#666'
  },
  ultimoRegistro: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  ultimoRegistroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5
  },
  ultimoRegistroInfo: {
    fontSize: 14,
    color: '#666'
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
});