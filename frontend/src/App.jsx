import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Award, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Calendar, 
  DollarSign, 
  Zap, 
  BookOpen, 
  ShoppingBag, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  Camera,
  CheckCircle2,
  Users,
  Compass,
  FileText,
  Briefcase,
  UserCheck,
  Building,
  Key,
  FolderOpen,
  PlusCircle,
  Database,
  Lock,
  LogOut,
  Mail,
  User
} from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('CUSTOMER'); // CUSTOMER, WORKER, ADMIN
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Logged in user state
  const [currentUser, setCurrentUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('customer'); // customer, worker, courses, marketplace, profile, admin
  
  // App data states
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  
  // AI Estimator state
  const [issueDesc, setIssueDesc] = useState('');
  const [aiEstimate, setAiEstimate] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Salam! I am your SkillVerse AI Assistant. How can I help you today?' }
  ]);
  
  // Booking modal state
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingCost, setBookingCost] = useState(1000);
  
  // Worker application states
  const [appNid, setAppNid] = useState('');
  const [appSkills, setAppSkills] = useState('Electrical Repair, Wiring');
  const [appRate, setAppRate] = useState(400);
  const [appArea, setAppArea] = useState('Gulshan, Banani, Uttara');
  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerBookings, setWorkerBookings] = useState([]);

  // Fetch initial base data on load
  useEffect(() => {
    fetchWorkers();
    fetchCourses();
    fetchMarketplace();
  }, []);

  // Fetch role-specific data when user logs in or switches tabs
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;

    if (currentUser.role === 'CUSTOMER') {
      fetchCustomerBookings();
    } else if (currentUser.role === 'WORKER') {
      fetchWorkerProfileAndBookings(currentUser.id);
    } else if (currentUser.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [isLoggedIn, currentUser, activeTab]);

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE}/workers`);
      const data = await res.json();
      setWorkers(data);
    } catch (e) {
      console.error("Error fetching workers", e);
    }
  };

  const fetchCustomerBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings/customer/${currentUser.id}`);
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error("Error fetching bookings", e);
    }
  };

  const fetchWorkerProfileAndBookings = async (workerId) => {
    try {
      const resProfile = await fetch(`${API_BASE}/workers/${workerId}`);
      if (resProfile.ok) {
        const dataProfile = await resProfile.json();
        setWorkerProfile(dataProfile);
      } else {
        setWorkerProfile(null);
      }
      
      const resBookings = await fetch(`${API_BASE}/bookings/worker/${workerId}`);
      if (resBookings.ok) {
        const dataBookings = await resBookings.json();
        setWorkerBookings(dataBookings);
      }
    } catch (e) {
      console.error("Error fetching worker details", e);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/training/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (e) {
      console.error("Error fetching courses", e);
    }
  };

  const fetchMarketplace = async () => {
    try {
      const res = await fetch(`${API_BASE}/marketplace`);
      const data = await res.json();
      setMarketplaceItems(data);
    } catch (e) {
      console.error("Error fetching tools", e);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch(`${API_BASE}/workers`);
      const data = await res.json();
      // Filter out workers whose accounts are not verified as pending applications
      const pending = data.filter(w => !w.user.verified);
      setPendingApplications(pending);
    } catch (e) {
      console.error("Admin data fetch failed", e);
    }
  };

  // Login handler
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    
    // Simple verification simulation for Course project
    if (loginRole === 'ADMIN') {
      if (email === 'admin@skillverse.com') {
        const adminUser = { id: 1, name: "System Admin", email: "admin@skillverse.com", role: "ADMIN", profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop", verified: true };
        setCurrentUser(adminUser);
        setIsLoggedIn(true);
        setActiveTab('admin');
      } else {
        alert("Invalid admin credentials! Hint: use admin@skillverse.com");
      }
    } else if (loginRole === 'CUSTOMER') {
      if (email === 'anis@gmail.com') {
        const customerUser = { id: 2, name: "Anisur Rahman", email: "anis@gmail.com", role: "CUSTOMER", profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop", verified: true };
        setCurrentUser(customerUser);
        setIsLoggedIn(true);
        setActiveTab('customer');
      } else {
        alert("Invalid customer credentials! Hint: use anis@gmail.com");
      }
    } else if (loginRole === 'WORKER') {
      if (email === 'kamrul@gmail.com') {
        const workerUser = { id: 3, name: "Kamrul Islam", email: "kamrul@gmail.com", role: "WORKER", profilePicture: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop", verified: true };
        setCurrentUser(workerUser);
        setIsLoggedIn(true);
        setActiveTab('worker');
      } else if (email === 'sajid@gmail.com') {
        const workerUser = { id: 5, name: "Sajid Hasan", email: "sajid@gmail.com", role: "WORKER", profilePicture: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop", verified: false };
        setCurrentUser(workerUser);
        setIsLoggedIn(true);
        setActiveTab('worker');
      } else {
        alert("Invalid worker credentials! Hint: use kamrul@gmail.com (Verified) or sajid@gmail.com (Unverified)");
      }
    }
  };

  // Quick helper to bypass login typing
  const triggerAutofillLogin = (role, emailStr) => {
    setLoginRole(role);
    setEmail(emailStr);
    setPassword('password123');
    setTimeout(() => {
      // Simulate click
      const mockEvent = { preventDefault: () => {} };
      if (role === 'ADMIN') {
        setCurrentUser({ id: 1, name: "System Admin", email: "admin@skillverse.com", role: "ADMIN", profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop", verified: true });
        setIsLoggedIn(true);
        setActiveTab('admin');
      } else if (role === 'CUSTOMER') {
        setCurrentUser({ id: 2, name: "Anisur Rahman", email: "anis@gmail.com", role: "CUSTOMER", profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop", verified: true });
        setIsLoggedIn(true);
        setActiveTab('customer');
      } else if (role === 'WORKER') {
        const isVerified = emailStr === 'kamrul@gmail.com';
        setCurrentUser({ 
          id: isVerified ? 3 : 5, 
          name: isVerified ? "Kamrul Islam" : "Sajid Hasan", 
          email: emailStr, 
          role: "WORKER", 
          profilePicture: isVerified ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop" : "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop", 
          verified: isVerified 
        });
        setIsLoggedIn(true);
        setActiveTab('worker');
      }
    }, 100);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setAiEstimate(null);
  };

  // Submit Work Application (Worker updates profile and submits details)
  const handleSubmitWorkApplication = async () => {
    if (!appNid || !appSkills || !appRate) {
      alert("Please fill in NID, skills, hourly rate and coverage area first!");
      return;
    }

    try {
      // First, update worker profile details on backend
      const profileRes = await fetch(`${API_BASE}/workers/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: appSkills,
          experienceYears: 3,
          serviceArea: appArea,
          hourlyRate: appRate,
          available: false // unavailable until verified
        })
      });

      if (profileRes.ok) {
        alert("Application submitted! NID uploaded successfully. Waiting for Admin verification.");
        // Reload details locally
        fetchWorkerProfileAndBookings(currentUser.id);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to submit profile application.");
    }
  };

  // Admin approves a worker application
  const handleAdminApproveWorker = async (workerUserId) => {
    try {
      const res = await fetch(`${API_BASE}/workers/${workerUserId}/verify?nid=19942618954712365`, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Worker verified successfully!");
        fetchAdminData();
        fetchWorkers();
      }
    } catch (e) {
      alert("Verification update failed.");
    }
  };

  // AI cost estimator
  const handleEstimateCost = async () => {
    if (!issueDesc) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai/estimate-cost?issueDescription=${encodeURIComponent(issueDesc)}`);
      const data = await res.json();
      setAiEstimate(data);
      setBookingCost(data.totalEstimatedCost);
    } catch (e) {
      console.error("AI cost estimation failed", e);
    }
    setAiLoading(false);
  };

  // Chatbot handler
  const handleSendMessage = async () => {
    if (!chatInput) return;
    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    try {
      const res = await fetch(`${API_BASE}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Diagnostic system offline.' }]);
    }
  };

  // Create service order booking
  const handleCreateBooking = async () => {
    if (!selectedWorker) return;
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.id,
          workerId: selectedWorker.user.id,
          serviceType: selectedWorker.skills.split(',')[0],
          estimatedCost: bookingCost,
          description: bookingDesc || "Requesting standard home checkup."
        })
      });
      if (res.ok) {
        setSelectedWorker(null);
        setBookingDesc('');
        fetchCustomerBookings();
        alert("Booking dispatched to verified worker successfully!");
      }
    } catch (e) {
      alert("Ensure Spring Boot backend server is active!");
    }
  };

  // Accept/Complete order workflow
  const handleStatusChange = async (bookingId, newStatus, isWorker = false) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      if (res.ok) {
        if (isWorker) {
          fetchWorkerProfileAndBookings(currentUser.id);
        } else {
          fetchCustomerBookings();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- LOGIN INTERFACE ---
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', background: '#0e1526' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={36} color="var(--primary)" />
              <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SkillVerse
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI-Powered Verified Skills Marketplace & Service Ecosystem</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Role selection tab */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['CUSTOMER', 'WORKER', 'ADMIN'].map(role => (
                <button 
                  key={role}
                  type="button"
                  className={`btn ${loginRole === role ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}
                  onClick={() => setLoginRole(role)}
                >
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input 
                  type="email"
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input 
                  type="password"
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}>
              Secure Login <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick simulation helper login options */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.8rem' }}>
              ⚡ DEMO ACCOUNTS AUTOFILL
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }} onClick={() => triggerAutofillLogin('CUSTOMER', 'anis@gmail.com')}>
                Login as Customer (Anisur)
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }} onClick={() => triggerAutofillLogin('WORKER', 'kamrul@gmail.com')}>
                Login as Verified Worker (Kamrul)
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }} onClick={() => triggerAutofillLogin('WORKER', 'sajid@gmail.com')}>
                Login as Unverified Worker (Sajid)
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }} onClick={() => triggerAutofillLogin('ADMIN', 'admin@skillverse.com')}>
                Login as System Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGGED IN USER INTERFACE ---
  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => {
          if (currentUser.role === 'CUSTOMER') setActiveTab('customer');
          else if (currentUser.role === 'WORKER') setActiveTab('worker');
          else setActiveTab('admin');
        }}>
          <ShieldCheck size={28} color="#10b981" />
          <span>SkillVerse</span>
        </div>
        
        {/* Navigation Tabs based on role */}
        <div className="nav-links">
          {currentUser.role === 'CUSTOMER' && (
            <>
              <span className={`nav-link ${activeTab === 'customer' ? 'active' : ''}`} onClick={() => setActiveTab('customer')}>
                Find Services
              </span>
              <span className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
                Academy & courses
              </span>
              <span className={`nav-link ${activeTab === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveTab('marketplace')}>
                Tool Store
              </span>
            </>
          )}
          
          {currentUser.role === 'WORKER' && (
            <>
              <span className={`nav-link ${activeTab === 'worker' ? 'active' : ''}`} onClick={() => setActiveTab('worker')}>
                Worker Workspace
              </span>
              <span className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
                Academy Training
              </span>
            </>
          )}

          {currentUser.role === 'ADMIN' && (
            <span className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')} style={{ color: '#f59e0b', fontWeight: 'bold' }}>
              <Key size={14} /> Admin Portal
            </span>
          )}

          <span className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            My Profile
          </span>
        </div>

        {/* User Details & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Role: {currentUser.role}</div>
          </div>
          <img 
            src={currentUser.profilePicture} 
            alt="User avatar" 
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Logout" onClick={handleLogout}>
            <LogOut size={16} color="var(--accent-rose)" />
          </button>
        </div>
      </header>

      {/* CUSTOMER TAB */}
      {activeTab === 'customer' && currentUser.role === 'CUSTOMER' && (
        <div>
          {/* Hero & AI Verdict Pricing widget */}
          <div className="ai-widget">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 500px' }}>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                  Hire <span style={{ color: 'var(--primary)' }}>Verified</span> Skilled Workers in Bangladesh
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  AI-powered pricing estimation, verified identity tracking, and escrow payments for hassle-free home maintenance.
                </p>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input 
                    className="form-input" 
                    placeholder="Describe your issue (e.g. AC not cooling, bathroom pipe leak, broken circuit breaker)"
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleEstimateCost} disabled={aiLoading}>
                    <Sparkles size={16} /> {aiLoading ? 'Analyzing...' : 'Verdict Price'}
                  </button>
                </div>
                
                {aiEstimate && (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ color: 'var(--primary)' }}>AI Verdict & Price Estimation:</strong>
                      <span className="badge badge-verified">Accuracy {Math.round(aiEstimate.confidenceScore * 100)}%</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                      {aiEstimate.diagnosticSummary}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Base Service Rate:</span>
                        <div style={{ fontWeight: 'bold' }}>BDT {aiEstimate.baseServiceCost}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spare Parts:</span>
                        <div style={{ fontWeight: 'bold' }}>BDT {aiEstimate.estimatedSparePartsCost}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Cost:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>BDT {aiEstimate.totalEstimatedCost}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chatbot Column */}
              <div style={{ flex: '1 1 300px', background: 'rgba(10, 15, 29, 0.5)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', height: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                  <MessageSquare size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Smart Diagnostic Chat</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {chatMessages.map((m, idx) => (
                    <div key={idx} style={{ 
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: m.sender === 'user' ? '#0b0f19' : 'var(--text-primary)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      maxWidth: '85%',
                      fontSize: '0.8rem'
                    }}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input 
                    className="form-input" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    placeholder="Ask AI assistant..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="btn btn-primary" style={{ padding: '0.4rem' }} onClick={handleSendMessage}>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Booking & Active Service Grid */}
          <div style={{ padding: '0 2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={22} color="var(--primary)" />
              Match Verified Technicians
            </h2>
            <div className="dashboard-grid" style={{ padding: 0, marginBottom: '3rem' }}>
              {workers
                .filter(w => w.user.verified) // ONLY verified workers can be booked
                .map(w => (
                  <div key={w.id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <img 
                        src={w.user.profilePicture} 
                        alt={w.user.name} 
                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,0.3)' }}
                      />
                      <span className="badge badge-verified">Verified Worker</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{w.user.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                      <Award size={14} />
                      <span>Rating: {w.user.rating} ({w.careerLevel} Rank)</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <strong>Skills:</strong> {w.skills}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <strong>Service Area:</strong> {w.serviceArea}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      <strong>Base Rate:</strong> BDT {w.hourlyRate}/hr
                    </p>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => {
                        setSelectedWorker(w);
                        setBookingCost(w.hourlyRate * 3);
                      }}
                    >
                      Select & Book Service
                    </button>
                  </div>
              ))}
            </div>

            {/* Customer Bookings Status Tracker */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={22} color="var(--primary)" />
              Active Service Booking Tracker
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '4rem' }}>
              {bookings.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No active service bookings found. Choose a worker to create a booking request.
                </div>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem' }}>{b.serviceType}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Technician: <strong>{b.worker.name}</strong> • Phone: {b.worker.phone}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${b.status === 'COMPLETED' ? 'badge-verified' : b.status === 'CANCELLED' ? 'badge-danger' : 'badge-pending'}`}>{b.status}</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.3rem' }}>BDT {b.estimatedCost}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      <strong>Job details:</strong> {b.description}
                    </p>

                    {/* Timeline */}
                    <div className="timeline">
                      <div className={`timeline-step ${b.status !== 'CANCELLED' ? 'completed' : ''}`}>
                        <div className="timeline-dot">1</div>
                        <div className="timeline-label">Booked</div>
                      </div>
                      <div className={`timeline-step ${['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status) ? 'completed' : 'active'}`}>
                        <div className="timeline-dot">2</div>
                        <div className="timeline-label">Worker Dispatched</div>
                      </div>
                      <div className={`timeline-step ${['IN_PROGRESS', 'COMPLETED'].includes(b.status) ? 'completed' : ''}`}>
                        <div className="timeline-dot">3</div>
                        <div className="timeline-label">Safety Verifying</div>
                      </div>
                      <div className={`timeline-step ${b.status === 'COMPLETED' ? 'completed' : ''}`}>
                        <div className="timeline-dot">4</div>
                        <div className="timeline-label">Service Completed</div>
                      </div>
                    </div>

                    {/* Safety Verification Section */}
                    {['ACCEPTED', 'IN_PROGRESS'].includes(b.status) && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <ShieldCheck size={16} /> Security & Live Dispatch Tracking
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Live GPS Location:</span>
                            <div>Dhaka, Sector 12 - coordinates: {b.liveLocation}</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Start Verification OTP:</span>
                            <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem', color: 'var(--accent-gold)' }}>
                              {b.startVerificationCode}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Complete Verification OTP:</span>
                            <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem', color: 'var(--accent-gold)' }}>
                              {b.completionVerificationCode}
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          {b.status === 'ACCEPTED' && (
                            <button className="btn btn-primary" onClick={() => handleStatusChange(b.id, 'IN_PROGRESS')}>
                              Verify Arrival (Start Job)
                            </button>
                          )}
                          {b.status === 'IN_PROGRESS' && (
                            <button className="btn btn-primary" onClick={() => handleStatusChange(b.id, 'COMPLETED')}>
                              Verify completion & Release Payment
                            </button>
                          )}
                          <button className="btn btn-secondary" onClick={() => handleStatusChange(b.id, 'CANCELLED')}>Cancel Booking</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WORKER WORKSPACE TAB */}
      {activeTab === 'worker' && currentUser.role === 'WORKER' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem' }}>Worker Management Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Submit applications, check dispatch orders, and manage account credentials.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`badge ${currentUser.verified ? 'badge-verified' : 'badge-pending'}`}>
                {currentUser.verified ? 'Verified Active Worker' : 'Verification Status: Unverified'}
              </span>
            </div>
          </div>

          {!currentUser.verified ? (
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-gold)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>🚨 Administrative Verification Required</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                You must submit a work application. Once verified by the System Admin, you will be authorized to accept client bookings.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-label">National NID Number</label>
                  <input className="form-input" placeholder="e.g. 19932612954712365" value={appNid} onChange={e => setAppNid(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Primary Skills</label>
                  <input className="form-input" placeholder="e.g. AC installation, Electrical safety" value={appSkills} onChange={e => setAppSkills(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Hourly Base Rate (BDT)</label>
                  <input type="number" className="form-input" value={appRate} onChange={e => setAppRate(Number(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Service Area</label>
                  <input className="form-input" value={appArea} onChange={e => setAppArea(e.target.value)} />
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleSubmitWorkApplication}>
                Submit Application to Admin
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'flex-start', marginBottom: '3rem' }}>
              {/* Profile Config */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Specialization & Service Configuration</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                  <div><strong>Specialty Skills:</strong> {workerProfile ? workerProfile.skills : 'Electrical, Plumbing'}</div>
                  <div><strong>Area Coverage:</strong> {workerProfile ? workerProfile.serviceArea : 'Dhaka'}</div>
                  <div><strong>Hourly Base Rate:</strong> BDT {workerProfile ? workerProfile.hourlyRate : 400}/hr</div>
                </div>
              </div>
              
              {/* Career levels */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Career Skill Badges</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-verified">Bronze level status</span>
                  <span className="badge badge-verified">Biometrics face matched</span>
                </div>
              </div>
            </div>
          )}

          {/* Worker Active Jobs List */}
          {currentUser.verified && (
            <>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={22} color="var(--primary)" /> Your Active Dispatched Orders
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workerBookings.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No service bookings are currently assigned to you. Go online to receive matches.
                  </div>
                ) : (
                  workerBookings.map(wb => (
                    <div key={wb.id} className="glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem' }}>{wb.serviceType}</h3>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Client: <strong>{wb.customer.name}</strong> • Phone: {wb.customer.phone}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-pending" style={{ marginRight: '0.5rem' }}>{wb.status}</span>
                          <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>BDT {wb.estimatedCost}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '1rem 0' }}>
                        <strong>Details:</strong> {wb.description}
                      </p>
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        {wb.status === 'PENDING' && (
                          <button className="btn btn-primary" onClick={() => handleStatusChange(wb.id, 'ACCEPTED', true)}>
                            Accept Booking Order
                          </button>
                        )}
                        {wb.status === 'ACCEPTED' && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                            Ask customer for arrival verification code: <strong>{wb.startVerificationCode}</strong>.
                          </div>
                        )}
                        {wb.status === 'IN_PROGRESS' && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                            Job in progress! Give completion code <strong>{wb.completionVerificationCode}</strong> to client to complete job.
                          </div>
                        )}
                        {wb.status === 'COMPLETED' && (
                          <span className="badge badge-verified">Payment Disbursed to Wallet</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TRAINING TAB */}
      {activeTab === 'courses' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem' }}>SkillVerse Training Academy</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Get certified by professional institutions and upgrade your career level ranking.</p>
          </div>
          <div className="dashboard-grid" style={{ padding: 0 }}>
            {courses.map(c => (
              <div key={c.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <img src={c.image} alt={c.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem' }}>{c.description}</p>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span>Instructor: {c.instructor}</span>
                  <span>Duration: {c.duration}</span>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  <BookOpen size={16} /> Enroll & Start Learning
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOOL STORE TAB */}
      {activeTab === 'marketplace' && currentUser.role === 'CUSTOMER' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem' }}>Tools & Spare Parts Store</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Purchase certified toolkits or rent premium maintenance hardware per day.</p>
          </div>
          <div className="dashboard-grid" style={{ padding: 0 }}>
            {marketplaceItems.map(item => (
              <div key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem' }}>{item.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.type}</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>BDT {item.price}</div>
                  </div>
                  <button className="btn btn-primary"><ShoppingBag size={16} /> Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <img src={currentUser.profilePicture} alt={currentUser.name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
            <div>
              <h1 style={{ fontSize: '2.2rem' }}>{currentUser.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Email: {currentUser.email} • Role: <strong>{currentUser.role}</strong></p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="badge badge-verified">{currentUser.verified ? 'Verified Account' : 'Pending Verification'}</span>
              </div>
            </div>
          </div>

          {currentUser.role === 'CUSTOMER' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}><Building size={20} /> Registered Properties</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                    <div style={{ fontWeight: 'bold' }}>🏡 Home Apartment</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sector 12, Road 4, Uttara, Dhaka</div>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}><Calendar size={20} /> Preventative Alerts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <strong>AC Servicing Notification</strong>
                    <div style={{ color: 'var(--text-secondary)' }}>Due in 12 days</div>
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)' }}><FolderOpen size={20} /> document Vault</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <span>🧾 Singer_AC_Warranty.pdf</span>
                    <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>View</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ maxWidth: '600px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Professional Settings Overview</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                <div><strong>Offered Skills:</strong> {workerProfile ? workerProfile.skills : 'Not configured yet'}</div>
                <div><strong>Service Radius:</strong> {workerProfile ? workerProfile.serviceArea : 'Not configured yet'}</div>
                <div><strong>Base Service rate:</strong> BDT {workerProfile ? workerProfile.hourlyRate : 0}/hr</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN PORTAL TAB */}
      {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={28} color="#f59e0b" />
              Administrative Portal
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Approve pending worker profiles and verify accounts.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>Pending Worker Verifications ({pendingApplications.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingApplications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No pending worker profiles require verification at this time.
                  </div>
                ) : (
                  pendingApplications.map(w => (
                    <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{w.user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Skills: {w.skills} • Rate: BDT {w.hourlyRate}/hr • Area: {w.serviceArea}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={() => handleAdminApproveWorker(w.user.id)}>
                          Approve Application
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>System Database Metrics</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Users:</span>
                  <strong>{workers.length + 2}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Verified Workers:</span>
                  <strong>{workers.filter(w => w.user.verified).length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedWorker && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: '#0f172a', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Book Service: {selectedWorker.user.name}</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Service Type</label>
              <input className="form-input" value={selectedWorker.skills.split(',')[0]} readOnly />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Estimated Cost (BDT)</label>
              <input className="form-input" value={bookingCost} readOnly />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Describe the problem</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                placeholder="e.g. My electrical fuse box has burned. Need inspection."
                value={bookingDesc}
                onChange={(e) => setBookingDesc(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedWorker(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateBooking}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 SkillVerse Bangladesh. All rights reserved. course project submission.</p>
      </footer>
    </div>
  );
}

export default App;
