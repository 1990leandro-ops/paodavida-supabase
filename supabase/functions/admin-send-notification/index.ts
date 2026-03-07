import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PIN = Deno.env.get("ADMIN_PIN") || "0110";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-admin-pin",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true }, 200);
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const adminPin = req.headers.get("x-admin-pin");
    if (!adminPin || adminPin !== ADMIN_PIN) {
      return jsonResponse({ error: "PIN admin inválido" }, 401);
    }

    const body = await req.json().catch(() => null);

    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Pão da Vida";

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    const dataPayload =
      body?.data && typeof body.data === "object"
        ? body.data
        : { screen: "avisos" };

    if (!message) {
      return jsonResponse({ error: "Mensagem é obrigatória" }, 400);
    }

    const { data: rows, error } = await supabase
      .from("push_tokens")
      .select("token");

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    const tokens = (rows ?? [])
      .map((r: any) => r?.token)
      .filter(
        (t: string) =>
          typeof t === "string" && t.startsWith("ExponentPushToken[")
      );

    if (!tokens.length) {
      return jsonResponse({
        ok: true,
        sent: 0,
        message: "Nenhum token cadastrado.",
      });
    }

    const messages = tokens.map((token: string) => ({
      to: token,
      sound: "default",
      title,
      body: message,
      data: dataPayload,
    }));

    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const expoJson = await expoRes.json().catch(() => null);

    if (!expoRes.ok) {
      return jsonResponse(
        {
          error: "Falha ao enviar para Expo Push API",
          details: expoJson,
        },
        500
      );
    }

    return jsonResponse({
      ok: true,
      sent: tokens.length,
      expo: expoJson,
    });
  } catch (e) {
    return jsonResponse(
      {
        error: e instanceof Error ? e.message : "Erro interno",
      },
      500
    );
  }
});
