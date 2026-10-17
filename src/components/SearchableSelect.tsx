'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'

interface SearchableSelectProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  creatable?: boolean
  onAdd?: (value: string) => void
}

export default function SearchableSelect({ value, options, onChange, placeholder = 'انتخاب کنید', label, creatable = false, onAdd }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [newItem, setNewItem] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = options.filter((o) => o.includes(query) && o !== value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleAdd() {
    if (!newItem.trim()) return
    if (onAdd) onAdd(newItem.trim())
    onChange(newItem.trim())
    setNewItem('')
    setShowAdd(false)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-xs font-medium text-surface-500 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all bg-white text-left flex items-center justify-between"
      >
        <span className={value ? 'text-surface-800' : 'text-surface-400'}>{value || placeholder}</span>
        <ChevronDown size={16} className={`text-surface-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div ref={listRef} className="absolute z-[9999] w-full mt-1.5 bg-white border border-surface-200 rounded-xl shadow-2xl overflow-visible">
          <div className="p-2 border-b border-surface-100">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو..."
              className="w-full px-3 py-2 text-sm outline-none bg-surface-50 rounded-lg"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {value && (
              <div className="flex items-center justify-between px-3 py-2 bg-brand-50 text-brand-700 text-sm">
                <span className="font-medium truncate">{value}</span>
                <button onClick={() => { onChange(''); setOpen(false) }} className="p-0.5 hover:bg-brand-100 rounded flex-shrink-0"><X size={14} /></button>
              </div>
            )}
            {filtered.length === 0 && !showAdd ? (
              <div className="px-3 py-2 text-sm text-surface-400">گزینه‌ای یافت نشد</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); setQuery('') }}
                  className="w-full text-right px-3 py-2 text-sm hover:bg-surface-50 transition-colors truncate"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
          {creatable && (
            <div className="border-t border-surface-100 p-2">
              {showAdd ? (
                <div className="flex items-center gap-1.5">
                  <input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="نام جدید..."
                    className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-brand-400"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <button onClick={handleAdd} className="flex-shrink-0 px-3 py-1.5 bg-brand-500 text-white text-xs rounded-lg hover:bg-brand-600">افزودن</button>
                  <button onClick={() => setShowAdd(false)} className="flex-shrink-0 p-1.5 text-surface-400 hover:bg-surface-100 rounded-lg"><X size={14} /></button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  <Plus size={14} /> مورد جدید
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
