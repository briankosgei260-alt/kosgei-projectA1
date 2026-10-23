"use server";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEVICE_COOKIE, getCurrentDevice, getOwner } from "@/lib/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function matchesSecret(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

export async function requestDeviceApproval(formData: FormData) {
  const user = await getOwner();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 48) {
    redirect("/device-request?error=name");
  }

  const admin = createAdminClient();
  const { data: existingDevices, error: listError } = await admin
    .from("authorized_devices")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .limit(1);

  if (listError) {
    throw new Error(`Could not check registered devices: ${listError.message}`);
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  if (!existingDevices?.length) {
    const expectedCode = process.env.BOOTSTRAP_DEVICE_CODE;
    const suppliedCode = String(formData.get("bootstrapCode") ?? "");

    if (!expectedCode) {
      throw new Error("BOOTSTRAP_DEVICE_CODE is not configured.");
    }
    if (!matchesSecret(suppliedCode, expectedCode)) {
      redirect("/device-request?error=bootstrap");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("bootstrap_device", {
      p_name: name,
      p_token_hash: tokenHash,
    });

    if (error) {
      throw new Error(`Could not set up the first device: ${error.message}`);
    }
  } else {
    const { error } = await admin.from("authorized_devices").insert({
      user_id: user.id,
      name,
      token_hash: tokenHash,
      status: "pending",
    });

    if (error) {
      throw new Error(`Could not request device approval: ${error.message}`);
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(DEVICE_COOKIE, token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/private");
}

export async function refreshDeviceStatus() {
  const user = await getOwner();
  if (!user) redirect("/login");

  const device = await getCurrentDevice(user.id);
  if (device?.status === "approved") redirect("/private");
  redirect("/device-request?waiting=1");
}
