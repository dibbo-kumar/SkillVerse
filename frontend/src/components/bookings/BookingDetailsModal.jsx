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
        padding: '1.5rem'
      }}
      onClick={(e) => e.target.className.includes('toast-popup-overlay') && onClose()}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '650px',
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
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-heading)', margin: 0 }}>{booking.serviceType}</h2>
              {getStatusBadge(booking.status)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Booking #{booking.id} • Base Advance: ৳{booking.basePrice || 300} (+5% VAT)
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <XCircle size={26} />
          </button>
        </div>

        {/* Worker Counter Offer Banner */}
        {isWorkerCounter && (
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                <Clock size={18} />
                <strong style={{ fontSize: '0.95rem' }}>Technician Proposed Counter Offer</strong>
              </div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>৳{currentPrice}</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              The technician reviewed your problem and proposed <strong>৳{currentPrice}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                onClick={() => {
                  if (onAcceptPrice) onAcceptPrice(booking.id);
                  if (onOpenAdvanceModal) onOpenAdvanceModal(booking);
                  onClose();
                }}
              >
                <CheckCircle2 size={14} /> Accept Counter (৳{currentPrice}) & Pay Advance
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                onClick={() => {
                  if (onOpenCounterModal) onOpenCounterModal(booking);
                  onClose();
                }}
              >
                <RotateCcw size={14} /> Propose Counter
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  if (onCancelBooking) onCancelBooking(booking.id);
                  onClose();
                }}
              >
                <XCircle size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Advance Payment Prompt */}
        {isAdvanceNeeded && (
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <strong style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', display: 'block' }}>
                💳 Minimum Base Advance Required
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Pay minimum base advance of ৳{booking.basePrice || 300} (+ 5% VAT ৳{((booking.basePrice || 300) * 0.05).toFixed(1)}) to confirm dispatch.
              </span>
            </div>
            <button
              className="btn btn-primary"
              style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
              onClick={() => {
                if (onOpenAdvanceModal) onOpenAdvanceModal(booking);
                onClose();
              }}
            >
              Pay Advance (৳{((booking.basePrice || 300) * 1.05).toFixed(1)}) →
            </button>
          </div>
        )}

        {/* Arrival Timer */}
        {['CONFIRMED', 'ON_THE_WAY'].includes(booking.status) && booking.advancePaid && (
          <ModalArrivalTimer booking={booking} onTimeoutRefund={onTimeoutRefund} />
        )}

        {/* Technician Profile Card with Direct Contact Unlocked */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={booking.worker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120"}
              alt={booking.worker?.name}
              style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-heading)', margin: 0 }}>{booking.worker?.name || 'Assigned Technician'}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                ⭐ {booking.worker?.rating || 4.9} • Phone: <strong style={{ color: 'var(--text-heading)' }}>{booking.worker?.phone || '01911223344'}</strong>
              </p>
            </div>
          </div>

          {isConfirmedOrActive && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href={`tel:${booking.worker?.phone || '01911223344'}`} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', textDecoration: 'none' }}>
                <Phone size={12} /> Call
              </a>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }} onClick={() => alert("Opening chat...")}>
                <MessageSquare size={12} /> Chat
              </button>
            </div>
          )}
        </div>

        {/* Problem Description & Attached Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', margin: 0 }}>Service & Problem Details</h4>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{booking.description}</p>
            {booking.beforePhoto && (
              <div style={{ marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Attached Issue Photo:</span>
                <img src={booking.beforePhoto} alt="Attached Inspection" style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '6px', background: '#000' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Service Address</span>
              <strong style={{ color: 'var(--text-heading)' }}>{booking.address}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Scheduled Time</span>
              <strong style={{ color: 'var(--text-heading)' }}>{booking.preferredDate || 'Tomorrow'} ({booking.preferredTime || '10:00 AM'})</strong>
            </div>
          </div>
        </div>

        {/* Financial Lock Summary */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              {booking.agreedCost ? 'Final Agreed Deal Price' : 'Current Proposed Price'}
            </span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>৳{currentPrice}</strong>
          </div>
          {booking.paymentStatus === 'PAID' && (
            <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              Paid & Settled
            </span>
          )}
        </div>

        {/* OTP Codes */}
        {['CONFIRMED', 'ON_THE_WAY', 'ARRIVED'].includes(booking.status) && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>🔑 Arrival Start OTP:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-heading)', background: '#000', padding: '0.2rem 0.8rem', borderRadius: '6px' }}>
              {booking.startVerificationCode || '4829'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {['IN_PROGRESS', 'COMPLETION_REQUESTED'].includes(booking.status) && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: 'linear-gradient(90deg, #10b981, #059669)' }}
                onClick={() => {
                  if (onStartPayment) onStartPayment(booking);
                  onClose();
                }}
              >
                <CreditCard size={14} /> Complete & Pay (৳{currentPrice})
              </button>
            )}

            {booking.status === 'PAID' && (
              <>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                  onClick={() => {
                    if (onLeaveReview) onLeaveReview(booking);
                    onClose();
                  }}
                >
                  <Star size={14} /> {booking.reviewRating ? 'Update Review' : 'Leave Review'}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                  onClick={() => {
                    if (onViewInvoice) onViewInvoice(booking);
                    onClose();
                  }}
                >
                  <FileText size={14} /> Invoice
                </button>
              </>
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
