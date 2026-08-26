import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: props, error: propsError } = await supabase
    .from('propiedades')
    .select('id,titulo,descripcion,precio,ciudad,direccion,estatus,tipo_id,tipos_propiedad(nombre)')
    .order('created_at', { ascending: false })

  if (propsError) {
    return new Response(JSON.stringify({ error: propsError.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const ids = (props ?? []).map((p: any) => p.id)

  const { data: fotos, error: fotosError } = ids.length
    ? await supabase
        .from('propiedad_fotos')
        .select('propiedad_id,url,orden')
        .in('propiedad_id', ids)
        .order('orden', { ascending: true })
    : { data: [], error: null }

  if (fotosError) {
    return new Response(JSON.stringify({ error: fotosError.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ props: props ?? [], fotos: fotos ?? [] }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
