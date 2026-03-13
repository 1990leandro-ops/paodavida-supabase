import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";

export async function registrarPushToken(userId: string, igrejaId: string) {
  try {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return null;

    const token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    await supabase.from("push_tokens").upsert(
      {
        user_id: userId,
        igreja_id: igrejaId,
        token,
      },
      { onConflict: "token" }
    );

    return token;
  } catch (error) {
    console.log("Erro ao registrar push token:", error);
    return null;
  }
}
