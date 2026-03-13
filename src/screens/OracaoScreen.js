import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function OracaoScreen() {
  const [nome, setNome] = useState("");
  const [pedido, setPedido] = useState("");

  async function enviarPedido() {
    if (!pedido) return Alert.alert("Digite seu pedido");

    const { error } = await supabase.from("oracao").insert({
      nome,
      pedido,
    });

    if (!error) {
      Alert.alert("Pedido enviado 🙏");
      setNome("");
      setPedido("");
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Seu nome (opcional)"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        placeholder="Digite seu pedido de oração"
        style={[styles.input, { height: 120 }]}
        multiline
        value={pedido}
        onChangeText={setPedido}
      />

      <Button title="Enviar pedido 🙏" onPress={enviarPedido} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
  },
});
