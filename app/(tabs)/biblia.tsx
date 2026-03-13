import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Testamento = "AT" | "NT";

type Livro = {
  nome: string;
  id: string;
  capitulos: number;
  testamento: Testamento;
};

type LivroJson = {
  id: string;
  name: string;
  chapters: string[][];
};

const LIVROS: Livro[] = [
  { nome: "Gênesis", id: "gn", capitulos: 50, testamento: "AT" },
  { nome: "Êxodo", id: "ex", capitulos: 40, testamento: "AT" },
  { nome: "Levítico", id: "lv", capitulos: 27, testamento: "AT" },
  { nome: "Números", id: "nm", capitulos: 36, testamento: "AT" },
  { nome: "Deuteronômio", id: "dt", capitulos: 34, testamento: "AT" },
  { nome: "Josué", id: "js", capitulos: 24, testamento: "AT" },
  { nome: "Juízes", id: "jud", capitulos: 21, testamento: "AT" },
  { nome: "Rute", id: "rt", capitulos: 4, testamento: "AT" },
  { nome: "1 Samuel", id: "1sm", capitulos: 31, testamento: "AT" },
  { nome: "2 Samuel", id: "2sm", capitulos: 24, testamento: "AT" },
  { nome: "1 Reis", id: "1kgs", capitulos: 22, testamento: "AT" },
  { nome: "2 Reis", id: "2kgs", capitulos: 25, testamento: "AT" },
  { nome: "1 Crônicas", id: "1ch", capitulos: 29, testamento: "AT" },
  { nome: "2 Crônicas", id: "2ch", capitulos: 36, testamento: "AT" },
  { nome: "Esdras", id: "ezr", capitulos: 10, testamento: "AT" },
  { nome: "Neemias", id: "ne", capitulos: 13, testamento: "AT" },
  { nome: "Ester", id: "et", capitulos: 10, testamento: "AT" },
  { nome: "Jó", id: "job", capitulos: 42, testamento: "AT" },
  { nome: "Salmos", id: "ps", capitulos: 150, testamento: "AT" },
  { nome: "Provérbios", id: "prv", capitulos: 31, testamento: "AT" },
  { nome: "Eclesiastes", id: "ec", capitulos: 12, testamento: "AT" },
  { nome: "Cantares", id: "so", capitulos: 8, testamento: "AT" },
  { nome: "Isaías", id: "is", capitulos: 66, testamento: "AT" },
  { nome: "Jeremias", id: "jr", capitulos: 52, testamento: "AT" },
  { nome: "Lamentações", id: "lm", capitulos: 5, testamento: "AT" },
  { nome: "Ezequiel", id: "ez", capitulos: 48, testamento: "AT" },
  { nome: "Daniel", id: "dn", capitulos: 12, testamento: "AT" },
  { nome: "Oséias", id: "ho", capitulos: 14, testamento: "AT" },
  { nome: "Joel", id: "jl", capitulos: 3, testamento: "AT" },
  { nome: "Amós", id: "am", capitulos: 9, testamento: "AT" },
  { nome: "Obadias", id: "ob", capitulos: 1, testamento: "AT" },
  { nome: "Jonas", id: "jn", capitulos: 4, testamento: "AT" },
  { nome: "Miquéias", id: "mi", capitulos: 7, testamento: "AT" },
  { nome: "Naum", id: "na", capitulos: 3, testamento: "AT" },
  { nome: "Habacuque", id: "hk", capitulos: 3, testamento: "AT" },
  { nome: "Sofonias", id: "zp", capitulos: 3, testamento: "AT" },
  { nome: "Ageu", id: "hg", capitulos: 2, testamento: "AT" },
  { nome: "Zacarias", id: "zc", capitulos: 14, testamento: "AT" },
  { nome: "Malaquias", id: "ml", capitulos: 4, testamento: "AT" },

  { nome: "Mateus", id: "mt", capitulos: 28, testamento: "NT" },
  { nome: "Marcos", id: "mk", capitulos: 16, testamento: "NT" },
  { nome: "Lucas", id: "lk", capitulos: 24, testamento: "NT" },
  { nome: "João", id: "jo", capitulos: 21, testamento: "NT" },
  { nome: "Atos", id: "act", capitulos: 28, testamento: "NT" },
  { nome: "Romanos", id: "rm", capitulos: 16, testamento: "NT" },
  { nome: "1 Coríntios", id: "1co", capitulos: 16, testamento: "NT" },
  { nome: "2 Coríntios", id: "2co", capitulos: 13, testamento: "NT" },
  { nome: "Gálatas", id: "gl", capitulos: 6, testamento: "NT" },
  { nome: "Efésios", id: "eph", capitulos: 6, testamento: "NT" },
  { nome: "Filipenses", id: "ph", capitulos: 4, testamento: "NT" },
  { nome: "Colossenses", id: "cl", capitulos: 4, testamento: "NT" },
  { nome: "1 Tessalonicenses", id: "1ts", capitulos: 5, testamento: "NT" },
  { nome: "2 Tessalonicenses", id: "2ts", capitulos: 3, testamento: "NT" },
  { nome: "1 Timóteo", id: "1tm", capitulos: 6, testamento: "NT" },
  { nome: "2 Timóteo", id: "2tm", capitulos: 4, testamento: "NT" },
  { nome: "Tito", id: "tt", capitulos: 3, testamento: "NT" },
  { nome: "Filemom", id: "phm", capitulos: 1, testamento: "NT" },
  { nome: "Hebreus", id: "hb", capitulos: 13, testamento: "NT" },
  { nome: "Tiago", id: "jm", capitulos: 5, testamento: "NT" },
  { nome: "1 Pedro", id: "1pe", capitulos: 5, testamento: "NT" },
  { nome: "2 Pedro", id: "2pe", capitulos: 3, testamento: "NT" },
  { nome: "1 João", id: "1jo", capitulos: 5, testamento: "NT" },
  { nome: "2 João", id: "2jo", capitulos: 1, testamento: "NT" },
  { nome: "3 João", id: "3jo", capitulos: 1, testamento: "NT" },
  { nome: "Judas", id: "jd", capitulos: 1, testamento: "NT" },
  { nome: "Apocalipse", id: "re", capitulos: 22, testamento: "NT" },
];

