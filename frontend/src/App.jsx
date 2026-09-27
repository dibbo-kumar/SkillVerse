import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Award,
  Search,
  SlidersHorizontal,
  Plus,
  Calendar,
  Zap,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Compass,
  FileText,
  Briefcase,
  Key,
  Database,
  Lock,
  LogOut,
  Mail,
  User,
  Trash2,
  TrendingUp,
  Heart,
  Navigation,
  XCircle,
  Camera,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import CustomerProfileHub from './components/customer/CustomerProfileHub';
import CustomerSettings from './components/customer/CustomerSettings';
import TechnicianMap, { calculateDistanceKm, formatDistanceString } from './components/customer/TechnicianMap';
import AcademyCoursesHub from './components/academy/AcademyCoursesHub';
import AdminAcademyManager from './components/academy/AdminAcademyManager';
import ToolStoreHub from './components/store/ToolStoreHub';
import AdminStoreManager from './components/store/AdminStoreManager';
import MyBookingsHub from './components/bookings/MyBookingsHub';
import PostProblemModal from './components/bookings/PostProblemModal';
import WorkerDashboard from './components/worker/WorkerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import NotificationBell from './components/notifications/NotificationBell';
import PostedProblemsHub from './components/bookings/PostedProblemsHub';
import LandingPage from './components/landing/LandingPage';

const API_BASE = "http://localhost:8081/api";

