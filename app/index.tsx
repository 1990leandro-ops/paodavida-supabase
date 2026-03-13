import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada, salvarIgrejaSelecionada } from "@/lib/igrejaSelecionada";

type Igreja = {
  id: string;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  ativa?: boolean | null;
  instagram?: string | null;
  pix?: string | null;
  cor_tema?: string | null;
  logo_url?: string | null;
};

export default function PreHomeScreen() {
  const [loading, setLoading] = useState(true);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    try {
      setLoading(true);

      const igrejaSalva = await obterIgrejaSelecionada();

      if (igrejaSalva?.id) {
        router.replace("/(tabs)");
        return;
      }

      await carregarIgrejas();
    } catch (error) {
      console.log("Erro ao iniciar pré-home:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarIgrejas() {
    try {
      const { data, error } = await supabase
        .from("igrejas")
        .select("id, nome, cidade, estado, ativa, instagram, pix, cor_tema, logo_url")
        .eq("ativa", true)
        .order("nome", { ascending: true });

      if (error) {
        Alert.alert("Igrejas", error.message);
        setIgrejas([]);
        return;
      }

      setIgrejas((data as Igreja[]) || []);
    } catch (error: any) {
      Alert.alert("Igrejas", error?.message || "Erro ao carregar igrejas.");
      setIgrejas([]);
    }
  }

  async function selecionarIgreja(igreja: Igreja) {
    await salvarIgrejaSelecionada({
      id: igreja.id,
      nome: igreja.nome,
      cidade: igreja.cidade || "",
      instagram: igreja.instagram || null,
      pix_chave: igreja.pix || null,
      pix_favorecido: null,
      pix_qr_url: null,
      tesouraria: null,
    });

    router.replace("/(tabs)");
  }

  function entrar() {
    router.push("/(auth)/login");
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.backgroundContainer}>
          <Image
            source={require("../assets/background/logo-bg.png")}
            style={styles.backgroundLogo}
          />
        </View>

        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Carregando igrejas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundContainer}>
        <Image
          source={require("../assets/background/logo-bg.png")}
          style={styles.backgroundLogo}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pão da Vida</Text>
          <Text style={styles.subtitle}>Escolha sua igreja para continuar</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Igrejas disponíveis</Text>

          {igrejas.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma igreja ativa disponível no momento.
            </Text>
          ) : (
            igrejas.map((igreja) => (
              <TouchableOpacity
                key={igreja.id}
                style={styles.igrejaButton}
                onPress={() => selecionarIgreja(igreja)}
              >
                <Text style={styles.igrejaNome}>{igreja.nome}</Text>

                {!!igreja.cidade && (
                  <Text style={styles.igrejaCidade}>
                    {igreja.cidade}
                    {!!igreja.estado ? ` - ${igreja.estado}` : ""}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={entrar}>
          <Text style={styles.loginButtonText}>Entrar na minha conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: 24,
    paddingBottom: 80,
    flexGrow: 1,
    justifyContent: "center",
  },
  backgroundContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundLogo: {
    width: 360,
    height: 360,
    resizeMode: "contain",
    opacity: 0.08,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#065f46",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  igrejaButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  igrejaNome: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  igrejaCidade: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyText: {
    color: "#6b7280",
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: "#065f46",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
    fontWeight: "600",
  },
});
