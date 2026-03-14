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
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

type IgrejaSelecionada = {
  id: string;
  nome: string;
  cidade?: string | null;
};

type Membro = {
  id: string;
  igreja_id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  estado_civil?: string | null;
  status?: string | null;
  batizado?: boolean | null;
  created_at?: string;
};

const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"];
const STATUS_OPCOES = ["Ativo", "Inativo"];

export default function MembrosScreen() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [igreja, setIgreja] = useState<IgrejaSelecionada | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);

  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [podeVerMembros, setPodeVerMembros] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("Solteiro(a)");
  const [status, setStatus] = useState("Ativo");
  const [batizado, setBatizado] = useState<boolean | null>(null);

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUsuarioLogado(false);
        return;
      }

      setUsuarioLogado(true);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.log("Erro ao buscar perfil:", profileError.message);
      }

      const role = profile?.role;
      const podeVer = role === "admin" || role === "lider";
      setPodeVerMembros(podeVer);

      const igrejaSalva = await obterIgrejaSelecionada();

      if (!igrejaSalva?.id) {
        setIgreja(null);
        setMembros([]);
        return;
      }

      setIgreja({
        id: igrejaSalva.id,
        nome: igrejaSalva.nome,
        cidade: igrejaSalva.cidade || "",
      });

      if (podeVer) {
        await carregarMembros(igrejaSalva.id);
      } else {
        setMembros([]);
      }
    } catch (error: any) {
      Alert.alert("Membros", error?.message || "Erro ao carregar membros.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarMembros(igrejaId: string) {
    const { data, error } = await supabase
      .from("membros")
      .select("*")
      .eq("igreja_id", igrejaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar membros:", error.message);
      setMembros([]);
      return;
    }

    setMembros((data as Membro[]) || []);
  }

  async function atualizar() {
    if (!igreja?.id || !podeVerMembros) return;

    try {
      setRefreshing(true);
      await carregarMembros(igreja.id);
    } finally {
      setRefreshing(false);
    }
  }

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setEmail("");
    setDataNascimento("");
    setEndereco("");
    setEstadoCivil("Solteiro(a)");
    setStatus("Ativo");
    setBatizado(null);
  }

  async function cadastrarMembro() {
    try {
      if (!usuarioLogado) {
        Alert.alert("Membros", "Faça login para cadastrar membros.");
        router.replace("/login");
        return;
      }

      if (!igreja?.id) {
        Alert.alert("Membros", "Igreja não identificada.");
        return;
      }

      if (!nome.trim()) {
        Alert.alert("Membros", "Informe o nome completo.");
        return;
      }

      setSalvando(true);

      const payload = {
        igreja_id: igreja.id,
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        data_nascimento: dataNascimento.trim() || null,
        endereco: endereco.trim() || null,
        estado_civil: estadoCivil,
        status,
        batizado,
      };

      const { error } = await supabase.from("membros").insert([payload]);

      if (error) {
        Alert.alert("Membros", error.message);
        return;
      }

      Alert.alert("Sucesso", "Membro cadastrado com sucesso.");
      limparFormulario();

      if (podeVerMembros) {
        await carregarMembros(igreja.id);
      }
    } catch (error: any) {
      Alert.alert("Membros", error?.message || "Erro ao cadastrar membro.");
    } finally {
      setSalvando(false);
    }
  }

  function formatarData(data?: string) {
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
          <Text style={styles.loadingText}>Carregando membros...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!usuarioLogado) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.lockTitle}>🔒 Área restrita</Text>
          <Text style={styles.lockSubtitle}>
            Faça login para acessar o cadastro de membros.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.primaryButtonText}>Fazer login</Text>
          </TouchableOpacity>
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
        <Text style={styles.title}>Cadastro de Membros</Text>
        <Text style={styles.subtitle}>
          Uma proposta de secretaria digital para a igreja
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Igreja selecionada</Text>
          <Text style={styles.cardValue}>
            {igreja?.cidade ? `${igreja.nome} - ${igreja.cidade}` : igreja?.nome || "Igreja"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Novo membro</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#9ca3af"
            value={nome}
            onChangeText={setNome}
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#9ca3af"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Data de nascimento"
            placeholderTextColor="#9ca3af"
            value={dataNascimento}
            onChangeText={setDataNascimento}
          />

          <TextInput
            style={styles.input}
            placeholder="Endereço"
            placeholderTextColor="#9ca3af"
            value={endereco}
            onChangeText={setEndereco}
          />

          <Text style={styles.sectionTitle}>Estado civil</Text>
          <View style={styles.optionWrap}>
            {ESTADOS_CIVIS.map((item) => {
              const ativo = estadoCivil === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionButton, ativo && styles.optionButtonActive]}
                  onPress={() => setEstadoCivil(item)}
                >
                  <Text style={[styles.optionText, ativo && styles.optionTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.optionWrap}>
            {STATUS_OPCOES.map((item) => {
              const ativo = status === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.optionButton, ativo && styles.optionButtonActive]}
                  onPress={() => setStatus(item)}
                >
                  <Text style={[styles.optionText, ativo && styles.optionTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Batizado?</Text>
          <View style={styles.optionWrap}>
            <TouchableOpacity
              style={[styles.optionButton, batizado === true && styles.optionButtonActive]}
              onPress={() => setBatizado(true)}
            >
              <Text style={[styles.optionText, batizado === true && styles.optionTextActive]}>
                Sim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, batizado === false && styles.optionButtonActive]}
              onPress={() => setBatizado(false)}
            >
              <Text style={[styles.optionText, batizado === false && styles.optionTextActive]}>
                Não
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={cadastrarMembro}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Cadastrar membro</Text>
            )}
          </TouchableOpacity>
        </View>

        {podeVerMembros && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Membros cadastrados</Text>

            {membros.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum membro cadastrado ainda.</Text>
            ) : (
              membros.map((membro) => (
                <View key={membro.id} style={styles.memberCard}>
                  <Text style={styles.memberName}>{membro.nome}</Text>

                  {!!membro.telefone && (
                    <Text style={styles.memberText}>Telefone: {membro.telefone}</Text>
                  )}
                  {!!membro.email && (
                    <Text style={styles.memberText}>E-mail: {membro.email}</Text>
                  )}
                  {!!membro.data_nascimento && (
                    <Text style={styles.memberText}>Nascimento: {membro.data_nascimento}</Text>
                  )}
                  {!!membro.endereco && (
                    <Text style={styles.memberText}>Endereço: {membro.endereco}</Text>
                  )}
                  {!!membro.estado_civil && (
                    <Text style={styles.memberText}>Estado civil: {membro.estado_civil}</Text>
                  )}
                  {!!membro.status && (
                    <Text style={styles.memberText}>Status: {membro.status}</Text>
                  )}

                  <Text style={styles.memberText}>
                    Batizado:{" "}
                    {membro.batizado === true
                      ? "Sim"
                      : membro.batizado === false
                      ? "Não"
                      : "Não informado"}
                  </Text>

                  {!!membro.created_at && (
                    <Text style={styles.smallMuted}>{formatarData(membro.created_at)}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: { paddingBottom: 120 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 30,
  },
  loadingText: { marginTop: 10, color: "#6b7280" },
  lockTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  lockSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
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
  cardLabel: { fontSize: 14, color: "#065f46", fontWeight: "700", marginBottom: 8 },
  cardValue: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 10 },
  optionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  optionButton: { backgroundColor: "#e5e7eb", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999 },
  optionButtonActive: { backgroundColor: "#065f46" },
  optionText: { fontSize: 16, color: "#111827", fontWeight: "700" },
  optionTextActive: { color: "#fff" },
  primaryButton: {
    backgroundColor: "#065f46",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "bold" },
  memberCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  memberName: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 10 },
  memberText: { fontSize: 15, color: "#4b5563", marginBottom: 6 },
  smallMuted: { marginTop: 10, fontSize: 13, color: "#6b7280" },
  emptyText: { color: "#6b7280", fontSize: 15 },
});
