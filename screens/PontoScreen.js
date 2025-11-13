import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, Alert, TextInput, Modal, 
  TouchableOpacity, ScrollView, Image 
} from 'react-native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { 
  registrarPonto, listarRegistrosPonto, 
  atualizarRegistroPonto, listarUsuarios 
} from '../db/database';
import styles from '../Style/PontoScreenStyle.js';

export default function PontoScreen({ navigation, route }) {
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [localizacao, setLocalizacao] = useState(null);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [registrosHoje, setRegistrosHoje] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(route?.params?.usuario);
  const [isRegistering, setIsRegistering] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selecionarUsuarioVisible, setSelecionarUsuarioVisible] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [novaData, setNovaData] = useState('');

  const usuarioAtual = route?.params?.usuario;
  const usuarioId = selectedUsuario?.id || route?.params?.usuarioId || 'usuario-teste';
  const isAdmin = usuarioAtual?.funcao === 'RH' || usuarioAtual?.funcao === 'admin';

  // --- Estados e refs da câmera ---
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Atualiza data e hora automaticamente
  useEffect(() => {
    const atualizarDataHora = () => {
      const agora = new Date();
      setHora(agora.toLocaleTimeString());
      setData(agora.toLocaleDateString());
    };
    atualizarDataHora();
    carregarUltimoRegistro();
  }, []);

  // Carrega lista de usuários (para RH/Admin)
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const usuarios = await listarUsuarios();
        setUsuariosList(usuarios);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        Alert.alert('Erro', 'Não foi possível carregar a lista de usuários');
      }
    })();
  }, [isAdmin]);

  // --- Funções auxiliares ---
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const a = new Date(d1), b = new Date(d2);
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  };

  const carregarUltimoRegistro = async (uid = null) => {
    try {
      const targetId = uid || usuarioId;
      const registros = await listarRegistrosPonto(targetId);
      const hoje = new Date();
      const registrosDoDia = (registros || [])
        .filter(r => isSameDay(r.data?.toDate?.() || new Date(r.data), hoje))
        .sort((a, b) => new Date(b.data) - new Date(a.data));
      setRegistrosHoje(registrosDoDia);
      setUltimoRegistro(registrosDoDia[0] || null);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const handleSelectUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    setSelecionarUsuarioVisible(false);
    carregarUltimoRegistro(usuario.id);
  };

  // --- Função principal: registrar ponto + abrir câmera ---
  const registrarPontoFunc = async () => {
    if (isRegistering) return;
    const nomeUsuario = selectedUsuario?.nome || usuarioAtual?.nome;
    if (!nomeUsuario) return Alert.alert('Erro', 'Usuário não identificado.');

    try {
      setIsRegistering(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permissão de localização negada.');

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocalizacao(coords);
      await carregarUltimoRegistro();

      const ordem = ['CHEGADA', 'ALMOCO', 'TERMINO_ALMOCO', 'SAIDA'];
      let proximoTipo = 'CHEGADA';
      if (ultimoRegistro?.tipoPonto) {
        const idx = ordem.indexOf(ultimoRegistro.tipoPonto);
        if (idx >= 0 && idx < ordem.length - 1) proximoTipo = ordem[idx + 1];
        else if (idx === ordem.length - 1) return Alert.alert('Atenção', 'Jornada já finalizada hoje.');
      }

      const existe = registrosHoje.some(r => r.tipoPonto === proximoTipo);
      if (existe) return Alert.alert('Atenção', `Já existe registro de ${proximoTipo} hoje.`);

      const { status: cameraStatus } = await requestPermission();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permissão negada', 'Você precisa permitir o uso da câmera.');
        return;
      }

      setCameraVisible(true);
      setIsRegistering(false);
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      Alert.alert('Erro', 'Falha ao registrar ponto.');
      setIsRegistering(false);
    }
  };

  // --- Controle de foto ---
  const tirarFoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      setPhotoPreview(photo);
    }
  };

  const tirarNovaFoto = () => {
    setPhotoPreview(null);
  };

  const salvarFoto = async () => {
    try {
      await registrarPonto(usuarioId, 'CONFIRMACAO_FOTO', localizacao, selectedUsuario?.nome || usuarioAtual?.nome);
      Alert.alert('Sucesso', 'Ponto registrado com foto!');
      setCameraVisible(false);
      setPhotoPreview(null);
      carregarUltimoRegistro();
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      Alert.alert('Erro', 'Falha ao salvar foto.');
    }
  };

  const handleEditarRegistro = (registro) => {
    const dataObj = registro.data?.toDate?.() || new Date(registro.data);
    setSelectedRegistro(registro);
    setNovaData(dataObj.toISOString().slice(0, 16));
    setModalVisible(true);
  };

  const salvarEdicao = async () => {
    if (!selectedRegistro || !novaData) return Alert.alert('Erro', 'Dados inválidos');
    try {
      await atualizarRegistroPonto(selectedRegistro.id, selectedRegistro.tipoPonto, novaData, usuarioAtual);
      Alert.alert('Sucesso', 'Registro atualizado com sucesso');
      setModalVisible(false);
      carregarUltimoRegistro();
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      Alert.alert('Erro', 'Falha ao atualizar registro');
    }
  };

  // --- Câmera integrada ---
  if (cameraVisible) {
    if (!permission) {
      return <View style={styles.container}><Text>Carregando câmera...</Text></View>;
    }
    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text>Permissão para usar a câmera é necessária.</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Conceder permissão</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center' }}>
        {photoPreview ? (
          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: photoPreview.uri }} style={{ width: 300, height: 400, borderRadius: 10 }} />
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity onPress={tirarNovaFoto} style={{ backgroundColor: 'orange', padding: 15, borderRadius: 10, marginRight: 10 }}>
                <Text style={{ color: '#fff' }}>Tirar nova foto</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={salvarFoto} style={{ backgroundColor: 'green', padding: 15, borderRadius: 10 }}>
                <Text style={{ color: '#fff' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
            <TouchableOpacity onPress={tirarFoto} style={{ backgroundColor: '#fff', padding: 20, borderRadius: 50, alignSelf: 'center', position: 'absolute', bottom: 40 }}>
              <Text>📸</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  // --- Renderização principal ---
  const ordem = ['CHEGADA', 'ALMOCO', 'TERMINO_ALMOCO', 'SAIDA'];
  const labels = {
    CHEGADA: 'Registrar Chegada',
    ALMOCO: 'Registrar Almoço',
    TERMINO_ALMOCO: 'Registrar Término Almoço',
    SAIDA: 'Registrar Saída'
  };
  const proximoLabel = (() => {
    if (!ultimoRegistro) return labels.CHEGADA;
    const idx = ordem.indexOf(ultimoRegistro.tipoPonto);
    if (idx >= 0 && idx < ordem.length - 1) return labels[ordem[idx + 1]];
    if (idx === ordem.length - 1) return 'Jornada finalizada';
    return labels.CHEGADA;
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Ponto</Text>

      {isAdmin && (
        <View style={styles.selecionarUsuarioContainer}>
          <Text style={styles.selectedUserText}>
            Usuário selecionado: {selectedUsuario?.nome || 'Nenhum'}
          </Text>
          <TouchableOpacity style={styles.selecionarUsuarioButton} onPress={() => setSelecionarUsuarioVisible(true)}>
            <Text style={styles.selecionarUsuarioButtonText}>Selecionar Usuário</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.info}>Data: {data}</Text>
      <Text style={styles.info}>Hora: {hora}</Text>

      <View style={styles.ultimoRegistro}>
        <Text style={styles.ultimoRegistroTitle}>Registros de Hoje:</Text>
        <Text style={styles.usuarioInfo}>
          Colaborador: {selectedUsuario?.nome || usuarioAtual?.nome || 'Não identificado'}
        </Text>

        {registrosHoje.length === 0 ? (
          <Text style={styles.ultimoRegistroInfo}>Nenhum registro hoje.</Text>
        ) : (
          registrosHoje.map((r, i) => {
            const dataObj = r.data?.toDate?.() || new Date(r.data);
            return (
              <View key={`${r.tipoPonto}_${dataObj.getTime()}_${i}`} style={styles.registroContainer}>
                <Text style={styles.ultimoRegistroInfo}>{r.tipoPonto} - {dataObj.toLocaleTimeString()}</Text>
                {isAdmin && (
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEditarRegistro(r)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>

      {localizacao && (
        <Text style={styles.info}>
          Localização: {localizacao.latitude.toFixed(5)}, {localizacao.longitude.toFixed(5)}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} disabled={isRegistering} onPress={registrarPontoFunc}>
          <Text style={styles.buttonText}>{proximoLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal editar registro */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Registro</Text>
            <Text style={styles.modalSubtitle}>{selectedRegistro?.tipoPonto}</Text>
            <TextInput style={styles.modalInput} value={novaData} onChangeText={setNovaData} placeholder="YYYY-MM-DDTHH:mm" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} onPress={salvarEdicao}>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal selecionar usuário */}
      <Modal transparent visible={selecionarUsuarioVisible} animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Selecionar Usuário</Text>
            <ScrollView style={styles.usuariosScrollView}>
              {usuariosList.map(usuario => (
                <TouchableOpacity key={usuario.id} style={styles.usuarioItem} onPress={() => handleSelectUsuario(usuario)}>
                  <Text style={styles.usuarioNome}>{usuario.nome}</Text>
                  <Text style={styles.usuarioFuncao}>{usuario.funcao}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setSelecionarUsuarioVisible(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
