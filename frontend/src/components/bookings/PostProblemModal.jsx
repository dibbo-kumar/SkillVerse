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
        padding: '1rem'
      }}
      onClick={(e) => e.target.className.includes('toast-popup-overlay') && onClose()}
    >
      <div 
        className="glass-card modal-content-wide"
        style={{
          maxWidth: '860px',
          width: '92vw',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.4rem 1.6rem',
          color: 'var(--text-primary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.7rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.45rem', borderRadius: '10px', color: 'var(--accent-blue)', display: 'flex' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>Post Service Problem</h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>Technicians in your area will review details and send quotes</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '0.35rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <XCircle size={20} />
          </button>
        </div>

        {/* Form Body - 2 Column Layout */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div className="modal-two-col">
            {/* Left Column: Category, Title, Appliance info, Schedule, Budget */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {/* Category */}
              <div>
                <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Service Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Problem Title</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  placeholder="e.g. AC compressor humming but not cooling"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Appliance info & Budget */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Appliance Info</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                    placeholder="e.g. Gree 1.5T Inverter"
                    value={applianceInfo}
                    onChange={(e) => setApplianceInfo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Budget (BDT ৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}
                    placeholder="1000"
                    value={budgetPrice}
                    onChange={(e) => setBudgetPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Schedule: Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Preferred Date</label>
                  <select
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  >
                    <option value="Today" style={{ background: '#111827' }}>Today (Urgent)</option>
                    <option value="Tomorrow" style={{ background: '#111827' }}>Tomorrow</option>
                    <option value="In 2 Days" style={{ background: '#111827' }}>In 2 Days</option>
                    <option value="Weekend" style={{ background: '#111827' }}>This Weekend</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Preferred Time Slot</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  >
                    <option value="09:00 AM - 12:00 PM" style={{ background: '#111827' }}>Morning (9-12)</option>
                    <option value="12:00 PM - 03:00 PM" style={{ background: '#111827' }}>Noon (12-3)</option>
                    <option value="03:00 PM - 06:00 PM" style={{ background: '#111827' }}>Afternoon (3-6)</option>
                    <option value="06:00 PM - 09:00 PM" style={{ background: '#111827' }}>Evening (6-9)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Description, Address, Photo Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {/* Description */}
              <div>
                <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Problem Description</label>
                <textarea
                  rows={2}
                  className="form-input"
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', resize: 'none' }}
                  placeholder="Describe specific symptoms, noise, or service requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Service Address</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* Diagnostic Photo Attachment */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <label className="form-label" style={{ fontSize: '0.74rem', margin: 0 }}>Diagnostic Photo (Optional)</label>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Helps get accurate quotes</span>
                </div>

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
                      border: '1px dashed rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.8rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem'
                    }}
                  >
                    <Upload size={16} color="var(--accent-blue)" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to upload diagnostic image (under 5MB)</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.4rem 0.7rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img src={photoPreview} alt="Problem preview" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: '6px' }} />
                      <div>
                        <strong style={{ fontSize: '0.76rem', color: 'var(--text-heading)', display: 'block' }}>{fileName || 'problem-photo.jpg'}</strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={11} /> Attached
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem' }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', paddingTop: '0.7rem', borderTop: '1px solid var(--border-color)', marginTop: '0.3rem' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ padding: '0.45rem 1.3rem', fontSize: '0.82rem', fontWeight: 600 }}
            >
              {isSubmitting ? 'Posting...' : '📢 Post Problem Now'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
