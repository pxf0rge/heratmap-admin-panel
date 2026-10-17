'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Layers as LayersIcon, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import ImageUpload from '@/components/ImageUpload'

const BoundaryEditor = dynamic(() => import('@/components/BoundaryEditor'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-surface-100 rounded-xl animate-pulse" />,
})

type Phase = {
  id: number
  name: string
  number: number
  image: string
  description: string
  area: string
  is_active: boolean
  boundary: number[][]
}

const emptyForm = {
  name: '',
  number: '',
  image: '',
  description: '',
  area: '',
  is_active: true,
  boundary: [] as number[][],
}

export default function PhasesPage() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  async function load() {
    const { data, error: loadError } = await supabase.from('phases').select('*').order('number')
    if (loadError) setError(loadError.message)
    if (data) setPhases(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function set(field: string, value: string | boolean | number[][]) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('نام فاز الزامی است')
      return
    }
    setSaving(true)
    setError('')
    const num = parseInt(form.number, 10) || 0
    const payload = {
      name: form.name.trim(),
      number: num,
      image: form.image || '',
      description: form.description || '',
      area: form.area || '',
      is_active: form.is_active,
      boundary: form.boundary || [],
    }

    const { error: saveError } = editingId
      ? await supabase.from('phases').update(payload).eq('id', editingId)
      : await supabase.from('phases').insert(payload)

    setSaving(false)

    if (saveError) {
      if (saveError.code === '23505') {
        setError('فازی با این نام از قبل وجود دارد')
      } else if (saveError.code === '42501' || /permission|policy|rls/i.test(saveError.message)) {
        setError('دسترسی نوشتن برای فازها فعال نیست. مهاجرت دیتابیس را اعمال کنید.')
      } else {
        setError(saveError.message)
      }
      return
    }

    resetForm()
    load()
  }

  async function handleDelete(id: number) {
    if (!confirm('آیا مطمئن هستید؟')) return
    setError('')
    const { error: deleteError } = await supabase.from('phases').delete().eq('id', id)
    if (deleteError) {
      if (deleteError.code === '23503') {
        setError('این فاز شرکت دارد و قابل حذف نیست. ابتدا شرکت‌ها را به فاز دیگری منتقل کنید.')
      } else if (deleteError.code === '42501' || /permission|policy|rls/i.test(deleteError.message)) {
        setError('دسترسی حذف برای فازها فعال نیست. مهاجرت دیتابیس را اعمال کنید.')
      } else {
        setError(deleteError.message)
      }
      return
    }
    load()
  }

  async function toggleActive(id: number, current: boolean) {
    const { error: toggleError } = await supabase
      .from('phases')
      .update({ is_active: !current })
      .eq('id', id)
    if (toggleError) {
      setError(toggleError.message)
      return
    }
    load()
  }

  function startEdit(p: Phase) {
    setError('')
    setForm({
      name: p.name,
      number: String(p.number),
      image: p.image || '',
      description: p.description || '',
      area: p.area || '',
      is_active: p.is_active ?? true,
      boundary: p.boundary || [],
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  const ic = 'ui-input'
  const lc = 'ui-label'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-800">مدیریت فازها</h1>
          <p className="text-sm text-surface-400 mt-0.5">{phases.length} فاز ثبت‌شده</p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : (setError(''), setShowForm(true)))}
          className="ui-btn-primary"
        >
          <Plus size={16} />
          {showForm ? 'انصراف' : 'فاز جدید'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="ui-card p-6 animate-fade-in">
          <h2 className="font-semibold text-surface-700 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-full inline-block" />
            {editingId ? 'ویرایش فاز' : 'افزودن فاز'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={lc}>نام فاز *</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={ic}
                placeholder="فاز ۱"
              />
            </div>
            <div>
              <label className={lc}>شماره</label>
              <input
                type="number"
                value={form.number}
                onChange={(e) => set('number', e.target.value)}
                className={ic}
                placeholder="1"
              />
            </div>
            <div>
              <label className={lc}>مساحت</label>
              <input
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
                className={ic}
                placeholder="مثال: ۱۵ هکتار"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={lc}>توضیحات</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className={ic}
                placeholder="توضیحات فاز..."
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={lc}>تصویر فاز</label>
              <ImageUpload
                value={form.image}
                onChange={(url) => set('image', url)}
                folder="phases"
                alt="تصویر فاز"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-surface-700">فاز فعال باشد</span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <label className={lc}>مرز فاز روی نقشه (نقطه‌گذاری)</label>
            <BoundaryEditor
              key={editingId ?? 'new'}
              value={form.boundary}
              onChange={(coords) => set('boundary', coords)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-surface-100">
            <button onClick={resetForm} className="ui-btn-ghost" disabled={saving}>
              انصراف
            </button>
            <button onClick={handleSave} className="ui-btn-primary px-5" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="ui-spinner" />
        </div>
      ) : phases.length === 0 ? (
        <div className="ui-card p-12 text-center">
          <LayersIcon className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm">هیچ فازی ثبت نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {phases.map((p) => (
            <div key={p.id} className="ui-card p-5 hover:border-brand-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="ui-icon-box font-bold text-sm">{p.number}</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(p.id, p.is_active ?? true)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      (p.is_active ?? true)
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-surface-100 text-surface-400 hover:bg-surface-200'
                    }`}
                  >
                    {(p.is_active ?? true) ? 'فعال' : 'غیرفعال'}
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(p)} className="ui-btn-edit">
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-surface-800">{p.name}</h3>
              {p.area && <p className="text-xs text-surface-400 mt-1">{p.area}</p>}
              {p.description && (
                <p className="text-xs text-surface-500 mt-1 line-clamp-2">{p.description}</p>
              )}
              {p.boundary && p.boundary.length > 0 && (
                <p className="text-xs text-brand-500 mt-1">✓ مرز نقشه ثبت شده</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
