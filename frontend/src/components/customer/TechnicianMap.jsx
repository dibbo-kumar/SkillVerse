import React, { useEffect, useRef, useState } from 'react';
import { Compass, Navigation, Layers, MapPin, Star, PhoneCall } from 'lucide-react';

// Haversine formula to compute exact distance in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0.5;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistanceString(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)} km away`;
}

const TechnicianMap = ({
  customerLocation = { lat: 23.8759, lon: 90.3795, address: 'Uttara Sector 12, Dhaka' },
  workers = [],
  selectedRadiusKm = 5,
  onSelectWorker
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' or 'street'
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveLocation, setLiveLocation] = useState(customerLocation);
  const [activeWorkerPopup, setActiveWorkerPopup] = useState(null);

  // Sync live location when prop changes
  useEffect(() => {
    setLiveLocation(customerLocation);
  }, [customerLocation.lat, customerLocation.lon]);

  // Live GPS Tracking with WatchPosition
  useEffect(() => {
    let watchId;
    if (isLiveTracking && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLiveLocation(prev => ({
            ...prev,
            lat,
            lon,
            address: 'Real Device Live GPS Location'
          }));
        },
        (err) => {
          console.warn("GPS Live Tracking Error:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isLiveTracking]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof window === 'undefined' || !window.L) return;

    const L = window.L;

    // Create Map Instance if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [liveLocation.lat, liveLocation.lon],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);

      // Add Tile Layer
      const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      const streetUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
      const initialUrl = mapStyle === 'dark' ? darkUrl : streetUrl;
      tileLayerRef.current = L.tileLayer(initialUrl, {
        maxZoom: 19
      }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when Map Style Toggles
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const streetUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    
    tileLayerRef.current = L.tileLayer(mapStyle === 'dark' ? darkUrl : streetUrl, {
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
  }, [mapStyle]);

  // Update Markers & Radius Circle on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    layerGroup.clearLayers();

    const clientLat = liveLocation.lat || 23.8759;
    const clientLon = liveLocation.lon || 90.3795;

    // 1. Customer Marker Pin
    const customerIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="
          background: #10b981; 
          color: #09111e; 
          font-weight: bold; 
          font-size: 11px; 
          padding: 4px 8px; 
          border-radius: 20px; 
          border: 2px solid #ffffff; 
          box-shadow: 0 0 15px rgba(16,185,129,0.8);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="width:7px; height:7px; background:#ffffff; border-radius:50%; display:inline-block; animation: pulse 1.5s infinite;"></span>
          📍 You (Client)
        </div>
      `,
      iconSize: [110, 30],
      iconAnchor: [55, 15]
    });

    const clientMarker = L.marker([clientLat, clientLon], { icon: customerIcon }).addTo(layerGroup);
    clientMarker.bindPopup(`<strong>Your Location</strong><br/>${liveLocation.address || 'Uttara, Dhaka'}`);

    // 2. Dynamic Search Radius Circle
    if (selectedRadiusKm < 900) {
      const radiusMeters = selectedRadiusKm * 1000;
      const circle = L.circle([clientLat, clientLon], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 6',
        radius: radiusMeters
      }).addTo(layerGroup);

      // Smooth auto-fit bounds
      map.fitBounds(circle.getBounds(), { padding: [40, 40], maxZoom: 16 });
    } else {
      map.setView([clientLat, clientLon], 12);
    }

    // 3. Render Worker Pins
    workers.forEach(w => {
      const wLat = w.latitude || w.user?.latitude || 23.8720;
      const wLon = w.longitude || w.user?.longitude || 90.3810;
      const dist = calculateDistanceKm(clientLat, clientLon, wLat, wLon);
      const isInside = selectedRadiusKm >= 900 || dist <= selectedRadiusKm;

      const workerIcon = L.divIcon({
        className: 'custom-leaflet-worker-pin',
        html: `
          <div style="
            background: ${isInside ? '#1e293b' : '#0f172a'}; 
            border: 2px solid ${isInside ? '#3b82f6' : '#64748b'}; 
            color: #ffffff; 
            padding: 3px 6px; 
            border-radius: 6px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            white-space: nowrap;
          ">
            <img src="${w.user?.profilePicture || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100'}" style="width:20px; height:20px; border-radius:50%; object-fit:cover; border:1px solid #3b82f6;" />
            <div>
              <div style="font-weight:bold; font-size:10px;">${w.user?.name || 'Technician'}</div>
              <div style="color: ${isInside ? '#3b82f6' : '#94a3b8'}; font-weight:bold; font-size:9px;">${formatDistanceString(dist)}</div>
            </div>
          </div>
        `,
        iconSize: [120, 32],
        iconAnchor: [60, 16]
      });

      const workerMarker = L.marker([wLat, wLon], { icon: workerIcon }).addTo(layerGroup);
      workerMarker.on('click', () => {
        setActiveWorkerPopup(w);
      });
    });

  }, [liveLocation, workers, selectedRadiusKm]);

  return (
    <div className="glass-card" style={{ padding: '1.2rem', maxWidth: '900px', margin: '0 auto 2rem auto', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
            <Compass size={20} /> Live Google-Maps Style Interactive Radar
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Location: <strong>{liveLocation.address || 'Uttara, Dhaka'}</strong> • Radius: <strong style={{ color: 'var(--primary)' }}>{selectedRadiusKm >= 900 ? 'All Dhaka Areas' : selectedRadiusKm < 1 ? `${selectedRadiusKm * 1000}m` : `${selectedRadiusKm}km`}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          {/* Tile Theme Toggle */}
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setMapStyle(mapStyle === 'dark' ? 'street' : 'dark')}
          >
            <Layers size={14} />
            <span>Map Theme: {mapStyle === 'dark' ? '🌙 Dark Mode' : '🗺️ OpenStreet'}</span>
          </button>

          {/* Live Device GPS Tracking Toggle */}
          <button 
            type="button" 
            className={`btn ${isLiveTracking ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            onClick={() => setIsLiveTracking(!isLiveTracking)}
          >
            <Navigation size={14} style={{ animation: isLiveTracking ? 'spin 3s linear infinite' : 'none' }} />
            <span>{isLiveTracking ? '📡 Live GPS Active' : '📍 Enable Live Tracking'}</span>
          </button>
        </div>
      </div>

      {/* Real OpenStreetMap / Leaflet Canvas Container */}
      <div 
        ref={mapContainerRef}
        style={{ 
          width: '100%', 
          height: '420px', 
          borderRadius: '10px', 
          overflow: 'hidden', 
          border: '1px solid var(--border-color)',
          zIndex: 1
        }}
      />

      {/* Popup Card when Technician Pin is clicked */}
      {activeWorkerPopup && (() => {
        const w = activeWorkerPopup;
        const wLat = w.latitude || w.user?.latitude || 23.8720;
        const wLon = w.longitude || w.user?.longitude || 90.3810;
        const dist = calculateDistanceKm(liveLocation.lat, liveLocation.lon, wLat, wLon);
        const isInside = selectedRadiusKm >= 900 || dist <= selectedRadiusKm;

        return (
          <div 
            className="glass-card" 
            style={{
              position: 'absolute',
              bottom: '25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '400px',
              background: 'rgba(15, 23, 42, 0.96)',
              border: `1.5px solid ${isInside ? 'var(--primary)' : 'var(--border-color)'}`,
              backdropFilter: 'blur(12px)',
              padding: '0.9rem',
              zIndex: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              borderRadius: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
                <img 
                  src={w.user?.profilePicture || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150'} 
                  alt={w.user?.name} 
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.1rem' }}>{w.user?.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <span>{w.user?.rating || 4.8} ({w.careerLevel || 'Gold'} Rank)</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveWorkerPopup(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.7rem' }}>
              <div><strong>Specialty:</strong> {w.skills}</div>
              <div><strong>Distance:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{formatDistanceString(dist)}</span></div>
              <div><strong>Hourly Rate:</strong> BDT {w.hourlyRate}/hr</div>
              <div><strong>Area:</strong> {w.serviceArea}</div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
              onClick={() => {
                if (onSelectWorker) onSelectWorker(w);
                setActiveWorkerPopup(null);
              }}
            >
              Select & Book Technician
            </button>
          </div>
        );
      })()}
    </div>
  );
};

export default TechnicianMap;
