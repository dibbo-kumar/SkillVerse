import React, { useState } from 'react';
import {
  XCircle, CheckCircle2, Clock, MapPin, DollarSign, User, Phone, KeyRound,
  Wrench, ShieldCheck, FileText, Star, ArrowRight, Play, Camera, Image,
  Upload, Navigation, AlertCircle, Sparkles, Check, CheckCheck
} from 'lucide-react';

export default function WorkerBookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onAcceptBooking,
  onOpenCounterModal,
  onSetOnTheWay,
  onSetArrived,
  onOpenStartOtpModal,
  onRequestCompletion,
  onOpenCompletionOtpModal,
  onUploadPhotos,
  hasActiveJob
}) {
  const [photoType, setPhotoType] = useState('before'); // 'before' or 'after'
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [workerPhotoUrl, setWorkerPhotoUrl] = useState('');

  if (!isOpen || !booking) return null;

  const currentPrice = (booking.status === 'NEGOTIATING' || booking.status === 'COUNTERED' || booking.status === 'PENDING')
    ? (booking.lastOfferedBy === 'WORKER' 
        ? (booking.workerCounterPrice || booking.estimatedCost || booking.agreedCost) 
        : (booking.customerOfferPrice || booking.estimatedCost || booking.agreedCost))
    : (booking.agreedCost || booking.estimatedCost || booking.workerCounterPrice || booking.customerOfferPrice);
  const isAwaitingAdvance = booking.status === 'AWAITING_ADVANCE' || (booking.status === 'ACCEPTED' && !booking.advancePaid);
  const isDirectPending = !isAwaitingAdvance && (booking.status === 'PENDING' || (booking.status === 'NEGOTIATING' && (booking.lastOfferedBy === 'CUSTOMER' || !booking.lastOfferedBy)));
  const isWorkerCounterWaiting = !isAwaitingAdvance && (booking.status === 'NEGOTIATING' || booking.status === 'COUNTERED') && (booking.lastOfferedBy === 'WORKER' || (!booking.lastOfferedBy && booking.workerCounterPrice));
  
  const commissionRate = booking.platformCommission && currentPrice > 0 
    ? Math.round((booking.platformCommission / currentPrice) * 100) 
    : 5;
  const commission = booking.platformCommission != null 
    ? booking.platformCommission 
    : Math.round(currentPrice * (commissionRate / 100.0) * 100.0) / 100.0;
  const netEarning = booking.workerNetEarning != null 
    ? booking.workerNetEarning 
    : (currentPrice - commission);
  const workerShareRate = 100 - commissionRate;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">New Direct Request</span>;
      case 'NEGOTIATING': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Price Negotiation</span>;
      case 'AWAITING_ADVANCE': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-gold)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>Awaiting Base Advance</span>;
      case 'CONFIRMED': return <span className="badge badge-verified">Confirmed Job</span>;
      case 'ON_THE_WAY': return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>On The Way</span>;
      case 'ARRIVED': return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>Arrived at Site</span>;
      case 'IN_PROGRESS': return <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }}>In Progress</span>;
      case 'COMPLETION_REQUESTED': return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Completion Verification</span>;
      case 'COMPLETED': return <span className="badge badge-verified">Completed</span>;
      case 'PAID': return <span className="badge badge-gold">Paid & Settled</span>;
      case 'CANCELLED': return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' }}>Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handleDevicePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file (JPEG/PNG/WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      if (onUploadPhotos) {
        setIsUploadingPhoto(true);
        onUploadPhotos(booking.id, {
          [photoType === 'before' ? 'beforePhoto' : 'afterPhoto']: base64Data
        }).finally(() => setIsUploadingPhoto(false));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="toast-popup-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(12px)',
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
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '2rem',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>{booking.serviceType}</h2>
              {getStatusBadge(booking.status)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Booking #{booking.id} • Source: {booking.bookingSource || 'DIRECT'} • Created: {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <XCircle size={24} />
          </button>
        </div>

        {/* Status Callout Banner */}
        {isDirectPending && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', display: 'block' }}>Customer Proposed Price Offer</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Customer offered <strong>৳{currentPrice}</strong>. You can accept to confirm this job, or propose a counter price.
                </p>
              </div>
              <strong style={{ fontSize: '1.3rem', color: 'var(--accent-gold)' }}>৳{currentPrice}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
                onClick={() => {
                  if (onAcceptBooking) onAcceptBooking(booking.id);
                  onClose();
                }}
              >
                <CheckCircle2 size={14} /> Accept Job (৳{currentPrice})
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                onClick={() => {
                  if (onOpenCounterModal) onOpenCounterModal(booking);
                  onClose();
                }}
              >
                Propose Counter Price
              </button>
            </div>
          </div>
        )}

        {isWorkerCounterWaiting && (
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>Counter Offer Submitted</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                You proposed <strong>৳{currentPrice}</strong>. Waiting for customer response.
              </span>
            </div>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>Waiting Customer</span>
          </div>
        )}

        {isAwaitingAdvance && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', display: 'block' }}>Awaiting Client Minimum Advance Payment</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Agreed Price: <strong>৳{currentPrice}</strong>. When client pays base advance of ৳{booking.basePrice || 300} (+5% VAT), this job will confirm & activate.
              </span>
            </div>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-gold)' }}>Awaiting Advance</span>
          </div>
        )}

        {/* Customer & Location Card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0 }}>{booking.customer?.name || 'Customer'}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Phone: <strong style={{ color: '#ffffff' }}>{booking.customer?.phone || '01711223344'}</strong>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Scheduled Window</span>
            <strong style={{ color: '#ffffff' }}>{booking.preferredDate || 'Tomorrow'} ({booking.preferredTime || '10:00 AM'})</strong>
          </div>
        </div>

        {/* Service Description & Address & Customer Attached Photo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>PROBLEM DESCRIPTION & SCOPE</span>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{booking.description}</p>
            
            {/* Customer Attached Issue Image */}
            {booking.beforePhoto && (
              <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', fontWeight: 'bold' }}>
                  <Camera size={13} /> Customer Attached Issue Photo:
                </span>
                <img 
                  src={booking.beforePhoto} 
                  alt="Customer Attached Diagnostic" 
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '6px', background: '#000' }} 
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Service Location Address</span>
              <strong style={{ color: '#ffffff' }}>{booking.address}</strong>
            </div>
          </div>
        </div>

        {/* Financial & Commission Breakdown */}
        <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '1.1rem', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', textAlign: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Final Service Price</span>
            <strong style={{ fontSize: '1.25rem', color: '#ffffff' }}>৳{currentPrice}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Platform Fee ({commissionRate}%)</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--accent-gold)' }}>-৳{commission}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Worker Net Earning ({workerShareRate}%)</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>৳{netEarning}</strong>
          </div>
        </div>

        {/* Photo Upload & Gallery (Before and After Job) */}
        {['IN_PROGRESS', 'COMPLETION_REQUESTED', 'COMPLETED', 'PAID'].includes(booking.status) && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffffff' }}>Work Evidence Photos</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setPhotoType('before')}
                  className={`btn ${photoType === 'before' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  Before Photo
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoType('after')}
                  className={`btn ${photoType === 'after' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  After Photo
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Before Work Photo</span>
                {booking.beforePhoto ? (
                  <img src={booking.beforePhoto} alt="Before work" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                ) : (
                  <div style={{ height: '110px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    No before photo uploaded
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>After Work Photo</span>
                {booking.afterPhoto ? (
                  <img src={booking.afterPhoto} alt="After work" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                ) : (
                  <div style={{ height: '110px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    No after photo uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Upload & URL Controls */}
            <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <label className="btn btn-secondary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={14} />
                  {isUploadingPhoto ? 'Uploading...' : `Upload File`}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleDevicePhotoChange}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                  onClick={() => {
                    const demoUrl = photoType === 'before' 
                      ? "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600"
                      : "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600";
                    if (onUploadPhotos) {
                      setIsUploadingPhoto(true);
                      onUploadPhotos(booking.id, {
                        [photoType === 'before' ? 'beforePhoto' : 'afterPhoto']: demoUrl
                      }).finally(() => setIsUploadingPhoto(false));
                    }
                  }}
                >
                  💡 Use Demo Servicing Photo
                </button>
              </div>

              {/* URL input */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
                  placeholder={`Or paste ${photoType === 'before' ? 'before' : 'after'} image URL...`}
                  value={workerPhotoUrl}
                  onChange={e => setWorkerPhotoUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
                  disabled={!workerPhotoUrl || isUploadingPhoto}
                  onClick={() => {
                    if (onUploadPhotos && workerPhotoUrl) {
                      setIsUploadingPhoto(true);
                      onUploadPhotos(booking.id, {
                        [photoType === 'before' ? 'beforePhoto' : 'afterPhoto']: workerPhotoUrl
                      }).then(() => setWorkerPhotoUrl('')).finally(() => setIsUploadingPhoto(false));
                    }
                  }}
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Review if submitted */}
        {booking.reviewRating && (
          <div style={{ background: 'rgba(251, 191, 36, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Customer Review & Rating</span>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{'★'.repeat(booking.reviewRating)} ({booking.reviewRating}/5)</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
              "{booking.reviewComment || 'Great service, highly satisfied!'}"
            </p>
          </div>
        )}

        {/* Step-by-Step Action Controls */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {booking.status === 'CONFIRMED' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                onClick={() => {
                  if (onSetOnTheWay) onSetOnTheWay(booking.id);
                  onClose();
                }}
              >
                🚀 Start Journey (Mark On The Way)
              </button>
            )}

            {booking.status === 'ON_THE_WAY' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)' }}
                onClick={() => {
                  if (onSetArrived) onSetArrived(booking.id);
                  onClose();
                }}
              >
                📍 I've Arrived at Location
              </button>
            )}

            {booking.status === 'ARRIVED' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                onClick={() => {
                  if (onOpenStartOtpModal) onOpenStartOtpModal(booking);
                  onClose();
                }}
              >
                🔑 Verify Customer Start OTP
              </button>
            )}

            {booking.status === 'IN_PROGRESS' && (
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
                ⚡ Work In Progress (Awaiting Customer Payment & Completion)
              </span>
            )}
          </div>

          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
