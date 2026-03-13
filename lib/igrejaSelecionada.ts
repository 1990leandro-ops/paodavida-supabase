import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_IGREJA = "@paodavida:igrejaSelecionada";

export type IgrejaSelecionada = {
  id: string;
  nome: string;
  cidade?: string | null;
  instagram?: string | null;
  pix_chave?: string | null;
  pix_favorecido?: string | null;
  pix_qr_url?: string | null;
  tesouraria?: string | null;
};

export async function salvarIgrejaSelecionada(igreja: IgrejaSelecionada) {
  await AsyncStorage.setItem(CHAVE_IGREJA, JSON.stringify(igreja));
}

export async function obterIgrejaSelecionada(): Promise<IgrejaSelecionada | null> {
  const valor = await AsyncStorage.getItem(CHAVE_IGREJA);
  if (!valor) return null;

  try {
    return JSON.parse(valor) as IgrejaSelecionada;
  } catch {
    return null;
  }
}

export async function limparIgrejaSelecionada() {
  await AsyncStorage.removeItem(CHAVE_IGREJA);
}
