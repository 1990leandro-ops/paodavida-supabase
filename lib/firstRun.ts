import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const KEY = "PDV_FIRST_RUN_DONE";

export async function enforceLogoutOnFirstInstall() {
  try {
    const done = await AsyncStorage.getItem(KEY);

    // Primeira vez que roda neste aparelho (nesta instalação)
    if (!done) {
      await supabase.auth.signOut(); // remove qualquer sessão antiga
      await AsyncStorage.setItem(KEY, "1");
    }
  } catch (e) {
    // se falhar, não quebra o app
    console.log("[FIRST_RUN] erro:", e);
  }
}
