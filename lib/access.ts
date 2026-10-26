import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getOwner() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
  } catch (err) {
    return null;
  }
}

export async function getCurrentDevice(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function requireApprovedDevice() {
  const user = await getOwner();
  if (!user) {
    redirect("/login");
  }
  
  const device = await getCurrentDevice(user.id);
  if (!device || device.status !== "approved") {
    redirect("/device-request");
  }
  
  return { user, device };
}