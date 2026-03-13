import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { loadSession, clearSession } from "../../lib/session";

export default function Perfil() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const sess = await loadSession();
      if (!sess?.user) {
        router.replace("/Login");
        return;
      }
      setEmail(sess.user.email ?? "");
    })();
  }, []);

  async function sair() {
    await clearSession();
    router.replace("/Login");
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#071f33" }}>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>Perfil</Text>

      <View style={{ marginTop: 18, padding: 14, backgroundColor: "#0b2b46", borderRadius: 14 }}>
        <Text style={{ color: "#bcd6ff" }}>Email</Text>
        <Text style={{ color: "white", fontSize: 16, marginTop: 6 }}>{email}</Text>
      </View>

      <TouchableOpacity
        onPress={sair}
        style={{
          marginTop: 20,
          padding: 14,
          borderRadius: 12,
          backgroundColor: "#143a5a",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
