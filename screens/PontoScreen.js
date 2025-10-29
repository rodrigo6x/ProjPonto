import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, Modal, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { registrarPonto, listarRegistrosPonto, atualizarRegistroPonto, listarUsuarios } from '../db/database';
import styles from '../Style/PontoScreenStyle.js';

export default function PontoScreen({ navigation, route }) {
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [localizacao, setLocalizacao] = useState(null);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [registrosHoje, setRegistrosHoje] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [novaData, setNovaData] = useState('');
    const [usuariosList, setUsuariosList] = useState([]);
    const [selecionarUsuarioVisible, setSelecionarUsuarioVisible] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(route?.params?.usuario);
  // Pega o usuário passado pela navegação (do Login -> Home -> Ponto)
  const usuarioAtual = route?.params?.usuario;
    const usuarioId = selectedUsuario?.id || route?.params?.usuarioId || 'usuario-teste'; // fallback para desenvolvimento
  const isAdmin = usuarioAtual?.funcao === 'RH' || usuarioAtual?.funcao === 'admin';

  useEffect(() => {
    atualizarDataHora();
    carregarUltimoRegistro();
  }, []);

    // Carrega lista de usuários se for admin/RH
    useEffect(() => {
      if (isAdmin) {
        const carregarUsuarios = async () => {
          try {
            const usuarios = await listarUsuarios();
            setUsuariosList(usuarios);
          } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            Alert.alert('Erro', 'Não foi possível carregar a lista de usuários');
          }
        };
        carregarUsuarios();
      }
    }, [isAdmin]);

    const handleSelectUsuario = (usuario) => {
      setSelectedUsuario(usuario);
      setSelecionarUsuarioVisible(false);
      // Chama carregarUltimoRegistro passando o id selecionado para evitar usar o estado ainda não atualizado
      carregarUltimoRegistro(usuario.id);
    };
  const atualizarDataHora = () => {
    const agora = new Date();
    const horaAtual = agora.toLocaleTimeString();
    const dataAtual = agora.toLocaleDateString();
    setHora(horaAtual);
    setData(dataAtual);
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const a = new Date(d1);
    const b = new Date(d2);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const carregarUltimoRegistro = async (uid = null) => {
    try {
      // Se um uid for passado, use-o; caso contrário use o usuarioId atual (que vem do selectedUsuario)
      const targetUsuarioId = uid || usuarioId;
      const registros = await listarRegistrosPonto(targetUsuarioId);

      // Filtra apenas os registros do dia atual
      const hoje = new Date();
      const registrosDoDia = (registros || []).filter(r => {
        const dataObj = r.data?.toDate?.() || new Date(r.data);
        return isSameDay(dataObj, hoje);
      });

      // Ordena por data decrescente (mais recente primeiro)
      registrosDoDia.sort((a, b) => {
        const da = a.data?.toDate?.() || new Date(a.data);
        const db = b.data?.toDate?.() || new Date(b.data);
        return db - da;
      });

      setRegistrosHoje(registrosDoDia);
      if (registrosDoDia.length > 0) {
        setUltimoRegistro(registrosDoDia[0]);
      } else {
        setUltimoRegistro(null);
      }
    } catch (error) {
      console.error('Erro ao carregar último registro:', error);
    }
  };

  const registrarPontoFunc = async () => {
    // Previne múltiplos cliques
    if (isRegistering) {
      console.log('Já está registrando um ponto, aguarde...');
      return;
    }
    
    // Verifica se tem usuário (usa o usuário selecionado quando admin)
    const nomeUsuario = selectedUsuario?.nome || route?.params?.usuario?.nome;
    if (!nomeUsuario) {
      Alert.alert('Erro', 'Usuário não identificado. Por favor, faça login novamente.');
      return;
    }

    try {
      setIsRegistering(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada!');
        setIsRegistering(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocalizacao(location.coords);

      // Sequência desejada
      const ordem = ['CHEGADA', 'ALMOCO', 'TERMINO_ALMOCO', 'SAIDA'];

      // Recarrega registros do dia para ter certeza que estamos atualizados
      await carregarUltimoRegistro();

      // Determina o próximo tipo baseado no último registro do dia
      let proximoTipo = 'CHEGADA';
      if (ultimoRegistro && ultimoRegistro.tipoPonto) {
        const idx = ordem.indexOf(ultimoRegistro.tipoPonto);
        if (idx >= 0 && idx < ordem.length - 1) {
          proximoTipo = ordem[idx + 1];
        } else if (idx === ordem.length - 1) {
          // Já registrou SAIDA hoje — não permitir novo registro
          Alert.alert('Atenção', 'Jornada já finalizada hoje (SAÍDA registrada).');
          setIsRegistering(false);
          return;
        } else {
          // Caso o tipo não esteja na ordem conhecida, reinicia com CHEGADA
          proximoTipo = 'CHEGADA';
        }
      }

      // Verifica novamente se não houve registro enquanto carregávamos
      const registroAtual = registrosHoje.find(r => r.tipoPonto === proximoTipo);
      if (registroAtual) {
        Alert.alert('Atenção', `Já existe registro de ${proximoTipo} para hoje.`);
        setIsRegistering(false);
        return;
      }

  // Registra no Firebase (ou fallback) — usa o nome do usuário selecionado quando aplicável
  await registrarPonto(usuarioId, proximoTipo, location.coords, selectedUsuario?.nome || route?.params?.usuario?.nome);

      // Atualiza o último registro
      await carregarUltimoRegistro();

      Alert.alert('Sucesso', `Ponto '${proximoTipo}' registrado com sucesso!`);
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      Alert.alert('Erro', 'Falha ao registrar ponto. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEditarRegistro = (registro) => {
    const dataObj = registro.data?.toDate?.() || new Date(registro.data);
    setSelectedRegistro(registro);
    setNovaData(dataObj.toISOString().slice(0, 16)); // Formato YYYY-MM-DDTHH:mm
    setModalVisible(true);
  };

  const salvarEdicao = async () => {
    try {
      if (!selectedRegistro || !novaData) {
        Alert.alert('Erro', 'Dados inválidos para atualização');
        return;
      }

      await atualizarRegistroPonto(
        selectedRegistro.id,
        selectedRegistro.tipoPonto,
        novaData,
        usuarioAtual
      );

      Alert.alert('Sucesso', 'Registro atualizado com sucesso');
      setModalVisible(false);
      carregarUltimoRegistro(); // Recarrega os registros
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      Alert.alert('Erro', error.message || 'Erro ao atualizar registro');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Ponto</Text>
        {isAdmin && (
          <View style={styles.selecionarUsuarioContainer}>
            <Text style={styles.selectedUserText}>
              Usuário selecionado: {selectedUsuario?.nome || 'Nenhum'}
            </Text>
            <TouchableOpacity
              style={styles.selecionarUsuarioButton}
              onPress={() => setSelecionarUsuarioVisible(true)}
            >
              <Text style={styles.selecionarUsuarioButtonText}>
                Selecionar Usuário
              </Text>
            </TouchableOpacity>
          </View>
        )}
      <Text style={styles.info}>Data: {data}</Text>
      <Text style={styles.info}>Hora: {hora}</Text>
      
      <View style={styles.ultimoRegistro}>
        <Text style={styles.ultimoRegistroTitle}>Registros de Hoje:</Text>
  <Text style={styles.usuarioInfo}>Colaborador: {selectedUsuario?.nome || route?.params?.usuario?.nome || 'Não identificado'}</Text>
        {registrosHoje.length === 0 && (
          <Text style={styles.ultimoRegistroInfo}>Nenhum registro hoje.</Text>
        )}
        {registrosHoje.map((r, i) => {
          const dataObj = r.data?.toDate?.() || new Date(r.data);
          const uniqueKey = `${r.tipoPonto}_${dataObj.getTime()}_${i}`;
          return (
            <View key={uniqueKey} style={styles.registroContainer}>
              <Text style={styles.ultimoRegistroInfo}>
                {r.tipoPonto} - {dataObj.toLocaleTimeString()}
              </Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditarRegistro(r)}
                >
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
      
      {localizacao && (
        <Text style={styles.info}>
          Localização: {localizacao.latitude.toFixed(5)}, {localizacao.longitude.toFixed(5)}
        </Text>
      )}
      
      <View style={styles.buttonContainer}>
  {/* Botão Registrar */}
  <TouchableOpacity
  style={[styles.button, styles.buttonPrimary]}
  disabled={isRegistering}
  onPress={registrarPontoFunc}
>
    <Text style={styles.buttonText}>
      {(() => {
        const ordem = ['CHEGADA', 'ALMOCO', 'TERMINO_ALMOCO', 'SAIDA'];
        const labels = {
          CHEGADA: 'Registrar Chegada',
          ALMOCO: 'Registrar Almoço',
          TERMINO_ALMOCO: 'Registrar Término Almoço',
          SAIDA: 'Registrar Saída'
        };

        if (!ultimoRegistro) return labels.CHEGADA;
        const idx = ordem.indexOf(ultimoRegistro.tipoPonto);
        if (idx >= 0 && idx < ordem.length - 1) return labels[ordem[idx + 1]];
        if (idx === ordem.length - 1) return 'Jornada finalizada';
        return labels.CHEGADA;
      })()}
    </Text>
  </TouchableOpacity>

  {/* Botão Voltar */}
  <TouchableOpacity
    style={[styles.button, styles.buttonSecondary]}
    onPress={() => navigation.goBack()}
  >
    <Text style={styles.buttonText}>Voltar</Text>
  </TouchableOpacity>
</View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Registro</Text>
            <Text style={styles.modalSubtitle}>
              {selectedRegistro?.tipoPonto}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={novaData}
              onChangeText={setNovaData}
              placeholder="YYYY-MM-DDTHH:mm"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={salvarEdicao}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
        <Modal
          animationType="slide"
          transparent={true}
          visible={selecionarUsuarioVisible}
          onRequestClose={() => setSelecionarUsuarioVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Selecionar Usuário</Text>
              <ScrollView style={styles.usuariosScrollView}>
                {usuariosList.map((usuario) => (
                  <TouchableOpacity
                    key={usuario.id}
                    style={styles.usuarioItem}
                    onPress={() => handleSelectUsuario(usuario)}
                  >
                    <Text style={styles.usuarioNome}>{usuario.nome}</Text>
                    <Text style={styles.usuarioFuncao}>{usuario.funcao}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setSelecionarUsuarioVisible(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
  );
}

