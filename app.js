
// App.js (com Galeria + Curtir + Compartilhar) — 1 arquivo só
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Share,
  SafeAreaView,
  Platform,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { createClient } from "@supabase/supabase-js";

// =========================
// SUPABASE (ENV)
// =========================
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL?.trim?.();
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim?.();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// UI Helpers
// =========================
const colors = {
  bg: "#F2F5F8",
  card: "#FFFFFF",
  text: "#0B1220",
  muted: "#6B7280",
  primary: "#0B5FFF",
  border: "#E5E7EB",
};

function Btn({ title, onPress, kind = "primary" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: kind === "primary" ? colors.primary : colors.card,
        borderWidth: kind === "primary" ? 0 : 1,
        borderColor: colors.border,
        alignItems: "center",
      }}
    >
      <Text style={{ color: kind === "primary" ? "#fff" : colors.text, fontWeight: "700" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Card({ children }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {children}
    </View>
  );
}

// =========================
// AUTH SCREEN
// =========================
function LoginScreen() {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function entrar() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) throw error;
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 18, flex: 1, justifyContent: "center" }}>
        <Text style={{ fontSize: 32, fontWeight: "900", color: colors.text }}>Login</Text>
        <Text style={{ marginTop: 6, color: colors.muted }}>
          Entre para acessar o app.
        </Text>

        <View style={{ marginTop: 18 }}>
          <Text style={{ color: colors.muted, marginBottom: 6 }}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seuemail@email.com"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
            }}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.muted, marginBottom: 6 }}>Senha</Text>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="********"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
            }}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Btn title="Entrar" onPress={entrar} />
          )}
        </View>

        <Text style={{ marginTop: 14, color: colors.muted, fontSize: 12 }}>
          Dica: se aparecer “Invalid API key”, confira as variáveis EXPO_PUBLIC_SUPABASE_URL e
          EXPO_PUBLIC_SUPABASE_ANON_KEY no EAS/Expo.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// =========================
// SCREENS (TABS)
// =========================
function AvisosScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 18 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Avisos</Text>
          <Text style={{ marginTop: 6, color: colors.muted }}>
            Tela de avisos (placeholder).
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

function VersiculosScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 18 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Versículos</Text>
          <Text style={{ marginTop: 6, color: colors.muted }}>
            Tela de versículos (placeholder).
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

function PerfilScreen() {
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email || "");
    })();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 18 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Perfil</Text>
          <Text style={{ marginTop: 8, color: colors.muted }}>Logado como:</Text>
          <Text style={{ marginTop: 4, color: colors.text, fontWeight: "700" }}>{email}</Text>

          <View style={{ marginTop: 14 }}>
            <Btn title="Sair" onPress={sair} kind="secondary" />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

// =========================
// GALERIA (curtir + compartilhar)
// Tabelas:
// - public.galeria: id (uuid), imagem (text), likes_count (int4), created_at...
// - public.galeria_likes: user_id (uuid), foto_id (uuid), created_at...
// RPC:
// - increment_likes(foto_id uuid)
// =========================
function GaleriaScreen() {
  const [loading, setLoading] = React.useState(true);
  const [fotos, setFotos] = React.useState([]);
  const [likedMap, setLikedMap] = React.useState({});
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("galeria")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const lista = data || [];
      setFotos(lista);

      // mapa de curtidas do usuário
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userId && lista.length > 0) {
        const ids = lista.map((i) => i.id);

        const { data: myLikes, error: e2 } = await supabase
          .from("galeria_likes")
          .select("foto_id")
          .in("foto_id", ids)
          .eq("user_id", userId);

        // Se a policy bloquear, não quebra a galeria
        if (!e2) {
          const map = {};
          myLikes?.forEach((l) => (map[l.foto_id] = true));
          setLikedMap(map);
        }
      }
    } catch (e) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await carregarTudo();
    setRefreshing(false);
  }

  async function curtirFoto(fotoId) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        Alert.alert("Login", "Você precisa estar logado.");
        return;
      }

      if (likedMap[fotoId]) {
        Alert.alert("❤️", "Você já curtiu.");
        return;
      }

      // 1) salva like
      const { error: e1 } = await supabase.from("galeria_likes").insert({
        user_id: userId,
        foto_id: fotoId,
      });
      if (e1) throw e1;

      // 2) incrementa contador da foto
      const { error: e2 } = await supabase.rpc("increment_likes", { foto_id: fotoId });
      if (e2) throw e2;

      // otimista (melhor UX)
      setLikedMap((prev) => ({ ...prev, [fotoId]: true }));
      setFotos((prev) =>
        prev.map((f) =>
          f.id === fotoId ? { ...f, likes_count: (f.likes_count || 0) + 1 } : f
        )
      );
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  }

  async function compartilharFoto(url) {
    try {
      await Share.share({
        message: url,
        url,
      });
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  }

  function renderItem({ item }) {
    const curtido = !!likedMap[item.id];
    const likes = item.likes_count || 0;

    return (
      <View
        style={{
          marginHorizontal: 14,
          marginTop: 14,
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: item.imagem }}
          style={{ width: "100%", height: 240, backgroundColor: "#EEE" }}
          resizeMode="cover"
        />

        <View style={{ padding: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => curtirFoto(item.id)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: curtido ? "#FFE4E6" : "#F3F4F6",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800", color: colors.text }}>
                {curtido ? "❤️ Curtido" : "🤍 Curtir"} ({likes})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => compartilharFoto(item.imagem)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800", color: colors.text }}>🔁 Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ textAlign: "center", color: colors.muted, marginTop: 10 }}>
            Carregando galeria...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={fotos}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={{ padding: 18 }}>
            <Card>
              <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                Nenhuma foto ainda.
              </Text>
              <Text style={{ marginTop: 6, color: colors.muted }}>
                Envie uma foto e ela aparecerá aqui.
              </Text>
            </Card>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// =========================
// APP ROOT (Auth Gate + Tabs)
// =========================
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 90 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen name="Avisos" component={AvisosScreen} />
      <Tab.Screen name="Galeria" component={GaleriaScreen} />
      <Tab.Screen name="Versículos" component={VersiculosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = React.useState(null);
  const [booting, setBooting] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data?.session || null);
        setBooting(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (booting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      {session ? <Tabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}
