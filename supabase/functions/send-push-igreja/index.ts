import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { igreja_id, titulo, mensagem } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokens, error } = await supabase
      .from("push_tokens")
      .select("expo_push_token")
      .eq("church_id", igreja_id)
      .eq("enabled", true);

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    const messages = tokens
      ?.filter((t) => t.expo_push_token)
      .map((t) => ({
        to: t.expo_push_token,
        sound: "default",
        title: titulo,
        body: mensagem,
      }));

    if (!messages?.length) {
      return new Response(
        JSON.stringify({ message: "Nenhum token encontrado" }),
        { status: 200 }
      );
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
