'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PARK_BOUNDS = { south: 34.195, west: 62.175, north: 34.229, east: 62.239 }
const PARK_CENTER: [number, number] = [34.212, 62.207]

interface BoundaryEditorProps {
  value: number[][]
  onChange: (coords: number[][]) => void
}

function sameCoords(a: number[][], b: number[][]) {
  if (a.length !== b.length) return false
  return a.every((p, i) => p[0] === b[i]?.[0] && p[1] === b[i]?.[1])
}

export default function BoundaryEditor({ value, onChange }: BoundaryEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const polygonRef = useRef<L.Polygon | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const onChangeRef = useRef(onChange)
  const [coords, setCoords] = useState<number[][]>(() => value || [])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Sync from parent when editing a different phase (not during local edits)
  useEffect(() => {
    const next = value || []
    setCoords((prev) => (sameCoords(prev, next) ? prev : next))
  }, [value])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: PARK_CENTER,
      zoom: 15,
      minZoom: 14,
      maxZoom: 18,
      maxBounds: [
        [PARK_BOUNDS.south - 0.01, PARK_BOUNDS.west - 0.01],
        [PARK_BOUNDS.north + 0.01, PARK_BOUNDS.east + 0.01],
      ],
      maxBoundsViscosity: 1.0,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      if (
        lat < PARK_BOUNDS.south ||
        lat > PARK_BOUNDS.north ||
        lng < PARK_BOUNDS.west ||
        lng > PARK_BOUNDS.east
      ) {
        return
      }

      setCoords((prev) => {
        const next = [...prev, [lat, lng]]
        // Defer parent update — never call setState of parent inside updater/render
        queueMicrotask(() => onChangeRef.current(next))
        return next
      })
    })

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    const map = mapInstance.current

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (polygonRef.current) {
      polygonRef.current.remove()
      polygonRef.current = null
    }

    if (coords.length === 0) return

    coords.forEach((c, i) => {
      const latlng = [c[0], c[1]] as [number, number]
      const marker = L.circleMarker(latlng, {
        radius: 6,
        color: '#1A6B6B',
        fillColor: '#fff',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map)
      marker.bindTooltip(`نقطه ${i + 1}`, { permanent: false })
      markersRef.current.push(marker as unknown as L.Marker)
    })

    if (coords.length >= 3) {
      const latlngs = coords.map((c) => [c[0], c[1]] as [number, number])
      polygonRef.current = L.polygon(latlngs, {
        color: '#1A6B6B',
        fillColor: '#1A6B6B',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map)
    }
  }, [coords])

  function handleUndo() {
    setCoords((prev) => {
      const next = prev.slice(0, -1)
      queueMicrotask(() => onChangeRef.current(next))
      return next
    })
  }

  function handleClear() {
    setCoords([])
    queueMicrotask(() => onChangeRef.current([]))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-surface-400">
          {coords.length === 0
            ? 'نقشه را کلیک کنید تا نقاط مرز اضافه شوند'
            : `${coords.length} نقطه ثبت شده`}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={coords.length === 0}
            className="px-2 py-1 text-xs text-surface-500 hover:bg-surface-100 rounded-lg transition-colors disabled:opacity-40"
          >
            بازگشت
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={coords.length === 0}
            className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
          >
            پاک کردن
          </button>
        </div>
      </div>
      <div
        ref={mapRef}
        className="h-[300px] rounded-xl border border-surface-200 overflow-hidden"
      />
    </div>
  )
}
