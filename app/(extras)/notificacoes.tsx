import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

const DEVICE_ID_KEY = "device_id";

export default function Notificacoes() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Inativo");

  useEffect(() => {
    carregarEstadoInicial();
  }, []);

  async function carregarEstadoInicial() {
    try {
      const savedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (savedDeviceId) {
        setDeviceId(savedDeviceId);
      }

      setStatusText("Inativo");
      setExpoPushToken(null);
    } catch (err) {
      console.log(err);
    }
  }

  async function ativarNotificacoes() {
    try {
      setLoading(true);
      setStatusText("Ativando...");

      const permission = await Notifications.requestPermissionsAsync();

      if (permission.status !== "granted") {
        setStatusText("Permissão negada");
        Alert.alert("Permissão negada");
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        (Constants as any)?.easConfig?.projectId;

      if (!projectId) {
        throw new Error("Project ID do EAS não encontrado.");
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const token = tokenData.data;

      if (!token) {
        throw new Error("Não foi possível gerar o token.");
      }

      let savedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!savedDeviceId) {
        savedDeviceId =
          Platform.OS +
          "-" +
          Date.now() +
          "-" +
          Math.random().toString(36).substring(2, 8);

        await AsyncStorage.setItem(DEVICE_ID_KEY, savedDeviceId);
      }

      setDeviceId(savedDeviceId);

      const { error } = await supabase.from("push_tokens").upsert(
        [
          {
            token,
            device_id: savedDeviceId,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "token" }
      );

      if (error) {
        throw error;
      }

      setExpoPushToken(token);
      setStatusText("Ativo");
      Alert.alert("Sucesso", "Notificações ativadas com sucesso.");
    } catch (err: any) {
      console.log(err);
      setStatusText("Erro");
      setExpoPushToken(null);
      Alert.alert("Erro", err.message || "Erro ao registrar token");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Notificações</Text>

      <Text style={styles.subtitle}>
        Ative as notificações para receber avisos, cultos e novidades da igreja.
      </Text>

      <Pressable
        style={[
          styles.button,
          loading && styles.buttonDisabled,
          statusText === "Ativo" && styles.buttonActive,
        ]}
        onPress={ativarNotificacoes}
        disabled={loading || statusText === "Ativo"}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {statusText === "Ativo"
              ? "Notificações ativadas"
              : "Ativar notificações"}
          </Text>
        )}
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.label}>Device ID</Text>
        <Text style={styles.value}>{deviceId || "Ainda não gerado"}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{statusText}</Text>

        <Text style={styles.label}>Seu token:</Text>
        <Text style={styles.value}>
          {expoPushToken || "Ainda não registrado"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#065f46",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonActive: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    color: "#374151",
  },
});
