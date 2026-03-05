import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {

  const body = await req.json();
  const { titulo, mensagem } = body;

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: "ExponentPushToken",
      title: titulo,
      body: mensagem
    })
  });

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200
    }
  );

});
