import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  // Android: cria canal (obrigatório p/ várias configs)
  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });

  if (!Device.isDevice) {
    return { token: null, error: "Use um celular físico (não emulador)" };
  }

  try {
    // Permissões (Android 13+ precisa pedir)
    const perm = await Notifications.getPermissionsAsync();
    let status = perm.status;

    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }

    if (status !== "granted") {
      return { token: null, error: "Permissão de notificação NEGADA" };
    }

    // 🔥 ProjectId fixo (sem depender de Constants)
    const projectId = "4c8e7f38-bcf1-4132-b698-32ccad1125b5";

    const res = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: res.data, error: null };
  } catch (e) {
    return { token: null, error: String(e?.message || e) };
  }
}
