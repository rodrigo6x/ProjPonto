import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1c2520ff'
  },
  container: {
    marginTop: 100,
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12
  },
  userInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 9,
    borderLeftColor: '#759786ff',
  },
  userName: {
    fontSize: 16,
    color: '#325744ff',
    fontWeight: '500'
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#444446ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ece9e9ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: { // Versão final mantida
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: 'sans-serif-condensed'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  rowSmall: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },

  botaoHoje: {
    backgroundColor: '#9e9e9aff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  input: {
    flex: 1,
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: 'white'
  },
  list: {
    marginTop: 8
  },
  item: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Para alinhar Editar/Excluir
    elevation: 2, // Sombra para Android
  },
  tipo: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  hora: {
    fontSize: 14,
    color: '#555'
  },
  data: { // Adicionado 'data' para consistência (existia no JS, mas faltava no estilo)
    fontSize: 12,
    color: '#999'
  },
  usuario: {
    fontSize: 12,
    color: '#666'
  },
  local: {
    fontSize: 11,
    color: '#999'
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#fff' // Mudado para branco, devido ao fundo escuro
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8
  },
  // --- ESTILOS PARA O SELETOR RH (NOVO) ---
  selectContainer: {
    width: '100%', // Usa 100% da largura do container com padding 16
    marginVertical: 10,
    backgroundColor: '#f9f9f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  selectLabel: {
    fontSize: 14,
    color: '#000000ff',
    paddingLeft: 5,
    paddingTop: 5,
  },
  picker: {
    height: 55,
    width: '100%',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
  },
  // --- Estilo para o botão flutuante de voltar ---
  botaoVoltarFlutuante: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2c6448ff', // Cor primária verde
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
    right: 20,
    elevation: 8, // Sombra para Android
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
  

});
export default styles;