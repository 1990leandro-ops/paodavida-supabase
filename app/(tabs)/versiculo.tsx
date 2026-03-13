
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type VerseState = {
  reference: string;
  text: string;
  dateLabel: string;
  sourceLabel: string;
};

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff =
    d.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatPtBrDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Lista SOMENTE de referências (sem texto), pra evitar colocar conteúdo no código
 * e manter o "versículo do dia" sempre automático.
 */
const DAILY_REFERENCES: string[] = [
  "João 3:16",
  "Salmos 23:1",
  "Filipenses 4:6-7",
  "Provérbios 3:5-6",
  "Isaías 41:10",
  "Mateus 11:28",
  "Romanos 8:28",
  "Salmos 46:1",
  "Josué 1:9",
  "Salmos 91:1-2",
  "1 Coríntios 13:4-7",
  "Hebreus 11:1",
  "Tiago 1:5",
  "2 Coríntios 5:7",
  "Salmos 37:5",
  "Isaías 40:31",
  "Romanos 12:2",
  "Mateus 6:33",
  "Salmos 121:1-2",
  "João 14:6",
  "João 14:27",
  "Salmos 27:1",
  "Salmos 119:105",
  "1 Pedro 5:7",
  "Gálatas 5:22-23",
  "Efésios 2:8-9",
  "Hebreus 4:16",
  "Salmos 34:8",
  "Provérbios 16:3",
  "Salmos 100:4-5",
  "Colossenses 3:23",
  "Romanos 15:13",
  "Salmos 118:24",
  "1 Tessalonicenses 5:16-18",
  "2 Timóteo 1:7",
  "Salmos 139:23-24",
];

export default function VersiculoScreen() {
  const today = useMemo(() => new Date(), []);
  const idx = useMemo(() => dayOfYear(today) % DAILY_REFERENCES.length, [today]);
  const todayRef = useMemo(() => DAILY_REFERENCES[idx], [idx]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<VerseState>({
    reference: todayRef,
    text: "",
    dateLabel: formatPtBrDate(today),
    sourceLabel: "Carregando…",
  });

  async function fetchVerse(referencePt: string) {
    // bible-api aceita referências em português em muitos casos.
    // Se der erro, tentamos uma variação (livro sem acento).
    const tryRefs = [
      referencePt,
      referencePt
        .replace("1 ", "1")
        .replace("2 ", "2")
        .replace("3 ", "3"),
      referencePt
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""), // remove acentos
    ];

    let lastErr: any = null;

    for (const ref of tryRefs) {
      const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=almeida`;
      try {
        const res = await fetch(url);
        const json = await res.json();

        // Esperado: { reference: "John 3:16", text: "...", verses: [...] }
        if (!res.ok || !json?.text) {
          lastErr = json;
          continue;
        }

        const cleanText = String(json.text).trim().replace(/\s+\n/g, "\n").trim();

        return {
          reference: referencePt,
          text: cleanText,
          sourceLabel: "Fonte: Bible API (Almeida)",
        };
      } catch (e) {
        lastErr = e;
      }
    }

    throw lastErr ?? new Error("Falha ao buscar versículo.");
  }

  async function load() {
    try {
      const verse = await fetchVerse(todayRef);
      setData((prev) => ({
        ...prev,
        reference: verse.reference,
        text: verse.text,
        sourceLabel: verse.sourceLabel,
      }));
    } catch (e) {
      // Fallback: sem texto (pra não travar o app)
      setData((prev) => ({
        ...prev,
        text:
          "Não foi possível carregar o texto agora.\n\nVerifique sua internet e toque em “Atualizar”.",
        sourceLabel: "Modo offline",
      }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    setLoading(false);
    try {
      const verse = await fetchVerse(todayRef);
      setData((prev) => ({
        ...prev,
        reference: verse.reference,
        text: verse.text,
        sourceLabel: verse.sourceLabel,
      }));
    } catch (e) {
      Alert.alert("Sem conexão", "Não consegui atualizar agora. Tente novamente.");
    } finally {
      setRefreshing(false);
    }
  }

  async function shareVerse() {
    const message = `${data.reference}\n\n${data.text}\n\n📍Pão da Vida Ilhéus`;
    try {
      await Share.share({ message });
    } catch {
      // silêncio
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Versículo do Dia</Text>
            <Text style={styles.subtitle}>{data.dateLabel}</Text>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={onRefresh} activeOpacity={0.8}>
            <Ionicons name="refresh" size={18} color="#EAF2FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.badge}>
              <Ionicons name="book" size={14} color="#0B2C4A" />
              <Text style={styles.badgeText}>{data.reference}</Text>
            </View>

            <Text style={styles.source}>{data.sourceLabel}</Text>
          </View>

          <View style={styles.divider} />

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Carregando versículo…</Text>
            </View>
          ) : (
            <Text style={styles.verseText}>{data.text}</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionPrimary]}
              onPress={shareVerse}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Ionicons name="share-social" size={18} color="#0B2C4A" />
              <Text style={styles.actionPrimaryText}>Compartilhar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionGhost]}
              onPress={() => Alert.alert("Dica", "Puxe para baixo para atualizar 😉")}
              activeOpacity={0.85}
            >
              <Ionicons name="information-circle" size={18} color="#EAF2FF" />
              <Text style={styles.actionGhostText}>Ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dica: todo dia o app escolhe automaticamente uma referência e busca o texto online.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#061E33" },
  container: { padding: 16, paddingBottom: 28 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: { gap: 2 },
  title: { color: "#EAF2FF", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#A9C2DA", fontSize: 13 },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#0B2C4A",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: { color: "#0B2C4A", fontWeight: "800", fontSize: 13 },

  source: { color: "#A9C2DA", fontSize: 12 },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },

  loadingBox: { paddingVertical: 22, gap: 10, alignItems: "center" },
  loadingText: { color: "#A9C2DA", fontSize: 13 },

  verseText: { color: "#EAF2FF", fontSize: 17, lineHeight: 26 },

  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionPrimary: { backgroundColor: "#EAF2FF" },
  actionPrimaryText: { color: "#0B2C4A", fontWeight: "800" },

  actionGhost: { backgroundColor: "rgba(255,255,255,0.10)" },
  actionGhostText: { color: "#EAF2FF", fontWeight: "700" },

  footer: { marginTop: 14 },
  footerText: { color: "#A9C2DA", fontSize: 12, lineHeight: 18 },
});
