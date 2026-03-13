import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  ScrollView,
} from "react-native";

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={require("../../assets/logo.png")}
        resizeMode="cover"
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Pão da Vida</Text>
          <Text style={styles.subtitle}>Igreja Batista Apostólica</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seja bem-vindo 🙏</Text>
            <Text style={styles.cardText}>
              Use as abas abaixo para acessar avisos, galeria, versículos e seu
              perfil.
            </Text>
          </View>

          {/* ✅ Texto do Ministério (voltou) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ministério Pão da Vida</Text>
            <Text style={styles.cardText}>
              O Ministério Pão da Vida, fundado em 1º de Setembro de 1999, tem
              como:
            </Text>

            <Text style={styles.sectionTitle}>VISÃO</Text>
            <Text style={styles.cardText}>
              Vidas saradas e discipuladas para serem instrumentos de Deus no
              mundo.
            </Text>

            <Text style={styles.sectionTitle}>MISSÃO</Text>
            <Text style={styles.cardText}>
              Promover a Cura e o Fortalecimento espiritual de cada pessoa,
              discipulando e equipando para que possa impactar o mundo ao seu
              redor.
            </Text>

            <Text style={styles.sectionTitle}>MÉTODO</Text>
            <Text style={styles.cardText}>
              Priorizamos o método centrado no discipulado promovendo a cura
              interior e o crescimento espiritual bem como o envolvimento ativo
              dos membros em compartilhar a fé.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f3f3" },

  bg: { flex: 1 },
  bgImage: {
    opacity: 0.13, // leve, pra ficar parecido com sua tela
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245,245,245,0.88)",
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#8b0000",
    textAlign: "center",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#111",
  },
});
