import React, { useState, useEffect } from 'react';
import { 
  XCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  Phone, 
  KeyRound, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  Star, 
  ArrowRight, 
  CreditCard, 
  RotateCcw,
  MessageSquare,
  Navigation,
  Smartphone,
  Check
} from 'lucide-react';

const API_BASE = "http://localhost:8081/api";

function ModalArrivalTimer({ booking, onTimeoutRefund }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!booking.createdAt) return;
      const hoursAllowed = booking.arrivalTimeHours || (booking.distanceMeters ? booking.distanceMeters / 1000 : 1.5);
      const startTime = booking.advancePaidAt ? new Date(booking.advancePaidAt).getTime() : new Date(booking.createdAt).getTime();
      const deadline = startTime + hoursAllowed * 60 * 60 * 1000;
      const diff = deadline - Date.now();

      if (diff <= 0) {
        setTimeLeft('00h 00m 00s (Time Expired)');
        setIsExpired(true);
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
        setIsExpired(false);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const distanceKm = booking.distanceMeters ? (booking.distanceMeters / 1000).toFixed(1) : '1.5';
  const refundAmount = (booking.advancePaidAmount || booking.basePrice || 300) + (booking.advanceVatAmount || (booking.basePrice || 300) * 0.05);

  return (
    <div style={{ background: isExpired ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.1)', border: isExpired ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '12px', padding: '0.9rem 1.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isExpired ? '#ef4444' : '#38bdf8' }}>
          <Clock size={16} />
          <strong style={{ fontSize: '0.85rem' }}>{isExpired ? 'Arrival Window Elapsed' : 'Live Arrival Countdown'}</strong>
        </div>
        <span style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'monospace', color: isExpired ? '#ef4444' : '#38bdf8' }}>
          {timeLeft}
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0.5rem 0' }}>
        Distance: <strong>{distanceKm} km</strong> • Rule: 1 hr per 1000 meters. You can cancel and receive instant cashback refund if delayed.
      </p>
      <button
        className="btn btn-secondary"
        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}
        onClick={() => onTimeoutRefund && onTimeoutRefund(booking)}
      >
        <XCircle size={13} /> Cancel & Instant Cashback (৳{refundAmount})
      </button>
    </div>
  );
}

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onAcceptPrice,
  onOpenCounterModal,
  onCancelBooking,
  onStartPayment,
  onOpenAdvanceModal,
  onLeaveReview,
  onViewInvoice,
  onTimeoutRefund
}) {
  if (!isOpen || !booking) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">Pending Response</span>;
      case 'NEGOTIATING': return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>Counter Offer</span>;
      case 'AWAITING_ADVANCE': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-gold)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>Advance Payment Required</span>;
      case 'PRICE_AGREED':
      case 'ACCEPTED':
      case 'CONFIRMED': return <span className="badge badge-verified">Confirmed</span>;
      case 'ON_THE_WAY': return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>On The Way</span>;
      case 'ARRIVED': return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>Arrived</span>;
      case 'IN_PROGRESS': return <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }}>In Progress</span>;
      case 'COMPLETION_REQUESTED': return <span className="badge badge-verified">Service Finished (Pay)</span>;
      case 'COMPLETED':
      case 'PAID': return <span className="badge badge-gold">Completed & Paid</span>;
      case 'CANCELLED': return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' }}>Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const currentPrice = (booking.status === 'NEGOTIATING' || booking.status === 'COUNTERED' || booking.status === 'PENDING')
    ? (booking.lastOfferedBy === 'WORKER' 
        ? (booking.workerCounterPrice || booking.estimatedCost || booking.agreedCost) 
        : (booking.customerOfferPrice || booking.estimatedCost || booking.agreedCost))
    : (booking.agreedCost || booking.estimatedCost || booking.workerCounterPrice || booking.customerOfferPrice);
  const isWorkerCounter = (booking.status === 'NEGOTIATING' || booking.status === 'COUNTERED' || booking.status === 'PENDING') && (booking.lastOfferedBy === 'WORKER' || (!booking.lastOfferedBy && booking.workerCounterPrice));
  const isConfirmedOrActive = ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status) && booking.advancePaid;
  const isAdvanceNeeded = (booking.status === 'AWAITING_ADVANCE' || booking.status === 'ACCEPTED') && !booking.advancePaid;

  return (
    <div
      className="toast-popup-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
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
              Booking #{booking.id} • Base Advance: ৳{booking.basePrice || 300} (+5% VAT)
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '0.35rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <XCircle size={20} />
          </button>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="modal-two-col">
          {/* Left Column: Technician, OTP, Timer, Negotiation / Advance banners */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {/* Worker Counter Offer Banner */}
            {isWorkerCounter && (
              <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
                    <Clock size={15} />
                    <strong style={{ fontSize: '0.85rem' }}>Counter Offer Received</strong>
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--accent-gold)' }}>৳{currentPrice}</strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Technician proposed <strong>৳{currentPrice}</strong> for this service.
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.7rem' }}
                    onClick={() => {
                      if (onAcceptPrice) onAcceptPrice(booking.id);
                      if (onOpenAdvanceModal) onOpenAdvanceModal(booking);
                      onClose();
                    }}
                  >
                    <CheckCircle2 size={12} /> Accept & Pay Advance
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
                    onClick={() => {
                      if (onOpenCounterModal) onOpenCounterModal(booking);
                      onClose();
                    }}
                  >
                    <RotateCcw size={12} /> Counter
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    onClick={() => {
                      if (onCancelBooking) onCancelBooking(booking.id);
                      onClose();
                    }}
                  >
                    <XCircle size={12} /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Advance Payment Prompt */}
            {isAdvanceNeeded && (
              <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '0.75rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
                <div>
                  <strong style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', display: 'block' }}>
                    💳 Base Advance Required
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Pay ৳{((booking.basePrice || 300) * 1.05).toFixed(1)} to confirm technician dispatch.
                  </span>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '0.4rem 0.85rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    if (onOpenAdvanceModal) onOpenAdvanceModal(booking);
                    onClose();
                  }}
                >
                  Pay Advance →
                </button>
              </div>
            )}

            {/* Arrival Timer */}
            {['CONFIRMED', 'ON_THE_WAY'].includes(booking.status) && booking.advancePaid && (
              <ModalArrivalTimer booking={booking} onTimeoutRefund={onTimeoutRefund} />
            )}

            {/* Technician Profile Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <img
                  src={booking.worker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120"}
                  alt={booking.worker?.name}
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-heading)', margin: 0 }}>{booking.worker?.name || 'Assigned Technician'}</h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                    ⭐ {booking.worker?.rating || 4.9} • Phone: <strong style={{ color: 'var(--text-heading)' }}>{booking.worker?.phone || '01911223344'}</strong>
                  </p>
                </div>
              </div>

              {isConfirmedOrActive && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <a href={`tel:${booking.worker?.phone || '01911223344'}`} className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', textDecoration: 'none' }}>
                    <Phone size={11} /> Call
                  </a>
                  <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }} onClick={() => alert("Connecting live technician chat...")}>
                    <MessageSquare size={11} /> Chat
                  </button>
                </div>
              )}
            </div>

            {/* OTP Codes */}
            {['CONFIRMED', 'ON_THE_WAY', 'ARRIVED'].includes(booking.status) && (
              <div style={{ background: 'var(--primary-subtle)', padding: '0.75rem 0.95rem', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>🔑 Arrival Start OTP:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'monospace', color: '#1d4ed8', background: 'var(--bg-card)', padding: '0.2rem 0.8rem', borderRadius: '6px', border: '1.5px solid #2563eb', letterSpacing: '0.15rem' }}>
                  {booking.startVerificationCode || '4829'}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Problem description, address, price lock & actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {/* Problem & Address */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 600, marginBottom: '0.25rem' }}>Service Problem Notes:</div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>{booking.description || 'General maintenance fix requested'}</p>
              {booking.beforePhoto && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={booking.beforePhoto} alt="Issue inspection" style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: '6px', background: '#000' }} />
                </div>
              )}
            </div>

            {/* Address & Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Service Location</span>
                <strong style={{ color: 'var(--text-heading)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{booking.address || (booking.description?.match(/\[Location:\s*(.*?)\]/)?.[1]) || 'Customer Location'}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.55rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Schedule</span>
                <strong style={{ color: 'var(--text-heading)' }}>{booking.preferredDate || 'Tomorrow'}</strong>
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  {booking.agreedCost ? 'Agreed Deal Price' : 'Estimated Cost'}
                </span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>৳{currentPrice}</strong>
              </div>
              {booking.paymentStatus === 'PAID' && (
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
                  Paid & Settled
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem', borderTop: '1px solid var(--border-color)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['IN_PROGRESS', 'COMPLETION_REQUESTED'].includes(booking.status) && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.76rem', padding: '0.4rem 0.9rem', background: 'linear-gradient(90deg, #10b981, #059669)' }}
                onClick={() => {
                  if (onStartPayment) onStartPayment(booking);
                  onClose();
                }}
              >
                <CreditCard size={13} /> Complete & Pay (৳{currentPrice})
              </button>
            )}

            {booking.status === 'PAID' && (
              <>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.76rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => {
                    if (onLeaveReview) onLeaveReview(booking);
                    onClose();
                  }}
                >
                  <Star size={13} /> {booking.reviewRating ? 'Update Review' : 'Leave Review'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.76rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => {
                    if (onViewInvoice) onViewInvoice(booking);
                    onClose();
                  }}
                >
                  <FileText size={13} /> Invoice
                </button>
              </>
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
