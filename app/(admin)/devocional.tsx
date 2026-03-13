import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";

export default function AdminDevocional() {
  const [loading, setLoading] = useState(false);
  const [igrejaId, setIgrejaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [versiculo, setVersiculo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [autor, setAutor] = useState("");

  useEffect(() => {
    carregarIgreja();
  }, []);

  async function carregarIgreja() {
    try {
      const { data } = await supabase.auth.getUser();

      if (!data?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("igreja_id")
        .eq("id", data.user.id)
        .single();

      if (profile?.igreja_id) {
        setIgrejaId(profile.igreja_id);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function publicarDevocional() {
    try {
      if (!titulo || !mensagem) {
        Alert.alert("Erro", "Preencha título e mensagem.");
        return;
      }

      setLoading(true);

      const { error } = await supabase.from("devocionais").insert({
        igreja_id: igrejaId,
        titulo,
        versiculo,
        mensagem,
        autor,
      });

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert("Sucesso", "Devocional publicado!");

      setTitulo("");
      setVersiculo("");
      setMensagem("");
      setAutor("");
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Publicar Devocional</Text>

        <TextInput
          style={styles.input}
          placeholder="Título"
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          style={styles.input}
          placeholder="Versículo"
          value={versiculo}
          onChangeText={setVersiculo}
        />

        <TextInput
          style={styles.textArea}
          placeholder="Mensagem"
          value={mensagem}
          onChangeText={setMensagem}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Autor"
          value={autor}
          onChangeText={setAutor}
        />

        <TouchableOpacity style={styles.button} onPress={publicarDevocional}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Publicar</Text>
          )}
        </TouchableOpacity>
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
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    color: "#065f46",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  button: {
    backgroundColor: "#065f46",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
