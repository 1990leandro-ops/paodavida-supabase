import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('Use um dispositivo físico');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permissão de notificação negada');
    return;
  }

  const projectId = Constants.expoConfig.extra.eas.projectId;

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId,
  })).data;

  console.log('TOKEN:', token);
  return token;
}
