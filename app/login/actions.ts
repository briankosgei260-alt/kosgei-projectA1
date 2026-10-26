'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase Auth Error:', error.message)
      return { error: error.message }
    }
  } catch (err: any) {
    console.error('Server Action Catch:', err)
    return { error: err.message || 'Connection failed' }
  }

  redirect('/private')
}