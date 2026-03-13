import React, { useEffect, useState } from "react";
import { View, Text, Button, Platform } from "react-native";
import { registerForPushNotificationsAsync } from "./services/notifications";

export default function App() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function gerar() {
    setError("");
    setToken("");

    const { token, error } = await registerForPushNotificationsAsync();

    if (error) setError(error);
    if (token) setToken(token);
  }

  useEffect(() => {
    gerar();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Notificações</Text>

      <Text style={{ marginBottom: 6 }}>Plataforma: {Platform.OS}</Text>

      <Text style={{ fontWeight: "bold", marginTop: 10 }}>Token:</Text>
      <Text selectable style={{ marginBottom: 12 }}>
        {token ? token : "(ainda não gerou)"}
      </Text>

      <Text style={{ fontWeight: "bold" }}>Erro:</Text>
      <Text selectable style={{ marginBottom: 20 }}>
        {error ? error : "(sem erro)"}
      </Text>

      <Button title="Gerar Token Agora" onPress={gerar} />
    </View>
  );
}
