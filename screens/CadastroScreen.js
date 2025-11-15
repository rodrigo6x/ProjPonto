import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  Platform, 
  BackHandler, 
  Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { inserirUsuario, atualizarUsuario } from '../db/database';
import styles from '../Style/CadastroScreenStyle';

export default function CadastroScreen({ navigation, route }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    matricula: '',
    filialMatriz: 'Filial',
    turno: 'Manhã',
    funcao: 'RH',
  });

  const [modoEdicao, setModoEdicao] = useState(false);

  // --- Ao entrar na tela ---
  useEffect(() => {
    const usuarioParaEditar = route?.params?.usuarioParaEditar;
    const editando = route?.params?.modoEdicao;

    if (usuarioParaEditar && editando) {
      setForm({
        nome: usuarioParaEditar.nome || '',
        email: usuarioParaEditar.email || '',
        cpf: String(usuarioParaEditar.cpf || ''),
        matricula: String(usuarioParaEditar.matricula || ''),
        funcao: usuarioParaEditar.funcao || 'RH',
        filialMatriz: usuarioParaEditar.filialMatriz || 'Filial',
        turno: usuarioParaEditar.turno || 'Manhã',
      });

      setModoEdicao(true);
    }
  }, [route?.params]);

  // --- Bloqueia o botão físico "Voltar" se estiver editando ---
  useEffect(() => {
    if (!modoEdicao) return;
    const onBackPress = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [modoEdicao]);

  // --- Manipuladores de entrada ---
  const handleChange = (key, value) => {
    if (key === 'nome' || key === 'funcao') {
      value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase();
    } else if (key === 'cpf') {
      value = value.replace(/[^0-9]/g, '');
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // --- Validação simples ---
  const validarCampos = () => {
    const { nome, email, cpf, funcao, filialMatriz, turno } = form;
    if (!nome.trim()) return 'Por favor, preencha o nome!';
    if (!email.trim()) return 'Por favor, preencha o e-mail!';
    if (!cpf.trim()) return 'Por favor, preencha o CPF!';
    if (!funcao.trim()) return 'Por favor, selecione uma função!';
    if (!filialMatriz.trim()) return 'Por favor, selecione Filial ou Matriz!';
    if (!turno.trim()) return 'Por favor, selecione um turno!';
    return null;
  };

  // --- Enviar dados ---
  const enviarDados = async () => {
    const erro = validarCampos();
    if (erro) {
      Alert.alert('Atenção', erro);
      return;
    }

    try {
      const usuarioLogado = route?.params?.usuario;

      if (modoEdicao) {
        // ✔ Atualização correta (matrícula é o ID)
        await atualizarUsuario(
          form.matricula,
          form.nome,
          form.email,
          form.funcao,
          form.cpf,
          form.filialMatriz,
          form.turno
        );

        Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      } else {
        // ✔ Cadastro usando matrícula gerada automaticamente NO BANCO
        await inserirUsuario(
          form.nome,
          form.email,
          form.funcao,
          form.cpf,
          form.filialMatriz,
          form.turno
        );

        Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      }

      navigation.navigate('Home', { usuario: usuarioLogado });

    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      Alert.alert('Erro', `Falha ao salvar usuário: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            
            <Text style={styles.label}>Nome:</Text>
            <TextInput
              style={styles.input}
              value={form.nome}
              onChangeText={(v) => handleChange('nome', v)}
              placeholder="Digite seu nome"
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(v) => handleChange('email', v)}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
            />

            <Text style={styles.label}>CPF:</Text>
            <TextInput
              style={styles.input}
              value={form.cpf}
              onChangeText={(v) => handleChange('cpf', v)}
              placeholder="Digite seu CPF"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Função:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.funcao}
                onValueChange={(v) => handleChange('funcao', v)}
                mode="dropdown"
              >
                <Picker.Item label="RH" value="RH" />
                <Picker.Item label="Funcionário" value="Funcionario" />
              </Picker>
            </View>

            {modoEdicao && (
              <>
                <Text style={styles.label}>Matrícula:</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={form.matricula}
                  editable={false}
                />
              </>
            )}

            <Text style={styles.label}>Filial / Matriz:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.filialMatriz}
                onValueChange={(v) => handleChange('filialMatriz', v)}
                mode="dropdown"
              >
                <Picker.Item label="Filial" value="Filial" />
                <Picker.Item label="Matriz" value="Matriz" />
              </Picker>
            </View>

            <Text style={styles.label}>Turno:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.turno}
                onValueChange={(v) => handleChange('turno', v)}
                mode="dropdown"
              >
                <Picker.Item label="Manhã" value="Manhã" />
                <Picker.Item label="Tarde" value="Tarde" />
              </Picker>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoVoltar]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.textoBotao}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botao, styles.botaoConfirmar]}
                onPress={enviarDados}
              >
                <Text style={styles.textoBotao}>
                  {modoEdicao ? 'Atualizar' : 'Cadastrar'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
