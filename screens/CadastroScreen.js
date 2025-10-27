import React, { useState, useEffect } from 'react';
// Usamos SafeAreaView, ScrollView e KeyboardAvoidingView para permitir scroll e evitar teclado
import { SafeAreaView, KeyboardAvoidingView, ScrollView, View, Text, TextInput, Button, StyleSheet, Platform, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { inserirUsuario, atualizarUsuario } from '../db/database';

// --- FUNÇÃO PARA GERAR MATRÍCULA ---
// Gera 4 dígitos aleatórios (0000-9999) e 1 dígito (0-9)
function gerarMatricula() {
  // padStart(4, '0') garante que se o número for '12', ele vira '0012'
  const parte1 = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  const parte2 = String(Math.floor(Math.random() * 10));
  return `${parte1}-${parte2}`;
}

export default function CadastroScreen({ navigation, route }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [matricula, setMatricula] = useState(''); // Continua no state para modo de edição
  
  // Valores iniciais para os Pickers
  const [filialMatriz, setFilialMatriz] = useState('Filial'); 
  const [turno, setTurno] = useState('Manhã'); 
  const [funcao, setFuncao] = useState('RH'); // Valor inicial RH

  const [modoEdicao, setModoEdicao] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
      if (route?.params?.usuarioParaEditar && route?.params?.modoEdicao) {
        const usuario = route.params.usuarioParaEditar;
      setNome(usuario.nome);
      setEmail(usuario.email);
      setFuncao(usuario.funcao);
      setCpf(String(usuario.cpf)); // Garante que é string para o TextInput
      setMatricula(String(usuario.matricula)); // Garante que é string
      setFilialMatriz(usuario.filialMatriz || '');
      setTurno(usuario.turno || '');
      setUsuarioId(usuario.id);
      setModoEdicao(true);
    }
  }, [route?.params]);

  // Intercepta botão físico 'Voltar' no Android quando em modo de edição
  useEffect(() => {
    if (!modoEdicao) return; // só bloquear quando estiver editando

    const onBackPress = () => {
      // Retorna true para indicar que consumimos o evento e evitar sair
      // Você pode exibir um Alert confirmando se deseja cancelar a edição
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [modoEdicao]);

  const handleNomeChange = (text) => setNome(text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase());
  const handleFuncaoChange = (text) => setFuncao(text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').toUpperCase());
  const handleCpfChange = (text) => setCpf(text.replace(/[^0-9]/g, ''));
  // Função handleMatriculaChange removida, pois não é mais digitada

  const enviarDados = async () => {
    // Debug log para verificar os valores antes da validação
    console.log('Valores antes da validação:', {
      nome,
      email,
      funcao,
      cpf,
      filialMatriz,
      turno
    });

    // Validação mais robusta com mensagens específicas
    if (!nome?.trim()) {
      alert('Por favor, preencha o nome!');
      return;
    }
    if (!email?.trim()) {
      alert('Por favor, preencha o email!');
      return;
    }
    if (!funcao?.trim()) {
      alert('Por favor, selecione uma função!');
      return;
    }
    if (!cpf?.trim()) {
      alert('Por favor, preencha o CPF!');
      return;
    }
    if (!filialMatriz?.trim()) {
      alert('Por favor, selecione Filial ou Matriz!');
      return;
    }
    if (!turno?.trim()) {
      alert('Por favor, selecione um turno!');
      return;
    }

    try {
      // Guarda o usuário logado (admin) antes de qualquer operação
      const usuarioLogado = route?.params?.usuario;
      
      // Log do estado antes de tentar salvar
      console.log('Estado antes de salvar:', {
        modoEdicao,
        nome,
        email,
        funcao,
        cpf,
        matricula,
        filialMatriz,
        turno,
        usuarioId
      });

      if (modoEdicao) {
        // Modo Edição: Usa a matrícula que já está no state (não altera)
        console.log('Atualizando usuário existente...');
        await atualizarUsuario(usuarioId, nome, email, funcao, cpf, matricula, filialMatriz, turno);
        alert('Usuário atualizado com sucesso!');
      } else {
        // Modo Cadastro: Gera uma nova matrícula ANTES de inserir
        console.log('Cadastrando novo usuário...');
        const novaMatricula = gerarMatricula();
        console.log('Nova matrícula gerada:', novaMatricula);
        
        await inserirUsuario(nome, email, funcao, cpf, novaMatricula, filialMatriz, turno);
        alert('Usuário cadastrado com sucesso!');
      }
      
      // Sempre retorna para Home com o usuário original (admin)
      if (usuarioLogado) {
        navigation.navigate('Home', { usuario: usuarioLogado });
      } else {
        // Caso não tenha usuário logado (não deveria acontecer), volta para login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Erro completo:', error);
      console.error('Stack trace:', error.stack);
      alert(`Erro ao ${modoEdicao ? 'atualizar' : 'cadastrar'} usuário: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
  <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: Platform.OS === 'android' ? 110 : 40 }]} keyboardShouldPersistTaps='handled'>
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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={funcao || 'RH'}
                onValueChange={(itemValue) => {
                  console.log('Função anterior:', funcao);
                  console.log('Nova função selecionada:', itemValue);
                  if (itemValue && typeof itemValue === 'string') {
                    setFuncao(itemValue);
                  } else {
                    console.warn('Valor inválido recebido no Picker:', itemValue);
                    setFuncao('RH'); // Valor padrão caso receba um valor inválido
                  }
                }}
                mode="dropdown"
                enabled={true}
              >
                <Picker.Item label="RH" value="RH" />
                <Picker.Item label="Funcionário" value="Funcionario" />
              </Picker>
            </View>

            <Text style={styles.label}>CPF:</Text>
            <TextInput
              style={styles.input}
              value={cpf}
              onChangeText={handleCpfChange}
              placeholder="Digite seu CPF"
              keyboardType="numeric"
            />      

            {/* --- CAMPO MATRÍCULA MODIFICADO --- */}
            {/* Só mostra o campo Matrícula se estiver em modo de edição */}
            {modoEdicao && (
              <>
                <Text style={styles.label}>Matrícula:</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]} // Estilo de campo desabilitado
                  value={matricula}
                  editable={false} // Impede a edição
                />
              </>
            )}

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  container: { padding: 20 },
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
  // --- NOVO ESTILO ---
  inputDisabled: {
    backgroundColor: '#f0f0f0', // Um cinza claro para indicar que está desabilitado
    color: '#888',
  },
  // Removi o pickerContainer dos estilos
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20
  }
});