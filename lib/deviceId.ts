import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getDeviceId() {
  let id = await AsyncStorage.getItem("device_id");

  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    await AsyncStorage.setItem("device_id", id);
  }

  return id;
}
