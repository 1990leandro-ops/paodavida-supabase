import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

const PIX = "00020126580014br.gov.bcb.pix01364fb1957b-535d-4abc-9378-e93df92caac55204000053039865802BR5925IGREJA BATISTA APOSTOLICA6008SALVADOR622605226muLcLdZIZRI8Zd35PnMxH6304FDB6";

export default function DizimosScreen() {
  const [copiado, setCopiado] = useState(false);

  const copiarPix = async () => {
    await Clipboard.setStringAsync(PIX);
    setCopiado(true);
    Alert.alert("Copiado 🙌", "PIX copiado para a área de transferência");
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartilhar = async () => {
    const texto =
      "Dízimos & Ofertas — IBA Pão da Vida Ilhéus 🙏\n\n" +
      "PIX Copia e Cola:\n" +
      PIX;

    await Clipboard.setStringAsync(texto);
    Alert.alert("Pronto ✅", "Texto copiado. Cole no WhatsApp ou Instagram.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dízimos & Ofertas</Text>
      <Text style={styles.subtitle}>
        Sua contribuição ajuda a manter a obra e alcançar mais vidas.
      </Text>

      <View style={styles.card}>
        <Text style={styles.church}>IBA Pão da Vida Ilhéus</Text>

        {/* QR CODE PIX */}
        <View style={styles.qrBox}>
          <QRCode value={PIX} size={220} />
        </View>

        <Text style={styles.label}>PIX Copia e Cola</Text>

        <View style={styles.codeBox}>
          <Text selectable style={styles.codeText}>
            {PIX}
          </Text>
        </View>

        <Pressable style={[styles.btn, styles.primary]} onPress={copiarPix}>
          <Text style={styles.btnText}>{copiado ? "Copiado ✅" : "Copiar PIX"}</Text>
        </Pressable>

        <Pressable style={[styles.btn, styles.dark]} onPress={compartilhar}>
          <Text style={styles.btnText}>Compartilhar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#f6f8fb" },

  title: { fontSize: 26, fontWeight: "900", color: "#111827", marginBottom: 6 },
  subtitle: { color: "#374151", marginBottom: 14 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  church: { fontSize: 18, fontWeight: "900", marginBottom: 10 },

  qrBox: { marginVertical: 10 },

  label: { fontWeight: "800", marginTop: 10 },

  codeBox: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },

  codeText: { fontSize: 12 },

  btn: {
    width: "100%",
    height: 55,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  primary: { backgroundColor: "#2563eb" },
  dark: { backgroundColor: "#0f172a" },

  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
