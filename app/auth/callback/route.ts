import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=link", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=link", request.url));
  }

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    return NextResponse.redirect(new URL("/login?error=link", request.url));
  }

  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!ownerEmail) {
    throw new Error("OWNER_EMAIL is not configured.");
  }
  if (data.user.email?.toLowerCase() !== ownerEmail) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=owner", request.url));
  }

  return NextResponse.redirect(new URL("/device-request", request.url));
}
