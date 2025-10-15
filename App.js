import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CadastroScreen from './screens/CadastroScreen';
import ConsultaScreen from './screens/ConsultaScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PontoScreen from './screens/PontoScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
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
          name="Ponto"
          component={PontoScreen}
          options={{ title: 'Ponto Eletronico' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}