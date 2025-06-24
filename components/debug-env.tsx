"use client"

export function DebugEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs max-w-md">
      <h3>Debug Info:</h3>
      <p>URL: {url ? '✅ Set' : '❌ Missing'}</p>
      <p>Key: {key ? '✅ Set' : '❌ Missing'}</p>
      <p>URL Value: {url ? url.substring(0, 20) + '...' : 'undefined'}</p>
    </div>
  )
} 