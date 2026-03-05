import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {

  const body = await req.json();
  const { titulo, mensagem, token } = body;

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: token,
      title: titulo,
      body: mensagem
    })
  });

  const data = await res.json();

  return new Response(
    JSON.stringify({
      success: true,
      result: data
    }),
    { headers: { "Content-Type": "application/json" } }
  );

});
