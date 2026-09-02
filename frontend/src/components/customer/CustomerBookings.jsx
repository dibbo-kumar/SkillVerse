import React, { useState } from 'react';
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
  Key
} from 'lucide-react';

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

  const handleVerifyCustomerCompletionOtp = (booking) => {
    const entered = (customerOtpInputs[`complete-${booking.id}`] || '').trim();
    const expected = booking.completionVerificationCode || '9143';
    if (!entered) {
      setCustomerOtpErrors(prev => ({ ...prev, [`complete-${booking.id}`]: 'Please enter the 4-digit Completion OTP.' }));
      return;
    }
    if (entered !== expected) {
      setCustomerOtpErrors(prev => ({ ...prev, [`complete-${booking.id}`]: `❌ Wrong OTP! Provided code "${entered}" does not match Completion OTP (${expected}).` }));
      return;
    }
    setCustomerOtpErrors(prev => ({ ...prev, [`complete-${booking.id}`]: '' }));
    setCustomerOtpInputs(prev => ({ ...prev, [`complete-${booking.id}`]: '' }));
    alert(`🎉 Completion OTP Verified! Authorizing final service payment...`);
    onStartPayment(booking);
  };

  // Categorize bookings
  const activeBookings = bookings.filter(b => 
    ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COUNTERED'].includes(b.status)
  );
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');
  const upcomingBookings = bookings.filter(b => ['PENDING', 'ACCEPTED', 'COUNTERED'].includes(b.status));

  const getFilteredList = () => {
    switch (filterTab) {
      case 'active':
        return activeBookings;
      case 'upcoming':
        return upcomingBookings;
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return bookings;
    }
  };

  const currentList = getFilteredList();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> Pending Acceptance</span>;
      case 'ACCEPTED':
        return <span className="badge badge-blue"><CheckCircle2 size={12} /> Technician Confirmed</span>;
      case 'ON_THE_WAY':
        return <span className="badge badge-blue"><Navigation size={12} /> Technician On The Way</span>;
      case 'ARRIVED':
        return <span className="badge badge-gold"><MapPin size={12} /> Technician Arrived</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-gold"><Sparkles size={12} /> Service In Progress</span>;
      case 'COMPLETED':
        return <span className="badge badge-verified"><CheckCircle2 size={12} /> Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger"><XCircle size={12} /> Cancelled</span>;
      case 'COUNTERED':
        return <span className="badge badge-warning"><AlertCircle size={12} /> Counter Offered</span>;
      default:
        return <span className="badge badge-pending">{status}</span>;
    }
  };

  const getStepProgress = (status) => {
    // 1: Pending, 2: Accepted, 3: On the Way, 4: Arrived, 5: In Progress, 6: Completed
    switch (status) {
      case 'PENDING': return 1;
      case 'ACCEPTED': return 2;
      case 'ON_THE_WAY': return 3;
      case 'ARRIVED': return 4;
      case 'IN_PROGRESS': return 5;
      case 'COMPLETED': return 6;
      case 'COUNTERED': return 1;
      case 'CANCELLED': return 0;
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
            Track live dispatch status, safety verification OTPs, and job milestones in real time.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => onNavigateTab('find-services')}>
          + Book New Service
        </button>
      </div>

      {/* Booking Filter Tabs */}
      <div className="sub-tab-pills">
        <button 
          className={`sub-tab-pill ${filterTab === 'active' ? 'active' : ''}`}
          onClick={() => setFilterTab('active')}
        >
          Active ({activeBookings.length})
        </button>
        <button 
          className={`sub-tab-pill ${filterTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilterTab('upcoming')}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button 
          className={`sub-tab-pill ${filterTab === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterTab('completed')}
        >
          Completed ({completedBookings.length})
        </button>
        <button 
          className={`sub-tab-pill ${filterTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterTab('cancelled')}
        >
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
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem' }}
                onClick={() => onNavigateTab('find-services')}
              >
                Find & Book Verified Technicians
              </button>
            )}
          </div>
        ) : (
          currentList.map((b) => {
            const stepNum = getStepProgress(b.status);
            const isReviewed = reviews.some(r => r.bookingId === b.id);

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
                    <div className="booking-price-label">Agreed Cost</div>
                    <div className="booking-price-val">৳{b.estimatedCost}</div>
                    <span className="booking-date-tag">
                      <Clock size={13} /> {b.scheduledTime ? new Date(b.scheduledTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Scheduled for today'}
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
                      <span className="desc-label">Diagnostic Image:</span>
                      <img src={b.beforePhoto} alt="Issue inspection" className="booking-attached-photo" />
                    </div>
                  )}
                </div>

                {/* 6-Stage Booking Lifecycle Progress Tracker */}
                {b.status !== 'CANCELLED' && (
                  <div className="lifecycle-tracker">
                    <div className="lifecycle-steps">
                      {/* Step 1: Pending */}
                      <div className={`lifecycle-step ${stepNum >= 1 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 1 ? <CheckCircle2 size={14} /> : '1'}</div>
                        <div className="step-label">Pending</div>
                      </div>

                      {/* Step 2: Accepted */}
                      <div className={`lifecycle-step ${stepNum >= 2 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 2 ? <CheckCircle2 size={14} /> : '2'}</div>
                        <div className="step-label">Accepted</div>
                      </div>

                      {/* Step 3: On The Way */}
                      <div className={`lifecycle-step ${stepNum >= 3 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 3 ? <CheckCircle2 size={14} /> : '3'}</div>
                        <div className="step-label">On The Way</div>
                      </div>

                      {/* Step 4: Arrived */}
                      <div className={`lifecycle-step ${stepNum >= 4 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 4 ? <CheckCircle2 size={14} /> : '4'}</div>
                        <div className="step-label">Arrived</div>
                      </div>

                      {/* Step 5: Service Started */}
                      <div className={`lifecycle-step ${stepNum >= 5 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum > 5 ? <CheckCircle2 size={14} /> : '5'}</div>
                        <div className="step-label">In Progress</div>
                      </div>

                      {/* Step 6: Completed */}
                      <div className={`lifecycle-step ${stepNum >= 6 ? 'completed' : ''}`}>
                        <div className="step-circle">{stepNum >= 6 ? <CheckCircle2 size={14} /> : '6'}</div>
                        <div className="step-label">Completed</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Counter Offer Notification Box */}
                {b.status === 'COUNTERED' && (
                  <div className="counter-offer-banner">
                    <div className="counter-title">
                      <AlertCircle size={18} color="var(--accent-gold)" />
                      <span>Technician Counter-Offer Received</span>
                    </div>
                    <p className="counter-text">
                      The technician reviewed the scope of work and proposed an updated estimate of <strong>৳{b.estimatedCost}</strong>.
                    </p>
                    <div className="counter-actions">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => onAcceptCounterOffer(b.id, b.estimatedCost)}
                      >
                        Accept Counter Offer (৳{b.estimatedCost})
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => onStatusChange(b.id, 'CANCELLED')}
                      >
                        Reject & Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Safety Verification & Customer OTP Verification Panel */}
                {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status) && (
                  <div className="safety-verification-panel">
                    <div className="safety-header">
                      <ShieldCheck size={18} color="var(--primary)" />
                      <span>Live Dispatch & Customer OTP Verification</span>
                    </div>

                    <div className="safety-grid">
                      <div className="safety-item">
                        <span className="safety-label">Live Dispatch Coordinates:</span>
                        <div className="safety-val">
                          <MapPin size={13} color="var(--primary)" /> Dhaka Sector 12 ({b.liveLocation || '23.8103, 90.4125'})
                        </div>
                      </div>

                      <div className="safety-item">
                        <span className="safety-label">Service Worker Status:</span>
                        <div className="safety-val" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                          {b.status === 'ACCEPTED' && '⏳ Technician Confirmed Booking'}
                          {b.status === 'ON_THE_WAY' && '🚗 Technician On The Way'}
                          {b.status === 'ARRIVED' && '📍 Technician Arrived at Doorstep'}
                          {b.status === 'IN_PROGRESS' && '⚡ Service In Progress'}
                        </div>
                      </div>
                    </div>

                    {/* CUSTOMER START OTP VERIFICATION BOX */}
                    {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED'].includes(b.status) && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)', marginTop: '1rem' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Key size={16} /> Customer OTP Verification — Start Service
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                          Technician arrival Start OTP code: <strong style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', fontFamily: 'monospace' }}>{b.startVerificationCode || '4829'}</strong>. Enter code below on customer side to verify arrival & begin service:
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ width: '160px', fontFamily: 'monospace', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.3em', padding: '0.5rem' }}
                            placeholder="Enter OTP"
                            maxLength={6}
                            value={customerOtpInputs[`start-${b.id}`] || ''}
                            onChange={e => setCustomerOtpInputs({ ...customerOtpInputs, [`start-${b.id}`]: e.target.value })}
                          />
                          <button className="btn btn-primary" onClick={() => handleVerifyCustomerStartOtp(b)}>
                            <CheckCircle2 size={15} /> Verify Start OTP & Begin Job
                          </button>
                        </div>
                        {customerOtpErrors[`start-${b.id}`] && (
                          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                            {customerOtpErrors[`start-${b.id}`]}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CUSTOMER COMPLETION OTP VERIFICATION BOX */}
                    {b.status === 'IN_PROGRESS' && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', marginTop: '1rem' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ShieldCheck size={16} /> Customer OTP Verification — Confirm Job Completion
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                          Service Completion OTP code: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem', fontFamily: 'monospace' }}>{b.completionVerificationCode || '9143'}</strong>. When satisfied with the technician's work, enter code below to verify completion & proceed to payment:
                        </p>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ width: '160px', fontFamily: 'monospace', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.3em', padding: '0.5rem' }}
                            placeholder="Enter OTP"
                            maxLength={6}
                            value={customerOtpInputs[`complete-${b.id}`] || ''}
                            onChange={e => setCustomerOtpInputs({ ...customerOtpInputs, [`complete-${b.id}`]: e.target.value })}
                          />
                          <button className="btn btn-primary" onClick={() => handleVerifyCustomerCompletionOtp(b)}>
                            <CheckCircle2 size={15} /> Verify Completion OTP & Pay (৳{b.estimatedCost})
                          </button>
                        </div>
                        {customerOtpErrors[`complete-${b.id}`] && (
                          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
                            {customerOtpErrors[`complete-${b.id}`]}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="safety-action-row" style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => onShopPartsForBooking && onShopPartsForBooking(b)}>
                        <ShoppingBag size={15} /> Shop Parts for This Service
                      </button>
                      <button className="btn btn-secondary" onClick={() => onStatusChange(b.id, 'CANCELLED')}>
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed Actions (Review / Invoices) */}
                {b.status === 'COMPLETED' && (
                  <div className="completed-card-footer">
                    <div className="completed-tag-text">
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span>Service successfully completed & verified under 30-day FixConnect Warranty.</span>
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
    </div>
  );
}
