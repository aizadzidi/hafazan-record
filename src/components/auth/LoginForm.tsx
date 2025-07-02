'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Handle error from URL parameters
  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo('')

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Check if passwords match for signup
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }

        setDebugInfo('Starting signup process...')

        try {
          // Sign up
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                role: 'parent' // Set initial role in auth metadata
              }
            },
          })

          if (signUpError) {
            setDebugInfo(prev => prev + '\nSignup error: ' + JSON.stringify(signUpError, null, 2))
            throw signUpError
          }

          if (!authData?.user) {
            throw new Error('No user data returned from signup')
          }

          setDebugInfo(prev => prev + '\nAuth signup successful')

          // The trigger will insert the user into the users table, so we do not need to do it here.

          toast.success('Check your email to confirm your account!')
          // Clear form after successful signup
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        } catch (innerError: any) {
          setDebugInfo(prev => prev + '\nInner error: ' + JSON.stringify({
            message: innerError.message,
            name: innerError.name,
            code: innerError.code,
            status: innerError.status,
            details: innerError.details,
            hint: innerError.hint
          }, null, 2))
          throw innerError
        }
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        // Refresh the page to update server state
        router.refresh()
      }
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        name: error.name,
        code: error.code,
        status: error.status,
        details: error.details,
        hint: error.hint
      }
      setDebugInfo(prev => prev + '\nFinal error: ' + JSON.stringify(errorDetails, null, 2))
      toast.error(error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setDebugInfo('')
  }

  return (
    <>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                isSignUp ? '' : 'rounded-b-md'
              } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
              placeholder="Password"
              minLength={6}
            />
          </div>
          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                minLength={6}
              />
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? `${isSignUp ? 'Signing up...' : 'Signing in...'}`
              : `${isSignUp ? 'Sign up' : 'Sign in'}`}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
            {debugInfo}
          </div>
        )}
      </form>
    </>
  )
} 