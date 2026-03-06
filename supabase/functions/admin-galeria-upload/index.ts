import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { bucket, filename, contentType, fileBase64 } = await req.json()

    if (!fileBase64 || !filename) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Converte base64 para Uint8Array
    const binary = atob(fileBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    // Upload no Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, bytes, {
        contentType: contentType || "image/jpeg",
        upsert: true,
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Pega URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename)

    const publicUrl = urlData.publicUrl

    // Salva na tabela galeria nos dois campos
    const { error: dbError } = await supabase
      .from("galeria")
      .insert({
        imagem: publicUrl,
        url: publicUrl,
        likes: 0,
        likes_count: 0,
      })

    if (dbError) {
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ publicUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
