import { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

type IgrejaSelecionada = {
  id: string;
  nome: string;
  cidade?: string | null;
};

type EmocaoOpcao = {
  emoji: string;
  label: string;
  valor: string;
};

const EMOCOES: EmocaoOpcao[] = [
  { emoji: "😀", label: "Alegre", valor: "alegre" },
  { emoji: "😔", label: "Triste", valor: "triste" },
  { emoji: "😟", label: "Ansioso", valor: "ansioso" },
  { emoji: "🤒", label: "Doente", valor: "doente" },
  { emoji: "🙏", label: "Precisando de oração", valor: "oracao" },
];

export default function EmocoesScreen() {
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [nome, setNome] = useState("");
  const [obs, setObs] = useState("");
  const [igreja, setIgreja] = useState<IgrejaSelecionada | null>(null);
  const [emocaoSelecionada, setEmocaoSelecionada] =
    useState<EmocaoOpcao | null>(null);

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
      });
    } catch (error) {
      console.log("Erro ao carregar igreja:", error);
      setIgreja(null);
    } finally {
      setLoading(false);
    }
  }

  async function enviar() {
    if (!emocaoSelecionada) {
      Alert.alert("Atenção", "Selecione uma emoção");
      return;
    }

    if (!igreja?.id) {
      Alert.alert("Erro", "Igreja não identificada");
      return;
    }

    try {
      setEnviando(true);

      const { error } = await supabase.from("emocoes_membros").insert({
        nome: nome.trim() || "Anônimo",
        emoji: emocaoSelecionada.emoji,
        sentimento: emocaoSelecionada.label,
        observacao: obs.trim() || null,
        igreja_id: igreja.id,
      });

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("Obrigado", "Sua emoção foi registrada");
      setNome("");
      setObs("");
      setEmocaoSelecionada(null);
    } catch (error: any) {
      Alert.alert("Erro", error?.message || "Não foi possível registrar.");
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Como você está hoje?</Text>

        <Text style={styles.subtitle}>
          Compartilhe seu estado emocional com a liderança da igreja
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Igreja selecionada</Text>

          <Text style={styles.value}>
            {igreja?.cidade ? `${igreja.nome} ${igreja.cidade}` : igreja?.nome || "Igreja"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Registrar emoção</Text>

          <TextInput
            placeholder="Seu nome"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Selecione como você está</Text>

          {EMOCOES.map((item) => (
            <TouchableOpacity
              key={item.valor}
              style={[
                styles.option,
                emocaoSelecionada?.valor === item.valor && styles.optionSelected,
              ]}
              onPress={() => setEmocaoSelecionada(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  emocaoSelecionada?.valor === item.valor &&
                    styles.optionTextSelected,
                ]}
              >
                {item.emoji} {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TextInput
            placeholder="Observação"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.textarea]}
            value={obs}
            onChangeText={setObs}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, enviando && styles.buttonDisabled]}
            onPress={enviar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
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
  option: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionSelected: {
    backgroundColor: "#065f46",
    borderColor: "#065f46",
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#065f46",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
