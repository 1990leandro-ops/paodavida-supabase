import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";
import { getIgrejasDoUsuario, IgrejaDoUsuario } from "@/lib/getIgrejaId";

type Aviso = {
  id: string;
  igreja_id: string;
  titulo: string;
  mensagem: string;
  created_at?: string | null;
};

export default function AvisosScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [igrejasDoUsuario, setIgrejasDoUsuario] = useState<IgrejaDoUsuario[]>([]);
  const [igrejaId, setIgrejaId] = useState<string | null>(null);
  const [nomeIgrejaAtual, setNomeIgrejaAtual] = useState("Igreja");

  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    iniciarTela();
  }, []);

  useEffect(() => {
    if (igrejaId) {
      carregarAvisos(igrejaId);
    }
  }, [igrejaId]);

  async function iniciarTela() {
    try {
      setLoading(true);

      const igrejaSelecionada = await obterIgrejaSelecionada();
      const lista = await getIgrejasDoUsuario().catch(() => []);
      setIgrejasDoUsuario(lista || []);

      if (igrejaSelecionada?.id) {
        setIgrejaId(igrejaSelecionada.id);

        const nomeBase = igrejaSelecionada.nome || "Igreja";
        const cidadeBase = igrejaSelecionada.cidade || "";

        setNomeIgrejaAtual(
          cidadeBase && !nomeBase.toLowerCase().includes(cidadeBase.toLowerCase())
            ? `${nomeBase} - ${cidadeBase}`
            : nomeBase
        );

        await carregarAvisos(igrejaSelecionada.id);
        return;
      }

      if (lista && lista.length > 0) {
        const primeira = lista[0];
        const id = primeira.igreja_id;

        setIgrejaId(id);

        const nomeIgreja = primeira.igrejas?.nome || "Igreja";
        const cidadeIgreja = primeira.igrejas?.cidade || "";

        setNomeIgrejaAtual(
          cidadeIgreja ? `${nomeIgreja} - ${cidadeIgreja}` : nomeIgreja
        );

        await carregarAvisos(id);
        return;
      }

      setIgrejaId(null);
      setNomeIgrejaAtual("Igreja");
      setAvisos([]);
    } catch (error) {
      console.log("Erro ao iniciar avisos:", error);
      setAvisos([]);
    } finally {
      setLoading(false);
    }
  }

  async function carregarAvisos(id: string) {
    try {
      const selecionada = igrejasDoUsuario.find((item) => item.igreja_id === id);

      if (selecionada) {
        const nomeIgreja = selecionada.igrejas?.nome || "Igreja";
        const cidadeIgreja = selecionada.igrejas?.cidade || "";

        setNomeIgrejaAtual(
          cidadeIgreja ? `${nomeIgreja} - ${cidadeIgreja}` : nomeIgreja
        );
      }

      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .eq("igreja_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Erro ao carregar avisos:", error.message);
        setAvisos([]);
        return;
      }

      setAvisos((data as Aviso[]) || []);
    } catch (error) {
      console.log("Erro ao carregar avisos:", error);
      setAvisos([]);
    }
  }

  async function atualizar() {
    if (!igrejaId) return;

    try {
      setRefreshing(true);
      await carregarAvisos(igrejaId);
    } finally {
      setRefreshing(false);
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
          <Text style={styles.loadingText}>Carregando avisos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={atualizar} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Avisos</Text>
        <Text style={styles.subtitle}>Comunicados e novidades da igreja</Text>

        <View style={styles.igrejaCard}>
          <Text style={styles.igrejaLabel}>Igreja selecionada</Text>
          <Text style={styles.igrejaAtual}>{nomeIgrejaAtual}</Text>

          {igrejasDoUsuario.length > 1 && (
            <View style={styles.selectorWrap}>
              {igrejasDoUsuario.map((item) => {
                const ativo = item.igreja_id === igrejaId;
                const nomeBotao = item.igrejas?.nome
                  ? `${item.igrejas.nome}${item.igrejas?.cidade ? ` - ${item.igrejas.cidade}` : ""}`
                  : item.igreja_id;

                return (
                  <TouchableOpacity
                    key={`${item.igreja_id}-${item.role}`}
                    style={[
                      styles.selectorButton,
                      ativo && styles.selectorButtonActive,
                    ]}
                    onPress={() => setIgrejaId(item.igreja_id)}
                  >
                    <Text
                      style={[
                        styles.selectorButtonText,
                        ativo && styles.selectorButtonTextActive,
                      ]}
                    >
                      {nomeBotao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          {avisos.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum aviso cadastrado para esta igreja no momento.
            </Text>
          ) : (
            avisos.map((aviso) => (
              <View key={aviso.id} style={styles.avisoCard}>
                <Text style={styles.avisoTitulo}>{aviso.titulo}</Text>
                <Text style={styles.avisoMensagem}>{aviso.mensagem}</Text>

                {!!aviso.created_at && (
                  <Text style={styles.dataText}>
                    {formatarData(aviso.created_at)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
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
    backgroundColor: "#f3f4f6",
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
  igrejaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  igrejaLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#065f46",
    marginBottom: 8,
  },
  igrejaAtual: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  selectorWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  selectorButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  selectorButtonActive: {
    backgroundColor: "#065f46",
  },
  selectorButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avisoCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avisoTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  avisoMensagem: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
  },
  dataText: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "700",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 24,
  },
});
