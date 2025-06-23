import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Simple middleware that just passes through requests
  // We'll handle auth client-side instead of in middleware to avoid deployment issues
  
  const res = NextResponse.next()
  
  // Optional: Add any headers you need
  res.headers.set('x-middleware-cache', 'no-cache')
  
  return res
}

/**
 * Run the middleware on everything except static files / APIs.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 