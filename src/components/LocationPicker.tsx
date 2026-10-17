'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Rectangle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Herat Industrial Park bounds (wide area)
const PARK_BOUNDS: L.LatLngBoundsLiteral = [
  [34.195, 62.175], // south-west
  [34.229, 62.239], // north-east
]
const PARK_CENTER: [number, number] = [34.212, 62.207]

const selectedIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationPickerProps {
  lat: string
  lon: string
  onLocationChange: (lat: string, lon: string) => void
}

function MapEvents({ onLocationChange }: { onLocationChange: (lat: string, lon: string) => void }) {
  useMapEvents({
    dblclick(e) {
      // Clamp to park bounds
      const clampedLat = Math.max(PARK_BOUNDS[0][0], Math.min(PARK_BOUNDS[1][0], e.latlng.lat))
      const clampedLng = Math.max(PARK_BOUNDS[0][1], Math.min(PARK_BOUNDS[1][1], e.latlng.lng))
      onLocationChange(clampedLat.toFixed(6), clampedLng.toFixed(6))
    },
  })
  return null
}

function MapBounds({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
    const bounds = L.latLngBounds(PARK_BOUNDS)
    map.setMaxBounds(bounds.pad(0.2))
    map.fitBounds(bounds)
    map.on('drag', () => map.panInsideBounds(bounds, { animate: false }))
  }, [map, mapRef])
  return null
}

export default function LocationPicker({ lat, lon, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const position: [number, number] | null =
    lat && lon ? [parseFloat(lat), parseFloat(lon)] : null

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-surface-200" style={{ height: 300 }}>
        <MapContainer
          center={position || PARK_CENTER}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          doubleClickZoom={false}
          attributionControl={false}
          maxBounds={L.latLngBounds(PARK_BOUNDS).pad(0.2)}
          minZoom={14}
          maxZoom={18}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapBounds mapRef={mapRef} />
          <MapEvents onLocationChange={onLocationChange} />
          <Rectangle
            bounds={PARK_BOUNDS}
            pathOptions={{ color: '#6366f1', weight: 2, dashArray: '6 4', fillOpacity: 0.05 }}
          />
          {position && <Marker position={position} icon={selectedIcon} />}
        </MapContainer>
      </div>
      <div className="flex items-center gap-2 text-xs text-surface-400">
        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
        فقط محدوده شهرک صنعتی — دوبار کلیک کنید
      </div>
    </div>
  )
}
