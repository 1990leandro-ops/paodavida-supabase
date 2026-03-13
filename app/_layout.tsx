import { useEffect } from "react";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { registrarPushToken } from "@/lib/pushNotifications";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";
import { supabase } from "@/lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    async function iniciarPush() {
      try {
        const token = await registrarPushToken();
        if (!token) return;

        const igreja = await obterIgrejaSelecionada();

        await supabase.from("push_tokens").upsert(
          {
            token,
            igreja_id: igreja?.id ?? null,
          },
          {
            onConflict: "token",
          }
        );
      } catch (error) {
        console.log("Erro ao registrar push token:", error);
      }
    }

    iniciarPush();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="membros" />
      <Stack.Screen name="master" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
