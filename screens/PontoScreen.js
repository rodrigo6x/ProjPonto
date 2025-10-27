import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, Modal, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { registrarPonto, listarRegistrosPonto, atualizarRegistroPonto, listarUsuarios } from '../db/database';

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
        <Button 
          disabled={isRegistering}
          title={(() => {
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
          onPress={registrarPontoFunc} 
        />
        <Button title="Voltar" onPress={() => navigation.goBack()} />
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
    borderLeftColor: '#2196F3',
    width: '100%'
  },
  ultimoRegistroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5
  },
  ultimoRegistroInfo: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  usuarioInfo: {
    fontSize: 15,
    color: '#1976d2',
    marginBottom: 8
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  registroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 10,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    width: '100%',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#dc3545',
  },
  modalButtonSave: {
    backgroundColor: '#28a745',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
    selecionarUsuarioContainer: {
      width: '100%',
      marginBottom: 15,
      alignItems: 'center',
    },
    selectedUserText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    selecionarUsuarioButton: {
      backgroundColor: '#1976d2',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 4,
    },
    selecionarUsuarioButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    usuariosScrollView: {
      maxHeight: 300,
      width: '100%',
    },
    usuarioItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    usuarioNome: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    usuarioFuncao: {
      fontSize: 14,
      color: '#666',
    },
});