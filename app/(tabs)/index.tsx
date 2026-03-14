import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

type Igreja = {
  id: string;
  nome: string;
  cidade?: string;
  instagram?: string;
  logo_url?: string;
};

type MembroAniversariante = {
  id: string;
  nome: string;
  data_nascimento?: string | null;
};

type Versiculo = {
  texto: string;
  referencia: string;
};

const TOKEN_BIBLIA =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJTYXQgTWFyIDE0IDIwMjYgMDE6MjM6MTcgR01UKzAwMDAuMTk5MGxlYW5kcm9AZ21haWwuY29tIiwiaWF0IjoxNzczNDUxMzk3fQ.yzwsvndzrmrEk2can3Dj6GeZOiT6gWbN8PckgPpGcz4";

const VERSICULO_FALLBACK: Versiculo = {
  texto:
    "Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento.",
  referencia: "Provérbios 3:5",
};

export default function HomeScreen() {
  const [igreja, setIgreja] = useState<Igreja | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [aniversariantesMes, setAniversariantesMes] = useState<MembroAniversariante[]>([]);
  const [versiculo, setVersiculo] = useState<Versiculo>(VERSICULO_FALLBACK);
  const [carregandoVersiculo, setCarregandoVersiculo] = useState(true);

  useEffect(() => {
    carregarIgreja();
    verificarPermissoes();
    carregarAniversariantesDoMes();
    carregarVersiculoDoDia();
  }, []);

  async function carregarVersiculoDoDia() {
    try {
      setCarregandoVersiculo(true);
      const response = await fetch(
        "https://www.abibliadigital.com.br/api/verses/day",
        {
          headers: {
            Authorization: `Bearer ${TOKEN_BIBLIA}`,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data?.text && data?.book?.name && data?.chapter && data?.number) {
        setVersiculo({
          texto: data.text,
          referencia: `${data.book.name} ${data.chapter}:${data.number}`,
        });
      }
    } catch (error) {
      console.log("Erro ao buscar versículo:", error);
    } finally {
      setCarregandoVersiculo(false);
    }
  }

  async function verificarPermissoes() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsuarioLogado(false);
        setIsAdmin(false);
        return;
      }

      setUsuarioLogado(true);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("Erro ao buscar perfil:", error.message);
        setIsAdmin(false);
        return;
      }

      const role = profile?.role;
      setIsAdmin(role === "admin");
    } catch (error) {
      console.log("Erro ao verificar permissões:", error);
      setUsuarioLogado(false);
      setIsAdmin(false);
    }
  }

  async function carregarIgreja() {
    try {
      const igrejaLocal = await obterIgrejaSelecionada();
      if (!igrejaLocal?.id) return;

      const { data } = await supabase
        .from("igrejas")
        .select("id,nome,cidade,instagram,logo_url")
        .eq("id", igrejaLocal.id)
        .single();

      if (data) setIgreja(data);
    } catch (error) {
      console.log("Erro ao carregar igreja:", error);
    }
  }

  async function carregarAniversariantesDoMes() {
    try {
      const igrejaLocal = await obterIgrejaSelecionada();
      if (!igrejaLocal?.id) {
        setAniversariantesMes([]);
        return;
      }

      const mesAtual = new Date().getMonth() + 1;

      const { data, error } = await supabase
        .from("membros")
        .select("id,nome,data_nascimento")
        .eq("igreja_id", igrejaLocal.id)
        .order("nome", { ascending: true });

      if (error) {
        console.log("Erro ao buscar aniversariantes:", error.message);
        setAniversariantesMes([]);
        return;
      }

      const filtrados =
        data?.filter((membro) => {
          if (!membro.data_nascimento) return false;
          const texto = String(membro.data_nascimento).trim();

          if (texto.includes("/")) {
            const partes = texto.split("/");
            if (partes.length >= 2) return Number(partes[1]) === mesAtual;
          }

          const dataNascimento = new Date(texto);
          if (Number.isNaN(dataNascimento.getTime())) return false;
          return dataNascimento.getMonth() + 1 === mesAtual;
        }) || [];

      filtrados.sort(
        (a, b) => extrairDia(a.data_nascimento) - extrairDia(b.data_nascimento)
      );
      setAniversariantesMes(filtrados);
    } catch (error) {
      console.log("Erro geral ao carregar aniversariantes do mês:", error);
      setAniversariantesMes([]);
    }
  }

  function extrairDia(data?: string | null) {
    if (!data) return 99;
    const texto = String(data).trim();
    if (texto.includes("/")) return Number(texto.split("/")[0]) || 99;
    const d = new Date(texto);
    return Number.isNaN(d.getTime()) ? 99 : d.getDate();
  }

  function formatarDiaMes(data?: string | null) {
    if (!data) return "";
    const texto = String(data).trim();
    if (texto.includes("/")) {
      const partes = texto.split("/");
      if (partes.length >= 2)
        return `${partes[0].padStart(2, "0")}/${partes[1].padStart(2, "0")}`;
    }
    const d = new Date(texto);
    if (Number.isNaN(d.getTime())) return "";
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  async function abrirInstagram() {
    if (!igreja?.instagram) return;
    const url = igreja.instagram.startsWith("http")
      ? igreja.instagram
      : `https://${igreja.instagram}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            {!!igreja?.logo_url && (
              <Image source={{ uri: igreja.logo_url }} style={styles.heroLogo} />
            )}
            <View>
              <Text style={styles.heroTitle}>Pão da Vida</Text>
              <Text style={styles.heroSub}>Aplicativo da Igreja</Text>
            </View>
          </View>
          <Text style={styles.heroText}>
            Acompanhe avisos, leia a Bíblia, envie pedidos de oração, registre
            contribuições e fortaleça a comunhão durante toda a semana.
          </Text>
        </View>

        {/* Igreja */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Igreja selecionada</Text>
          <View style={styles.igrejaRow}>
            {!!igreja?.logo_url && (
              <Image source={{ uri: igreja.logo_url }} style={styles.igrejaLogo} />
            )}
            <View>
              <Text style={styles.igrejaNome}>{igreja?.nome}</Text>
              {!!igreja?.cidade && (
                <Text style={styles.igrejaCidade}>{igreja.cidade}</Text>
              )}
            </View>
          </View>
          {!!igreja?.instagram && (
            <TouchableOpacity style={styles.instagramBtn} onPress={abrirInstagram}>
              <Text style={styles.instagramText}>Abrir Instagram</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Versículo do dia */}
        <View style={styles.versiculoCard}>
          <Text style={styles.versiculoLabel}>✨ Versículo do dia</Text>
          {carregandoVersiculo ? (
            <Text style={styles.versiculoCarregando}>Carregando...</Text>
          ) : (
            <>
              <Text style={styles.versiculoTexto}>"{versiculo.texto}"</Text>
              <Text style={styles.versiculoReferencia}>{versiculo.referencia}</Text>
            </>
          )}
        </View>

        {/* Aniversariantes */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎂 Aniversariantes do mês</Text>
          {aniversariantesMes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum aniversariante neste mês.</Text>
          ) : (
            aniversariantesMes.map((item) => (
              <View key={item.id} style={styles.aniversarianteRow}>
                <Text style={styles.aniversarianteNome}>🎉 {item.nome}</Text>
                <Text style={styles.aniversarianteData}>
                  {formatarDiaMes(item.data_nascimento)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Acesso rápido */}
        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <View style={styles.grid}>
          <Botao icon="📢" label="Avisos" rota="/avisos" />
          <Botao icon="📚" label="Devocional" rota="/devocional" />
          <Botao icon="📖" label="Bíblia" rota="/biblia" />
          <Botao icon="🖼️" label="Galeria" rota="/galeria" />
          <Botao icon="🙏" label="Oração" rota="/oracao" />
          <Botao icon="💰" label="Contribuições" rota="/dizimos" />
          <Botao icon="😊" label="Emoções" rota="/emocoes" />

          {usuarioLogado && (
            <Botao icon="👥" label="Membros" rota="/membros" />
          )}

          <Botao icon="👤" label="Perfil" rota="/perfil" />

          {isAdmin && (
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => router.push("/admin")}
            >
              <Text style={styles.icon}>⚙️</Text>
              <Text style={styles.adminText}>Painel Admin</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Botao({ icon, label, rota }: { icon: string; label: string; rota: string }) {
  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(rota as any)}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 180 },

  hero: { backgroundColor: "#065f46", borderRadius: 24, padding: 20, marginBottom: 18 },
  heroHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  heroLogo: { width: 60, height: 60, marginRight: 12, borderRadius: 12, backgroundColor: "#fff" },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  heroSub: { color: "#d1fae5", fontSize: 14 },
  heroText: { color: "#ecfdf5", fontSize: 15, lineHeight: 24 },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardLabel: { fontSize: 13, fontWeight: "700", color: "#065f46", marginBottom: 6 },
  igrejaRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  igrejaLogo: { width: 50, height: 50, marginRight: 10, borderRadius: 10 },
  igrejaNome: { fontSize: 20, fontWeight: "800" },
  igrejaCidade: { fontSize: 14, color: "#6b7280" },
  instagramBtn: {
    backgroundColor: "#065f46",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  instagramText: { color: "#fff", fontWeight: "700" },

  // Versículo com destaque especial
  versiculoCard: {
    backgroundColor: "#065f46",
    padding: 22,
    borderRadius: 18,
    marginBottom: 16,
  },
  versiculoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#a7f3d0",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  versiculoTexto: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#fff",
    lineHeight: 30,
    marginBottom: 12,
  },
  versiculoReferencia: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6ee7b7",
  },
  versiculoCarregando: {
    fontSize: 15,
    color: "#a7f3d0",
    fontStyle: "italic",
  },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  emptyText: { color: "#6b7280", fontSize: 15 },
  aniversarianteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  aniversarianteNome: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1, marginRight: 8 },
  aniversarianteData: { fontSize: 14, fontWeight: "700", color: "#065f46" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  icon: { fontSize: 30, marginBottom: 6 },
  label: { fontWeight: "700", textAlign: "center", color: "#111827" },
  adminBtn: {
    width: "48%",
    backgroundColor: "#065f46",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  adminText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
