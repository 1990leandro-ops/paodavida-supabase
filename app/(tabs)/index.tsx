import { useEffect, useMemo, useState } from "react";
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

const VERSICULOS = [
  {
    referencia: "Jó 42:2",
    texto:
      "Bem sei que tudo podes, e nenhum dos teus planos pode ser frustrado.",
  },
  {
    referencia: "Salmos 37:5",
    texto: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.",
  },
  {
    referencia: "Provérbios 3:5",
    texto:
      "Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento.",
  },
  {
    referencia: "Isaías 41:10",
    texto:
      "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.",
  },
  {
    referencia: "Romanos 8:28",
    texto:
      "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus.",
  },
];

export default function HomeScreen() {
  const [igreja, setIgreja] = useState<Igreja | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [aniversariantesMes, setAniversariantesMes] = useState<
    MembroAniversariante[]
  >([]);

  useEffect(() => {
    carregarIgreja();
    verificarAdmin();
    carregarAniversariantesDoMes();
  }, []);

  async function verificarAdmin() {
    try {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.log("Erro ao verificar admin:", error);
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

      if (data) {
        setIgreja(data);
      }
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
            if (partes.length >= 2) {
              const mes = Number(partes[1]);
              return mes === mesAtual;
            }
          }

          const dataNascimento = new Date(texto);
          if (Number.isNaN(dataNascimento.getTime())) return false;

          return dataNascimento.getMonth() + 1 === mesAtual;
        }) || [];

      filtrados.sort((a, b) => {
        const diaA = extrairDia(a.data_nascimento);
        const diaB = extrairDia(b.data_nascimento);
        return diaA - diaB;
      });

      setAniversariantesMes(filtrados);
    } catch (error) {
      console.log("Erro geral ao carregar aniversariantes do mês:", error);
      setAniversariantesMes([]);
    }
  }

  function extrairDia(data?: string | null) {
    if (!data) return 99;

    const texto = String(data).trim();

    if (texto.includes("/")) {
      const partes = texto.split("/");
      return Number(partes[0]) || 99;
    }

    const dataConvertida = new Date(texto);
    if (Number.isNaN(dataConvertida.getTime())) return 99;

    return dataConvertida.getDate();
  }

  function formatarDiaMes(data?: string | null) {
    if (!data) return "";

    const texto = String(data).trim();

    if (texto.includes("/")) {
      const partes = texto.split("/");
      if (partes.length >= 2) {
        return `${partes[0].padStart(2, "0")}/${partes[1].padStart(2, "0")}`;
      }
    }

    const dataConvertida = new Date(texto);
    if (Number.isNaN(dataConvertida.getTime())) return "";

    const dia = String(dataConvertida.getDate()).padStart(2, "0");
    const mes = String(dataConvertida.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}`;
  }

  const versiculo = useMemo(() => {
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 0);
    const diff = hoje.getTime() - inicioAno.getTime();
    const dia = Math.floor(diff / 86400000);
    return VERSICULOS[dia % VERSICULOS.length];
  }, []);

  async function abrirInstagram() {
    if (!igreja?.instagram) return;

    const url = igreja.instagram.startsWith("http")
      ? igreja.instagram
      : `https://${igreja.instagram}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            {!!igreja?.logo_url && (
              <Image
                source={{ uri: igreja.logo_url }}
                style={styles.heroLogo}
              />
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

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Igreja selecionada</Text>

          <View style={styles.igrejaRow}>
            {!!igreja?.logo_url && (
              <Image
                source={{ uri: igreja.logo_url }}
                style={styles.igrejaLogo}
              />
            )}

            <View>
              <Text style={styles.igrejaNome}>{igreja?.nome}</Text>

              {!!igreja?.cidade && (
                <Text style={styles.igrejaCidade}>{igreja.cidade}</Text>
              )}
            </View>
          </View>

          {!!igreja?.instagram && (
            <TouchableOpacity
              style={styles.instagramBtn}
              onPress={abrirInstagram}
            >
              <Text style={styles.instagramText}>Abrir Instagram</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Versículo do dia</Text>

          <Text style={styles.versiculo}>“{versiculo.texto}”</Text>

          <Text style={styles.referencia}>{versiculo.referencia}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎂 Aniversariantes do mês</Text>

          {aniversariantesMes.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum aniversariante neste mês.
            </Text>
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

        <Text style={styles.sectionTitle}>Acesso rápido</Text>

        <View style={styles.grid}>
          <Botao icon="📢" label="Avisos" rota="/avisos" />
          <Botao icon="📚" label="Devocional" rota="/devocional" />
          <Botao icon="📖" label="Bíblia" rota="/biblia" />
          <Botao icon="🖼️" label="Galeria" rota="/galeria" />
          <Botao icon="🙏" label="Oração" rota="/oracao" />
          <Botao icon="💰" label="Contribuições" rota="/dizimos" />
          <Botao icon="😊" label="Emoções" rota="/emocoes" />
          <Botao icon="👥" label="Membros" rota="/membros" />
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

function Botao({
  icon,
  label,
  rota,
}: {
  icon: string;
  label: string;
  rota: string;
}) {
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
  safe: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 180,
  },

  hero: {
    backgroundColor: "#065f46",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },

  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  heroLogo: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },

  heroSub: {
    color: "#d1fae5",
    fontSize: 14,
  },

  heroText: {
    color: "#ecfdf5",
    fontSize: 15,
    lineHeight: 24,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 6,
  },

  igrejaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  igrejaLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 10,
  },

  igrejaNome: {
    fontSize: 20,
    fontWeight: "800",
  },

  igrejaCidade: {
    fontSize: 14,
    color: "#6b7280",
  },

  instagramBtn: {
    backgroundColor: "#065f46",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  instagramText: {
    color: "#fff",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  versiculo: {
    fontSize: 17,
    fontStyle: "italic",
    marginBottom: 8,
    color: "#111827",
    lineHeight: 28,
  },

  referencia: {
    fontWeight: "700",
    color: "#4b5563",
  },

  emptyText: {
    color: "#6b7280",
    fontSize: 15,
  },

  aniversarianteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  aniversarianteNome: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },

  aniversarianteData: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065f46",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

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

  icon: {
    fontSize: 30,
    marginBottom: 6,
  },

  label: {
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },

  adminBtn: {
    width: "48%",
    backgroundColor: "#065f46",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },

  adminText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});
