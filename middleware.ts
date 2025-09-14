import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/sign-in", "/sign-up", "/auth/callback"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith("/auth/")
  );

  // If user is not authenticated and trying to access a protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If user is authenticated and trying to access auth routes
  if (
    session &&
    (request.nextUrl.pathname === "/sign-in" ||
      request.nextUrl.pathname === "/sign-up")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is authenticated and trying to access onboarding
  if (session && request.nextUrl.pathname === "/onboarding") {
    try {
      // Check if user has completed onboarding in the users table
      const { data: userData, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, age")
        .eq("id", session.user.id)
        .single();

      // If user has completed onboarding (has first_name and age), redirect to dashboard
      if (userData?.first_name && userData?.age) {
        console.log('User already onboarded, redirecting to dashboard');
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      // If there was an error (like user not found), continue to onboarding
      if (error) {
        console.log('User check error:', error);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
    }
  }

  return response;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