// Preset diagnostic photos for customer mock upload
const MOCK_PHOTOS = [
  { id: 'ac', label: 'AC Coil Burnout', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=300' },
  { id: 'pipe', label: 'Ruptured Pipe Leak', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300' },
  { id: 'fuse', label: 'Blown Circuit Box', url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300' }
];

// Initial mock customer management data
const INITIAL_PROPERTIES = [
  {
    id: 1,
    name: 'Uttara Residence',
    type: 'Home',
    address: 'House 14, Road 4, Sector 12, Uttara, Dhaka',
    appliances: [
      {
        id: 101,
        name: 'Master Bed General Inverter AC',
        category: 'HVAC & AC',
        brand: 'General',
        model: '1.5 Ton Inverter',
        lastServiceDate: '15 Jan 2026',
        nextServiceDate: 'Due this week',
        maintenanceDue: true
      },
      {
        id: 102,
        name: 'Submersible Water Pump',
        category: 'Plumbing & Pumps',
        brand: 'Pedrollo',
        model: '1.5 HP',
        lastServiceDate: '10 Feb 2026',
        nextServiceDate: 'In 4 months',
        maintenanceDue: false
      }
    ]
  },
  {
    id: 2,
    name: 'Dhanmondi Office Space',
    type: 'Office',
    address: 'Level 4, Plot 22, Road 9A, Dhanmondi, Dhaka',
    appliances: [
      {
        id: 103,
        name: 'Central VRF Cooling Unit',
        category: 'HVAC & AC',
        brand: 'Daikin',
        model: 'VRV 5 Ton',
        lastServiceDate: '01 Dec 2025',
        nextServiceDate: 'In 2 weeks',
        maintenanceDue: true
      }
    ]
  }
];

const INITIAL_ADDRESSES = [
  {
    id: 1,
    label: 'Home Apartment',
    type: 'Home',
    streetAddress: 'House 14, Road 4, Sector 12',
    area: 'Uttara',
    city: 'Dhaka',
    landmark: 'Near Milestone School',
    address: 'House 14, Road 4, Sector 12, Uttara, Dhaka',
    isDefault: true
  },
  {
    id: 2,
    label: 'Dhanmondi Office',
    type: 'Office',
    streetAddress: 'Level 4, Plot 22, Road 9A',
    area: 'Dhanmondi',
    city: 'Dhaka',
    landmark: 'Opposite to Ibn Sina Hospital',
    address: 'Level 4, Plot 22, Road 9A, Dhanmondi, Dhaka',
    isDefault: false
  }
];

const INITIAL_SERVICE_HISTORY = [
  {
    id: 1,
    jobId: 'FC-2026-9921',
    serviceName: 'AC Comprehensive Servicing & Gas Top-up',
    technicianName: 'Kamrul Islam',
    category: 'HVAC & AC',
    date: '28 Aug 2026',
    property: 'Uttara Residence',
    problemReported: 'Indoor unit cooling drops and strange compressor vibration.',
    workPerformed: 'Chemical jet foam coil wash, condenser filter clearing, and R410A refrigerant gas top-up to 120 PSI.',
    partsUsed: [
      { name: 'R410A Eco Refrigerant Gas (1kg)', cost: 1200, quantity: 1 },
      { name: 'Copper Flare Nut Coupling', cost: 150, quantity: 2 }
    ],
    laborCost: 800,
    partsCost: 1500,
    platformFee: 50,
    discount: 150,
    total: 2200,
    paymentMethod: 'bKash Escrow',
    status: 'Verified Completed',
    warrantyDaysRemaining: 27,
    warrantyTitle: '30-Day FixConnect Service Guarantee',
    warrantyDescription: 'Free re-inspection and leak testing if cooling drops within 30 days.',
    completionCode: '9143'
  },
  {
    id: 2,
    jobId: 'FC-2026-9810',
    serviceName: 'Bathroom Concealed Pipe Leak Repair',
    technicianName: 'Mohammad Rafiq',
    category: 'Plumbing',
    date: '14 Aug 2026',
    property: 'Dhanmondi Office Space',
    problemReported: 'Concealed waterline leaking behind master bathroom tiles.',
    workPerformed: 'Acoustic leak detection, wall patch opening, defective PVC joint replacement, and pressure test verification.',
    partsUsed: [
      { name: 'Heavy-duty CPVC Tee Joint 1/2"', cost: 250, quantity: 2 }
    ],
    laborCost: 650,
    partsCost: 500,
    platformFee: 50,
    discount: 0,
    total: 1200,
    paymentMethod: 'Cash on Delivery',
    status: 'Verified Completed',
    warrantyDaysRemaining: 13,
    warrantyTitle: '30-Day FixConnect Service Guarantee',
    warrantyDescription: 'Free repair if pressure joint leaks within 30 days.',
    completionCode: '6320'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 1,
    txCode: 'TXN-881920',
    bookingId: 1,
    serviceName: 'AC Comprehensive Servicing & Gas Top-up',
    technicianName: 'Kamrul Islam',
    date: '28 Aug 2026',
    method: 'bKash Wallet',
    amount: 2200,
    status: 'COMPLETED'
  },
  {
    id: 2,
    txCode: 'TXN-876110',
    bookingId: 2,
    serviceName: 'Bathroom Concealed Pipe Leak Repair',
    technicianName: 'Mohammad Rafiq',
    date: '14 Aug 2026',
    method: 'Cash on Service',
    amount: 1200,
    status: 'COMPLETED'
  }
];

const INITIAL_REVIEWS = [
  {
    id: 1,
    bookingId: 1,
    workerId: 1,
    technicianName: 'Kamrul Islam',
    technicianAvatar: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150',
    serviceName: 'AC Comprehensive Servicing & Gas Top-up',
    rating: 5,
    comment: 'Kamrul bhai was extremely punctual, brought proper digital gauge equipment, and cleaned the entire work area afterwards. The AC is now super cold!',
    date: '29 Aug 2026',
    tags: ['Punctual & Polite', 'Great Work Quality', 'Explained Problem Well']
  }
];

const INITIAL_WORKERS = [
  {
    id: 1,
    skills: 'Electrical, AC Repair, Smart Home',
    experienceYears: 6,
    serviceArea: 'Sector 11, Uttara, Dhaka',
    careerLevel: 'Gold',
    hourlyRate: 450,
    basePrice: 300,
    latitude: 23.8720,
    longitude: 90.3810,
    user: {
      id: 3,
      name: 'Kamrul Islam',
      email: 'kamrul@gmail.com',
      phone: '01911223344',
      role: 'WORKER',
      verified: true,
      rating: 4.8,
      profilePicture: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150'
    }
  },
  {
    id: 2,
    skills: 'Plumbing, Water Pump Repair',
    experienceYears: 10,
    serviceArea: 'Road 9A, Dhanmondi, Dhaka',
    careerLevel: 'Master',
    hourlyRate: 500,
    basePrice: 350,
    latitude: 23.7461,
    longitude: 90.3742,
    user: {
      id: 4,
      name: 'Mohammad Rafiq',
      email: 'rafiq@gmail.com',
      phone: '01511223344',
      role: 'WORKER',
      verified: true,
      rating: 4.9,
      profilePicture: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150'
    }
  },
  {
    id: 4,
    skills: 'AC Repair, HVAC Servicing, Refrigerant Gas Top-up',
    experienceYears: 8,
    serviceArea: 'Sector 13, Uttara, Dhaka',
    careerLevel: 'Master',
    hourlyRate: 550,
    basePrice: 400,
    latitude: 23.8745,
    longitude: 90.3815,
    user: {
      id: 6,
      name: 'Tariqul Islam',
      email: 'tariq@gmail.com',
      phone: '01712345678',
      role: 'WORKER',
      verified: true,
      rating: 4.9,
      profilePicture: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
    }
  },
  {
    id: 5,
    skills: 'Electrical, Smart Home Automation, Generator Repair',
    experienceYears: 5,
    serviceArea: 'Sector 3, Uttara, Dhaka',
    careerLevel: 'Gold',
    hourlyRate: 400,
    basePrice: 300,
    latitude: 23.8680,
    longitude: 90.3910,
    user: {
      id: 7,
      name: 'Tanvir Ahmed',
      email: 'tanvir@gmail.com',
      phone: '01823456789',
      role: 'WORKER',
      verified: true,
      rating: 4.7,
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  },
  {
    id: 6,
    skills: 'Plumbing, Water Pump Repair, Gas Line Fitting',
    experienceYears: 9,
    serviceArea: 'Road 71, Gulshan 2, Dhaka',
    careerLevel: 'Platinum',
    hourlyRate: 500,
    basePrice: 350,
    latitude: 23.7925,
    longitude: 90.4078,
    user: {
      id: 8,
      name: 'Mahfuzur Rahman',
      email: 'mahfuz@gmail.com',
      phone: '01934567890',
      role: 'WORKER',
      verified: true,
      rating: 4.85,
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  },
  {
    id: 7,
    skills: 'House Painting, Wood Polish, Carpentry',
    experienceYears: 4,
    serviceArea: 'Section 11, Mirpur, Dhaka',
    careerLevel: 'Silver',
    hourlyRate: 350,
    basePrice: 250,
    latitude: 23.8150,
    longitude: 90.3650,
    user: {
      id: 9,
      name: 'Kazi Kabir',
      email: 'kabir@gmail.com',
      phone: '01545678901',
      role: 'WORKER',
      verified: true,
      rating: 4.6,
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  },
  {
    id: 8,
    skills: 'AC Repair, Washing Machine Repair, Microwave Repair',
    experienceYears: 7,
    serviceArea: 'Block E, Banani, Dhaka',
    careerLevel: 'Platinum',
    hourlyRate: 480,
    basePrice: 300,
    latitude: 23.7930,
    longitude: 90.4040,
    user: {
      id: 10,
      name: 'Shahriar Hossain',
      email: 'shahriar@gmail.com',
      phone: '01656789012',
      role: 'WORKER',
      verified: true,
      rating: 4.95,
      profilePicture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
    }
  },
  {
    id: 9,
    skills: 'Washing Machine Repair, Refrigerator Gas Top-up, PCB Repair',
    experienceYears: 8,
    serviceArea: 'Block C, Bashundhara R/A, Dhaka',
    careerLevel: 'Master',
    hourlyRate: 520,
    basePrice: 350,
    latitude: 23.8155,
    longitude: 90.4250,
    user: {
      id: 11,
      name: 'Farhan Ahmed',
      email: 'farhan@gmail.com',
      phone: '01722334455',
      role: 'WORKER',
      verified: true,
      rating: 4.88,
      profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
    }
  },
  {
    id: 10,
    skills: 'Electrical, CCTV Camera Installation, IPS & UPS Repair',
    experienceYears: 6,
    serviceArea: 'Middle Badda, Dhaka',
    careerLevel: 'Gold',
    hourlyRate: 420,
    basePrice: 300,
    latitude: 23.7850,
    longitude: 90.4270,
    user: {
      id: 12,
      name: 'Imtiaz Chowdhury',
      email: 'imtiaz@gmail.com',
      phone: '01833445566',
      role: 'WORKER',
      verified: true,
      rating: 4.75,
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  },
  {
    id: 11,
    skills: 'Gas Stove Burner Fitting, RO Water Purifier Servicing, Kitchen Geyser',
    experienceYears: 5,
    serviceArea: 'Kazi Nazrul Islam Road, Mohammadpur, Dhaka',
    careerLevel: 'Gold',
    hourlyRate: 400,
    basePrice: 250,
    latitude: 23.7590,
    longitude: 90.3620,
    user: {
      id: 13,
      name: 'Zubaer Rahman',
      email: 'zubaer@gmail.com',
      phone: '01944556677',
      role: 'WORKER',
      verified: true,
      rating: 4.82,
      profilePicture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
    }
  },
  {
    id: 12,
    skills: 'Deep House Cleaning, Overhead Water Tank Jet Wash, Sofa Cleaning',
    experienceYears: 7,
    serviceArea: 'Tamtola, Khilgaon, Dhaka',
    careerLevel: 'Platinum',
    hourlyRate: 380,
    basePrice: 250,
    latitude: 23.7520,
    longitude: 90.4210,
    user: {
      id: 14,
      name: 'Ariful Islam',
      email: 'arif@gmail.com',
      phone: '01555667788',
      role: 'WORKER',
      verified: true,
      rating: 4.90,
      profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    }
  },
  {
    id: 13,
    skills: 'Roof Damp Leak Proofing, Tile Fitting, Masonry Work',
    experienceYears: 11,
    serviceArea: 'Lalbagh Fort Road, Old Dhaka, Dhaka',
    careerLevel: 'Master',
    hourlyRate: 450,
    basePrice: 300,
    latitude: 23.7180,
    longitude: 90.3880,
    user: {
      id: 15,
      name: 'Hasan Mahmud',
      email: 'hasan@gmail.com',
      phone: '01666778899',
      role: 'WORKER',
      verified: true,
      rating: 4.70,
      profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
    }
  },
  {
    id: 14,
    skills: 'AC Repair, Inverter Compressor Replacement, Gas Top-up',
    experienceYears: 9,
    serviceArea: 'Sector 18, Uttara, Dhaka',
    careerLevel: 'Platinum',
    hourlyRate: 550,
    basePrice: 400,
    latitude: 23.8920,
    longitude: 90.3950,
    user: {
      id: 16,
      name: 'Nazmul Huda',
      email: 'nazmul@gmail.com',
      phone: '01777889900',
      role: 'WORKER',
      verified: true,
      rating: 4.92,
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  },
  {
    id: 15,
    skills: 'Plumbing, Sewer Line Unclogging, High Pressure Drain Wash',
    experienceYears: 8,
    serviceArea: 'Stadium Road, Mirpur 2, Dhaka',
    careerLevel: 'Gold',
    hourlyRate: 460,
    basePrice: 300,
    latitude: 23.8080,
    longitude: 90.3610,
    user: {
      id: 17,
      name: 'Biplob Hossain',
      email: 'biplob@gmail.com',
      phone: '01888990011',
      role: 'WORKER',
      verified: true,
      rating: 4.80,
      profilePicture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
    }
  }
];

function App() {
  // Theme state: defaults to 'light' (Primary Theme), persists in localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('skillverse_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('skillverse_theme', theme);
  }, [theme]);

  // Logged in user state persisted in localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('fixconnect_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('fixconnect_user');
  });

  const [authMode, setAuthMode] = useState('login'); // login, signup
  const [loginRole, setLoginRole] = useState('CUSTOMER'); // CUSTOMER, WORKER, ADMIN
  const [authViewOpen, setAuthViewOpen] = useState(false);

  // Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [nidNumber, setNidNumber] = useState('');

  // Single Admin Portal Password state
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [authError, setAuthError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPath = location.pathname.startsWith('/admin');

  // Single Admin Authentication Handler
  const handleAdminPasswordSubmit = (e) => {
    if (e) e.preventDefault();
    if (adminPasswordInput === '000000') {
      const adminUser = {
        id: 1,
        name: 'System Admin',
        email: 'admin@skillverse.com',
        phone: '01800000000',
        role: 'ADMIN',
        verified: true,
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
      localStorage.setItem('skillverse_admin_active_tab', 'overview');
      setCurrentUser(adminUser);
      setIsLoggedIn(true);
      setActiveTab('admin');
      setAdminAuthError('');
      setAdminPasswordInput('');
    } else {
      setAdminAuthError('Incorrect Password! Master Admin password is required.');
    }
  };

  // Map browser URL paths to logical views
  const getTabFromPath = (path) => {
    if (path.startsWith('/bookings') || path.startsWith('/my-bookings')) return 'my-bookings';
    if (path.startsWith('/academy') || path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/store') || path.startsWith('/marketplace')) return 'marketplace';
    if (path.startsWith('/worker')) return 'worker';
    if (path.startsWith('/profile') || path.startsWith('/settings')) return 'profile';
    if (path.startsWith('/admin')) return 'admin';
    return 'customer';
  };

  const getPathFromTab = (tab) => {
    switch (tab) {
      case 'my-bookings': return '/bookings';
      case 'courses': return '/academy';
      case 'marketplace': return '/store';
      case 'worker': return '/worker/dashboard';
      case 'profile': return '/profile';
      case 'admin': return '/admin';
      case 'customer':
      default:
        return '/';
    }
  };

  const activeTab = getTabFromPath(location.pathname);

  const setActiveTab = (tab) => {
    const targetPath = getPathFromTab(tab);
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  // App data states
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [bookings, setBookings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [workerBookings, setWorkerBookings] = useState([]);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [showPostProblemModal, setShowPostProblemModal] = useState(false);
  const [showPostedProblemsModal, setShowPostedProblemsModal] = useState(false);
  const [contextualBookingStore, setContextualBookingStore] = useState(null);
  const getUserKey = (prefix, u) => u ? `skillverse_${prefix}_${u.id || u.email}` : `skillverse_${prefix}_guest`;

  const [notifications, setNotifications] = useState([]);
  const [savedWorkerIds, setSavedWorkerIds] = useState([]);
  const [properties, setProperties] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rewards, setRewards] = useState({ points: 100, tier: 'Welcome Member', referralCode: 'SKILL-USER' });

  // Load user-isolated data whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setSavedWorkerIds([]);
      setProperties([]);
      setAddresses([]);
      setServiceHistory([]);
      setTransactions([]);
      setReviews([]);
      setRewards({ points: 0, tier: 'Guest', referralCode: '' });
      return;
    }

    const isDemoAnis = currentUser.email === 'anis@gmail.com';

    // Notifications
    const savedNotifs = localStorage.getItem(getUserKey('notifications', currentUser));
    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)); } catch (e) { setNotifications([]); }
    } else {
      setNotifications(isDemoAnis ? [
        { id: 1, title: 'Worker Price Offer Received', message: 'Mohammad Rafiq submitted a quote of ৳1100 for your AC Leak problem post.', time: '10m ago', read: false },
        { id: 2, title: 'Technician En-Route', message: 'Technician Kamrul Islam has marked status as On The Way to your address.', time: '1h ago', read: false },
        { id: 3, title: 'Service Completed', message: 'Bathroom Concealed Pipe Leak Repair has been completed.', time: '1d ago', read: true }
      ] : []);
    }

    // Saved Workers
    const savedW = localStorage.getItem(getUserKey('saved_workers', currentUser));
    if (savedW) {
      try { setSavedWorkerIds(JSON.parse(savedW)); } catch (e) { setSavedWorkerIds([]); }
    } else {
      setSavedWorkerIds(isDemoAnis ? [1, 2] : []);
    }

    // Properties
    const savedProps = localStorage.getItem(getUserKey('properties', currentUser));
    if (savedProps) {
      try { setProperties(JSON.parse(savedProps)); } catch (e) { setProperties([]); }
    } else {
      setProperties(isDemoAnis ? INITIAL_PROPERTIES : []);
    }

    // Addresses
    const savedAddr = localStorage.getItem(getUserKey('addresses', currentUser));
    if (savedAddr) {
      try { setAddresses(JSON.parse(savedAddr)); } catch (e) { setAddresses([]); }
    } else {
      setAddresses(isDemoAnis ? INITIAL_ADDRESSES : (currentUser.address ? [{ id: 1, label: 'Primary Location', fullAddress: currentUser.address, isDefault: true }] : []));
    }

    // Service History
    const savedHist = localStorage.getItem(getUserKey('service_history', currentUser));
    if (savedHist) {
      try { setServiceHistory(JSON.parse(savedHist)); } catch (e) { setServiceHistory([]); }
    } else {
      setServiceHistory(isDemoAnis ? INITIAL_SERVICE_HISTORY : []);
    }

    // Transactions
    const savedTx = localStorage.getItem(getUserKey('transactions', currentUser));
    if (savedTx) {
      try { setTransactions(JSON.parse(savedTx)); } catch (e) { setTransactions([]); }
    } else {
      setTransactions(isDemoAnis ? INITIAL_TRANSACTIONS : []);
    }

    // Reviews
    const savedRev = localStorage.getItem(getUserKey('reviews', currentUser));
    if (savedRev) {
      try { setReviews(JSON.parse(savedRev)); } catch (e) { setReviews([]); }
    } else {
      setReviews(isDemoAnis ? INITIAL_REVIEWS : []);
    }

    // Rewards
    const savedRew = localStorage.getItem(getUserKey('rewards', currentUser));
    if (savedRew) {
      try { setRewards(JSON.parse(savedRew)); } catch (e) { setRewards({ points: 100, tier: 'Welcome Member', referralCode: 'SKILL-' + (currentUser.id || '1') }); }
    } else {
      setRewards(isDemoAnis ? { points: 450, tier: 'Gold Tier Member', referralCode: 'FIX-ANIS-8821' } : { points: 100, tier: 'Welcome Member', referralCode: 'SKILL-' + (currentUser.id || 'NEW') });
    }
  }, [currentUser?.id, currentUser?.email]);

  // Sync to user-specific localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('notifications', currentUser), JSON.stringify(notifications));
    }
  }, [notifications, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('saved_workers', currentUser), JSON.stringify(savedWorkerIds));
    }
  }, [savedWorkerIds, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('properties', currentUser), JSON.stringify(properties));
    }
  }, [properties, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('addresses', currentUser), JSON.stringify(addresses));
    }
  }, [addresses, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('service_history', currentUser), JSON.stringify(serviceHistory));
    }
  }, [serviceHistory, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('transactions', currentUser), JSON.stringify(transactions));
    }
  }, [transactions, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('reviews', currentUser), JSON.stringify(reviews));
    }
  }, [reviews, currentUser?.id, currentUser?.email]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getUserKey('rewards', currentUser), JSON.stringify(rewards));
    }
  }, [rewards, currentUser?.id, currentUser?.email]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fixconnect_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fixconnect_user');
    }
  }, [currentUser]);
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('fixconnect_active_tab', activeTab);
    }
  }, [activeTab]);

  // AI Estimator state
  const [issueDesc, setIssueDesc] = useState('');
  const [aiEstimate, setAiEstimate] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Per-user AI Chat state & isolation
  const getChatKey = (u) => u ? `fixconnect_chat_${u.id || u.email}` : 'fixconnect_chat_guest';
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(() => {
    const savedUser = localStorage.getItem('fixconnect_user');
    const u = savedUser ? JSON.parse(savedUser) : null;
    const key = getChatKey(u);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [
      { sender: 'ai', text: 'Salam! I am your SkillVerse AI Assistant. How can I help you today?' }
    ];
  });

  // Load chat messages when currentUser changes
  useEffect(() => {
    const key = getChatKey(currentUser);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setChatMessages(JSON.parse(saved));
      } catch (e) {
        setChatMessages([{ sender: 'ai', text: 'Salam! I am your SkillVerse AI Assistant. How can I help you today?' }]);
      }
    } else {
      setChatMessages([{ sender: 'ai', text: 'Salam! I am your SkillVerse AI Assistant. How can I help you today?' }]);
    }
  }, [currentUser?.id, currentUser?.email]);

  // Persist chat messages to current user's local key
  useEffect(() => {
    const key = getChatKey(currentUser);
    localStorage.setItem(key, JSON.stringify(chatMessages));
  }, [chatMessages, currentUser?.id, currentUser?.email]);

  // Booking modal states
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [viewingWorker, setViewingWorker] = useState(null); // Floating worker details modal
  const [viewingWorkerReviews, setViewingWorkerReviews] = useState([]);
  const [loadingWorkerReviews, setLoadingWorkerReviews] = useState(false);
  const [toastPopup, setToastPopup] = useState(null); // { title, message, type, onDone }

  // Fetch reviews for viewing worker dynamically
  useEffect(() => {
    if (!viewingWorker) {
      setViewingWorkerReviews([]);
      return;
    }
    const workerUserId = viewingWorker.user?.id || viewingWorker.id;
    setLoadingWorkerReviews(true);
    fetch(`${API_BASE}/bookings/reviews/worker/${workerUserId}`)
      .then(res => res.json())
      .then(data => {
        setViewingWorkerReviews(data || []);
        setLoadingWorkerReviews(false);
      })
      .catch(err => {
        setViewingWorkerReviews([]);
        setLoadingWorkerReviews(false);
      });
  }, [viewingWorker]);

  // Real-time backend notification fetching & polling
  const fetchBackendNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/user/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (e) {
      // ignore network errors
    }
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchBackendNotifications();
    const interval = setInterval(fetchBackendNotifications, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const handleMarkAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (currentUser?.id) {
      try {
        await fetch(`${API_BASE}/notifications/user/${currentUser.id}/read-all`, { method: 'PUT' });
      } catch (e) {}
    }
  };

  const handleNotificationClick = async (n) => {
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    try {
      await fetch(`${API_BASE}/notifications/${n.id}/read`, { method: 'PUT' });
    } catch (e) {}
    if (n.title?.includes('Offer') || n.title?.includes('Post')) {
      setShowPostedProblemsModal(true);
    } else {
      setActiveTab('my-bookings');
    }
  };
  const [locationMode, setLocationMode] = useState('gps'); // 'gps' or 'manual'
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingCost, setBookingCost] = useState(1200);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [selectedApplianceId, setSelectedApplianceId] = useState('');
  const [selectedPhotoPreset, setSelectedPhotoPreset] = useState(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Floating Toast alert popup handler
  const showToast = (title, message, type = 'success', onDone = null) => {
    setToastPopup({ title, message, type, onDone });
  };

  // GPS Location Fetcher
  const handleFetchGpsLocation = () => {
    setIsGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lon = pos.coords.longitude.toFixed(4);
          setBookingAddress(`GPS Location (${lat}, ${lon}) - Sector 12, Uttara, Dhaka`);
          setIsGpsLoading(false);
        },
        () => {
          setBookingAddress('House 14, Road 4, Sector 12, Uttara, Dhaka (GPS Shared)');
          setIsGpsLoading(false);
        }
      );
    } else {
      setBookingAddress('House 14, Road 4, Sector 12, Uttara, Dhaka');
      setIsGpsLoading(false);
    }
  };

  // Technician Search & Radius Filter States
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState(999); // km (999 = All Areas)
  const RADIUS_OPTIONS = [
    { label: '500m', value: 0.5 },
    { label: '1 km', value: 1 },
    { label: '3 km', value: 3 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
    { label: 'All Areas', value: 999 }
  ];
  const CATEGORY_CHIPS = ['All', 'HVAC & AC', 'Plumbing', 'Electrical', 'Painting', 'Smart Home', 'Carpentry'];
  
  const [customerLocation, setCustomerLocation] = useState({
    lat: currentUser?.latitude || 23.8759,
    lon: currentUser?.longitude || 90.3795,
    address: currentUser?.address || 'House 14, Road 4, Sector 12, Uttara, Dhaka'
  });
  const [isCustomerLocating, setIsCustomerLocating] = useState(false);

  // Sync customer location if user profile updates
  useEffect(() => {
    if (currentUser?.latitude && currentUser?.longitude) {
      setCustomerLocation({
        lat: currentUser.latitude,
        lon: currentUser.longitude,
        address: currentUser.address || 'Dhaka, Bangladesh'
      });
    }
  }, [currentUser?.latitude, currentUser?.longitude, currentUser?.address]);

  const handleDetectCustomerGps = () => {
    if (!("geolocation" in navigator)) {
      showToast("Not Supported", "Geolocation is not supported by your browser.", "error");
      return;
    }
    setIsCustomerLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsCustomerLocating(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let addr = `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16`);
          if (res.ok) {
            const data = await res.json();
            const a = data.address || {};
            const resolved = [a.suburb || a.neighbourhood || a.residential || a.road, a.city || 'Dhaka'].filter(Boolean).join(', ');
            if (resolved) addr = resolved;
          }
        } catch (e) {
          console.warn(e);
        }
        setCustomerLocation({ lat, lon, address: addr });
        showToast("Location Updated", `Discovery radar centered at ${addr}.`, "success");
      },
      (err) => {
        setIsCustomerLocating(false);
        showToast("GPS Error", "Could not get device GPS location. Please allow browser location permissions.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Counter-offer state (Worker)
  const [counterPrices, setCounterPrices] = useState({}); // { bookingId: price }

  // OTP Verification State
  const [otpInputs, setOtpInputs] = useState({}); // { bookingId: enteredOtp }
  const [otpErrors, setOtpErrors] = useState({}); // { bookingId: errorMsg }

  // Payment Sheet Modal State
  const [payingBooking, setPayingBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bkash'); // bkash, bank, cash
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
    fetchWorkers(customerLocation.lat, customerLocation.lon, selectedRadius, selectedCategory, skillSearchQuery);
    fetchCourses();
    fetchMarketplace();
    fetchAllUsers();
  }, []);

  // Re-fetch nearby workers when location, radius, category, or search changes
  useEffect(() => {
    fetchWorkers(customerLocation.lat, customerLocation.lon, selectedRadius, selectedCategory, skillSearchQuery);
  }, [customerLocation.lat, customerLocation.lon, selectedRadius, selectedCategory, skillSearchQuery]);

  const fetchWorkers = async (lat, lon, radius, cat, q) => {
    try {
      let url = `${API_BASE}/workers/nearby?`;
      if (lat && lon) {
        url += `lat=${lat}&lon=${lon}&`;
      }
      if (radius && radius < 900) {
        url += `radius=${radius}&`;
      }
      if (cat && cat !== 'All') {
        url += `category=${encodeURIComponent(cat)}&`;
      }
      if (q && q.trim()) {
        url += `query=${encodeURIComponent(q.trim())}&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setWorkers(data);
          return;
        }
      }
      // Fallback to /api/workers
      const fallbackRes = await fetch(`${API_BASE}/workers`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          setWorkers(fallbackData);
        }
      }
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
      const hydrated = data.map(b => ({
        ...b,
        startVerificationCode: b.startVerificationCode || '4829',
        completionVerificationCode: b.completionVerificationCode || '9143',
        liveLocation: b.liveLocation || '23.8103, 90.4125'
      }));
      setBookings(hydrated);
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
        const hydrated = dataBookings.map(b => ({
          ...b,
          startVerificationCode: b.startVerificationCode || '4829',
          completionVerificationCode: b.completionVerificationCode || '9143',
          liveLocation: b.liveLocation || '23.8103, 90.4125'
        }));
        setWorkerBookings(hydrated);
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
      const res = await fetch(`${API_BASE}/verification/pending`);
      if (res.ok) {
        const data = await res.json();
        setPendingApplications(data);
      } else {
        const resWorkers = await fetch(`${API_BASE}/workers`);
        const dataWorkers = await resWorkers.json();
        const pending = dataWorkers.filter(w => !w.user.verified);
        setPendingApplications(pending);
      }
    } catch (e) {
      console.error("Admin data fetch failed", e);
    }
  };

  // Submit Sign Up
  const validateBdPhone = (num) => /^01[3-9]\d{8}$/.test((num || '').trim());

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !name || !phone || !password) {
      return;
    }
    if (!validateBdPhone(phone)) {
      setPhoneError("Must be a valid 11-digit Bangladeshi number (e.g. 01712345678)");
      return;
    }
    setPhoneError("");
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
          profilePicture: null
        })
      });

      if (res.ok) {
        showToast("Registration Successful!", "🎉 Account created successfully! You can now log in.", "success");
        setAuthMode('login');
      } else {
        const errorText = await res.text();
        showToast("Registration Failed", errorText || "Registration failed!", "error");
      }
    } catch (e) {
      showToast("Connection Error", "Could not connect to the backend server. Make sure Spring Boot is running!", "error");
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: loginRole })
      });

      if (res.ok) {
        const user = await res.json();
        if (user.role !== loginRole) {
          setAuthError('Wrong username or password');
          return;
        }
        setAuthError('');
        setCurrentUser(user);
        setIsLoggedIn(true);
        setActiveTab(user.role === 'ADMIN' ? 'admin' : user.role === 'WORKER' ? 'worker' : 'customer');
      } else {
        setAuthError('Wrong username or password');
      }
    } catch (e) {
      setAuthError('Could not connect to server. Check Spring Boot!');
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
      let userId = 5;
      let userName = "Sajid Hasan";
      let userPic = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150";
      let isVerified = true;

      if (emailStr === 'admin@skillverse.com') {
        userId = 1;
        userName = "System Admin";
        userPic = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
      } else if (emailStr === 'anis@gmail.com') {
        userId = 2;
        userName = "Anisur Rahman";
        userPic = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
      } else if (emailStr === 'kamrul@gmail.com') {
        userId = 3;
        userName = "Kamrul Islam";
        userPic = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150";
      } else if (emailStr === 'rafiq@gmail.com') {
        userId = 4;
        userName = "Mohammad Rafiq";
        userPic = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150";
      } else if (emailStr === 'tariq@gmail.com') {
        userId = 6;
        userName = "Tariqul Islam";
        userPic = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150";
      } else if (emailStr === 'sajid@gmail.com') {
        userId = 5;
        userName = "Sajid Hasan";
        isVerified = false;
        userPic = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150";
      }

      const mockUser = {
        id: userId,
        name: userName,
        email: emailStr,
        role: role,
        profilePicture: userPic,
        verified: isVerified
      };

      setCurrentUser(mockUser);
      setIsLoggedIn(true);
      setActiveTab(role === 'ADMIN' ? 'admin' : role === 'WORKER' ? 'worker' : 'customer');
      if (role === 'WORKER') {
        fetchWorkerProfileAndBookings(mockUser.id);
      }
    }, 100);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setAiEstimate(null);
    localStorage.removeItem('fixconnect_user');
    localStorage.removeItem('fixconnect_active_tab');
    navigate('/');
  };

  // Submit Work Application (Worker side)
  const handleSubmitWorkApplication = async () => {
    if (!nidNumber || !currentUser) {
      alert("Please enter a valid National NID number!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/verification/submit?userId=${currentUser.id}&nidNumber=${encodeURIComponent(nidNumber)}`, {
        method: 'POST'
      });

      if (res.ok) {
        alert("🎉 NID Verification Application & Document photos submitted successfully!\n\nSystem Admin will review and verify your identity in the Admin Command Center.");
        const updated = { ...currentUser, verified: false, nidNumber: nidNumber };
        setCurrentUser(updated);
        localStorage.setItem('fixconnect_user', JSON.stringify(updated));
        fetchAdminData();
      } else {
        await fetch(`${API_BASE}/workers/${currentUser.id}/verify?nid=${nidNumber}`, { method: 'POST' });
        alert("🎉 NID Verification Application submitted for Admin approval!");
        fetchAdminData();
      }
    } catch (e) {
      alert("🎉 NID Verification Application submitted for Admin approval!");
    }
  };

  // Admin approves worker NID verification
  const handleAdminApproveWorker = async (reqId, workerUserId) => {
    try {
      let res;
      if (reqId) {
        res = await fetch(`${API_BASE}/verification/${reqId}/approve`, { method: 'PUT' });
      } else {
        res = await fetch(`${API_BASE}/workers/${workerUserId}/verify?nid=19942618954712365`, { method: 'POST' });
      }
      if (res.ok) {
        alert("🎉 Worker NID Application Approved & Account Badge Verified!");
        fetchAdminData();
        fetchWorkers();
      }
    } catch (e) {
      alert("Verification update failed.");
    }
  };

  // Admin rejects worker NID verification
  const handleAdminRejectWorker = async (reqId) => {
    try {
      if (reqId) {
        const res = await fetch(`${API_BASE}/verification/${reqId}/reject`, { method: 'PUT' });
        if (res.ok) {
          alert("Application rejected.");
          fetchAdminData();
          fetchWorkers();
        }
      }
    } catch (e) {
      alert("Action failed.");
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

  // Customer Management Handlers
  const handleToggleSaveWorker = (workerId) => {
    setSavedWorkerIds(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      } else {
        return [...prev, workerId];
      }
    });
  };

  const handleAddProperty = (newProperty) => {
    setProperties(prev => [newProperty, ...prev]);
  };

  const handleDeleteProperty = (propertyId) => {
    if (!confirm("Are you sure you want to delete this property and its tracked appliances?")) return;
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const handleAddAppliance = (propertyId, newAppliance) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          appliances: [...(p.appliances || []), newAppliance]
        };
      }
      return p;
    }));
  };

  const handleDeleteAppliance = (propertyId, applianceId) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          appliances: (p.appliances || []).filter(a => a.id !== applianceId)
        };
      }
      return p;
    }));
  };

  const handleAddAddress = (newAddress) => {
    if (newAddress.isDefault) {
      setAddresses(prev => [newAddress, ...prev.map(a => ({ ...a, isDefault: false }))]);
    } else {
      setAddresses(prev => [...prev, newAddress]);
    }
  };

  const handleEditAddress = (updatedAddress) => {
    setAddresses(prev => prev.map(a => {
      if (a.id === updatedAddress.id) {
        return updatedAddress;
      }
      if (updatedAddress.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    }));
  };

  const handleDeleteAddress = (addressId) => {
    setAddresses(prev => prev.filter(a => a.id !== addressId));
  };

  const handleSetDefaultAddress = (addressId) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === addressId
    })));
  };

  const handleSubmitReview = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setRewards(prev => ({
      ...prev,
      points: prev.points + 25
    }));
    showToast("Review Published!", "🎉 Thank you! Your review has been published and +25 SkillPoints added to your balance.", "success");
  };

  const handleUpdateProfile = async (updatedProfile) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedProfile
    }));
    // Persist to backend
    if (currentUser?.id) {
      try {
        await fetch(`${API_BASE}/auth/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile)
        });
        // If worker, also sync worker profile
        if (currentUser.role === 'WORKER' && (updatedProfile.skills || updatedProfile.hourlyRate || updatedProfile.basePrice || updatedProfile.latitude)) {
          await fetch(`${API_BASE}/workers/${currentUser.id}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skills: updatedProfile.skills || workerProfile?.skills,
              hourlyRate: updatedProfile.hourlyRate || workerProfile?.hourlyRate,
              basePrice: updatedProfile.basePrice || workerProfile?.basePrice || 300,
              latitude: updatedProfile.latitude,
              longitude: updatedProfile.longitude,
              serviceArea: updatedProfile.address || workerProfile?.serviceArea,
              available: true
            })
          });
          fetchWorkerProfileAndBookings(currentUser.id);
        }
      } catch (e) {
        console.error('Profile update failed', e);
      }
    }
  };

  const handleUpdateWorkerLocation = async (lat, lon, area) => {
    if (currentUser?.id && currentUser.role === 'WORKER') {
      try {
        await fetch(`${API_BASE}/workers/${currentUser.id}/location?lat=${lat}&lon=${lon}&area=${encodeURIComponent(area || '')}`, {
          method: 'PUT'
        });
        setCurrentUser(prev => ({ ...prev, latitude: lat, longitude: lon, address: area }));
        fetchWorkerProfileAndBookings(currentUser.id);
      } catch (e) {
        console.error('Worker location update failed', e);
      }
    }
  };

  const handleOpenBookingModalWithOptions = (options = {}) => {
    if (options.worker) {
      setSelectedWorker(options.worker);
    } else if (workers.length > 0) {
      const matched = workers.find(w => w.user?.verified || w.verified) || workers[0];
      setSelectedWorker(matched);
    }
    if (options.serviceType) {
      // prefill
    }
    if (options.suggestedCost) {
      setBookingCost(options.suggestedCost);
    }
    if (options.description) {
      setBookingDesc(options.description);
    }
    if (options.propertyAddress) {
      setBookingAddress(options.propertyAddress);
    } else {
      const defaultAddr = addresses.find(a => a.isDefault);
      setBookingAddress(defaultAddr ? (defaultAddr.address || defaultAddr.fullAddress || '') : (addresses[0]?.address || addresses[0]?.fullAddress || 'Uttara Sector 12, Dhaka'));
    }
  };

  // Create service order booking
  const handleCreateBooking = async () => {
    if (!selectedWorker) return;
    const finalPrice = offeredPrice ? Number(offeredPrice) : bookingCost;
    const photoToSend = selectedPhotoPreset ? selectedPhotoPreset.url : (customPhotoUrl || "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=300");
    const chosenAddress = bookingAddress || addresses.find(a => a.isDefault)?.address || addresses.find(a => a.isDefault)?.fullAddress || 'Uttara Sector 12, Dhaka';
    const workerBasePrice = selectedWorker.basePrice || 300;
    const workerUserId = selectedWorker.user?.id || selectedWorker.id;
    const workerUserName = selectedWorker.user?.name || selectedWorker.name || 'Technician';
    const workerServiceType = (selectedWorker.skills || '').split(',')[0]?.trim() || 'General Service';

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser?.id,
          workerId: workerUserId,
          serviceType: workerServiceType,
          estimatedCost: finalPrice,
          basePrice: workerBasePrice,
          beforePhoto: photoToSend,
          description: `${bookingDesc || "Standard service request."} [Location: ${chosenAddress}]`
        })
      });
      if (res.ok) {
        const created = await res.json();
        created.address = chosenAddress;
        created.beforePhoto = photoToSend;
        created.basePrice = workerBasePrice;

        // Immediately add to local state
        setBookings(prev => [created, ...prev]);

        setSelectedWorker(null);
        setBookingDesc('');
        setOfferedPrice('');
        setBookingAddress('');
        setSelectedPhotoPreset(null);
        setCustomPhotoUrl('');
        fetchCustomerBookings();
        showToast(
          "Booking Request Dispatched!",
          `🎉 Request sent to ${workerUserName}!\n\nOnce the technician accepts/counters, confirm by paying the minimum base advance (BDT ${workerBasePrice} + 5% VAT). Timer starts immediately upon advance payment!`,
          "success",
          () => setActiveTab('my-bookings')
        );
      }
    } catch (e) {
      // Fallback local creation if backend offline
      const mockBooking = {
        id: Date.now(),
        customer: currentUser,
        worker: selectedWorker.user || selectedWorker,
        serviceType: workerServiceType,
        estimatedCost: finalPrice,
        basePrice: workerBasePrice,
        status: 'PENDING',
        scheduledTime: new Date().toISOString(),
        description: bookingDesc || "Standard maintenance request.",
        address: chosenAddress,
        startVerificationCode: String(Math.floor(1000 + Math.random() * 9000)),
        completionVerificationCode: String(Math.floor(1000 + Math.random() * 9000)),
        liveLocation: "23.8103, 90.4125",
        beforePhoto: photoToSend
      };
      setBookings(prev => [mockBooking, ...prev]);
      setSelectedWorker(null);
      setBookingDesc('');
      setOfferedPrice('');
      setBookingAddress('');
      setSelectedPhotoPreset(null);
      setCustomPhotoUrl('');
      showToast("Booking Dispatched!", `🎉 Booking placed! Once confirmed, pay base advance BDT ${workerBasePrice} (+5% VAT) to activate timer.`, "success", () => setActiveTab('my-bookings'));
    }
  };

  // Send Counter Offer (Worker side)
  const handleSendCounterOffer = async (bookingId) => {
    const counterPrice = counterPrices[bookingId];
    if (!counterPrice || isNaN(counterPrice)) {
      showToast("Invalid Offer", "Please input a valid price offer!", "error");
      return;
    }
    const numericPrice = Number(counterPrice);
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/counter-offer?price=${numericPrice}&offeredBy=WORKER`, {
        method: 'PUT'
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: numericPrice, workerCounterPrice: numericPrice, agreedCost: numericPrice, lastOfferedBy: 'WORKER', status: 'NEGOTIATING' } : b));
        setWorkerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: numericPrice, workerCounterPrice: numericPrice, agreedCost: numericPrice, lastOfferedBy: 'WORKER', status: 'NEGOTIATING' } : b));
        showToast("Counter Offer Sent", `🎉 Counter offer of BDT ${numericPrice} submitted to client.`);
        fetchWorkerProfileAndBookings(currentUser.id);
        fetchCustomerBookings();
      }
    } catch (e) {
      // Local fallback
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: numericPrice, workerCounterPrice: numericPrice, agreedCost: numericPrice, lastOfferedBy: 'WORKER', status: 'NEGOTIATING' } : b));
      setWorkerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: numericPrice, workerCounterPrice: numericPrice, agreedCost: numericPrice, lastOfferedBy: 'WORKER', status: 'NEGOTIATING' } : b));
      showToast("Counter Offer Sent", `🎉 Counter offer of BDT ${numericPrice} submitted to client.`);
    }
  };

  // Accept Counter Offer (Customer side)
  const handleAcceptCounterOffer = async (bookingId, acceptedPrice) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/accept-price?acceptedBy=CUSTOMER`, {
        method: 'PUT'
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: acceptedPrice, agreedCost: acceptedPrice, status: 'AWAITING_ADVANCE' } : b));
        setWorkerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: acceptedPrice, agreedCost: acceptedPrice, status: 'AWAITING_ADVANCE' } : b));
        showToast("Counter Offer Accepted", `🎉 Price of BDT ${acceptedPrice} agreed! Please pay the base advance to confirm dispatch.`);
        fetchCustomerBookings();
      }
    } catch (e) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: acceptedPrice, agreedCost: acceptedPrice, status: 'AWAITING_ADVANCE' } : b));
      setWorkerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, estimatedCost: acceptedPrice, agreedCost: acceptedPrice, status: 'AWAITING_ADVANCE' } : b));
      showToast("Counter Offer Accepted", `🎉 Price of BDT ${acceptedPrice} agreed! Please pay the base advance to confirm dispatch.`);
    }
  };

  // Change order status
  const handleStatusChange = async (bookingId, newStatus, isWorker = false) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        // Sync BOTH state arrays with the full API response (includes OTP codes)
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updatedBooking, status: newStatus, advancePaid: newStatus === 'CONFIRMED' ? true : (updatedBooking.advancePaid ?? b.advancePaid) } : b));
        setWorkerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updatedBooking, status: newStatus, advancePaid: newStatus === 'CONFIRMED' ? true : (updatedBooking.advancePaid ?? b.advancePaid) } : b));
        // Also refetch to get fully hydrated data
        if (isWorker) {
          fetchWorkerProfileAndBookings(currentUser.id);
        }
        fetchCustomerBookings();
      }
    } catch (e) {
      // Local state fallback — sync both arrays
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus, advancePaid: newStatus === 'CONFIRMED' ? true : b.advancePaid } : b));
      setWorkerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus, advancePaid: newStatus === 'CONFIRMED' ? true : b.advancePaid } : b));
    }
  };

  // OTP Verification: Verify Start OTP (worker enters OTP given by customer to start job)
  const verifyStartOtp = (booking, isWorker = false) => {
    const enteredOtp = (otpInputs[`start-${booking.id}`] || '').trim();
    const correctOtp = booking.startVerificationCode || '';
    if (!enteredOtp) {
      setOtpErrors(prev => ({ ...prev, [`start-${booking.id}`]: 'Please enter the Start OTP code.' }));
      return;
    }
    if (enteredOtp !== correctOtp) {
      setOtpErrors(prev => ({ ...prev, [`start-${booking.id}`]: `❌ Wrong OTP! Expected code does not match. Please ask the customer for the correct code.` }));
      return;
    }
    // OTP correct — clear error and proceed
    setOtpErrors(prev => ({ ...prev, [`start-${booking.id}`]: '' }));
    setOtpInputs(prev => ({ ...prev, [`start-${booking.id}`]: '' }));
    handleStatusChange(booking.id, 'IN_PROGRESS', isWorker);
  };

  // OTP Verification: Verify Completion OTP (customer gives completion OTP when satisfied)
  const verifyCompletionOtp = (booking, isWorker = false) => {
    const enteredOtp = (otpInputs[`complete-${booking.id}`] || '').trim();
    const correctOtp = booking.completionVerificationCode || '';
    if (!enteredOtp) {
      setOtpErrors(prev => ({ ...prev, [`complete-${booking.id}`]: 'Please enter the Completion OTP code.' }));
      return;
    }
    if (enteredOtp !== correctOtp) {
      setOtpErrors(prev => ({ ...prev, [`complete-${booking.id}`]: `❌ Wrong OTP! The completion code does not match. Ask the customer for the correct code.` }));
      return;
    }
    // OTP correct — clear error and proceed
    setOtpErrors(prev => ({ ...prev, [`complete-${booking.id}`]: '' }));
    setOtpInputs(prev => ({ ...prev, [`complete-${booking.id}`]: '' }));
    if (isWorker) {
      handleStatusChange(booking.id, 'COMPLETED', true);
    } else {
      startPaymentProcess(booking);
    }
  };

  // Initiate Payment Sheet modal
  const startPaymentProcess = (booking) => {
    setPayingBooking(booking);
    setWalletNumber('');
    setPaymentMethod('bkash');
  };

  // Confirm simulated Payment
  const submitSimulatedPayment = async () => {
    if (!walletNumber && paymentMethod !== 'cash') {
      showToast("Account Details Required", "Please enter your mobile account or card number!", "error");
      return;
    }
    const finalAmount = payingBooking.estimatedCost;
    const paymentChannelName = paymentMethod === 'bkash' ? 'bKash Digital Escrow' : paymentMethod === 'bank' ? 'Card / Bank Gateway' : 'Cash on Service';

    try {
      await fetch(`${API_BASE}/bookings/${payingBooking.id}/status?status=COMPLETED`, {
        method: 'PUT'
      });
    } catch (e) {
      // proceed with local creation
    }

    // Update local booking state
    setBookings(prev => prev.map(b => b.id === payingBooking.id ? { ...b, status: 'COMPLETED' } : b));
    setWorkerBookings(prev => prev.map(b => b.id === payingBooking.id ? { ...b, status: 'COMPLETED' } : b));

    // Auto-create service history record with 30-day warranty
    const newServiceRecord = {
      id: Date.now(),
      jobId: `FC-2026-${payingBooking.id}`,
      serviceName: payingBooking.serviceType,
      technicianName: payingBooking.worker?.name || 'Kamrul Islam',
      category: 'General Maintenance',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      property: payingBooking.address || 'Registered Property',
      problemReported: payingBooking.description || 'On-site technical diagnosis.',
      workPerformed: 'Complete servicing, circuit safety verification, and component testing.',
      partsUsed: [],
      laborCost: finalAmount,
      partsCost: 0,
      platformFee: 0,
      discount: 0,
      total: finalAmount,
      paymentMethod: paymentChannelName,
      status: 'Verified Completed',
      warrantyDaysRemaining: 30,
      warrantyTitle: '30-Day FixConnect Service Guarantee',
      warrantyDescription: 'Free re-inspection and repair if identical issue recurs within 30 days.',
      completionCode: payingBooking.completionVerificationCode || '9143'
    };
    setServiceHistory(prev => [newServiceRecord, ...prev]);

    // Auto-create transaction entry
    const newTx = {
      id: Date.now(),
      txCode: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      bookingId: payingBooking.id,
      serviceName: payingBooking.serviceType,
      technicianName: payingBooking.worker?.name || 'Kamrul Islam',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      method: paymentChannelName,
      amount: finalAmount,
      status: 'COMPLETED'
    };
    setTransactions(prev => [newTx, ...prev]);

    // Award +50 SkillPoints
    setRewards(prev => ({
      ...prev,
      points: prev.points + 50
    }));

    showToast("Payment Complete!", `🎉 Payment of BDT ${finalAmount} verified via ${paymentChannelName}!\n\nService warranty activated & +50 SkillPoints earned.`, "success", () => {
      setPayingBooking(null);
      setActiveTab('my-bookings');
    });
  };

  // Mock enrollment / Mock buy actions
  const triggerMockAction = (itemTitle, category) => {
    showToast("Purchase Confirmed!", `Successfully enrolled/purchased: "${itemTitle}"! Added details to your user vault.`);
  };

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header className="header">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => {
          if (!isLoggedIn) {
            setAuthViewOpen(false);
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          if (currentUser.role === 'CUSTOMER') {
            setActiveTab('customer');
            navigate('/');
          } else if (currentUser.role === 'WORKER') {
            setActiveTab('worker');
            navigate('/worker');
          } else {
            setActiveTab('admin');
            localStorage.setItem('skillverse_admin_active_tab', 'overview');
            navigate('/admin');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <span className={`nav-link ${activeTab === 'my-bookings' ? 'active' : ''}`} onClick={() => setActiveTab('my-bookings')}>
                  My Bookings {bookings.filter(b => ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COUNTERED'].includes(b.status)).length > 0 && <span className="hub-tab-badge-pulse" style={{ marginLeft: 4 }}>{bookings.filter(b => ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COUNTERED'].includes(b.status)).length}</span>}
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
          </div>
        )}

        {!isLoggedIn && !isAdminPath && (
          <div className="landing-nav-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <a href="#features" className="nav-link" onClick={() => setAuthViewOpen(false)}>Features</a>
            <a href="#services" className="nav-link" onClick={() => setAuthViewOpen(false)}>Services</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setAuthViewOpen(false)}>How It Works</a>
            <a href="#academy" className="nav-link" onClick={() => setAuthViewOpen(false)}>Academy</a>
            <a href="#tools" className="nav-link" onClick={() => setAuthViewOpen(false)}>Tool Store</a>
          </div>
        )}

        {!isLoggedIn && isAdminPath && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
            <Key size={16} /> Restricted Admin Portal
          </div>
        )}

        {/* User Details & Logout & Theme Toggle */}
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Quick Theme Switcher */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="theme-toggle-header-btn"
              title={theme === 'light' ? 'Switch to Midnight Dark Theme' : 'Switch to Professional Light Theme'}
              aria-label="Toggle Theme"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={14} color="#6366f1" />
                  <span style={{ fontSize: '0.78rem' }}>Dark</span>
                </>
              ) : (
                <>
                  <Sun size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.78rem' }}>Light</span>
                </>
              )}
            </button>

            <NotificationBell
              notifications={notifications}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onNotificationClick={handleNotificationClick}
            />
            <div style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => setActiveTab('profile')} title="Go to Profile & Settings">
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Role: {currentUser.role}</div>
            </div>
            {currentUser.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt="User avatar"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', cursor: 'pointer' }}
                onClick={() => setActiveTab('profile')}
                title="Go to Profile & Settings"
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}
                onClick={() => setActiveTab('profile')}
                title="Go to Profile & Settings"
              >
                {(currentUser.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Logout" onClick={handleLogout}>
              <LogOut size={16} color="var(--accent-rose)" />
            </button>
          </div>
        ) : isAdminPath ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="theme-toggle-header-btn"
              title={theme === 'light' ? 'Switch to Midnight Dark Theme' : 'Switch to Professional Light Theme'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              {theme === 'light' ? <Moon size={14} color="#6366f1" /> : <Sun size={14} color="#f59e0b" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }} onClick={() => { navigate('/'); setAuthViewOpen(false); }}>
              ← Return to Public Site
            </button>
          </div>
        ) : authViewOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="theme-toggle-header-btn"
              title={theme === 'light' ? 'Switch to Midnight Dark Theme' : 'Switch to Professional Light Theme'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              {theme === 'light' ? <Moon size={14} color="#6366f1" /> : <Sun size={14} color="#f59e0b" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }} onClick={() => setAuthViewOpen(false)}>
              ← Back to Overview
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="theme-toggle-header-btn"
              title={theme === 'light' ? 'Switch to Midnight Dark Theme' : 'Switch to Professional Light Theme'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginRight: '0.4rem'
              }}
            >
              {theme === 'light' ? <Moon size={14} color="#6366f1" /> : <Sun size={14} color="#f59e0b" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              onClick={() => { setAuthMode('login'); setLoginRole('CUSTOMER'); setAuthViewOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
              onClick={() => { setAuthMode('signup'); setLoginRole('CUSTOMER'); setAuthViewOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Get Started
            </button>
          </div>
        )}
      </header>

      {/* --- PUBLIC LANDING PAGE (WHEN NOT LOGGED IN, NOT ADMIN URL, NOT IN AUTH VIEW) --- */}
      {!isLoggedIn && !isAdminPath && !authViewOpen && (
        <LandingPage
          onOpenAuth={(mode = 'login', role = 'CUSTOMER') => {
            setAuthMode(mode);
            setLoginRole(role);
            setAuthViewOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* --- RESTRICTED ADMIN PORTAL LOGIN SCREEN (ONLY AT /admin) --- */}
      {!isLoggedIn && isAdminPath && (
        <div style={{ display: 'flex', minHeight: '85vh', background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.08) 0%, var(--bg-primary) 70%)', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', background: '#0e1526', border: '1px solid rgba(245, 158, 11, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Key size={28} color="#f59e0b" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>
                SkillVerse Command Center
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Single Administrator Access • Master Security Verification
              </p>
            </div>

            <form onSubmit={handleAdminPasswordSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#f8fafc', fontWeight: 600 }}>Admin Master Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    style={{
                      paddingLeft: '2.5rem',
                      borderColor: adminAuthError ? '#ef4444' : 'rgba(245, 158, 11, 0.3)',
                      letterSpacing: '0.2rem',
                      fontSize: '1rem'
                    }}
                    placeholder="••••••••"
                    value={adminPasswordInput}
                    onChange={e => {
                      setAdminPasswordInput(e.target.value);
                      if (adminAuthError) setAdminAuthError('');
                    }}
                    autoFocus
                    required
                  />
                </div>
                {adminAuthError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    ⚠️ {adminAuthError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn"
                style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 'bold', padding: '0.75rem', marginBottom: '1rem', border: 'none', cursor: 'pointer' }}
              >
                Unlock Admin Dashboard <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.2rem', paddingTop: '1.2rem', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', justifyContent: 'center' }}
                onClick={() => { navigate('/'); setAuthViewOpen(false); }}
              >
                ← Return to Public Homepage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PUBLIC AUTHENTICATION SCREEN (CUSTOMER & WORKER ONLY, ADMIN HIDDEN) --- */}
      {!isLoggedIn && !isAdminPath && authViewOpen && (
        <div style={{ display: 'flex', minHeight: '85vh', background: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
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

            {/* Role selector - Strictly Customer and Worker only */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">{authMode === 'signup' ? 'I want to join as' : 'Account Type'}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['CUSTOMER', 'WORKER'].map(role => (
                  <button
                    key={role}
                    type="button"
                    className={`btn ${loginRole === role ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.82rem', justifyContent: 'center' }}
                    onClick={() => { setLoginRole(role); setAuthError(''); }}
                  >
                    {role === 'CUSTOMER' ? '👤 Customer' : '🛠️ Technician / Worker'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Red Error Message (No popup alert) */}
            {authError && (
              <div style={{
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '0.65rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                ⚠️ {authError}
              </div>
            )}

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
                      onChange={e => { setName(e.target.value); setAuthError(''); }}
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
                    onChange={e => { setEmail(e.target.value); setAuthError(''); }}
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
                    style={{
                      borderColor: phoneError ? '#ef4444' : undefined,
                      boxShadow: phoneError ? '0 0 0 1px #ef4444' : undefined
                    }}
                    placeholder="e.g. 01712345678"
                    value={phone}
                    onChange={e => {
                      const val = e.target.value;
                      setPhone(val);
                      if (val && !/^01[3-9]\d{8}$/.test(val.trim())) {
                        setPhoneError("Must be a valid 11-digit Bangladeshi number (e.g. 01712345678)");
                      } else {
                        setPhoneError("");
                      }
                    }}
                    required
                  />
                  {phoneError && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem', borderTop: '2px solid #ef4444', paddingTop: '0.2rem', fontWeight: 'bold' }}>
                      ⚠️ {phoneError}
                    </div>
                  )}
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
                    onChange={e => { setPassword(e.target.value); setAuthError(''); }}
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

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.2rem', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', justifyContent: 'center' }}
                onClick={() => setAuthViewOpen(false)}
              >
                ← Back to Homepage Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOMER FIND SERVICES TAB --- */}
      {isLoggedIn && activeTab === 'customer' && currentUser.role === 'CUSTOMER' && (
        <div>
          {/* Smart AI Diagnostic Assistant Hub */}
          <div className="glass-card" style={{ margin: '1.5rem 2rem', padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} color="var(--primary)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)' }}>
                    Smart AI Diagnostic Assistant
                    <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 'bold' }}>
                      🟢 Online 24/7
                    </span>
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Describe any household breakdown or service question for instant AI troubleshooting, safety advice, and cost guidance.
                  </p>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
                onClick={() => {
                  setChatMessages([{ sender: 'ai', text: 'Salam! I am your SkillVerse AI Diagnostic Assistant 🤖. How can I help you troubleshoot your home maintenance today?' }]);
                }}
              >
                Clear History
              </button>
            </div>

            {/* Quick Diagnostic Suggestion Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.2rem' }}>
                Quick Diagnostics:
              </span>
              {[
                { label: '❄️ AC Warm Air / Leak', query: 'My AC is blowing warm air and leaking water' },
                { label: '⚡ Tripped Circuit Breaker', query: 'Main electrical circuit breaker keeps tripping' },
                { label: '💧 Concealed Pipe Leak', query: 'Concealed bathroom pipe leak and low water pressure' },
                { label: '🔥 Gas Stove / Geyser', query: 'Gas burner not igniting and geyser not heating' },
                { label: '🧹 Tank Wash / Cleaning', query: 'Overhead water tank jet wash and deep sofa cleaning' },
                { label: '💳 How Escrow Works', query: 'How does SkillVerse secure escrow and advance payment work?' },
                { label: '🛡️ 30-Day Guarantee', query: 'What is covered under the 30-Day FixConnect Guarantee?' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={async () => {
                    const userMsg = { sender: 'user', text: chip.query };
                    setChatMessages(prev => [...prev, userMsg]);
                    try {
                      const res = await fetch(`${API_BASE}/ai/chatbot`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: chip.query })
                      });
                      const data = await res.json();
                      setChatMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
                    } catch (e) {
                      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Diagnostic system offline.' }]);
                    }
                  }}
                  style={{
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '20px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem',
              minHeight: '200px',
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              marginBottom: '1rem'
            }}>
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                    color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    padding: '0.75rem 1rem',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    maxWidth: '85%',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            {/* Chat Input Row */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                className="form-input"
                style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', borderRadius: '10px' }}
                placeholder="Ask Smart AI Assistant anything about your repair, maintenance, or pricing..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="btn btn-primary" style={{ padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: 700 }} onClick={handleSendMessage}>
                <span>Send</span> <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Post Your Problem Entry Point */}
          <div style={{ padding: '0 2rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(79, 70, 229, 0.08))', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem 1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.3rem 0', color: 'var(--text-heading)', fontWeight: 'bold' }}>Can't find the right technician?</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Post your maintenance problem publicly with preferred date & budget. Technicians will respond with custom offers!</p>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.7rem 1.2rem', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                  onClick={() => setShowPostedProblemsModal(true)}
                >
                  📋 Your Posted Problems
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.7rem 1.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}
                  onClick={() => setShowPostProblemModal(true)}
                >
                  📢 Post Your Problem Now
                </button>
              </div>
            </div>
          </div>

          {/* Service Booking & Active Service Grid */}
          <div style={{ padding: '0 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={22} color="var(--primary)" />
                Match Verified Technicians
              </h2>

              {/* Customer Location Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="#10b981" />
                  <span>Center: <strong style={{ color: 'var(--text-heading)' }}>{customerLocation.address || 'Uttara, Dhaka'}</strong></span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  onClick={handleDetectCustomerGps}
                  disabled={isCustomerLocating}
                >
                  <Navigation size={12} className={isCustomerLocating ? 'animate-spin' : ''} />
                  {isCustomerLocating ? 'Detecting GPS...' : 'Use My Current Location'}
                </button>
              </div>
            </div>

            {/* Skill Keyword Search */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.95rem' }}
                  placeholder="Search by skill or part keyword (e.g. AC, Plumbing, Electrical, Water Pump, Painting...)"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {CATEGORY_CHIPS.map(cat => (
                <button
                  key={cat}
                  className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px' }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Radius Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={14} color="var(--primary)" /> Search Radius:
              </span>
              {RADIUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`btn ${selectedRadius === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.25rem 0.7rem', fontSize: '0.75rem', borderRadius: '16px' }}
                  onClick={() => setSelectedRadius(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Interactive Technician Map */}
            {(() => {
              const filteredSearchWorkers = workers
                .filter(w => w.user?.verified)
                .filter(w => {
                  // Skill / keyword search filter
                  if (skillSearchQuery.trim()) {
                    const q = skillSearchQuery.toLowerCase();
                    const skillMatch = (w.skills || '').toLowerCase().includes(q);
                    const nameMatch = (w.user?.name || '').toLowerCase().includes(q);
                    const areaMatch = (w.serviceArea || '').toLowerCase().includes(q);
                    if (!skillMatch && !nameMatch && !areaMatch) return false;
                  }
                  // Category chip filter
                  if (selectedCategory !== 'All') {
                    const catLower = selectedCategory.toLowerCase();
                    if (catLower.includes('ac')) {
                      const hasAc = (w.skills || '').toLowerCase().includes('ac') || (w.skills || '').toLowerCase().includes('hvac');
                      if (!hasAc) return false;
                    } else if (catLower.includes('plumb')) {
                      if (!(w.skills || '').toLowerCase().includes('plumb')) return false;
                    } else if (catLower.includes('electr')) {
                      if (!(w.skills || '').toLowerCase().includes('electr')) return false;
                    } else if (catLower.includes('paint')) {
                      if (!(w.skills || '').toLowerCase().includes('paint')) return false;
                    } else {
                      if (!(w.skills || '').toLowerCase().includes(catLower)) return false;
                    }
                  }
                  return true;
                });

              return (
                <>
                  <TechnicianMap
                    customerLocation={customerLocation}
                    workers={filteredSearchWorkers}
                    selectedRadiusKm={selectedRadius}
                    onSelectWorker={(w) => {
                      handleOpenBookingModalWithOptions({
                        worker: w,
                        serviceType: w.skills.split(',')[0],
                        suggestedCost: (w.basePrice || 300) * 2
                      });
                    }}
                  />

                  {/* Filtered Technician Cards */}
                  <div className="dashboard-grid" style={{ padding: 0, marginBottom: '3rem' }}>
                    {filteredSearchWorkers
                      .filter(w => {
                        // Radius filter (Haversine)
                        if (selectedRadius < 900) {
                          const dist = w.distanceKm != null ? w.distanceKm : calculateDistanceKm(customerLocation.lat, customerLocation.lon, w.latitude || 23.8720, w.longitude || 90.3810);
                          if (dist > selectedRadius) return false;
                        }
                        return true;
                      })
                      .map(w => {
                        const isSaved = savedWorkerIds.includes(w.id || w.user?.id);
                        const wLat = w.latitude || w.user?.latitude || 23.8720;
                        const wLon = w.longitude || w.user?.longitude || 90.3810;
                        const distKm = w.distanceKm != null ? w.distanceKm : calculateDistanceKm(customerLocation.lat, customerLocation.lon, wLat, wLon);
                        const distStr = w.distanceString || formatDistanceString(distKm);

                        return (
                          <div key={w.id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => setViewingWorker(w)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{ position: 'relative' }}>
                                <img
                                  src={w.user?.profilePicture || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150'}
                                  alt={w.user?.name}
                                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,0.3)' }}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                  className="technician-card-heart-btn"
                                  title={isSaved ? "Saved in Profile" : "Save Technician to Profile"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSaveWorker(w.id || w.user?.id);
                                  }}
                                >
                                  <Heart size={16} color={isSaved ? "var(--accent-rose)" : "var(--text-muted)"} fill={isSaved ? "var(--accent-rose)" : "transparent"} />
                                </button>
                                <span className="badge badge-verified">Verified Worker</span>
                              </div>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{w.user?.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                              <Award size={14} />
                              <span>Rating: {w.user?.rating || 4.8} ({w.careerLevel || 'Gold'} Rank)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                              <MapPin size={13} />
                              <span style={{ fontWeight: 'bold' }}>{distStr}</span>
                              <span style={{ color: 'var(--text-muted)' }}>• {w.serviceArea}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              <strong>Skills:</strong> {w.skills}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                              <strong>Base Price:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>BDT {w.basePrice || 300}</span> (Fixed Base Amount)
                            </p>
                            <button
                              className="btn btn-primary"
                              style={{ width: '100%', justifyContent: 'center' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBookingModalWithOptions({
                                  worker: w,
                                  serviceType: w.skills.split(',')[0],
                                  suggestedCost: (w.basePrice || 300) * 2
                                });
                              }}
                            >
                              Select & Book Service
                            </button>
                          </div>
                        );
                      })}
                    {filteredSearchWorkers.length === 0 && (
                      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                        <Search size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <div>No technicians found matching "{skillSearchQuery || selectedCategory}" within {selectedRadius < 900 ? (selectedRadius < 1 ? `${selectedRadius * 1000}m` : `${selectedRadius}km`) : 'all areas'}.</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Try expanding your search radius or changing the skill keyword.</div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- WORKER WORKSPACE TAB --- */}
      {isLoggedIn && activeTab === 'worker' && currentUser.role === 'WORKER' && (
        <WorkerDashboard
          currentWorker={currentUser}
          onShowToast={(title, msg, type) => showToast(title, msg, type)}
        />
      )}

      {/* --- ACADEMY & COURSES TAB --- */}
      {isLoggedIn && activeTab === 'courses' && (
        <AcademyCoursesHub
          currentUser={currentUser}
          rewards={rewards}
          onUsePoints={(pts) => setRewards(prev => ({ ...prev, points: Math.max(0, (prev.points || 0) - pts) }))}
          onShowToast={(title, msg, type) => showToast(title, msg, type)}
        />
      )}

      {/* --- TOOLS STORE TAB MODULE --- */}
      {isLoggedIn && activeTab === 'marketplace' && (
        <ToolStoreHub
          currentUser={currentUser}
          rewards={rewards}
          onUsePoints={(pts) => setRewards(prev => ({ ...prev, points: Math.max(0, (prev.points || 0) - pts) }))}
          onShowToast={(title, msg, type) => showToast(title, msg, type)}
          contextualBooking={contextualBookingStore}
          onCloseContextual={() => setContextualBookingStore(null)}
        />
      )}

      {/* --- CUSTOMER STANDALONE MY PROFILE PAGE --- */}
      {isLoggedIn && activeTab === 'profile' && currentUser.role === 'CUSTOMER' && (
        <div style={{ padding: '2rem' }}>
          <CustomerSettings
            user={currentUser}
            workerProfile={workerProfile}
            onUpdateProfile={handleUpdateProfile}
            onUpdateWorkerLocation={handleUpdateWorkerLocation}
            onLogout={handleLogout}
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        </div>
      )}

      {/* --- CUSTOMER MY BOOKINGS & HUB --- */}
      {isLoggedIn && activeTab === 'my-bookings' && currentUser.role === 'CUSTOMER' && (
        <MyBookingsHub
          currentUser={currentUser}
          rewards={rewards}
          onAddPoints={(pts) => setRewards(prev => ({ ...prev, points: (prev.points || 0) + pts }))}
          onShowToast={(title, msg, type) => showToast(title, msg, type)}
          onNavigateToWorkerProfile={(workerId) => {
            const w = workers.find(item => item.user?.id === workerId || item.id === workerId);
            if (w) setViewingWorker(w);
          }}
        />
      )}

      {/* --- WORKER DETAILED PROFILE & ANALYTICS TAB --- */}
      {isLoggedIn && activeTab === 'profile' && currentUser.role === 'WORKER' && (
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

            {/* Right side: SVG Interactive Graphs */}
            <div className="glass-card" style={{ gridColumn: 'span 2' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={22} color="var(--primary)" />
                Weekly Earnings Performance (BDT)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Interactive visualization of financial flow stats.</p>

              <div className="chart-container">
                <svg viewBox="0 0 500 200" style={{ width: '100%', height: 'auto' }}>
                  <line x1="50" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.15)" />
                  <rect x="70" y="80" width="30" height="90" rx="3" className="chart-bar" />
                  <rect x="130" y="50" width="30" height="120" rx="3" className="chart-bar" />
                  <rect x="190" y="110" width="30" height="60" rx="3" className="chart-bar" />
                  <rect x="250" y="40" width="30" height="130" rx="3" className="chart-bar" />
                  <rect x="310" y="90" width="30" height="80" rx="3" className="chart-bar" />
                  <rect x="370" y="20" width="30" height="150" rx="3" className="chart-bar" />
                  <rect x="430" y="60" width="30" height="110" rx="3" className="chart-bar" />
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
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <CustomerSettings
              user={currentUser}
              workerProfile={workerProfile}
              onUpdateProfile={handleUpdateProfile}
              onUpdateWorkerLocation={handleUpdateWorkerLocation}
              onLogout={handleLogout}
              currentTheme={theme}
              onThemeChange={setTheme}
            />
          </div>
        </div>
      )}

      {/* --- SYSTEM ADMIN PROFILE & SECURITY COMMAND CENTER TAB --- */}
      {isLoggedIn && activeTab === 'profile' && currentUser.role === 'ADMIN' && (
        <div style={{ padding: '2rem' }}>
          {/* Admin Profile Header */}
          <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img src={currentUser.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt={currentUser.name} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f59e0b' }} />
              <div>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {currentUser.name}
                  <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>Superadmin</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0' }}>Email: <strong>{currentUser.email}</strong> • Role: <strong>Platform Super Administrator</strong></p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="badge badge-verified">🛡️ System Authority: Active</span>
                  <span className="badge badge-verified">🔐 Level 5 Clearance</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ background: '#f59e0b', color: '#000', fontWeight: 'bold' }} onClick={() => setActiveTab('admin')}>
                <ShieldCheck size={16} /> Open Admin Command Center
              </button>
              <button className="btn btn-secondary" onClick={handleLogout}>
                <LogOut size={16} color="var(--accent-rose)" /> Terminate Admin Session
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* System Privileges Overview */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={20} color="var(--accent-gold)" /> System Scope & Authorization
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span>Database Access:</span>
                  <strong style={{ color: 'var(--primary)' }}>Full H2 Read/Write Scope</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span>Worker Verification:</span>
                  <strong>NID Approval Authority Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span>Catalog Management:</span>
                  <strong>Academy & Marketplace Editor</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Security Gateway:</span>
                  <span className="badge badge-verified">HTTPS API Gateway Active</span>
                </div>
              </div>
            </div>

            {/* Admin Governance Quick Links */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={20} color="var(--primary)" /> Governance Shortcuts
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }} onClick={() => {
                  fetchAdminData();
                  setActiveTab('admin');
                }}>
                  <span>Review Pending NID Queue ({pendingApplications.length})</span>
                  <ArrowRight size={14} />
                </button>
                <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }} onClick={() => {
                  alert("🔒 Security Audit Completed: System Gateway running cleanly with 0 active alerts.");
                }}>
                  <span>Run Platform Security Diagnostic</span>
                  <ShieldCheck size={14} color="var(--primary)" />
                </button>
                <button className="btn btn-secondary" style={{ justifyContent: 'space-between' }} onClick={() => {
                  alert("📜 System Audit Report generated successfully!");
                }}>
                  <span>Export Platform Security Logs</span>
                  <Sparkles size={14} color="var(--accent-gold)" />
                </button>
              </div>
            </div>
          </div>

          {/* Admin Personal Settings & Profile Editor */}
          <div className="glass-card">
            <CustomerSettings
              user={currentUser}
              workerProfile={null}
              onUpdateProfile={handleUpdateProfile}
              onUpdateWorkerLocation={handleUpdateWorkerLocation}
              onLogout={handleLogout}
              currentTheme={theme}
              onThemeChange={setTheme}
            />
          </div>
        </div>
      )}

      {/* --- ADMIN DASHBOARD & CONTROL CENTER --- */}
      {isLoggedIn && activeTab === 'admin' && currentUser.role === 'ADMIN' && (
        <AdminDashboard
          currentUser={currentUser}
          onShowToast={(title, msg, type) => showToast(title, msg, type)}
        />
      )}


      {/* --- FLOATING WORKER DETAILS SCREEN / MODAL --- */}
      {viewingWorker && (() => {
        const avgRating = viewingWorkerReviews.length > 0
          ? (viewingWorkerReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / viewingWorkerReviews.length).toFixed(1)
          : (viewingWorker.user?.rating || 4.9);
        const wBasePrice = viewingWorker.basePrice || 300;

        return (
          <div className="toast-popup-overlay" onClick={(e) => e.target.className.includes('toast-popup-overlay') && setViewingWorker(null)}>
            <div className="worker-details-floating-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={viewingWorker.user?.profilePicture}
                    alt={viewingWorker.user?.name}
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                  />
                  <div>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{viewingWorker.user?.name}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge-verified"><ShieldCheck size={13} /> NID Verified Expert</span>
                      <span className="badge badge-gold"><Award size={13} /> {viewingWorker.careerLevel || 'Master'} Rank</span>
                    </div>
                  </div>
                </div>
                <button className="btn-icon" onClick={() => setViewingWorker(null)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '0.4rem' }}>
                  <XCircle size={22} color="var(--text-muted)" />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Rating:</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Award size={15} /> {avgRating} / 5.0
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Experience:</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{viewingWorker.experienceYears || 7}+ Years</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fixed Base Price:</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>BDT {wBasePrice}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Initial Advance:</span>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>BDT {Math.round(wBasePrice * 1.05)} (Inc. 5% VAT)</div>
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Service Area & Location</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
                  <MapPin size={16} /> <strong>{viewingWorker.serviceArea || viewingWorker.user?.address}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Skills & Specialization</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(viewingWorker.skills || '').split(',').map((skill, sIdx) => (
                    <span key={sIdx} className="badge badge-pending" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Client Feedbacks & Reviews */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Sparkles size={15} /> Authentic Client Reviews & Ratings</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{viewingWorkerReviews.length} Verified Review(s)</span>
                </h4>

                {loadingWorkerReviews ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading reviews...</div>
                ) : viewingWorkerReviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {viewingWorkerReviews.map((rev, rIdx) => (
                      <div key={rIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-gold)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)' }}>{rev.customerName || rev.customer?.name || 'Verified Customer'}</strong>
                          <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 'bold' }}>⭐ {rev.rating || 5}.0</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.3rem 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                          "{rev.comment || rev.reviewComment || 'Great service!'}"
                        </p>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Service: {rev.serviceType || 'Maintenance'} {rev.reviewedAt ? `• ${new Date(rev.reviewedAt).toLocaleDateString()}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '0.75rem' }}>
                    No reviews published yet for this technician. Book now and leave your feedback after service completion!
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setViewingWorker(null)}>Close</button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const w = viewingWorker;
                    setViewingWorker(null);
                    handleOpenBookingModalWithOptions({
                      worker: w,
                      serviceType: w.skills.split(',')[0],
                      suggestedCost: (w.basePrice || 300) * 2
                    });
                  }}
                >
                  Select & Book Service
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- UPGRADED BOOKING CONFIRMATION MODAL --- */}
      {selectedWorker && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
              <img src={selectedWorker.user?.profilePicture || selectedWorker.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={selectedWorker.user?.name || selectedWorker.name || 'Technician'} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>Assign: {selectedWorker.user?.name || selectedWorker.name || 'Technician'}</h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rank Level: <strong>{selectedWorker.careerLevel || 'Standard'}</strong></div>
              </div>
            </div>

            {/* Mandatory Base Price & 5% VAT Breakdown Notice */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span>Worker Base Advance (Minimum Required):</span>
                <strong>BDT {selectedWorker.basePrice || 300}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                <span>SkillVerse Platform VAT (5%):</span>
                <span>+ BDT {(((selectedWorker.basePrice || 300) * 0.05)).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                <span>Total Advance Payable Upon Confirmation:</span>
                <span>BDT {(((selectedWorker.basePrice || 300) * 1.05)).toFixed(2)}</span>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                💡 <em>Note: When the worker accepts/counters, you will pay this advance to confirm. Live dispatch timer (1 hr per 1000m) begins immediately with instant refund protection if delayed!</em>
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Service Category</label>
                <input className="form-input" style={{ fontSize: '0.9rem' }} value={(selectedWorker.skills || '').split(',')[0]?.trim() || 'General Service'} readOnly />
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

            {/* Service Location / Address Selector with GPS & Manual toggle */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Select Service Location</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className={`btn ${locationMode === 'gps' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => {
                      setLocationMode('gps');
                      handleFetchGpsLocation();
                    }}
                  >
                    <Navigation size={12} /> Share GPS Location
                  </button>
                  <button
                    type="button"
                    className={`btn ${locationMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => setLocationMode('manual')}
                  >
                    Write Down Location
                  </button>
                </div>
              </label>

              {locationMode === 'gps' ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <MapPin size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {isGpsLoading ? 'Detecting current GPS coordinates...' : 'GPS Location Captured'}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={bookingAddress || 'GPS Location: 23.8759° N, 90.3795° E (Uttara Sector 12)'}
                    onChange={(e) => setBookingAddress(e.target.value)}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    This exact GPS location will be shared with the technician so they can navigate to your doorstep.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {addresses.length > 0 && (
                    <select
                      className="form-select"
                      value={bookingAddress}
                      onChange={(e) => setBookingAddress(e.target.value)}
                    >
                      <option value="">-- Choose a Saved Address --</option>
                      {addresses.map(a => (
                        <option key={a.id} value={a.address}>
                          {a.label} ({a.type}) - {a.address} {a.isDefault ? '⭐ [Default]' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter house, flat, road, and landmark (e.g. House 14, Road 4, Sector 12, Uttara, Dhaka)"
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    required
                  />
                </div>
              )}
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

            {/* Attach photo section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Attach Problem Photo (Optional)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Worker will see this image</span>
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <label className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.4rem', justifyContent: 'center', cursor: 'pointer' }}>
                    <Camera size={14} /> Upload Local Image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
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
                  </label>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.4rem', justifyContent: 'center', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}
                    onClick={() => {
                      setCustomPhotoUrl("https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600");
                      setSelectedPhotoPreset(null);
                    }}
                  >
                    💡 Use Demo Problem Photo
                  </button>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                    placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                    value={customPhotoUrl?.startsWith('data:') ? '' : (customPhotoUrl || '')}
                    onChange={e => {
                      setCustomPhotoUrl(e.target.value);
                      setSelectedPhotoPreset(null);
                    }}
                  />
                </div>

                {/* Demo preset buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                  {[
                    { label: 'AC Unit', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=600' },
                    { label: 'Electrical', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600' },
                    { label: 'Plumbing', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600' },
                    { label: 'Appliance', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600' }
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      className="badge"
                      style={{
                        background: customPhotoUrl === preset.url ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: customPhotoUrl === preset.url ? '#000000' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        padding: '0.2rem 0.5rem'
                      }}
                      onClick={() => {
                        setCustomPhotoUrl(preset.url);
                        setSelectedPhotoPreset(null);
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Preview Box */}
                {customPhotoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    <img src={customPhotoUrl} alt="Attached Preview" style={{ width: '80px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', display: 'block' }}>✔ Photo Attached</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned worker will see this diagnostic photo</span>
                    </div>
                    <button type="button" className="btn-icon" onClick={() => setCustomPhotoUrl('')} style={{ marginLeft: 'auto' }}>
                      <Trash2 size={15} color="var(--accent-rose)" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => {
                setSelectedWorker(null);
                setOfferedPrice('');
                setBookingAddress('');
                setSelectedApplianceId('');
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
          <div className="modal-content" style={{ maxWidth: '460px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button
                  className={`btn ${paymentMethod === 'bkash' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                  onClick={() => setPaymentMethod('bkash')}
                >
                  bKash / Nagad
                </button>
                <button
                  className={`btn ${paymentMethod === 'bank' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                  onClick={() => setPaymentMethod('bank')}
                >
                  Card / Bank
                </button>
                <button
                  className={`btn ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                  onClick={() => setPaymentMethod('cash')}
                >
                  Cash on Hand
                </button>
              </div>
            </div>

            {paymentMethod !== 'cash' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  {paymentMethod === 'bkash' ? 'bKash / Nagad Mobile Wallet Number' : 'Bank Account / Card Number'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={paymentMethod === 'bkash' ? 'e.g. 01811223344' : 'e.g. 1234-5678-9012'}
                  value={walletNumber}
                  onChange={e => setWalletNumber(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                Hand over <strong>BDT {payingBooking.estimatedCost}</strong> in cash directly to technician <strong>{payingBooking.worker?.name}</strong> upon completion inspection.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setPayingBooking(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitSimulatedPayment}>Confirm & Authorize Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM FLOATING TOAST POPUP DIALOG --- */}
      {toastPopup && (
        <div className="toast-popup-overlay" onClick={() => {
          if (toastPopup.onDone) toastPopup.onDone();
          setToastPopup(null);
        }}>
          <div className="toast-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="toast-popup-icon-wrapper">
              <CheckCircle2 size={36} color="var(--primary)" />
            </div>
            <h3 className="toast-popup-title">{toastPopup.title || "Success"}</h3>
            <p className="toast-popup-message">{toastPopup.message}</p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
              onClick={() => {
                if (toastPopup.onDone) toastPopup.onDone();
                setToastPopup(null);
              }}
            >
              OK / Done
            </button>
          </div>
        </div>
      )}

      {/* Post Problem Modal */}
      <PostProblemModal
        isOpen={showPostProblemModal}
        onClose={() => setShowPostProblemModal(false)}
        currentUser={currentUser}
        onProblemPosted={() => setActiveTab('my-bookings')}
        onShowToast={(title, msg, type) => showToast(title, msg, type)}
      />

      {/* Posted Problems Hub Modal */}
      <PostedProblemsHub
        isOpen={showPostedProblemsModal}
        onClose={() => setShowPostedProblemsModal(false)}
        currentUser={currentUser}
        onAcceptWorkerOffer={(createdBooking) => {
          setActiveTab('my-bookings');
        }}
        onShowToast={(title, msg, type) => showToast(title, msg, type)}
      />

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 SkillVerse Bangladesh. All rights reserved. Course Project Submission.</p>
      </footer>
    </div>
  );
}

export default App;
