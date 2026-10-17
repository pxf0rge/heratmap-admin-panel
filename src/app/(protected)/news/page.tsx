'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Newspaper as NewspaperIcon, Edit2, Trash2, Plus } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

type NewsItem = { id: number; title: string; summary: string; body: string; cover_image: string; published_at: string | null; is_active: boolean }

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', summary: '', body: '', cover_image: '', published_at: '', is_active: true })

  async function load() {
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function set(field: string, value: string | boolean) { setForm((f) => ({ ...f, [field]: value })) }
  function resetForm() { setForm({ title: '', summary: '', body: '', cover_image: '', published_at: '', is_active: true }); setEditingId(null); setShowForm(false) }

  async function handleSave() {
    if (!form.title.trim()) return
    const payload = { ...form, published_at: form.published_at ? new Date(form.published_at).toISOString() : null }
    if (editingId) await supabase.from('news').update(payload).eq('id', editingId)
    else await supabase.from('news').insert(payload)
    resetForm(); load()
  }
  async function handleDelete(id: number) { if (!confirm('آیا مطمئن هستید؟')) return; await supabase.from('news').delete().eq('id', id); load() }
  function startEdit(n: NewsItem) {
    setForm({ title: n.title || '', summary: n.summary || '', body: n.body || '', cover_image: n.cover_image || '', published_at: n.published_at ? n.published_at.slice(0, 16) : '', is_active: n.is_active ?? true })
    setEditingId(n.id); setShowForm(true)
  }

  const ic = "ui-input"
  const lc = "ui-label"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-800">مدیریت اخبار</h1>
          <p className="text-sm text-surface-400 mt-0.5">{items.length} خبر ثبت‌شده</p>
        </div>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="ui-btn-primary">
          <Plus size={16} /> {showForm ? 'انصراف' : 'خبر جدید'}
        </button>
      </div>

      {showForm && (
        <div className="ui-card p-6 animate-fade-in">
          <h2 className="font-semibold text-surface-700 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-full inline-block" />
            {editingId ? 'ویرایش خبر' : 'خبر جدید'}
          </h2>
          <div className="space-y-4">
            <div><label className={lc}>عنوان *</label><input value={form.title} onChange={(e) => set('title', e.target.value)} className={ic} /></div>
            <div><label className={lc}>خلاصه</label><input value={form.summary} onChange={(e) => set('summary', e.target.value)} className={ic} /></div>
            <div><label className={lc}>متن کامل</label><textarea value={form.body} onChange={(e) => set('body', e.target.value)} rows={5} className={ic} /></div>
            <div>
              <label className={lc}>تاریخ انتشار</label>
              <input type="datetime-local" value={form.published_at} onChange={(e) => set('published_at', e.target.value)} className={ic} />
            </div>
            <div>
              <label className={lc}>تصویر شاخص</label>
              <ImageUpload
                value={form.cover_image}
                onChange={(url) => set('cover_image', url)}
                folder="news"
                alt="تصویر شاخص خبر"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />منتشر شده</label>
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
        <div className="ui-empty">
          <NewspaperIcon className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm">هیچ خبری ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className="ui-card p-5 hover:border-brand-200 transition-all group">
              <div className="flex items-start gap-4">
                <div className="ui-icon-box w-12 h-12 flex-shrink-0">
                  <NewspaperIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-surface-800 truncate">{n.title}</h3>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${n.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-100 text-surface-400'}`}>{n.is_active ? 'منتشر' : 'پیش‌نویس'}</span>
                  </div>
                  {n.summary && <p className="text-sm text-surface-500 line-clamp-2">{n.summary}</p>}
                  <p className="text-xs text-surface-400 mt-1.5">{n.published_at ? new Date(n.published_at).toLocaleDateString('fa-AF') : 'بدون تاریخ'}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => startEdit(n)} className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(n.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
