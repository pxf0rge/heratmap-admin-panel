'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Phone as PhoneIcon, Edit2, Trash2, Plus } from 'lucide-react'

type EmergencyContact = { id: number; name: string; phone: string; icon: string; sort_order: number; is_active: boolean }

const ICON_OPTIONS = [
  { value: 'policy', label: 'پلیس' },
  { value: 'local_hospital', label: 'بیمارستان' },
  { value: 'fire_truck', label: 'آتشنشانی' },
  { value: 'bolt', label: 'برق' },
  { value: 'water_drop', label: 'آب' },
  { value: 'factory', label: 'شهرک' },
  { value: 'ambulance', label: 'آمبولانس' },
  { value: 'phone', label: 'تماس' },
]

export default function EmergencyPage() {
  const [items, setItems] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', icon: 'phone', sort_order: '0', is_active: true })

  async function load() {
    const { data } = await supabase.from('emergency_contacts').select('*').order('sort_order')
    if (data) setItems(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function set(field: string, value: string | boolean) { setForm((f) => ({ ...f, [field]: value })) }
  function resetForm() { setForm({ name: '', phone: '', icon: 'phone', sort_order: '0', is_active: true }); setEditingId(null); setShowForm(false) }

  async function handleSave() {
    if (!form.name.trim() || !form.phone.trim()) return
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 }
    if (editingId) await supabase.from('emergency_contacts').update(payload).eq('id', editingId)
    else await supabase.from('emergency_contacts').insert(payload)
    resetForm(); load()
  }
  async function handleDelete(id: number) { if (!confirm('آیا مطمئن هستید؟')) return; await supabase.from('emergency_contacts').delete().eq('id', id); load() }
  function startEdit(e: EmergencyContact) { setForm({ name: e.name || '', phone: e.phone || '', icon: e.icon || 'phone', sort_order: String(e.sort_order ?? 0), is_active: e.is_active ?? true }); setEditingId(e.id); setShowForm(true) }

  const ic = "ui-input"
  const lc = "ui-label"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-800">مدیریت شماره‌های ضروری</h1>
          <p className="text-sm text-surface-400 mt-0.5">{items.length} شماره ثبت‌شده</p>
        </div>
        <button onClick={() => showForm ? resetForm() : setShowForm(true)} className="ui-btn-primary">
          <Plus size={16} /> {showForm ? 'انصراف' : 'شماره جدید'}
        </button>
      </div>

      {showForm && (
        <div className="ui-card p-6 animate-fade-in">
          <h2 className="font-semibold text-surface-700 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-500 rounded-full inline-block" />
            {editingId ? 'ویرایش' : 'افزودن شماره'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lc}>نام سرویس *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} className={ic} placeholder="مثال: پلیس" /></div>
            <div><label className={lc}>شماره تماس *</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={ic} placeholder="0791000000" dir="ltr" /></div>
            <div>
              <label className={lc}>آیکن</label>
              <select value={form.icon} onChange={(e) => set('icon', e.target.value)} className={ic}>
                {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div><label className={lc}>ترتیب نمایش</label><input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} className={ic} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 rounded border-surface-300 text-red-500 focus:ring-red-500" />فعال</label>
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
          <PhoneIcon className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500 text-sm">هیچ شماره ضروری ثبت نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((e) => (
            <div key={e.id} className="ui-card p-5 hover:border-brand-200 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${e.is_active ? 'bg-red-50 text-red-500' : 'bg-surface-100 text-surface-400'}`}>
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(e)} className="p-1.5 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(e.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-surface-800">{e.name}</h3>
              <p className="text-sm text-surface-500 mt-1 ltr text-left dir-ltr font-mono">{e.phone}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
                <span className="text-xs text-surface-400">ترتیب: {e.sort_order}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-100 text-surface-400'}`}>
                  {e.is_active ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
