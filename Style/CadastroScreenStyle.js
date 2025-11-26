import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: 55, 
    padding: 20, 
    justifyContent: 'center' 
  },
  label: { 
    fontSize: 18, 
    marginBottom: 5 
  },
  input: {
    fontFamily: 'sans-serif-condensed',
    backgroundColor: '#c0bdbdff',
    borderBottomWidth:3, 
    borderBottomColor: '#252424ff',
    borderWidth: 1,
    borderColor: '#676774ff',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5
  },
  pickerContainer: {
    fontFamily: 'sans-serif-condensed',
    backgroundColor: '#c0bdbdff',
    borderBottomWidth:3,
    borderBottomColor: '#645a5aff',
    borderWidth: 1,
    borderColor: '#676774ff',
    borderRadius: 5,
    marginBottom: 20,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
},
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
},
  botaoVoltar: {
    backgroundColor: '#373b41',
},
  botaoConfirmar: {
    backgroundColor: '#2c6448ff',
    
},
  textoBotao: {
    color: '#fff',
    fontFamily: 'sans-serif-condensed',
    fontSize: 16,
    fontWeight: 'bold',
},

});
export default styles;