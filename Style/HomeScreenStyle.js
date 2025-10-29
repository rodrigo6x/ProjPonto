import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c2520ff',
    padding: 20,
  },
  title: {
    fontSize: 29,
    fontFamily:'sans-serif-condensed',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily:'sans-serif-condensed',
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#373b41ff',
    borderBottomWidth:4, //Detalhe em baixo da limha do botão
    borderBottomColor: '#1a1818ff',//cor da limha do botão
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 19,
    width: 250,
  },
  buttonText: {
    fontFamily: 'sans-serif-condensed',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- Estilo novo para o botão de sair ---
  logoutButton: {
    backgroundColor: '#573030ff', // Um tom de vermelho para diferenciar
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 12,
    fontSize: 20,
    paddingTop: 4
  },
  welcomeName: {
    color: '#fff',
    fontFamily:'sans-serif-condensed',
    fontSize: 14,
    opacity: 0.95
  }
});
export default styles;
