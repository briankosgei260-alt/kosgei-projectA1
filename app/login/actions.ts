"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendSignInLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

  if (!ownerEmail) {
    throw new Error("OWNER_EMAIL is not configured.");
  }

  if (!email || email !== ownerEmail) {
    redirect("/login?error=owner");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl.replace(/\/$/, "")}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(`Could not send sign-in link: ${error.message}`);
  }

  redirect("/login?sent=1");
}
