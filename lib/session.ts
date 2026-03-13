import * as SecureStore from "expo-secure-store";
import { supabase } from "./supabase";

const KEY = "session_v1";

export async function saveSession(session: any) {
  // salva só o access_token (curto). Evita erro de limite.
  if (session?.access_token) {
    await SecureStore.setItemAsync(KEY, session.access_token);
  }
}

export async function loadSession() {
  const access_token = await SecureStore.getItemAsync(KEY);
  if (!access_token) return null;

  // tenta validar token e recuperar usuário
  const { data, error } = await supabase.auth.getUser(access_token);
  if (error || !data?.user) return null;

  return { user: data.user, access_token };
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(KEY);
  await supabase.auth.signOut();
}
