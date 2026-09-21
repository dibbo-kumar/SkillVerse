import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Lock,
  Bell,
  Globe,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PhoneCall,
  Camera,
  Mail,
  MapPin,
  Compass,
  Wrench,
  Upload,
  Trash2,
  Image as ImageIcon,
  Palette,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';

export default function CustomerSettings({
  user,
  workerProfile,
  onUpdateProfile,
  onUpdateWorkerLocation,
  onLogout,
  currentTheme = 'light',
  onThemeChange
}) {
  const [activeTab, setActiveTab] = useState('personal'); // personal, location, theme, security, notifications, language, privacy, help

  const isWorker = user?.role === 'WORKER';

  // Personal Info Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [nidNumber, setNidNumber] = useState(user?.nidNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || '');
  const [address, setAddress] = useState(user?.address || '');
  const [skills, setSkills] = useState(workerProfile?.skills || 'Electrical, AC Repair');
  const [hourlyRate, setHourlyRate] = useState(workerProfile?.hourlyRate || 450);
  const [basePrice, setBasePrice] = useState(workerProfile?.basePrice || 300);
  const [profileSaved, setProfileSaved] = useState(false);

  // Location GPS Form
  const [latitude, setLatitude] = useState(user?.latitude ?? (isWorker ? 23.8720 : ''));
  const [longitude, setLongitude] = useState(user?.longitude ?? (isWorker ? 90.3810 : ''));
  const [serviceArea, setServiceArea] = useState(workerProfile?.serviceArea || user?.address || '');
  const [locationSaved, setLocationSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setNidNumber(user.nidNumber || '');
      setAvatarUrl(user.profilePicture || '');
      setAddress(user.address || '');
      setLatitude(user.latitude != null ? user.latitude : (user.role === 'WORKER' ? 23.8720 : ''));
      setLongitude(user.longitude != null ? user.longitude : (user.role === 'WORKER' ? 90.3810 : ''));
      setServiceArea(workerProfile?.serviceArea || user.address || '');
    }
  }, [user]);

  useEffect(() => {
    if (workerProfile) {
      setSkills(workerProfile.skills || '');
      setHourlyRate(workerProfile.hourlyRate || 450);
      setBasePrice(workerProfile.basePrice || 300);
      setServiceArea(workerProfile.serviceArea || '');
    }
  }, [workerProfile]);

  // Security Form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  // Notifications
  const [smsArrival, setSmsArrival] = useState(true);
  const [emailInvoice, setEmailInvoice] = useState(true);
  const [maintAlerts, setMaintAlerts] = useState(true);
  const [promoOffers, setPromoOffers] = useState(false);

  // Language
  const [selectedLang, setSelectedLang] = useState('en'); // en, bn

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How does the FixConnect Start & Completion OTP work?',
      a: 'When a technician arrives at your door, verify their photo ID and share the 4-digit Start OTP to begin the job timer. Once the work is satisfactorily completed, share the Completion OTP to authorize the final invoice.'
    },
    {
      q: 'What is covered under the 30-Day FixConnect Guarantee?',
      a: 'All verified services booked on FixConnect carry a 30-day guarantee. If the identical issue re-occurs within 30 days of service, our team will dispatch a master technician for a free re-inspection and resolution.'
    },
    {
      q: 'How does Location Search & Radius matching work?',
      a: 'Technician search uses precise Haversine GPS calculations. When you select a radius (e.g. 500m, 1km, 5km), only technicians active inside that perimeter are displayed on the interactive map.'
    },
    {
      q: 'Can workers update their live location for customer matching?',
      a: 'Yes! Workers can update their latitude, longitude, and service area under "Location & GPS Settings". Updates are synchronized live to customer search results.'
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatarUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!validateBdPhone(phone)) {
      setPhoneError("Must be a valid 11-digit Bangladeshi number (e.g. 01712345678)");
      return;
    }
    setPhoneError("");
    if (onUpdateProfile) {
      onUpdateProfile({
        name,
        email,
        phone,
        nidNumber,
        profilePicture: avatarUrl || null,
        address,
        latitude: latitude !== '' && latitude != null ? Number(latitude) : null,
        longitude: longitude !== '' && longitude != null ? Number(longitude) : null,
        skills,
        hourlyRate: Number(hourlyRate),
        basePrice: Number(basePrice)
      });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (onUpdateWorkerLocation) {
      onUpdateWorkerLocation(Number(latitude), Number(longitude), serviceArea);
    }
    if (onUpdateProfile) {
      onUpdateProfile({
        latitude: Number(latitude),
        longitude: Number(longitude),
        address: serviceArea
      });
    }
    setLocationSaved(true);
    setTimeout(() => setLocationSaved(false), 3000);
  };

  const handleGetBrowserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(Number(lat.toFixed(4)));
          setLongitude(Number(lon.toFixed(4)));
          alert(`📍 Real Device GPS Acquired! Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}`);
        },
        (error) => {
          alert(`Could not fetch device GPS: ${error.message}. Please enter coordinates manually or use neighborhood presets.`);
        }
      );
    } else {
      alert("Geolocation API is not supported by your browser.");
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      alert("New password and confirmation do not match!");
      return;
    }
    setPassSaved(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSaved(false), 3000);
  };

  return (
    <div className="customer-settings-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <Settings size={24} color="var(--primary)" />
            {isWorker ? 'Technician Profile & System Settings' : 'Account Settings & Preferences'}
          </h2>
          <p className="section-subtitle">
            Manage your personal credentials, live GPS location, notification channels, security, and support.
          </p>
        </div>
      </div>

      <div className="settings-layout-grid">
        {/* Settings Sub-navigation List */}
        <div className="glass-card settings-nav-card">
          <button
            className={`settings-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={18} /> Personal Details
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            <MapPin size={18} /> Location & GPS Map
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            <Palette size={18} /> Appearance & Theme
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} /> Password & Security
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'language' ? 'active' : ''}`}
            onClick={() => setActiveTab('language')}
          >
            <Globe size={18} /> Language & Region
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <ShieldCheck size={18} /> Privacy & Safety
          </button>
          <button
            className={`settings-nav-item ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <HelpCircle size={18} /> Help & FAQ Center
          </button>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0 0.5rem' }}></div>

          <button
            className="settings-nav-item logout-nav-item"
            onClick={onLogout}
          >
            <LogOut size={18} color="var(--accent-rose)" /> Sign Out of FixConnect
          </button>
        </div>

        {/* Settings Body Content */}
        <div className="settings-content-card glass-card">
          {/* TAB 1: Personal Info */}
          {activeTab === 'personal' && (
            <div>
              <h3 className="settings-tab-title">
                <User size={20} color="var(--primary)" /> Personal Information
              </h3>
              <p className="settings-tab-desc">Update your photo, contact info, and credentials.</p>

              {profileSaved && (
                <div className="settings-success-alert">
                  <Check size={16} /> Profile information updated & synced to database!
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="avatar-edit-section" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="avatar-edit-preview"
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                        border: '2px dashed var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '1.8rem',
                        flexShrink: 0
                      }}
                    >
                      {(name || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                      <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <Upload size={15} /> Choose Photo from PC
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', color: 'var(--accent-rose)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={() => setAvatarUrl('')}
                        >
                          <Trash2 size={14} /> Remove Photo
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Select any image (JPG, PNG, WebP) directly from your computer, or paste a URL below.
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.8rem', marginTop: '0.4rem', padding: '0.35rem 0.7rem' }}
                      placeholder="Or paste image URL (optional)"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{
                        borderColor: phoneError ? '#ef4444' : undefined,
                        boxShadow: phoneError ? '0 0 0 1px #ef4444' : undefined
                      }}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        if (val && !/^01[3-9]\d{8}$/.test(val.trim())) {
                          setPhoneError("Must be a valid 11-digit Bangladeshi number (e.g. 01712345678)");
                        } else {
                          setPhoneError("");
                        }
                      }}
                      required
                    />
                    {phoneError && (
                      <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem', borderTop: '2px solid #ef4444', paddingTop: '0.2rem', fontWeight: 'bold' }}>
                        ⚠️ {phoneError}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">National ID (NID Number)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      placeholder="e.g. 19942618954712365"
                    />
                  </div>
                  <div>
                    <label className="form-label">Default Street Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {isWorker && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div>
                      <label className="form-label">Specialty Skills (Comma Separated)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. AC Repair, Electrical, Smart Home"
                      />
                    </div>
                    <div>
                      <label className="form-label">Hourly Service Rate (BDT/hr)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Base Price / Min. Advance (BDT)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="e.g. 300"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required minimum advance payment to confirm your booking (+5% VAT).</span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary">
                  Save & Sync Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Location & GPS */}
          {activeTab === 'location' && (
            <div>
              <h3 className="settings-tab-title">
                <MapPin size={20} color="var(--primary)" /> Live GPS Location & Radius Search Sync
              </h3>
              <p className="settings-tab-desc">
                {isWorker
                  ? 'Set your exact dispatch coordinates so nearby customers can discover you on the radius map.'
                  : 'Manage your primary location coordinates for technician matching & map radius filtering.'}
              </p>

              {locationSaved && (
                <div className="settings-success-alert">
                  <Check size={16} /> GPS Location coordinates updated & synced to search engine!
                </div>
              )}

              <form onSubmit={handleSaveLocation}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Area / Location Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. Sector 12, Uttara, Dhaka"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="form-label">GPS Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-input"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">GPS Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="form-input"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <strong style={{ color: 'var(--accent-blue)' }}>📍 Preset Coordinates & Real Device GPS:</strong>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
                      onClick={handleGetBrowserLocation}
                    >
                      <Compass size={13} /> Auto-Detect Device GPS
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => { setLatitude(23.8759); setLongitude(90.3795); setServiceArea("Uttara Sector 12, Dhaka"); }}>
                      Uttara (23.8759, 90.3795)
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => { setLatitude(23.7925); setLongitude(90.4078); setServiceArea("Gulshan 2, Dhaka"); }}>
                      Gulshan (23.7925, 90.4078)
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => { setLatitude(23.7461); setLongitude(90.3742); setServiceArea("Dhanmondi Road 9A, Dhaka"); }}>
                      Dhanmondi (23.7461, 90.3742)
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => { setLatitude(23.8050); setLongitude(90.3680); setServiceArea("Mirpur 10, Dhaka"); }}>
                      Mirpur (23.8050, 90.3680)
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Update & Broadcast GPS Location
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Appearance & Theme */}
          {activeTab === 'theme' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 className="settings-tab-title" style={{ marginBottom: '0.3rem' }}>
                    <Palette size={20} color="var(--primary)" /> Appearance & System Theme
                  </h3>
                  <p className="settings-tab-desc" style={{ marginBottom: 0 }}>
                    Select your preferred visual mode for SkillVerse. Changes are saved automatically and applied system-wide.
                  </p>
                </div>
                <span className="badge badge-verified" style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
                  Active: {currentTheme === 'light' ? '☀️ Professional Light (Primary)' : '🌙 Midnight Dark'}
                </span>
              </div>

              {/* Visual Theme Selection Cards Grid */}
              <div className="theme-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                
                {/* 1. PROFESSIONAL SLATE LIGHT THEME (PRIMARY / DEFAULT) */}
                <div
                  className={`theme-selection-card ${currentTheme === 'light' ? 'active-theme' : ''}`}
                  onClick={() => onThemeChange && onThemeChange('light')}
                  style={{
                    background: '#e5e7eb',
                    color: '#0f172a',
                    border: currentTheme === 'light' ? '2px solid #1d4ed8' : '1px solid #94a3b8',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.25s ease',
                    boxShadow: currentTheme === 'light' ? '0 8px 25px rgba(29, 78, 216, 0.22)' : '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sun size={20} color="#1d4ed8" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Professional Slate Light</h4>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          Primary / Default
                        </span>
                      </div>
                    </div>
                    {currentTheme === 'light' && (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Check size={14} />
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5, marginBottom: '1.25rem', fontWeight: 500 }}>
                    Comfortable slate-gray (#d3d3d3) base with high-contrast pitch dark typography, vivid royal blue buttons, and crystal-clear borders.
                  </p>

                  {/* Mini Mockup Visual Preview */}
                  <div style={{ background: '#d3d3d3', borderRadius: '10px', padding: '0.75rem', border: '1px solid #94a3b8' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e5e7eb', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #94a3b8', marginBottom: '0.4rem' }}>
                      <div style={{ width: '45%', height: 7, background: '#0f172a', borderRadius: 3 }}></div>
                      <div style={{ width: 40, height: 14, background: '#1d4ed8', borderRadius: 4 }}></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <div style={{ background: '#e5e7eb', padding: '0.4rem', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                        <div style={{ width: '70%', height: 6, background: '#1e293b', borderRadius: 3, marginBottom: 4 }}></div>
                        <div style={{ width: '40%', height: 8, background: '#059669', borderRadius: 3 }}></div>
                      </div>
                      <div style={{ background: '#e5e7eb', padding: '0.4rem', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                        <div style={{ width: '70%', height: 6, background: '#1e293b', borderRadius: 3, marginBottom: 4 }}></div>
                        <div style={{ width: '50%', height: 8, background: '#1d4ed8', borderRadius: 3 }}></div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    style={{
                      width: '100%',
                      marginTop: '1.25rem',
                      justifyContent: 'center',
                      background: currentTheme === 'light' ? '#1d4ed8' : '#e2e8f0',
                      color: currentTheme === 'light' ? '#ffffff' : '#0f172a',
                      border: '1px solid #94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                    onClick={() => onThemeChange && onThemeChange('light')}
                  >
                    {currentTheme === 'light' ? '✓ Currently Applied' : 'Set as Theme'}
                  </button>
                </div>

                {/* 2. MIDNIGHT DARK THEME */}
                <div
                  className={`theme-selection-card ${currentTheme === 'dark' ? 'active-theme' : ''}`}
                  onClick={() => onThemeChange && onThemeChange('dark')}
                  style={{
                    background: '#0a0f1d',
                    color: '#f8fafc',
                    border: currentTheme === 'dark' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.25s ease',
                    boxShadow: currentTheme === 'dark' ? '0 8px 25px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(0,0,0,0.4)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Moon size={20} color="#10b981" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>Midnight Dark</h4>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          Night Mode
                        </span>
                      </div>
                    </div>
                    {currentTheme === 'dark' && (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b0f19' }}>
                        <Check size={14} />
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Deep obsidian palette with luminous emerald accents, subtle dark glassmorphism, and optimized battery usage on OLED screens.
                  </p>

                  {/* Mini Mockup Visual Preview */}
                  <div style={{ background: '#111827', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.4rem' }}>
                      <div style={{ width: '45%', height: 7, background: '#475569', borderRadius: 3 }}></div>
                      <div style={{ width: 40, height: 14, background: '#10b981', borderRadius: 4 }}></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ width: '70%', height: 6, background: '#64748b', borderRadius: 3, marginBottom: 4 }}></div>
                        <div style={{ width: '40%', height: 8, background: '#10b981', borderRadius: 3 }}></div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ width: '70%', height: 6, background: '#64748b', borderRadius: 3, marginBottom: 4 }}></div>
                        <div style={{ width: '50%', height: 8, background: '#3b82f6', borderRadius: 3 }}></div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    style={{
                      width: '100%',
                      marginTop: '1.25rem',
                      justifyContent: 'center',
                      background: currentTheme === 'dark' ? '#10b981' : 'rgba(255,255,255,0.08)',
                      color: currentTheme === 'dark' ? '#0b0f19' : '#e2e8f0',
                      border: '1px solid rgba(255,255,255,0.15)',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                    onClick={() => onThemeChange && onThemeChange('dark')}
                  >
                    {currentTheme === 'dark' ? '✓ Currently Applied' : 'Set as Theme'}
                  </button>
                </div>

              </div>

              {/* Theme Details Card */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} color="var(--accent-gold)" /> Theme Features & Accessibility
                </h4>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li><strong>Instant Sync:</strong> Theme changes take effect instantly across all tabs, modals, maps, and forms without page reload.</li>
                  <li><strong>Persistent Memory:</strong> Your selected theme preference is automatically remembered on this browser.</li>
                  <li><strong>Quick Switcher:</strong> You can also toggle between Light and Dark mode anytime using the Sun/Moon button in the top navigation bar.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Security */}
          {activeTab === 'security' && (
            <div>
              <h3 className="settings-tab-title">
                <Lock size={20} color="var(--primary)" /> Password & Security
              </h3>
              <p className="settings-tab-desc">Protect your account credentials and digital wallet safety.</p>

              {passSaved && (
                <div className="settings-success-alert">
                  <Check size={16} /> Password updated successfully!
                </div>
              )}

              <form onSubmit={handleSavePassword} style={{ marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </form>

              <div className="toggle-setting-row">
                <div>
                  <strong>Two-Factor Security Authentication</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Send OTP to {phone} when signing in from unrecognized browsers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h3 className="settings-tab-title">
                <Bell size={20} color="var(--primary)" /> Notification Preferences
              </h3>
              <p className="settings-tab-desc">Choose which alerts you want to receive via SMS and Email.</p>

              <div className="toggles-list">
                <div className="toggle-setting-row">
                  <div>
                    <strong>Dispatch SMS Alerts</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive SMS notifications when service status changes.</p>
                  </div>
                  <input type="checkbox" checked={smsArrival} onChange={(e) => setSmsArrival(e.target.checked)} />
                </div>

                <div className="toggle-setting-row">
                  <div>
                    <strong>Digital Invoice & PDF Receipts</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automatically email printable PDF receipts upon job completion.</p>
                  </div>
                  <input type="checkbox" checked={emailInvoice} onChange={(e) => setEmailInvoice(e.target.checked)} />
                </div>

                <div className="toggle-setting-row">
                  <div>
                    <strong>Maintenance & Booking Reminders</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Preventative alerts for seasonal AC and plumbing maintenance.</p>
                  </div>
                  <input type="checkbox" checked={maintAlerts} onChange={(e) => setMaintAlerts(e.target.checked)} />
                </div>

                <div className="toggle-setting-row">
                  <div>
                    <strong>Promotional Offers & Bonus Points</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Occasional discount vouchers and SkillPoints updates.</p>
                  </div>
                  <input type="checkbox" checked={promoOffers} onChange={(e) => setPromoOffers(e.target.checked)} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Language */}
          {activeTab === 'language' && (
            <div>
              <h3 className="settings-tab-title">
                <Globe size={20} color="var(--primary)" /> Language & Localization
              </h3>
              <p className="settings-tab-desc">Select your preferred interface language for FixConnect.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <div
                  className={`language-option-card ${selectedLang === 'en' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('en')}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>🇬🇧 English (Default)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standard commercial English interface</div>
                </div>

                <div
                  className={`language-option-card ${selectedLang === 'bn' ? 'active' : ''}`}
                  onClick={() => setSelectedLang('bn')}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>🇧🇩 বাংলা (Bengali)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>বাংলাদেশের সেরা টেকনিশিয়ান সেবার জন্য</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Privacy */}
          {activeTab === 'privacy' && (
            <div>
              <h3 className="settings-tab-title">
                <ShieldCheck size={20} color="var(--primary)" /> Privacy & Data Controls
              </h3>
              <p className="settings-tab-desc">Manage location visibility and data permissions.</p>

              <div className="toggles-list">
                <div className="toggle-setting-row">
                  <div>
                    <strong>Live Dispatch Location Sharing</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Share GPS pin with assigned customer/technician during active jobs only.</p>
                  </div>
                  <span className="badge badge-verified">Enabled</span>
                </div>

                <div className="toggle-setting-row">
                  <div>
                    <strong>Public Profile Directory Visibility</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Show profile in search results for service matching.</p>
                  </div>
                  <input type="checkbox" defaultChecked={true} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Help & FAQ */}
          {activeTab === 'help' && (
            <div>
              <h3 className="settings-tab-title">
                <HelpCircle size={20} color="var(--primary)" /> Help & Support Center
              </h3>
              <p className="settings-tab-desc">Find answers to common questions or reach our 24/7 emergency dispatch helpline in Dhaka.</p>

              {/* Emergency Hotline Banner */}
              <div className="help-hotline-banner">
                <div>
                  <strong style={{ color: 'var(--primary)' }}>24/7 FixConnect Customer Care Hotline</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Call for immediate dispatch assistance or escrow inquiries:</div>
                </div>
                <a href="tel:09612000000" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                  <PhoneCall size={15} /> 09612-FIXCONNECT
                </a>
              </div>

              {/* FAQ Accordion */}
              <div className="faq-accordion-list">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <button
                      className="faq-question-btn"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    >
                      <span>{faq.q}</span>
                      {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openFaq === idx && (
                      <div className="faq-answer-content">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
