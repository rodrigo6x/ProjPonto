import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ActivityIndicator, FlatList, Platform} from 'react-native';
import { buscarRegistrosPontoPorPeriodo, listarRegistrosPonto } from '../db/database';
import styles from '../Style/ConsultaPontoScreenStyle.js';

/** 🕐 Helpers de Data */
const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));
const endOfDay = (date) => new Date(date.setHours(23, 59, 59, 999));

/** 🕒 Formata a hora do registro */
const formatTime = (record) => {
  try {
    const dt = record.data?.toDate?.() || new Date(record.data);
    return dt.toLocaleTimeString();
  } catch {
    return '-';
  }
};

/** 🔖 Tradução dos tipos de ponto */
const tipoLabel = (tipo) => {
  const map = {
    CHEGADA: 'Chegada',
    ALMOCO: 'Almoço',
    TERMINO_ALMOCO: 'Término Almoço',
    SAIDA: 'Saída',
    entrada: 'Entrada',
    saida: 'Saída',
  };
  return map[tipo] || tipo || 'Desconhecido';
};

export default function ConsultaPontoScreen({ navigation, route }) {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const usuario = route?.params?.usuario;
  const usuarioId = usuario?.id;

  /** 🔁 Carrega os registros da data selecionada */
  const carregarRegistros = useCallback(async (uid = null) => {
    setLoading(true);
    setErro(null);

    try {
      const inicio = startOfDay(new Date(dataSelecionada));
      const fim = endOfDay(new Date(dataSelecionada));

      let registros = [];
      try {
        registros = await buscarRegistrosPontoPorPeriodo(inicio, fim, uid || usuarioId);
      } catch {
        // fallback local
        const todos = await listarRegistrosPonto(uid || usuarioId);
        registros = (todos || []).filter((r) => {
          const d = r.data?.toDate?.() || new Date(r.data);
          return d >= inicio && d <= fim;
        });
      }

      // Ordena por data crescente
      registros.sort((a, b) => {
        const da = a.data?.toDate?.() || new Date(a.data);
        const db = b.data?.toDate?.() || new Date(b.data);
        return da - db;
      });

      setRegistros(registros);
    } catch (err) {
      console.error('❌ Erro ao carregar registros:', err);
      setErro(err.message || 'Erro ao carregar registros.');
    } finally {
      setLoading(false);
    }
  }, [dataSelecionada, usuarioId]);

  /** 🔄 Recarrega registros sempre que a data muda */
  useEffect(() => {
    carregarRegistros();
  }, [dataSelecionada, carregarRegistros]);

  /** 🗓️ Controle de datas */
  const alterarDia = (dias) => {
    const novaData = new Date(dataSelecionada);
    novaData.setDate(novaData.getDate() + dias);
    setDataSelecionada(novaData);
  };

  const voltarHoje = () => setDataSelecionada(new Date());

  /** 🔹 Item da lista */
  const renderItem = ({ item }) => {
    const hora = formatTime(item);
    const tipo = tipoLabel(item.tipoPonto || item.tipo || item.tipo_ponto);

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipo}>{tipo}</Text>
          <Text style={styles.hora}>{hora}</Text>
        </View>

        {item.localizacao && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.local}>
              Lat: {item.localizacao.latitude?.toFixed?.(5)} | Lon: {item.localizacao.longitude?.toFixed?.(5)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  /** 🔹 Conteúdo condicional */
  const Conteudo = () => {
    if (loading) return <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />;
    if (erro) return <Text style={styles.error}>Erro: {erro}</Text>;
    if (registros.length === 0)
      return <Text style={styles.empty}>Nenhum registro encontrado para a data selecionada.</Text>;

    return (
      <FlatList
        data={registros}
        renderItem={renderItem}
        keyExtractor={(item, idx) => {
          const t = item.data?.toDate?.()?.getTime?.() || new Date(item.data).getTime();
          return `${item.tipoPonto}_${t}_${idx}`;
        }}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 60 : 30 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Consulta de Pontos</Text>

        {/* Controles de data */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => alterarDia(-1)}>
            <Text style={styles.buttonText}>‹</Text>
          </TouchableOpacity>

          <Text style={[styles.dateText, { flex: 1, textAlign: 'center' }]}>
            {dataSelecionada.toLocaleDateString()}
          </Text>

          <TouchableOpacity style={styles.button} onPress={() => alterarDia(1)}>
            <Text style={styles.buttonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Info usuário */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            Colaborador: {usuario?.nome || 'Não identificado'}
          </Text>
        </View>

        {/* Botão Hoje */}
        <View style={styles.rowSmall}>
          <TouchableOpacity style={[styles.botao, styles.botaoHoje]} onPress={voltarHoje}>
            <Text style={styles.textoBotao}>Hoje</Text>
          </TouchableOpacity>
        </View>

        <Conteudo />
      </View>
    </SafeAreaView>
  );
}
