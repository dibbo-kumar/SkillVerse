import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, AlertCircle,
  TrendingUp, Award, User, Phone, Wrench, Search, Filter, ArrowRight,
  Sparkles, DollarSign, FileText, ChevronRight, Download, Heart, Bookmark, BookmarkCheck, Star,
  XCircle, PlayCircle, Lock, RefreshCw, KeyRound, Smartphone, CreditCard, Eye, RotateCcw
} from 'lucide-react';
import BookingDetailsModal from './BookingDetailsModal';

const API_BASE = "http://localhost:8081/api";

export default function MyBookingsHub({ currentUser, rewards, initialTab = 'overview', workers = [], savedWorkerIds = [], onToggleSaveWorker, onAddPoints, onShowToast, onNavigateToWorkerProfile }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview'); // 'overview', 'bookings', 'history', 'saved-technicians'
  const [bookings, setBookings] = useState([]);
  const [problemPosts, setProblemPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when switching tabs in MyBookingsHub
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

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
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [paymentMobile, setPaymentMobile] = useState('');
  const [customFinalAmount, setCustomFinalAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Advance Payment Modal
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceBooking, setAdvanceBooking] = useState(null);
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState('bKash');
  const [advanceMobileNumber, setAdvanceMobileNumber] = useState('');
  const [isPayingAdvance, setIsPayingAdvance] = useState(false);

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

  // Warranty Claim & Done Modal State
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyBooking, setWarrantyBooking] = useState(null);
  const [warrantyProblemInput, setWarrantyProblemInput] = useState('');
  const [isClaimingWarranty, setIsClaimingWarranty] = useState(false);
  const [showWarrantyDoneModal, setShowWarrantyDoneModal] = useState(false);
  const [warrantyDoneBooking, setWarrantyDoneBooking] = useState(null);

  // Saved Technicians state
  const [fetchedWorkers, setFetchedWorkers] = useState([]);

  useEffect(() => {
    if (!workers || workers.length === 0) {
      fetch(`${API_BASE}/workers`)
        .then(res => res.json())
        .then(data => setFetchedWorkers(data || []))
        .catch(() => {});
    }
  }, [workers]);

  const allAvailableWorkers = (workers && workers.length > 0) ? workers : fetchedWorkers;
  const numericSavedIds = (savedWorkerIds || []).map(Number);
  const displayedSavedWorkers = allAvailableWorkers.filter(w => numericSavedIds.includes(Number(w.id)));

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    fetchCustomerData();
    const interval = setInterval(() => {
      fetchCustomerData(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const fetchCustomerData = async (isBackground = false) => {
    if (!currentUser?.id) return;
    if (!isBackground) setLoading(true);
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
    } catch (err) {
      console.error("Failed to load customer bookings data:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">Pending Response</span>;
      case 'NEGOTIATING': return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>Counter Offer</span>;
      case 'AWAITING_ADVANCE': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>Awaiting Base Advance</span>;
      case 'ACCEPTED':
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

  const handleUnsaveWorker = (workerId) => {
    const numericId = Number(workerId);
    if (onToggleSaveWorker) {
      onToggleSaveWorker(numericId);
    }
    const userKey = currentUser ? `skillverse_saved_workers_${currentUser.id || currentUser.email}` : 'skillverse_saved_workers_guest';
    try {
      const uSaved = JSON.parse(localStorage.getItem(userKey) || '[]');
      const updatedUserSaved = (uSaved || []).map(Number).filter(id => id !== numericId);
      localStorage.setItem(userKey, JSON.stringify(updatedUserSaved));
    } catch (e) {}

    if (onShowToast) {
      onShowToast("Technician Removed", "Technician removed from your saved list.", "info");
    }
  };

  const handleAcceptPrice = async (bId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/accept-price?acceptedBy=CUSTOMER`, { method: 'PUT' });
      if (res.ok) {
        const updatedBooking = await res.json();
        fetchCustomerData();
        if (!updatedBooking.advancePaid) {
          setAdvanceBooking(updatedBooking);
          setShowAdvanceModal(true);
        }
        if (onShowToast) onShowToast("Price Agreed!", `Agreed on ৳${updatedBooking.agreedCost || updatedBooking.estimatedCost}. Please pay the minimum base advance (৳${((updatedBooking.basePrice || 300) * 1.05).toFixed(0)}) to confirm dispatch.`, "success");
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
        if (onAddPoints) onAddPoints(50);
        setShowCompletionOtpModal(false);
        setCompletionOtpInput('');
        fetchCustomerData();
        if (onShowToast) onShowToast("Job Completed!", "Completion OTP verified & +50 Reward Points added to your balance!", "success");
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
    const amountToPay = customFinalAmount ? Number(customFinalAmount) : (paymentBooking.agreedCost || paymentBooking.estimatedCost);

    try {
      const res = await fetch(`${API_BASE}/bookings/${paymentBooking.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          mobileNumber: paymentMobile || '01711223344',
          finalAmount: amountToPay
        })
      });

      if (res.ok) {
        const completedData = await res.json();
        setBookings(prev => prev.map(b => b.id === paymentBooking.id ? { ...b, ...completedData, status: 'COMPLETED', paymentStatus: 'PAID' } : b));
        if (onAddPoints) onAddPoints(50);
        if (onShowToast) onShowToast("Payment Successful!", `৳${amountToPay} payment processed instantly & +50 Reward Points added!`, "success");
        setShowPaymentModal(false);
        setCustomFinalAmount('');
        setPaymentMobile('');
        setActiveTab('history');
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

  const handlePayAdvanceSubmit = async (e) => {
    e.preventDefault();
    if (!advanceBooking) return;
    setIsPayingAdvance(true);
    const base = advanceBooking.basePrice || 300.0;
    const vat = Math.round(base * 0.05 * 100.0) / 100.0;

    try {
      const res = await fetch(`${API_BASE}/bookings/${advanceBooking.id}/pay-advance`, {
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
        const confirmedData = await res.json();
        setBookings(prev => prev.map(b => b.id === advanceBooking.id ? { ...b, ...confirmedData, status: 'CONFIRMED', advancePaid: true, advancePaidAmount: base, advanceVatAmount: vat } : b));
        if (onShowToast) onShowToast("Advance Paid & Confirmed!", `Advance ৳${base + vat} paid. Booking is officially confirmed & technician dispatched!`, "success");
        setShowAdvanceModal(false);
        setAdvanceMobileNumber('');
        fetchCustomerData();
      } else {
        if (onShowToast) onShowToast("Payment Error", "Failed to process advance payment.", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPayingAdvance(false);
    }
  };

  const handleTimeoutRefund = async (booking) => {
    if (!window.confirm(`Confirm cancellation and trigger instant cashback refund of ৳${(booking.advancePaidAmount || booking.basePrice || 300) * 1.05} back to your account?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/bookings/${booking.id}/timeout-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        if (onShowToast) onShowToast("Instant Cashback Refunded!", "Advance payment has been refunded to your account due to delay.", "success");
        fetchCustomerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Refund Error", err.error || "Could not process refund.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimWarranty = async (e) => {
    if (e) e.preventDefault();
    if (!warrantyBooking) return;
    setIsClaimingWarranty(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${warrantyBooking.id}/claim-warranty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: warrantyProblemInput || 'Recurring service problem reported under 30-day warranty.' })
      });
      if (!res.ok) {
        const err = await res.json();
        if (onShowToast) onShowToast("Warranty Error", err.error || "Failed to submit warranty claim.", "error");
        setIsClaimingWarranty(false);
        return;
      }
      const data = await res.json();
      setShowWarrantyModal(false);
      setWarrantyBooking(null);
      setWarrantyProblemInput('');
      fetchCustomerData();
      if (onShowToast) {
        onShowToast(
          "🛡️ 30-Day Warranty Claimed!",
          `Free warranty request dispatched to ${data.worker?.name || 'Technician'}. The technician is restricted from taking new work until your warranty is completed!`,
          "success"
        );
      }
    } catch (err) {
      console.error(err);
      if (onShowToast) onShowToast("Network Error", "Unable to submit warranty claim.", "error");
    } finally {
      setIsClaimingWarranty(false);
    }
  };

  const handleDownloadReceipt = (booking) => {
    if (!booking) return;
    const workedDate = booking.completedAt 
      ? new Date(booking.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : (booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently');
    const warrantyExpiry = new Date(new Date(booking.completedAt || booking.createdAt || Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const vat = ((booking.advancePaidAmount || 300) * 0.05).toFixed(1);
    const total = booking.agreedCost || booking.estimatedCost || 500;

    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FixConnect Official Receipt - INV-${booking.id}</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 30px; margin: 0; }
    .receipt-card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 18px; margin-bottom: 20px; }
    .logo { font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
    .logo span { color: #f59e0b; }
    .badge { background: #dcfce7; color: #166534; padding: 5px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
    .inv-no { font-size: 13px; font-weight: 600; color: #64748b; margin-top: 3px; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .details-table td { padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; }
    .details-table td.label { color: #64748b; width: 42%; }
    .details-table td.val { font-weight: 600; color: #0f172a; text-align: right; }
    .warranty-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; margin-bottom: 20px; }
    .warranty-title { color: #065f46; font-weight: 700; font-size: 13.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    .warranty-desc { color: #047857; font-size: 12px; line-height: 1.5; }
    .total-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .total-label { font-size: 14px; font-weight: 700; color: #334155; }
    .total-amount { font-size: 20px; font-weight: 800; color: #2563eb; }
    .footer { text-align: center; color: #94a3b8; font-size: 11.5px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="header">
      <div>
        <div class="logo">Fix<span>Connect</span> / SkillVerse</div>
        <div class="inv-no">Receipt #INV-2026-${booking.id}</div>
      </div>
      <div>
        <span class="badge">✓ PAID & VERIFIED</span>
      </div>
    </div>

    <table class="details-table">
      <tr>
        <td class="label">Service Name</td>
        <td class="val">${booking.serviceType}</td>
      </tr>
      <tr>
        <td class="label">Worked Date</td>
        <td class="val">${workedDate}</td>
      </tr>
      <tr>
        <td class="label">Certified Technician</td>
        <td class="val">${booking.worker?.name || 'Assigned Technician'} ${booking.worker?.phone ? `(${booking.worker.phone})` : ''}</td>
      </tr>
      <tr>
        <td class="label">Customer Name</td>
        <td class="val">${currentUser?.name || 'Customer'}</td>
      </tr>
      <tr>
        <td class="label">Service Location</td>
        <td class="val">${booking.address || currentUser?.address || 'Dhaka, Bangladesh'}</td>
      </tr>
      <tr>
        <td class="label">Payment Method</td>
        <td class="val">${booking.paymentMethod || 'bKash / Wallet'} ${booking.transactionId ? `(Txn: ${booking.transactionId})` : ''}</td>
      </tr>
      <tr>
        <td class="label">Base Advance Paid</td>
        <td class="val">৳${booking.advancePaidAmount || 300} (+৳${vat} VAT)</td>
      </tr>
    </table>

    <div class="total-box">
      <span class="total-label">Total Settled Amount</span>
      <span class="total-amount">৳${total}</span>
    </div>

    <div class="warranty-box">
      <div class="warranty-title">🛡️ 30-Day FixConnect Service Guarantee</div>
      <div class="warranty-desc">
        This receipt certifies 30 days of 100% free re-repair warranty valid until <strong>${warrantyExpiry}</strong>. If the same issue recurs within this timeframe, claim free warranty directly from your dashboard.
      </div>
    </div>

    <div class="footer">
      Official Customer Invoice • FixConnect / SkillVerse Platform • 24/7 Support: support@skillverse.com
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FixConnect_Receipt_INV-2026-${booking.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast("Receipt Downloaded", `Receipt for ${booking.serviceType} downloaded successfully.`, "success");
    }
  };

  const handleCompleteWarranty = async (booking) => {
    const bookingId = (typeof booking === 'object' && booking !== null) ? booking.id : booking;
    const targetBooking = (typeof booking === 'object' && booking !== null) ? booking : bookings.find(b => b.id === bookingId);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/complete-warranty`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchCustomerData();
        setWarrantyDoneBooking(targetBooking || { id: bookingId });
        setShowWarrantyDoneModal(true);
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error || "Failed to finalize warranty.", "error");
      }
    } catch (e) {
      console.error(e);
      if (onShowToast) onShowToast("Error", "Network error finalizing warranty.", "error");
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
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Cannot Submit", err.error || "Review already submitted.", "error");
        setShowReviewModal(false);
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

  const activeBooking = bookings.find((b) =>
    ['AWAITING_ADVANCE', 'CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED'].includes(b.status) &&
    b.status !== 'COMPLETED' && b.status !== 'PAID' && b.status !== 'CANCELLED'
  );
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAID').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-heading)', margin: 0 }}>MY BOOKINGS</h1>
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
                <h3 style={{ fontSize: '1.8rem', color: 'var(--text-heading)', margin: '0.2rem 0 0 0' }}>{activeBooking ? 1 : 0}</h3>
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
                <h3 style={{ fontSize: '1.8rem', color: '#818cf8', margin: '0.2rem 0 0 0' }}>{rewards?.points !== undefined ? rewards.points : (completedCount * 100 + 150)}</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1 Point = ৳1 for Courses & Tools</span>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    {getStatusBadge(activeBooking.status)}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking #{activeBooking.id}</span>
                  </div>

                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-heading)', margin: 0 }}>{activeBooking.serviceType}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{activeBooking.description}</p>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                    <div>Technician: <strong>{activeBooking.worker?.name || 'Assigned Technician'}</strong></div>
                    <div>Location: <strong>{activeBooking.address}</strong></div>
                    <div>Agreed Price: <strong style={{ color: 'var(--primary)' }}>৳{activeBooking.agreedCost || activeBooking.estimatedCost}</strong></div>
                  </div>

                  {(!activeBooking.advancePaid && (activeBooking.status === 'AWAITING_ADVANCE' || ['PRICE_AGREED', 'ACCEPTED'].includes(activeBooking.status))) && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', flexWrap: 'wrap', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#f59e0b' }}>
                        ⏳ <strong>Deal Agreed!</strong> Pay minimum base advance (৳{((activeBooking.basePrice || 300) * 1.05).toFixed(0)}) to confirm booking & activate technician dispatch timer.
                      </span>
                      <button
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 'bold' }}
                        onClick={() => {
                          setAdvanceBooking(activeBooking);
                          setShowAdvanceModal(true);
                        }}
                      >
                        💳 Pay Base Advance Now →
                      </button>
                    </div>
                  )}
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
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)' }}>Recent Service Requests</h3>
              <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.85rem' }}>View All →</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {bookings.slice(0, 5).map((b) => {
                const isWorkerCounter = (b.status === 'NEGOTIATING' || b.status === 'COUNTERED' || b.status === 'PENDING') && (b.lastOfferedBy === 'WORKER' || (!b.lastOfferedBy && b.workerCounterPrice));
                const isCustomerWaiting = (b.status === 'PENDING' || b.status === 'NEGOTIATING') && (b.lastOfferedBy === 'CUSTOMER' || !b.lastOfferedBy);
                const currentPrice = (b.status === 'NEGOTIATING' || b.status === 'COUNTERED' || b.status === 'PENDING')
                  ? (b.lastOfferedBy === 'WORKER' 
                      ? (b.workerCounterPrice || b.estimatedCost || b.agreedCost) 
                      : (b.customerOfferPrice || b.estimatedCost || b.agreedCost))
                  : (b.agreedCost || b.estimatedCost || b.workerCounterPrice || b.customerOfferPrice);

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
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-heading)' }}>{b.serviceType}</strong>
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
                        Technician: <strong style={{ color: 'var(--text-heading)' }}>{b.worker?.name || 'Searching...'}</strong> • 
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

                      {(!b.advancePaid && (b.status === 'AWAITING_ADVANCE' || b.status === 'ACCEPTED' || b.status === 'PRICE_AGREED')) && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(90deg, #f59e0b, #d97706)', color: '#ffffff', fontWeight: 'bold' }}
                          onClick={() => {
                            setAdvanceBooking(b);
                            setShowAdvanceModal(true);
                          }}
                          title="Pay minimum base advance to confirm technician dispatch"
                        >
                          💳 Pay Base Advance (৳{((b.basePrice || 300) * 1.05).toFixed(0)})
                        </button>
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
              const isWorkerCounter = (b.status === 'NEGOTIATING' || b.status === 'COUNTERED' || b.status === 'PENDING') && (b.lastOfferedBy === 'WORKER' || (!b.lastOfferedBy && b.workerCounterPrice));
              const isCustomerWaiting = (b.status === 'PENDING' || b.status === 'NEGOTIATING') && (b.lastOfferedBy === 'CUSTOMER' || !b.lastOfferedBy);
              const currentPrice = (b.status === 'NEGOTIATING' || b.status === 'COUNTERED' || b.status === 'PENDING')
                ? (b.lastOfferedBy === 'WORKER' 
                    ? (b.workerCounterPrice || b.estimatedCost || b.agreedCost) 
                    : (b.customerOfferPrice || b.estimatedCost || b.agreedCost))
                : (b.agreedCost || b.estimatedCost || b.workerCounterPrice || b.customerOfferPrice);

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
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-heading)', display: 'block' }}>{b.serviceType}</strong>
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
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)', display: 'block' }}>{b.worker?.name || 'Searching...'}</strong>
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

                      {(!b.advancePaid && (b.status === 'AWAITING_ADVANCE' || b.status === 'ACCEPTED' || b.status === 'PRICE_AGREED')) && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: 'linear-gradient(90deg, #f59e0b, #d97706)', color: '#ffffff', fontWeight: 'bold' }}
                          onClick={() => {
                            setAdvanceBooking(b);
                            setShowAdvanceModal(true);
                          }}
                          title="Pay minimum base advance to confirm technician dispatch"
                        >
                          💳 Pay Base Advance (৳{((b.basePrice || 300) * 1.05).toFixed(0)})
                        </button>
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

                    {(b.status === 'COMPLETED' || b.status === 'PAID') && (
                      <>
                        {b.reviewRating ? (
                          <span
                            className="badge badge-gold"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            title={b.reviewComment ? `Review: "${b.reviewComment}"` : 'Reviewed'}
                          >
                            <Star size={12} fill="currentColor" /> Rated {b.reviewRating}/5
                          </span>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setReviewBooking(b);
                              setRating(5);
                              setReviewComment('');
                              setShowReviewModal(true);
                            }}
                          >
                            <Star size={13} /> Review
                          </button>
                        )}
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
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', margin: 0 }}>Service History & Invoices</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
                View past completed repairs, download official receipts, rate technicians, and claim free 30-day service warranty.
              </p>
            </div>
            <span className="badge badge-verified" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} /> 30-Day SkillVerse Guarantee Active
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {bookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID').map((b) => {
              const completedDate = new Date(b.completedAt || b.paidAt || b.createdAt);
              const formattedWorkedDate = isNaN(completedDate.getTime()) ? 'Recently' : completedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
              const expiryDate = new Date(completedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
              const formattedExpiryDate = isNaN(expiryDate.getTime()) ? '30 Days' : expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
              const now = new Date();
              const diffMs = expiryDate.getTime() - now.getTime();
              const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
              const isExpired = diffMs <= 0;

              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>{b.serviceType}</strong>
                      {getStatusBadge(b.status)}
                      
                      {/* Warranty Status Badges */}
                      {b.warrantyStatus === 'WARRANTY_COMPLETED' ? (
                        <span className="badge badge-verified" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' }}>
                          <CheckCircle2 size={12} /> Warranty Service Completed
                        </span>
                      ) : b.warrantyStatus === 'WARRANTY_ACCEPTED' ? (
                        <span className="badge badge-gold" style={{ border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}>
                          <Clock size={12} /> Free Warranty In Progress (Tech Accepted)
                        </span>
                      ) : b.warrantyStatus === 'WARRANTY_CLAIMED' ? (
                        <span className="badge badge-warning" style={{ border: '1px solid #ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)' }}>
                          <Clock size={12} /> Warranty Claimed • Awaiting Tech
                        </span>
                      ) : !isExpired ? (
                        <span className="badge badge-verified" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                          <ShieldCheck size={12} /> 30-Day Warranty Active ({daysRemaining}d left)
                        </span>
                      ) : (
                        <span className="badge badge-secondary" style={{ opacity: 0.6 }}>
                          Warranty Expired
                        </span>
                      )}
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                      Technician: <strong>{b.worker?.name || 'Verified Technician'}</strong> • Worked Date: <strong>{formattedWorkedDate}</strong> • Paid: <strong style={{ color: 'var(--primary)' }}>৳{b.agreedCost || b.estimatedCost}</strong>
                    </p>

                    {b.warrantyProblemDescription && (
                      <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.7rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', borderLeft: '3px solid #f59e0b', fontSize: '0.8rem', color: '#f59e0b' }}>
                        <strong>Reported Warranty Issue:</strong> {b.warrantyProblemDescription}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => {
                        setInvoiceBooking(b);
                        setShowInvoiceModal(true);
                      }}
                    >
                      <FileText size={14} /> Receipt
                    </button>

                    {b.reviewRating ? (
                      <span
                        className="badge badge-gold"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title={b.reviewComment ? `Review: "${b.reviewComment}"` : 'Reviewed'}
                      >
                        <Star size={13} fill="currentColor" /> Rated {b.reviewRating}/5
                      </span>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          setReviewBooking(b);
                          setRating(5);
                          setReviewComment('');
                          setShowReviewModal(true);
                        }}
                      >
                        <Star size={14} /> Review
                      </button>
                    )}

                    {/* Warranty Actions: Claim Warranty / Done */}
                    {b.warrantyStatus === 'WARRANTY_ACCEPTED' ? (
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: '0.45rem 1rem',
                          fontSize: '0.82rem',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                        onClick={() => handleCompleteWarranty(b)}
                      >
                        <CheckCircle2 size={14} /> Done (Mark Finished)
                      </button>
                    ) : b.warrantyStatus === 'WARRANTY_CLAIMED' ? (
                      <button
                        className="btn btn-secondary"
                        disabled
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', opacity: 0.85, cursor: 'default', color: '#f59e0b', borderColor: '#f59e0b' }}
                      >
                        <Clock size={14} /> Pending Tech
                      </button>
                    ) : b.warrantyStatus === 'WARRANTY_COMPLETED' ? (
                      <button
                        className="btn btn-secondary"
                        disabled
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', opacity: 0.6, cursor: 'default' }}
                      >
                        <CheckCircle2 size={14} /> Warranty Done
                      </button>
                    ) : !isExpired && !b.warrantyClaimed ? (
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.82rem',
                          border: '1px solid #10b981',
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.08)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        title="Claim free warranty service within 30 days"
                        onClick={() => {
                          setWarrantyBooking(b);
                          setWarrantyProblemInput('');
                          setShowWarrantyModal(true);
                        }}
                      >
                        <ShieldCheck size={14} /> Claim Warranty
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        disabled
                        style={{
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.82rem',
                          opacity: 0.35,
                          filter: 'blur(1px)',
                          cursor: 'not-allowed'
                        }}
                        title="Warranty period (30 days) has expired for this booking."
                      >
                        <ShieldCheck size={14} /> Claim Warranty
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {bookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID').length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No completed service records found.</p>
            )}
          </div>
        </div>
      )}

      {/* --- SAVED TECHNICIANS TAB --- */}
      {activeTab === 'saved-technicians' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bookmark size={22} color="var(--primary)" fill="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>Saved Technicians ({displayedSavedWorkers.length})</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {displayedSavedWorkers.map((w) => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img
                    src={w.user?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100"}
                    alt={w.user?.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'block' }}>{w.user?.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⭐ {w.user?.rating || 4.9} • {w.skills || w.specialization || 'Technical Service'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}
                    title="Unsave Technician"
                    onClick={() => handleUnsaveWorker(w.id)}
                  >
                    <BookmarkCheck size={14} color="var(--primary)" fill="var(--primary)" /> Unsave
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => onNavigateToWorkerProfile && onNavigateToWorkerProfile(w.id)}
                  >
                    Book Service
                  </button>
                </div>
              </div>
            ))}
            {displayedSavedWorkers.length === 0 && (
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
        onOpenAdvanceModal={(b) => {
          setAdvanceBooking(b);
          setShowAdvanceModal(true);
        }}
        onTimeoutRefund={handleTimeoutRefund}
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
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Propose Counter Offer</h3>
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
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Verify Service Completion</h3>
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

      {/* --- PAYMENT MODAL (FINAL COMPLETION PAYMENT) --- */}
      {showPaymentModal && paymentBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowPaymentModal(false)}>
          <div className="glass-card" style={{ maxWidth: '450px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CreditCard size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Complete & Pay Service Bill</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Finalize payment for <strong>{paymentBooking.serviceType}</strong> with technician <strong>{paymentBooking.worker?.name}</strong>.
            </p>

            <form onSubmit={handleProcessPayment}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Payable Amount (BDT ৳)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}
                  value={customFinalAmount || (paymentBooking.agreedCost || paymentBooking.estimatedCost)}
                  onChange={(e) => setCustomFinalAmount(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Deal cost: ৳{paymentBooking.agreedCost || paymentBooking.estimatedCost} {paymentBooking.advancePaidAmount ? `(৳${paymentBooking.advancePaidAmount} advance already paid)` : ''}
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Channel</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.3rem' }}>
                  {['bKash', 'Nagad', 'Rocket', 'Cash'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`btn ${paymentMethod === pm ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.4rem 0.2rem', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'Cash' && (
                <div style={{ marginBottom: '1.2rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{paymentMethod} Mobile Number</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.7rem' }}
                    value={paymentMobile}
                    onChange={(e) => setPaymentMobile(e.target.value)}
                    placeholder="e.g. 01711223344"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={isProcessingPayment} className="btn btn-primary" style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}>
                  {isProcessingPayment ? 'Processing...' : `Confirm & Pay ৳${customFinalAmount || paymentBooking.agreedCost || paymentBooking.estimatedCost} ✔`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADVANCE PAYMENT MODAL --- */}
      {showAdvanceModal && advanceBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowAdvanceModal(false)}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <DollarSign size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Pay Minimum Base Advance</h3>
              </div>
              <button onClick={() => setShowAdvanceModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Technician accepted your booking! Pay the required base advance to confirm dispatch.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Worker Base Price (Advance):</span>
                <strong style={{ color: 'var(--text-heading)' }}>৳{advanceBooking.basePrice || 300}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SkillVerse VAT (5%):</span>
                <strong style={{ color: 'var(--accent-gold)' }}>+৳{((advanceBooking.basePrice || 300) * 0.05).toFixed(1)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.3rem', fontSize: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-heading)' }}>Total Advance Required:</span>
                <strong style={{ color: 'var(--primary)' }}>৳{((advanceBooking.basePrice || 300) * 1.05).toFixed(1)}</strong>
              </div>
            </div>

            <form onSubmit={handlePayAdvanceSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Channel</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.3rem' }}>
                  {['bKash', 'Nagad', 'Rocket', 'Card'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setAdvancePaymentMethod(pm)}
                      className={`btn ${advancePaymentMethod === pm ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.4rem 0.2rem', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{advancePaymentMethod} Mobile Number</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                  value={advanceMobileNumber}
                  onChange={(e) => setAdvanceMobileNumber(e.target.value)}
                  placeholder="e.g. 01711223344"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdvanceModal(false)}>Cancel</button>
                <button type="submit" disabled={isPayingAdvance} className="btn btn-primary" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}>
                  {isPayingAdvance ? 'Processing...' : `Pay ৳${((advanceBooking.basePrice || 300) * 1.05).toFixed(1)} & Confirm`}
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
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Review Technician</h3>
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

      {/* --- INVOICE & WARRANTY RECEIPT MODAL --- */}
      {showInvoiceModal && invoiceBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowInvoiceModal(false)}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={26} color="#10b981" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>OFFICIAL RECEIPT</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SkillVerse Verified Service Certificate</span>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, background: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                #INV-2026-{invoiceBooking.id}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Service Name:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{invoiceBooking.serviceType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Worked Date:</span>
                <strong style={{ color: 'var(--text-heading)' }}>
                  {invoiceBooking.completedAt 
                    ? new Date(invoiceBooking.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : (invoiceBooking.createdAt ? new Date(invoiceBooking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Certified Technician:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{invoiceBooking.worker?.name || 'Assigned Technician'} {invoiceBooking.worker?.phone ? `(${invoiceBooking.worker.phone})` : ''}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Client Name:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{currentUser?.name || 'Customer'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Service Location:</span>
                <strong style={{ color: 'var(--text-heading)', maxWidth: '240px', textAlign: 'right', fontSize: '0.8rem' }}>{invoiceBooking.address || currentUser?.address || 'Dhaka, Bangladesh'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{invoiceBooking.paymentMethod || 'bKash Wallet'} {invoiceBooking.transactionId ? `(Txn: ${invoiceBooking.transactionId})` : ''}</strong>
              </div>
              
              {/* Financial summary */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '10px', marginTop: '0.3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Base Advance Paid:</span>
                  <span>৳{invoiceBooking.advancePaidAmount || 300} (+৳{((invoiceBooking.advancePaidAmount || 300) * 0.05).toFixed(1)} VAT)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.3rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-heading)' }}>Total Settled Amount:</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>৳{invoiceBooking.agreedCost || invoiceBooking.estimatedCost}</strong>
                </div>
              </div>

              {/* 30-Day Service Guarantee terms */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.8rem', marginTop: '0.3rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <ShieldCheck size={24} color="#10b981" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.78rem' }}>
                  <strong style={{ color: '#10b981', display: 'block' }}>30-Day FixConnect Service Guarantee</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Free re-inspection and repair warranty eligible until {new Date(new Date(invoiceBooking.completedAt || invoiceBooking.createdAt).getTime() + 30*24*60*60*1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '0.8rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowInvoiceModal(false)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleDownloadReceipt(invoiceBooking)}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                <Download size={15} /> Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CLAIM 30-DAY WARRANTY MODAL --- */}
      {showWarrantyModal && warrantyBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowWarrantyModal(false)}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={24} color="#10b981" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>Claim 30-Day Warranty</h3>
              </div>
              <button onClick={() => setShowWarrantyModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              If your <strong>{warrantyBooking.serviceType}</strong> shows the same problem again within 30 days of completion, you can claim 100% free warranty repair.
            </p>

            {/* Terms breakdown */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.2rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Original Service:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{warrantyBooking.serviceType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Assigned Technician:</span>
                <strong style={{ color: 'var(--text-heading)' }}>{warrantyBooking.worker?.name || 'Technician'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Service Cost:</span>
                <strong style={{ color: '#10b981' }}>৳0.00 (100% FREE Warranty)</strong>
              </div>
              <div style={{ marginTop: '0.4rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', borderLeft: '3px solid #f59e0b', fontSize: '0.78rem', color: '#f59e0b' }}>
                ⚠️ <strong>Worker Restriction:</strong> {warrantyBooking.worker?.name || 'The technician'} will be blocked from accepting any new jobs until this free warranty claim is completed and confirmed by you.
              </div>
            </div>

            <form onSubmit={handleClaimWarranty}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Describe Recurring Issue / Problem</label>
                <textarea
                  rows={3}
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                  value={warrantyProblemInput}
                  onChange={(e) => setWarrantyProblemInput(e.target.value)}
                  placeholder="e.g. The AC started leaking water again / pipe joint still has a slow drip."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWarrantyModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClaimingWarranty}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ShieldCheck size={16} /> {isClaimingWarranty ? 'Submitting Claim...' : 'Confirm & Claim Warranty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- WARRANTY COMPLETED SUCCESS MODAL (NO BROWSER ALERT) --- */}
      {showWarrantyDoneModal && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>
            
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-heading)', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
              Warranty Service Completed!
            </h3>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Your free warranty service for <strong>{warrantyDoneBooking?.serviceType || 'the repair'}</strong> has been marked as <strong>Done</strong>. The technician's restrictions have been lifted.
            </p>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.7rem', fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
              onClick={() => {
                setShowWarrantyDoneModal(false);
                setWarrantyDoneBooking(null);
              }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
