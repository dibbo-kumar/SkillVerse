import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Award, 
  Phone, 
  Calendar, 
  Zap, 
  Trash2,
  Sparkles
} from 'lucide-react';

export default function SavedTechnicians({
  workers = [],
  savedWorkerIds = [],
  onToggleSaveWorker,
  onOpenBookingModal,
  onNavigateTab
}) {
  const savedWorkers = workers.filter(w => savedWorkerIds.includes(w.id || w.user?.id));

  return (
    <div className="saved-technicians-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <Heart size={24} color="var(--accent-rose)" />
            Saved & Trusted Technicians
          </h2>
          <p className="section-subtitle">
            Quickly re-book your preferred verified pros who provided 5-star service for your previous maintenance tasks.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => onNavigateTab('find-services')}>
          Explore More Technicians
        </button>
      </div>

      {savedWorkers.length === 0 ? (
        <div className="glass-card empty-state-box">
          <Heart size={48} color="var(--accent-rose)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No saved technicians yet</h3>
          <p>When you find skilled technicians you like, tap the heart icon on their card to save them here for instant 1-click rebooking.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1rem' }}
            onClick={() => onNavigateTab('find-services')}
          >
            Browse Verified Technicians
          </button>
        </div>
      ) : (
        <div className="saved-workers-grid">
          {savedWorkers.map((w) => (
            <div key={w.id} className="glass-card saved-worker-card">
              <div className="saved-worker-header">
                <div className="worker-avatar-wrap">
                  <img 
                    src={w.user?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150"} 
                    alt={w.user?.name} 
                    className="saved-worker-img"
                  />
                  {w.user?.verified && (
                    <span className="verified-pip" title="NID Verified">
                      <ShieldCheck size={12} color="#0b0f19" />
                    </span>
                  )}
                </div>

                <div className="worker-header-details">
                  <div className="worker-badge-row">
                    <span className="badge badge-verified">
                      <ShieldCheck size={11} /> Verified Pro
                    </span>
                    <span className="badge badge-gold">
                      {w.careerLevel || 'Master'}
                    </span>
                  </div>
                  <h3 className="worker-name">{w.user?.name}</h3>
                  <div className="worker-rating-row">
                    <Star size={14} color="var(--accent-gold)" fill="var(--accent-gold)" />
                    <span className="rating-score">{w.user?.rating || 4.9}</span>
                    <span className="rating-jobs">({w.experienceYears || 5}+ yrs experience)</span>
                  </div>
                </div>

                <button 
                  className="saved-heart-btn active"
                  title="Remove from saved"
                  onClick={() => onToggleSaveWorker(w.id || w.user?.id)}
                >
                  <Heart size={18} fill="var(--accent-rose)" color="var(--accent-rose)" />
                </button>
              </div>

              <div className="saved-worker-body">
                <div className="worker-skill-chips">
                  {(w.skills || 'Electrical, Plumbing').split(',').map((skill, sIdx) => (
                    <span key={sIdx} className="skill-chip">{skill.trim()}</span>
                  ))}
                </div>

                <div className="worker-info-list">
                  <div className="worker-info-item">
                    <MapPin size={14} color="var(--text-muted)" />
                    <span>{w.serviceArea || 'Dhaka North (Gulshan, Banani, Uttara)'}</span>
                  </div>
                  <div className="worker-info-item">
                    <Phone size={14} color="var(--text-muted)" />
                    <span>{w.user?.phone || '01911223344'}</span>
                  </div>
                </div>

                <div className="worker-pricing-row">
                  <div>
                    <span className="price-label">Starting Rate</span>
                    <div className="hourly-rate">৳{w.hourlyRate || 450} <span className="rate-unit">/ hour</span></div>
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      onOpenBookingModal({
                        worker: w,
                        serviceType: (w.skills || 'General Repair').split(',')[0],
                        suggestedCost: (w.hourlyRate || 450) * 3
                      });
                    }}
                  >
                    <Zap size={14} /> Book Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
