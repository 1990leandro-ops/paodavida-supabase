import { View, Text, FlatList, Image, TouchableOpacity, Linking } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Membros() {
  const [membros, setMembros] = useState([]);

  useEffect(() => {
    buscarMembros();
  }, []);

  async function buscarMembros() {
    const { data } = await supabase
      .from("membros")
      .select("*")
      .order("nome");

    setMembros(data || []);
  }

  function abrirWhatsApp(numero) {
    const url = `https://wa.me/55${numero}`;
    Linking.openURL(url);
  }

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <FlatList
        data={membros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#fff",
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: item.foto }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginRight: 10,
              }}
            />

            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>
              <Text>{item.cargo}</Text>
              <Text>🎂 {item.aniversario}</Text>
            </View>

            <TouchableOpacity
              onPress={() => abrirWhatsApp(item.telefone)}
              style={{
                backgroundColor: "#25D366",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
