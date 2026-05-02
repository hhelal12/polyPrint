import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/database.types";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // 1. ALLOW ROOT FOR INVITES
  // If the user lands on the root (/) without a cookie, we MUST let them load the page
  // so the client-side Supabase script can grab the #access_token and set the cookie.
  if (url.pathname === "/") {
    return supabaseResponse;
  }

  // 2. ALLOW SETUP-PASSWORD
  if (url.pathname === "/setup-password") {
    return supabaseResponse;
  }

  // 3. PROTECT DASHBOARD
  if (!user && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 4. PREVENT RE-LOGIN
  if (user && (url.pathname === "/login" || url.pathname === "/signUp")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
};