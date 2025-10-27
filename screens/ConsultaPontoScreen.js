import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { buscarRegistrosPontoPorPeriodo, listarRegistrosPonto } from '../db/database';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatTimeFromRecord(r) {
  try {
    const dt = r.data?.toDate?.() || new Date(r.data);
    return dt.toLocaleTimeString();
  } catch (e) {
    return '-';
  }
}

function labelForTipo(tipo) {
  const map = {
    CHEGADA: 'Chegada',
    ALMOCO: 'Almoço',
    TERMINO_ALMOCO: 'Término Almoço',
    SAIDA: 'Saída',
    entrada: 'Entrada',
    saida: 'Saída'
  };
  return map[tipo] || tipo || 'Desconhecido';
}

export default function ConsultaPontoScreen({ navigation, route }) {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pega usuário da navegação
  const usuario = route?.params?.usuario;
  const usuarioId = usuario?.id;

  useEffect(() => {
    carregarRegistrosDoDia();
  }, [dataSelecionada]);

  const carregarRegistrosDoDia = async (uid = null) => {
    setLoading(true);
    setError(null);
    try {
      const inicio = startOfDay(dataSelecionada);
      const fim = endOfDay(dataSelecionada);

      // Se a função buscarRegistrosPontoPorPeriodo existir, usamos ela
      let results = [];
      try {
        results = await buscarRegistrosPontoPorPeriodo(inicio, fim, uid || (usuarioId || null));
      } catch (err) {
        // fallback: listar todos e filtrar localmente
        const all = await listarRegistrosPonto(uid || null);
        results = (all || []).filter(r => {
          try {
            const d = r.data?.toDate?.() || new Date(r.data);
            return d >= inicio && d <= fim;
          } catch (e) {
            return false;
          }
        });
      }

      // Ordena por data asc
      results.sort((a, b) => {
        const da = a.data?.toDate?.() || new Date(a.data);
        const db = b.data?.toDate?.() || new Date(b.data);
        return da - db;
      });

      setRegistros(results || []);
    } catch (err) {
      console.error('Erro ao carregar registros de ponto:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const prevDay = () => {
    const d = new Date(dataSelecionada);
    d.setDate(d.getDate() - 1);
    setDataSelecionada(d);
  };

  const nextDay = () => {
    const d = new Date(dataSelecionada);
    d.setDate(d.getDate() + 1);
    setDataSelecionada(d);
  };

  const hoje = () => setDataSelecionada(new Date());

  const onBuscarPress = () => carregarRegistrosDoDia(usuarioId || null);

  const renderItem = ({ item }) => {
    const hora = formatTimeFromRecord(item);
    const tipoLabel = labelForTipo(item.tipoPonto || item.tipo || item.tipo_ponto);
    
    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipo}>{tipoLabel}</Text>
          <Text style={styles.hora}>{hora}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {item.localizacao && (
            <Text style={styles.local}>Lat: {item.localizacao.latitude?.toFixed?.(5)}, Lon: {item.localizacao.longitude?.toFixed?.(5)}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Consulta de Pontos</Text>

        <View style={styles.controls}>
          <Button title="‹" onPress={prevDay} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.dateText}>{dataSelecionada.toLocaleDateString()}</Text>
          </View>
          <Button title="›" onPress={nextDay} />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>Colaborador: {usuario?.nome || 'Não identificado'}</Text>
        </View>

        <View style={styles.rowSmall}>
          <Button title="Hoje" onPress={hoje} />
        </View>

        {loading && <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />}

        {error && <Text style={styles.error}>Erro: {error}</Text>}

        {!loading && registros.length === 0 && <Text style={styles.empty}>Nenhum registro encontrado para a data selecionada.</Text>}

        <FlatList
          data={registros}
          keyExtractor={(item, idx) => {
            // Cria uma chave única usando todas as informações disponíveis
            const timestamp = item.data?.toDate?.() ? item.data.toDate().getTime() : (new Date(item.data)).getTime();
            return `${item.tipoPonto}_${timestamp}_${idx}`;
          }}
          renderItem={renderItem}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  userInfo: { 
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  userName: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500'
  },
  controls: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rowSmall: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  input: { flex: 1, height: 44, borderColor: '#ccc', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: 'white' },
  list: { marginTop: 8 },
  item: { backgroundColor: 'white', padding: 12, marginBottom: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  tipo: { fontSize: 16, fontWeight: 'bold' },
  hora: { fontSize: 14, color: '#555' },
  usuario: { fontSize: 12, color: '#666' },
  local: { fontSize: 11, color: '#999' },
  empty: { textAlign: 'center', marginTop: 20, color: '#666' },
  error: { color: 'red', textAlign: 'center', marginTop: 8 }
});
