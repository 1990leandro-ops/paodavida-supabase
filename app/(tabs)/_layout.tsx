import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#065f46",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          height: 78,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>🏠</Text>,
        }}
      />

      <Tabs.Screen
        name="avisos"
        options={{
          title: "Avisos",
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>📢</Text>,
        }}
      />

      <Tabs.Screen
        name="biblia"
        options={{
          title: "Bíblia",
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>📖</Text>,
        }}
      />

      <Tabs.Screen
        name="dizimos"
        options={{
          title: "Contrib.",
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>💼</Text>,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>👤</Text>,
        }}
      />

      <Tabs.Screen
        name="devocional"
        options={{
          title: "Devocional",
          href: null,
        }}
      />

      <Tabs.Screen
        name="oracao"
        options={{
          title: "Oração",
          href: null,
        }}
      />

      <Tabs.Screen
        name="emocoes"
        options={{
          title: "Emoções",
          href: null,
        }}
      />

      <Tabs.Screen
        name="galeria"
        options={{
          title: "Galeria",
          href: null,
        }}
      />

      <Tabs.Screen
        name="versiculo"
        options={{
          title: "Versículo",
          href: null,
        }}
      />
    </Tabs>
  );
}
