import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "device_id_v1";

function simpleId() {
  return "dev_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export async function getDeviceId() {
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = simpleId();
    await AsyncStorage.setItem(KEY, id);
  }
  return id;
}
