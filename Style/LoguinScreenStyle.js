import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1c2520ff', // Um fundo escuro pra combinar
  },
  icon: {
    fontSize: 90, // Tamanho do ícone
    color: '#466d5aff', // Um tom de verde mais suave
    alignSelf: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    color: '#fff', // cor do título
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,fontFamily: 'sans-serif-condensed',
    color: '#7b7e86ff',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    
    fontFamily: 'sans-serif-condensed',
    borderBottomWidth:4, //Detalhe em baixo da limha do botão
    borderBottomColor: '#1a1818ff',//cor da limha do botão
    backgroundColor: '#4d5055ff',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 17,
    marginBottom: 15,
  },
  // Novo container para o input de CPF com o ícone
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4d5055ff',
    borderRadius: 6,
    marginBottom: 15,
    borderBottomWidth:4,
    borderBottomColor: '#1a1818ff',
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  button: {  
   borderBottomWidth:4, //Detalhe em baixo da limha do botão
    borderBottomColor: '#223a25ff',//cor da limha do botão
    backgroundColor: '#2c6448ff', // Azul do seu menu
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontFamily: 'sans-serif-condensed',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
export default styles;