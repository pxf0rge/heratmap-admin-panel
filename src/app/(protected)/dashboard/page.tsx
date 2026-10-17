'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Factory, Layers, Newspaper, Bell, Phone, TrendingUp, ArrowUpLeft, MapPin,
} from 'lucide-react'

interface Stats {
  companies: number
  phases: number
  news: number
  announcements: number
  emergency: number
  pois: number
}

const statCards = [
  { label: 'شرکت‌ها', sublabel: 'تعداد کل شرکت‌ها', valueKey: 'companies' as const, icon: Factory, href: '/companies' },
  { label: 'فازها', sublabel: 'فازهای شهرک', valueKey: 'phases' as const, icon: Layers, href: '/phases' },
  { label: 'نقاط مهم', sublabel: 'نقاط روی نقشه', valueKey: 'pois' as const, icon: MapPin, href: '/pois' },
  { label: 'اخبار', sublabel: 'اخبار منتشرشده', valueKey: 'news' as const, icon: Newspaper, href: '/news' },
  { label: 'اطلاعیه‌ها', sublabel: 'اطلاعیه فعال', valueKey: 'announcements' as const, icon: Bell, href: '/announcements' },
  { label: 'شماره ضروری', sublabel: 'شماره‌های اضطراری', valueKey: 'emergency' as const, icon: Phone, href: '/emergency' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    companies: 0, phases: 0, news: 0, announcements: 0, emergency: 0, pois: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const results = await Promise.all([
        supabase.from('factories').select('*', { count: 'exact', head: true }),
        supabase.from('phases').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('emergency_contacts').select('*', { count: 'exact', head: true }),
        supabase.from('pois').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        companies: results[0].count ?? 0,
        phases: results[1].count ?? 0,
        news: results[2].count ?? 0,
        announcements: results[3].count ?? 0,
        emergency: results[4].count ?? 0,
        pois: results[5].count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const totalItems =
    stats.companies + stats.phases + stats.news +
    stats.announcements + stats.emergency + stats.pois

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">داشبورد</h1>
          <p className="text-sm text-surface-400 mt-1">
            نمای کلی وضعیت شهرک صنعتی هرات
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-600 bg-white px-4 py-2 rounded-xl border border-surface-200">
          <TrendingUp size={16} className="text-brand-500" />
          <span>{totalItems} رکورد کل</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = stats[card.valueKey]
          return (
            <button
              key={card.label}
              onClick={() => router.push(card.href)}
              className="group ui-card p-5 text-right hover:border-brand-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="ui-icon-box group-hover:bg-brand-100 transition-colors">
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex items-center gap-1 text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  مشاهده
                  <ArrowUpLeft size={12} />
                </div>
              </div>
              <p className="text-3xl font-bold text-surface-800 tabular-nums">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-surface-100 rounded-lg animate-pulse" />
                ) : (
                  value
                )}
              </p>
              <p className="text-sm text-surface-600 mt-1 font-medium">{card.label}</p>
              <p className="text-xs text-surface-400 mt-0.5">{card.sublabel}</p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ui-card p-6">
          <h2 className="ui-section-title mb-3">
            <span className="ui-section-bar" />
            درباره پروژه
          </h2>
          <p className="text-sm text-surface-500 leading-relaxed">
            این پنل مدیریت برای کنترل و بروزرسانی اطلاعات شهرک صنعتی هرات طراحی شده است.
            از منوی سمت راست می‌توانید به بخش‌های مختلف دسترسی داشته باشید.
          </p>
        </div>
        <div className="ui-card p-6">
          <h2 className="ui-section-title mb-3">
            <span className="ui-section-bar" />
            راهنمای سریع
          </h2>
          <div className="space-y-2 text-sm text-surface-500">
            <p>
              • از <span className="font-medium text-surface-700">شرکت‌ها</span> برای مدیریت اطلاعات کارخانه‌ها استفاده کنید
            </p>
            <p>
              • <span className="font-medium text-surface-700">اخبار</span> و{' '}
              <span className="font-medium text-surface-700">اطلاعیه‌ها</span> را از بخش مربوطه ارسال کنید
            </p>
            <p>
              • <span className="font-medium text-surface-700">شماره‌های ضروری</span> برای پلیس، بیمارستان و آتش‌نشانی
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
