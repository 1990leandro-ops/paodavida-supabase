import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

type Aviso = {
  id: string;
  titulo?: string | null;
  mensagem?: string | null;
  created_at?: string | null;
};

export default function AdminAvisos() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/(auth)/login");
        return;
      }

      // Verifica admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        Alert.alert("Acesso negado", "Somente admin pode acessar.");
        router.replace("/(tabs)/home");
        return;
      }

      await carregarAvisos();
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha ao iniciar");
    } finally {
      setLoading(false);
    }
  }

  async function carregarAvisos() {
    const { data, error } = await supabase
      .from("avisos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    setAvisos((data as Aviso[]) ?? []);
  }

  async function postarAviso() {
    if (!titulo.trim() || !mensagem.trim()) {
      Alert.alert("Erro", "Preencha título e mensagem.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("avisos").insert([
      {
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
      },
    ]);

    setSaving(false);

    if (error) {
      Alert.alert("Erro ao postar", error.message);
      return;
    }

    setTitulo("");
    setMensagem("");
    await carregarAvisos();
    Alert.alert("Sucesso", "Aviso publicado!");
  }

  async function apagarAviso(id: string) {
    Alert.alert("Apagar aviso", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("avisos").delete().eq("id", id);
          if (error) {
            Alert.alert("Erro", error.message);
            return;
          }
          await carregarAvisos();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
        Painel Admin • Avisos
      </Text>

      <View style={{ borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 }}>
        <TextInput
          placeholder="Título do aviso"
          value={titulo}
          onChangeText={setTitulo}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 }}
        />
        <TextInput
          placeholder="Mensagem"
          value={mensagem}
          onChangeText={setMensagem}
          multiline
          style={{ borderWidth: 1, borderRadius: 8, padding: 10, height: 90, textAlignVertical: "top" }}
        />

        <TouchableOpacity
          onPress={postarAviso}
          disabled={saving}
          style={{
            backgroundColor: saving ? "#999" : "#E63946",
            padding: 14,
            borderRadius: 10,
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
            {saving ? "Publicando..." : "Publicar aviso"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 12, borderRadius: 10, marginTop: 8, backgroundColor: "#081F3A" }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={carregarAvisos}
        style={{ padding: 12, borderRadius: 10, marginBottom: 10, backgroundColor: "#2b2b2b" }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Atualizar lista</Text>
      </TouchableOpacity>

      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Nenhum aviso ainda.</Text>}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <Text style={{ fontWeight: "800", marginBottom: 6 }}>
              {item.titulo ?? "(sem título)"}
            </Text>
            <Text style={{ marginBottom: 10 }}>{item.mensagem ?? ""}</Text>

            <TouchableOpacity
              onPress={() => apagarAviso(item.id)}
              style={{ backgroundColor: "#E63946", padding: 10, borderRadius: 10 }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
                Apagar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
