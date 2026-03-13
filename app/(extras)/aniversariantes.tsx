


import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AniversariantesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Aniversariantes 🎉</Text>

        <View style={styles.card}>
          <Text style={styles.big}>Em desenvolvimento</Text>
          <Text style={styles.desc}>
            Em breve você poderá visualizar os aniversariantes do mês e enviar
            felicitações diretamente pelo app.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#071A2B" },
  container: { flex: 1, padding: 18, gap: 12 },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  card: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  big: {
    color: "#FFD166",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  desc: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
});
