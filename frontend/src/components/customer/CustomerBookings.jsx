import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowRight,
  Sparkles,
  CreditCard,
  MessageSquare,
  Navigation,
  FileCheck,
  Key,
  RotateCcw,
  ShoppingBag,
  DollarSign,
  Smartphone,
  Check
} from 'lucide-react';

const API_BASE = "http://localhost:8081/api";

function ArrivalCountdownTimer({ booking, onTimeoutRefund }) {
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
        setTimeLeft('00h 00m 00s (Time Limit Exceeded)');
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
  const hoursAllowed = booking.arrivalTimeHours || '1.5';
  const refundAmount = (booking.advancePaidAmount || booking.basePrice || 300) + (booking.advanceVatAmount || (booking.basePrice || 300) * 0.05);

  return (
    <div style={{ background: isExpired ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.1)', border: isExpired ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.35)', borderRadius: '12px', padding: '1rem', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isExpired ? '#ef4444' : '#38bdf8' }}>
          <Clock size={18} />
          <strong style={{ fontSize: '0.95rem' }}>
            {isExpired ? 'Arrival Time Expired — Eligible for Instant Cashback' : 'Estimated Arrival Countdown'}
          </strong>
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace', color: isExpired ? '#dc2626' : '#2563eb', background: 'var(--bg-card)', padding: '0.25rem 0.75rem', borderRadius: '8px', border: isExpired ? '1.5px solid #fca5a5' : '1.5px solid #93c5fd', boxShadow: 'var(--shadow-sm)' }}>
          {timeLeft}
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.6rem 0' }}>
        Distance: <strong style={{ color: 'var(--text-heading)' }}>{distanceKm} km</strong> • Arrival Rate: <strong style={{ color: 'var(--text-heading)' }}>1 hour per 1000 meters ({hoursAllowed}h max)</strong>.
        {isExpired ? ' Technician failed to reach within the allowed arrival window.' : ' If technician cannot reach within this time, you can cancel and receive an instant cashback refund.'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}
          onClick={() => onTimeoutRefund(booking)}
        >
          <XCircle size={14} /> Cancel & Get Instant Cashback Refund (৳{refundAmount})
        </button>
      </div>
    </div>
  );
}

