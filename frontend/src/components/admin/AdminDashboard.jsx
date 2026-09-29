import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, Calendar, DollarSign,
  GraduationCap, Wrench, BarChart3, Bell, Settings, Search,
  Filter, CheckCircle2, XCircle, AlertTriangle, ArrowUpRight,
  TrendingUp, Clock, Eye, MoreHorizontal, RefreshCw, Key,
  Lock, Phone, Mail, MapPin, Award, Check, X, ChevronRight,
  FileText, ArrowDownRight, Layers, Smartphone, Wallet,
  SlidersHorizontal, CheckCheck, UserCheck, UserX, AlertCircle,
  Shield, Download, Send, Globe
} from 'lucide-react';
import AdminAcademyManager from '../academy/AdminAcademyManager';
import AdminStoreManager from '../store/AdminStoreManager';

const API_BASE = "http://localhost:8081/api";

export default function AdminDashboard({ currentUser, onShowToast }) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('skillverse_admin_active_tab') || 'overview';
  });
  const [loading, setLoading] = useState(true);
  const mainContentRef = React.useRef(null);

  // Sync activeTab to localStorage and scroll to top
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('skillverse_admin_active_tab', activeTab);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Core Data States
  const [overviewData, setOverviewData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [allVerificationRequests, setAllVerificationRequests] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [financeData, setFinanceData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30D');
  const [auditLogs, setAuditLogs] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({});

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  const [verifStatusFilter, setVerifStatusFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [bookingSearch, setBookingSearch] = useState('');

  const [logSearch, setLogSearch] = useState('');

  // Modal / Detail States
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedVerifReq, setSelectedVerifReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [decisionAction, setDecisionAction] = useState('REJECTED'); // REJECTED, CORRECTION_REQUIRED, SUSPENDED
  const [targetRejectType, setTargetRejectType] = useState('VERIFICATION'); // VERIFICATION or WITHDRAWAL
  const [targetRejectId, setTargetRejectId] = useState(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    platform_commission: '5',
    platform_name: 'SkillVerse Bangladesh',
    currency: 'BDT',
    emergency_hotline: '+880 1700 000000',
    max_active_jobs: '1',
    service_guarantee_days: '30'
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Refresh Trigger & live polling for admin view
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      if (activeTab === 'users' || activeTab === 'verification' || activeTab === 'overview') {
        fetchDashboardData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      if (activeTab === 'overview') {
        const res = await fetch(`${API_BASE}/admin/overview`);
        if (res.ok) setOverviewData(await res.json());
      } else if (activeTab === 'users') {
        const [uRes, vRes] = await Promise.all([
          fetch(`${API_BASE}/admin/users`),
          fetch(`${API_BASE}/admin/verification/requests?status=ALL`)
        ]);
        if (uRes.ok) setUsersList(await uRes.json());
        if (vRes.ok) setAllVerificationRequests(await vRes.json());
      } else if (activeTab === 'verification') {
        const res = await fetch(`${API_BASE}/admin/verification/requests?status=ALL`);
        if (res.ok) setAllVerificationRequests(await res.json());
      } else if (activeTab === 'bookings') {
        const res = await fetch(`${API_BASE}/admin/bookings?status=${bookingStatusFilter}`);
        if (res.ok) setBookingsList(await res.json());
      } else if (activeTab === 'finance') {
        const res = await fetch(`${API_BASE}/admin/finance`);
        if (res.ok) setFinanceData(await res.json());
      } else if (activeTab === 'analytics') {
        const res = await fetch(`${API_BASE}/admin/analytics?period=${analyticsPeriod}`);
        if (res.ok) setAnalyticsData(await res.json());
      } else if (activeTab === 'logs') {
        const res = await fetch(`${API_BASE}/admin/logs`);
        if (res.ok) setAuditLogs(await res.json());
      } else if (activeTab === 'settings') {
        const res = await fetch(`${API_BASE}/admin/settings`);
        if (res.ok) {
          const list = await res.json();
          const map = {};
          list.forEach(item => { map[item.settingKey] = item.settingValue; });
          setPlatformSettings(map);
          setSettingsForm(prev => ({ ...prev, ...map }));
        }
      }
    } catch (e) {
      console.error("Failed loading admin dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const displayedVerifRequests = verifStatusFilter === 'ALL'
    ? allVerificationRequests
    : allVerificationRequests.filter(r => r.status === verifStatusFilter);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetch(`${API_BASE}/admin/bookings?status=${bookingStatusFilter}`)
        .then(r => r.ok && r.json().then(data => setBookingsList(data)))
        .catch(console.error);
    }
  }, [bookingStatusFilter]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetch(`${API_BASE}/admin/analytics?period=${analyticsPeriod}`)
        .then(r => r.ok && r.json().then(data => setAnalyticsData(data)))
        .catch(console.error);
    }
  }, [analyticsPeriod]);

  // --- ACTIONS ---

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/status?status=${nextStatus}`, { method: 'PUT' });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => ({ ...prev, status: nextStatus }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveVerification = async (reqId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/verification/${reqId}/decision?decision=APPROVED`, { method: 'PUT' });
      if (res.ok) {
        const approvedData = await res.json();
        const updatedUser = approvedData.request?.user;
        if (updatedUser) {
          setUsersList(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser, nidNumber: updatedUser.nidNumber, isVerified: true, verified: true } : u));
        }
        fetchDashboardData();
        setSelectedVerifReq(null);
        if (onShowToast) onShowToast("NID Request Approved", "The user's NID and verification status have been approved and updated.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectPrompt = (type, id) => {
    setTargetRejectType(type);
    setTargetRejectId(id);
    setDecisionAction('REJECTED');
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleDecisionPrompt = (action, type, id) => {
    setTargetRejectType(type);
    setTargetRejectId(id);
    setDecisionAction(action);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!targetRejectId) return;
    try {
      if (targetRejectType === 'VERIFICATION') {
        const res = await fetch(`${API_BASE}/admin/verification/${targetRejectId}/decision?decision=${decisionAction}&reason=${encodeURIComponent(rejectReason)}`, { method: 'PUT' });
        if (res.ok) {
          fetchDashboardData();
          setShowRejectModal(false);
          setSelectedVerifReq(null);
        }
      } else if (targetRejectType === 'WITHDRAWAL') {
        const res = await fetch(`${API_BASE}/admin/withdrawals/${targetRejectId}/reject?reason=${encodeURIComponent(rejectReason)}`, { method: 'PUT' });
        if (res.ok) {
          fetchDashboardData();
          setShowRejectModal(false);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveWithdrawal = async (txId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals/${txId}/approve`, { method: 'PUT' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper for Booking Timeline Visualizer
  const getBookingTimelineStages = (status) => {
    const STAGES = [
      { key: 'PENDING', label: 'Requested' },
      { key: 'CONFIRMED', label: 'Confirmed' },
      { key: 'ON_THE_WAY', label: 'On The Way' },
      { key: 'ARRIVED', label: 'Arrived' },
      { key: 'IN_PROGRESS', label: 'In Progress' },
      { key: 'COMPLETION_REQUESTED', label: 'Verifying' },
      { key: 'COMPLETED', label: 'Completed' },
      { key: 'PAID', label: 'Settled' }
    ];

    const orderMap = {
      'PENDING': 0, 'NEGOTIATING': 0, 'PRICE_AGREED': 1, 'CONFIRMED': 1,
      'ON_THE_WAY': 2, 'ARRIVED': 3, 'IN_PROGRESS': 4,
      'COMPLETION_REQUESTED': 5, 'COMPLETED': 6, 'PAID': 7, 'CANCELLED': -1
    };

    const currentIdx = orderMap[status] ?? 0;
    return STAGES.map((s, idx) => ({
      ...s,
      isCompleted: status !== 'CANCELLED' && idx <= currentIdx,
      isCurrent: status !== 'CANCELLED' && idx === currentIdx
    }));
  };

  // Helper Status Badge renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">Pending</span>;
      case 'NEGOTIATING': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>Negotiating</span>;
      case 'CONFIRMED': return <span className="badge badge-verified">Confirmed</span>;
      case 'ON_THE_WAY': return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>On The Way</span>;
      case 'ARRIVED': return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>Arrived</span>;
      case 'IN_PROGRESS': return <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>In Progress</span>;
      case 'COMPLETION_REQUESTED': return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>OTP Verification</span>;
      case 'COMPLETED': return <span className="badge badge-verified">Completed</span>;
      case 'PAID': return <span className="badge badge-gold">Paid & Settled</span>;
      case 'CANCELLED': return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>Cancelled</span>;
      case 'APPROVED': return <span className="badge badge-verified">Approved ✓</span>;
      case 'CORRECTION_REQUIRED': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>⚠️ Correction Required</span>;
      case 'UNDER_REVIEW': return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>⏳ Under Review</span>;
      case 'UNVERIFIED': return <span className="badge" style={{ background: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' }}>Unverified</span>;
      case 'REJECTED': return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>Rejected ✕</span>;
      case 'ACTIVE': return <span className="badge badge-verified">Active</span>;
      case 'SUSPENDED': return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>Suspended 🚫</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: usersList.length || null },
    { id: 'verification', label: 'Worker Verification', icon: ShieldCheck, badge: overviewData?.pendingVerifications || null, alert: (overviewData?.pendingVerifications > 0) },
    { id: 'bookings', label: 'Bookings', icon: Calendar, badge: overviewData?.activeBookings || null },
    { id: 'finance', label: 'Finance', icon: DollarSign, badge: overviewData?.pendingWithdrawals || null },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'store', label: 'Tool Store', icon: Wrench, badge: overviewData?.lowStockToolsCount || null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Activity Logs', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: 'var(--bg-primary)' }}>
      {/* --- ADMIN SIDEBAR NAVIGATION --- */}
      <aside style={{
        width: '260px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0.8rem',
        gap: '0.4rem',
        flexShrink: 0
      }}>
        <div style={{ padding: '0 0.8rem 1.2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-heading)' }}>Control Center</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Superadmin Workspace</div>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.05))' : 'transparent',
                  color: isActive ? '#f59e0b' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={17} color={isActive ? '#f59e0b' : 'currentColor'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '10px',
                    background: item.alert ? '#ef4444' : isActive ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                    color: item.alert || !isActive ? '#ffffff' : '#000000'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health Badge */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          padding: '0.8rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: 'auto'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <div>
            <span style={{ color: '#10b981', fontWeight: 'bold', display: 'block' }}>All Services Live</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>REST API v2.4 • H2 Database</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main ref={mainContentRef} style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 72px)' }}>
        
        {/* ========================================================================= */}
        {/* 1. OVERVIEW DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>Platform Overview</span>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>Live Control</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.85rem' }}>
                  Real-time status across customers, verified workers, escrow contracts, and financial volume.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                <RefreshCw size={14} /> Refresh Metrics
              </button>
            </div>

            {/* Summary KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              
              <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Total Customers</span>
                  <Users size={16} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>{overviewData?.totalCustomers ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.3rem' }}>Registered Service Requesters</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #10b981', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Total Technicians</span>
                  <Wrench size={16} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>{overviewData?.totalWorkers ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.3rem' }}>Registered Field Workers</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('verification')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Pending Verifications</span>
                  <ShieldCheck size={16} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: overviewData?.pendingVerifications > 0 ? '#f59e0b' : '#ffffff' }}>
                  {overviewData?.pendingVerifications ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '0.3rem' }}>NID Approvals Required →</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6', padding: '1.25rem', cursor: 'pointer' }} onClick={() => setActiveTab('bookings')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Active Jobs</span>
                  <Calendar size={16} color="#8b5cf6" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>{overviewData?.activeBookings ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '0.3rem' }}>In Progress / On The Way</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #06b6d4', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Total Service Volume</span>
                  <DollarSign size={16} color="#06b6d4" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>৳{overviewData?.totalRevenue?.toLocaleString() ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#22d3ee', marginTop: '0.3rem' }}>Completed Gross Volume</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #ec4899', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Platform Revenue (5%)</span>
                  <TrendingUp size={16} color="#ec4899" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>৳{overviewData?.platformRevenue?.toLocaleString() ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Net Commission Earned</div>
              </div>

            </div>

            {/* Critical Alerts Banner (if any pending actions) */}
            {((overviewData?.pendingVerifications > 0) || (overviewData?.pendingWithdrawals > 0) || (overviewData?.lowStockToolsCount > 0)) && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px', padding: '1rem 1.4rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <AlertCircle size={24} color="#ef4444" />
                  <div>
                    <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>Administrative Action Required</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                      {overviewData?.pendingVerifications > 0 && <span>• <strong>{overviewData.pendingVerifications}</strong> Worker NID Verification Queue</span>}
                      {overviewData?.pendingWithdrawals > 0 && <span>• <strong>{overviewData.pendingWithdrawals}</strong> Pending Payout Withdrawals</span>}
                      {overviewData?.lowStockToolsCount > 0 && <span>• <strong>{overviewData.lowStockToolsCount}</strong> Low Stock Store Products</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {overviewData?.pendingVerifications > 0 && (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('verification')}>
                      Review NIDs
                    </button>
                  )}
                  {overviewData?.pendingWithdrawals > 0 && (
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('finance')}>
                      Review Withdrawals
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Charts & Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Service Status Breakdown */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--primary)" /> Booking Pipeline Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {Object.entries(overviewData?.statusDistribution || { 'PENDING': 2, 'CONFIRMED': 4, 'IN_PROGRESS': 3, 'COMPLETED': 8 }).map(([st, cnt]) => {
                    const total = overviewData?.totalBookings || 15;
                    const pct = Math.round((cnt / (total || 1)) * 100);
                    return (
                      <div key={st}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 600 }}>{st.replace(/_/g, ' ')}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{cnt} jobs ({pct}%)</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: st.includes('COMPLET') || st === 'PAID' ? 'var(--primary)' : st === 'CANCELLED' ? '#ef4444' : '#3b82f6' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service Category Demand */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="#f59e0b" /> Most Demanded Maintenance Trades
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(overviewData?.servicePopularity || { 'HVAC & AC': 6, 'Plumbing': 4, 'Electrical': 3, 'Painting': 2 }).map(([cat, cnt], idx) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f59e0b' }}>#{idx + 1}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat}</span>
                      </div>
                      <span className="badge badge-pending">{cnt} Requests</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recent Live Platform Streams */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              
              {/* Recent Bookings Stream */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Service Bookings</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('bookings')}>
                    View All →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(overviewData?.recentBookings || []).slice(0, 5).map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.serviceType}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {b.customer?.name} → {b.worker?.name || 'Unassigned'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>৳{b.agreedCost || b.estimatedCost}</div>
                        {renderStatusBadge(b.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit Trail Feed */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Activity & Security Logs</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('logs')}>
                    Audit Trail →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(overviewData?.recentLogs || []).slice(0, 5).map((log, idx) => (
                    <div key={idx} style={{ padding: '0.55rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #f59e0b', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        <span><strong>{log.actorName}</strong> ({log.actorRole})</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ color: 'var(--text-primary)', marginTop: '0.2rem' }}>{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. USER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>User & Identity Directory</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                  View customer profiles, technician records, ratings, and manage security authorizations.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={14} /> Refresh Directory
              </button>
            </div>

            {/* Pending NID Change Requests Section */}
            {allVerificationRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <div className="glass-card" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} color="#f59e0b" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
                      Pending NID Change & Verification Requests ({allVerificationRequests.filter(r => r.status === 'PENDING').length})
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Admin approval required to apply new NID numbers
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {allVerificationRequests.filter(r => r.status === 'PENDING').map(req => {
                    const u = req.user || {};
                    return (
                      <div key={req.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <img src={req.profileSelfiePhoto || u.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt={req.fullName || u.name} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{req.fullName || u.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.role || 'USER'} • Phone: {req.phone || u.phone}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: '6px', marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Current NID:</span>
                              <span style={{ fontFamily: 'monospace' }}>{u.nidNumber || 'None / Unset'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#f59e0b', fontWeight: 600 }}>Requested NID:</span>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>{req.nidNumber}</span>
                            </div>
                            {req.adminRemarks && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.3rem' }}>
                                Note: {req.adminRemarks}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={() => handleRejectPrompt('VERIFICATION', req.id)}>
                            <XCircle size={13} /> Deny
                          </button>
                          <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => handleApproveVerification(req.id)}>
                            <CheckCircle2 size={13} /> Approve NID
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 280px' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                  placeholder="Search by name, email, phone, or NID..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>

              {/* Role filter */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role:</span>
                {['ALL', 'CUSTOMER', 'WORKER', 'ADMIN'].map(role => (
                  <button
                    key={role}
                    className={`btn ${userRoleFilter === role ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                    onClick={() => setUserRoleFilter(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                {['ALL', 'ACTIVE', 'SUSPENDED'].map(st => (
                  <button
                    key={st}
                    className={`btn ${userStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                    onClick={() => setUserStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.9rem 1.2rem' }}>User</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Role</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Contact</th>
                      <th style={{ padding: '0.9rem 1rem' }}>NID Verification</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Jobs / Activity</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Account Status</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => {
                        if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                        if (userStatusFilter !== 'ALL' && u.status !== userStatusFilter) return false;
                        if (userSearch.trim()) {
                          const q = userSearch.toLowerCase();
                          return (u.name || '').toLowerCase().includes(q) ||
                                 (u.email || '').toLowerCase().includes(q) ||
                                 (u.phone || '').toLowerCase().includes(q) ||
                                 (u.nidNumber || '').toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map(u => {
                        const userPendingReq = allVerificationRequests.find(r => (r.user?.id === u.id || r.userId === u.id) && r.status === 'PENDING');
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.1s ease' }}>
                            <td style={{ padding: '0.9rem 1.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={u.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt={u.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{u.name}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>User ID: #{u.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              <span className={`badge ${u.role === 'ADMIN' ? 'badge-gold' : u.role === 'WORKER' ? 'badge-pending' : 'badge-verified'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              <div>{u.email}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone}</div>
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              {u.isVerified ? (
                                <span className="badge badge-verified"><CheckCircle2 size={12} /> Verified</span>
                              ) : (
                                <span className="badge badge-pending">Unverified</span>
                              )}
                              {u.nidNumber && <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{u.nidNumber}</div>}
                              {userPendingReq && (
                                <div style={{ marginTop: '0.4rem' }}>
                                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                                    ⏳ Req NID: {userPendingReq.nidNumber}
                                  </span>
                                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                                    <button
                                      className="btn btn-primary"
                                      style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem', lineHeight: 1 }}
                                      onClick={() => handleApproveVerification(userPendingReq.id)}
                                      title="Approve NID Change"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem', lineHeight: 1, color: '#ef4444' }}
                                      onClick={() => handleRejectPrompt('VERIFICATION', userPendingReq.id)}
                                      title="Deny NID Change"
                                    >
                                      Deny
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              {u.role === 'WORKER' ? (
                                <div><strong>{u.completedJobs || 0}</strong> completed ({u.totalJobs || 0} total)</div>
                              ) : (
                                <div><strong>{u.totalBookings || 0}</strong> bookings (৳{u.totalSpent || 0} spent)</div>
                              )}
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              {renderStatusBadge(u.status || 'ACTIVE')}
                            </td>
                            <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                                  onClick={() => setSelectedUser(u)}
                                  title="View Details & History"
                                >
                                  <Eye size={13} /> Details
                                </button>
                                {u.role !== 'ADMIN' && (
                                  <button
                                    className="btn btn-secondary"
                                    style={{
                                      padding: '0.35rem 0.65rem',
                                      fontSize: '0.75rem',
                                      color: u.status === 'SUSPENDED' ? '#10b981' : '#ef4444',
                                      borderColor: u.status === 'SUSPENDED' ? '#10b981' : '#ef4444'
                                    }}
                                    onClick={() => handleToggleUserStatus(u.id, u.status || 'ACTIVE')}
                                  >
                                    {u.status === 'SUSPENDED' ? <UserCheck size={13} /> : <UserX size={13} />}
                                    {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Details Modal Drawer */}
            {selectedUser && (
              <div className="toast-popup-overlay" onClick={() => setSelectedUser(null)}>
                <div className="glass-card" style={{ maxWidth: '560px', width: '100%', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={selectedUser.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt={selectedUser.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                      <div>
                        <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{selectedUser.name}</h2>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role: <strong>{selectedUser.role}</strong> • Status: {renderStatusBadge(selectedUser.status)}</div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <XCircle size={22} />
                    </button>
                  </div>

                  {(() => {
                    const modalPendingReq = allVerificationRequests.find(r => (r.user?.id === selectedUser.id || r.userId === selectedUser.id) && r.status === 'PENDING');
                    return modalPendingReq ? (
                      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                          <AlertTriangle size={16} /> Pending NID Change Request
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                          Requested New NID: <strong style={{ color: 'var(--text-heading)', fontFamily: 'monospace' }}>{modalPendingReq.nidNumber}</strong> (Submitted: {modalPendingReq.submittedAt ? new Date(modalPendingReq.submittedAt).toLocaleString() : 'Recently'})
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }} onClick={() => handleRejectPrompt('VERIFICATION', modalPendingReq.id)}>
                            Deny Request
                          </button>
                          <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleApproveVerification(modalPendingReq.id)}>
                            Approve NID Change
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Phone:</strong> {selectedUser.phone}</div>
                    <div><strong>National NID:</strong> {selectedUser.nidNumber || 'Not verified'}</div>
                    <div><strong>Rating:</strong> ⭐ {selectedUser.rating || 5.0} / 5.0</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selectedUser.address}</div>
                  </div>

                  {selectedUser.role === 'WORKER' && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                      <h4 style={{ color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>Technician Professional Specs</h4>
                      <div><strong>Skills:</strong> {selectedUser.skills || 'Electrical, AC Repair'}</div>
                      <div><strong>Career Level:</strong> {selectedUser.careerLevel || 'Gold Rank'}</div>
                      <div><strong>Hourly Base Rate:</strong> ৳{selectedUser.hourlyRate || 400}/hr</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
                    <button
                      className="btn btn-secondary"
                      style={{ color: selectedUser.status === 'SUSPENDED' ? '#10b981' : '#ef4444' }}
                      onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.status || 'ACTIVE')}
                    >
                      {selectedUser.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. WORKER VERIFICATION */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 3. WORKER VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === 'verification' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={26} color="#f59e0b" /> Technician Verification Hub & Safety Control
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                  Review biometric identity, home addresses, professional skills, and payout credentials before granting entry into customer homes.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={14} /> Refresh Queue
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', overflowX: 'auto' }}>
              {[
                { key: 'PENDING', label: `⏳ Pending Review (${allVerificationRequests.filter(r => r.status === 'PENDING').length})` },
                { key: 'CORRECTION_REQUIRED', label: `⚠️ Correction Required (${allVerificationRequests.filter(r => r.status === 'CORRECTION_REQUIRED').length})` },
                { key: 'APPROVED', label: `✓ Approved & Certified (${allVerificationRequests.filter(r => r.status === 'APPROVED').length})` },
                { key: 'REJECTED', label: `✕ Rejected (${allVerificationRequests.filter(r => r.status === 'REJECTED').length})` },
                { key: 'SUSPENDED', label: `🚫 Suspended (${allVerificationRequests.filter(r => r.status === 'SUSPENDED').length})` },
                { key: 'ALL', label: `All Applications (${allVerificationRequests.length})` }
              ].map(f => (
                <button
                  key={f.key}
                  className={`btn ${verifStatusFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  onClick={() => setVerifStatusFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Verification Cards List - Overview Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {displayedVerifRequests.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={44} color="var(--primary)" style={{ margin: '0 auto 0.8rem', opacity: 0.7 }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>No requests in this queue</div>
                  <div style={{ fontSize: '0.85rem' }}>All submitted technician applications in this category have been processed.</div>
                </div>
              ) : (
                displayedVerifRequests.map(req => {
                  const applicant = req.user || {};
                  return (
                    <div
                      key={req.id}
                      className="glass-card"
                      style={{
                        borderLeft: req.status === 'PENDING'
                          ? '5px solid #f59e0b'
                          : req.status === 'APPROVED'
                          ? '5px solid #10b981'
                          : req.status === 'CORRECTION_REQUIRED'
                          ? '5px solid #f97316'
                          : '5px solid #ef4444',
                        padding: '1.4rem 1.6rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* 1. Header Overview: Avatar, Name, Status & Identity */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'center' }}>
                          <img
                            src={req.profileSelfiePhoto || applicant.profilePicture || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"}
                            alt={req.fullName || applicant.name}
                            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(245,158,11,0.5)' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-heading)', fontWeight: 700 }}>
                                {req.fullName || applicant.name || "Identity Candidate"}
                              </h3>
                              {applicant.role && (
                                <span className={`badge ${applicant.role === 'WORKER' ? 'badge-pending' : 'badge-verified'}`} style={{ fontSize: '0.72rem' }}>
                                  {applicant.role === 'WORKER' ? 'Technician' : 'Customer'}
                                </span>
                              )}
                              {renderStatusBadge(req.status)}
                              {req.phoneVerified && (
                                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle2 size={12} /> Phone Verified
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                              Phone: <strong style={{ color: 'var(--text-heading)' }}>{req.phone || applicant.phone}</strong> • Email: <strong style={{ color: 'var(--text-heading)' }}>{applicant.email}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>National NID Number</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                            {req.nidNumber || applicant.nidNumber || "19942618954712365"}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Submitted: {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : 'Recently'}
                          </div>
                        </div>
                      </div>

                      {/* 2. Compact Overview Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: '0.82rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>TRADE / SPECIALIZATION</span>
                          <strong style={{ color: 'var(--text-heading)' }}>{req.skills || "AC Repair & Electrical"}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>EXPERIENCE</span>
                          <strong style={{ color: 'var(--primary)' }}>{req.experienceYears || 5}+ Years Field Exp</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>SERVICE CITY / AREA</span>
                          <strong style={{ color: 'var(--text-heading)' }}>{req.cityArea || "Uttara"}, {req.division || "Dhaka"}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>PAYOUT METHOD</span>
                          <strong style={{ color: 'var(--accent-gold)' }}>{req.payoutMethod || "bKash"} ({req.payoutAccount || applicant.phone || '019...'})</strong>
                        </div>
                      </div>

                      {/* 3. Admin Remarks if present */}
                      {req.adminRemarks && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderLeft: '3px solid #f59e0b', padding: '0.6rem 0.9rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8rem' }}>
                          <strong style={{ color: '#f59e0b' }}>Admin Feedback:</strong> <span style={{ color: 'var(--text-heading)' }}>{req.adminRemarks}</span>
                        </div>
                      )}

                      {/* 4. Action Bar (Direct Actions + Full Details View) */}
                      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '0.9rem' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          onClick={() => setSelectedVerifReq(req)}
                        >
                          <Eye size={14} /> View Full Details & Documents
                        </button>

                        {req.status !== 'APPROVED' && (
                          <button
                            className="btn btn-secondary"
                            style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                            onClick={() => handleApproveVerification(req.id)}
                            title="Approve without opening details"
                          >
                            <CheckCircle2 size={14} /> Quick Approve
                          </button>
                        )}

                        <button
                          className="btn btn-secondary"
                          style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                          onClick={() => handleDecisionPrompt('CORRECTION_REQUIRED', 'VERIFICATION', req.id)}
                        >
                          <AlertCircle size={14} /> Request Correction
                        </button>

                        <button
                          className="btn btn-secondary"
                          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                          onClick={() => handleDecisionPrompt('REJECTED', 'VERIFICATION', req.id)}
                        >
                          <XCircle size={14} /> Reject
                        </button>

                        {req.status === 'APPROVED' && (
                          <button
                            className="btn btn-secondary"
                            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                            onClick={() => handleDecisionPrompt('SUSPENDED', 'VERIFICATION', req.id)}
                          >
                            <AlertCircle size={14} /> Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Document Inspection Lightbox Modal */}
            {selectedVerifReq && (
              <div className="toast-popup-overlay" onClick={() => setSelectedVerifReq(null)}>
                <div className="glass-card" style={{ maxWidth: '840px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Technician Security Audit: {selectedVerifReq.fullName || selectedVerifReq.user?.name}</h2>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        NID: <strong style={{ color: 'var(--accent-gold)' }}>{selectedVerifReq.nidNumber}</strong> • Status: {renderStatusBadge(selectedVerifReq.status)}
                      </div>
                    </div>
                    <button onClick={() => setSelectedVerifReq(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <XCircle size={24} />
                    </button>
                  </div>

                  {/* High-res Documents Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        National ID (Front Card)
                      </span>
                      <img src={selectedVerifReq.nidFrontPhoto || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"} alt="NID Front" style={{ width: '100%', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        National ID (Back Card)
                      </span>
                      <img src={selectedVerifReq.nidBackPhoto || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600"} alt="NID Back" style={{ width: '100%', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                    </div>
                  </div>

                  {/* Profile Selfie & Optional Proof */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Selfie / Live Photo</span>
                      <img src={selectedVerifReq.profileSelfiePhoto || selectedVerifReq.user?.profilePicture || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400"} alt="Selfie" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                    </div>
                    {selectedVerifReq.experienceCertPhoto && (
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Training / Experience Certificate</span>
                        <img src={selectedVerifReq.experienceCertPhoto} alt="Cert" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                    {selectedVerifReq.workProofPhoto && (
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Previous Work Photo</span>
                        <img src={selectedVerifReq.workProofPhoto} alt="Proof" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}
                  </div>

                  {/* Full Details Breakdown */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.4rem', borderRadius: '12px', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        👤 Legal Identity & Contact
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.95rem' }}>{selectedVerifReq.fullName || selectedVerifReq.user?.name}</div>
                      <div style={{ marginTop: '0.2rem' }}>Phone: <strong style={{ color: 'var(--text-heading)' }}>{selectedVerifReq.phone || selectedVerifReq.user?.phone}</strong> {selectedVerifReq.phoneVerified ? <span style={{ color: '#10b981' }}>✔ (OTP Verified)</span> : <span style={{ color: '#f59e0b' }}>⚠️ Unverified</span>}</div>
                      <div>Email: <strong style={{ color: 'var(--text-heading)' }}>{selectedVerifReq.user?.email || 'N/A'}</strong></div>
                      <div>Date of Birth: {selectedVerifReq.dateOfBirth || "1994-08-14"}</div>
                      <div style={{ marginTop: '0.3rem' }}>National NID: <strong style={{ color: 'var(--accent-gold)', fontFamily: 'monospace' }}>{selectedVerifReq.nidNumber || 'Not provided'}</strong></div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        🛠️ Professional Capabilities
                      </div>
                      <div>Skills / Specialization: <strong style={{ color: 'var(--text-heading)' }}>{selectedVerifReq.skills || "Technical Service"}</strong></div>
                      <div>Field Experience: <strong style={{ color: 'var(--primary)' }}>{selectedVerifReq.experienceYears || 5} Years</strong></div>
                      {selectedVerifReq.previousEmployer && <div>Previous Contractor/Employer: <strong>{selectedVerifReq.previousEmployer}</strong></div>}
                      {selectedVerifReq.experienceDescription && (
                        <div style={{ marginTop: '0.4rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          "{selectedVerifReq.experienceDescription}"
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        📍 Residential Address Records
                      </div>
                      <div><strong>Present Address:</strong> {selectedVerifReq.presentAddress || selectedVerifReq.detailedAddress || selectedVerifReq.user?.address}</div>
                      <div style={{ marginTop: '0.3rem' }}><strong>Permanent Address:</strong> {selectedVerifReq.permanentAddress || selectedVerifReq.presentAddress || selectedVerifReq.user?.address}</div>
                      <div style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Area: {selectedVerifReq.cityArea || "Uttara"} • District: {selectedVerifReq.district || "Dhaka"} • Division: {selectedVerifReq.division || "Dhaka"} ({selectedVerifReq.postalCode || '1230'})
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        💳 Payout & Financial Routing
                      </div>
                      <div>Method: <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>{selectedVerifReq.payoutMethod || "bKash"}</span></div>
                      <div style={{ marginTop: '0.2rem' }}>Account Number: <strong style={{ fontFamily: 'monospace', color: 'var(--text-heading)' }}>{selectedVerifReq.payoutAccount || selectedVerifReq.user?.phone}</strong></div>
                      {selectedVerifReq.payoutAccountHolder && <div>Account Holder Name: {selectedVerifReq.payoutAccountHolder}</div>}
                      {selectedVerifReq.payoutBankName && <div>Bank: {selectedVerifReq.payoutBankName} ({selectedVerifReq.payoutBankBranch || 'Main Branch'})</div>}
                    </div>
                  </div>

                  {/* Actions in Modal */}
                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedVerifReq(null)}>Close Inspection</button>

                    <button
                      className="btn btn-secondary"
                      style={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                      onClick={() => {
                        const id = selectedVerifReq.id;
                        setSelectedVerifReq(null);
                        handleDecisionPrompt('CORRECTION_REQUIRED', 'VERIFICATION', id);
                      }}
                    >
                      Request Correction
                    </button>

                    <button
                      className="btn btn-secondary"
                      style={{ color: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => {
                        const id = selectedVerifReq.id;
                        setSelectedVerifReq(null);
                        handleDecisionPrompt('REJECTED', 'VERIFICATION', id);
                      }}
                    >
                      Reject Application
                    </button>

                    {selectedVerifReq.status !== 'APPROVED' && (
                      <button className="btn btn-primary" onClick={() => handleApproveVerification(selectedVerifReq.id)}>
                        Approve & Verify Technician
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BOOKINGS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Master Service Bookings Tracker</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                  Live monitoring of customer requests, counter offers, technician GPS arrivals, and OTP verifications.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={14} /> Refresh Bookings
              </button>
            </div>

            {/* Filter Pills */}
            <div className="glass-card" style={{ padding: '0.8rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem 0.4rem 2.2rem' }}
                  placeholder="Filter by customer, technician, service..."
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                />
              </div>

              {['ALL', 'PENDING', 'NEGOTIATING', 'CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CANCELLED'].map(st => (
                <button
                  key={st}
                  className={`btn ${bookingStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={() => setBookingStatusFilter(st)}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Bookings Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.9rem 1.2rem' }}>Booking #</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Customer</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Technician</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Service Trade</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Agreed Price</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Commission</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>Audit Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList
                      .filter(b => {
                        if (bookingSearch.trim()) {
                          const q = bookingSearch.toLowerCase();
                          return (b.serviceType || '').toLowerCase().includes(q) ||
                                 (b.customer?.name || '').toLowerCase().includes(q) ||
                                 (b.worker?.name || '').toLowerCase().includes(q) ||
                                 String(b.id).includes(q);
                        }
                        return true;
                      })
                      .map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.9rem 1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            #{b.id}
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{b.customer?.name || 'Customer'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.customer?.phone}</div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{b.worker?.name || 'Unassigned'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.worker?.phone}</div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <div>{b.serviceType}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.preferredDate || 'Tomorrow'}</div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            ৳{b.agreedCost || b.estimatedCost}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: '#f59e0b', fontSize: '0.8rem' }}>
                            ৳{b.platformCommission != null ? b.platformCommission : (Math.round((b.agreedCost || b.estimatedCost || 1000) * (Number(settingsForm.platform_commission || 5) / 100)))} ({b.platformCommission ? Math.round((b.platformCommission / (b.agreedCost || b.estimatedCost || 1)) * 100) : (settingsForm.platform_commission || 5)}%)
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            {renderStatusBadge(b.status)}
                          </td>
                          <td style={{ padding: '0.9rem 1.2rem', textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
                              onClick={() => setSelectedBooking(b)}
                            >
                              <Eye size={13} /> Timeline
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Booking Timeline & Inspection Modal */}
            {selectedBooking && (
              <div className="toast-popup-overlay" onClick={() => setSelectedBooking(null)}>
                <div className="glass-card" style={{ maxWidth: '720px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Booking #{selectedBooking.id}: {selectedBooking.serviceType}</h2>
                        {renderStatusBadge(selectedBooking.status)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Placed: {new Date(selectedBooking.createdAt).toLocaleString()} • Source: {selectedBooking.bookingSource || 'DIRECT'}
                      </div>
                    </div>
                    <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <XCircle size={24} />
                    </button>
                  </div>

                  {/* Visual Step-by-Step Lifecycle Pipeline */}
                  <div style={{ marginBottom: '1.8rem', background: 'rgba(0,0,0,0.25)', padding: '1.2rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      SERVICE EXECUTION LIFECYCLE PIPELINE
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {getBookingTimelineStages(selectedBooking.status).map((st, idx) => (
                        <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', textAlign: 'center' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: st.isCompleted ? 'var(--primary)' : st.isCurrent ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                            color: st.isCompleted || st.isCurrent ? '#000000' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.3rem'
                          }}>
                            {st.isCompleted ? '✓' : idx + 1}
                          </div>
                          <span style={{ fontSize: '0.65rem', color: st.isCompleted ? '#ffffff' : 'var(--text-muted)', fontWeight: st.isCurrent ? 700 : 400 }}>
                            {st.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer, Technician & OTP Security Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>Customer Details</strong>
                      <div>Name: <strong>{selectedBooking.customer?.name}</strong></div>
                      <div>Phone: {selectedBooking.customer?.phone}</div>
                      <div>Address: {selectedBooking.address || selectedBooking.customer?.address}</div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>Technician Details</strong>
                      <div>Name: <strong>{selectedBooking.worker?.name || 'Unassigned'}</strong></div>
                      <div>Phone: {selectedBooking.worker?.phone}</div>
                      <div>Status: {selectedBooking.worker?.verified ? '🛡️ Verified' : 'Unverified'}</div>
                    </div>
                  </div>

                  {/* Security OTP Codes & Photos */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start OTP Code:</span>
                      <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem', color: selectedBooking.startOtpVerified ? 'var(--primary)' : 'var(--accent-gold)' }}>
                        {selectedBooking.startVerificationCode} {selectedBooking.startOtpVerified && '✓ Verified'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completion OTP:</span>
                      <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem', color: selectedBooking.completionOtpVerified ? 'var(--primary)' : '#c084fc' }}>
                        {selectedBooking.completionVerificationCode} {selectedBooking.completionOtpVerified && '✓ Verified'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Settlement:</span>
                      <div style={{ fontWeight: 'bold', color: selectedBooking.paymentStatus === 'PAID' ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {selectedBooking.paymentStatus || 'UNPAID'} ({selectedBooking.paymentMethod || 'N/A'})
                      </div>
                    </div>
                  </div>

                  {/* Before / After Evidence Photos */}
                  {(selectedBooking.beforePhoto || selectedBooking.afterPhoto) && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        JOB EVIDENCE PHOTOS
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {selectedBooking.beforePhoto && (
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Before Inspection Photo:</span>
                            <img src={selectedBooking.beforePhoto} alt="Before" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.2rem' }} />
                          </div>
                        )}
                        {selectedBooking.afterPhoto && (
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>After Work Completed Photo:</span>
                            <img src={selectedBooking.afterPhoto} alt="After" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.2rem' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. FINANCE & WITHDRAWAL MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'finance' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={26} color="var(--primary)" /> Central Financial Treasury & Wallets
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                  Escrow volume tracking, platform commission deductions, worker wallet balances, and payout disbursement queue.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={14} /> Refresh Treasury
              </button>
            </div>

            {/* Financial KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              
              <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)', padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Total Gross Service Value</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-heading)' }}>৳{financeData?.totalServiceVolume?.toLocaleString() ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>Total completed customer invoices</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Platform Revenue (5%)</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f59e0b' }}>৳{financeData?.platformCommission?.toLocaleString() ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '0.2rem' }}>Platform net fee retention</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6', padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Technician Net Disbursed</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#38bdf8' }}>৳{financeData?.workerNetEarnings?.toLocaleString() ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>95% Worker net earnings share</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #8b5cf6', padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Worker Wallet Balances</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#c084fc' }}>৳{financeData?.totalWalletBalances?.toLocaleString() ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Available for technician withdrawal</div>
              </div>

            </div>

            {/* Withdrawal Authorization Requests */}
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={20} color="#f59e0b" /> Technician Payout Withdrawal Requests
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.8rem 1rem' }}>TX Code</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Technician</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Channel & Account</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>Authorization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(financeData?.withdrawals || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No pending withdrawal requests. All technician payouts are settled!
                        </td>
                      </tr>
                    ) : (
                      (financeData?.withdrawals || []).map(tx => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace' }}>#{tx.id}</td>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{tx.worker?.name}</td>
                          <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>৳{Math.abs(tx.amount)}</td>
                          <td style={{ padding: '0.8rem 1rem' }}>{tx.description}</td>
                          <td style={{ padding: '0.8rem 1rem' }}>{renderStatusBadge(tx.status)}</td>
                          <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                            {tx.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" style={{ color: '#ef4444', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => handleRejectPrompt('WITHDRAWAL', tx.id)}>
                                  Reject
                                </button>
                                <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={() => handleApproveWithdrawal(tx.id)}>
                                  Approve & Disburse
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General Ledger Transactions */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>General Financial Ledger Records</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.8rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Party</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Description</th>
                      <th style={{ padding: '0.8rem 1rem' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(financeData?.transactions || []).slice(0, 10).map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace' }}>#{t.id}</td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>{t.worker?.name || 'Platform'}</td>
                        <td style={{ padding: '0.8rem 1rem' }}><span className="badge badge-pending">{t.transactionType}</span></td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: t.amount >= 0 ? 'var(--primary)' : '#ef4444' }}>
                          {t.amount >= 0 ? `+৳${t.amount}` : `-৳${Math.abs(t.amount)}`}
                        </td>
                        <td style={{ padding: '0.8rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</td>
                        <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'Recently'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. ACADEMY MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'academy' && (
          <div>
            <AdminAcademyManager onShowToast={onShowToast} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. TOOL STORE MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'store' && (
          <div>
            <AdminStoreManager onShowToast={onShowToast} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. ANALYTICS ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={26} color="#3b82f6" /> Business Analytics & Intelligence
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                  Macro trends across trade services, technician output performance, cancellation rates, and store revenue.
                </p>
              </div>

              {/* Time Range Selector */}
              <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {['TODAY', '7D', '30D', '6M', '1Y'].map(p => (
                  <button
                    key={p}
                    className={`btn ${analyticsPeriod === p ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}
                    onClick={() => setAnalyticsPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total Service Contracts</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-heading)' }}>{analyticsData?.totalBookings ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>Completed: {analyticsData?.completedBookings ?? 0}</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Cancellation Rate</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: (analyticsData?.cancellationRate || 0) > 10 ? '#ef4444' : 'var(--primary)' }}>
                  {analyticsData?.cancellationRate ?? 0}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Healthy benchmark: &lt; 5%</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Average Booking Value</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f59e0b' }}>৳{analyticsData?.avgBookingValue ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Per completed repair order</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tool Store Total Sales</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#38bdf8' }}>৳{analyticsData?.totalStoreSales?.toLocaleString() ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{analyticsData?.totalStoreOrders ?? 0} physical orders</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Academy Certifications</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#c084fc' }}>{analyticsData?.completedCertifications ?? 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>From {analyticsData?.totalEnrollments ?? 0} enrollments</div>
              </div>
            </div>

            {/* Growth & Performance SVG Graphs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
              
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--primary)" /> Revenue Progression ({analyticsPeriod})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>Weekly platform turnover volume in BDT.</p>
                <div style={{ width: '100%', height: '180px' }}>
                  <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
                    <line x1="40" y1="130" x2="380" y2="130" stroke="rgba(255,255,255,0.1)" />
                    <rect x="60" y="70" width="35" height="60" rx="4" fill="#3b82f6" opacity="0.85" />
                    <rect x="140" y="50" width="35" height="80" rx="4" fill="#3b82f6" opacity="0.85" />
                    <rect x="220" y="35" width="35" height="95" rx="4" fill="#3b82f6" opacity="0.85" />
                    <rect x="300" y="15" width="35" height="115" rx="4" fill="var(--primary)" />
                    
                    <text x="65" y="148" fill="var(--text-muted)" fontSize="10">W1</text>
                    <text x="145" y="148" fill="var(--text-muted)" fontSize="10">W2</text>
                    <text x="225" y="148" fill="var(--text-muted)" fontSize="10">W3</text>
                    <text x="305" y="148" fill="var(--text-muted)" fontSize="10">W4</text>
                  </svg>
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="#f59e0b" /> User Base Growth Trend
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>Cumulative customer & worker acquisition trajectory.</p>
                <div style={{ width: '100%', height: '180px' }}>
                  <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
                    <path d="M 40 120 Q 120 100, 200 60 T 380 20 L 380 130 L 40 130 Z" fill="rgba(245, 158, 11, 0.15)" />
                    <path d="M 40 120 Q 120 100, 200 60 T 380 20" fill="none" stroke="#f59e0b" strokeWidth="3" />
                    <circle cx="200" cy="60" r="5" fill="#f59e0b" />
                    <circle cx="380" cy="20" r="5" fill="#f59e0b" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. ACTIVITY / AUDIT LOGS */}
        {/* ========================================================================= */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={26} color="#f59e0b" /> Real-time Audit & Event Logs
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                  Permanent tamper-proof audit trail for worker approvals, user status adjustments, payouts, and security events.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={14} /> Refresh Logs
              </button>
            </div>

            {/* Search Bar */}
            <div className="glass-card" style={{ padding: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                  placeholder="Filter audit events by actor, action type, or keyword..."
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Logs Timeline Feed */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {auditLogs
                  .filter(l => {
                    if (logSearch.trim()) {
                      const q = logSearch.toLowerCase();
                      return (l.action || '').toLowerCase().includes(q) ||
                             (l.actorName || '').toLowerCase().includes(q) ||
                             (l.details || '').toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((l, idx) => (
                    <div key={l.id || idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem 1.4rem',
                      borderBottom: '1px solid var(--border-color)',
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: l.action?.includes('APPROVE') ? 'rgba(16, 185, 129, 0.15)' : l.action?.includes('REJECT') || l.action?.includes('SUSPEND') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: l.action?.includes('APPROVE') ? '#10b981' : l.action?.includes('REJECT') || l.action?.includes('SUSPEND') ? '#ef4444' : '#3b82f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '0.2rem'
                      }}>
                        <FileText size={17} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-heading)', marginRight: '0.6rem' }}>{l.action}</span>
                            <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>{l.actorRole}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {l.timestamp ? new Date(l.timestamp).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{l.details}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Responsible Actor: <strong>{l.actorName}</strong> • Target: {l.targetEntity} #{l.targetId || ''}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 10. PLATFORM SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={26} color="#f59e0b" /> Platform Configuration & Rules
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                Configure global platform commission percentage, system currencies, security parameters, and service warranties.
              </p>
            </div>

            {settingsSaved && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.8rem 1.2rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} /> Platform parameters updated and synchronized with the backend database!
              </div>
            )}

            <form onSubmit={handleSaveSettings} style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary)' }}>Financial & Revenue Rules</h3>
                
                <div>
                  <label className="form-label">Platform Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={settingsForm.platform_commission}
                    onChange={e => setSettingsForm({ ...settingsForm, platform_commission: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Currently configured at <strong>{settingsForm.platform_commission}%</strong>. Automatically retained from each completed service booking.
                  </span>
                </div>

                <div>
                  <label className="form-label">Operating Currency Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settingsForm.currency}
                    onChange={e => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#38bdf8' }}>Platform Operations & Safety</h3>

                <div>
                  <label className="form-label">Platform Branding Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settingsForm.platform_name}
                    onChange={e => setSettingsForm({ ...settingsForm, platform_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Emergency Dispatch Hotline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settingsForm.emergency_hotline}
                    onChange={e => setSettingsForm({ ...settingsForm, emergency_hotline: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Max Active Jobs Per Technician</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settingsForm.max_active_jobs}
                    onChange={e => setSettingsForm({ ...settingsForm, max_active_jobs: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Guards technicians from accepting parallel jobs to maintain delivery quality and SLA timing.
                  </span>
                </div>

                <div>
                  <label className="form-label">FixConnect Guarantee Warranty (Days)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settingsForm.service_guarantee_days}
                    onChange={e => setSettingsForm({ ...settingsForm, service_guarantee_days: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', justifyContent: 'center', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} /> Save & Apply Platform Settings
              </button>
            </form>
          </div>
        )}

        {/* --- DECISION / CORRECTION / REJECTION REASON MODAL DIALOG --- */}
        {showRejectModal && (
          <div className="toast-popup-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
              <h3 style={{
                fontSize: '1.2rem',
                color: decisionAction === 'CORRECTION_REQUIRED' ? '#f59e0b' : '#ef4444',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={20} />
                {decisionAction === 'CORRECTION_REQUIRED'
                  ? 'Request Candidate Correction'
                  : decisionAction === 'SUSPENDED'
                  ? 'Suspend Technician Access'
                  : `Reject ${targetRejectType === 'VERIFICATION' ? 'Worker Verification' : 'Payout Withdrawal'}`}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                {decisionAction === 'CORRECTION_REQUIRED'
                  ? 'Provide specific instructions so the worker knows what details or documents need to be corrected.'
                  : decisionAction === 'SUSPENDED'
                  ? 'Specify the compliance or safety reason for suspending this technician.'
                  : 'Please provide an official audit reason for rejecting this application.'}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  {decisionAction === 'CORRECTION_REQUIRED' ? 'Correction Instructions for Worker *' : 'Reason / Audit Note *'}
                </label>
                <textarea
                  className="form-input"
                  style={{ height: '100px', resize: 'vertical' }}
                  placeholder={decisionAction === 'CORRECTION_REQUIRED'
                    ? "e.g. NID back photo is blurred. Please upload a clear photo showing the barcode and issue date."
                    : "e.g. Incomplete documentation, mismatch in national database, or invalid credentials."}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  style={{
                    background: decisionAction === 'CORRECTION_REQUIRED' ? '#f59e0b' : '#ef4444',
                    borderColor: decisionAction === 'CORRECTION_REQUIRED' ? '#f59e0b' : '#ef4444'
                  }}
                  onClick={handleConfirmReject}
                >
                  {decisionAction === 'CORRECTION_REQUIRED' ? 'Send Correction Request' : decisionAction === 'SUSPENDED' ? 'Confirm Suspension' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
