import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/lib/supabase"; // ajuste o caminho se necessário

const FN_UPLOAD = "admin-galeria-upload";

type GaleriaItem = {
  id?: string | number;
  imagem?: string | null;
  url?: string | null;
  created_at?: string | null;
};

export default function GaleriaAdmin() {
  const [uploading, setUploading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [ultimas, setUltimas] = useState<GaleriaItem[]>([]);
  const [loadingLista, setLoadingLista] = useState(false);

  useEffect(() => {
    carregarUltimas();
  }, []);

  async function carregarUltimas() {
    try {
      setLoadingLista(true);

      let { data, error } = await supabase
        .from("galeria")
        .select("id, imagem, url, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setUltimas(data || []);
    } catch (e: any) {
      console.log("Erro ao carregar galeria:", e?.message || e);
    } finally {
      setLoadingLista(false);
    }
  }

  async function escolherImagem() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!perm.granted) {
        Alert.alert("Permissão", "Permita acesso à galeria para enviar fotos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Erro", "Nenhuma imagem selecionada.");
        return;
      }

      setPreviewUri(asset.uri);

      await enviarImagem(asset.uri, asset.base64);
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha ao escolher imagem.");
    }
  }

  async function enviarImagem(uri: string, base64FromPicker?: string | null) {
    try {
      setUploading(true);

      let base64 = base64FromPicker || null;

      if (!base64) {
        base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (!base64) {
        Alert.alert("Erro", "Não consegui converter a imagem.");
        return;
      }

      const extMatch = uri.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      const ext = (extMatch?.[1] || "jpg").toLowerCase();
      const filename = `foto_${Date.now()}.${ext}`;
      const contentType =
        ext === "jpg" ? "image/jpeg" : ext === "png" ? "image/png" : `image/${ext}`;

      const { data, error } = await supabase.functions.invoke(FN_UPLOAD, {
        body: {
          filename,
          contentType,
          base64,
        },
      });

      if (error) {
        throw error;
      }

      Alert.alert("Sucesso", "Foto publicada na galeria.");
      await carregarUltimas();
    } catch (e: any) {
      Alert.alert("Upload", e?.message || "Erro ao enviar foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>🖼️ Publicar foto na galeria</Text>

      <View style={styles.card}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.previewEmpty}>
            <Text style={styles.previewEmptyText}>Selecione uma foto para publicar</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, uploading && { opacity: 0.7 }]}
          onPress={escolherImagem}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>📤 Upload</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Upload é feito via Edge Function <Text style={styles.bold}>{FN_UPLOAD}</Text>.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.subtitle}>Últimas imagens</Text>

          <TouchableOpacity style={styles.smallBtn} onPress={carregarUltimas} disabled={loadingLista}>
            {loadingLista ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.smallBtnText}>Atualizar</Text>
            )}
          </TouchableOpacity>
        </View>

        {ultimas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma foto encontrada.</Text>
        ) : (
          ultimas.map((item, idx) => {
            const img = item.imagem || item.url || "";
            return (
              <View key={String(item.id || idx)} style={styles.itemCard}>
                {img ? (
                  <Image source={{ uri: img }} style={styles.thumb} resizeMode="cover" />
                ) : null}

                <View style={{ flex: 1 }}>
                  <Text style={styles.itemUrl} numberOfLines={2}>
                    {img || "Sem URL"}
                  </Text>
                  <Text style={styles.itemDate}>{item.created_at || ""}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f6f7f9",
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e8eaef",
  },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },

  previewEmpty: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#eef2f7",
    alignItems: "center",
    justifyContent: "center",
  },

  previewEmptyText: {
    color: "#6b7280",
    fontWeight: "700",
  },

  btn: {
    marginTop: 14,
    backgroundColor: "#0f5f4a",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  hint: {
    marginTop: 10,
    color: "#6b7280",
    fontSize: 13,
  },

  bold: {
    fontWeight: "900",
    color: "#374151",
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  smallBtn: {
    backgroundColor: "#eef2f7",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  smallBtnText: {
    fontWeight: "900",
    color: "#374151",
  },

  emptyText: {
    marginTop: 12,
    color: "#6b7280",
  },

  itemCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#eef1f5",
  },

  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },

  itemUrl: {
    color: "#111827",
    fontSize: 12,
  },

  itemDate: {
    marginTop: 6,
    color: "#6b7280",
    fontSize: 11,
  },
});
