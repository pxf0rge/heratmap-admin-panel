'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { Factory as FactoryIcon, Plus, Search, MapPin, Globe } from 'lucide-react'
import dynamic from 'next/dynamic'
import SearchableSelect from '@/components/SearchableSelect'
import ImageUpload from '@/components/ImageUpload'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false, loading: () => <div className="h-[300px] bg-surface-100 rounded-xl animate-pulse" /> })

type Factory = Database['public']['Tables']['factories']['Row']

export default function CompaniesPage() {
  const [factories, setFactories] = useState<Factory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', category: '', phase: '', lat: '', lon: '', address: '', phone: '', work_start: '', work_end: '', lot_number: '', is_active: true, description: '', image: '', website_url: '' })
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [phases, setPhases] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function load() {
    const [factRes, phaseRes] = await Promise.all([
      supabase.from('factories').select('*').order('name'),
      supabase.from('phases').select('name').order('number'),
    ])
    if (factRes.data) {
      setFactories(factRes.data)
      setCategories([...new Set(factRes.data.map((f) => f.category).filter(Boolean))])
    }
    if (phaseRes.data) {
      setPhases(phaseRes.data.map((p) => p.name).filter(Boolean))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim() || saving) return
    setSaving(true)

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      category: form.category.trim(),
      phase: form.phase.trim(),
      lat: form.lat ? parseFloat(form.lat) : null,
      lon: form.lon ? parseFloat(form.lon) : null,
      address: form.address.trim(),
      phone: form.phone.trim(),
      work_start: form.work_start,
      work_end: form.work_end,
      lot_number: form.lot_number.trim(),
      is_active: form.is_active,
      description: form.description.trim(),
      image: form.image,
      website_url: form.website_url.trim(),
    }

    let error
    if (editingId) {
      ;({ error } = await supabase.from('factories').update(payload).eq('id', editingId))
    } else {
      ;({ error } = await supabase.from('factories').insert(payload))
    }

    if (error) {
      console.error('Save error:', error)
      alert(`خطا در ذخیره: ${error.message}`)
    } else {
      resetForm()
      load()
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('آیا از حذف این شرکت مطمئن هستید؟')) return
    const { error } = await supabase.from('factories').delete().eq('id', id)
    if (error) {
      console.error('Delete error:', error)
      alert(`خطا در حذف: ${error.message}`)
    } else {
      load()
    }
  }

  async function toggleActive(id: number, current: boolean) {
    const { error } = await supabase.from('factories').update({ is_active: !current }).eq('id', id)
    if (!error) load()
  }

  function startEdit(f: Factory) {
    setForm({ name: f.name || '', category: f.category || '', phase: f.phase || '', lat: String(f.lat ?? ''), lon: String(f.lon ?? ''), address: f.address || '', phone: f.phone || '', work_start: (f as any).work_start || '', work_end: (f as any).work_end || '', lot_number: (f as any).lot_number || '', is_active: (f as any).is_active ?? true, description: f.description || '', image: f.image || '', website_url: (f as any).website_url || '' })
    setEditingId(f.id)
    setShowForm(true)
  }

  function resetForm() {
    setForm({ name: '', category: '', phase: '', lat: '', lon: '', address: '', phone: '', work_start: '', work_end: '', lot_number: '', is_active: true, description: '', image: '', website_url: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const filtered = factories.filter((f) =>
    f.name.includes(search) || f.category.includes(search) || f.phase.includes(search) || f.address.includes(search)
  )

  const ic = "ui-input"
  const lc = "ui-label"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-800">مدیریت شرکت‌ها</h1>
          <p className="text-sm text-surface-400 mt-0.5">{factories.length} شرکت ثبت‌شده</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو..."
              className="ui-search"
            />
          </div>
          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="ui-btn-primary"
          >
            <Plus size={16} />
            {showForm ? 'انصراف' : 'شرکت جدید'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="ui-card p-6 animate-fade-in relative z-10">
          <h2 className="font-semibold text-surface-700 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-full inline-block" />
            {editingId ? 'ویرایش شرکت' : 'افزودن شرکت'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className={lc}>نام شرکت *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} className={ic} placeholder="مثال: زلال موفق" /></div>
            <div className="relative z-[100]">
              <SearchableSelect
                label="دسته‌بندی"
                value={form.category}
                options={categories}
                onChange={(v) => set('category', v)}
                placeholder="انتخاب دسته‌بندی"
                creatable
              />
            </div>
            <div className="relative z-[100]">
              <SearchableSelect
                label="فاز"
                value={form.phase}
                options={phases}
                onChange={(v) => set('phase', v)}
                placeholder="انتخاب فاز"
              />
            </div>
            <div><label className={lc}>شماره قطعه/نمره</label><input value={form.lot_number} onChange={(e) => set('lot_number', e.target.value)} className={ic} placeholder="مثال: ۱۲" /></div>
            <div><label className={lc}>شماره تماس</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={ic} placeholder="0791323424" /></div>
            <div><label className={lc}>ساعت شروع کار</label><input type="time" value={form.work_start} onChange={(e) => set('work_start', e.target.value)} className={ic} /></div>
            <div><label className={lc}>ساعت پایان کار</label><input type="time" value={form.work_end} onChange={(e) => set('work_end', e.target.value)} className={ic} /></div>
            <div className="lg:col-span-2">
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
            <div className="lg:col-span-1">
              <label className={lc}>تصویر شرکت</label>
              <ImageUpload
                value={form.image}
                onChange={(url) => set('image', url)}
                folder="factories"
                alt="تصویر شرکت"
              />
            </div>
            <div className="lg:col-span-2"><label className={lc}>آدرس</label><input value={form.address} onChange={(e) => set('address', e.target.value)} className={ic} placeholder="خیابان اول" /></div>
            <div className="lg:col-span-3"><label className={lc}>توضیحات</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={ic} /></div>
            <div className="lg:col-span-3">
              <label className="block text-xs font-medium text-surface-500 mb-1.5 flex items-center gap-1.5">
                <Globe size={13} /> وبسایت شرکت
              </label>
              <input value={form.website_url} onChange={(e) => set('website_url', e.target.value)} className={ic} placeholder="https://example.com" dir="ltr" />
            </div>
            <div className="lg:col-span-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                <span className="text-sm text-surface-700">شرکت فعال باشد (در اپ نمایش داده شود)</span>
              </label>
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
          <FactoryIcon className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm">{search ? 'نتیجه‌ای یافت نشد' : 'هیچ شرکتی ثبت نشده است.'}</p>
        </div>
      ) : (
        <div className="ui-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  {['نام', 'دسته‌بندی', 'فاز', 'نمره', 'وضعیت', 'شماره تماس', 'عملیات'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-right text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-surface-50/50 transition-colors group">
                    <td className="px-4 py-3.5 font-medium text-surface-800">{f.name}</td>
                    <td className="px-4 py-3.5"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">{f.category || '—'}</span></td>
                    <td className="px-4 py-3.5 text-surface-500">{f.phase || '—'}</td>
                    <td className="px-4 py-3.5 text-surface-500">{(f as any).lot_number || '—'}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => toggleActive(f.id, (f as any).is_active ?? true)} className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${((f as any).is_active ?? true) ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-surface-100 text-surface-400 hover:bg-surface-200'}`}>
                        {((f as any).is_active ?? true) ? 'فعال' : 'غیرفعال'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-surface-500 ltr text-left dir-ltr">{f.phone || '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(f)} className="ui-btn-edit">ویرایش</button>
                        <button onClick={() => handleDelete(f.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">حذف</button>
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
