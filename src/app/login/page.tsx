'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Factory, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (session) {
    router.push('/dashboard')
    return null
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0a2b2b 0%, #114747 45%, #1a6b6b 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, white 0%, transparent 45%), radial-gradient(circle at 80% 80%, white 0%, transparent 40%)',
      }} />

      <div className="w-full max-w-md mx-4 relative z-10 animate-fade-in">
        <div className="bg-white rounded-2xl border border-white/20 p-8 shadow-xl shadow-black/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 mb-4">
              <Factory className="text-brand-500 w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-surface-800">شهرک صنعتی هرات</h1>
            <p className="text-sm text-surface-400 mt-1">پنل مدیریت</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="ui-label">ایمیل</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ui-input pr-10 bg-surface-50"
                  placeholder="admin@heratmap.af"
                  required
                />
              </div>
            </div>
            <div>
              <label className="ui-label">رمز عبور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ui-input pr-10 bg-surface-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="ui-btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  در حال ورود...
                </span>
              ) : (
                'ورود به پنل'
              )}
            </button>
          </form>

          <p className="text-xs text-surface-400 text-center mt-6">
            حساب پیش‌فرض را از داشبورد Supabase ایجاد کنید.
          </p>
        </div>
      </div>
    </div>
  )
}
