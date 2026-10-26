import { createClient } from "@/lib/supabase/server";

export async function getOwner() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return null;
    }
    
    return data.user;
  } catch (err) {
    // Catch any unexpected session errors and safely return null
    return null;
  }
}