import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function PedidoOracaoScreen() {
  const [nome, setNome] = useState("");
  const [pedido, setPedido] = useState("");
  const [loading, setLoading] = useState(false);

  const [lista, setLista] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    loadPedidos();
  }, []);

  async function loadPedidos() {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from("pedidos_oracao")
        .select("id, nome, pedido, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      setLista(data || []);
    } catch (e) {
      console.log("loadPedidos error:", e?.message || e);
    } finally {
      setLoadingList(false);
    }
  }

  async function enviar() {
    if (!pedido || pedido.trim().length < 5) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("pedidos_oracao").insert({
        nome: nome?.trim() || null,
        pedido: pedido.trim(),
        is_public: true,
      });
      if (error) throw error;

      setNome("");
      setPedido("");
      await loadPedidos();
    } catch (e) {
      console.log("enviar pedido error:", e?.message || e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 14 }}>
      <Text style={{ fontSize: 18, fontWeight: "800" }}>🙏 Pedido de Oração</Text>
      <Text style={{ marginTop: 6, opacity: 0.7 }}>
        Escreva seu pedido. (Ele será exibido na lista)
      </Text>

      <View style={{ marginTop: 12, backgroundColor: "#fff", borderRadius: 14, padding: 12 }}>
        <Text style={{ fontWeight: "700" }}>Nome (opcional)</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Leandro"
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 12,
            padding: 10,
          }}
        />

        <Text style={{ fontWeight: "700", marginTop: 12 }}>Pedido</Text>
        <TextInput
          value={pedido}
          onChangeText={setPedido}
          placeholder="Digite aqui..."
          multiline
          style={{
            marginTop: 8,
            minHeight: 90,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            borderRadius: 12,
            padding: 10,
            textAlignVertical: "top",
          }}
        />

        <Pressable
          onPress={enviar}
          disabled={loading || pedido.trim().length < 5}
          style={{
            marginTop: 12,
            backgroundColor: loading || pedido.trim().length < 5 ? "#9CA3AF" : "#111827",
            padding: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {loading ? "Enviando..." : "Enviar pedido"}
          </Text>
        </Pressable>
      </View>

      <Text style={{ marginTop: 16, fontSize: 16, fontWeight: "800" }}>📌 Pedidos recentes</Text>

      {loadingList ? (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          style={{ marginTop: 10 }}
          data={lista}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: "#fff", padding: 12, borderRadius: 14, marginBottom: 10 }}>
              <Text style={{ fontWeight: "800" }}>{item.nome || "Anônimo"}</Text>
              <Text style={{ marginTop: 6 }}>{item.pedido}</Text>
              <Text style={{ marginTop: 8, opacity: 0.6, fontSize: 12 }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
