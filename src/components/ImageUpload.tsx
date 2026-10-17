'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  /** Storage folder inside the `media` bucket */
  folder?: string
  alt?: string
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  alt = 'تصویر',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('فایل تصویری نیست')
      return
    }
    setUploading(true)
    setError('')
    const ext = file.name.split('.').pop() || 'jpg'
    const safeFolder = folder.replace(/^\/+|\/+$/g, '') || 'uploads'
    const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setError(`خطا: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
    if (urlData?.publicUrl) {
      onChange(urlData.publicUrl)
    } else {
      setError('خطا در دریافت لینک تصویر')
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={alt}
            className="w-full h-48 object-cover rounded-xl border border-surface-200"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute top-2 right-2 p-1.5 bg-white/90 text-surface-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
          >
            <Upload size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-400 bg-brand-50'
              : 'border-surface-200 hover:border-brand-300 hover:bg-surface-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="ui-spinner" />
              <span className="text-xs text-surface-400">در حال آپلود...</span>
            </div>
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-surface-300 mb-2" />
              <p className="text-sm text-surface-500 font-medium">تصویر را اینجا رها کنید</p>
              <p className="text-xs text-surface-400 mt-1">یا کلیک کنید برای انتخاب فایل</p>
            </>
          )}
        </div>
      )}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
