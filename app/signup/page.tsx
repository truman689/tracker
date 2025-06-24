'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wordmark } from '@/components/wordmark'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Check if Supabase client is available
  useEffect(() => {
    if (!supabase) {
      setError('Application configuration error. Please check environment variables.')
    }
  }, [supabase])

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!supabase) {
      setError('Cannot connect to authentication service')
      return
    }
    
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center mb-4">
            <Wordmark size="lg" className="mb-4" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-center">Sign Up</CardTitle>
          <CardDescription className="text-center text-sm">
            Create an account to start your 90days. journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {success ? (
            <div className="text-center bg-green-50 border border-green-200 text-green-800 px-4 py-6 rounded-lg">
              <div className="mb-2">
                <svg className="w-8 h-8 mx-auto text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold mb-2">Success!</p>
              <p className="text-sm">Please check your email to verify your account.</p>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 