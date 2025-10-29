import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#1c2520ff'
  },
  title: { 
    fontSize: 27,
    fontFamily: 'sans-serif-condensed', 
    fontWeight: 'bold', 
    marginBottom: 29,
    color: '#fffefeff'
  },
  info: { 
    fontSize: 16,
    fontFamily: 'sans-serif-condensed', 
    marginBottom: 14,
    color: '#d6d2d2ff'
  },
  ultimoRegistro: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    fontFamily: 'sans-serif-condensed',
    borderRadius: 8,
    marginVertical: 18,
    borderLeftWidth: 9,
    borderLeftColor: '#759786ff',
    width: '100%'
  },
  ultimoRegistroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c6448ff',
    fontFamily: 'sans-serif-condensed',
    marginBottom: 5
  },
  ultimoRegistroInfo: {
    fontSize: 14,
    ontFamily: 'sans-serif-condensed',
    color: '#0e0d0dff',
    flex: 1
  },
  usuarioInfo: {
    fontSize: 17,
    fontFamily: 'sans-serif-condensed',
    color: '#466d5aff',
    marginBottom: 8
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },

  /* 🟢 NOVOS ESTILOS PARA OS BOTÕES (TouchableOpacity) */
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 6,

  },
  buttonPrimary: {
    backgroundColor: '#1d6943ff', // 🔵 Botão "Registrar"
  },
  buttonSecondary: {
    backgroundColor: '#6d7277ff', // 🔴 Botão "Voltar"
  },

  buttonText: {
    color: '#fff',
    fontFamily:'sans-serif-condensed',
    fontWeight: 'bold',
    fontSize: 16,
  },

  registroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#0d0d0eff',
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
    color: '#ddd6d6ff',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#d8d7d7ff',
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
    fontFamily: 'sans-serif-condensed',
    color: '#ccc9c9ff',
    marginBottom: 5,
  },
  selecionarUsuarioButton: {
    backgroundColor: '#6d7277ff',
    paddingHorizontal: 25,
    paddingVertical: 7,
    borderRadius: 4,
  },
  selecionarUsuarioButtonText: {
    color: '#fff',
    fontFamily:'sans-serif-condensed',
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
export default styles;