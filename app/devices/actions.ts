'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requestDeviceApproval(formData: FormData) {
  const deviceName = formData.get('deviceName') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('devices').insert({
    user_id: user.id,
    device_name: deviceName || 'Unknown Device',
    status: 'pending',
  })

  redirect('/device-request?status=submitted')
}