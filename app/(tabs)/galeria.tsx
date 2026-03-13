import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

type IgrejaSelecionada = {
  id: string;
  nome: string;
  cidade?: string | null;
};

type Foto = {
  id: string;
  igreja_id: string;
  url?: string | null;
  legenda?: string | null;
  created_at?: string | null;
};

export default function GaleriaScreen() {
  const [loading, setLoading] = useState(true);
  const [igreja, setIgreja] = useState<IgrejaSelecionada | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);

  useEffect(() => {
    carregarTela();
  }, []);

  async function carregarTela() {
    try {
      setLoading(true);

      const igrejaSalva = await obterIgrejaSelecionada();

      if (!igrejaSalva?.id) {
        setIgreja(null);
        setFotos([]);
        return;
      }

      const nomeBase = igrejaSalva.nome || "Igreja";
      const cidadeBase = igrejaSalva.cidade || "";
      const nomeFinal =
        cidadeBase && !nomeBase.toLowerCase().includes(cidadeBase.toLowerCase())
          ? `${nomeBase} ${cidadeBase}`
          : nomeBase;

      setIgreja({
        id: igrejaSalva.id,
        nome: nomeFinal,
        cidade: igrejaSalva.cidade || "",
      });

      const { data, error } = await supabase
        .from("fotos")
        .select("id, igreja_id, url, legenda, created_at")
        .eq("igreja_id", igrejaSalva.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Erro ao carregar fotos:", error.message);
        setFotos([]);
        return;
      }

      setFotos((data as Foto[]) || []);
    } catch (error) {
      console.log("Erro geral na galeria:", error);
      setFotos([]);
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data?: string | null) {
    if (!data) return "";
    try {
      return new Date(data).toLocaleString("pt-BR");
    } catch {
      return data;
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Carregando galeria...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Galeria</Text>
        <Text style={styles.subtitle}>
          Fotos e momentos especiais da igreja
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Igreja selecionada</Text>
          <Text style={styles.cardValue}>{igreja?.nome || "Igreja"}</Text>
        </View>

        {fotos.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Nenhuma foto publicada para esta igreja ainda.
            </Text>
          </View>
        ) : (
          fotos.map((foto) => (
            <View key={foto.id} style={styles.photoCard}>
              {!!foto.url && (
                <Image
                  source={{ uri: foto.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}

              {!!foto.legenda && (
                <Text style={styles.caption}>{foto.legenda}</Text>
              )}

              {!!foto.created_at && (
                <Text style={styles.dateText}>
                  {formatarData(foto.created_at)}
                </Text>
              )}
            </View>
          ))
        )}
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
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardLabel: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "700",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  photoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    marginBottom: 12,
  },
  caption: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
});