const BASE_URL =
  "https://raw.githubusercontent.com/maatheusgois/bible/main/versions/pt-br/arc";

export default function BibliaScreen() {
  const [testamento, setTestamento] = useState<Testamento>("NT");
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  const [capituloSelecionado, setCapituloSelecionado] = useState<number | null>(null);
  const [versos, setVersos] = useState<string[]>([]);
  const [loadingVersos, setLoadingVersos] = useState(false);

  const livrosFiltrados = useMemo(
    () => LIVROS.filter((livro) => livro.testamento === testamento),
    [testamento]
  );

  async function abrirCapitulo(livro: Livro, capitulo: number) {
    try {
      setLoadingVersos(true);
      setCapituloSelecionado(capitulo);
      setVersos([]);

      const url = `${BASE_URL}/${livro.id}/${livro.id}.json`;
      const resposta = await fetch(url);
      const data: LivroJson = await resposta.json();

      if (!resposta.ok || !data?.chapters?.length) {
        throw new Error("Não foi possível carregar este capítulo.");
      }

      const capituloIndex = capitulo - 1;
      const capituloVersos = data.chapters[capituloIndex];

      if (!capituloVersos || !Array.isArray(capituloVersos)) {
        throw new Error("Capítulo indisponível no momento.");
      }

      setVersos(capituloVersos);
    } catch (error: any) {
      Alert.alert(
        "Bíblia",
        error?.message || "Não foi possível carregar este capítulo agora."
      );
      setCapituloSelecionado(null);
      setVersos([]);
    } finally {
      setLoadingVersos(false);
    }
  }

  if (livroSelecionado && capituloSelecionado) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setCapituloSelecionado(null);
              setVersos([]);
            }}
          >
            <Text style={styles.backButtonText}>← Voltar aos capítulos</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {livroSelecionado.nome} {capituloSelecionado}
          </Text>

          {loadingVersos ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#065f46" />
              <Text style={styles.loadingText}>Carregando capítulo...</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {versos.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum versículo encontrado.</Text>
              ) : (
                versos.map((verso, index) => (
                  <Text key={`${index + 1}`} style={styles.verseText}>
                    <Text style={styles.verseNumber}>{index + 1} </Text>
                    {verso?.trim()}
                  </Text>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (livroSelecionado) {
    const capitulos = Array.from(
      { length: livroSelecionado.capitulos },
      (_, i) => i + 1
    );

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setLivroSelecionado(null)}
          >
            <Text style={styles.backButtonText}>← Voltar aos livros</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{livroSelecionado.nome}</Text>
          <Text style={styles.subtitle}>Selecione um capítulo para leitura</Text>

          <View style={styles.chapterGrid}>
            {capitulos.map((capitulo) => (
              <TouchableOpacity
                key={capitulo}
                style={styles.chapterCard}
                onPress={() => abrirCapitulo(livroSelecionado, capitulo)}
              >
                <Text style={styles.chapterText}>{capitulo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bíblia Sagrada</Text>
        <Text style={styles.subtitle}>Leitura bíblica em português brasileiro</Text>

        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[
              styles.switchButton,
              testamento === "AT" && styles.switchButtonActive,
            ]}
            onPress={() => setTestamento("AT")}
          >
            <Text
              style={[
                styles.switchText,
                testamento === "AT" && styles.switchTextActive,
              ]}
            >
              Antigo Testamento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchButton,
              testamento === "NT" && styles.switchButtonActive,
            ]}
            onPress={() => setTestamento("NT")}
          >
            <Text
              style={[
                styles.switchText,
                testamento === "NT" && styles.switchTextActive,
              ]}
            >
              Novo Testamento
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {livrosFiltrados.map((livro) => (
            <TouchableOpacity
              key={livro.nome}
              style={styles.bookCard}
              onPress={() => setLivroSelecionado(livro)}
            >
              <Text style={styles.bookTitle}>{livro.nome}</Text>
              <Text style={styles.bookMeta}>{livro.capitulos} capítulo(s)</Text>
            </TouchableOpacity>
          ))}
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
  switchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  switchButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  switchButtonActive: {
    backgroundColor: "#065f46",
  },
  switchText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },
  switchTextActive: {
    color: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  backButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bookCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  bookMeta: {
    fontSize: 13,
    color: "#6b7280",
  },
  chapterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chapterCard: {
    width: "22%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  chapterText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  verseText: {
    fontSize: 16,
    lineHeight: 28,
    color: "#111827",
    marginBottom: 10,
  },
  verseNumber: {
    fontWeight: "800",
    color: "#065f46",
  },
  centerBox: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },
  emptyText: {
    color: "#6b7280",
  },
});
