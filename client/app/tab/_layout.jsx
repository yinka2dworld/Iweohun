import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AudioPlayer from '../screens/AudioPlayer';
import Home from './home';
import Profile from './profile';
import TopChart from './topChart';
import Library from './library';
import { useAppTheme } from '../themeContext'; 

const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const theme = useAppTheme();

  return (
    <NavigationContainer independent={true} >
     
      <Tab.Navigator s
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Profile':
                iconName = focused ? 'account' : 'account-outline';
                break;
              case 'Library':
                iconName = focused ? 'bookshelf' : 'bookshelf'; // Updated icon to bookshelf
                break;
              case 'TopChart':
                iconName = focused ? 'chart-line' : 'chart-line';
                break;
              default:
                iconName = 'information-outline';
                break;
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ff1493',
          tabBarInactiveTintColor: '#a6a6a6',
          tabBarIconSize: 40, 
          headerTitleStyle: {
            color: '#ff1493', 
          },
          tabBarStyle: {
            backgroundColor: theme.background, 
          },
        })}
      >
        <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Tab.Screen name="Library" component={Library} options={{ headerShown: false }} />
        <Tab.Screen name="TopChart" component={TopChart} options={{ headerShown: false }}/>
        <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      </Tab.Navigator>
      {/* <AudioPlayer />  */}
    </NavigationContainer>
  );
}

export default MainTabNavigator;