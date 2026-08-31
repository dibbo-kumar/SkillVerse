import React, { useState } from 'react';
import { 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  Calendar,
  AlertCircle,
  User
} from 'lucide-react';

export default function CustomerReviews({
  reviews = [],
  completedBookings = [],
  onSubmitReview,
  onOpenReviewModal
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // all, pending

  // Unreviewed bookings
  const unreviewedBookings = completedBookings.filter(b => 
    !reviews.some(r => r.bookingId === b.id)
  );

  return (
    <div className="customer-reviews-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <Star size={24} color="var(--accent-gold)" fill="var(--accent-gold)" />
            My Technician Reviews & Feedback
          </h2>
          <p className="section-subtitle">
            Help the FixConnect community discover top-rated technicians and maintain high service standards in Bangladesh.
          </p>
        </div>
      </div>

      {/* Sub-tab Pills */}
      <div className="sub-tab-pills">
        <button 
          className={`sub-tab-pill ${activeSubTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('all')}
        >
          My Reviews ({reviews.length})
        </button>
        <button 
          className={`sub-tab-pill ${activeSubTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pending')}
        >
          Awaiting Your Review ({unreviewedBookings.length})
        </button>
      </div>

      {/* Pending Reviews Callout Banner if any */}
      {unreviewedBookings.length > 0 && activeSubTab === 'all' && (
        <div className="pending-reviews-banner">
          <div className="pending-banner-left">
            <Sparkles size={20} color="var(--accent-gold)" />
            <div>
              <strong>You have {unreviewedBookings.length} unreviewed completed service{unreviewedBookings.length > 1 ? 's' : ''}!</strong>
              <p>Share your honest experience and earn +25 SkillPoints reward for each review.</p>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveSubTab('pending')}
          >
            Review Now
          </button>
        </div>
      )}

      {activeSubTab === 'pending' ? (
        /* Pending reviews list */
        <div className="pending-reviews-grid">
          {unreviewedBookings.length === 0 ? (
            <div className="glass-card empty-state-box">
              <CheckCircle2 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <h3>All caught up!</h3>
              <p>You have submitted feedback for all your completed service bookings. Thank you for supporting verified professionals.</p>
            </div>
          ) : (
            unreviewedBookings.map((b) => (
              <div key={b.id} className="glass-card unreviewed-booking-card">
                <div className="unreviewed-header">
                  <div>
                    <span className="booking-id-tag">Completed Job #{b.id}</span>
                    <h3 style={{ fontSize: '1.15rem', marginTop: '0.3rem' }}>{b.serviceType}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Technician: <strong>{b.worker?.name || 'Technician'}</strong>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => onOpenReviewModal(b)}
                  >
                    <Star size={14} /> Write Review (+25 Pts)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Submitted reviews list */
        <div className="reviews-list-grid">
          {reviews.length === 0 ? (
            <div className="glass-card empty-state-box">
              <Star size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3>No reviews written yet</h3>
              <p>When you complete services with verified technicians, your ratings and written feedback will be displayed here.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="glass-card review-card">
                <div className="review-card-header">
                  <div className="review-tech-info">
                    <img 
                      src={r.technicianAvatar || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150"} 
                      alt={r.technicianName} 
                      className="review-tech-thumb"
                    />
                    <div>
                      <h4 className="review-tech-name">{r.technicianName}</h4>
                      <span className="review-service-tag">{r.serviceName}</span>
                    </div>
                  </div>

                  <div className="review-stars-display">
                    <div className="star-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          color={star <= r.rating ? 'var(--accent-gold)' : 'var(--text-muted)'} 
                          fill={star <= r.rating ? 'var(--accent-gold)' : 'transparent'} 
                        />
                      ))}
                    </div>
                    <span className="review-date-text">{r.date || 'Aug 2026'}</span>
                  </div>
                </div>

                <p className="review-comment-body">"{r.comment}"</p>

                {r.tags && r.tags.length > 0 && (
                  <div className="review-tags-row">
                    {r.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="review-badge-tag">
                        <ThumbsUp size={11} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
