import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function PontoScreen({ navigation }) {
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [localizacao, setLocalizacao] = useState(null);

  useEffect(() => {
    atualizarDataHora();
  }, []);

  const atualizarDataHora = () => {
    const agora = new Date();
    const horaAtual = agora.toLocaleTimeString();
    const dataAtual = agora.toLocaleDateString();
    setHora(horaAtual);
    setData(dataAtual);
  };

  const registrarPonto = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão de localização negada!');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocalizacao(location.coords);
    alert('Ponto registrado com sucesso!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Ponto</Text>
      <Text style={styles.info}>Data: {data}</Text>
      <Text style={styles.info}>Hora: {hora}</Text>
      {localizacao && (
        <Text style={styles.info}>
          Localização: {localizacao.latitude.toFixed(5)}, {localizacao.longitude.toFixed(5)}
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Registrar Ponto" onPress={registrarPonto} />
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 10 },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
});