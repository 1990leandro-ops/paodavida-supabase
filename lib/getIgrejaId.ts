import { supabase } from "./supabase";

export type IgrejaDoUsuario = {
  igreja_id: string;
  role: "admin" | "lider";
  igrejas: {
    id: string;
    nome: string | null;
    cidade: string | null;
    instagram?: string | null;
    pix_chave?: string | null;
    pix_favorecido?: string | null;
    pix_qr_url?: string | null;
    tesouraria?: string | null;
  } | null;
};

export async function getIgrejasDoUsuario(): Promise<IgrejaDoUsuario[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.log("Erro auth:", authError.message);
    return [];
  }

  const user = authData?.user;

  if (!user?.email) {
    console.log("Usuário sem email");
    return [];
  }

  const email = user.email.trim().toLowerCase();

  const { data: admins, error: adminError } = await supabase
    .from("admin_users")
    .select("igreja_id, role")
    .ilike("email", email);

  if (adminError) {
    console.log("Erro ao buscar admin_users:", adminError.message);
    return [];
  }

  if (!admins || admins.length === 0) {
    console.log("Nenhuma igreja vinculada ao email:", email);
    return [];
  }

  const igrejaIds = admins
    .map((item) => item.igreja_id)
    .filter(Boolean);

  const { data: igrejas, error: igrejasError } = await supabase
    .from("igrejas")
    .select("id, nome, cidade, instagram, pix_chave, pix_favorecido, pix_qr_url, tesouraria")
    .in("id", igrejaIds);

  if (igrejasError) {
    console.log("Erro ao buscar igrejas:", igrejasError.message);
    return [];
  }

  const resultado: IgrejaDoUsuario[] = admins.map((admin) => {
    const igreja = igrejas?.find((i) => i.id === admin.igreja_id) || null;

    return {
      igreja_id: admin.igreja_id,
      role: admin.role as "admin" | "lider",
      igrejas: igreja
        ? {
            id: igreja.id,
            nome: igreja.nome,
            cidade: igreja.cidade,
            instagram: igreja.instagram,
            pix_chave: igreja.pix_chave,
            pix_favorecido: igreja.pix_favorecido,
            pix_qr_url: igreja.pix_qr_url,
            tesouraria: igreja.tesouraria,
          }
        : null,
    };
  });

  console.log("Igrejas do usuário:", resultado);

  return resultado;
}
