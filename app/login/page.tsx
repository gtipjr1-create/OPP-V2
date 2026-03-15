'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error
        setMessage('Account created. You can now sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        setMessage('Signed in successfully.')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.'
      setMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-2xl font-semibold">OPP Login</h1>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-xl px-4 py-2 border ${mode === 'signup' ? 'font-semibold' : ''}`}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`rounded-xl px-4 py-2 border ${mode === 'signin' ? 'font-semibold' : ''}`}
        >
          Sign In
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl border px-4 py-3 font-medium"
        >
          {loading ? 'Working...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm">{message}</p> : null}
    </main>
  )
}