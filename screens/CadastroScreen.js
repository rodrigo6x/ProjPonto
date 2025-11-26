import React, { useState, useEffect } from 'react';
import { 
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { inserirUsuario, atualizarUsuario } from '../db/database';
import styles from '../Style/CadastroScreenStyle';

// --- Validação de CPF ---
function validarCPF(cpf) {
  cpf = String(cpf).replace(/[^\d]+/g, '');
  if (cpf === '') return false;
  // Elimina CPFs invalidos conhecidos
  if (
    cpf.length !== 11 ||
    /^(.)\1+$/.test(cpf) // Verifica se todos os dígitos são iguais
  ) {
    return false;
  }
  // Valida 1o digito
  let add = 0;
  for (let i = 0; i < 9; i++) {
    add += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) {
    rev = 0;
  }
  if (rev !== parseInt(cpf.charAt(9))) {
    return false;
  }
  // Valida 2o digito
  add = 0;
  for (let i = 0; i < 10; i++) {
    add += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) {
    rev = 0;
  }
  if (rev !== parseInt(cpf.charAt(10))) {
    return false;
  }
  return true;
}

const formatarCPF = (value) => {
  return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export default function CadastroScreen({ navigation, route }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    matricula: '',
    filialMatriz: 'Filial',
    turno: 'Manhã',
    sexo: 'Masculino', // Valor inicial para o novo campo
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
        sexo: usuarioParaEditar.sexo || 'Masculino', // Carrega o valor existente ou um padrão
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
      const apenasNumeros = value.replace(/[^0-9]/g, '');
      value = formatarCPF(apenasNumeros.substring(0, 14));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // --- Validação simples ---
  const validarCampos = () => {
    const { nome, email, cpf, funcao, filialMatriz, turno, sexo } = form;
    if (!nome.trim()) return 'Por favor, preencha o nome!';
    if (!email.trim()) return 'Por favor, preencha o e-mail!';
    if (!cpf.trim()) return 'Por favor, preencha o CPF!';
    if (!validarCPF(cpf)) return 'O CPF informado é inválido!';
    if (!funcao.trim()) return 'Por favor, selecione uma função!';
    if (!filialMatriz.trim()) return 'Por favor, selecione Filial ou Matriz!';
    if (!sexo.trim()) return 'Por favor, selecione o sexo!'; // Validação para o novo campo
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
          form.cpf.replace(/[^\d]+/g, ''), // Salva apenas números
          form.filialMatriz,
          form.turno,
          form.sexo // Passa o novo valor
        );

        Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      } else {
        // ✔ Cadastro usando matrícula gerada automaticamente NO BANCO
        await inserirUsuario(
          form.nome,
          form.email,
          form.funcao,
          form.cpf.replace(/[^\d]+/g, ''), // Salva apenas números
          form.filialMatriz,
          form.turno,
          form.sexo // Passa o novo valor
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
              style={[styles.input, { color: '#000' }]}
              value={form.nome}
              onChangeText={(v) => handleChange('nome', v)}
              placeholder="Digite seu nome"
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={[styles.input, { color: '#000' }]}
              value={form.email}
              onChangeText={(v) => handleChange('email', v)}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>CPF:</Text>
            <TextInput
              style={[styles.input, { color: '#000' }]}
              value={form.cpf}
              onChangeText={(v) => handleChange('cpf', v)}
              placeholder="Digite seu CPF"
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.label}>Função:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.funcao}
                onValueChange={(v) => handleChange('funcao', v)}
                mode="dropdown"
                style={{ color: '#000' }} // Adicionado para forçar a cor do texto
              >
                <Picker.Item label="RH" value="RH" />
                <Picker.Item label="Funcionário" value="Funcionario" />
              </Picker>
            </View>

            {modoEdicao && (
              <>
                <Text style={styles.label}>Matrícula:</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled, { color: '#555' }]}
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
                style={{ color: '#000' }} // Adicionado para forçar a cor do texto
              >
                <Picker.Item label="Filial" value="Filial" />
                <Picker.Item label="Matriz" value="Matriz" />
              </Picker>
            </View>

            <Text style={styles.label}>Sexo:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.sexo}
                onValueChange={(v) => handleChange('sexo', v)}
                mode="dropdown"
                style={{ color: '#000' }}
              >
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Feminino" value="Feminino" />
              </Picker>
            </View>

            <Text style={styles.label}>Turno:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.turno}
                onValueChange={(v) => handleChange('turno', v)}
                mode="dropdown"
                style={{ color: '#000' }} // Adicionado para forçar a cor do texto
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
