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

const MASTER_EMAIL = "silvals.dev@gmail.com";

type Igreja = {
  id: string;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
  ativa?: boolean | null;
  instagram?: string | null;
  pix?: string | null;
  cor_tema?: string | null;
  logo_url?: string | null;
  created_at?: string;
};

type AdminUser = {
  id?: string;
  nome?: string | null;
  email: string;
  role: string;
  igreja_id: string;
  created_at?: string;
};

export default function MasterScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autorizado, setAutorizado] = useState(false);

  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [salvandoIgreja, setSalvandoIgreja] = useState(false);
  const [salvandoAdmin, setSalvandoAdmin] = useState(false);

  const [nomeIgreja, setNomeIgreja] = useState("");
  const [cidadeIgreja, setCidadeIgreja] = useState("");
  const [estadoIgreja, setEstadoIgreja] = useState("");
  const [instagramIgreja, setInstagramIgreja] = useState("");
  const [pixIgreja, setPixIgreja] = useState("");
  const [corTemaIgreja, setCorTemaIgreja] = useState("#065f46");
  const [logoUrlIgreja, setLogoUrlIgreja] = useState("");

  const [adminNome, setAdminNome] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState<"admin" | "lider">("admin");
  const [igrejaSelecionadaId, setIgrejaSelecionadaId] = useState("");

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    try {
      setLoading(true);

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user?.email || user.email.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
        setAutorizado(false);
        return;
      }

      setAutorizado(true);
      await Promise.all([carregarIgrejas(), carregarAdmins()]);
    } catch (error) {
      console.log("Erro no painel master:", error);
      setAutorizado(false);
    } finally {
      setLoading(false);
    }
  }

  async function carregarIgrejas() {
    const { data, error } = await supabase
      .from("igrejas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Master", error.message);
      setIgrejas([]);
      return;
    }

    const lista = (data as Igreja[]) || [];
    setIgrejas(lista);

    if (!igrejaSelecionadaId && lista.length > 0) {
      setIgrejaSelecionadaId(lista[0].id);
    }
  }

  async function carregarAdmins() {
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Master", error.message);
      setAdmins([]);
      return;
    }

    setAdmins((data as AdminUser[]) || []);
  }

  async function atualizar() {
    try {
      setRefreshing(true);
      await Promise.all([carregarIgrejas(), carregarAdmins()]);
    } finally {
      setRefreshing(false);
    }
  }

  function limparFormularioIgreja() {
    setNomeIgreja("");
    setCidadeIgreja("");
    setEstadoIgreja("");
    setInstagramIgreja("");
    setPixIgreja("");
    setCorTemaIgreja("#065f46");
    setLogoUrlIgreja("");
  }

  function limparFormularioAdmin() {
    setAdminNome("");
    setAdminEmail("");
    setAdminRole("admin");
  }

  async function cadastrarIgreja() {
    try {
      if (!nomeIgreja.trim()) {
        Alert.alert("Igrejas", "Informe o nome da igreja.");
        return;
      }

      setSalvandoIgreja(true);

      const payload = {
        nome: nomeIgreja.trim(),
        cidade: cidadeIgreja.trim() || null,
        estado: estadoIgreja.trim() || null,
        ativa: true,
        instagram: instagramIgreja.trim() || null,
        pix: pixIgreja.trim() || null,
        cor_tema: corTemaIgreja.trim() || "#065f46",
        logo_url: logoUrlIgreja.trim() || null,
      };

      const { error } = await supabase.from("igrejas").insert([payload]);

      if (error) {
        Alert.alert("Igrejas", error.message);
        return;
      }

      Alert.alert("Sucesso", "Igreja cadastrada com sucesso.");
      limparFormularioIgreja();
      await carregarIgrejas();
    } catch (error: any) {
      Alert.alert("Igrejas", error?.message || "Erro ao cadastrar igreja.");
    } finally {
      setSalvandoIgreja(false);
    }
  }

  async function vincularAdmin() {
    try {
      if (!igrejaSelecionadaId) {
        Alert.alert("Admins", "Selecione uma igreja.");
        return;
      }

      if (!adminEmail.trim()) {
        Alert.alert("Admins", "Informe o email do admin.");
        return;
      }

      setSalvandoAdmin(true);

      const payload = {
        nome: adminNome.trim() || null,
        email: adminEmail.trim().toLowerCase(),
        role: adminRole,
        igreja_id: igrejaSelecionadaId,
      };

      const { error } = await supabase.from("admin_users").insert([payload]);

      if (error) {
        Alert.alert("Admins", error.message);
        return;
      }

      Alert.alert("Sucesso", "Admin vinculado com sucesso.");
      limparFormularioAdmin();
      await carregarAdmins();
    } catch (error: any) {
      Alert.alert("Admins", error?.message || "Erro ao vincular admin.");
    } finally {
      setSalvandoAdmin(false);
    }
  }

  async function alternarStatusIgreja(igreja: Igreja) {
    try {
      const { error } = await supabase
        .from("igrejas")
        .update({ ativa: !igreja.ativa })
        .eq("id", igreja.id);

      if (error) {
        Alert.alert("Igrejas", error.message);
        return;
      }

      await carregarIgrejas();
    } catch (error: any) {
      Alert.alert("Igrejas", error?.message || "Erro ao atualizar igreja.");
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

  function nomeIgrejaPorId(id: string) {
    const igreja = igrejas.find((item) => item.id === id);
    if (!igreja) return id;
    return igreja.cidade ? `${igreja.nome} - ${igreja.cidade}` : igreja.nome;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Verificando acesso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!autorizado) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Acesso restrito</Text>
          <Text style={styles.subtitle}>
            Este painel é exclusivo do administrador do sistema.
          </Text>
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
        <Text style={styles.title}>Painel Master</Text>
        <Text style={styles.subtitle}>
          Cadastre igrejas e vincule administradores
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nova igreja</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome da igreja"
            placeholderTextColor="#9ca3af"
            value={nomeIgreja}
            onChangeText={setNomeIgreja}
          />

          <TextInput
            style={styles.input}
            placeholder="Cidade"
            placeholderTextColor="#9ca3af"
            value={cidadeIgreja}
            onChangeText={setCidadeIgreja}
          />

          <TextInput
            style={styles.input}
            placeholder="Estado"
            placeholderTextColor="#9ca3af"
            value={estadoIgreja}
            onChangeText={setEstadoIgreja}
          />

          <TextInput
            style={styles.input}
            placeholder="Instagram"
            placeholderTextColor="#9ca3af"
            value={instagramIgreja}
            onChangeText={setInstagramIgreja}
          />

          <TextInput
            style={styles.input}
            placeholder="Pix"
            placeholderTextColor="#9ca3af"
            value={pixIgreja}
            onChangeText={setPixIgreja}
          />

          <TextInput
            style={styles.input}
            placeholder="Cor do tema (ex: #065f46)"
            placeholderTextColor="#9ca3af"
            value={corTemaIgreja}
            onChangeText={setCorTemaIgreja}
          />

          <TextInput
            style={styles.input}
            placeholder="Logo URL"
            placeholderTextColor="#9ca3af"
            value={logoUrlIgreja}
            onChangeText={setLogoUrlIgreja}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={cadastrarIgreja}
            disabled={salvandoIgreja}
          >
            {salvandoIgreja ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Cadastrar igreja</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vincular admin</Text>

          <Text style={styles.label}>Selecione a igreja</Text>
          <View style={styles.optionWrap}>
            {igrejas.map((igreja) => {
              const ativo = igrejaSelecionadaId === igreja.id;
              const nome = igreja.cidade
                ? `${igreja.nome} - ${igreja.cidade}`
                : igreja.nome;

              return (
                <TouchableOpacity
                  key={igreja.id}
                  style={[
                    styles.optionButton,
                    ativo && styles.optionButtonActive,
                  ]}
                  onPress={() => setIgrejaSelecionadaId(igreja.id)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      ativo && styles.optionButtonTextActive,
                    ]}
                  >
                    {nome}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nome do admin"
            placeholderTextColor="#9ca3af"
            value={adminNome}
            onChangeText={setAdminNome}
          />

          <TextInput
            style={styles.input}
            placeholder="Email do admin"
            placeholderTextColor="#9ca3af"
            value={adminEmail}
            onChangeText={setAdminEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Perfil</Text>
          <View style={styles.optionWrap}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                adminRole === "admin" && styles.optionButtonActive,
              ]}
              onPress={() => setAdminRole("admin")}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  adminRole === "admin" && styles.optionButtonTextActive,
                ]}
              >
                Admin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                adminRole === "lider" && styles.optionButtonActive,
              ]}
              onPress={() => setAdminRole("lider")}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  adminRole === "lider" && styles.optionButtonTextActive,
                ]}
              >
                Líder
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={vincularAdmin}
            disabled={salvandoAdmin}
          >
            {salvandoAdmin ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Vincular admin</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Igrejas cadastradas</Text>

          {igrejas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma igreja cadastrada.</Text>
          ) : (
            igrejas.map((igreja) => (
              <View key={igreja.id} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{igreja.nome}</Text>

                {!!igreja.cidade && (
                  <Text style={styles.itemText}>
                    {igreja.cidade}
                    {!!igreja.estado ? ` - ${igreja.estado}` : ""}
                  </Text>
                )}

                {!!igreja.instagram && (
                  <Text style={styles.itemText}>Instagram: {igreja.instagram}</Text>
                )}

                {!!igreja.pix && (
                  <Text style={styles.itemText}>Pix: {igreja.pix}</Text>
                )}

                {!!igreja.cor_tema && (
                  <Text style={styles.itemText}>Cor: {igreja.cor_tema}</Text>
                )}

                <Text style={styles.itemText}>
                  Status: {igreja.ativa ? "Ativa" : "Inativa"}
                </Text>

                {!!igreja.created_at && (
                  <Text style={styles.smallMuted}>
                    {formatarData(igreja.created_at)}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => alternarStatusIgreja(igreja)}
                >
                  <Text style={styles.secondaryButtonText}>
                    {igreja.ativa ? "Desativar" : "Ativar"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admins vinculados</Text>

          {admins.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum admin cadastrado.</Text>
          ) : (
            admins.map((admin, index) => (
              <View key={`${admin.email}-${admin.igreja_id}-${index}`} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{admin.nome || "Sem nome"}</Text>
                <Text style={styles.itemText}>{admin.email}</Text>
                <Text style={styles.itemText}>Perfil: {admin.role}</Text>
                <Text style={styles.itemText}>
                  Igreja: {nomeIgrejaPorId(admin.igreja_id)}
                </Text>

                {!!admin.created_at && (
                  <Text style={styles.smallMuted}>
                    {formatarData(admin.created_at)}
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
    textAlign: "center",
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
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
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
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  primaryButton: {
    backgroundColor: "#065f46",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "800",
  },
  itemCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  itemText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  smallMuted: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  emptyText: {
    color: "#6b7280",
  },
});
