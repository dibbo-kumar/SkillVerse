import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  FileText, 
  Building, 
  Award, 
  Clock, 
  CheckCircle2, 
  Heart, 
  Gift, 
  CreditCard, 
  Star, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function CustomerOverview({
  user,
  bookings = [],
  serviceHistory = [],
  properties = [],
  savedWorkerIds = [],
  reviews = [],
  rewards = { points: 450, tier: 'Gold Tier Member' },
  onNavigateTab,
  onOpenBookingModal,
  onOpenAddProperty,
  onOpenAddAddress
}) {
  const activeBookings = bookings.filter(b => ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COUNTERED'].includes(b.status));
  const completedServicesCount = serviceHistory.length || bookings.filter(b => b.status === 'COMPLETED').length;
  const totalSpent = serviceHistory.reduce((sum, item) => sum + (item.total || item.estimatedCost || 0), 0) +
    bookings.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + (b.estimatedCost || 0), 0);

  // Generate recent activity items from bookings and service records
  const recentActivities = [
    ...bookings.slice(0, 3).map(b => ({
      id: `booking-${b.id}`,
      type: 'booking',
      title: `${b.serviceType} with ${b.worker?.name || 'Technician'}`,
      status: b.status,
      date: 'Recent',
      icon: Clock,
      color: 'var(--primary)',
      action: () => onNavigateTab('bookings')
    })),
    ...properties.flatMap(p => (p.appliances || []).filter(a => a.maintenanceDue).map(a => ({
      id: `maint-${a.id}`,
      type: 'maintenance',
      title: `Maintenance due for ${a.name} (${p.name})`,
      status: 'DUE SOON',
      date: 'Recommended this week',
      icon: AlertTriangle,
      color: 'var(--accent-gold)',
      action: () => onNavigateTab('properties')
    }))),
    {
      id: 'reward-act',
      type: 'reward',
      title: 'Earned +50 SkillPoints for seasonal home inspection',
      status: '+50 PTS',
      date: 'Yesterday',
      icon: Gift,
      color: 'var(--accent-blue)',
      action: () => onNavigateTab('rewards')
    }
  ].slice(0, 4);

  return (
    <div className="customer-overview">
      {/* Customer Hero Profile Header */}
      <div className="glass-card overview-hero-card">
        <div className="overview-hero-content">
          <div className="overview-avatar-wrapper">
            <img 
              src={user?.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt={user?.name} 
              className="overview-avatar"
            />
            {user?.verified && (
              <span className="overview-verified-badge" title="NID Verified Citizen">
                <ShieldCheck size={14} color="#0b0f19" />
              </span>
            )}
          </div>

          <div className="overview-user-info">
            <div className="overview-user-title-row">
              <h2 className="overview-user-name">{user?.name || "Customer"}</h2>
              <span className="badge badge-verified">
                <ShieldCheck size={13} /> {user?.verified ? 'Verified Customer' : 'Unverified'}
              </span>
              <span className="badge badge-gold">
                <Award size={13} /> {rewards.tier || 'Gold Member'}
              </span>
            </div>

            <p className="overview-user-meta">
              <span>Phone: <strong>{user?.phone || '01811223344'}</strong></span> • 
              <span> Email: <strong>{user?.email || 'customer@skillverse.com'}</strong></span> • 
              <span> Member since <strong>2024</strong></span>
            </p>

            <div className="overview-quick-badges">
              <span className="overview-mini-tag">
                <Building size={13} /> {properties.length} Properties Registered
              </span>
              <span className="overview-mini-tag">
                <Heart size={13} color="var(--accent-rose)" /> {savedWorkerIds.length} Saved Technicians
              </span>
              <span className="overview-mini-tag">
                <Gift size={13} color="var(--accent-gold)" /> {rewards.points} SkillPoints
              </span>
            </div>
          </div>

          <div className="overview-header-actions">
            <button className="btn btn-secondary" onClick={() => onNavigateTab('settings')}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Statistics Grid */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => onNavigateTab('bookings')}>
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary)' }}>
            <Calendar size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Active Bookings</span>
            <div className="metric-number" style={{ color: 'var(--primary)' }}>{activeBookings.length}</div>
            <span className="metric-subtext">Live tracking enabled</span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateTab('history')}>
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-blue)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Completed Services</span>
            <div className="metric-number">{completedServicesCount}</div>
            <span className="metric-subtext">With verified warranty</span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateTab('properties')}>
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-gold)' }}>
            <Building size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Managed Properties</span>
            <div className="metric-number">{properties.length}</div>
            <span className="metric-subtext">
              {properties.reduce((acc, p) => acc + (p.appliances ? p.appliances.length : 0), 0)} appliances tracked
            </span>
          </div>
        </div>

        <div className="metric-card" onClick={() => onNavigateTab('reviews')}>
          <div className="metric-icon-box" style={{ background: 'rgba(244, 63, 94, 0.12)', color: 'var(--accent-rose)' }}>
            <Star size={22} />
          </div>
          <div className="metric-details">
            <span className="metric-label">My Reviews & Rating</span>
            <div className="metric-number">{reviews.length}</div>
            <span className="metric-subtext">Technician feedback</span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 className="section-title">
          <Zap size={20} color="var(--primary)" />
          Quick Actions & Service Management
        </h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => onNavigateTab('find-services')}>
            <div className="qa-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)' }}>
              <Search size={20} />
            </div>
            <div className="qa-text">
              <strong>Find Service</strong>
              <span>Search verified technicians</span>
            </div>
            <ArrowRight size={16} className="qa-arrow" />
          </button>

          <button className="quick-action-btn" onClick={() => onNavigateTab('bookings')}>
            <div className="qa-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
              <Calendar size={20} />
            </div>
            <div className="qa-text">
              <strong>My Bookings</strong>
              <span>Track live service progress</span>
            </div>
            <ArrowRight size={16} className="qa-arrow" />
          </button>

          <button className="quick-action-btn" onClick={() => onNavigateTab('history')}>
            <div className="qa-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <FileText size={20} />
            </div>
            <div className="qa-text">
              <strong>Service History</strong>
              <span>Invoices, parts & warranties</span>
            </div>
            <ArrowRight size={16} className="qa-arrow" />
          </button>

          <button className="quick-action-btn" onClick={() => onNavigateTab('properties')}>
            <div className="qa-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Building size={20} />
            </div>
            <div className="qa-text">
              <strong>Add Property / Appliance</strong>
              <span>Set up maintenance schedules</span>
            </div>
            <ArrowRight size={16} className="qa-arrow" />
          </button>
        </div>
      </div>

      {/* Two Column Section: Recent Activity & Maintenance Reminders */}
      <div className="overview-columns-grid">
        {/* Recent Activity Timeline */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              <Clock size={20} color="var(--primary)" />
              Recent Activity Feed
            </h3>
            <button className="btn btn-text" onClick={() => onNavigateTab('history')} style={{ fontSize: '0.85rem' }}>
              View All History <ArrowRight size={14} />
            </button>
          </div>

          <div className="activity-feed">
            {recentActivities.length === 0 ? (
              <div className="empty-state-small">No recent activity logged yet.</div>
            ) : (
              recentActivities.map((act) => {
                const IconComponent = act.icon;
                return (
                  <div key={act.id} className="activity-item" onClick={act.action}>
                    <div className="activity-icon-wrap" style={{ color: act.color }}>
                      <IconComponent size={18} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{act.title}</div>
                      <div className="activity-meta">
                        <span>{act.date}</span>
                      </div>
                    </div>
                    <span className="activity-status-badge">{act.status}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Preventative Maintenance & Equipment Status */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>
              <AlertTriangle size={20} color="var(--accent-gold)" />
              Appliance Maintenance Alerts
            </h3>
            <button className="btn btn-text" onClick={() => onNavigateTab('properties')} style={{ fontSize: '0.85rem' }}>
              Manage Assets <ArrowRight size={14} />
            </button>
          </div>

          <div className="maintenance-alert-list">
            {properties.flatMap(p => (p.appliances || []).map(a => ({ ...a, propertyName: p.name, propertyAddress: p.address }))).slice(0, 3).map((appliance) => (
              <div key={appliance.id} className={`maintenance-alert-card ${appliance.maintenanceDue ? 'urgent' : ''}`}>
                <div className="alert-header">
                  <div>
                    <strong>{appliance.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Location: {appliance.propertyName} ({appliance.brand || 'Standard'})
                    </div>
                  </div>
                  {appliance.maintenanceDue ? (
                    <span className="badge badge-warning">Due for Service</span>
                  ) : (
                    <span className="badge badge-verified">Optimal Health</span>
                  )}
                </div>

                <div className="alert-details-row">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Service:</span>
                    <div style={{ fontSize: '0.85rem' }}>{appliance.lastServiceDate || 'Not recorded'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Recommended:</span>
                    <div style={{ fontSize: '0.85rem', color: appliance.maintenanceDue ? 'var(--accent-gold)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                      {appliance.nextServiceDate || 'In 3 months'}
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      onOpenBookingModal({
                        serviceType: `${appliance.category || 'Appliance'} Maintenance`,
                        description: `Routine scheduled servicing for ${appliance.name} at ${appliance.propertyName} (${appliance.propertyAddress})`,
                        suggestedCost: 800
                      });
                    }}
                  >
                    Book Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
