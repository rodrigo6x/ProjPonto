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
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login', headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Menu Principal', headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ title: 'Cadastrar Usuário' }}
        />
        <Stack.Screen
          name="Consulta"
          component={ConsultaScreen}
          options={{ title: 'Lista de Usuários' }}
        />
        <Stack.Screen
          name="ConsultaPonto"
          component={ConsultaPontoScreen}
          options={{ title: 'Consulta de Pontos' }}
        />
        <Stack.Screen
          name="Ponto"
          component={PontoScreen}
          options={{ title: 'Ponto Eletronico' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}