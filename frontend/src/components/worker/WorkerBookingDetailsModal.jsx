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
          padding: '1.4rem 1.6rem',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.7rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>{booking.serviceType}</h2>
              {getStatusBadge(booking.status)}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Booking #{booking.id} • Source: {booking.bookingSource || 'DIRECT'} • Created: {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '0.35rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <XCircle size={20} />
          </button>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="modal-two-col">
          {/* Left Column: Customer card, negotiation/advance status, financial breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {/* Status Callout Banners */}
            {isDirectPending && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '10px', padding: '0.75rem 0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', display: 'block' }}>Customer Proposed Price</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Offered <strong>৳{currentPrice}</strong></span>
                  </div>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>৳{currentPrice}</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.74rem' }}
                    onClick={() => {
                      if (onAcceptBooking) onAcceptBooking(booking.id);
                      onClose();
                    }}
                  >
                    <CheckCircle2 size={12} /> Accept Job (৳{currentPrice})
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}
                    onClick={() => {
                      if (onOpenCounterModal) onOpenCounterModal(booking);
                      onClose();
                    }}
                  >
                    Counter Price
                  </button>
                </div>
              </div>
            )}

            {isWorkerCounterWaiting && (
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-heading)', display: 'block' }}>Counter Offer Sent</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>You proposed ৳{currentPrice}. Waiting for client.</span>
                </div>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.7rem' }}>Waiting Client</span>
              </div>
            )}

            {isAwaitingAdvance && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', display: 'block' }}>Awaiting Base Advance</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Client will pay ৳{((booking.basePrice || 300) * 1.05).toFixed(1)} to confirm.</span>
                </div>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-gold)', fontSize: '0.7rem' }}>Awaiting Advance</span>
              </div>
            )}

            {/* Customer & Schedule Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <User size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-heading)', margin: 0 }}>{booking.customer?.name || 'Customer'}</h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0 0' }}>
                    Phone: <strong style={{ color: 'var(--text-heading)' }}>{booking.customer?.phone || '01711223344'}</strong>
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Schedule</span>
                <strong style={{ color: 'var(--text-heading)' }}>{booking.preferredDate || 'Tomorrow'}</strong>
              </div>
            </div>

            {/* Financial & Commission Breakdown */}
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Deal Price</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-heading)' }}>৳{currentPrice}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Platform ({commissionRate}%)</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--accent-gold)' }}>-৳{commission}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Net Earning</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>৳{netEarning}</strong>
              </div>
            </div>

            {/* Customer Review if submitted */}
            {booking.reviewRating && (
              <div style={{ background: 'rgba(251, 191, 36, 0.08)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Customer Review</span>
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.78rem' }}>{'★'.repeat(booking.reviewRating)} ({booking.reviewRating}/5)</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                  "{booking.reviewComment || 'Great service!'}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Problem description, address & evidence photo uploaders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {/* Problem & Location */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Problem Scope:</div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>{booking.description || 'General maintenance'}</p>
              
              {booking.beforePhoto && (
                <div style={{ marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.2rem' }}>
                    <Camera size={11} /> Customer Diagnostic Photo:
                  </span>
                  <img 
                    src={booking.beforePhoto} 
                    alt="Diagnostic" 
                    style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: '6px', background: '#000' }} 
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
              <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Service Address</span>
                <strong style={{ color: 'var(--text-heading)' }}>{booking.address || (booking.description?.match(/\[Location:\s*(.*?)\]/)?.[1]) || booking.customer?.address || 'Customer Location'}</strong>
              </div>
            </div>

            {/* Evidence Photos */}
            {['IN_PROGRESS', 'COMPLETION_REQUESTED', 'COMPLETED', 'PAID'].includes(booking.status) && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color: 'var(--text-heading)' }}>Work Evidence Photos</span>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      type="button"
                      onClick={() => setPhotoType('before')}
                      className={`btn ${photoType === 'before' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                    >
                      Before
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoType('after')}
                      className={`btn ${photoType === 'after' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                    >
                      After
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', cursor: 'pointer' }}>
                    <Camera size={12} /> {isUploadingPhoto ? '...' : 'Upload'}
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
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', color: '#60a5fa' }}
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
                    Demo Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Action Controls */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem', borderTop: '1px solid var(--border-color)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {booking.status === 'CONFIRMED' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.76rem', padding: '0.4rem 0.9rem' }}
                onClick={() => {
                  if (onSetOnTheWay) onSetOnTheWay(booking.id);
                  onClose();
                }}
              >
                🚀 Start Journey (On The Way)
              </button>
            )}

            {booking.status === 'ON_THE_WAY' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.76rem', padding: '0.4rem 0.9rem', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)' }}
                onClick={() => {
                  if (onSetArrived) onSetArrived(booking.id);
                  onClose();
                }}
              >
                📍 Arrived at Location
              </button>
            )}

            {booking.status === 'ARRIVED' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.76rem', padding: '0.4rem 0.9rem' }}
                onClick={() => {
                  if (onOpenStartOtpModal) onOpenStartOtpModal(booking);
                  onClose();
                }}
              >
                🔑 Verify Customer Start OTP
              </button>
            )}

            {booking.status === 'IN_PROGRESS' && (
              <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.35rem 0.7rem', fontSize: '0.76rem' }}>
                ⚡ Work In Progress (Awaiting Completion OTP)
              </span>
            )}
          </div>

          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem 1.1rem', fontSize: '0.8rem' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
