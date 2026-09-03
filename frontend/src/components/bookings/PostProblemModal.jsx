import React, { useState, useRef } from 'react';
import { AlertCircle, CheckCircle2, Upload, Wrench, XCircle, Sparkles, DollarSign, Calendar, Clock, MapPin, Camera, X, ImageIcon } from 'lucide-react';

const API_BASE = "http://localhost:8081/api";

export default function PostProblemModal({ isOpen, onClose, currentUser, onProblemPosted, onShowToast }) {
  const [category, setCategory] = useState('AC Repair & Servicing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [applianceInfo, setApplianceInfo] = useState('');
  const [budgetPrice, setBudgetPrice] = useState('1000');
  const [preferredDate, setPreferredDate] = useState('Tomorrow');
  const [preferredTime, setPreferredTime] = useState('10:00 AM - 12:00 PM');
  const [address, setAddress] = useState(currentUser?.address || 'House 14, Road 4, Sector 12, Uttara, Dhaka');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleDevicePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onShowToast) onShowToast("Invalid File", "Please select an image file (PNG, JPG, JPEG, WEBP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (onShowToast) onShowToast("File Too Large", "Please choose an image under 5MB", "error");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setPhotoPreview(base64);
      setPhotoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoUrl('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  const CATEGORIES = [
    'AC Repair & Servicing',
    'Refrigerator Repair',
    'Electrical Wiring & MCB',
    'Plumbing & Water Pump',
    'Fan Repair & Regulator',
    'Smart Home & CCTV',
    'Painting & Dampproofing',
    'General Maintenance'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      if (onShowToast) onShowToast("Validation Error", "Please enter problem title and detailed description", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser?.id || 2,
          serviceCategory: category,
          title: title,
          description: description,
          applianceInfo: applianceInfo,
          photoUrl: photoUrl || "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600",
          preferredDate: preferredDate,
          preferredTime: preferredTime,
          address: address,
          budgetPrice: parseFloat(budgetPrice) || 1000
        })
      });

      if (res.ok) {
        const postedData = await res.json();
        if (onShowToast) onShowToast("Problem Posted!", "Technicians will view your post and submit price offers.", "success");
        if (onProblemPosted) onProblemPosted(postedData);
        onClose();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error || "Failed to post problem", "error");
      }
    } catch (err) {
      console.error("Error posting problem:", err);
      if (onShowToast) onShowToast("Network Error", "Unable to connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="toast-popup-overlay"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={(e) => e.target.className.includes('toast-popup-overlay') && onClose()}
    >
      <div 
        className="glass-card"
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          padding: '2rem',
          color: 'var(--text-primary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.6rem', borderRadius: '12px', color: 'var(--accent-blue)', display: 'flex' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>Post Your Problem</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Technicians will view your post and send custom price offers</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <XCircle size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Category */}
          <div>
            <label className="form-label">Service Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '0.7rem' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ background: '#111827', color: '#fff' }}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="form-label">Problem Title</label>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '0.7rem' }}
              placeholder="e.g. AC running but not cooling effectively"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Detailed Description</label>
            <textarea
              rows={3}
              className="form-input"
              style={{ width: '100%', padding: '0.7rem', resize: 'vertical' }}
              placeholder="Describe the issue, noise, duration, or specific service requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Appliance & Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Appliance / Device Info</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '0.7rem' }}
                placeholder="e.g. General 1.5 Ton Inverter AC"
                value={applianceInfo}
                onChange={(e) => setApplianceInfo(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Expected Budget (BDT ৳)</label>
              <input
                type="number"
                className="form-input"
                style={{ width: '100%', padding: '0.7rem' }}
                placeholder="1000"
                value={budgetPrice}
                onChange={(e) => setBudgetPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Preferred Date</label>
              <select
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '0.7rem' }}
              >
                <option value="Today" style={{ background: '#111827' }}>Today (Urgent)</option>
                <option value="Tomorrow" style={{ background: '#111827' }}>Tomorrow</option>
                <option value="In 2 Days" style={{ background: '#111827' }}>In 2 Days</option>
                <option value="Weekend" style={{ background: '#111827' }}>This Weekend</option>
              </select>
            </div>
            <div>
              <label className="form-label">Preferred Time Slot</label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '0.7rem' }}
              >
                <option value="09:00 AM - 12:00 PM" style={{ background: '#111827' }}>Morning (9 AM - 12 PM)</option>
                <option value="12:00 PM - 03:00 PM" style={{ background: '#111827' }}>Noon (12 PM - 3 PM)</option>
                <option value="03:00 PM - 06:00 PM" style={{ background: '#111827' }}>Afternoon (3 PM - 6 PM)</option>
                <option value="06:00 PM - 09:00 PM" style={{ background: '#111827' }}>Evening (6 PM - 9 PM)</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="form-label">Service Address</label>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '0.7rem' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Diagnostic Photo Attachment from Device */}
          <div>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Diagnostic Problem Photo</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Helps technicians give accurate quotes</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleDevicePhotoChange}
              style={{ display: 'none' }}
            />

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                  <Upload size={22} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>Upload problem photo from your device</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG, JPEG, WEBP up to 5MB</span>
                </div>
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.9rem', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={14} /> Choose File
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '0.8rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img src={photoPreview} alt="Problem preview" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block' }}>{fileName || 'problem-photo.jpg'}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle2 size={13} /> Attached from device
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}
                    title="Remove attached photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ background: 'linear-gradient(90deg, #2563eb, #4f46e5)', padding: '0.7rem 1.4rem' }}
            >
              {isSubmitting ? 'Posting Problem...' : '📢 Post Problem Now'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
