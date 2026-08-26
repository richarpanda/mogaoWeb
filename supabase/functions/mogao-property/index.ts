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

  const id = new URL(req.url).searchParams.get('id')
  if (!id) {
    return new Response(JSON.stringify({ error: 'id requerido' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: rows, error: propError } = await supabase
    .from('propiedades')
    .select('id,titulo,descripcion,precio,ciudad,direccion,tipo_id,tipos_propiedad(nombre),estatus,latitud,longitud')
    .eq('id', id)
    .limit(1)

  if (propError) {
    return new Response(JSON.stringify({ error: propError.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  if (!rows || rows.length === 0) {
    return new Response(JSON.stringify({ prop: null, fotos: [] }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const { data: fotos, error: fotosError } = await supabase
    .from('propiedad_fotos')
    .select('url,orden')
    .eq('propiedad_id', id)
    .order('orden', { ascending: true })

  if (fotosError) {
    return new Response(JSON.stringify({ error: fotosError.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ prop: rows[0], fotos: fotos ?? [] }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
