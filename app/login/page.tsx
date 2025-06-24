'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DebugEnv } from '@/components/debug-env'
import { Wordmark } from '@/components/wordmark'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Redirect if no Supabase client (missing env vars)
  useEffect(() => {
    if (!supabase) {
      setError('Application configuration error. Please check environment variables.')
    }
  }, [supabase])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!supabase) {
      setError('Cannot connect to authentication service')
      return
    }
    
    setError(null)
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/')
      router.refresh() // Ensures the layout is re-rendered with the new session
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <DebugEnv />
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center mb-4">
            <Wordmark size="lg" className="mb-4" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center text-sm">
            Enter your email and password to access your 90days. account.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!supabase || isLoading}
                className="h-12 text-base border-2 focus:border-brand-500 transition-colors touch-manipulation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!supabase || isLoading}
                className="h-12 text-base border-2 focus:border-brand-500 transition-colors touch-manipulation"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-brand-500 hover:bg-brand-600 transition-colors touch-manipulation" 
              disabled={!supabase || isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-600 hover:text-brand-700 font-semibold underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 