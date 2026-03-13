import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Share, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import { getDeviceId } from "../lib/deviceId";

export default function GaleriaScreen() {
  const [fotos, setFotos] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    carregarFotos();
    getDeviceId().then(setDeviceId);
  }, []);

  async function carregarFotos() {
    const { data } = await supabase.from("galeria").select("*").order("id", { ascending: false });
    setFotos(data || []);
  }

  async function curtirFoto(fotoId) {
    await supabase.from("galeria_likes").insert({
      foto_id: fotoId,
      device_id: deviceId,
    });
    carregarFotos();
  }

  async function compartilhar(url) {
    await Share.share({
      message: `Veja essa foto da igreja IBA Pão da Vida Ilhéus ❤️ ${url}`,
    });
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.url }} style={styles.img} />

        <View style={styles.row}>
          <TouchableOpacity onPress={() => curtirFoto(item.id)}>
            <Text style={styles.btn}>❤️ Curtir</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => compartilhar(item.url)}>
            <Text style={styles.btn}>📤 Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={fotos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  card: { margin: 10 },
  img: { width: "100%", height: 220, borderRadius: 12 },
  row: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  btn: { fontSize: 16, color: "#0a7ea4" },
});
