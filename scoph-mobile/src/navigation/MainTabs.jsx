// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\navigation\MainTabs.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import DashboardScreen from "../features/dashboard/screens/DashboardScreen.jsx";
import UsersScreen from "../features/users/screens/UsersScreen.jsx";
import WorkdaysScreen from "../features/workdays/screens/WorkdaysScreen.jsx";
import InventoryScreen from "../features/inventory/screens/InventoryScreen.jsx";
import CatalogScreen from "../features/inventory/screens/CatalogScreen.jsx";
import CentralInventoryScreen from "../features/inventory/screens/CentralInventoryScreen.jsx";
import MovementsScreen from "../features/inventory/screens/MovementsScreen.jsx";
import ReportsScreen from "../features/reports/screens/ReportsScreen.jsx";
import ProfileScreen from "../features/profile/screens/ProfileScreen.jsx";
import { COLORS } from "../shared/constants/theme.js";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const InventoryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryHome" component={InventoryScreen} />
      <Stack.Screen name="Catalog" component={CatalogScreen} />
      <Stack.Screen name="CentralInventory" component={CentralInventoryScreen} />
      <Stack.Screen name="Movements" component={MovementsScreen} />
    </Stack.Navigator>
  );
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = "home";
          } else if (route.name === "Users") {
            iconName = "people";
          } else if (route.name === "Workdays") {
            iconName = "calendar-today";
          } else if (route.name === "Inventory") {
            iconName = "inventory-2";
          } else if (route.name === "Reports") {
            iconName = "assessment";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingTop: 8,
        },
        headerShown: route.name === "Profile",
      })}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = "home";
          } else if (route.name === "Users") {
            iconName = "people";
          } else if (route.name === "Workdays") {
            iconName = "calendar-today";
          } else if (route.name === "Inventory") {
            iconName = "inventory-2";
          } else if (route.name === "Reports") {
            iconName = "assessment";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingTop: 8,
        },
        headerShown: route.name === "Profile",
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{ title: "Usuarios" }}
      />
      <Tab.Screen
        name="Workdays"
        component={WorkdaysScreen}
        options={{ title: "Jornadas" }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryStack}
        options={{ title: "Inventario" }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: "Reportes" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
