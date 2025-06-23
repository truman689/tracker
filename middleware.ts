import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import type { Database } from '@/lib/database.types' // 👉 tweak path if different

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Edge-safe Supabase client using environment variables
  const supabase = createMiddlewareClient({ req, res }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  })

  // Example: refresh session so SSR pages always have up-to-date auth
  await supabase.auth.getSession()

  return res
}

/**
 * Run the middleware on everything except static files / APIs.
 * Tighten this list if you only need auth on specific routes.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 