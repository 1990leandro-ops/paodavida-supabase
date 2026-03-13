import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

type Devocional = {
  id: string;
  igreja_id: string;
  titulo?: string | null;
  versiculo?: string | null;
  mensagem?: string | null;
  autor?: string | null;
  created_at?: string | null;
};

export default function DevocionalScreen() {
  const [loading, setLoading] = useState(true);
  const [igreja, setIgreja] = useState<IgrejaSelecionada | null>(null);
  const [devocional, setDevocional] = useState<Devocional | null>(null);

  useEffect(() => {
    carregarTela();
  }, []);

  async function carregarTela() {
    try {
      setLoading(true);

      const igrejaSalva = await obterIgrejaSelecionada();

      if (!igrejaSalva?.id) {
        setIgreja(null);
        setDevocional(null);
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
        .from("devocionais")
        .select("*")
        .eq("igreja_id", igrejaSalva.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log("Erro ao carregar devocional:", error.message);
        setDevocional(null);
        return;
      }

      setDevocional((data as Devocional) || null);
    } catch (error) {
      console.log("Erro geral no devocional:", error);
      setDevocional(null);
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data?: string | null) {
    if (!data) return "";
    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return data;
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Carregando devocional...</Text>
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
        <Text style={styles.title}>Devocional</Text>
        <Text style={styles.subtitle}>
          Uma palavra para fortalecer sua fé
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Igreja selecionada</Text>
          <Text style={styles.cardValue}>{igreja?.nome || "Igreja"}</Text>
        </View>

        {!devocional ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>Nenhum devocional publicado</Text>
            <Text style={styles.emptyText}>
              Em breve sua igreja poderá compartilhar reflexões, mensagens e
              palavras diárias aqui.
            </Text>
          </View>
        ) : (
          <View style={styles.devocionalCard}>
            {!!devocional.titulo && (
              <Text style={styles.devocionalTitulo}>{devocional.titulo}</Text>
            )}

            {!!devocional.versiculo && (
              <View style={styles.versiculoBox}>
                <Text style={styles.versiculoTexto}>
                  {devocional.versiculo}
                </Text>
              </View>
            )}

            {!!devocional.mensagem && (
              <Text style={styles.devocionalMensagem}>
                {devocional.mensagem}
              </Text>
            )}

            <View style={styles.footerRow}>
              {!!devocional.autor && (
                <Text style={styles.footerText}>Por: {devocional.autor}</Text>
              )}

              {!!devocional.created_at && (
                <Text style={styles.footerText}>
                  {formatarData(devocional.created_at)}
                </Text>
              )}
            </View>
          </View>
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
  devocionalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  devocionalTitulo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  versiculoBox: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  versiculoTexto: {
    fontSize: 17,
    lineHeight: 28,
    color: "#065f46",
    fontStyle: "italic",
    fontWeight: "700",
  },
  devocionalMensagem: {
    fontSize: 16,
    lineHeight: 28,
    color: "#374151",
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "700",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#6b7280",
  },
});
