import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

const MASTER_EMAIL = "silvals.dev@gmail.com";

type PerfilInfo = {
  nome: string;
  email: string;
  nivel: string;
};

type IgrejaInfo = {
  nome: string;
  cidade?: string | null;
};

export default function PerfilScreen() {
  const [loading, setLoading] = useState(true);
  const [logado, setLogado] = useState(false);
  const [mostrarMaster, setMostrarMaster] = useState(false);

  const [perfil, setPerfil] = useState<PerfilInfo>({
    nome: "Visitante",
    email: "Não informado",
    nivel: "Membro",
  });

  const [igrejaAtual, setIgrejaAtual] = useState<IgrejaInfo | null>(null);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      setLoading(true);

      const igrejaSalva = await obterIgrejaSelecionada();

      if (igrejaSalva) {
        setIgrejaAtual({
          nome: igrejaSalva.nome,
          cidade: igrejaSalva.cidade || "",
        });
      } else {
        setIgrejaAtual(null);
      }

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setLogado(false);
        setMostrarMaster(false);
        setPerfil({
          nome: "Visitante",
          email: "Não informado",
          nivel: "Membro",
        });
        return;
      }

      setLogado(true);

      const email = (user.email || "").toLowerCase();
      setMostrarMaster(email === MASTER_EMAIL.toLowerCase());

      const nomeBase =
        (user.user_metadata?.nome as string) ||
        (user.user_metadata?.name as string) ||
        user.email?.split("@")[0] ||
        "Usuário";

      let nivel = "Membro";
      let nomeFinal = nomeBase;

      if (user.email) {
        const { data } = await supabase
          .from("admin_users")
          .select("role,nome")
          .eq("email", user.email)
          .limit(10);

        if (data && data.length > 0) {
          const primeiro = data[0];

          if (primeiro?.role === "admin") nivel = "Admin";
          if (primeiro?.role === "lider") nivel = "Líder";

          if (primeiro?.nome) {
            nomeFinal = primeiro.nome;
          }
        }
      }

      setPerfil({
        nome: nomeFinal,
        email: user.email || "Não informado",
        nivel,
      });
    } catch (error: any) {
      Alert.alert("Perfil", error?.message || "Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function sair() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("Sessão", error.message);
        return;
      }

      setLogado(false);
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Sessão", error?.message || "Não foi possível sair.");
    }
  }

  function trocarIgreja() {
    router.replace("/");
  }

  function abrirMaster() {
    router.push("/master");
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!logado) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.subtitle}>Entre ou crie uma conta para continuar</Text>

          {igrejaAtual && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Igreja atual</Text>
              <Text style={styles.value}>{igrejaAtual.nome}</Text>
              {!!igrejaAtual.cidade && (
                <Text style={styles.cityText}>{igrejaAtual.cidade}</Text>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={trocarIgreja}
              >
                <Text style={styles.secondaryButtonText}>Trocar igreja</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acesso</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/cadastro")}
            >
              <Text style={styles.secondaryButtonText}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Seus dados e acessos</Text>

        {igrejaAtual && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Igreja atual</Text>
            <Text style={styles.value}>{igrejaAtual.nome}</Text>
            {!!igrejaAtual.cidade && (
              <Text style={styles.cityText}>{igrejaAtual.cidade}</Text>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={trocarIgreja}
            >
              <Text style={styles.secondaryButtonText}>Trocar igreja</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>

          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{perfil.nome}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{perfil.email}</Text>

          <Text style={styles.label}>Nível</Text>
          <Text style={styles.value}>{perfil.nivel}</Text>
        </View>

        {mostrarMaster && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Área Master</Text>

            <TouchableOpacity style={styles.masterButton} onPress={abrirMaster}>
              <Text style={styles.masterButtonText}>Abrir painel master</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sessão</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={sair}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 20,
    backgroundColor: "#f3f4f6",
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
    fontSize: 14,
    color: "#6b7280",
    marginTop: 10,
    marginBottom: 6,
  },
  value: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  cityText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#065f46",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 16,
  },
  masterButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  masterButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#b91c1c",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
});
