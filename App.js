import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CadastroScreen from './screens/CadastroScreen';
import ConsultaScreen from './screens/ConsultaScreen';
import ConsultaPontoScreen from './screens/ConsultaPontoScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PontoScreen from './screens/PontoScreen';
import { initDB } from './db/database';


const Stack = createNativeStackNavigator();

export default function App() {
  // Inicializa o banco de dados quando o app inicia
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await initDB();
        console.log('Banco de dados inicializado com sucesso!');
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
      }
    };
    
    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} //  aplica a todas as telas
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Consulta" component={ConsultaScreen} />
        <Stack.Screen name="ConsultaPonto" component={ConsultaPontoScreen} />
        <Stack.Screen name="Ponto" component={PontoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}