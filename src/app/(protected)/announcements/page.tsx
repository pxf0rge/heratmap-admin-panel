'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell as BellIcon, Edit2, Trash2, Plus } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

type Announcement = { id: number; title: string; body: string; image: string; published_at: string | null; expires_at: string | null; is_active: boolean }

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', body: '', image: '', published_at: '', expires_at: '', is_active: true })

  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('published_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function set(field: string, value: string | boolean) { setForm((f) => ({ ...f, [field]: value })) }
  function resetForm() { setForm({ title: '', body: '', image: '', published_at: '', expires_at: '', is_active: true }); setEditingId(null); setShowForm(false) }

  async function handleSave() {
    if (!form.title.trim()) return
    const payload = { ...form, published_at: form.published_at ? new Date(form.published_at).toISOString() : null, expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null }
    if (editingId) await supabase.from('announcements').update(payload).eq('id', editingId)
    else await supabase.from('announcements').insert(payload)
    resetForm(); load()
  }
  async function handleDelete(id: number) { if (!confirm('آیا مطمئن هستید؟')) return; await supabase.from('announcements').delete().eq('id', id); load() }
  function startEdit(a: Announcement) {
    setForm({ title: a.title || '', body: a.body || '', image: a.image || '', published_at: a.published_at ? a.published_at.slice(0, 16) : '', expires_at: a.expires_at ? a.expires_at.slice(0, 16) : '', is_active: a.is_active ?? true })
    setEditingId(a.id); setShowForm(true)
  }

  const ic = "ui-input"
  const lc = "ui-label"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-800">مدیریت اطلاعیه‌ها</h1>
          <p className="text-sm text-surface-400 mt-0.5">{items.length} اطلاعیه ثبت‌شده</p>
        </div>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="ui-btn-primary">
          <Plus size={16} /> {showForm ? 'انصراف' : 'اطلاعیه جدید'}
        </button>
      </div>

      {showForm && (
        <div className="ui-card p-6 animate-fade-in">
          <h2 className="font-semibold text-surface-700 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-full inline-block" />
            {editingId ? 'ویرایش اطلاعیه' : 'اطلاعیه جدید'}
          </h2>
          <div className="space-y-4">
            <div><label className={lc}>عنوان *</label><input value={form.title} onChange={(e) => set('title', e.target.value)} className={ic} /></div>
            <div><label className={lc}>متن</label><textarea value={form.body} onChange={(e) => set('body', e.target.value)} rows={4} className={ic} /></div>
            <div>
              <label className={lc}>تصویر</label>
              <ImageUpload
                value={form.image}
                onChange={(url) => set('image', url)}
                folder="announcements"
                alt="تصویر اطلاعیه"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={lc}>تاریخ انتشار</label><input type="datetime-local" value={form.published_at} onChange={(e) => set('published_at', e.target.value)} className={ic} /></div>
              <div><label className={lc}>تاریخ انقضا</label><input type="datetime-local" value={form.expires_at} onChange={(e) => set('expires_at', e.target.value)} className={ic} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />فعال</label>
          </div>
          <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-surface-100">
            <button onClick={resetForm} className="ui-btn-ghost">انصراف</button>
            <button onClick={handleSave} className="ui-btn-primary px-5">ذخیره</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="ui-spinner" /></div>
      ) : items.length === 0 ? (
        <div className="ui-card p-12 text-center">
          <BellIcon className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm">هیچ اطلاعیه‌ای ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const expired = a.expires_at && new Date(a.expires_at) < new Date()
            return (
              <div key={a.id} className="ui-card p-5 hover:border-brand-200 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${expired ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-500'}`}>
                    <BellIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-surface-800 truncate">{a.title}</h3>
                      {expired && <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">منقضی</span>}
                      {!expired && a.is_active && <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">فعال</span>}
                      {!expired && !a.is_active && <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-400">غیرفعال</span>}
                    </div>
                    {a.body && <p className="text-sm text-surface-500 line-clamp-2">{a.body}</p>}
                    <p className="text-xs text-surface-400 mt-1.5">
                      {a.published_at ? new Date(a.published_at).toLocaleDateString('fa-AF') : '—'}
                      {' → '}
                      {a.expires_at ? new Date(a.expires_at).toLocaleDateString('fa-AF') : 'بدون انقضا'}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => startEdit(a)} className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
