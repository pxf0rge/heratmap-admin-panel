'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, Factory, Layers, Newspaper, Bell, Phone, LogOut,
  ChevronLeft, ChevronRight, MapPin,
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: React.ElementType }

const navItems: NavItem[] = [
  { label: 'داشبورد', href: '/dashboard', icon: LayoutDashboard },
  { label: 'شرکت‌ها', href: '/companies', icon: Factory },
  { label: 'فازها', href: '/phases', icon: Layers },
  { label: 'نقاط مهم', href: '/pois', icon: MapPin },
  { label: 'اخبار', href: '/news', icon: Newspaper },
  { label: 'اطلاعیه‌ها', href: '/announcements', icon: Bell },
  { label: 'شماره‌های ضروری', href: '/emergency', icon: Phone },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [activeHref, setActiveHref] = useState(pathname)

  useEffect(() => {
    setActiveHref(pathname)
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentLabel =
    navItems.find((n) => n.href === activeHref)?.label ?? 'ادمین پنل'

  return (
    <div className="flex min-h-screen bg-surface-100" dir="rtl">
      <aside
        className={`fixed right-0 top-0 h-full flex flex-col z-20 transition-all duration-300 border-l border-brand-800/40 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
        style={{ background: '#0d3838' }}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Factory className="text-white w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-white font-bold text-sm truncate">شهرک صنعتی هرات</p>
              <p className="text-white/45 text-xs">پنل مدیریت</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeHref === item.href
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  setActiveHref(item.href)
                }}
                title={item.label}
                className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                  collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-white/55 hover:bg-white/8 hover:text-white/90'
                }`}
              >
                <Icon size={20} strokeWidth={1.8} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 space-y-1 border-t border-white/8">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'باز کردن' : 'بستن'}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-white/35 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            {!collapsed && <span className="text-xs">بستن منو</span>}
          </button>
          <button
            onClick={handleLogout}
            title="خروج"
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-red-300/70 hover:text-red-200 hover:bg-red-500/15 transition-all"
          >
            <LogOut size={18} strokeWidth={1.8} />
            {!collapsed && <span className="text-sm font-medium">خروج</span>}
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? 'mr-[72px]' : 'mr-64'
        }`}
      >
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-surface-200 px-8 h-14 flex items-center justify-between">
          <p className="text-sm font-semibold text-surface-800">{currentLabel}</p>
          <div className="flex items-center gap-2 text-xs text-surface-500 bg-surface-50 px-3 py-1.5 rounded-full border border-surface-200">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            آنلاین
          </div>
        </header>

        <div className="p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  )
}
