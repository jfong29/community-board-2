import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Loader2 } from 'lucide-react';

const pinIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;border-radius:50%;background:hsl(184,100%,27%);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:3px solid white;">📍</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  locationText?: string;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 0.5 });
  }, [lat, lng, map]);
  return null;
}

// Free geocoding via Nominatim (OSM)
async function geocodeLocation(text: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${text}, Manhattan, New York`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&viewbox=-74.05,40.7,-73.9,40.8&bounded=1`);
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export default function LocationPicker({ lat, lng, onLocationChange, locationText }: LocationPickerProps) {
  const [geocoding, setGeocoding] = useState(false);
  const center: [number, number] = [lat ?? 40.728, lng ?? -73.996];

  const handleGeocode = useCallback(async () => {
    if (!locationText?.trim()) return;
    setGeocoding(true);
    const result = await geocodeLocation(locationText);
    if (result) {
      onLocationChange(result.lat, result.lng);
    }
    setGeocoding(false);
  }, [locationText, onLocationChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground font-display flex items-center gap-1">
          <MapPin size={10} /> Tap map to place pin, or auto-locate from text
        </p>
        {locationText && (
          <button
            type="button"
            onClick={handleGeocode}
            disabled={geocoding}
            className="text-[11px] text-primary font-display font-medium flex items-center gap-1 hover:underline"
          >
            {geocoding ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
            Locate
          </button>
        )}
      </div>
      <div className="w-full h-40 rounded-xl overflow-hidden border border-border/40">
        <MapContainer
          center={center}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <ClickHandler onClick={onLocationChange} />
          {lat != null && lng != null && (
            <>
              <Marker position={[lat, lng]} icon={pinIcon} />
              <FlyTo lat={lat} lng={lng} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
