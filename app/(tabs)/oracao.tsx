import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";
import { getIgrejasDoUsuario, IgrejaDoUsuario } from "@/lib/getIgrejaId";

type PedidoOracao = {
  id: string;
  igreja_id: string;
  nome?: string | null;
  telefone?: string | null;
  pedido?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export default function OracaoScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [igrejasDoUsuario, setIgrejasDoUsuario] = useState<IgrejaDoUsuario[]>([]);
  const [igrejaId, setIgrejaId] = useState<string | null>(null);
  const [nomeIgrejaAtual, setNomeIgrejaAtual] = useState("Igreja");

  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [pedido, setPedido] = useState("");
  const [anonimo, setAnonimo] = useState(false);

  useEffect(() => {
    iniciarTela();
  }, []);

  useEffect(() => {
    if (igrejaId) {
      carregarPedidos(igrejaId);
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

        await carregarPedidos(igrejaSelecionada.id);
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

        await carregarPedidos(id);
        return;
      }

      setIgrejaId(null);
      setNomeIgrejaAtual("Igreja");
      setPedidos([]);
    } catch (error) {
      console.log("Erro ao iniciar oração:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }

  async function carregarPedidos(id: string) {
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
        .from("pedidos_oracao")
        .select("*")
        .eq("igreja_id", id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.log("Erro ao carregar pedidos:", error.message);
        setPedidos([]);
        return;
      }

      setPedidos((data as PedidoOracao[]) || []);
    } catch (error) {
      console.log("Erro ao carregar pedidos:", error);
      setPedidos([]);
    }
  }

  async function atualizar() {
    if (!igrejaId) return;

    try {
      setRefreshing(true);
      await carregarPedidos(igrejaId);
    } finally {
      setRefreshing(false);
    }
  }

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setPedido("");
    setAnonimo(false);
  }

  async function enviarPedido() {
    try {
      if (!igrejaId) {
        Alert.alert("Oração", "Igreja não identificada.");
        return;
      }

      if (!pedido.trim()) {
        Alert.alert("Oração", "Escreva seu pedido de oração.");
        return;
      }

      if (!anonimo && !nome.trim()) {
        Alert.alert("Oração", "Informe seu nome ou marque como anônimo.");
        return;
      }

      setSalvando(true);

      const payload = {
        igreja_id: igrejaId,
        nome: anonimo ? "Anônimo" : nome.trim(),
        telefone: anonimo ? null : telefone.trim() || null,
        pedido: pedido.trim(),
        status: "Pendente",
      };

      const { error } = await supabase.from("pedidos_oracao").insert([payload]);

      if (error) {
        Alert.alert("Oração", error.message);
        return;
      }

      Alert.alert("Sucesso", "Pedido de oração enviado com sucesso.");
      limparFormulario();
      await carregarPedidos(igrejaId);
    } catch (error: any) {
      Alert.alert("Oração", error?.message || "Erro ao enviar pedido.");
    } finally {
      setSalvando(false);
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
          <Text style={styles.loadingText}>Carregando pedidos...</Text>
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
        <Text style={styles.title}>Pedido de Oração</Text>
        <Text style={styles.subtitle}>
          Compartilhe seu pedido para oração e cuidado pastoral
        </Text>

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
          <Text style={styles.cardTitle}>Enviar pedido</Text>

          <View style={styles.optionWrap}>
            <TouchableOpacity
              style={[styles.optionButton, !anonimo && styles.optionButtonActive]}
              onPress={() => setAnonimo(false)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  !anonimo && styles.optionButtonTextActive,
                ]}
              >
                Identificado
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, anonimo && styles.optionButtonActive]}
              onPress={() => setAnonimo(true)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  anonimo && styles.optionButtonTextActive,
                ]}
              >
                Anônimo
              </Text>
            </TouchableOpacity>
          </View>

          {!anonimo && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor="#9ca3af"
                value={nome}
                onChangeText={setNome}
              />

              <TextInput
                style={styles.input}
                placeholder="Telefone"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
            </>
          )}

          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Escreva seu pedido de oração"
            placeholderTextColor="#9ca3af"
            multiline
            value={pedido}
            onChangeText={setPedido}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={enviarPedido}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Enviar pedido</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pedidos recentes</Text>

          {pedidos.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum pedido cadastrado para esta igreja ainda.
            </Text>
          ) : (
            pedidos.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <Text style={styles.requestName}>{item.nome || "Anônimo"}</Text>
                <Text style={styles.requestText}>{item.pedido || ""}</Text>

                {!!item.status && (
                  <Text style={styles.requestInfo}>Status: {item.status}</Text>
                )}

                {!!item.created_at && (
                  <Text style={styles.dateText}>
                    {formatarData(item.created_at)}
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  optionWrap: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  optionButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  optionButtonActive: {
    backgroundColor: "#065f46",
  },
  optionButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  optionButtonTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: "#111827",
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#065f46",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 24,
  },
  requestCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  requestText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 8,
  },
  requestInfo: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "700",
  },
  dateText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "700",
  },
});
