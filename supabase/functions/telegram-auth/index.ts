import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Izinkan akses dari website Bos (CORS Bypass)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
        headers: { 
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
        } 
    })
  }

  try {
    // 2. Tangkap data dari frontend
    const { telegram_id, first_name, username, photo_url } = await req.json()
    
    // 3. Aktifkan Mode Admin (Service Role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const email = `tg_${telegram_id}@shadowclips.asia`
    const password = `tg_secure_${telegram_id}_shadowclips`

    // 4. Buat akun RESMI menggunakan Admin API (Skema dijamin lengkap!)
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { 
          full_name: first_name, 
          preferred_username: username, 
          avatar_url: photo_url 
      }
    })

    // Jika error HANYA karena email sudah ada, kita abaikan (berarti user lama)
    if (createError && !createError.message.includes('already registered')) {
      throw createError
    }

    // 5. Kembalikan kredensial ke React untuk login sesi
    return new Response(
      JSON.stringify({ success: true, email, password }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )

  } catch (err) {
     return new Response(
         JSON.stringify({ error: err.message }), 
         { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
     )
  }
})