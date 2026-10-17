'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [session, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100">
      <div className="text-center">
        <div className="ui-spinner mx-auto mb-4" />
        <p className="text-surface-400 text-sm">در حال بارگذاری...</p>
      </div>
    </div>
  )
}
