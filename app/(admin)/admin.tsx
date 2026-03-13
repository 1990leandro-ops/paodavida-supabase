import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

const BUCKET_GALERIA = "galeria";

type TabKey =
  | "dashboard"
  | "avisos"
  | "galeria"
  | "pedidos"
  | "contribuicoes"
  | "emocoes"
  | "devocional";

type Aviso = {
  id: string;
  igreja_id: string;
  titulo: string;
  mensagem: string;
  created_at?: string | null;
};

type Foto = {
  id: string;
  igreja_id: string;
  url?: string | null;
  legenda?: string | null;
  created_at?: string | null;
};

type PedidoOracao = {
  id: string;
  igreja_id: string;
  nome?: string | null;
  pedido?: string | null;
  telefone?: string | null;
  created_at?: string | null;
};

type Contribuicao = {
  id: string;
  igreja_id: string;
  nome: string;
  tipo: "Dízimo" | "Oferta" | "Oferta Alçada" | "Campanha";
  valor: number | string;
  campanha?: string | null;
  observacao?: string | null;
  created_at?: string | null;
};

type Emocao = {
  id: string;
  igreja_id: string;
  nome: string;
  emoji: string;
  sentimento: string;
  observacao?: string | null;
  created_at?: string | null;
};

type Membro = {
  id: string;
  igreja_id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  estado_civil?: string | null;
  status?: string | null;
  batizado?: boolean | null;
  created_at?: string | null;
};

type Devocional = {
  id: string;
  igreja_id: string;
  titulo?: string | null;
  versiculo?: string | null;
  mensagem?: string | null;
  autor?: string | null;
  created_at?: string | null;
};

