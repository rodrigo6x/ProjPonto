import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1c2520ff' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold',fontFamily: 'sans-serif-condensed', color: 'white', textAlign: 'center', marginBottom: 12 },
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
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: { 
    fontSize: 16,
    color:'white',
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
    backgroundColor: '#9e9e9aff', // verde igual ao confirmar (ou mude se quiser)
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
    alignItems: 'center' 
  },
  tipo: { 
    fontSize: 16,
    fontWeight: 'bold' 
  },
  hora: {
    fontSize: 14, 
    color: '#555'
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
    color: '#666' 
  },
  error: {
    color: 'red',
    textAlign: 'center',
     marginTop: 8 
    }
});
export default styles;