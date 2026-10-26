'server-only'
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Diagnostic check to see what Vercel has loaded
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return { error: `ENV ERROR: URL is ${url ? 'Loaded' : 'MISSING'}, Key is ${key ? 'Loaded' : 'MISSING'}` }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }
  } catch (err: any) {
    // This will show us the exact reason fetch failed (e.g., bad URL or network block)
    return { error: `Connection failed: ${err.message} [URL: ${url}]` }
  }

  redirect('/private')
}