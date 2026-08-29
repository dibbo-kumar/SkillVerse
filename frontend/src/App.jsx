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
  User,
  Trash2,
  TrendingUp,
  CreditCard,
  Layers
} from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

// Preset diagnostic photos for customer mock upload
const MOCK_PHOTOS = [
  { id: 'ac', label: 'AC Coil Burnout', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=300' },
  { id: 'pipe', label: 'Ruptured Pipe Leak', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300' },
  { id: 'fuse', label: 'Blown Circuit Box', url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300' }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login, signup
  const [loginRole, setLoginRole] = useState('CUSTOMER'); // CUSTOMER, WORKER, ADMIN
  
  // Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  
  // Logged in user state
  const [currentUser, setCurrentUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('customer'); // customer, worker, courses, marketplace, profile, admin
  
  // App data states
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [workerBookings, setWorkerBookings] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  
  // AI Estimator state
  const [issueDesc, setIssueDesc] = useState('');
  const [aiEstimate, setAiEstimate] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Salam! I am your SkillVerse AI Assistant. How can I help you today?' }
  ]);
  
  // Booking modal states
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingCost, setBookingCost] = useState(1200);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [selectedPhotoPreset, setSelectedPhotoPreset] = useState(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Counter-offer state (Worker)
  const [counterPrices, setCounterPrices] = useState({}); // { bookingId: price }
  
  // Payment Sheet Modal State
  const [payingBooking, setPayingBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bkash'); // bkash, bank
  const [walletNumber, setWalletNumber] = useState('');
  
  // Admin Item creation forms
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseInstructor, setNewCourseInstructor] = useState('');
  const [newCourseDuration, setNewCourseDuration] = useState('');
  const [newCourseImg, setNewCourseImg] = useState('https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=300');

  const [newToolTitle, setNewToolTitle] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolPrice, setNewToolPrice] = useState('');
  const [newToolType, setNewToolType] = useState('TOOL');
  const [newToolImg, setNewToolImg] = useState('https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200');

  // Fetch initial base data on load
  useEffect(() => {
    fetchWorkers();
    fetchCourses();
    fetchMarketplace();
    fetchAllUsers();
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

  const fetchAllUsers = async () => {
    // Attempt to parse/fetch users
    try {
      const res = await fetch(`${API_BASE}/auth/users/1`); // just test connection
    } catch (e) {
      console.error(e);
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
      const pending = data.filter(w => !w.user.verified);
      setPendingApplications(pending);
    } catch (e) {
      console.error("Admin data fetch failed", e);
    }
  };

  // Submit Sign Up
  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !name || !phone || !password) {
      alert("Please fill all required signup fields!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          role: loginRole,
          nidNumber: nidNumber || "N/A",
          verified: loginRole === 'CUSTOMER' ? true : false,
          profilePicture: loginRole === 'CUSTOMER' 
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
            : "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"
        })
      });

      if (res.ok) {
        alert("Registration Successful! You can now log in.");
        setAuthMode('login');
      } else {
        const errorText = await res.text();
        alert(errorText || "Registration failed!");
      }
    } catch (e) {
      alert("Could not connect to the backend server. Make sure Spring Boot is running!");
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) return;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: loginRole })
      });

      if (res.ok) {
        const user = await res.json();
        if (user.role !== loginRole) {
          alert(`Selected role (${loginRole}) does not match your registered role (${user.role}).`);
          return;
        }
        setCurrentUser(user);
        setIsLoggedIn(true);
        setActiveTab(user.role === 'ADMIN' ? 'admin' : user.role === 'WORKER' ? 'worker' : 'customer');
      } else {
        alert("Invalid email credentials!");
      }
    } catch (e) {
      alert("Could not connect to server. Check Spring Boot!");
    }
  };

  // Google Login / Signup Simulator
  const handleGoogleAuth = () => {
    const mockUser = {
      id: loginRole === 'ADMIN' ? 1 : loginRole === 'CUSTOMER' ? 2 : 3,
      name: `Google User (${loginRole})`,
      email: `${loginRole.toLowerCase()}-google@gmail.com`,
      phone: "01788889999",
      role: loginRole,
      verified: true,
      profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    };
    setCurrentUser(mockUser);
    setIsLoggedIn(true);
    setActiveTab(loginRole === 'ADMIN' ? 'admin' : loginRole === 'WORKER' ? 'worker' : 'customer');
    alert("Logged in using simulated Google Authentication!");
  };

  // Quick helper to bypass login typing
  const triggerAutofillLogin = (role, emailStr) => {
    setLoginRole(role);
    setEmail(emailStr);
    setPassword('password123');
    setTimeout(() => {
      // Direct mock login
      const isVerified = emailStr !== 'sajid@gmail.com';
      const mockUser = { 
        id: emailStr === 'admin@skillverse.com' ? 1 : emailStr === 'anis@gmail.com' ? 2 : emailStr === 'kamrul@gmail.com' ? 3 : 5, 
        name: emailStr === 'admin@skillverse.com' ? "System Admin" : emailStr === 'anis@gmail.com' ? "Anisur Rahman" : emailStr === 'kamrul@gmail.com' ? "Kamrul Islam" : "Sajid Hasan", 
        email: emailStr, 
        role: role, 
        profilePicture: emailStr === 'admin@skillverse.com' 
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
          : emailStr === 'anis@gmail.com' 
            ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" 
            : "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150", 
        verified: isVerified 
      };
      setCurrentUser(mockUser);
      setIsLoggedIn(true);
      setActiveTab(role === 'ADMIN' ? 'admin' : role === 'WORKER' ? 'worker' : 'customer');
    }, 100);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setAiEstimate(null);
  };

  // Submit Work Application
  const handleSubmitWorkApplication = async () => {
    if (!nidNumber || !currentUser) {
      alert("Please enter NID number!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/workers/${currentUser.id}/verify?nid=${nidNumber}`, {
        method: 'POST'
      });

      if (res.ok) {
        alert("Application submitted! Admin verification is pending.");
        const updated = { ...currentUser, verified: false };
        setCurrentUser(updated);
      }
    } catch (e) {
      alert("Failed to submit NID verification application.");
    }
  };

  // Admin approves worker
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

  // Admin Catalog Course Addition
  const handleAdminAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseInstructor) return;
    try {
      const res = await fetch(`${API_BASE}/training/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          description: newCourseDesc || "No description provided",
          instructor: newCourseInstructor,
          duration: newCourseDuration || "4 Weeks",
          rating: 5.0,
          enrollmentCount: 0,
          image: newCourseImg
        })
      });
      if (res.ok) {
        alert("Course added to Academy!");
        setNewCourseTitle('');
        setNewCourseDesc('');
        setNewCourseInstructor('');
        setNewCourseDuration('');
        fetchCourses();
      }
    } catch (e) {
      alert("Error adding course.");
    }
  };

  // Admin Catalog Course Deletion
  const handleAdminDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`${API_BASE}/training/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Course deleted.");
        fetchCourses();
      }
    } catch (e) {
      alert("Error deleting course.");
    }
  };

  // Admin Catalog Tool Addition
  const handleAdminAddTool = async (e) => {
    e.preventDefault();
    if (!newToolTitle || !newToolPrice) return;
    try {
      const res = await fetch(`${API_BASE}/marketplace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newToolTitle,
          description: newToolDesc || "Heavy duty utility tool",
          price: Number(newToolPrice),
          type: newToolType,
          imageUrl: newToolImg,
          available: true
        })
      });
      if (res.ok) {
        alert("Tool added to store!");
        setNewToolTitle('');
        setNewToolDesc('');
        setNewToolPrice('');
        fetchMarketplace();
      }
    } catch (e) {
      alert("Error adding tool.");
    }
  };

  // Admin Catalog Tool Deletion
  const handleAdminDeleteTool = async (toolId) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    try {
      const res = await fetch(`${API_BASE}/marketplace/${toolId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Tool deleted.");
        fetchMarketplace();
      }
    } catch (e) {
      alert("Error deleting tool.");
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
    const finalPrice = offeredPrice ? Number(offeredPrice) : bookingCost;
    const photoToSend = selectedPhotoPreset ? selectedPhotoPreset.url : (customPhotoUrl || "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=300");

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.id,
          workerId: selectedWorker.user.id,
          serviceType: selectedWorker.skills.split(',')[0],
          estimatedCost: finalPrice,
          description: bookingDesc || "Requesting standard home checkup."
        })
      });
      if (res.ok) {
        const created = await res.json();
        
        // Upload photo url if selected
        if (photoToSend) {
          await fetch(`${API_BASE}/bookings/${created.id}/upload-before?photoUrl=${encodeURIComponent(photoToSend)}`, {
            method: 'PUT'
          });
        }

        setSelectedWorker(null);
        setBookingDesc('');
        setOfferedPrice('');
        setSelectedPhotoPreset(null);
        setCustomPhotoUrl('');
        fetchCustomerBookings();
        alert(`Booking placed with offered price: BDT ${finalPrice}! Waiting for technician response.`);
      }
    } catch (e) {
      alert("Ensure Spring Boot backend server is active!");
    }
  };

  // Send Counter Offer (Worker side)
  const handleSendCounterOffer = async (bookingId) => {
    const counterPrice = counterPrices[bookingId];
    if (!counterPrice || isNaN(counterPrice)) {
      alert("Please input a valid price offer!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/counter-offer?price=${counterPrice}&status=COUNTERED`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert(`Counter offer of BDT ${counterPrice} submitted to client.`);
        fetchWorkerProfileAndBookings(currentUser.id);
      }
    } catch (e) {
      alert("Failed to submit counter offer.");
    }
  };

  // Accept Counter Offer (Customer side)
  const handleAcceptCounterOffer = async (bookingId, acceptedPrice) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/counter-offer?price=${acceptedPrice}&status=ACCEPTED`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert("Accepted counter offer. Service worker has been dispatched.");
        fetchCustomerBookings();
      }
    } catch (e) {
      alert("Failed to accept offer.");
    }
  };

  // Change order status
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

  // Initiate Payment Sheet modal
  const startPaymentProcess = (booking) => {
    setPayingBooking(booking);
    setWalletNumber('');
  };

  // Confirm simulated Payment
  const submitSimulatedPayment = async () => {
    if (!walletNumber) {
      alert("Please enter your simulated account or phone number!");
      return;
    }
    try {
      // Simulate successful payment transaction and complete booking
      const res = await fetch(`${API_BASE}/bookings/${payingBooking.id}/status?status=COMPLETED`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert(`🎉 Direct Payment of BDT ${payingBooking.estimatedCost} successfully verified via ${paymentMethod.toUpperCase()}! Technician funds released.`);
        setPayingBooking(null);
        fetchCustomerBookings();
      }
    } catch (e) {
      alert("Payment processor connection failed.");
    }
  };

  // Mock enrollment / Mock buy actions
  const triggerMockAction = (itemTitle, category) => {
    alert(`Successfully enrolled/purchased: "${itemTitle}"! Added details to your user vault.`);
  };

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => {
          if (!isLoggedIn) return;
          if (currentUser.role === 'CUSTOMER') setActiveTab('customer');
          else if (currentUser.role === 'WORKER') setActiveTab('worker');
          else setActiveTab('admin');
        }}>
          <ShieldCheck size={28} color="#10b981" />
          <span>SkillVerse</span>
        </div>
        
        {/* Navigation Tabs based on role */}
        {isLoggedIn && (
          <div className="nav-links">
            {currentUser.role === 'CUSTOMER' && (
              <>
                <span className={`nav-link ${activeTab === 'customer' ? 'active' : ''}`} onClick={() => setActiveTab('customer')}>
                  Find Services
                </span>
                <span className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
                  Academy & Courses
                </span>
                <span className={`nav-link ${activeTab === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveTab('marketplace')}>
                  Tool Store
                </span>
              </>
            )}
            
            {currentUser.role === 'WORKER' && (
              <>
                <span className={`nav-link ${activeTab === 'worker' ? 'active' : ''}`} onClick={() => setActiveTab('worker')}>
                  Workspace
                </span>
                <span className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
                  Academy Courses
                </span>
                <span className={`nav-link ${activeTab === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveTab('marketplace')}>
                  Tools Store
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
        )}

        {/* User Details & Logout */}
        {isLoggedIn ? (
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
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`btn ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAuthMode('login')}>Login</button>
            <button className={`btn ${authMode === 'signup' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setAuthMode('signup')}>Sign Up</button>
          </div>
        )}
      </header>

      {/* --- AUTHENTICATION INTERFACE (LOGIN & SIGN UP) --- */}
      {!isLoggedIn && (
        <div style={{ display: 'flex', minHeight: '85vh', background: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', background: '#0e1526' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={36} color="var(--primary)" />
                <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SkillVerse
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI-Powered Verified Skills Marketplace & Service Ecosystem</p>
            </div>

            {/* Auth mode toggle tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <button 
                type="button" 
                className={`btn ${authMode === 'login' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button 
                type="button" 
                className={`btn ${authMode === 'signup' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setAuthMode('signup')}
              >
                Create Account
              </button>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Register/Login Role</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {authMode === 'signup' ? (
                  ['CUSTOMER', 'WORKER'].map(role => (
                    <button 
                      key={role} 
                      type="button" 
                      className={`btn ${loginRole === role ? 'btn-primary' : 'btn-secondary'}`} 
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }} 
                      onClick={() => setLoginRole(role)}
                    >
                      {role === 'CUSTOMER' ? 'Customer' : 'Technician / Worker'}
                    </button>
                  ))
                ) : (
                  ['CUSTOMER', 'WORKER', 'ADMIN'].map(role => (
                    <button 
                      key={role} 
                      type="button" 
                      className={`btn ${loginRole === role ? 'btn-primary' : 'btn-secondary'}`} 
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }} 
                      onClick={() => setLoginRole(role)}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </button>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp}>
              {authMode === 'signup' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '2.5rem' }} 
                      placeholder="Anisur Rahman" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              )}

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

              {authMode === 'signup' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="017xxxxxxxx" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                  />
                </div>
              )}

              {authMode === 'signup' && loginRole === 'WORKER' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">National NID Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 19932612954712365" 
                    value={nidNumber} 
                    onChange={e => setNidNumber(e.target.value)} 
                    required 
                  />
                </div>
              )}

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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}>
                {authMode === 'login' ? 'Secure Login' : 'Register Account'} <ArrowRight size={16} />
              </button>
            </form>

            {/* Google authentication button simulator */}
            <button className="btn btn-google" onClick={handleGoogleAuth}>
              <span style={{ marginRight: '0.4rem', fontWeight: 'bold', color: '#4285F4' }}>G</span> Sign in with Google
            </button>

            {/* Quick simulation helper login options */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.8rem' }}>
                ⚡ QUICK TEST DEMO LOGINS
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
      )}

      {/* --- CUSTOMER FIND SERVICES TAB --- */}
      {isLoggedIn && activeTab === 'customer' && currentUser.role === 'CUSTOMER' && (
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
                        <span className={`badge ${b.status === 'COMPLETED' ? 'badge-verified' : b.status === 'CANCELLED' ? 'badge-danger' : b.status === 'COUNTERED' ? 'badge-pending' : 'badge-pending'}`}>{b.status}</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.3rem' }}>BDT {b.estimatedCost}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <div style={{ flex: '1 1 300px' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <strong>Job details:</strong> {b.description}
                        </p>
                      </div>
                      {b.beforePhoto && (
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Diagnostic Photo:</div>
                          <img src={b.beforePhoto} alt="Problem Preview" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="timeline">
                      <div className={`timeline-step ${b.status !== 'CANCELLED' ? 'completed' : ''}`}>
                        <div className="timeline-dot">1</div>
                        <div className="timeline-label">Booked</div>
                      </div>
                      <div className={`timeline-step ${['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status) ? 'completed' : b.status === 'COUNTERED' ? 'active' : ''}`}>
                        <div className="timeline-dot">2</div>
                        <div className="timeline-label">{b.status === 'COUNTERED' ? 'Counter Offered' : 'Worker Dispatched'}</div>
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

                    {/* Counter Offer Decision Controls */}
                    {b.status === 'COUNTERED' && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Technician Counter Offer Notice</div>
                        <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>The worker has countered your original offer and requested <strong>BDT {b.estimatedCost}</strong> for the service.</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-primary" onClick={() => handleAcceptCounterOffer(b.id, b.estimatedCost)}>Accept Counter Offer</button>
                          <button className="btn btn-secondary" onClick={() => handleStatusChange(b.id, 'CANCELLED')}>Reject & Cancel</button>
                        </div>
                      </div>
                    )}

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
                            <button className="btn btn-primary" onClick={() => startPaymentProcess(b)}>
                              Verify Completion & Pay
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

      {/* --- WORKER WORKSPACE TAB --- */}
      {isLoggedIn && activeTab === 'worker' && currentUser.role === 'WORKER' && (
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

          {!currentUser.verified && (
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-gold)', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>🚨 Administrative Verification Required</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                You must submit a work application. Once verified by the System Admin, you will be authorized to accept client bookings.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-label">National NID Number</label>
                  <input className="form-input" placeholder="e.g. 19932612954712365" value={nidNumber} onChange={e => setNidNumber(e.target.value)} />
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleSubmitWorkApplication}>
                Submit Application to Admin
              </button>
            </div>
          )}

          {/* Worker Active Jobs List */}
          {currentUser.verified && (
            <>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={22} color="var(--primary)" /> Your Active Dispatched Orders
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
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
                      
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                        <div style={{ flex: '1 1 300px' }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <strong>Details:</strong> {wb.description}
                          </p>
                        </div>
                        {wb.beforePhoto && (
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Problem Photo uploaded by Client:</div>
                            <img src={wb.beforePhoto} alt="Problem Preview" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        {wb.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={() => handleStatusChange(wb.id, 'ACCEPTED', true)}>
                              Accept Booking Order
                            </button>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>or offer counter price:</span>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <input 
                                type="number" 
                                className="form-input" 
                                style={{ width: '120px', padding: '0.4rem' }} 
                                placeholder="Counter BDT"
                                value={counterPrices[wb.id] || ''}
                                onChange={e => setCounterPrices({ ...counterPrices, [wb.id]: Number(e.target.value) })}
                              />
                              <button className="btn btn-secondary" onClick={() => handleSendCounterOffer(wb.id)}>Submit Counter</button>
                            </div>
                          </div>
                        )}
                        {wb.status === 'COUNTERED' && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                            Counter Offer of <strong>BDT {wb.estimatedCost}</strong> sent to customer. Waiting for their approval.
                          </div>
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
                          <span className="badge badge-verified">Direct Payment Deposited into Wallet</span>
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

      {/* --- ACADEMY & COURSES TAB --- */}
      {isLoggedIn && activeTab === 'courses' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem' }}>SkillVerse Academy</h1>
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
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => triggerMockAction(c.title, 'course')}>
                  <BookOpen size={16} /> Enroll & Start Learning
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TOOLS MARKETPLACE TAB --- */}
      {isLoggedIn && activeTab === 'marketplace' && (
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
                  <button className="btn btn-primary" onClick={() => triggerMockAction(item.title, 'tool')}><ShoppingBag size={16} /> Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- DETAILED PROFILE & ANALYTICS TAB --- */}
      {isLoggedIn && activeTab === 'profile' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <img src={currentUser.profilePicture} alt={currentUser.name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
            <div>
              <h1 style={{ fontSize: '2.2rem' }}>{currentUser.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Email: {currentUser.email} • Role: <strong>{currentUser.role}</strong></p>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="badge badge-verified">{currentUser.verified ? 'Verified Active Account' : 'Verification Status: Unverified'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Left side: Role specific metrics & options */}
            {currentUser.role === 'CUSTOMER' ? (
              <>
                <div className="glass-card">
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}><Building size={20} /> Registered Properties</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                      <div style={{ fontWeight: 'bold' }}>🏡 Home Apartment</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sector 12, Road 4, Uttara, Dhaka</div>
                    </div>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                      <div style={{ fontWeight: 'bold' }}>🏢 Dhanmondi Office space</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Road 9A, Dhanmondi, Dhaka</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}><Calendar size={20} /> Preventative Maintenance Alerts</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <strong>AC Servicing Alert</strong>
                      <div style={{ color: 'var(--text-secondary)' }}>Due in 12 days for Uttara Apartment</div>
                    </div>
                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <strong>Water Line Inspection</strong>
                      <div style={{ color: 'var(--text-secondary)' }}>Scheduled for Dhanmondi on Oct 15</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card">
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)' }}><FolderOpen size={20} /> Digital Document Vault</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                      <span>🧾 Singer_AC_Warranty.pdf</span>
                      <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => alert("Opening Singer AC Warranty invoice...")}>View</span>
                    </div>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                      <span>🧾 Plumbing_Blueprint_Uttara.png</span>
                      <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => alert("Opening Plumbing schematic...")}>View</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="glass-card">
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>Professional Specialty Overview</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                    <div><strong>Offered Skills:</strong> Electrical, HVAC, AC Repairing</div>
                    <div><strong>Service Radius:</strong> Dhaka North (Gulshan, Banani, Uttara)</div>
                    <div><strong>Career Badges:</strong> Standard Biometric Verified, Verified NID Holder</div>
                    <div><strong>Platform Commission Tier:</strong> Standard 10% Platform rate</div>
                  </div>
                </div>

                <div className="glass-card">
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>Career Progression Levels</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div><strong>Rating Level:</strong> ⭐ 4.8 / 5.0 Rating average</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span>Progress to Silver Tier:</span>
                      <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', marginTop: '0.3rem', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--accent-gold)', width: '75%', height: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Right side: SVG Interactive Graphs */}
            <div className="glass-card" style={{ gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={22} color="var(--primary)" />
                {currentUser.role === 'CUSTOMER' ? 'Your Maintenance Expenditure (Last 6 Months)' : 'Weekly Earnings Performance (BDT)'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Interactive visualization of financial flow stats.</p>
              
              <div className="chart-container">
                {currentUser.role === 'CUSTOMER' ? (
                  // Line Chart for Customer Spend
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: 'auto' }}>
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="50" y1="30" x2="480" y2="30" className="chart-grid-line" />
                    <line x1="50" y1="80" x2="480" y2="80" className="chart-grid-line" />
                    <line x1="50" y1="130" x2="480" y2="130" className="chart-grid-line" />
                    <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" />
                    {/* Line path */}
                    <path d="M 50 150 L 120 120 L 190 160 L 260 80 L 330 90 L 400 40 L 480 30" fill="url(#chart-gradient)" />
                    <path d="M 50 150 L 120 120 L 190 160 L 260 80 L 330 90 L 400 40 L 480 30" className="chart-path" />
                    {/* Labels */}
                    <text x="50" y="190" fill="var(--text-muted)" fontSize="10">Mar</text>
                    <text x="120" y="190" fill="var(--text-muted)" fontSize="10">Apr</text>
                    <text x="190" y="190" fill="var(--text-muted)" fontSize="10">May</text>
                    <text x="260" y="190" fill="var(--text-muted)" fontSize="10">Jun</text>
                    <text x="330" y="190" fill="var(--text-muted)" fontSize="10">Jul</text>
                    <text x="400" y="190" fill="var(--text-muted)" fontSize="10">Aug</text>
                    
                    <text x="15" y="35" fill="var(--text-muted)" fontSize="10">BDT 15k</text>
                    <text x="15" y="85" fill="var(--text-muted)" fontSize="10">BDT 10k</text>
                    <text x="15" y="135" fill="var(--text-muted)" fontSize="10">BDT 5k</text>
                  </svg>
                ) : (
                  // Bar Chart for Worker Earnings
                  <svg viewBox="0 0 500 200" style={{ width: '100%', height: 'auto' }}>
                    <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" />
                    {/* Bars */}
                    <rect x="70" y="80" width="30" height="90" rx="3" className="chart-bar" />
                    <rect x="130" y="50" width="30" height="120" rx="3" className="chart-bar" />
                    <rect x="190" y="110" width="30" height="60" rx="3" className="chart-bar" />
                    <rect x="250" y="40" width="30" height="130" rx="3" className="chart-bar" />
                    <rect x="310" y="90" width="30" height="80" rx="3" className="chart-bar" />
                    <rect x="370" y="20" width="30" height="150" rx="3" className="chart-bar" />
                    <rect x="430" y="60" width="30" height="110" rx="3" className="chart-bar" />
                    {/* Labels */}
                    <text x="75" y="190" fill="var(--text-muted)" fontSize="10">Mon</text>
                    <text x="135" y="190" fill="var(--text-muted)" fontSize="10">Tue</text>
                    <text x="195" y="190" fill="var(--text-muted)" fontSize="10">Wed</text>
                    <text x="255" y="190" fill="var(--text-muted)" fontSize="10">Thu</text>
                    <text x="315" y="190" fill="var(--text-muted)" fontSize="10">Fri</text>
                    <text x="375" y="190" fill="var(--text-muted)" fontSize="10">Sat</text>
                    <text x="435" y="190" fill="var(--text-muted)" fontSize="10">Sun</text>

                    <text x="15" y="30" fill="var(--text-muted)" fontSize="10">4000</text>
                    <text x="15" y="100" fill="var(--text-muted)" fontSize="10">2000</text>
                    <text x="15" y="170" fill="var(--text-muted)" fontSize="10">0</text>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADMIN PORTAL TAB --- */}
      {isLoggedIn && activeTab === 'admin' && currentUser.role === 'ADMIN' && (
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={28} color="#f59e0b" />
              Administrative Command Center
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Approve pending workers, manage learning catalogs, and view system statistics.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            
            {/* Verification Panel */}
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
                          Verify Account & Approve NID
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Metrics Panel */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Platform Diagnostics</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Staff / Workers:</span>
                  <strong>{workers.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Verified Escrow Contracts:</span>
                  <strong>{bookings.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Platform Commission Volume:</span>
                  <strong style={{ color: 'var(--primary)' }}>BDT 45,200</strong>
                </div>
              </div>

              {/* platform chart volume */}
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>System Load Graph</div>
                <svg viewBox="0 0 300 100" style={{ width: '100%', height: 'auto' }}>
                  <path d="M 0 80 Q 75 20, 150 50 T 300 10 L 300 100 L 0 100 Z" fill="rgba(16, 185, 129, 0.15)" stroke="var(--primary)" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Catalog Editor Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Courses Management */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={20} color="var(--primary)" /> Academy Courses ({courses.length})</h2>
              
              <form onSubmit={handleAdminAddCourse} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Course Title" value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} required />
                  <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Instructor" value={newCourseInstructor} onChange={e => setNewCourseInstructor(e.target.value)} required />
                  <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Duration (e.g. 8 Weeks)" value={newCourseDuration} onChange={e => setNewCourseDuration(e.target.value)} />
                  <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Description" value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', justifyContent: 'center' }}><Plus size={14} /> Add Academy Course</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {courses.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div>
                      <strong>{c.title}</strong>
                      <div style={{ color: 'var(--text-muted)' }}>Instructor: {c.instructor}</div>
                    </div>
                    <button className="btn" style={{ padding: '0.2rem', background: 'transparent' }} onClick={() => handleAdminDeleteCourse(c.id)}>
                      <Trash2 size={14} color="var(--accent-rose)" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Catalog Management */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingBag size={20} color="var(--accent-blue)" /> Tool Store Catalog ({marketplaceItems.length})</h2>
              
              <form onSubmit={handleAdminAddTool} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Tool Title" value={newToolTitle} onChange={e => setNewToolTitle(e.target.value)} required />
                  <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} type="number" placeholder="Price (BDT)" value={newToolPrice} onChange={e => setNewToolPrice(e.target.value)} required />
                  <select className="form-select" style={{ fontSize: '0.8rem', padding: '0.4rem' }} value={newToolType} onChange={e => setNewToolType(e.target.value)}>
                    <option value="TOOL">Tool</option>
                    <option value="SPARE_PART">Spare Part</option>
                    <option value="RENTAL">Rental Device</option>
                  </select>
                  <input className="form-input" style={{ fontSize: '0.8rem', padding: '0.4rem' }} placeholder="Description" value={newToolDesc} onChange={e => setNewToolDesc(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', justifyContent: 'center' }}><Plus size={14} /> Add Tool Item</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {marketplaceItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div>
                      <strong>{item.title}</strong>
                      <div style={{ color: 'var(--text-muted)' }}>Price: BDT {item.price} • {item.type}</div>
                    </div>
                    <button className="btn" style={{ padding: '0.2rem', background: 'transparent' }} onClick={() => handleAdminDeleteTool(item.id)}>
                      <Trash2 size={14} color="var(--accent-rose)" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- UPGRADED BOOKING MODAL --- */}
      {selectedWorker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <img src={selectedWorker.user.profilePicture} alt={selectedWorker.user.name} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>Assign: {selectedWorker.user.name}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rank Level: <strong>{selectedWorker.careerLevel}</strong></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Service Category</label>
                <input className="form-input" style={{ fontSize: '0.9rem' }} value={selectedWorker.skills.split(',')[0]} readOnly />
              </div>
              <div>
                <label className="form-label">Suggested Cost (BDT)</label>
                <input className="form-input" style={{ fontSize: '0.9rem' }} value={bookingCost} readOnly />
              </div>
            </div>

            {/* Custom pricing offer option */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Offer Your Price (Optional BDT)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder={`e.g. ${bookingCost}`} 
                value={offeredPrice} 
                onChange={e => setOfferedPrice(e.target.value)} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Technician can review and counter-offer this pricing suggestion.</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Describe the problem</label>
              <textarea 
                className="form-textarea" 
                rows="2" 
                placeholder="Describe specific fixes needed (e.g. compressor oil leak, broken safety valve)"
                value={bookingDesc}
                onChange={(e) => setBookingDesc(e.target.value)}
              />
            </div>

            {/* Diagnostic Photo upload tool selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Attach Diagnostic Photo (Optional)</label>
              <div className="photo-preset-grid">
                {MOCK_PHOTOS.map(photo => (
                  <div 
                    key={photo.id} 
                    className={`photo-preset-item ${selectedPhotoPreset?.id === photo.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPhotoPreset(photo);
                      setCustomPhotoUrl('');
                    }}
                  >
                    <img src={photo.url} alt={photo.label} />
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', fontSize: '0.65rem', background: 'rgba(0,0,0,0.7)', textAlign: 'center', padding: '2px 0' }}>
                      {photo.label}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 0 }}>Select Image from Device</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-input" 
                  style={{ fontSize: '0.8rem', padding: '0.3rem' }} 
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCustomPhotoUrl(reader.result);
                        setSelectedPhotoPreset(null);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Or enter custom image URL:</div>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ fontSize: '0.8rem', padding: '0.4rem' }} 
                  placeholder="http://example.com/photo.jpg" 
                  value={customPhotoUrl && !customPhotoUrl.startsWith('data:') ? customPhotoUrl : ''} 
                  onChange={e => {
                    setCustomPhotoUrl(e.target.value);
                    setSelectedPhotoPreset(null);
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => {
                setSelectedWorker(null);
                setOfferedPrice('');
                setSelectedPhotoPreset(null);
                setCustomPhotoUrl('');
              }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateBooking}>Confirm & Dispatch</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAYMENT SHEET MODAL --- */}
      {payingBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h2 style={{ fontSize: '1.30rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              💳 Secure Direct Payment Gateways
            </h2>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Verify contract completion for <strong>{payingBooking.serviceType}</strong>. Funds will be directly disbursed to worker wallet.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span>Payable Amount:</span>
              <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>BDT {payingBooking.estimatedCost}</strong>
            </div>

            {/* Payment options selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Select Payment Channel</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button 
                  className={`btn ${paymentMethod === 'bkash' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setPaymentMethod('bkash')}
                >
                  bKash / Nagad Wallet
                </button>
                <button 
                  className={`btn ${paymentMethod === 'bank' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setPaymentMethod('bank')}
                >
                  Bank Transfer / Card
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">
                {paymentMethod === 'bkash' ? 'bKash Mobile Account Number' : 'Bank Account / Card Number'}
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder={paymentMethod === 'bkash' ? 'e.g. 01700000000' : 'e.g. 1234-5678-9012'}
                value={walletNumber}
                onChange={e => setWalletNumber(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setPayingBooking(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitSimulatedPayment}>Confirm & Authorize Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 SkillVerse Bangladesh. All rights reserved. Course Project Submission.</p>
      </footer>
    </div>
  );
}

export default App;
