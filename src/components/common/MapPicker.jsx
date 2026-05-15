import { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Crosshair } from 'lucide-react'
import Button from './Button'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and resizing
const MapController = ({ onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  // Fix for blank map: invalidateSize on mount
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 300)
  }, [map])

  return null
}

const MapPicker = ({ defaultLat, defaultLng, onSelect, initialAddress }) => {
  // Default to Semarang if no coordinates are provided
  const center = [defaultLat || -6.966667, defaultLng || 110.416667]
  const [position, setPosition] = useState(defaultLat && defaultLng ? center : null)
  const [isLocating, setIsLocating] = useState(false)
  const [selectedData, setSelectedData] = useState({
    lat: defaultLat || center[0],
    lng: defaultLng || center[1],
    address: initialAddress || ''
  })
  const mapRef = useRef(null)

  const handleLocationSelect = async (lat, lng) => {
    setPosition([lat, lng])
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
      const data = await res.json()
      
      const address = data.address || {}
      const cityOrRegency = address.city || address.town || address.city_district || address.county || ''
      
      setSelectedData({ 
        lat, 
        lng, 
        address: data.display_name,
        city: cityOrRegency 
      })
    } catch (error) {
      console.error('Failed to reverse geocode', error)
      setSelectedData({ lat, lng, address: 'Lokasi tidak diketahui', city: '' })
    }
  }

  const handleConfirm = () => {
    if (onSelect) {
      onSelect(selectedData)
    }
  }

  const getCurrentLocation = () => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setPosition([latitude, longitude])
          handleLocationSelect(latitude, longitude)
          setIsLocating(false)
        },
        (error) => {
          console.error(error)
          alert('Gagal mengambil lokasi. Pastikan izin lokasi aktif.')
          setIsLocating(false)
        },
        { enableHighAccuracy: true }
      )
    } else {
      alert('Browser Anda tidak mendukung fitur lokasi.')
      setIsLocating(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Tentukan Titik Pengiriman</label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={getCurrentLocation} 
          loading={isLocating}
          className="text-xs"
        >
          <Crosshair size={14} className="mr-1" /> Gunakan Lokasi Saat Ini
        </Button>
      </div>
      
      <div className="flex-grow min-h-[300px] rounded-xl overflow-hidden border border-gray-300 relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} />}
        </MapContainer>

        {/* Floating Confirm Button inside Map */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Button 
            onClick={handleConfirm}
            disabled={!selectedData.address}
            className="shadow-xl border-2 border-white"
            size="sm"
          >
            Konfirmasi Lokasi Ini
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Alamat Terpilih:</p>
        <p className="text-xs text-gray-700 line-clamp-2">
          {selectedData.address || 'Klik pada peta untuk memilih lokasi...'}
        </p>
      </div>
    </div>
  )
}

export default MapPicker