export default function CustomerBookings({
  bookings = [],
  onAcceptCounterOffer,
  onStatusChange,
  onStartPayment,
  onOpenReviewModal,
  reviews = [],
  onNavigateTab
}) {
  const [filterTab, setFilterTab] = useState('active'); // active, upcoming, completed, cancelled
  const [customerOtpInputs, setCustomerOtpInputs] = useState({});
  const [customerOtpErrors, setCustomerOtpErrors] = useState({});

  // Advance Payment Modal State
  const [advanceModalBooking, setAdvanceModalBooking] = useState(null);
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState('bKash');
  const [advanceMobileNumber, setAdvanceMobileNumber] = useState('');
  const [isPayingAdvance, setIsPayingAdvance] = useState(false);

  // Counter Modal State (Customer counter again)
  const [counterModalBooking, setCounterModalBooking] = useState(null);
  const [customCounterPrice, setCustomCounterPrice] = useState('');

  // Complete & Pay Modal State (No OTP needed, custom amount allowed)
  const [completePayBooking, setCompletePayBooking] = useState(null);
  const [finalPaymentMethod, setFinalPaymentMethod] = useState('bKash');
  const [finalMobileNumber, setFinalMobileNumber] = useState('');
  const [customFinalAmount, setCustomFinalAmount] = useState('');
  const [isProcessingFinalPay, setIsProcessingFinalPay] = useState(false);

  const handleVerifyCustomerStartOtp = (booking) => {
    const entered = (customerOtpInputs[`start-${booking.id}`] || '').trim();
    const expected = booking.startVerificationCode || '4829';
    if (!entered) {
      setCustomerOtpErrors(prev => ({ ...prev, [`start-${booking.id}`]: 'Please enter the 4-digit Start OTP.' }));
      return;
    }
    if (entered !== expected) {
      setCustomerOtpErrors(prev => ({ ...prev, [`start-${booking.id}`]: `❌ Wrong OTP! Provided code "${entered}" does not match Start OTP (${expected}).` }));
      return;
    }
    setCustomerOtpErrors(prev => ({ ...prev, [`start-${booking.id}`]: '' }));
    setCustomerOtpInputs(prev => ({ ...prev, [`start-${booking.id}`]: '' }));
    alert(`🎉 Start OTP Verified! Technician service started for ${booking.serviceType}.`);
    onStatusChange(booking.id, 'IN_PROGRESS');
  };

  const handlePayAdvanceSubmit = async (e) => {
    e.preventDefault();
    if (!advanceModalBooking) return;
    if (!advanceMobileNumber.trim() && advancePaymentMethod !== 'Cash') {
      alert("Please enter a valid mobile number for payment verification.");
      return;
    }

    setIsPayingAdvance(true);
    const base = advanceModalBooking.basePrice || 300.0;
    const vat = Math.round(base * 0.05 * 100.0) / 100.0;

    try {
      const res = await fetch(`${API_BASE}/bookings/${advanceModalBooking.id}/pay-advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: advancePaymentMethod,
          mobileNumber: advanceMobileNumber || '01711223344',
          amount: base,
          vatAmount: vat
        })
      });

      if (res.ok) {
        alert(`🎉 Advance Payment of ৳${base + vat} Successful! Booking is confirmed. Technician has been dispatched.`);
        setAdvanceModalBooking(null);
        if (onStatusChange) onStatusChange(advanceModalBooking.id, 'CONFIRMED');
      } else {
        alert("Failed to process advance payment.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPayingAdvance(false);
    }
  };

  const handleTimeoutRefund = async (booking) => {
    if (!window.confirm(`Confirm cancellation and trigger instant cashback refund of ৳${(booking.advancePaidAmount || booking.basePrice || 300) * 1.05} back to your payment account?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/bookings/${booking.id}/timeout-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        alert("🎉 Instant Cashback Processed! The advance payment has been refunded to your account.");
        if (onStatusChange) onStatusChange(booking.id, 'CANCELLED');
      } else {
        const err = await res.json();
        alert(err.error || "Could not process refund.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCustomCounterSubmit = async (e) => {
    e.preventDefault();
    if (!counterModalBooking || !customCounterPrice) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${counterModalBooking.id}/counter-offer?price=${customCounterPrice}&offeredBy=CUSTOMER`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert(`🎉 Counter offer of ৳${customCounterPrice} submitted to technician!`);
        setCounterModalBooking(null);
        if (onStatusChange) onStatusChange(counterModalBooking.id, 'NEGOTIATING');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinalPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!completePayBooking) return;
    if (!finalMobileNumber.trim() && finalPaymentMethod !== 'Cash') {
      alert("Please enter a valid mobile number for online payment.");
      return;
    }

    setIsProcessingFinalPay(true);
    const amountToPay = customFinalAmount ? Number(customFinalAmount) : (completePayBooking.agreedCost || completePayBooking.estimatedCost);

    try {
      const res = await fetch(`${API_BASE}/bookings/${completePayBooking.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: finalPaymentMethod,
          mobileNumber: finalMobileNumber || '01711223344',
          finalAmount: amountToPay
        })
      });

      if (res.ok) {
        alert(`🎉 Payment of ৳${amountToPay} Successful! Service has been finalized. Please leave a review for your technician.`);
        const b = completePayBooking;
        setCompletePayBooking(null);
        if (onStatusChange) onStatusChange(b.id, 'COMPLETED');
        if (onOpenReviewModal) onOpenReviewModal(b);
      } else {
        alert("Payment processing failed.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingFinalPay(false);
    }
  };

  // Categorize bookings
  const activeBookings = bookings.filter(b => 
    ['PENDING', 'NEGOTIATING', 'AWAITING_ADVANCE', 'ACCEPTED', 'CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED', 'COUNTERED'].includes(b.status)
  );
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');
  const upcomingBookings = bookings.filter(b => ['PENDING', 'NEGOTIATING', 'AWAITING_ADVANCE', 'ACCEPTED', 'CONFIRMED', 'COUNTERED'].includes(b.status));

  const getFilteredList = () => {
    switch (filterTab) {
      case 'active': return activeBookings;
      case 'upcoming': return upcomingBookings;
      case 'completed': return completedBookings;
      case 'cancelled': return cancelledBookings;
      default: return bookings;
    }
  };

  const currentList = getFilteredList();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> Pending Response</span>;
      case 'NEGOTIATING':
        return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}><RotateCcw size={12} /> Price Negotiating</span>;
      case 'AWAITING_ADVANCE':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-gold)', border: '1px solid rgba(245, 158, 11, 0.4)' }}><DollarSign size={12} /> Advance Payment Required</span>;
      case 'ACCEPTED':
      case 'CONFIRMED':
        return <span className="badge badge-verified"><CheckCircle2 size={12} /> Confirmed</span>;
      case 'ON_THE_WAY':
        return <span className="badge badge-blue"><Navigation size={12} /> Technician On The Way</span>;
      case 'ARRIVED':
        return <span className="badge badge-gold"><MapPin size={12} /> Technician Arrived</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-gold"><Sparkles size={12} /> Service In Progress</span>;
      case 'COMPLETION_REQUESTED':
        return <span className="badge badge-verified"><CheckCircle2 size={12} /> Service Finished (Pay)</span>;
      case 'COMPLETED':
      case 'PAID':
        return <span className="badge badge-verified"><CheckCircle2 size={12} /> Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const getStepProgress = (status, advancePaid) => {
    switch (status) {
      case 'PENDING':
      case 'NEGOTIATING':
      case 'COUNTERED':
      case 'AWAITING_ADVANCE':
        return 1;
      case 'ACCEPTED':
      case 'CONFIRMED':
        return advancePaid ? 2 : 1;
      case 'ON_THE_WAY': return 3;
      case 'ARRIVED': return 4;
      case 'IN_PROGRESS': return 5;
      case 'COMPLETION_REQUESTED':
      case 'COMPLETED':
      case 'PAID': return 6;
      default: return 1;
    }
  };

  return (
    <div className="customer-bookings-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <Calendar size={24} color="var(--primary)" />
            My Service Bookings
          </h2>
          <p className="section-subtitle">
            Track live dispatch status, base advance payments, distance countdown timers, and instant completion.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => onNavigateTab('find-services')}>
          + Book New Service
        </button>
      </div>

      {/* Booking Filter Tabs */}
      <div className="sub-tab-pills">
        <button className={`sub-tab-pill ${filterTab === 'active' ? 'active' : ''}`} onClick={() => setFilterTab('active')}>
          Active ({activeBookings.length})
        </button>
        <button className={`sub-tab-pill ${filterTab === 'upcoming' ? 'active' : ''}`} onClick={() => setFilterTab('upcoming')}>
          Upcoming ({upcomingBookings.length})
        </button>
        <button className={`sub-tab-pill ${filterTab === 'completed' ? 'active' : ''}`} onClick={() => setFilterTab('completed')}>
          Completed ({completedBookings.length})
        </button>
        <button className={`sub-tab-pill ${filterTab === 'cancelled' ? 'active' : ''}`} onClick={() => setFilterTab('cancelled')}>
          Cancelled ({cancelledBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-list-wrapper">
        {currentList.length === 0 ? (
          <div className="glass-card empty-state-box">
            <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No {filterTab} bookings found</h3>
            <p>You don't have any bookings in this status right now.</p>
            {filterTab === 'active' && (
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => onNavigateTab('find-services')}>
                Find & Book Verified Technicians
              </button>
            )}
          </div>
        ) : (
          currentList.map((b) => {
            const stepNum = getStepProgress(b.status, b.advancePaid);
            const isReviewed = reviews.some(r => r.bookingId === b.id) || b.reviewRating;
            const isAdvanceNeeded = (b.status === 'AWAITING_ADVANCE' || b.status === 'ACCEPTED') && !b.advancePaid;
            const isConfirmedOrActive = ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status) && b.advancePaid;
            const currentPrice = (b.status === 'NEGOTIATING' || b.status === 'COUNTERED' || b.status === 'PENDING')
              ? (b.lastOfferedBy === 'WORKER' 
                  ? (b.workerCounterPrice || b.estimatedCost || b.agreedCost) 
                  : (b.customerOfferPrice || b.estimatedCost || b.agreedCost))
              : (b.agreedCost || b.estimatedCost || b.workerCounterPrice || b.customerOfferPrice);
            const isWorkerCounterOffer = (b.status === 'NEGOTIATING' || b.status === 'COUNTERED') && (b.lastOfferedBy === 'WORKER' || (!b.lastOfferedBy && b.workerCounterPrice));
            const counterPriceDisplay = b.workerCounterPrice || currentPrice;

            return (
              <div key={b.id} className="glass-card booking-card">
                {/* Booking Header */}
                <div className="booking-card-top">
                  <div className="booking-title-block">
                    <div className="booking-service-badge-row">
                      <span className="booking-id-tag">#BK-{b.id}</span>
                      {getStatusBadge(b.status)}
                    </div>
                    <h3 className="booking-service-name">{b.serviceType}</h3>
                    <div className="booking-technician-info">
                      <img 
                        src={b.worker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150"} 
                        alt={b.worker?.name || "Technician"} 
                        className="booking-worker-thumb"
                      />
                      <div>
                        <strong>{b.worker?.name || "Assigned Technician"}</strong>
                        <div className="booking-worker-meta">
                          <span>Phone: {b.worker?.phone || '01911223344'}</span> • 
                          <span> NID Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="booking-price-block">
                    <div className="booking-price-label">{b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'COMPLETED' ? 'Agreed Deal' : 'Current Price'}</div>
                    <div className="booking-price-val">৳{currentPrice}</div>
                    <span className="booking-date-tag">
                      <Clock size={13} /> {b.scheduledTime ? new Date(b.scheduledTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Scheduled for today'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '0.2rem', display: 'block' }}>
                      Base Advance: <strong>৳{b.basePrice || 300}</strong> (+5% VAT)
                    </span>
                  </div>
                </div>

                {/* Job Description & Photos */}
                <div className="booking-details-grid">
                  <div className="booking-desc-box">
                    <span className="desc-label">Problem & Requirements:</span>
                    <p className="desc-text">{b.description || 'Routine diagnostics and service maintenance requested.'}</p>
                    {b.address && (
                      <div className="booking-location-note">
                        <MapPin size={14} color="var(--primary)" />
                        <span>Service Location: <strong>{b.address}</strong></span>
                      </div>
                    )}
                  </div>

                  {b.beforePhoto && (
                    <div className="booking-photo-box">
                      <span className="desc-label">Diagnostic Attached Image:</span>
                      <img src={b.beforePhoto} alt="Issue inspection" className="booking-attached-photo" />
                    </div>
                  )}
                </div>

                {/* Direct Communication Bar (Unlocked after confirmation / advance payment) */}
                {isConfirmedOrActive && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-heading)' }}>
                        Booking Confirmed with Technician <strong>{b.worker?.name}</strong>. Direct Contact Unlocked:
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <a 
                        href={`tel:${b.worker?.phone || '01911223344'}`} 
                        className="btn btn-primary" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem', textDecoration: 'none' }}
                      >
                        <Phone size={13} /> Call {b.worker?.phone || '01911223344'}
                      </a>
                      <button 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                        onClick={() => alert(`Connecting live chat with technician ${b.worker?.name}...`)}
                      >
                        <MessageSquare size={13} /> Chat Live
                      </button>
                    </div>
                  </div>
                )}

                {/* 6-Stage Booking Lifecycle Progress Tracker */}
                {b.status !== 'CANCELLED' && (
                  <div className="lifecycle-tracker">
                    <div className="lifecycle-steps">
                      <div className={`lifecycle-step ${stepNum >= 1 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 1 ? <CheckCircle2 size={14} /> : '1'}</div>
                        <div className="step-label">Requested</div>
                      </div>
                      <div className={`lifecycle-step ${stepNum >= 2 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 2 ? <CheckCircle2 size={14} /> : '2'}</div>
                        <div className="step-label">Confirmed</div>
                      </div>
                      <div className={`lifecycle-step ${stepNum >= 3 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 3 ? <CheckCircle2 size={14} /> : '3'}</div>
                        <div className="step-label">On The Way</div>
                      </div>
                      <div className={`lifecycle-step ${stepNum >= 4 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 4 ? <CheckCircle2 size={14} /> : '4'}</div>
                        <div className="step-label">Arrived</div>
                      </div>
                      <div className={`lifecycle-step ${stepNum >= 5 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 5 ? <CheckCircle2 size={14} /> : '5'}</div>
                        <div className="step-label">In Progress</div>
                      </div>
                      <div className={`lifecycle-step ${stepNum >= 6 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum >= 6 ? <CheckCircle2 size={14} /> : '6'}</div>
                        <div className="step-label">Completed</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Counter Offer Notification Box (Technician proposed a counter price) */}
                {isWorkerCounterOffer && (
                  <div className="counter-offer-banner">
                    <div className="counter-title">
                      <AlertCircle size={18} color="var(--accent-gold)" />
                      <span>Technician Proposed Counter-Offer: ৳{counterPriceDisplay}</span>
                    </div>
                    <p className="counter-text">
                      Technician <strong>{b.worker?.name}</strong> proposed an updated estimate of <strong>৳{counterPriceDisplay}</strong>.
                      Accept this amount to proceed to advance payment, counter with a revised offer, or cancel.
                    </p>
                    <div className="counter-actions">
                      <button 
                        className="btn btn-primary" 
                        onClick={async () => {
                          try {
                            await fetch(`${API_BASE}/bookings/${b.id}/accept-price?acceptedBy=CUSTOMER`, { method: 'PUT' });
                          } catch (e) {}
                          if (onAcceptCounterOffer) onAcceptCounterOffer(b.id, counterPriceDisplay);
                          setAdvanceModalBooking({ ...b, agreedCost: counterPriceDisplay, estimatedCost: counterPriceDisplay });
                        }}
                      >
                        <Check size={14} /> Accept Offer (৳{counterPriceDisplay}) & Pay Advance
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setCounterModalBooking(b);
                          setCustomCounterPrice(counterPriceDisplay);
                        }}
                      >
                        <RotateCcw size={14} /> Propose Counter Offer
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => onStatusChange(b.id, 'CANCELLED')}
                      >
                        Reject & Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Mandatory Minimum Advance Payment Box */}
                {isAdvanceNeeded && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '1.2rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                          <DollarSign size={18} /> Minimum Advance Booking Payment Required
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
                          Technician accepted your booking! To confirm dispatch and lock schedule, please pay the technician's minimum base price advance of <strong>৳{b.basePrice || 300}</strong> (+ 5% SkillVerse VAT ৳{((b.basePrice || 300) * 0.05).toFixed(1)}).
                        </p>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                        onClick={() => setAdvanceModalBooking(b)}
                      >
                        <CreditCard size={15} /> Pay Advance (৳{((b.basePrice || 300) * 1.05).toFixed(1)}) →
                      </button>
                    </div>
                  </div>
                )}

                {/* Distance-Based Arrival Countdown Timer (Active during CONFIRMED & ON_THE_WAY) */}
                {['CONFIRMED', 'ON_THE_WAY'].includes(b.status) && b.advancePaid && (
                  <ArrivalCountdownTimer booking={b} onTimeoutRefund={handleTimeoutRefund} />
                )}

                {/* Start OTP code display (For customer to give to worker upon arrival) */}
                {['CONFIRMED', 'ON_THE_WAY', 'ARRIVED'].includes(b.status) && b.advancePaid && (
                  <div className="safety-verification-panel" style={{ marginTop: '1rem' }}>
                    <div className="safety-header">
                      <ShieldCheck size={18} color="var(--primary)" />
                      <span>On-Site Safety Arrival Verification</span>
                    </div>

                    <div style={{ background: 'var(--primary-subtle)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #bfdbfe', marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                          🔑 Your Arrival Start OTP Code
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          When technician arrives at your door, share this 4-digit code to start the service:
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          fontSize: '1.6rem',
                          fontWeight: '800',
                          fontFamily: 'monospace',
                          color: '#1d4ed8',
                          background: 'var(--bg-card)',
                          padding: '0.4rem 1.25rem',
                          borderRadius: '8px',
                          border: '2px solid #2563eb',
                          letterSpacing: '0.25rem',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
                        }}>
                          {b.startVerificationCode || '4829'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service in Progress & Direct Instant Final Payment (NO OTP NEEDED) */}
                {['IN_PROGRESS', 'COMPLETION_REQUESTED'].includes(b.status) && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.35)', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
                          <Sparkles size={18} /> Service Complete — Direct Final Payment (No OTP Needed)
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                          Inspect the technician's completed work. You can adjust the final amount (more or less than agreed) and finalize payment instantly.
                        </p>
                      </div>

                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.65rem 1.3rem', fontSize: '0.9rem', background: 'linear-gradient(90deg, #10b981, #059669)' }}
                        onClick={() => {
                          setCompletePayBooking(b);
                          setCustomFinalAmount(b.agreedCost ? (b.agreedCost - (b.advancePaidAmount || 0)) : (b.estimatedCost || 1000));
                        }}
                      >
                        <CreditCard size={15} /> Complete & Pay Now (৳{b.agreedCost || b.estimatedCost})
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed Actions (Review / Invoices) */}
                {['COMPLETED', 'PAID'].includes(b.status) && (
                  <div className="completed-card-footer" style={{ marginTop: '1rem' }}>
                    <div className="completed-tag-text">
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span>Service finalized & paid under 30-day SkillVerse Guarantee.</span>
                    </div>

                    <div className="completed-action-btns">
                      {!isReviewed ? (
                        <button className="btn btn-primary" onClick={() => onOpenReviewModal(b)}>
                          <Sparkles size={15} /> Rate & Review Technician
                        </button>
                      ) : (
                        <span className="badge badge-verified">
                          <CheckCircle2 size={12} /> Review Submitted
                        </span>
                      )}
                      <button className="btn btn-secondary" onClick={() => onNavigateTab('history')}>
                        <FileCheck size={15} /> View Service History & Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- ADVANCE PAYMENT MODAL (Mobile Number based, instant) --- */}
      {advanceModalBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setAdvanceModalBooking(null)}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--primary)" /> Pay Minimum Base Advance
              </h3>
              <button onClick={() => setAdvanceModalBooking(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Confirm your booking with <strong>{advanceModalBooking.worker?.name}</strong> for <em>{advanceModalBooking.serviceType}</em>.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Worker Base Price (Advance):</span>
                <strong style={{ color: 'var(--text-heading)' }}>৳{advanceModalBooking.basePrice || 300}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SkillVerse Platform VAT (5%):</span>
                <strong style={{ color: 'var(--accent-gold)' }}>+৳{((advanceModalBooking.basePrice || 300) * 0.05).toFixed(1)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem', fontSize: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-heading)' }}>Total Payable Advance:</span>
                <strong style={{ color: 'var(--primary)' }}>৳{((advanceModalBooking.basePrice || 300) * 1.05).toFixed(1)}</strong>
              </div>
            </div>

            <form onSubmit={handlePayAdvanceSubmit}>
              {/* Payment Method Selector */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Select Mobile Wallet / Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.3rem' }}>
                  {['bKash', 'Nagad', 'Rocket', 'Card'].map(method => (
                    <button
                      key={method}
                      type="button"
                      className={`btn ${advancePaymentMethod === method ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.45rem 0.3rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      onClick={() => setAdvancePaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Number Input */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>{advancePaymentMethod} Mobile Account Number</label>
                <div style={{ position: 'relative', marginTop: '0.3rem' }}>
                  <Smartphone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 01711223344"
                    style={{ paddingLeft: '2.2rem' }}
                    value={advanceMobileNumber}
                    onChange={(e) => setAdvanceMobileNumber(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  Simulated gateway: Click to confirm and process instant payment.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAdvanceModalBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPayingAdvance} style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}>
                  {isPayingAdvance ? 'Processing...' : `Pay ৳${((advanceModalBooking.basePrice || 300) * 1.05).toFixed(1)} & Confirm`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CUSTOM COUNTER MODAL (Customer side) --- */}
      {counterModalBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setCounterModalBooking(null)}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={18} color="var(--accent-gold)" /> Propose Counter Offer
              </h3>
              <button onClick={() => setCounterModalBooking(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleCustomCounterSubmit}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Your Proposed Price (BDT ৳)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  className="form-input"
                  style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                  value={customCounterPrice}
                  onChange={(e) => setCustomCounterPrice(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCounterModalBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Counter Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COMPLETE & FINAL PAYMENT MODAL (Adjustable amount, no completion OTP needed) --- */}
      {completePayBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setCompletePayBooking(null)}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} color="var(--primary)" /> Complete & Pay Final Amount
              </h3>
              <button onClick={() => setCompletePayBooking(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Pay technician <strong>{completePayBooking.worker?.name}</strong> for <em>{completePayBooking.serviceType}</em>. You may adjust the final payable amount below.
            </p>

            <form onSubmit={handleFinalPaymentSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Final Settlement Amount (BDT ৳)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  className="form-input"
                  style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}
                  value={customFinalAmount}
                  onChange={(e) => setCustomFinalAmount(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Initial agreed deal: ৳{completePayBooking.agreedCost || completePayBooking.estimatedCost} {completePayBooking.advancePaidAmount ? `(৳${completePayBooking.advancePaidAmount} advance already paid)` : ''}
                </span>
              </div>

              {/* Payment Channel */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.3rem' }}>
                  {['bKash', 'Nagad', 'Rocket', 'Card'].map(method => (
                    <button
                      key={method}
                      type="button"
                      className={`btn ${finalPaymentMethod === method ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.4rem 0.2rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      onClick={() => setFinalPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Number */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>{finalPaymentMethod} Mobile Account Number</label>
                <div style={{ position: 'relative', marginTop: '0.3rem' }}>
                  <Smartphone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 01711223344"
                    style={{ paddingLeft: '2.2rem' }}
                    value={finalMobileNumber}
                    onChange={(e) => setFinalMobileNumber(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCompletePayBooking(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isProcessingFinalPay} style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}>
                  {isProcessingFinalPay ? 'Processing...' : `Confirm & Pay ৳${customFinalAmount || completePayBooking.agreedCost}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
