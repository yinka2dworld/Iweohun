import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './splashScreen';
import Login from './auth/login';
import Signup from './auth/signup';
import MainTabNavigator from './tab/_layout';
// import { ApolloProvider } from '@apollo/client';
// import client from './apolloClient'; // Ensure this path is correct

const Stack = createNativeStackNavigator();

const AppLayout = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }} // Hides the header for tab navigator
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const App = () => (
  // <ApolloProvider client={client}>
      <AppLayout />
  // </ApolloProvider>
);

registerRootComponent(App);
