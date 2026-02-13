'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, LogIn, Eye, EyeOff } from 'lucide-react'
import LoginQuotes from '@/components/auth/LoginQuotes'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const emailInputRef = useRef(null)
  const fullNameInputRef = useRef(null)
  const router = useRouter()
  const supabase = createClient()

  // Auto-focus logic
  useEffect(() => {
    if (isSignUp) {
      fullNameInputRef.current?.focus()
    } else {
      emailInputRef.current?.focus()
    }
    // Clear alerts when switching modes
    setError(null)
    setMessage(null)
  }, [isSignUp])

  const handleAuth = async (e) => {
    e.preventDefault()
    if (loading) return // Prevent multiple submissions

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // Navigation is handled by middleware once session is established, 
        // but explicit push for immediate response
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Column - Quotes (Now a separate component to prevent global re-renders) */}
      <LoginQuotes />

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isSignUp ? 'Create an account' : 'Welcome Back'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isSignUp ? 'Enter your details to create your account' : 'Please enter your details to sign in'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-600 border border-green-100 animate-in fade-in slide-in-from-top-1">
                {message}
              </div>
            )}

            <div className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">Full Name</label>
                  <input
                    ref={fullNameInputRef}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-6 font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2 mx-auto"
            >
              {isSignUp ? (
                <>
                  Already have an account? Sign in
                </>
              ) : (
                <>
                  Don't have an account? Sign up
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
