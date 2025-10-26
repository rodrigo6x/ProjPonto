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
    if (route?.params?.usuario && route?.params?.modoEdicao) {
      const usuario = route.params.usuario;
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
    // Matrícula foi removida da validação, pois é gerada auto
    if (!nome || !email || !funcao || !cpf || !filialMatriz || !turno) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    try {
      if (modoEdicao) {
        // Modo Edição: Usa a matrícula que já está no state (não altera)
        await atualizarUsuario(usuarioId, nome, email, funcao, cpf, matricula, filialMatriz, turno);
        alert('Usuário atualizado com sucesso!');
      } else {
        // Modo Cadastro: Gera uma nova matrícula ANTES de inserir
        const novaMatricula = gerarMatricula(); 
        
        await inserirUsuario(nome, email, funcao, cpf, novaMatricula, filialMatriz, turno);
        alert('Usuário cadastrado com sucesso!');
      }
      navigation.navigate('Home'); // Volta para o menu principal
    } catch (error) {
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
                selectedValue={funcao}
                onValueChange={(itemValue) => setFuncao(itemValue)}
                mode="dropdown"
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