export default function AdminScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabKey>("dashboard");

  const [igrejaId, setIgrejaId] = useState<string | null>(null);
  const [nomeIgreja, setNomeIgreja] = useState("Igreja");

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);
  const [contribuicoes, setContribuicoes] = useState<Contribuicao[]>([]);
  const [emocoes, setEmocoes] = useState<Emocao[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [devocionais, setDevocionais] = useState<Devocional[]>([]);

  const [tituloAviso, setTituloAviso] = useState("");
  const [mensagemAviso, setMensagemAviso] = useState("");
  const [salvandoAviso, setSalvandoAviso] = useState(false);

  const [legendaFoto, setLegendaFoto] = useState("");
  const [imagemUri, setImagemUri] = useState("");
  const [salvandoFoto, setSalvandoFoto] = useState(false);

  const [tituloDevocional, setTituloDevocional] = useState("");
  const [versiculoDevocional, setVersiculoDevocional] = useState("");
  const [mensagemDevocional, setMensagemDevocional] = useState("");
  const [autorDevocional, setAutorDevocional] = useState("");
  const [salvandoDevocional, setSalvandoDevocional] = useState(false);

  useEffect(() => {
    iniciar();
  }, []);

  async function iniciar() {
    try {
      setLoading(true);

      const igreja = await obterIgrejaSelecionada();

      if (!igreja?.id) {
        Alert.alert("Admin", "Igreja não identificada.");
        return;
      }

      setIgrejaId(igreja.id);

      const nomeBase = igreja.nome || "Igreja";
      const cidadeBase = igreja.cidade || "";
      const nomeFinal =
        cidadeBase && !nomeBase.toLowerCase().includes(cidadeBase.toLowerCase())
          ? `${nomeBase} ${cidadeBase}`
          : nomeBase;

      setNomeIgreja(nomeFinal);

      await carregarTudo(igreja.id);
    } catch (error: any) {
      Alert.alert("Admin", error?.message || "Erro ao carregar painel.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarTudo(id: string) {
    await Promise.all([
      carregarAvisos(id),
      carregarFotos(id),
      carregarPedidos(id),
      carregarContribuicoes(id),
      carregarEmocoes(id),
      carregarMembros(id),
      carregarDevocionais(id),
    ]);
  }

  async function carregarAvisos(id: string) {
    const { data, error } = await supabase
      .from("avisos")
      .select("*")
      .eq("igreja_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar avisos:", error.message);
      setAvisos([]);
      return;
    }

    setAvisos((data as Aviso[]) || []);
  }

  async function carregarFotos(id: string) {
    const { data, error } = await supabase
      .from("fotos")
      .select("*")
      .eq("igreja_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar fotos:", error.message);
      setFotos([]);
      return;
    }

    setFotos((data as Foto[]) || []);
  }

  async function carregarPedidos(id: string) {
    const { data, error } = await supabase
      .from("pedidos_oracao")
      .select("*")
      .eq("igreja_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar pedidos:", error.message);
      setPedidos([]);
      return;
    }

    setPedidos((data as PedidoOracao[]) || []);
  }

  async function carregarContribuicoes(id: string) {
    const { data, error } = await supabase
      .from("contribuicoes")
      .select("*")
      .eq("igreja_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar contribuições:", error.message);
      setContribuicoes([]);
      return;
    }

    setContribuicoes((data as Contribuicao[]) || []);
  }

  async function carregarEmocoes(id: string) {
    const { data, error } = await supabase
      .from("emocoes_membros")
      .select("*")
      .eq("igreja_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar emoções:", error.message);
      setEmocoes([]);
      return;
    }

    setEmocoes((data as Emocao[]) || []);
  }

  async function carregarMembros(id: string) {
    const { data, error } = await supabase
      .from("membros")
      .select("*")
      .eq("igreja_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar membros:", error.message);
      setMembros([]);
      return;
    }

    setMembros((data as Membro[]) || []);
  }

  async function carregarDevocionais(id: string) {
    const { data, error } = await supabase
      .from("devocionais")
      .select("*")
      .eq("igreja_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao carregar devocionais:", error.message);
      setDevocionais([]);
      return;
    }

    setDevocionais((data as Devocional[]) || []);
  }

  async function atualizar() {
    if (!igrejaId) return;
    try {
      setRefreshing(true);
      await carregarTudo(igrejaId);
    } finally {
      setRefreshing(false);
    }
  }

  async function enviarPush(titulo: string, mensagem: string) {
    if (!igrejaId) return;

    try {
      const { error } = await supabase.functions.invoke("send-push-igreja", {
        body: {
          igreja_id: igrejaId,
          titulo,
          mensagem,
        },
      });

      if (error) {
        console.log("Erro ao enviar push:", error.message);
      }
    } catch (error) {
      console.log("Erro geral ao enviar push:", error);
    }
  }

  async function publicarAviso() {
    try {
      if (!igrejaId) {
        Alert.alert("Avisos", "Igreja não identificada.");
        return;
      }

      if (!tituloAviso.trim() || !mensagemAviso.trim()) {
        Alert.alert("Avisos", "Preencha título e mensagem.");
        return;
      }

      setSalvandoAviso(true);

      const titulo = tituloAviso.trim();
      const mensagem = mensagemAviso.trim();

      const { error } = await supabase.from("avisos").insert([
        {
          igreja_id: igrejaId,
          titulo,
          mensagem,
        },
      ]);

      if (error) {
        Alert.alert("Avisos", error.message);
        return;
      }

      await enviarPush(titulo, mensagem);

      setTituloAviso("");
      setMensagemAviso("");
      await carregarAvisos(igrejaId);
      Alert.alert("Sucesso", "Aviso publicado.");
    } catch (error: any) {
      Alert.alert("Avisos", error?.message || "Erro ao publicar aviso.");
    } finally {
      setSalvandoAviso(false);
    }
  }

  async function publicarDevocional() {
    try {
      if (!igrejaId) {
        Alert.alert("Devocional", "Igreja não identificada.");
        return;
      }

      if (!tituloDevocional.trim() || !mensagemDevocional.trim()) {
        Alert.alert("Devocional", "Preencha título e mensagem.");
        return;
      }

      setSalvandoDevocional(true);

      const titulo = tituloDevocional.trim();
      const versiculo = versiculoDevocional.trim() || null;
      const mensagem = mensagemDevocional.trim();
      const autor = autorDevocional.trim() || null;

      const { error } = await supabase.from("devocionais").insert([
        {
          igreja_id: igrejaId,
          titulo,
          versiculo,
          mensagem,
          autor,
        },
      ]);

      if (error) {
        Alert.alert("Devocional", error.message);
        return;
      }

      await enviarPush(
        `Novo devocional: ${titulo}`,
        versiculo ? versiculo : mensagem
      );

      setTituloDevocional("");
      setVersiculoDevocional("");
      setMensagemDevocional("");
      setAutorDevocional("");
      await carregarDevocionais(igrejaId);
      Alert.alert("Sucesso", "Devocional publicado.");
    } catch (error: any) {
      Alert.alert("Devocional", error?.message || "Erro ao publicar devocional.");
    } finally {
      setSalvandoDevocional(false);
    }
  }

  async function excluirAviso(id: string) {
    try {
      const { error } = await supabase.from("avisos").delete().eq("id", id);

      if (error) {
        Alert.alert("Avisos", error.message);
        return;
      }

      if (igrejaId) await carregarAvisos(igrejaId);
      Alert.alert("Sucesso", "Aviso excluído.");
    } catch (error: any) {
      Alert.alert("Avisos", error?.message || "Erro ao excluir aviso.");
    }
  }

  async function excluirDevocional(id: string) {
    try {
      const { error } = await supabase.from("devocionais").delete().eq("id", id);

      if (error) {
        Alert.alert("Devocional", error.message);
        return;
      }

      if (igrejaId) await carregarDevocionais(igrejaId);
      Alert.alert("Sucesso", "Devocional excluído.");
    } catch (error: any) {
      Alert.alert("Devocional", error?.message || "Erro ao excluir devocional.");
    }
  }

  async function excluirPedido(id: string) {
    try {
      const { error } = await supabase
        .from("pedidos_oracao")
        .delete()
        .eq("id", id);

      if (error) {
        Alert.alert("Pedidos de oração", error.message);
        return;
      }

      if (igrejaId) await carregarPedidos(igrejaId);
      Alert.alert("Sucesso", "Pedido excluído.");
    } catch (error: any) {
      Alert.alert(
        "Pedidos de oração",
        error?.message || "Erro ao excluir pedido."
      );
    }
  }

  async function excluirFoto(id: string, url?: string | null) {
    try {
      if (url) {
        const marker = `/storage/v1/object/public/${BUCKET_GALERIA}/`;
        const idx = url.indexOf(marker);

        if (idx !== -1) {
          const filePath = url.substring(idx + marker.length);
          await supabase.storage.from(BUCKET_GALERIA).remove([filePath]);
        }
      }

      const { error } = await supabase.from("fotos").delete().eq("id", id);

      if (error) {
        Alert.alert("Galeria", error.message);
        return;
      }

      if (igrejaId) await carregarFotos(igrejaId);
      Alert.alert("Sucesso", "Foto excluída.");
    } catch (error: any) {
      Alert.alert("Galeria", error?.message || "Erro ao excluir foto.");
    }
  }

  function confirmarExclusaoAviso(id: string) {
    Alert.alert("Excluir aviso", "Deseja realmente excluir este aviso?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => excluirAviso(id) },
    ]);
  }

  function confirmarExclusaoDevocional(id: string) {
    Alert.alert("Excluir devocional", "Deseja realmente excluir este devocional?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => excluirDevocional(id),
      },
    ]);
  }

  function confirmarExclusaoPedido(id: string) {
    Alert.alert("Excluir pedido", "Deseja realmente excluir este pedido?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => excluirPedido(id) },
    ]);
  }

  function confirmarExclusaoFoto(id: string, url?: string | null) {
    Alert.alert("Excluir foto", "Deseja realmente excluir esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => excluirFoto(id, url),
      },
    ]);
  }

  async function escolherImagem() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert("Galeria", "Permissão negada para acessar fotos.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets?.length > 0) {
      setImagemUri(resultado.assets[0].uri);
    }
  }

  async function publicarFoto() {
    try {
      if (!igrejaId) {
        Alert.alert("Galeria", "Igreja não identificada.");
        return;
      }

      if (!imagemUri) {
        Alert.alert("Galeria", "Escolha uma imagem.");
        return;
      }

      setSalvandoFoto(true);

      const response = await fetch(imagemUri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `${igrejaId}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_GALERIA)
        .upload(fileName, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        Alert.alert(
          "Galeria",
          `Erro no upload. Confira se o bucket "${BUCKET_GALERIA}" existe e tem permissão.`
        );
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_GALERIA).getPublicUrl(fileName);

      if (!publicUrl) {
        Alert.alert("Galeria", "Não foi possível gerar a URL pública da foto.");
        return;
      }

      const { error: insertError } = await supabase.from("fotos").insert([
        {
          igreja_id: igrejaId,
          url: publicUrl,
          legenda: legendaFoto.trim() || null,
        },
      ]);

      if (insertError) {
        Alert.alert("Galeria", insertError.message);
        return;
      }

      setImagemUri("");
      setLegendaFoto("");
      await carregarFotos(igrejaId);
      Alert.alert("Sucesso", "Foto publicada.");
    } catch (error: any) {
      Alert.alert("Galeria", error?.message || "Erro ao publicar foto.");
    } finally {
      setSalvandoFoto(false);
    }
  }

  const resumoContribuicoes = useMemo(() => {
    const total = contribuicoes.reduce(
      (acc, item) => acc + Number(item.valor || 0),
      0
    );

    const dizimo = contribuicoes
      .filter((item) => item.tipo === "Dízimo")
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const oferta = contribuicoes
      .filter((item) => item.tipo === "Oferta")
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const ofertaAlcada = contribuicoes
      .filter((item) => item.tipo === "Oferta Alçada")
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    const campanha = contribuicoes
      .filter((item) => item.tipo === "Campanha")
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    return { total, dizimo, oferta, ofertaAlcada, campanha };
  }, [contribuicoes]);

  const resumoEmocoes = useMemo(() => {
    return {
      alegre: emocoes.filter((item) => item.sentimento === "Alegre").length,
      triste: emocoes.filter((item) => item.sentimento === "Triste").length,
      ansioso: emocoes.filter((item) => item.sentimento === "Ansioso").length,
      doente: emocoes.filter((item) => item.sentimento === "Doente").length,
      oracao: emocoes.filter(
        (item) => item.sentimento === "Precisando de oração"
      ).length,
    };
  }, [emocoes]);

  const resumoMembros = useMemo(() => {
    const total = membros.length;
    const ativos = membros.filter((item) => item.status === "Ativo").length;
    const inativos = membros.filter((item) => item.status === "Inativo").length;
    const batizados = membros.filter((item) => item.batizado === true).length;
    const naoBatizados = membros.filter((item) => item.batizado === false).length;

    const mesAtual = new Date().getMonth() + 1;

    const aniversariantes = membros.filter((item) => {
      if (!item.data_nascimento) return false;

      const texto = String(item.data_nascimento).trim();

      if (texto.includes("/")) {
        const partes = texto.split("/");
        if (partes.length >= 2) {
          const mes = Number(partes[1]);
          return mes === mesAtual;
        }
      }

      const data = new Date(texto);
      if (Number.isNaN(data.getTime())) return false;

      return data.getMonth() + 1 === mesAtual;
    }).length;

    return {
      total,
      ativos,
      inativos,
      batizados,
      naoBatizados,
      aniversariantes,
    };
  }, [membros]);

  const graficoMensal = useMemo(() => {
    const mapa: Record<string, number> = {};

    contribuicoes.forEach((item) => {
      const data = item.created_at ? new Date(item.created_at) : null;
      if (!data || Number.isNaN(data.getTime())) return;

      const chave = `${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}`;
      mapa[chave] = (mapa[chave] || 0) + Number(item.valor || 0);
    });

    const lista = Object.entries(mapa)
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => {
        const [ma, aa] = a.mes.split("/");
        const [mb, ab] = b.mes.split("/");
        return Number(`${aa}${ma}`) - Number(`${ab}${mb}`);
      })
      .slice(-6);

    const maior = Math.max(...lista.map((item) => item.total), 1);

    return { lista, maior };
  }, [contribuicoes]);

  function formatarMoeda(valor: number | string) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data?: string | null) {
    if (!data) return "";
    try {
      return new Date(data).toLocaleString("pt-BR");
    } catch {
      return data;
    }
  }

  function TabButton({ id, label }: { id: TabKey; label: string }) {
    const ativo = tab === id;

    return (
      <TouchableOpacity
        style={[styles.tabButton, ativo && styles.tabButtonActive]}
        onPress={() => setTab(id)}
      >
        <Text style={[styles.tabButtonText, ativo && styles.tabButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#065f46" />
          <Text style={styles.loadingText}>Carregando painel...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={atualizar} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Painel Administrativo</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Igreja</Text>
          <Text style={styles.value}>{nomeIgreja}</Text>
        </View>

        <View style={styles.tabsWrap}>
          <TabButton id="dashboard" label="Dashboard" />
          <TabButton id="avisos" label="Avisos" />
          <TabButton id="galeria" label="Galeria" />
          <TabButton id="pedidos" label="Oração" />
          <TabButton id="contribuicoes" label="Contrib." />
          <TabButton id="emocoes" label="Emoções" />
          <TabButton id="devocional" label="Devocional" />
        </View>

        {tab === "dashboard" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumo geral</Text>
              <Text style={styles.itemLine}>Avisos: {avisos.length}</Text>
              <Text style={styles.itemLine}>Membros: {membros.length}</Text>
              <Text style={styles.itemLine}>Pedidos de oração: {pedidos.length}</Text>
              <Text style={styles.itemLine}>Contribuições: {contribuicoes.length}</Text>
              <Text style={styles.itemLine}>Fotos: {fotos.length}</Text>
              <Text style={styles.itemLine}>Devocionais: {devocionais.length}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dashboard de membros</Text>
              <Text style={styles.itemLine}>Total de membros: {resumoMembros.total}</Text>
              <Text style={styles.itemLine}>Ativos: {resumoMembros.ativos}</Text>
              <Text style={styles.itemLine}>Inativos: {resumoMembros.inativos}</Text>
              <Text style={styles.itemLine}>Batizados: {resumoMembros.batizados}</Text>
              <Text style={styles.itemLine}>Não batizados: {resumoMembros.naoBatizados}</Text>
              <Text style={styles.itemLine}>
                Aniversariantes do mês: {resumoMembros.aniversariantes}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Financeiro</Text>
              <Text style={styles.itemLine}>Dízimos: {formatarMoeda(resumoContribuicoes.dizimo)}</Text>
              <Text style={styles.itemLine}>Ofertas: {formatarMoeda(resumoContribuicoes.oferta)}</Text>
              <Text style={styles.itemLine}>
                Oferta Alçada: {formatarMoeda(resumoContribuicoes.ofertaAlcada)}
              </Text>
              <Text style={styles.itemLine}>Campanhas: {formatarMoeda(resumoContribuicoes.campanha)}</Text>
              <Text style={styles.totalLine}>Total: {formatarMoeda(resumoContribuicoes.total)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ofertas por mês</Text>

              {graficoMensal.lista.length === 0 ? (
                <Text style={styles.emptyText}>Sem dados suficientes ainda.</Text>
              ) : (
                graficoMensal.lista.map((item) => (
                  <View key={item.mes} style={styles.chartRow}>
                    <Text style={styles.chartLabel}>{item.mes}</Text>
                    <View style={styles.chartBarTrack}>
                      <View
                        style={[
                          styles.chartBarFill,
                          {
                            width: `${(item.total / graficoMensal.maior) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartValue}>{formatarMoeda(item.total)}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Estado emocional da igreja</Text>
              <Text style={styles.itemLine}>😀 Alegre: {resumoEmocoes.alegre}</Text>
              <Text style={styles.itemLine}>😔 Triste: {resumoEmocoes.triste}</Text>
              <Text style={styles.itemLine}>😟 Ansioso: {resumoEmocoes.ansioso}</Text>
              <Text style={styles.itemLine}>🤒 Doente: {resumoEmocoes.doente}</Text>
              <Text style={styles.itemLine}>🙏 Oração: {resumoEmocoes.oracao}</Text>
            </View>
          </>
        )}

        {tab === "avisos" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Publicar aviso</Text>

              <TextInput
                style={styles.input}
                placeholder="Título"
                placeholderTextColor="#9ca3af"
                value={tituloAviso}
                onChangeText={setTituloAviso}
              />

              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Mensagem"
                placeholderTextColor="#9ca3af"
                multiline
                value={mensagemAviso}
                onChangeText={setMensagemAviso}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={publicarAviso}
                disabled={salvandoAviso}
              >
                {salvandoAviso ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Publicar aviso</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Avisos publicados</Text>

              {avisos.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum aviso publicado.</Text>
              ) : (
                avisos.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>{item.titulo}</Text>
                    <Text style={styles.itemText}>{item.mensagem}</Text>
                    {!!item.created_at && (
                      <Text style={styles.smallMuted}>{formatarData(item.created_at)}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmarExclusaoAviso(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Excluir aviso</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {tab === "galeria" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Publicar foto</Text>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={escolherImagem}
              >
                <Text style={styles.secondaryButtonText}>
                  {imagemUri ? "Trocar imagem" : "Escolher imagem"}
                </Text>
              </TouchableOpacity>

              {!!imagemUri && (
                <Image source={{ uri: imagemUri }} style={styles.previewImage} />
              )}

              <TextInput
                style={styles.input}
                placeholder="Legenda (opcional)"
                placeholderTextColor="#9ca3af"
                value={legendaFoto}
                onChangeText={setLegendaFoto}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={publicarFoto}
                disabled={salvandoFoto}
              >
                {salvandoFoto ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Publicar foto</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Galeria</Text>

              {fotos.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma foto publicada.</Text>
              ) : (
                fotos.map((foto) => (
                  <View key={foto.id} style={styles.itemCard}>
                    {!!foto.url && (
                      <Image source={{ uri: foto.url }} style={styles.galleryImage} />
                    )}
                    {!!foto.legenda && (
                      <Text style={styles.itemText}>{foto.legenda}</Text>
                    )}
                    {!!foto.created_at && (
                      <Text style={styles.smallMuted}>{formatarData(foto.created_at)}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmarExclusaoFoto(foto.id, foto.url)}
                    >
                      <Text style={styles.deleteButtonText}>Excluir foto</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {tab === "pedidos" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pedidos de oração</Text>

            {pedidos.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum pedido registrado.</Text>
            ) : (
              pedidos.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{item.nome || "Anônimo"}</Text>
                  <Text style={styles.itemText}>{item.pedido || ""}</Text>
                  {!!item.telefone && (
                    <Text style={styles.itemText}>Tel: {item.telefone}</Text>
                  )}
                  {!!item.created_at && (
                    <Text style={styles.smallMuted}>{formatarData(item.created_at)}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmarExclusaoPedido(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>Excluir pedido</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "contribuicoes" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumo financeiro</Text>
              <Text style={styles.itemLine}>Dízimos: {formatarMoeda(resumoContribuicoes.dizimo)}</Text>
              <Text style={styles.itemLine}>Ofertas: {formatarMoeda(resumoContribuicoes.oferta)}</Text>
              <Text style={styles.itemLine}>
                Oferta Alçada: {formatarMoeda(resumoContribuicoes.ofertaAlcada)}
              </Text>
              <Text style={styles.itemLine}>Campanhas: {formatarMoeda(resumoContribuicoes.campanha)}</Text>
              <Text style={styles.totalLine}>Total: {formatarMoeda(resumoContribuicoes.total)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Contribuições registradas</Text>

              {contribuicoes.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma contribuição registrada.</Text>
              ) : (
                contribuicoes.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>{item.nome}</Text>
                    <Text style={styles.itemText}>Tipo: {item.tipo}</Text>
                    <Text style={styles.itemText}>Valor: {formatarMoeda(item.valor)}</Text>
                    {!!item.campanha && (
                      <Text style={styles.itemText}>Campanha: {item.campanha}</Text>
                    )}
                    {!!item.observacao && (
                      <Text style={styles.itemText}>Obs: {item.observacao}</Text>
                    )}
                    {!!item.created_at && (
                      <Text style={styles.smallMuted}>{formatarData(item.created_at)}</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {tab === "emocoes" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dashboard emocional</Text>
              <Text style={styles.itemLine}>😀 Alegre: {resumoEmocoes.alegre}</Text>
              <Text style={styles.itemLine}>😔 Triste: {resumoEmocoes.triste}</Text>
              <Text style={styles.itemLine}>😟 Ansioso: {resumoEmocoes.ansioso}</Text>
              <Text style={styles.itemLine}>🤒 Doente: {resumoEmocoes.doente}</Text>
              <Text style={styles.itemLine}>🙏 Oração: {resumoEmocoes.oracao}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Registros emocionais</Text>

              {emocoes.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum registro emocional.</Text>
              ) : (
                emocoes.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>
                      {item.emoji} {item.nome}
                    </Text>
                    <Text style={styles.itemText}>{item.sentimento}</Text>
                    {!!item.observacao && (
                      <Text style={styles.itemText}>{item.observacao}</Text>
                    )}
                    {!!item.created_at && (
                      <Text style={styles.smallMuted}>{formatarData(item.created_at)}</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {tab === "devocional" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Publicar devocional</Text>

              <TextInput
                style={styles.input}
                placeholder="Título"
                placeholderTextColor="#9ca3af"
                value={tituloDevocional}
                onChangeText={setTituloDevocional}
              />

              <TextInput
                style={styles.input}
                placeholder="Versículo"
                placeholderTextColor="#9ca3af"
                value={versiculoDevocional}
                onChangeText={setVersiculoDevocional}
              />

              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Mensagem"
                placeholderTextColor="#9ca3af"
                multiline
                value={mensagemDevocional}
                onChangeText={setMensagemDevocional}
              />

              <TextInput
                style={styles.input}
                placeholder="Autor"
                placeholderTextColor="#9ca3af"
                value={autorDevocional}
                onChangeText={setAutorDevocional}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={publicarDevocional}
                disabled={salvandoDevocional}
              >
                {salvandoDevocional ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Publicar devocional</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Devocionais publicados</Text>

              {devocionais.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum devocional publicado.</Text>
              ) : (
                devocionais.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    {!!item.titulo && (
                      <Text style={styles.itemTitle}>{item.titulo}</Text>
                    )}
                    {!!item.versiculo && (
                      <Text style={styles.itemText}>{item.versiculo}</Text>
                    )}
                    {!!item.mensagem && (
                      <Text style={styles.itemText}>{item.mensagem}</Text>
                    )}
                    {!!item.autor && (
                      <Text style={styles.itemText}>Autor: {item.autor}</Text>
                    )}
                    {!!item.created_at && (
                      <Text style={styles.smallMuted}>{formatarData(item.created_at)}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmarExclusaoDevocional(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Excluir devocional</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  tabsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  tabButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: "#065f46",
  },
  tabButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: "#111827",
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#065f46",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#065f46",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: "#b91c1c",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "#e5e7eb",
  },
  galleryImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#e5e7eb",
  },
  itemCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  itemText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 4,
  },
  itemLine: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 8,
  },
  totalLine: {
    fontSize: 18,
    color: "#065f46",
    fontWeight: "800",
    marginTop: 8,
  },
  smallMuted: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },
  emptyText: {
    color: "#6b7280",
  },
  chartRow: {
    marginBottom: 12,
  },
  chartLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  chartBarTrack: {
    width: "100%",
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  chartBarFill: {
    height: "100%",
    backgroundColor: "#065f46",
    borderRadius: 999,
  },
  chartValue: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "700",
  },
});
