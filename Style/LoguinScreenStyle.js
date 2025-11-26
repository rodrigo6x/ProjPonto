import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1c2520ff',
  },
  icon: {
    fontSize: 90, 
    color: '#466d5aff', 
    alignSelf: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-condensed',
    color: '#fff', 
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
    borderBottomWidth:4, 
    borderBottomColor: '#1a1818ff',
    backgroundColor: '#4d5055ff',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 17,
    marginBottom: 15,
  },
  
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
   borderBottomWidth:4, 
    borderBottomColor: '#223a25ff',
    backgroundColor: '#2c6448ff', 
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