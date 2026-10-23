"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  DEVICE_COOKIE,
  getCurrentDevice,
  requireApprovedDevice,
} from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function readDeviceId(formData: FormData) {
  const id = String(formData.get("deviceId") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("Invalid device identifier.");
  }
  return id;
}

export async function approveDevice(formData: FormData) {
  const { user } = await requireApprovedDevice();
  const id = readDeviceId(formData);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("authorized_devices")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`Could not approve device: ${error.message}`);
  if (!data) throw new Error("That pending device could not be found.");

  revalidatePath("/devices");
}

export async function revokeDevice(formData: FormData) {
  const { user, device: currentDevice } = await requireApprovedDevice();
  const id = readDeviceId(formData);
  if (id === currentDevice.id) {
    redirect("/devices?error=current");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("revoke_device", {
    p_user_id: user.id,
    p_device_id: id,
  });

  if (error) throw new Error(`Could not revoke device: ${error.message}`);
  if (!data) throw new Error("That device could not be revoked.");

  revalidatePath("/devices");
}

export async function revokeCurrentDevice() {
  const { user } = await requireApprovedDevice();
  const device = await getCurrentDevice(user.id);
  if (!device) redirect("/login");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("revoke_device", {
    p_user_id: user.id,
    p_device_id: device.id,
  });

  if (error) throw new Error(`Could not revoke this device: ${error.message}`);
  if (!data) redirect("/devices?error=last");

  const cookieStore = await cookies();
  cookieStore.delete(DEVICE_COOKIE);
  redirect("/device-request");
}

export async function signOut() {
  await requireApprovedDevice();
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Could not sign out: ${error.message}`);

  redirect("/login");
}
