// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\navigation\MainTabs.jsx
import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING } from '../shared/constants/theme.js';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen.jsx';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen.jsx';
import { LogoutScreen } from '../features/profile/screens/LogoutScreen.jsx';
import { UsersScreen } from '../features/users/screens/UsersScreen.jsx';
import { JornadasScreen } from '../features/jornadas/screens/JornadasScreen.jsx';
import { CatalogScreen } from '../features/inventory/screens/CatalogScreen.jsx';
import { InventarioCentralScreen } from '../features/inventory/screens/InventarioCentralScreen.jsx';
import { MovimientosScreen } from '../features/inventory/screens/MovimientosScreen.jsx';
import { ReportsScreen } from '../features/reports/screens/ReportsScreen.jsx';
import { InventoryTabMenu } from './InventoryTabMenu.jsx';
import { useAuthStore } from '../shared/store/authStore.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Perfil' }} />
      <Stack.Screen name="Logout" component={LogoutScreen} options={{ headerShown: true, title: 'Cerrar sesión' }} />
    </Stack.Navigator>
  );
}

function UsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UsersMain" component={UsersScreen} />
    </Stack.Navigator>
  );
}

function JornadasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JornadasMain" component={JornadasScreen} />
    </Stack.Navigator>
  );
}

function InventoryScreenBridge() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Catalogo" component={CatalogScreen} />
      <Stack.Screen name="InventarioCentral" component={InventarioCentralScreen} />
      <Stack.Screen name="Movimientos" component={MovimientosScreen} />
    </Stack.Navigator>
  );
}

function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportsMain" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

export function MainTabs() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.rol === 'ADMIN';
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const tabNavigationRef = useRef(null);

  const handleInventoryTabPress = () => {
    setInventoryExpanded(true);
  };

  const handleSelectInventoryOption = (route) => {
    setInventoryExpanded(false);

    // Navegar al stack del inventario
    if (tabNavigationRef.current) {
      tabNavigationRef.current.navigate('Inventario', {
        screen: route
      });
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarStyle: {
            backgroundColor: '#f27405',
            height: 70,
            borderTopColor: '#d97236',
            paddingBottom: 10,
            paddingTop: 8
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4
          },
          tabBarIcon: ({ color, size }) => {
            let iconName = 'home';

            switch (route.name) {
              case 'Dashboard':
                iconName = 'home';
                break;
              case 'Usuarios':
                iconName = 'people';
                break;
              case 'Jornadas':
                iconName = 'calendar-today';
                break;
              case 'Inventario':
                iconName = 'inventory';
                break;
              case 'Reportes':
                iconName = 'description';
                break;
            }

            return <MaterialIcons name={iconName} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardStack}
          options={{ title: 'Inicio' }}
        />
        {isAdmin && (
          <Tab.Screen 
            name="Usuarios" 
            component={UsersStack}
            options={{ title: 'Usuarios' }}
          />
        )}
        <Tab.Screen 
          name="Jornadas" 
          component={JornadasStack}
          options={{ title: 'Jornadas' }}
        />
        <Tab.Screen 
          name="Inventario"
          component={InventoryScreenBridge}
          options={{ title: 'Inventario' }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Guardar la referencia de navegación
              tabNavigationRef.current = navigation;
              // Si el menú ya está expandido, permitir navegación normal
              if (inventoryExpanded) {
                setInventoryExpanded(false);
              } else {
                // Si no está expandido, abrir el menú
                e.preventDefault();
                handleInventoryTabPress();
              }
            }
          })}
        />
        {isAdmin && (
          <Tab.Screen 
            name="Reportes" 
            component={ReportsStack} 
            options={{ title: 'Reportes' }}
          />
        )}
      </Tab.Navigator>

      <InventoryTabMenu
        expanded={inventoryExpanded}
        onToggle={() => setInventoryExpanded(!inventoryExpanded)}
        onSelectOption={handleSelectInventoryOption}
        userRole={user?.rol}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  screenText: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.text,
    fontWeight: '700'
  }
});
