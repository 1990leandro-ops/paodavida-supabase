import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

type IgrejaSelecionada = {
  id: string;
  nome: string;
  cidade?: string | null;
  pix_chave?: string | null;
  pix_favorecido?: string | null;
  pix_qr_url?: string | null;
};

type TipoContribuicao = "Dízimo" | "Oferta" | "Oferta Alçada" | "Campanha";

const TIPOS: TipoContribuicao[] = [
  "Dízimo",
  "Oferta",
  "Oferta Alçada",
  "Campanha",
];

export default function DizimosScreen() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [igreja, setIgreja] = useState<IgrejaSelecionada | null>(null);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoContribuicao>("Dízimo");
  const [valor, setValor] = useState("");
  const [campanha, setCampanha] = useState("");
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    carregarIgreja();
  }, []);

  async function carregarIgreja() {
    try {
      setLoading(true);

      const igrejaSalva = await obterIgrejaSelecionada();

      if (!igrejaSalva?.id) {
        setIgreja(null);
        return;
      }

      setIgreja({
        id: igrejaSalva.id,
        nome: igrejaSalva.nome,
        cidade: igrejaSalva.cidade || "",
        pix_chave: igrejaSalva.pix_chave || null,
        pix_favorecido: igrejaSalva.pix_favorecido || null,
        pix_qr_url: igrejaSalva.pix_qr_url || null,
      });
    } catch (error) {
      console.log("Erro ao carregar igreja:", error);
      setIgreja(null);
    } finally {
      setLoading(false);
    }
  }

  function parseValor(texto: string) {
    const normalizado = texto.replace(/\./g, "").replace(",", ".");
    return Number(normalizado);
  }

  async function copiarChavePix() {
    if (!igreja?.pix_chave) {
      Alert.alert("Pix", "Nenhuma chave Pix cadastrada.");
      return;
    }

    await Clipboard.setStringAsync(igreja.pix_chave);
    Alert.alert("Pix", "Chave Pix copiada.");
  }

  async function registrarContribuicao() {
    try {
      if (!igreja?.id) {
        Alert.alert("Contribuições", "Igreja não identificada.");
        return;
      }

      if (!nome.trim()) {
        Alert.alert("Contribuições", "Informe seu nome.");
        return;
      }

      if (!valor.trim()) {
        Alert.alert("Contribuições", "Informe o valor.");
        return;
      }

      const valorNumero = parseValor(valor);

      if (!valorNumero || valorNumero <= 0) {
        Alert.alert("Contribuições", "Informe um valor válido.");
        return;
      }

      if (tipo === "Campanha" && !campanha.trim()) {
        Alert.alert("Contribuições", "Informe o nome da campanha.");
        return;
      }

      setSalvando(true);

      const { error } = await supabase.from("contribuicoes").insert([
        {
          igreja_id: igreja.id,
          nome: nome.trim(),
          tipo,
          valor: valorNumero,
          campanha: tipo === "Campanha" ? campanha.trim() : null,
          observacao: observacao.trim() || null,
        },
      ]);

      if (error) {
        Alert.alert("Contribuições", error.message);
        return;
      }

      Alert.alert("Sucesso", "Contribuição registrada com sucesso.");
      setNome("");
      setTipo("Dízimo");
      setValor("");
      setCampanha("");
      setObservacao("");
    } catch (error: any) {
      Alert.alert(
        "Contribuições",
        error?.message || "Erro ao registrar contribuição."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Carregando...</Text>
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
        <Text style={styles.title}>Contribuições</Text>
        <Text style={styles.subtitle}>
          Contribua com a obra e registre sua oferta
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Igreja selecionada</Text>
          <Text style={styles.cardValue}>
            {igreja?.cidade ? `${igreja.nome} ${igreja.cidade}` : igreja?.nome || "Igreja"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>PIX da igreja</Text>

          {igreja?.pix_chave ? (
            <>
              <Text style={styles.pixLabel}>Chave PIX</Text>
              <Text style={styles.pixValue}>{igreja.pix_chave}</Text>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={copiarChavePix}
              >
                <Text style={styles.copyButtonText}>Copiar chave Pix</Text>
              </TouchableOpacity>

              {!!igreja.pix_favorecido && (
                <>
                  <Text style={styles.pixLabel}>Favorecido</Text>
                  <Text style={styles.pixValue}>{igreja.pix_favorecido}</Text>
                </>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma chave PIX cadastrada para esta igreja.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registrar contribuição</Text>

          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#9ca3af"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.sectionTitle}>Tipo da contribuição</Text>
          <View style={styles.optionWrap}>
            {TIPOS.map((item) => {
              const ativo = tipo === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionButton, ativo && styles.optionButtonActive]}
                  onPress={() => setTipo(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ativo && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Valor"
            placeholderTextColor="#9ca3af"
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
          />

          {tipo === "Campanha" && (
            <TextInput
              style={styles.input}
              placeholder="Nome da campanha"
              placeholderTextColor="#9ca3af"
              value={campanha}
              onChangeText={setCampanha}
            />
          )}

          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Observação"
            placeholderTextColor="#9ca3af"
            value={observacao}
            onChangeText={setObservacao}
            multiline
          />

          <TouchableOpacity
            style={[styles.primaryButton, salvando && styles.buttonDisabled]}
            onPress={registrarContribuicao}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Registrar contribuição
              </Text>
            )}
          </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginHorizontal: 20,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
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
    fontWeight: "bold",
    color: "#111827",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },
  pixLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    marginTop: 6,
  },
  pixValue: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  copyButton: {
    marginTop: 14,
    marginBottom: 8,
    backgroundColor: "#065f46",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  copyButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  optionButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  optionButtonActive: {
    backgroundColor: "#065f46",
  },
  optionText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
  },
  optionTextActive: {
    color: "#fff",
  },
  primaryButton: {
    backgroundColor: "#065f46",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  emptyText: {
    color: "#6b7280",
  },
});
