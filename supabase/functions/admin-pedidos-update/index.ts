import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { id, resposta, respondido, status } = await req.json()

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID do pedido é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("pedidos_oracao")
      .update({
        resposta: resposta ?? null,
        respondido: respondido ?? true,
        status: status ?? "respondido",
        responded_at: now,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
