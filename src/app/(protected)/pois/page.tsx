'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { MapPin, Plus, Search } from 'lucide-react'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false, loading: () => <div className="h-[300px] bg-surface-100 rounded-xl animate-pulse" /> })

type Poi = Database['public']['Tables']['pois']['Row']

const POI_ICONS = [
  { value: 'location_on', label: '📍 location_on' },
  { value: 'school', label: '🏫 school' },
  { value: 'local_hospital', label: '🏥 local_hospital' },
  { value: 'local_gas_station', label: '⛽ local_gas_station' },
  { value: 'restaurant', label: '🍽️ restaurant' },
  { value: 'local_parking', label: '🅿️ local_parking' },
  { value: 'mosque', label: '🕌 mosque' },
  { value: 'store', label: '🏪 store' },
  { value: 'local_police', label: '👮 local_police' },
  { value: 'local_fire_station', label: '🚒 local_fire_station' },
  { value: 'account_balance', label: '🏛️ account_balance' },
  { value: 'park', label: '🌳 park' },
]

const POI_CATEGORIES = ['entrance', 'service', 'food', 'religious', 'emergency', 'general']

export default function PoisPage() {
  const [pois, setPois] = useState<Poi[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', name_en: '', lat: '', lon: '', icon: 'location_on', category: 'general', is_active: true, sort_order: '0' })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('pois').select('*').order('sort_order')
    if (data) setPois(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function set(field: string, value: string | boolean) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSave() {
    if (!form.name.trim() || !form.lat || !form.lon || saving) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      name_en: form.name_en.trim(),
      lat: parseFloat(form.lat),
      lon: parseFloat(form.lon),
      icon: form.icon,
      category: form.category,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order) || 0,
    }
    if (editingId) await supabase.from('pois').update(payload).eq('id', editingId)
    else await supabase.from('pois').insert(payload)
    resetForm(); load()
    setSaving(false)
  }

  async function handleDelete(id: number) { if (!confirm('آیا مطمئن هستید؟')) return; await supabase.from('pois').delete().eq('id', id); load() }

  function startEdit(p: Poi) { setForm({ name: p.name || '', name_en: p.name_en || '', lat: String(p.lat ?? ''), lon: String(p.lon ?? ''), icon: p.icon || 'location_on', category: p.category || 'general', is_active: p.is_active ?? true, sort_order: String(p.sort_order ?? 0) }); setEditingId(p.id); setShowForm(true) }
  function resetForm() { setForm({ name: '', name_en: '', lat: '', lon: '', icon: 'location_on', category: 'general', is_active: true, sort_order: '0' }); setEditingId(null); setShowForm(false) }

  const filtered = pois.filter((p) => p.name.includes(search) || p.name_en?.includes(search) || p.category?.includes(search))

  const ic = "ui-input"
  const lc = "ui-label"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-800">نقاط مهم (POI)</h1>
          <p className="text-sm text-surface-400 mt-0.5">{pois.length} نقطه ثبت‌شده</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="ui-search" />
          </div>
          <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="ui-btn-primary">
            <Plus size={16} />
            {showForm ? 'انصراف' : 'نقطه جدید'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="ui-card p-6 animate-fade-in relative z-10">
          <h2 className="font-semibold text-surface-700 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-full inline-block" />
            {editingId ? 'ویرایش نقطه' : 'افزودن نقطه'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className={lc}>نام فارسی *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} className={ic} placeholder="ورودی اصلی" /></div>
            <div><label className={lc}>نام انگلیسی</label><input value={form.name_en} onChange={(e) => set('name_en', e.target.value)} className={ic} placeholder="Main Entrance" dir="ltr" /></div>
            <div><label className={lc}>دسته‌بندی</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className={ic}>
                {POI_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={lc}>آیکون</label>
              <select value={form.icon} onChange={(e) => set('icon', e.target.value)} className={ic}>
                {POI_ICONS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div><label className={lc}>اولویت نمایش</label><input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} className={ic} /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer pb-2.5">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                <span className="text-sm text-surface-700">فعال</span>
              </label>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-surface-500 mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} /> موقعیت جغرافیایی (دوبار کلیک کنید)
              </label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="text-[10px] text-surface-400">عرض جغرافیایی</label>
                  <input value={form.lat} onChange={(e) => set('lat', e.target.value)} className={ic} type="number" step="any" placeholder="34.217" />
                </div>
                <div>
                  <label className="text-[10px] text-surface-400">طول جغرافیایی</label>
                  <input value={form.lon} onChange={(e) => set('lon', e.target.value)} className={ic} type="number" step="any" placeholder="62.207" />
                </div>
              </div>
              <LocationPicker lat={form.lat} lon={form.lon} onLocationChange={(lat, lon) => setForm((f) => ({ ...f, lat, lon }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-surface-100">
            <button onClick={resetForm} className="ui-btn-ghost">انصراف</button>
            <button onClick={handleSave} disabled={saving} className="ui-btn-primary px-5">
              {saving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="ui-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="ui-card p-12 text-center">
          <MapPin className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm">{search ? 'نتیجه‌ای یافت نشد' : 'هیچ نقطه‌ای ثبت نشده است.'}</p>
        </div>
      ) : (
        <div className="ui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  {['نام', 'نام انگلیسی', 'دسته‌بندی', 'مختصات', 'وضعیت', 'عملیات'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-50/50 transition-colors group">
                    <td className="px-4 py-3.5 font-medium text-surface-800">{p.name}</td>
                    <td className="px-4 py-3.5 text-surface-500">{p.name_en || '—'}</td>
                    <td className="px-4 py-3.5"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">{p.category || 'general'}</span></td>
                    <td className="px-4 py-3.5 text-surface-400 text-xs">{p.lat.toFixed(4)}, {p.lon.toFixed(4)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${(p.is_active ?? true) ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-100 text-surface-400'}`}>
                        {(p.is_active ?? true) ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(p)} className="ui-btn-edit">ویرایش</button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
