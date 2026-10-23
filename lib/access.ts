import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const DEVICE_COOKIE = "__Host-private-device";

export type AuthorizedDevice = {
  id: string;
  name: string;
  status: "pending" | "approved" | "revoked";
  created_at: string;
  approved_at: string | null;
  last_seen_at: string | null;
  token_hash: string;
};

export async function getOwner() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Could not verify sign-in: ${error.message}`);
  }

  const user = data.user;
  if (!user) return null;

  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) {
    throw new Error("OWNER_EMAIL is not configured.");
  }

  if (user.email?.toLowerCase() !== ownerEmail) {
    return null;
  }

  return user;
}

export async function getCurrentDevice(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEVICE_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("authorized_devices")
    .select("id, name, status, created_at, approved_at, last_seen_at, token_hash")
    .eq("user_id", userId)
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not check this device: ${error.message}`);
  }

  return (data as AuthorizedDevice | null) ?? null;
}

export async function requireOwner() {
  const user = await getOwner();
  if (!user) redirect("/login");
  return user;
}

export async function requireApprovedDevice() {
  const user = await requireOwner();
  const device = await getCurrentDevice(user.id);
  if (!device || device.status !== "approved") {
    redirect("/device-request");
  }
  return { user, device };
}
