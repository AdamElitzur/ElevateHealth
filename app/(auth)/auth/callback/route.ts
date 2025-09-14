import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      await supabase
        .from("users")
        .upsert({ id: user.id }, { onConflict: "id" });
    }
  }

  // Redirect to onboarding without extra params
  return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
}
