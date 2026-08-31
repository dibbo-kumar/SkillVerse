import React, { useState } from 'react';
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
  Wrench
} from 'lucide-react';

export default function CustomerSettings({
  user,
  workerProfile,
  onUpdateProfile,
  onUpdateWorkerLocation,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('personal'); // personal, location, security, notifications, language, privacy, help

  const isWorker = user?.role === 'WORKER';

  // Personal Info Form
  const [name, setName] = useState(user?.name || 'Anisur Rahman');
  const [email, setEmail] = useState(user?.email || 'anis@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '01811223344');
  const [nidNumber, setNidNumber] = useState(user?.nidNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
  const [address, setAddress] = useState(user?.address || 'House 14, Road 4, Sector 12, Uttara, Dhaka');
  const [skills, setSkills] = useState(workerProfile?.skills || 'Electrical, AC Repair');
  const [hourlyRate, setHourlyRate] = useState(workerProfile?.hourlyRate || 450);
  const [profileSaved, setProfileSaved] = useState(false);

  // Location GPS Form
  const [latitude, setLatitude] = useState(user?.latitude || (isWorker ? 23.8720 : 23.8759));
  const [longitude, setLongitude] = useState(user?.longitude || (isWorker ? 90.3810 : 90.3795));
  const [serviceArea, setServiceArea] = useState(workerProfile?.serviceArea || user?.address || 'Sector 12, Uttara, Dhaka');
  const [locationSaved, setLocationSaved] = useState(false);

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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name,
        email,
        phone,
        nidNumber,
        profilePicture: avatarUrl,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        skills,
        hourlyRate: Number(hourlyRate)
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
                <div className="avatar-edit-section">
                  <img src={avatarUrl} alt="Avatar" className="avatar-edit-preview" />
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Profile Picture URL</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
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

          {/* TAB 3: Security */}
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
