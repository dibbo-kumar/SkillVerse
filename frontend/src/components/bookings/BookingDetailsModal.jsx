import React from 'react';
import { XCircle, CheckCircle2, Clock, MapPin, DollarSign, User, Phone, KeyRound, Wrench, ShieldCheck, FileText, Star, ArrowRight, CreditCard, RotateCcw } from 'lucide-react';

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onAcceptPrice,
  onOpenCounterModal,
  onCancelBooking,
  onStartPayment,
  onOpenCompletionOtp,
  onLeaveReview,
  onViewInvoice
}) {
  if (!isOpen || !booking) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">Pending Response</span>;
      case 'NEGOTIATING': return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>Counter Offer</span>;
      case 'PRICE_AGREED':
      case 'CONFIRMED': return <span className="badge badge-verified">Confirmed</span>;
      case 'ON_THE_WAY': return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>On The Way</span>;
      case 'ARRIVED': return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>Arrived</span>;
      case 'IN_PROGRESS': return <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }}>In Progress</span>;
      case 'COMPLETION_REQUESTED': return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Completion OTP Required</span>;
      case 'COMPLETED': return <span className="badge badge-verified">Completed</span>;
      case 'PAID': return <span className="badge badge-gold">Paid</span>;
      case 'CANCELLED': return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' }}>Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const currentPrice = booking.agreedCost || booking.workerCounterPrice || booking.customerOfferPrice || booking.estimatedCost;
  const isWorkerCounter = (booking.status === 'NEGOTIATING' || booking.status === 'PENDING') && booking.lastOfferedBy === 'WORKER';
  const isCustomerWaiting = (booking.status === 'PENDING' || booking.status === 'NEGOTIATING') && (booking.lastOfferedBy === 'CUSTOMER' || !booking.lastOfferedBy);

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
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>{booking.serviceType}</h2>
              {getStatusBadge(booking.status)}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Booking #{booking.id} • Source: {booking.bookingSource || 'DIRECT'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <XCircle size={26} />
          </button>
        </div>

        {/* Worker Counter Offer Banner - ONLY when worker has countered */}
        {isWorkerCounter && (
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                <Clock size={18} />
                <strong style={{ fontSize: '0.95rem' }}>Technician Counter Offer Received</strong>
              </div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>৳{currentPrice}</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              The technician reviewed your request and proposed <strong>৳{currentPrice}</strong>. You can accept this price to confirm the booking, counter back with your offer (once per turn), or reject/cancel.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                onClick={() => {
                  if (onAcceptPrice) onAcceptPrice(booking.id);
                  onClose();
                }}
              >
                <CheckCircle2 size={14} /> Accept Counter (৳{currentPrice})
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                onClick={() => {
                  if (onOpenCounterModal) onOpenCounterModal(booking);
                  onClose();
                }}
              >
                <RotateCcw size={14} /> Counter Offer
              </button>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  if (onCancelBooking) onCancelBooking(booking.id);
                  onClose();
                }}
              >
                <XCircle size={14} /> Reject & Cancel
              </button>
            </div>
          </div>
        )}

        {/* Customer Waiting Banner - when customer sent the last offer */}
        {isCustomerWaiting && (
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={18} color="var(--accent-blue)" />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block' }}>Waiting for Technician Response</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Your offered price of <strong>৳{currentPrice}</strong> was submitted. If the technician replies with a counter price, you will be able to counter again.
                </span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', flexShrink: 0 }}
              onClick={() => {
                if (onCancelBooking) onCancelBooking(booking.id);
                onClose();
              }}
            >
              <XCircle size={13} /> Cancel
            </button>
          </div>
        )}

        {/* Technician Profile Card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={booking.worker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120"}
            alt={booking.worker?.name}
            style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0 }}>{booking.worker?.name || 'Assigned Technician'}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              ⭐ {booking.worker?.rating || 4.9} • Phone: <strong>{booking.worker?.phone || '01911223344'}</strong>
            </p>
          </div>
        </div>

        {/* Problem Description & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', margin: 0 }}>Service & Problem Details</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {booking.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Service Address</span>
              <strong style={{ color: '#ffffff' }}>{booking.address}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Scheduled Time</span>
              <strong style={{ color: '#ffffff' }}>{booking.preferredDate || 'Tomorrow'} ({booking.preferredTime || '10:00 AM'})</strong>
            </div>
          </div>
        </div>

        {/* Financial Lock Summary */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              {booking.agreedCost ? 'Final Agreed Price' : 'Current Proposed Price'}
            </span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>৳{currentPrice}</strong>
          </div>
          {booking.paymentStatus === 'PAID' && (
            <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              Paid via {booking.paymentMethod || 'bKash'}
            </span>
          )}
        </div>

        {/* OTP Codes if applicable */}
        {['CONFIRMED', 'ON_THE_WAY', 'ARRIVED'].includes(booking.status) && (
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>🔑 Start Service OTP:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff', background: '#000', padding: '0.2rem 0.8rem', borderRadius: '6px' }}>
              {booking.startVerificationCode || '4829'}
            </span>
          </div>
        )}

        {booking.status === 'COMPLETION_REQUESTED' && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'block' }}>✔ Technician Requested Completion</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Share code with technician or verify below</span>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff', background: '#000', padding: '0.2rem 0.8rem', borderRadius: '6px' }}>
              {booking.completionVerificationCode || '9143'}
            </span>
          </div>
        )}

        {/* Action Buttons Section */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {booking.status === 'COMPLETION_REQUESTED' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                onClick={() => {
                  if (onOpenCompletionOtp) onOpenCompletionOtp(booking);
                  onClose();
                }}
              >
                <KeyRound size={14} /> Enter Completion OTP
              </button>
            )}

            {booking.status === 'COMPLETED' && booking.paymentStatus !== 'PAID' && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', background: 'linear-gradient(90deg, #10b981, #059669)' }}
                onClick={() => {
                  if (onStartPayment) onStartPayment(booking);
                  onClose();
                }}
              >
                <CreditCard size={14} /> Pay Now (৳{currentPrice})
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
                  <FileText size={14} /> View Invoice
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
