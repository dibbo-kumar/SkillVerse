import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, AlertCircle,
  TrendingUp, Award, User, Phone, Wrench, Search, Filter, ArrowRight,
  Sparkles, DollarSign, FileText, ChevronRight, Download, Heart, Star,
  XCircle, PlayCircle, Lock, RefreshCw, KeyRound, Smartphone, CreditCard, Eye, RotateCcw
} from 'lucide-react';
import BookingDetailsModal from './BookingDetailsModal';

const API_BASE = "http://localhost:8081/api";

export default function MyBookingsHub({ currentUser, onShowToast, onNavigateToWorkerProfile }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'history', 'saved-technicians'
  const [bookings, setBookings] = useState([]);
  const [problemPosts, setProblemPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Filter for 'bookings' tab (Removed 'ACTIVE' per user instruction)
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Booking Details Modal State
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Selected Booking Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BKASH');
  const [paymentTxId, setPaymentTxId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Completion OTP Modal
  const [showCompletionOtpModal, setShowCompletionOtpModal] = useState(false);
  const [completionOtpInput, setCompletionOtpInput] = useState('');

  // Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);

  // Saved Technicians state
  const [savedWorkers, setSavedWorkers] = useState([]);

  useEffect(() => {
    fetchCustomerData();
  }, [currentUser?.id]);

  const fetchCustomerData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      // 1. Fetch Bookings
      const resBookings = await fetch(`${API_BASE}/bookings/customer/${currentUser.id}`);
      if (resBookings.ok) {
        const dataB = await resBookings.json();
        setBookings(dataB);
      }

      // 2. Fetch Posted Problems
      const resProblems = await fetch(`${API_BASE}/problems/customer/${currentUser.id}`);
      if (resProblems.ok) {
        const dataP = await resProblems.json();
        setProblemPosts(dataP);
      }

      // 3. Fetch Saved Technicians from localStorage
      const savedIds = JSON.parse(localStorage.getItem('skillverse_saved_technicians') || '[]');
      if (savedIds.length > 0) {
        const resW = await fetch(`${API_BASE}/workers`);
        if (resW.ok) {
          const allW = await resW.json();
          setSavedWorkers(allW.filter(w => savedIds.includes(w.user?.id || w.id)));
        }
      }
    } catch (err) {
      console.error("Failed to load customer bookings data:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenDetails = (b) => {
    setDetailsBooking(b);
    setShowDetailsModal(true);
  };

  const handleAcceptPrice = async (bId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/accept-price?acceptedBy=CUSTOMER`, { method: 'PUT' });
      if (res.ok) {
        fetchCustomerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error || "Failed to accept price", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCounterOffer = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !counterPrice) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${selectedBooking.id}/counter-offer?price=${counterPrice}&offeredBy=CUSTOMER`, { method: 'PUT' });
      if (res.ok) {
        setShowCounterModal(false);
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (bId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/cancel?reason=CustomerRequested`, { method: 'PUT' });
      if (res.ok) {
        fetchCustomerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error || "Cannot cancel booking", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyCompletionOtp = async (e) => {
    e.preventDefault();
    if (!selectedBooking || !completionOtpInput) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${selectedBooking.id}/verify-completion-otp?otp=${completionOtpInput}`, { method: 'PUT' });
      if (res.ok) {
        setShowCompletionOtpModal(false);
        setCompletionOtpInput('');
        fetchCustomerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error || "Invalid Completion OTP", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!paymentBooking) return;
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${paymentBooking.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          transactionId: paymentTxId || `TXN-${paymentMethod}-${Date.now().toString().slice(-6)}`
        })
      });

      if (res.ok) {
        if (onShowToast) onShowToast("Payment Successful!", "Payment processed and receipt saved.", "success");
        setShowPaymentModal(false);
        fetchCustomerData();
      } else {
        if (onShowToast) onShowToast("Payment Failed", "Could not process transaction", "error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${reviewBooking.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: rating, comment: reviewComment })
      });

      if (res.ok) {
        if (onShowToast) onShowToast("Review Submitted", "Thank you for rating your technician!", "success");
        setShowReviewModal(false);
        setReviewComment('');
        fetchCustomerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Bookings by tab selection (No 'ACTIVE' tab per prompt instructions)
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return b.status === 'PENDING';
    if (statusFilter === 'NEGOTIATING') return b.status === 'NEGOTIATING';
    if (statusFilter === 'CONFIRMED') return ['CONFIRMED', 'PRICE_AGREED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED'].includes(b.status);
    if (statusFilter === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'PAID';
    if (statusFilter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const activeBooking = bookings.find((b) => ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED'].includes(b.status));
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAID').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>MY BOOKINGS</h1>
            <span className="badge badge-verified">Customer Service Center</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>Track active services, negotiate prices, manage OTPs, and view detailed invoices</p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Bookings List
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Service History & Invoices
          </button>
          <button
            onClick={() => setActiveTab('saved-technicians')}
            className={`btn ${activeTab === 'saved-technicians' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Saved Technicians
          </button>
        </div>
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Interactive Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
            <div
              className="glass-card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => { setStatusFilter('CONFIRMED'); setActiveTab('bookings'); }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Job</span>
                <h3 style={{ fontSize: '1.8rem', color: '#ffffff', margin: '0.2rem 0 0 0' }}>{activeBooking ? 1 : 0}</h3>
              </div>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-blue)' }}>
                <Wrench size={24} />
              </div>
            </div>

            <div
              className="glass-card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => { setStatusFilter('PENDING'); setActiveTab('bookings'); }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Requests</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', margin: '0.2rem 0 0 0' }}>
                  {bookings.filter(b => b.status === 'PENDING' || b.status === 'NEGOTIATING').length}
                </h3>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-gold)' }}>
                <Clock size={24} />
              </div>
            </div>

            <div
              className="glass-card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => { setStatusFilter('COMPLETED'); setActiveTab('bookings'); }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Completed Services</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: '0.2rem 0 0 0' }}>{completedCount}</h3>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.8rem', borderRadius: '12px', color: 'var(--primary)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Reward Points</span>
                <h3 style={{ fontSize: '1.8rem', color: '#818cf8', margin: '0.2rem 0 0 0' }}>{completedCount * 100 + 150}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gained from completed work</span>
              </div>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.8rem', borderRadius: '12px', color: '#818cf8' }}>
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Active Service Banner */}
          {activeBooking ? (
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.1))', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    {getStatusBadge(activeBooking.status)}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking #{activeBooking.id}</span>
                  </div>

                  <h2 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>{activeBooking.serviceType}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeBooking.description}</p>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                    <div>Technician: <strong>{activeBooking.worker?.name || 'Assigned Technician'}</strong></div>
                    <div>Location: <strong>{activeBooking.address}</strong></div>
                    <div>Agreed Price: <strong style={{ color: 'var(--primary)' }}>৳{activeBooking.agreedCost || activeBooking.estimatedCost}</strong></div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenDetails(activeBooking)}
                  style={{ padding: '0.7rem 1.2rem' }}
                >
                  View Event Details →
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Wrench size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>No Active Service In Progress</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>When you request a technician or post a problem, your active job status will appear here.</p>
            </div>
          )}

          {/* Recent Service Requests */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>Recent Service Requests</h3>
              <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.85rem' }}>View All →</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {bookings.slice(0, 5).map((b) => {
                const isWorkerCounter = (b.status === 'NEGOTIATING' || b.status === 'PENDING') && b.lastOfferedBy === 'WORKER';
                const isCustomerWaiting = (b.status === 'PENDING' || b.status === 'NEGOTIATING') && (b.lastOfferedBy === 'CUSTOMER' || !b.lastOfferedBy);
                const currentPrice = b.agreedCost || b.workerCounterPrice || b.customerOfferPrice || b.estimatedCost;

                return (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isWorkerCounter ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)',
                      padding: '1rem 1.2rem',
                      borderRadius: '12px',
                      border: isWorkerCounter ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    onClick={() => handleOpenDetails(b)}
                  >
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{b.serviceType}</strong>
                        {getStatusBadge(b.status)}
                        {isWorkerCounter && (
                          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                            ⚡ Technician Countered: ৳{currentPrice}
                          </span>
                        )}
                        {isCustomerWaiting && b.status === 'NEGOTIATING' && (
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.7rem' }}>
                            Waiting for Worker Response (Offer: ৳{currentPrice})
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem', marginBottom: 0 }}>
                        Technician: <strong style={{ color: '#ffffff' }}>{b.worker?.name || 'Searching...'}</strong> • 
                        Price: <strong style={{ color: 'var(--primary)' }}>৳{currentPrice}</strong> • 
                        Address: {b.address}
                      </p>
                    </div>

                    {/* Action buttons on the row */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                      {isWorkerCounter && (
                        <>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleAcceptPrice(b.id)}
                            title="Accept technician's price"
                          >
                            <CheckCircle2 size={13} /> Accept (৳{currentPrice})
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedBooking(b);
                              setCounterPrice(b.workerCounterPrice || b.estimatedCost || '');
                              setShowCounterModal(true);
                            }}
                            title="Counter with your offer"
                          >
                            <RotateCcw size={13} /> Counter
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            onClick={() => handleCancelBooking(b.id)}
                            title="Reject and cancel"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}

                      {isCustomerWaiting && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          <XCircle size={13} /> Cancel Request
                        </button>
                      )}

                      {b.status === 'COMPLETION_REQUESTED' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setSelectedBooking(b);
                            setShowCompletionOtpModal(true);
                          }}
                        >
                          <KeyRound size={13} /> Verify OTP
                        </button>
                      )}

                      {b.status === 'COMPLETED' && b.paymentStatus !== 'PAID' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(90deg, #10b981, #059669)' }}
                          onClick={() => {
                            setPaymentBooking(b);
                            setShowPaymentModal(true);
                          }}
                        >
                          <CreditCard size={13} /> Pay Now
                        </button>
                      )}

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => handleOpenDetails(b)}
                      >
                        <Eye size={13} /> Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* --- BOOKINGS TAB (ROW-WISE LIST VIEW) --- */}
      {activeTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Status Filter Pills (ALL, PENDING, NEGOTIATING, CONFIRMED, COMPLETED, CANCELLED) */}
          <div className="glass-card" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.8rem' }}>
            {['ALL', 'PENDING', 'NEGOTIATING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* ROW-WISE BOOKINGS TABLE / LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBookings.map((b) => {
              const isWorkerCounter = (b.status === 'NEGOTIATING' || b.status === 'PENDING') && b.lastOfferedBy === 'WORKER';
              const isCustomerWaiting = (b.status === 'PENDING' || b.status === 'NEGOTIATING') && (b.lastOfferedBy === 'CUSTOMER' || !b.lastOfferedBy);
              const currentPrice = b.agreedCost || b.workerCounterPrice || b.customerOfferPrice || b.estimatedCost;

              return (
                <div
                  key={b.id}
                  className="glass-card"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr 1.8fr 1.3fr 1fr 1.8fr',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.2rem',
                    borderRadius: '14px',
                    border: isWorkerCounter ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                    background: isWorkerCounter ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onClick={() => handleOpenDetails(b)}
                >
                  {/* Column 1: ID & Status */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block' }}>#BK-{b.id}</span>
                    <div style={{ marginTop: '0.3rem' }}>{getStatusBadge(b.status)}</div>
                  </div>

                  {/* Column 2: Service & Problem Description */}
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>{b.serviceType}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', lineHeight: 1.3 }}>
                      {b.description.length > 50 ? `${b.description.slice(0, 50)}...` : b.description}
                    </p>
                    {isWorkerCounter && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginTop: '0.3rem' }}>
                        ⚡ Technician Counter Offer: ৳{currentPrice}
                      </div>
                    )}
                    {isCustomerWaiting && b.status === 'NEGOTIATING' && (
                      <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.3rem' }}>
                        Waiting for technician response (Your offer: ৳{currentPrice})
                      </div>
                    )}
                  </div>

                  {/* Column 3: Technician info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img
                      src={b.worker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100"}
                      alt={b.worker?.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block' }}>{b.worker?.name || 'Searching...'}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⭐ {b.worker?.rating || 4.9}</span>
                    </div>
                  </div>

                  {/* Column 4: Agreed Price / Offer */}
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                      {b.agreedCost ? 'Agreed Price' : 'Price Offer'}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: isWorkerCounter ? 'var(--accent-gold)' : 'var(--primary)' }}>
                      ৳{currentPrice}
                    </strong>
                  </div>

                  {/* Column 5: Actionable Buttons */}
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    {isWorkerCounter && (
                      <>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => handleAcceptPrice(b.id)}
                          title="Accept technician's counter price"
                        >
                          <CheckCircle2 size={13} /> Accept
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setSelectedBooking(b);
                            setCounterPrice(b.workerCounterPrice || b.estimatedCost || '');
                            setShowCounterModal(true);
                          }}
                          title="Counter with a different price"
                        >
                          <RotateCcw size={13} /> Counter
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleCancelBooking(b.id)}
                          title="Reject / Cancel request"
                        >
                          <XCircle size={13} />
                        </button>
                      </>
                    )}

                    {isCustomerWaiting && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => handleCancelBooking(b.id)}
                      >
                        <XCircle size={13} /> Cancel
                      </button>
                    )}

                    {b.status === 'COMPLETION_REQUESTED' && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedBooking(b);
                          setShowCompletionOtpModal(true);
                        }}
                      >
                        <KeyRound size={13} /> OTP
                      </button>
                    )}

                    {b.status === 'COMPLETED' && b.paymentStatus !== 'PAID' && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'linear-gradient(90deg, #10b981, #059669)' }}
                        onClick={() => {
                          setPaymentBooking(b);
                          setShowPaymentModal(true);
                        }}
                      >
                        <CreditCard size={13} /> Pay
                      </button>
                    )}

                    {b.status === 'PAID' && (
                      <>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setReviewBooking(b);
                            setRating(b.reviewRating || 5);
                            setReviewComment(b.reviewComment || '');
                            setShowReviewModal(true);
                          }}
                        >
                          <Star size={13} /> Review
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setInvoiceBooking(b);
                            setShowInvoiceModal(true);
                          }}
                        >
                          <FileText size={13} />
                        </button>
                      </>
                    )}

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      onClick={() => handleOpenDetails(b)}
                      title="View full booking details"
                    >
                      <Eye size={13} /> Details
                    </button>
                  </div>

                </div>
              );
            })}

            {filteredBookings.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No service bookings found matching status filter "{statusFilter}".
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- SERVICE HISTORY & INVOICES TAB --- */}
      {activeTab === 'history' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Service History & Invoices</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {bookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID').map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>{b.serviceType}</strong>
                    {getStatusBadge(b.status)}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Technician: {b.worker?.name} • Paid Amount: <strong>৳{b.agreedCost || b.estimatedCost}</strong>
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      setInvoiceBooking(b);
                      setShowInvoiceModal(true);
                    }}
                  >
                    <FileText size={14} /> Receipt
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      setReviewBooking(b);
                      setRating(b.reviewRating || 5);
                      setReviewComment(b.reviewComment || '');
                      setShowReviewModal(true);
                    }}
                  >
                    <Star size={14} /> {b.reviewRating ? 'Update Review' : 'Review'}
                  </button>
                </div>
              </div>
            ))}

            {bookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID').length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No completed service records found.</p>
            )}
          </div>
        </div>
      )}

      {/* --- SAVED TECHNICIANS TAB --- */}
      {activeTab === 'saved-technicians' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Saved Technicians</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {savedWorkers.map((w) => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img
                    src={w.user?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100"}
                    alt={w.user?.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>{w.user?.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⭐ {w.user?.rating || 4.9} • {w.specialization}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => onNavigateToWorkerProfile && onNavigateToWorkerProfile(w.user?.id || w.id)}
                >
                  Book
                </button>
              </div>
            ))}
            {savedWorkers.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', gridColumn: 'span 2' }}>No saved technicians yet.</p>
            )}
          </div>
        </div>
      )}

      {/* --- BOOKING DETAILS MODAL --- */}
      <BookingDetailsModal
        booking={detailsBooking}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onAcceptPrice={handleAcceptPrice}
        onOpenCounterModal={(b) => {
          setSelectedBooking(b);
          setCounterPrice(b.workerCounterPrice || b.estimatedCost || '');
          setShowCounterModal(true);
        }}
        onCancelBooking={handleCancelBooking}
        onStartPayment={(b) => {
          setPaymentBooking(b);
          setShowPaymentModal(true);
        }}
        onOpenCompletionOtp={(b) => {
          setSelectedBooking(b);
          setShowCompletionOtpModal(true);
        }}
        onLeaveReview={(b) => {
          setReviewBooking(b);
          setRating(b.reviewRating || 5);
          setReviewComment(b.reviewComment || '');
          setShowReviewModal(true);
        }}
        onViewInvoice={(b) => {
          setInvoiceBooking(b);
          setShowInvoiceModal(true);
        }}
      />

      {/* --- COUNTER OFFER MODAL --- */}
      {showCounterModal && selectedBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowCounterModal(false)}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Propose Counter Offer</h3>
              </div>
              <button onClick={() => setShowCounterModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.4 }}>
              Propose a revised price to <strong>{selectedBooking.worker?.name || 'Technician'}</strong> for <em>{selectedBooking.serviceType}</em>.
            </p>

            <form onSubmit={handleCounterOffer}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Counter Offer (BDT ৳)</label>
                <div style={{ position: 'relative', marginTop: '0.3rem' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>৳</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    autoFocus
                    className="form-input"
                    style={{ width: '100%', padding: '0.7rem 0.8rem 0.7rem 2.2rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="e.g. 1100"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCounterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}>
                  Send Counter Offer →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COMPLETION OTP MODAL --- */}
      {showCompletionOtpModal && selectedBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowCompletionOtpModal(false)}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <KeyRound size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Verify Service Completion</h3>
              </div>
              <button onClick={() => setShowCompletionOtpModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              The technician has requested completion. Your 4-digit code is <strong>{selectedBooking.completionVerificationCode || '9143'}</strong>. Enter it here to confirm satisfaction:
            </p>

            <form onSubmit={handleVerifyCompletionOtp}>
              <div style={{ marginBottom: '1.2rem' }}>
                <input
                  type="text"
                  maxLength="4"
                  required
                  autoFocus
                  className="form-input"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.4rem', fontFamily: 'monospace' }}
                  value={completionOtpInput}
                  onChange={(e) => setCompletionOtpInput(e.target.value)}
                  placeholder="0000"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompletionOtpModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Completion ✔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && paymentBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowPaymentModal(false)}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Pay Service Bill</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Due</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>৳{paymentBooking.agreedCost || paymentBooking.estimatedCost}</strong>
              </div>
              <span className="badge badge-verified">{paymentBooking.serviceType}</span>
            </div>

            <form onSubmit={handleProcessPayment}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Gateway</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.3rem' }}>
                  {['BKASH', 'NAGAD', 'CASH'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`btn ${paymentMethod === pm ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'CASH' && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transaction ID</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '0.7rem' }}
                    value={paymentTxId}
                    onChange={(e) => setPaymentTxId(e.target.value)}
                    placeholder={`e.g. ${paymentMethod}-TXN-884920`}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isProcessingPayment} className="btn btn-primary" style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}>
                  {isProcessingPayment ? 'Processing...' : `Pay ৳${paymentBooking.agreedCost || paymentBooking.estimatedCost} ✔`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REVIEW MODAL --- */}
      {showReviewModal && reviewBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowReviewModal(false)}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Star size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Review Technician</h3>
              </div>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Rate your service experience with <strong>{reviewBooking.worker?.name || 'Technician'}</strong>.
            </p>

            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: '1.8rem', padding: '0.2rem' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{rating} out of 5 Stars</span>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Feedback Comment</label>
                <textarea
                  rows={3}
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Very professional, arrived on time and repaired effectively!"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Review ⭐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INVOICE MODAL --- */}
      {showInvoiceModal && invoiceBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>SERVICE INVOICE</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#INV-2026-{invoiceBooking.id}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Service:</span>
                <strong style={{ color: '#ffffff' }}>{invoiceBooking.serviceType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Technician:</span>
                <strong style={{ color: '#ffffff' }}>{invoiceBooking.worker?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <strong style={{ color: '#ffffff' }}>{currentUser?.name || 'Customer'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong style={{ color: '#ffffff' }}>{invoiceBooking.paymentMethod || 'bKash'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Final Amount:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>৳{invoiceBooking.agreedCost || invoiceBooking.estimatedCost}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Close Invoice</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
