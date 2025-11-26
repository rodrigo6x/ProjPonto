import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#425249ff', 
    },
    container: {
        flex: 1,
        padding: 20,
    },
    botaoCadastrar:{
        backgroundColor: '#373b41ff',
        marginBottom: 10,
        paddingVertical: 11,
        borderBottomWidth:4, 
        borderBottomColor: '#302a2aff',
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10
    },
    textoBotaoCadastro: {
        fontFamily: 'sans-serif-condensed',
        color: '#f5f3f3ff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    titulo: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'sans-serif-condensed',
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        marginTop: 20
    },
   
    inputBusca: {
        height: 45,
        borderColor: '#ccc',
        borderBottomWidth:4, 
        borderBottomColor: '#b9b1b1ff',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: 'white',
        fontSize: 16
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    infoContainer: {
        flex: 1
    },
    nome: {
        fontSize: 18,
        fontFamily: 'sans-serif-condensed',
        fontWeight: 'bold',
        marginBottom: 5
    },

    infoText: {
        fontSize: 16,
        fontFamily: 'sans-serif-condensed',
        color: '#666',
        marginBottom: 3
    },

    buttonContainer: {
        flexDirection: 'row',
        gap: 10
    },
    editButton: {
        backgroundColor: '#2c6448ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5
    },
    deleteButton: {
        backgroundColor: '#a12323ff', 
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 5
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20
    },
    flatList: {
        marginTop: 20
    },
    botaoVoltarFlutuante: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2c6448ff', 
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 30,
    right: 20,
    elevation: 8, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
  
});
export default styles;