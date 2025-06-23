import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import type { Database } from '@/lib/database.types' // 👉 tweak path if different

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Edge-safe Supabase client (with hardcoded credentials)
  const supabase = createMiddlewareClient({ req, res }, {
    supabaseUrl: "https://kbqvjbinilpctbnyomrd.supabase.co",
    supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticXZqYmluaWxwY3RibnlvbXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Mjc5ODgsImV4cCI6MjA2NjIwMzk4OH0.8WY7ME4CNFMnhiva3TV45tO-JeeOEnko7oihx27Ns5E"
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