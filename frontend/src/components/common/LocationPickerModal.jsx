import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, XCircle, CheckCircle2, Compass, Layers } from 'lucide-react';

export default function LocationPickerModal({
  isOpen,
  onClose,
  initialLat = 23.8103,
  initialLon = 90.4125,
  initialAddress = '',
  onConfirm,
  title = "Select Service Location",
  description = "Click anywhere on the map or drag the marker to set the exact service location pin."
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedLat, setSelectedLat] = useState(initialLat || 23.8103);
  const [selectedLon, setSelectedLon] = useState(initialLon || 90.4125);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || 'Dhaka, Bangladesh');
  const [isLocating, setIsLocating] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);

  // Sync state on open / initial prop changes
  useEffect(() => {
    if (isOpen) {
      const lat = initialLat || 23.8103;
      const lon = initialLon || 90.4125;
      setSelectedLat(lat);
      setSelectedLon(lon);
      setSelectedAddress(initialAddress || 'Selected Point, Dhaka');
    }
  }, [isOpen, initialLat, initialLon, initialAddress]);

  // Reverse geocode lat/lon to friendly address name using Nominatim
  const reverseGeocode = async (lat, lon) => {
    setGeocodeLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const parts = [
          addr.suburb || addr.neighbourhood || addr.residential || addr.road,
          addr.city_district || addr.city || addr.town || addr.county,
          addr.state || 'Dhaka'
        ].filter(Boolean);
        const resolvedName = parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',').slice(0, 3).join(',') || `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
        setSelectedAddress(resolvedName);
      }
    } catch (e) {
      console.warn("Reverse geocode fallback:", e);
      // Fallback if offline or blocked
      setSelectedAddress(`Area at (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
    } finally {
      setGeocodeLoading(false);
    }
  };

  // Initialize or update Leaflet map when modal is open
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (typeof window === 'undefined' || !window.L) return;

      const L = window.L;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedLat, selectedLon],
          zoom: 14,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Custom pulsing location pin icon
        const pinIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: pulse 2s infinite;"></div>
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); color: white;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([selectedLat, selectedLon], {
          draggable: true,
          icon: pinIcon
        }).addTo(map);

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          setSelectedLat(pos.lat);
          setSelectedLon(pos.lng);
          reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setSelectedLat(lat);
          setSelectedLon(lng);
          reverseGeocode(lat, lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.setView([selectedLat, selectedLon], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([selectedLat, selectedLon]);
        }
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Use Browser Geolocation to pinpoint current device location
  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setSelectedLat(lat);
        setSelectedLon(lon);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 15);
          markerRef.current.setLatLng([lat, lon]);
        }
        reverseGeocode(lat, lon);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        alert("Could not access your device GPS location. Please ensure location permission is allowed or pick on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        lat: selectedLat,
        lon: selectedLon,
        address: selectedAddress
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="toast-popup-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 11000,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => e.target.className.includes('toast-popup-overlay') && onClose()}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '94vh',
          background: 'var(--bg-secondary)',
          padding: '1.6rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>{title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{description}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <XCircle size={24} />
          </button>
        </div>

        {/* GPS Quick Action Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Quickly center map at your current physical spot:
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            style={{
              fontSize: '0.8rem',
              padding: '0.45rem 0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(16, 185, 129, 0.12)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              color: '#34d399'
            }}
          >
            <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
            {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
          </button>
        </div>

        {/* Leaflet Map Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '320px',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
          }}
        >
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Map instructions overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(5, 10, 20, 0.85)',
              backdropFilter: 'blur(6px)',
              padding: '0.35rem 0.7rem',
              borderRadius: '8px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            💡 Click anywhere or drag the green pin to select location
          </div>
        </div>

        {/* Location Readout (No manual coordinate typing) */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05rem', fontWeight: 600 }}>
              Detected Service Area
            </span>
            <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>
              <span>Lat: <strong style={{ color: '#38bdf8' }}>{selectedLat.toFixed(5)}</strong></span>
              <span>Lon: <strong style={{ color: '#38bdf8' }}>{selectedLon.toFixed(5)}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              placeholder="e.g. Sector 11, Uttara, Dhaka"
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            style={{
              background: 'linear-gradient(90deg, #10b981, #059669)',
              padding: '0.65rem 1.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle2 size={16} /> Confirm Service Location
          </button>
        </div>
      </div>
    </div>
  );
}
