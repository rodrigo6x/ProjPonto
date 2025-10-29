import { StyleSheet } from 'react-native';

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#425249ff',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    botaoCadastrar:{
        backgroundColor: '#373b41ff',
        marginBottom: 10,
        paddingVertical: 11,
        borderBottomWidth:4, //Detalhe em baixo da limha do botão
        borderBottomColor: '#302a2aff',//cor da limha do botão
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
    // --- Estilo para o campo de busca ---
    inputBusca: {
        height: 45,
        borderColor: '#ccc',
        borderBottomWidth:4, //Detalhe em baixo da limha do botão
        borderBottomColor: '#b9b1b1ff',//cor da limha do botão
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
    // --- Estilo genérico para os outros textos ---
    infoText: {
        fontSize: 16,
        fontFamily: 'sans-serif-condensed',
        color: '#666',
        marginBottom: 3
    },
    // Removi os estilos 'email' e 'telefone' que não estavam sendo usados
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
        backgroundColor: '#a12323ff', // Um tom de vermelho para diferenciar
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
    }
});
export default styles;