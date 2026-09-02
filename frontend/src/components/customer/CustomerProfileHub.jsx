import React, { useState } from 'react';
import {
  User,
  Calendar,
  FileText,
  Building,
  Heart,
  MapPin,
  CreditCard,
  Star,
  Gift,
  Settings,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  X,
  Sparkles,
  Award,
  DollarSign
} from 'lucide-react';

import CustomerOverview from './CustomerOverview';
import CustomerBookings from './CustomerBookings';
import CustomerServiceHistory from './CustomerServiceHistory';
import CustomerProperties from './CustomerProperties';
import SavedTechnicians from './SavedTechnicians';
import CustomerAddresses from './CustomerAddresses';
import CustomerPayments from './CustomerPayments';
import CustomerReviews from './CustomerReviews';
import CustomerRewards from './CustomerRewards';
import CustomerSettings from './CustomerSettings';

export default function CustomerProfileHub({
  user,
  bookings = [],
  serviceHistory = [],
  properties = [],
  workers = [],
  savedWorkerIds = [],
  addresses = [],
  transactions = [],
  reviews = [],
  rewards = { points: 450, tier: 'Gold Tier Member', referralCode: 'FIX-ANIS-8821' },
  workerProfile = null,
  initialSubTab = 'overview',

  // Actions
  onNavigateTab,
  onAcceptCounterOffer,
  onStatusChange,
  onStartPayment,
  onAddProperty,
  onDeleteProperty,
  onAddAppliance,
  onDeleteAppliance,
  onToggleSaveWorker,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onSubmitReview,
  onUpdateProfile,
  onUpdateWorkerLocation,
  onLogout,
  onOpenBookingModal,
  onShopPartsForBooking
}) {
  const [subTab, setSubTab] = useState(initialSubTab);

  // Modals state
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTags, setReviewTags] = useState(['Punctual & Polite', 'Great Work Quality']);

  const activeBookingsCount = bookings.filter(b =>
    ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COUNTERED'].includes(b.status)
  ).length;

  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const unreviewedCount = completedBookings.filter(b => !reviews.some(r => r.bookingId === b.id)).length;

  const handleOpenReviewModal = (booking) => {
    setActiveReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewTags(['Punctual & Polite', 'Great Work Quality']);
  };

  const handleSendReview = (e) => {
    e.preventDefault();
    if (!activeReviewBooking) return;

    onSubmitReview({
      id: Date.now(),
      bookingId: activeReviewBooking.id,
      workerId: activeReviewBooking.worker?.id,
      technicianName: activeReviewBooking.worker?.name || 'Technician',
      technicianAvatar: activeReviewBooking.worker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150",
      serviceName: activeReviewBooking.serviceType,
      rating: reviewRating,
      comment: reviewComment || 'Excellent and professional service! Highly recommended.',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      tags: reviewTags
    });

    setActiveReviewBooking(null);
  };

  const toggleTag = (tag) => {
    if (reviewTags.includes(tag)) {
      setReviewTags(reviewTags.filter(t => t !== tag));
    } else {
      setReviewTags([...reviewTags, tag]);
    }
  };

  return (
    <div className="customer-hub-layout">
      {/* Top Banner Navigation Menu Bar */}
      <div className="customer-hub-nav-bar">
        <div className="hub-tabs-scrollable">
          <button 
            className={`hub-nav-tab ${['profile', 'settings'].includes(subTab) ? 'active' : ''}`}
            onClick={() => setSubTab('profile')}
          >
            <User size={16} /> My Profile
          </button>

          <button 
            className={`hub-nav-tab ${subTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSubTab('overview')}
          >
            <Sparkles size={16} /> Overview
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setSubTab('bookings')}
          >
            <Calendar size={16} /> My Bookings
            {activeBookingsCount > 0 && <span className="hub-tab-badge-pulse">{activeBookingsCount}</span>}
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'history' ? 'active' : ''}`}
            onClick={() => setSubTab('history')}
          >
            <FileText size={16} /> Service History & Invoices
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'properties' ? 'active' : ''}`}
            onClick={() => setSubTab('properties')}
          >
            <Building size={16} /> My Properties ({properties.length})
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'saved-technicians' ? 'active' : ''}`}
            onClick={() => setSubTab('saved-technicians')}
          >
            <Heart size={16} color={savedWorkerIds.length > 0 ? 'var(--accent-rose)' : 'inherit'} /> Saved Technicians ({savedWorkerIds.length})
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setSubTab('addresses')}
          >
            <MapPin size={16} /> Addresses ({addresses.length})
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'payments' ? 'active' : ''}`}
            onClick={() => setSubTab('payments')}
          >
            <CreditCard size={16} /> Payments & Transactions
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setSubTab('reviews')}
          >
            <Star size={16} /> My Reviews
            {unreviewedCount > 0 && <span className="hub-tab-badge-gold">{unreviewedCount}</span>}
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setSubTab('rewards')}
          >
            <Gift size={16} /> Rewards & Referral
          </button>

          <button
            className={`hub-nav-tab ${subTab === 'settings' ? 'active' : ''}`}
            onClick={() => setSubTab('settings')}
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {/* Main Hub Content Area */}
      <div className="customer-hub-body">
        {subTab === 'overview' && (
          <CustomerOverview
            user={user}
            bookings={bookings}
            serviceHistory={serviceHistory}
            properties={properties}
            savedWorkerIds={savedWorkerIds}
            reviews={reviews}
            rewards={rewards}
            onNavigateTab={(tab) => {
              if (tab === 'find-services') {
                onNavigateTab('customer');
              } else {
                setSubTab(tab);
              }
            }}
            onOpenBookingModal={onOpenBookingModal}
            onOpenAddProperty={() => setSubTab('properties')}
            onOpenAddAddress={() => setSubTab('addresses')}
          />
        )}

        {subTab === 'bookings' && (
          <CustomerBookings
            bookings={bookings}
            reviews={reviews}
            onAcceptCounterOffer={onAcceptCounterOffer}
            onStatusChange={onStatusChange}
            onStartPayment={onStartPayment}
            onOpenReviewModal={handleOpenReviewModal}
            onShopPartsForBooking={onShopPartsForBooking}
            onNavigateTab={(tab) => {
              if (tab === 'find-services') {
                onNavigateTab('customer');
              } else {
                setSubTab(tab);
              }
            }}
          />
        )}

        {subTab === 'history' && (
          <CustomerServiceHistory
            serviceHistory={serviceHistory}
            onOpenInvoice={(rec) => setActiveInvoice(rec)}
            onNavigateTab={(tab) => {
              if (tab === 'find-services') {
                onNavigateTab('customer');
              } else {
                setSubTab(tab);
              }
            }}
          />
        )}

        {subTab === 'properties' && (
          <CustomerProperties
            properties={properties}
            onAddProperty={onAddProperty}
            onDeleteProperty={onDeleteProperty}
            onAddAppliance={onAddAppliance}
            onDeleteAppliance={onDeleteAppliance}
            onOpenBookingModal={onOpenBookingModal}
          />
        )}

        {subTab === 'saved-technicians' && (
          <SavedTechnicians
            workers={workers}
            savedWorkerIds={savedWorkerIds}
            onToggleSaveWorker={onToggleSaveWorker}
            onOpenBookingModal={onOpenBookingModal}
            onNavigateTab={(tab) => onNavigateTab('customer')}
          />
        )}

        {subTab === 'addresses' && (
          <CustomerAddresses
            addresses={addresses}
            onAddAddress={onAddAddress}
            onEditAddress={onEditAddress}
            onDeleteAddress={onDeleteAddress}
            onSetDefaultAddress={onSetDefaultAddress}
          />
        )}

        {subTab === 'payments' && (
          <CustomerPayments
            transactions={transactions}
            onOpenReceipt={(tx) => {
              setActiveInvoice({
                jobId: tx.txCode || `TXN-${tx.id}`,
                serviceName: tx.serviceName,
                technicianName: tx.technicianName || 'Verified Technician',
                date: tx.date || '31 Aug 2026',
                total: tx.amount,
                paymentMethod: tx.method,
                status: 'Paid & Verified',
                problemReported: 'Verified marketplace service booking.',
                workPerformed: 'Completed on-site maintenance job.',
                laborCost: tx.amount
              });
            }}
          />
        )}

        {subTab === 'reviews' && (
          <CustomerReviews
            reviews={reviews}
            completedBookings={completedBookings}
            onSubmitReview={onSubmitReview}
            onOpenReviewModal={handleOpenReviewModal}
          />
        )}

        {subTab === 'rewards' && (
          <CustomerRewards
            rewards={rewards}
            onRedeemVoucher={(vouch) => {
              alert(`Successfully redeemed "${vouch.title}"! Promo Code ${vouch.code} is now applied to your next service booking.`);
            }}
          />
        )}

        {['profile', 'settings'].includes(subTab) && (
          <CustomerSettings
            user={user}
            workerProfile={workerProfile}
            onUpdateProfile={onUpdateProfile}
            onUpdateWorkerLocation={onUpdateWorkerLocation}
            onLogout={onLogout}
          />
        )}
      </div>

      {/* Modal: Official VAT-Compliant Digital Service Invoice */}
      {activeInvoice && (
        <div className="modal-overlay">
          <div className="modal-content invoice-modal-content">
            <div className="invoice-modal-header">
              <div className="invoice-brand">
                <ShieldCheck size={28} color="var(--primary)" />
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>FixConnect Bangladesh</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Licensed Technician Services & Escrow Settlement • VAT Reg: 001928374-0101
                  </span>
                </div>
              </div>

              <button className="btn btn-icon" onClick={() => setActiveInvoice(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="invoice-meta-grid">
              <div>
                <span className="inv-meta-label">Invoice Number:</span>
                <strong>INV-{activeInvoice.jobId || '2026-8812'}</strong>
              </div>
              <div>
                <span className="inv-meta-label">Service Date:</span>
                <strong>{activeInvoice.date || '31 Aug 2026'}</strong>
              </div>
              <div>
                <span className="inv-meta-label">Customer:</span>
                <strong>{user?.name || 'Anisur Rahman'}</strong>
              </div>
              <div>
                <span className="inv-meta-label">Technician:</span>
                <strong>{activeInvoice.technicianName || 'Kamrul Islam'} (Verified)</strong>
              </div>
            </div>

            <div className="invoice-body">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty / Hrs</th>
                    <th>Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{activeInvoice.serviceName || 'Service Maintenance'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {activeInvoice.workPerformed || activeInvoice.problemReported || 'Full on-site repair & inspection'}
                      </div>
                    </td>
                    <td>1 Job</td>
                    <td>৳{activeInvoice.laborCost || activeInvoice.total}</td>
                    <td>৳{activeInvoice.laborCost || activeInvoice.total}</td>
                  </tr>
                  {activeInvoice.partsUsed && activeInvoice.partsUsed.map((part, idx) => (
                    <tr key={idx}>
                      <td>Replacement Part: {part.name}</td>
                      <td>{part.quantity || 1}</td>
                      <td>৳{part.cost}</td>
                      <td>৳{part.cost * (part.quantity || 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals-area">
                <div className="inv-total-row">
                  <span>Subtotal</span>
                  <span>৳{activeInvoice.total}</span>
                </div>
                <div className="inv-total-row">
                  <span>VAT / Platform Trust Protection</span>
                  <span>৳0 (Included)</span>
                </div>
                <div className="inv-total-row grand-total">
                  <span>Grand Total (Paid)</span>
                  <span style={{ color: 'var(--primary)' }}>৳{activeInvoice.total}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                  Settlement Method: {activeInvoice.paymentMethod || 'bKash Digital Escrow'} • Status: COMPLETED
                </div>
              </div>

              {/* Warranty Guarantee Certificate Footer */}
              <div className="invoice-warranty-box">
                <ShieldCheck size={20} color="var(--primary)" />
                <div>
                  <strong>30-Day FixConnect Service Warranty Certificate</strong>
                  <p>This document serves as your verified proof of warranty. Valid across Dhaka metropolitan service zones.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer-row" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Printer size={15} /> Print Invoice
              </button>
              <button className="btn btn-primary" onClick={() => {
                alert("Downloading verified PDF receipt...");
                setActiveInvoice(null);
              }}>
                <Download size={15} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Write Review for Completed Booking */}
      {activeReviewBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 className="modal-title">
              <Star size={20} color="var(--accent-gold)" fill="var(--accent-gold)" />
              Rate & Review Technician
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              How was your experience with <strong>{activeReviewBooking.worker?.name || 'the technician'}</strong> for <strong>{activeReviewBooking.serviceType}</strong>?
            </p>

            <form onSubmit={handleSendReview}>
              {/* Star Rating Picker */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-pick-btn"
                      onClick={() => setReviewRating(star)}
                    >
                      <Star
                        size={32}
                        color={star <= reviewRating ? 'var(--accent-gold)' : 'var(--text-muted)'}
                        fill={star <= reviewRating ? 'var(--accent-gold)' : 'transparent'}
                      />
                    </button>
                  ))}
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                  {reviewRating === 5 ? '⭐⭐⭐⭐⭐ Exceptional (5/5)' :
                    reviewRating === 4 ? '⭐⭐⭐⭐ Great Service (4/5)' :
                      reviewRating === 3 ? '⭐⭐⭐ Average (3/5)' :
                        reviewRating === 2 ? '⭐⭐ Needs Improvement (2/5)' : '⭐ Unsatisfactory (1/5)'}
                </div>
              </div>

              {/* Tag Badges */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Compliment Badges</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {['Punctual & Polite', 'Great Work Quality', 'Fair Transparent Pricing', 'Safety Conscious', 'Explained Problem Well'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-selectable ${reviewTags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Written Feedback</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe the technician's punctuality, quality of work, cleanliness, and overall satisfaction..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveReviewBooking(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Review (+25 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
