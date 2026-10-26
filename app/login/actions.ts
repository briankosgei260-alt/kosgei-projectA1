'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kosgei-project-a1-f166-ooxcwbvkn-project-brian.vercel.app'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Supabase auth error:', error.message)
      return { error: error.message }
    }
  } catch (err: any) {
    console.error('Server action exception:', err)
    return { error: err.message || 'Failed to send sign-in link' }
  }

  redirect('/login?message=Check your email for the sign-in link')
}