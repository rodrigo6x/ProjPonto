import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { inserirUsuario, atualizarUsuario } from '../db/database';

export default function CadastroScreen({ navigation, route }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [cpf, setCpf] = useState('');
  const [matricula, setMatricula] = useState('');
  const [filialMatriz, setFilialMatriz] = useState('Filial'); // valor inicial
  const [turno, setTurno] = useState('Manhã'); // valor inicial

  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    if (route?.params?.usuario && route?.params?.modoEdicao) {
      const usuario = route.params.usuario;
      setNome(usuario.nome);
      setEmail(usuario.email);
      setFuncao(usuario.funcao);
      setCpf(usuario.cpf);
      setMatricula(usuario.matricula);
      setFilialMatriz(usuario.filialMatriz || 'Filial');
      setTurno(usuario.turno || 'Manhã');
      setUsuarioId(usuario.id);
      setModoEdicao(true);
    }
  }, [route?.params]);

  const handleNomeChange = (text) => setNome(text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase());
  const handleFuncaoChange = (text) => setFuncao(text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase());
  const handleCpfChange = (text) => setCpf(text.replace(/[^0-9]/g, ''));
  const handleMatriculaChange = (text) => setMatricula(text.replace(/[^0-9]/g, ''));

  const enviarDados = async () => {
    if (!nome || !email || !funcao || !cpf || !matricula || !filialMatriz || !turno) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    try {
      if (modoEdicao) {
        await atualizarUsuario(usuarioId, nome, email, funcao, cpf, matricula, filialMatriz, turno);
        alert('Usuário atualizado com sucesso!');
      } else {
        await inserirUsuario(nome, email, funcao, cpf, matricula, filialMatriz, turno);
        alert('Usuário cadastrado com sucesso!');
      }
      navigation.navigate('Consulta');
    } catch (error) {
      alert(`Erro ao ${modoEdicao ? 'atualizar' : 'cadastrar'} usuário: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={handleNomeChange}
        placeholder="Digite seu nome"
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Digite seu email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Função:</Text>
      <TextInput
        style={styles.input}
        value={funcao}
        onChangeText={handleFuncaoChange}
        placeholder="Digite sua função"
      />

      <Text style={styles.label}>CPF:</Text>
      <TextInput
        style={styles.input}
        value={cpf}
        onChangeText={handleCpfChange}
        placeholder="Digite seu CPF"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Matrícula:</Text>
      <TextInput
        style={styles.input}
        value={matricula}
        onChangeText={handleMatriculaChange}
        placeholder="Digite sua matrícula"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Filial / Matriz:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={filialMatriz}
          onValueChange={(itemValue) => setFilialMatriz(itemValue)}
          mode="dropdown"
        >
          <Picker.Item label="Filial" value="Filial" />
          <Picker.Item label="Matriz" value="Matriz" />
        </Picker>
      </View>

      <Text style={styles.label}>Turno:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={turno}
          onValueChange={(itemValue) => setTurno(itemValue)}
          mode="dropdown"
        >
          <Picker.Item label="Manhã" value="Manhã" />
          <Picker.Item label="Tarde" value="Tarde" />
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
        <Button title={modoEdicao ? "Atualizar" : "Cadastrar"} onPress={enviarDados} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  }
});
