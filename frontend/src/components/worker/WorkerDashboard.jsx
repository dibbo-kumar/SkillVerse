import React, { useState, useEffect } from 'react';
import {
  Wrench, CheckCircle2, Clock, DollarSign, ArrowUpRight, TrendingUp,
  AlertCircle, ShieldCheck, MapPin, Phone, User, Play, Sparkles, Navigation,
  KeyRound, RefreshCw, Layers, ArrowDownRight, Wallet, Award, XCircle,
  Eye, CheckCheck, Star, Camera, FileText, Send, Filter, Search, RotateCcw,
  ShieldAlert, FileCheck, Check, UploadCloud, ChevronRight, HelpCircle, AlertTriangle,
  Compass, Plus, Trash2, Tag
} from 'lucide-react';
import WorkerBookingDetailsModal from './WorkerBookingDetailsModal';
import LocationPickerModal from '../common/LocationPickerModal';
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  BANGLADESH_CITIES,
  AVAILABLE_SKILLS_LIST
} from '../../data/bangladeshGeoData';

const API_BASE = "http://localhost:8081/api";

// Helpers for multi-skill parsing and formatting
const parseSkillsString = (skillsStr) => {
  if (!skillsStr || typeof skillsStr !== 'string') return [];
  return skillsStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const match = s.match(/^(.*?)\s*\((\d+)\s*(?:yrs|years|yr)?\)$/i);
      if (match) {
        return { skill: match[1].trim(), years: parseInt(match[2], 10) || 1 };
      }
      return { skill: s, years: 3 };
    });
};

const formatSkillsList = (list) => {
  if (!list || list.length === 0) return '';
  return list.map(item => `${item.skill} (${item.years} yrs)`).join(', ');
};

export default function WorkerDashboard({ currentWorker, onShowToast }) {
  const [activeSubTab, setActiveSubTab] = useState('active-job'); // 'active-job', 'requests', 'problems', 'wallet', 'history', 'verification'
  const [workerBookings, setWorkerBookings] = useState([]);
  const [problemPosts, setProblemPosts] = useState([]);
  const [myProblemOffers, setMyProblemOffers] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top when switching subtabs in WorkerDashboard
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeSubTab]);

  // Selected booking for Details Modal
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Counter offer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');

  // Start OTP state
  const [showStartOtpModal, setShowStartOtpModal] = useState(false);
  const [startOtpInput, setStartOtpInput] = useState('');

  // Completion OTP state
  const [showCompletionOtpModal, setShowCompletionOtpModal] = useState(false);
  const [completionOtpInput, setCompletionOtpInput] = useState('');

  // Problem Offer modal state
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProblemOfferModal, setShowProblemOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [problemCategoryFilter, setProblemCategoryFilter] = useState('ALL');

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bKash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawBankName, setWithdrawBankName] = useState('Dutch-Bangla Bank');
  const [withdrawBranchName, setWithdrawBranchName] = useState('Uttara Branch');
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState(currentWorker?.name || '');

  // Verification State
  const [verifDossier, setVerifDossier] = useState(null);
  const [showVerifModal, setShowVerifModal] = useState(false);
  const [verifStep, setVerifStep] = useState(1); // 1: Personal, 2: Address & Location, 3: Professional, 4: Payout, 5: Review

  // Location Picker State
  const [showLocationPickerModal, setShowLocationPickerModal] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Phone OTP Verification Simulator state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpSimulatedCode, setPhoneOtpSimulatedCode] = useState('');
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);

  // Multi-skill dynamic state for Step 3
  const [skillsItems, setSkillsItems] = useState([
    { skill: 'AC Repair & Servicing', years: 5 },
    { skill: 'Electrical & Wiring', years: 4 },
    { skill: 'Plumbing & Pipe Fitting', years: 3 }
  ]);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState(AVAILABLE_SKILLS_LIST[0]);
  const [selectedSkillYears, setSelectedSkillYears] = useState(3);

  const [verifForm, setVerifForm] = useState({
    fullName: currentWorker?.name || '',
    dateOfBirth: '1995-06-15',
    phone: currentWorker?.phone || '',
    phoneVerified: false,
    nidNumber: currentWorker?.nidNumber || '',
    nidFrontPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    nidBackPhoto: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    profileSelfiePhoto: currentWorker?.profilePicture || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150',
    presentAddress: currentWorker?.address || 'Sector 11, Uttara, Dhaka',
    permanentAddress: 'Vill: Sonapur, PS: Begumganj, Dist: Noakhali',
    division: 'Dhaka',
    district: 'Dhaka',
    cityArea: 'Uttara',
    postalCode: '1230',
    detailedAddress: currentWorker?.address || 'House 14, Road 4, Sector 11, Uttara, Dhaka',
    serviceArea: currentWorker?.serviceArea || currentWorker?.address || 'Sector 11, Uttara, Dhaka',
    latitude: currentWorker?.latitude || 23.8720,
    longitude: currentWorker?.longitude || 90.3810,
    skills: 'AC Repair & Servicing (5 yrs), Electrical & Wiring (4 yrs), Plumbing & Pipe Fitting (3 yrs)',
    experienceYears: 5,
    experienceDescription: 'Certified technician with hands-on experience in inverter split AC servicing, gas charging, and house electrical wiring.',
    previousEmployer: 'Self-Employed / Freelance Technical Contractor',
    experienceCertPhoto: 'https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600',
    trainingCertPhoto: '',
    workProofPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
    payoutMethod: 'bKash',
    payoutAccount: currentWorker?.phone || '01911223344',
    payoutAccountHolder: currentWorker?.name || 'Kamrul Islam',
    payoutBankName: '',
    payoutBankBranch: ''
  });

  const workerId = currentWorker?.id || 3;

  useEffect(() => {
    fetchWorkerData();
    const interval = setInterval(() => {
      fetchWorkerData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [workerId]);

  useEffect(() => {
    if (currentWorker) {
      setVerifForm(prev => ({
        ...prev,
        fullName: currentWorker.name || prev.fullName,
        phone: currentWorker.phone || prev.phone,
        nidNumber: currentWorker.nidNumber || prev.nidNumber,
        profileSelfiePhoto: currentWorker.profilePicture || prev.profileSelfiePhoto,
        presentAddress: currentWorker.address || prev.presentAddress,
        detailedAddress: currentWorker.address || prev.detailedAddress,
        serviceArea: currentWorker.serviceArea || currentWorker.address || prev.serviceArea,
        latitude: currentWorker.latitude || prev.latitude,
        longitude: currentWorker.longitude || prev.longitude
      }));
    }
  }, [currentWorker]);

  const fetchWorkerData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      // 1. Fetch Worker Bookings
      const resB = await fetch(`${API_BASE}/bookings/worker/${workerId}`);
      if (resB.ok) {
        const dataB = await resB.json();
        setWorkerBookings(dataB);
      }

      // 2. Fetch Open Problem Posts
      const resP = await fetch(`${API_BASE}/problems`);
      if (resP.ok) {
        const dataP = await resP.json();
        setProblemPosts(dataP);
      }

      // 3. Fetch My Submitted Problem Offers
      const resO = await fetch(`${API_BASE}/problems/offers/worker/${workerId}`);
      if (resO.ok) {
        const dataO = await resO.json();
        setMyProblemOffers(dataO);
      }

      // 4. Fetch Worker Wallet & Ledger
      const resW = await fetch(`${API_BASE}/wallet/worker/${workerId}`);
      if (resW.ok) {
        const dataW = await resW.json();
        setWallet(dataW);
      }

      const resT = await fetch(`${API_BASE}/wallet/transactions/worker/${workerId}`);
      if (resT.ok) {
        const dataT = await resT.json();
        setWalletTransactions(dataT);
      }

      // 5. Fetch Worker Verification Dossier
      const resV = await fetch(`${API_BASE}/verification/worker/${workerId}`);
      if (resV.ok && resV.status !== 204) {
        const dataV = await resV.json();
        setVerifDossier(dataV);
        if (dataV) {
          if (dataV.skills) {
            const parsed = parseSkillsString(dataV.skills);
            if (parsed.length > 0) {
              setSkillsItems(parsed);
            }
          }
          setVerifForm(prev => ({
            ...prev,
            fullName: dataV.fullName || prev.fullName,
            dateOfBirth: dataV.dateOfBirth || prev.dateOfBirth,
            phone: dataV.phone || prev.phone,
            phoneVerified: dataV.phoneVerified ?? prev.phoneVerified,
            nidNumber: dataV.nidNumber || prev.nidNumber,
            nidFrontPhoto: dataV.nidFrontPhoto || prev.nidFrontPhoto,
            nidBackPhoto: dataV.nidBackPhoto || prev.nidBackPhoto,
            profileSelfiePhoto: dataV.profileSelfiePhoto || prev.profileSelfiePhoto,
            presentAddress: dataV.presentAddress || prev.presentAddress,
            permanentAddress: dataV.permanentAddress || prev.permanentAddress,
            division: dataV.division || prev.division,
            district: dataV.district || prev.district,
            cityArea: dataV.cityArea || prev.cityArea,
            postalCode: dataV.postalCode || prev.postalCode,
            detailedAddress: dataV.detailedAddress || prev.detailedAddress,
            skills: dataV.skills || prev.skills,
            experienceYears: dataV.experienceYears || prev.experienceYears,
            experienceDescription: dataV.experienceDescription || prev.experienceDescription,
            previousEmployer: dataV.previousEmployer || prev.previousEmployer,
            experienceCertPhoto: dataV.experienceCertPhoto || prev.experienceCertPhoto,
            trainingCertPhoto: dataV.trainingCertPhoto || prev.trainingCertPhoto,
            workProofPhoto: dataV.workProofPhoto || prev.workProofPhoto,
            payoutMethod: dataV.payoutMethod || prev.payoutMethod,
            payoutAccount: dataV.payoutAccount || prev.payoutAccount,
            payoutAccountHolder: dataV.payoutAccountHolder || prev.payoutAccountHolder,
            payoutBankName: dataV.payoutBankName || prev.payoutBankName,
            payoutBankBranch: dataV.payoutBankBranch || prev.payoutBankBranch
          }));
          if (dataV.phoneVerified) setPhoneOtpVerified(true);
        }
      }
    } catch (err) {
      console.error("Error loading worker dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const isWorkerApproved = currentWorker?.isVerified === true || currentWorker?.status === 'ACTIVE' || (verifDossier && verifDossier.status === 'APPROVED');
  const currentVerifStatus = verifDossier ? verifDossier.status : (currentWorker?.status || (currentWorker?.isVerified ? 'APPROVED' : 'UNVERIFIED'));

  const activeJob = workerBookings.find(b =>
    ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status) &&
    b.status !== 'COMPLETED' && b.status !== 'PAID' && b.status !== 'CANCELLED'
  );
  const hasActiveJob = !!activeJob;

  const activeWarrantyBookings = workerBookings.filter(b =>
    b.warrantyStatus === 'WARRANTY_CLAIMED' || b.warrantyStatus === 'WARRANTY_ACCEPTED'
  );
  const hasActiveWarrantyClaim = activeWarrantyBookings.length > 0;

  const handleAcceptWarranty = async (bId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/accept-warranty`, { method: 'PUT' });
      if (res.ok) {
        fetchWorkerData();
        if (onShowToast) onShowToast(
          "Warranty Claim Accepted!",
          "You have accepted this free warranty request. Please visit the customer's location to perform the repair. Customer will mark Done upon completion.",
          "success"
        );
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error || "Failed to accept warranty claim.", "error");
      }
    } catch (e) {
      console.error(e);
      if (onShowToast) onShowToast("Error", "Network error accepting warranty claim.", "error");
    }
  };

  useEffect(() => {
    if (hasActiveJob && activeSubTab === 'requests') {
      setActiveSubTab('active-job');
    }
  }, [hasActiveJob]);

  const handleOpenDetails = (b) => {
    setDetailsBooking(b);
    setShowDetailsModal(true);
  };

  // --- PHONE OTP SIMULATOR HANDLERS ---
  const handleSendPhoneOtp = async () => {
    if (!verifForm.phone) {
      if (onShowToast) onShowToast("Phone Required", "Please enter a valid phone number first.", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/verification/send-phone-otp?phone=${encodeURIComponent(verifForm.phone)}`, { method: 'POST' });
      let simCode = '1234';
      if (res.ok) {
        const data = await res.json();
        simCode = data.simulatedOtp || '1234';
      }
      setPhoneOtpSent(true);
      setPhoneOtpSimulatedCode(simCode);
      setPhoneOtpInput(simCode);
      // Auto-verify OTP immediately for demo / university project
      setPhoneOtpVerified(true);
      setVerifForm(prev => ({ ...prev, phoneVerified: true }));
      if (onShowToast) onShowToast("Phone Auto-Verified", `SMS OTP (${simCode}) automatically verified for demonstration.`, "success");
    } catch (e) {
      console.error(e);
      setPhoneOtpSent(true);
      setPhoneOtpSimulatedCode('1234');
      setPhoneOtpInput('1234');
      setPhoneOtpVerified(true);
      setVerifForm(prev => ({ ...prev, phoneVerified: true }));
      if (onShowToast) onShowToast("Phone Auto-Verified", "SMS OTP (1234) automatically verified.", "success");
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setPhoneOtpVerified(true);
    setVerifForm(prev => ({ ...prev, phoneVerified: true }));
    if (onShowToast) onShowToast("Phone Verified", "Your phone number is successfully OTP verified.", "success");
  };

  const handleLocalPhotoUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setVerifForm(prev => ({ ...prev, [field]: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // --- MULTI-SKILL HANDLERS ---
  const handleAddSkill = () => {
    if (!selectedSkillCategory) return;
    const exists = skillsItems.some(item => item.skill.toLowerCase() === selectedSkillCategory.toLowerCase());
    if (exists) {
      if (onShowToast) onShowToast("Skill Already Added", `${selectedSkillCategory} is already listed in your dossier skills.`, "warning");
      return;
    }
    const updated = [...skillsItems, { skill: selectedSkillCategory, years: Number(selectedSkillYears) || 1 }];
    setSkillsItems(updated);
    const formattedStr = formatSkillsList(updated);
    const maxExp = Math.max(...updated.map(i => i.years), 1);
    setVerifForm(prev => ({
      ...prev,
      skills: formattedStr,
      experienceYears: maxExp
    }));
    if (onShowToast) onShowToast("Skill Added", `Added ${selectedSkillCategory} (${selectedSkillYears} yrs experience).`, "success");
  };

  const handleRemoveSkill = (indexToRemove) => {
    const updated = skillsItems.filter((_, idx) => idx !== indexToRemove);
    setSkillsItems(updated);
    const formattedStr = formatSkillsList(updated);
    const maxExp = updated.length > 0 ? Math.max(...updated.map(i => i.years), 1) : 0;
    setVerifForm(prev => ({
      ...prev,
      skills: formattedStr,
      experienceYears: maxExp
    }));
  };

  const handleUseCurrentLocationForVerif = () => {
    if (!("geolocation" in navigator)) {
      if (onShowToast) onShowToast("Not Supported", "Geolocation is not supported by your browser.", "error");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingGps(false);
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lon = Number(pos.coords.longitude.toFixed(5));
        setVerifForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
        let resolvedArea = '';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            resolvedArea = [addr.suburb || addr.neighbourhood || addr.residential || addr.road, addr.city || 'Dhaka'].filter(Boolean).join(', ');
            if (resolvedArea) {
              setVerifForm(prev => ({ ...prev, serviceArea: resolvedArea }));
            }
          }
        } catch (e) {
          console.warn("Geocode error", e);
        }
        if (workerId) {
          handleQuickUpdateLocation({ lat, lon, address: resolvedArea || verifForm.serviceArea });
        }
        if (onShowToast) onShowToast("GPS Location Captured!", `Service base set to ${resolvedArea || 'Current Spot'} (${lat}, ${lon}).`, "success");
      },
      (err) => {
        setIsDetectingGps(false);
        if (onShowToast) onShowToast("GPS Warning", "Could not read GPS. You can choose your location on the map.", "warning");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmLocationPicker = (loc) => {
    setVerifForm(prev => ({
      ...prev,
      latitude: loc.lat,
      longitude: loc.lon,
      serviceArea: loc.address || prev.serviceArea
    }));
    if (onShowToast) onShowToast("Service Location Updated!", `Set to ${loc.address || 'Selected Map Point'} (${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}).`, "success");
  };

  const handleQuickUpdateLocation = async (loc) => {
    try {
      const res = await fetch(`${API_BASE}/workers/${workerId}/location?lat=${loc.lat}&lon=${loc.lon}&area=${encodeURIComponent(loc.address || '')}`, {
        method: 'PUT'
      });
      if (res.ok) {
        if (onShowToast) onShowToast("Service Base Updated!", `New coordinates saved to database: (${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}).`, "success");
        fetchWorkerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitVerification = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        userId: workerId,
        ...verifForm,
        phoneVerified: phoneOtpVerified || verifForm.phoneVerified
      };
      const res = await fetch(`${API_BASE}/verification/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setVerifDossier(data);
        setShowVerifModal(false);
        fetchWorkerData();
        if (onShowToast) onShowToast("Verification Dossier Submitted", "Your ID, Address, and Skill profile has been submitted for SkillVerse Admin approval.", "success");
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Submission Failed", err.error || "Could not submit verification dossier.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- ACTIONS ---

  const handleAcceptBooking = async (bId) => {
    if (!isWorkerApproved) {
      if (onShowToast) onShowToast("Verification Required", "Your account is pending admin verification. You cannot accept customer bookings until approved.", "warning");
      setShowVerifModal(true);
      return;
    }
    if (hasActiveWarrantyClaim) {
      if (onShowToast) onShowToast("Warranty Required", "Cannot accept new work. You have an active warranty claim that must be resolved first.", "error");
      setActiveSubTab('history');
      return;
    }
    if (hasActiveJob) {
      if (onShowToast) onShowToast("Worker Busy", "You already have an active job in progress. Complete your current active job before accepting new bookings.", "error");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/accept-price?acceptedBy=WORKER`, { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        fetchWorkerData();
        if (onShowToast) onShowToast("Booking Accepted!", `Price agreed! Awaiting customer base advance payment (BDT ${data.basePrice || 300} + 5% VAT) to activate dispatch.`, "success");
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Cannot Accept", err.error || "You already have an active job in progress or need verification.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCounterOffer = async (e) => {
    e.preventDefault();
    if (!isWorkerApproved) {
      if (onShowToast) onShowToast("Verification Required", "You must be an approved technician to propose price counter-offers.", "warning");
      return;
    }
    if (hasActiveWarrantyClaim) {
      if (onShowToast) onShowToast("Warranty Required", "Cannot propose price counters. You have an active warranty claim that must be resolved first.", "error");
      setActiveSubTab('history');
      return;
    }
    if (!selectedBooking || !counterPrice) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${selectedBooking.id}/counter-offer?price=${counterPrice}&offeredBy=WORKER`, { method: 'PUT' });
      if (res.ok) {
        setShowCounterModal(false);
        setCounterPrice('');
        fetchWorkerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineBooking = async (bId) => {
    try {
      let res = await fetch(`${API_BASE}/bookings/${bId}/cancel?reason=WorkerDeclined`, { method: 'PUT' });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/bookings/${bId}/status?status=CANCELLED`, { method: 'PUT' });
      }
      if (res.ok) {
        if (onShowToast) onShowToast("Request Cancelled", "Service request removed.", "info");
        fetchWorkerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetOnTheWay = async (bId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/on-the-way`, { method: 'PUT' });
      if (res.ok) {
        fetchWorkerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error, "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetArrived = async (bId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/arrived`, { method: 'PUT' });
      if (res.ok) {
        fetchWorkerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error, "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyStartOtp = async (e) => {
    e.preventDefault();
    const targetBooking = selectedBooking || activeJob;
    if (!targetBooking || !startOtpInput) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${targetBooking.id}/verify-start-otp?otp=${startOtpInput}`, { method: 'PUT' });
      if (res.ok) {
        setStartOtpInput('');
        setShowStartOtpModal(false);
        fetchWorkerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Invalid OTP", err.error || "Incorrect Start OTP code. Please check with customer.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestCompletion = async (bId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/request-completion`, { method: 'PUT' });
      if (res.ok) {
        fetchWorkerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error, "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyCompletionOtp = async (e) => {
    e.preventDefault();
    const targetBooking = selectedBooking || activeJob;
    if (!targetBooking || !completionOtpInput) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${targetBooking.id}/verify-completion-otp?otp=${completionOtpInput}`, { method: 'PUT' });
      if (res.ok) {
        setCompletionOtpInput('');
        setShowCompletionOtpModal(false);
        fetchWorkerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Invalid OTP", err.error || "Incorrect Completion OTP code.", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadPhotos = async (bId, photos) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/upload-photos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photos)
      });
      if (res.ok) {
        fetchWorkerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitProblemOffer = async (e) => {
    e.preventDefault();
    if (!isWorkerApproved) {
      if (onShowToast) onShowToast("Verification Required", "Your account is not approved yet. Complete ID verification to quote on problem posts.", "warning");
      setShowVerifModal(true);
      return;
    }
    if (hasActiveWarrantyClaim) {
      if (onShowToast) onShowToast("Warranty Required", "Cannot quote on problem posts. You have an active warranty claim that must be resolved first.", "error");
      setActiveSubTab('history');
      return;
    }
    if (hasActiveJob) {
      if (onShowToast) onShowToast("Worker Busy", "You already have an active job in progress (#BK-" + activeJob?.id + "). Complete or finalize the current job before quoting on new problems.", "error");
      return;
    }
    if (!selectedProblem || !offerPrice) return;
    try {
      const res = await fetch(`${API_BASE}/problems/${selectedProblem.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerId,
          proposedPrice: parseFloat(offerPrice),
          message: offerMessage || "Ready to inspect and provide guaranteed service.",
          estimatedArrival: "Same day / Within 2 hours"
        })
      });

      if (res.ok) {
        if (onShowToast) onShowToast("Quote Submitted", "Your price quote was sent to the customer for review.", "success");
        setShowProblemOfferModal(false);
        setOfferPrice('');
        setOfferMessage('');
        fetchWorkerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    const availableBal = wallet?.balance != null ? Math.max(0, wallet.balance) : 0;

    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      if (onShowToast) onShowToast("Invalid Amount", "Please enter a valid cashout amount greater than ৳0.", "error");
      return;
    }

    if (amountNum > availableBal) {
      if (onShowToast) onShowToast("Insufficient Balance", `Cannot cashout ৳${amountNum}. Available wallet balance is only ৳${availableBal}.`, "error");
      return;
    }

    if (withdrawMethod === 'Bank' && (!withdrawBankName || !withdrawAccount || !withdrawAccountHolder)) {
      if (onShowToast) onShowToast("Bank Details Required", "Please provide Bank Name, Account Number, and Account Holder Name.", "error");
      return;
    }

    if (['bKash', 'Rocket', 'Nagad'].includes(withdrawMethod) && !withdrawAccount) {
      if (onShowToast) onShowToast("Mobile Number Required", `Please enter your valid ${withdrawMethod} mobile number.`, "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerId,
          amount: amountNum,
          method: withdrawMethod,
          accountNo: withdrawAccount,
          bankName: withdrawBankName,
          branchName: withdrawBranchName,
          accountHolder: withdrawAccountHolder
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedBal = data.wallet?.balance != null ? Math.max(0, data.wallet.balance) : Math.max(0, availableBal - amountNum);
        if (onShowToast) onShowToast("Cashout Successful!", `৳${amountNum} successfully withdrawn via ${withdrawMethod}. Remaining balance: ৳${updatedBal}.`, "success");
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawAccount('');
        fetchWorkerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Cashout Failed", err.error || "Insufficient funds", "error");
      }
    } catch (e) {
      console.error(e);
      if (onShowToast) onShowToast("Network Error", "Unable to complete cashout. Please try again.", "error");
    }
  };

  const pendingRequests = workerBookings.filter(b => 
    !b.advancePaid &&
    !['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED', 'COMPLETED', 'PAID', 'CANCELLED'].includes(b.status) &&
    ['PENDING', 'NEGOTIATING', 'AWAITING_ADVANCE', 'ACCEPTED', 'COUNTERED'].includes(b.status)
  );
  const completedBookings = workerBookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID');
  const completedReviews = workerBookings.filter(b => b.reviewRating != null);
  const dynamicRating = completedReviews.length > 0
    ? (completedReviews.reduce((sum, b) => sum + b.reviewRating, 0) / completedReviews.length).toFixed(1)
    : (currentWorker?.rating ? Number(currentWorker.rating).toFixed(1) : "5.0");

  const filteredProblems = problemPosts.filter(p => {
    if (problemCategoryFilter === 'ALL') return true;
    return p.serviceCategory?.toLowerCase().includes(problemCategoryFilter.toLowerCase());
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      
      {/* --- DASHBOARD HEADER & AVAILABILITY STATUS --- */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={currentWorker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150"}
              alt={currentWorker?.name || "Worker"}
              style={{ width: 62, height: 62, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--primary)' }}
            />
            <span
              style={{
                position: 'absolute', bottom: 2, right: 2, width: 14, height: 14,
                borderRadius: '50%',
                background: !isWorkerApproved ? '#f59e0b' : hasActiveJob ? '#ef4444' : '#10b981',
                border: '2px solid var(--bg-primary)'
              }}
              title={!isWorkerApproved ? 'Account Under Verification' : hasActiveJob ? 'Busy on Active Job' : 'Available for Work'}
            />
          </div>

          <div>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-heading)', margin: 0 }}>{currentWorker?.name || 'Technician'}</h2>
              
              {isWorkerApproved ? (
                <span className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} /> Verified Technician
                </span>
              ) : currentVerifStatus === 'UNDER_REVIEW' || currentVerifStatus === 'PENDING' ? (
                <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} /> Verification Under Review
                </span>
              ) : currentVerifStatus === 'CORRECTION_REQUIRED' ? (
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={14} /> Correction Required
                </span>
              ) : currentVerifStatus === 'REJECTED' ? (
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  Verification Rejected
                </span>
              ) : (
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  Unverified Profile
                </span>
              )}
              
              {isWorkerApproved && (
                hasActiveJob ? (
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    🔴 Busy on Job #BK-{activeJob.id}
                  </span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    🟢 Available for New Jobs
                  </span>
                )
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Specialization: <strong style={{ color: 'var(--text-heading)' }}>{verifForm.skills || 'AC Repair, Electrical, Plumbing'}</strong> • <strong>{verifForm.experienceYears || 3}+ Yrs Exp</strong>
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLocationPickerModal(true)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.65rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#34d399'
                }}
                title="Update your service base location coordinates"
              >
                <MapPin size={12} />
                <span>Base: <strong>{verifForm.serviceArea || 'Dhaka'}</strong></span>
                <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>(Change)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Rating</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>⭐ {dynamicRating}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Wallet Balance</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>৳{wallet?.balance || 0}</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Pending Requests</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>{pendingRequests.length}</strong>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem' }} onClick={fetchWorkerData}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* --- TOP VERIFICATION BANNER --- */}
      {!isWorkerApproved && (
        <div
          style={{
            background: currentVerifStatus === 'CORRECTION_REQUIRED'
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.05))'
              : currentVerifStatus === 'REJECTED'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(185, 28, 28, 0.05))'
              : currentVerifStatus === 'UNDER_REVIEW' || currentVerifStatus === 'PENDING'
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(14, 165, 233, 0.05))'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.08))',
            border: currentVerifStatus === 'CORRECTION_REQUIRED'
              ? '1px solid rgba(245, 158, 11, 0.4)'
              : currentVerifStatus === 'REJECTED'
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : currentVerifStatus === 'UNDER_REVIEW' || currentVerifStatus === 'PENDING'
              ? '1px solid rgba(56, 189, 248, 0.4)'
              : '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            padding: '1.3rem 1.6rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '750px' }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: currentVerifStatus === 'CORRECTION_REQUIRED' ? 'rgba(245, 158, 11, 0.2)' : currentVerifStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                color: currentVerifStatus === 'CORRECTION_REQUIRED' ? '#f59e0b' : currentVerifStatus === 'REJECTED' ? '#ef4444' : '#38bdf8'
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>
                {currentVerifStatus === 'CORRECTION_REQUIRED' && '⚠️ Admin Requested Changes on your Verification'}
                {currentVerifStatus === 'REJECTED' && '❌ Verification Application Rejected'}
                {(currentVerifStatus === 'UNDER_REVIEW' || currentVerifStatus === 'PENDING') && '⏳ Worker Verification Dossier Under Review'}
                {(currentVerifStatus === 'UNVERIFIED' || !verifDossier) && '🛡️ Worker Home-Entry Safety Verification Required'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', lineHeight: 1.4 }}>
                {currentVerifStatus === 'CORRECTION_REQUIRED' && (
                  <span>Admin remarks: <strong style={{ color: '#f59e0b' }}>"{verifDossier?.adminRemarks || 'Please re-upload a clearer NID front photo.'}"</strong>. Please update and resubmit.</span>
                )}
                {currentVerifStatus === 'REJECTED' && (
                  <span>Reason: <strong style={{ color: '#ef4444' }}>"{verifDossier?.adminRemarks || 'Document authenticity could not be verified.'}"</strong>. Please contact support or submit updated documents.</span>
                )}
                {(currentVerifStatus === 'UNDER_REVIEW' || currentVerifStatus === 'PENDING') && (
                  <span>Your 4-step dossier (Identity, Present & Permanent Address, Skills, and Payout) is being reviewed by SkillVerse Admin. You will receive an instant unlock once approved.</span>
                )}
                {(currentVerifStatus === 'UNVERIFIED' || !verifDossier) && (
                  <span>Because technicians enter customers' homes, complete our 4-step identity, address, and skills verification before you can receive or accept job bookings.</span>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              style={{
                background: currentVerifStatus === 'CORRECTION_REQUIRED'
                  ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                  : 'linear-gradient(90deg, #10b981, #059669)',
                padding: '0.65rem 1.2rem',
                fontSize: '0.85rem'
              }}
              onClick={() => setShowVerifModal(true)}
            >
              {currentVerifStatus === 'CORRECTION_REQUIRED' ? '✏️ Edit & Resubmit Dossier' : currentVerifStatus === 'UNDER_REVIEW' ? '👁️ View Submitted Dossier' : '🚀 Complete Verification Profile'}
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setActiveSubTab('verification')}
            >
              Checkpoints
            </button>
          </div>
        </div>
      )}

      {/* --- URGENT WARRANTY RESTRICTION BANNER --- */}
      {hasActiveWarrantyClaim && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(245, 158, 11, 0.18))',
          border: '1.5px solid #ef4444',
          borderRadius: '16px',
          padding: '1.2rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 30px rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div style={{ background: '#ef4444', borderRadius: '50%', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)' }}>
              <ShieldAlert size={26} color="#fff" />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#fca5a5', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🚨 Warranty Action Required ({activeWarrantyBookings.length} Active Claim)
              </h4>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                A customer reported a recurring issue under 30-day warranty. You are restricted from accepting new jobs until this free warranty service is finished.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ background: '#ef4444', color: '#fff', border: 'none', fontWeight: 'bold', padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('history')}
          >
            Go to Warranty Claims ({activeWarrantyBookings.length}) →
          </button>
        </div>
      )}

      {/* --- SUBTABS NAVIGATION --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.45rem',
        background: 'rgba(0,0,0,0.3)',
        padding: '0.45rem',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        width: '100%'
      }}>
        <button
          onClick={() => setActiveSubTab('active-job')}
          className={`btn ${activeSubTab === 'active-job' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', minHeight: '40px' }}
        >
          ⚡ Active Job {hasActiveJob ? '🔴' : ''}
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`btn ${activeSubTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', minHeight: '40px' }}
        >
          📥 Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('problems')}
          className={`btn ${activeSubTab === 'problems' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', minHeight: '40px' }}
        >
          📢 Problems ({problemPosts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('wallet')}
          className={`btn ${activeSubTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', minHeight: '40px' }}
        >
          💰 Wallet & Cash
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`btn ${activeSubTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', minHeight: '40px', position: 'relative' }}
        >
          📜 History ({completedBookings.length}) {hasActiveWarrantyClaim && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '10px', marginLeft: '4px', fontWeight: 'bold' }}>⚠️ Claim</span>}
        </button>
        <button
          onClick={() => setActiveSubTab('verification')}
          className={`btn ${activeSubTab === 'verification' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', justifyContent: 'center', textAlign: 'center', whiteSpace: 'normal', minHeight: '40px', border: !isWorkerApproved ? '1px solid rgba(245, 158, 11, 0.4)' : undefined }}
        >
          🛡️ Verification {!isWorkerApproved ? '⚠️' : '✔'}
        </button>
      </div>

      {/* ============================================================ */}
      {/* --- SUBTAB 1: ACTIVE JOB CONTROLLER (HERO STEPPER) --- */}
      {/* ============================================================ */}
      {activeSubTab === 'active-job' && (
        <div>
          {activeJob ? (
            <div className="glass-card" style={{ border: '1px solid rgba(59, 130, 246, 0.4)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span className="badge badge-verified">ACTIVE JOB IN PROGRESS</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#BK-{activeJob.id}</span>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--text-heading)', margin: '0.4rem 0 0.2rem 0' }}>{activeJob.serviceType}</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Source: <strong>{activeJob.bookingSource || 'DIRECT'}</strong> • Address: <strong>{activeJob.address}</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.08)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Final Agreed Price</span>
                  <strong style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>৳{activeJob.agreedCost || activeJob.estimatedCost}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginTop: '0.2rem' }}>
                    Net Earning (95%): ৳{activeJob.workerNetEarning || (activeJob.agreedCost ? Math.round(activeJob.agreedCost * 0.95) : 0)}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Visualizer */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
                  {[
                    { key: 'CONFIRMED', label: '1. Confirmed', icon: CheckCircle2, done: true },
                    { key: 'ON_THE_WAY', label: '2. On The Way', icon: Navigation, done: ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'PAID'].includes(activeJob.status) },
                    { key: 'ARRIVED', label: '3. Arrived', icon: MapPin, done: ['ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'PAID'].includes(activeJob.status) },
                    { key: 'IN_PROGRESS', label: '4. Work In Progress', icon: Wrench, done: ['IN_PROGRESS', 'COMPLETED', 'PAID'].includes(activeJob.status) },
                    { key: 'COMPLETED', label: '5. Payment Settled', icon: DollarSign, done: ['COMPLETED', 'PAID'].includes(activeJob.status) }
                  ].map((st, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: st.done ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                          color: st.done ? '#000000' : 'var(--text-muted)',
                          fontWeight: 'bold'
                        }}
                      >
                        <st.icon size={16} />
                      </div>
                      <span style={{ color: st.done ? '#ffffff' : 'var(--text-muted)', fontWeight: activeJob.status === st.key ? 'bold' : 'normal' }}>
                        {st.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Location Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>CUSTOMER CONTACT</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-heading)', display: 'block' }}>{activeJob.customer?.name}</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Phone: <strong style={{ color: 'var(--text-heading)' }}>{activeJob.customer?.phone || '01811223344'}</strong>
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>SERVICE ADDRESS & TIME</span>
                  <strong style={{ color: 'var(--text-heading)', display: 'block' }}>{activeJob.address}</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Schedule: {activeJob.preferredDate || 'Tomorrow'} ({activeJob.preferredTime || '10:00 AM'})
                  </p>
                </div>
              </div>

              {/* Current Stage Action Box */}
              <div style={{ background: 'rgba(59, 130, 246, 0.06)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {activeJob.status === 'CONFIRMED' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: 0 }}>Stage 1: Ready to Depart</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        Click below when you begin traveling to the customer's site.
                      </p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }} onClick={() => handleSetOnTheWay(activeJob.id)}>
                      🚀 Start Journey (Mark "On The Way")
                    </button>
                  </div>
                )}

                {activeJob.status === 'ON_THE_WAY' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: 0 }}>Stage 2: Traveling to Customer</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        Customer sees you are on the way. Click below once you arrive at the address.
                      </p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)' }} onClick={() => handleSetArrived(activeJob.id)}>
                      📍 Mark "Arrived at Location"
                    </button>
                  </div>
                )}

                {activeJob.status === 'ARRIVED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', margin: 0 }}>Stage 3: Start Service OTP Verification</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        Ask the customer for their 4-digit <strong>Start OTP</strong> code shown on their booking card to begin work.
                      </p>
                    </div>

                    <form onSubmit={handleVerifyStartOtp} style={{ display: 'flex', gap: '0.8rem', maxWidth: '400px' }}>
                      <input
                        type="text"
                        maxLength="4"
                        required
                        autoFocus
                        className="form-input"
                        style={{ flex: 1, padding: '0.8rem', fontSize: '1.3rem', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.3rem', fontFamily: 'monospace' }}
                        placeholder="0000"
                        value={startOtpInput}
                        onChange={(e) => setStartOtpInput(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.4rem' }}>
                        Verify & Start Work ✔
                      </button>
                    </form>
                  </div>
                )}

                {activeJob.status === 'IN_PROGRESS' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#22d3ee', margin: 0 }}>Stage 4: Work In Progress</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                          Service is underway. Once you complete inspection and repairs, the customer will review and complete direct payment to settle the bill.
                        </p>
                      </div>
                      <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '0.6rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(34, 211, 238, 0.3)', color: '#22d3ee', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Awaiting Customer Payment & Completion
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* View Full Details Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => handleOpenDetails(activeJob)}>
                  <Eye size={15} /> View Full Job Details & Upload Photos
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Wrench size={52} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-heading)', margin: 0 }}>No Active Job In Progress</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Accept an incoming direct service request or submit a quote on a posted problem to start a job.
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setActiveSubTab('requests')}>
                  View Direct Requests ({pendingRequests.length})
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveSubTab('problems')}>
                  Browse Problem Posts ({problemPosts.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* --- SUBTAB 2: DIRECT SERVICE REQUESTS --- */}
      {/* ============================================================ */}
      {activeSubTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>Incoming Direct Customer Requests</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Method 1: Direct Technician Booking</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.map((b) => {
              const isAwaitingAdvance = b.status === 'AWAITING_ADVANCE' || (b.status === 'ACCEPTED' && !b.advancePaid);
              const isCustomerOffer = !isAwaitingAdvance && (b.status === 'PENDING' || (b.status === 'NEGOTIATING' && (b.lastOfferedBy === 'CUSTOMER' || !b.lastOfferedBy)));
              const isWorkerCounter = !isAwaitingAdvance && (b.status === 'NEGOTIATING' || b.status === 'COUNTERED') && (b.lastOfferedBy === 'WORKER' || (!b.lastOfferedBy && b.workerCounterPrice));
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
                    gridTemplateColumns: '1.2fr 2fr 1.5fr 1fr 1.8fr',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.2rem',
                    borderRadius: '14px',
                    border: isAwaitingAdvance ? '1px solid rgba(245, 158, 11, 0.4)' : isCustomerOffer ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)',
                    background: isAwaitingAdvance ? 'rgba(245, 158, 11, 0.05)' : isCustomerOffer ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  {/* Column 1: ID & Status */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block' }}>#BK-{b.id}</span>
                    <span className="badge badge-pending" style={{ marginTop: '0.3rem' }}>{b.status}</span>
                  </div>

                  {/* Column 2: Service & Problem */}
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-heading)', display: 'block' }}>{b.serviceType}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                      {b.description?.length > 50 ? `${b.description.slice(0, 50)}...` : b.description}
                    </p>
                    {b.beforePhoto && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <Camera size={12} color="#60a5fa" />
                        <span style={{ fontSize: '0.72rem', color: '#93c5fd' }}>Problem Photo Attached</span>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Customer info */}
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-heading)', display: 'block' }}>{b.customer?.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {b.address}</span>
                  </div>

                  {/* Column 4: Offered & Base Price */}
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{isAwaitingAdvance ? 'Agreed Deal' : 'Client Offer / Deal'}</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>৳{currentPrice}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', display: 'block' }}>Base Adv: ৳{b.basePrice || 300}</span>
                  </div>

                  {/* Column 5: Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                    {isCustomerOffer && (
                      <>
                        <button
                          className="btn btn-primary"
                          disabled={!isWorkerApproved || hasActiveJob}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            opacity: (!isWorkerApproved || hasActiveJob) ? 0.6 : 1,
                            cursor: (!isWorkerApproved || hasActiveJob) ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => {
                            if (hasActiveJob) {
                              if (onShowToast) onShowToast("Worker Busy", "You already have an active job in progress (#BK-" + activeJob?.id + "). Complete it before accepting new requests.", "error");
                              return;
                            }
                            handleAcceptBooking(b.id);
                          }}
                          title={hasActiveJob ? 'Busy: active job in progress' : !isWorkerApproved ? 'Verification approval required' : 'Accept offered price'}
                        >
                          <CheckCircle2 size={13} /> {hasActiveJob ? 'Busy 🔴' : 'Accept'} {!isWorkerApproved && '🔒'}
                        </button>
                        <button
                          className="btn btn-secondary"
                          disabled={!isWorkerApproved}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', opacity: !isWorkerApproved ? 0.6 : 1 }}
                          onClick={() => {
                            if (!isWorkerApproved) {
                              if (onShowToast) onShowToast("Verification Required", "Approval required to propose counter-offers.", "warning");
                              return;
                            }
                            setSelectedBooking(b);
                            setCounterPrice(b.customerOfferPrice || b.estimatedCost || '');
                            setShowCounterModal(true);
                          }}
                          title="Propose counter price"
                        >
                          <RotateCcw size={13} /> Counter
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleDeclineBooking(b.id)}
                          title="Decline request"
                        >
                          <XCircle size={13} />
                        </button>
                      </>
                    )}

                    {isWorkerCounter && (
                      <>
                        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.75rem' }}>
                          Waiting Customer (৳{currentPrice})
                        </span>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleDeclineBooking(b.id)}
                          title="Cancel request"
                        >
                          <XCircle size={13} />
                        </button>
                      </>
                    )}

                    {isAwaitingAdvance && (
                      <>
                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.75rem' }}>
                          ⏳ Awaiting Base Advance (৳{b.basePrice || 300} + 5% VAT)
                        </span>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          onClick={() => handleDeclineBooking(b.id)}
                          title="Cancel request"
                        >
                          <XCircle size={13} />
                        </button>
                      </>
                    )}

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => handleOpenDetails(b)}
                    >
                      <Eye size={13} /> Details
                    </button>
                  </div>

                </div>
              );
            })}

            {pendingRequests.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No pending direct requests right now.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- SUBTAB 3: PROBLEM POSTS MARKETPLACE --- */}
      {/* ============================================================ */}
      {activeSubTab === 'problems' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>Customer Problem Posts (Method 2)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Browse posted problems and submit price quotes. When customer accepts, booking is confirmed.
              </p>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', 'AC', 'Electrical', 'Plumbing', 'Refrigerator', 'Washing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProblemCategoryFilter(cat)}
                  className={`btn ${problemCategoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            {filteredProblems.map((p) => {
              const myOffer = myProblemOffers.find(o => o.problemPost?.id === p.id);

              return (
                <div key={p.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-verified">{p.serviceCategory}</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>Budget: ৳{p.budgetPrice}</strong>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', margin: '0.6rem 0 0.3rem 0' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{p.description}</p>

                    {p.photoUrl && (
                      <div style={{ marginTop: '0.6rem' }}>
                        <img src={p.photoUrl} alt="Problem attached" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                      </div>
                    )}

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.7rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <p style={{ margin: '0 0 0.2rem 0' }}>Customer: <strong>{p.customer?.name}</strong></p>
                      <p style={{ margin: '0 0 0.2rem 0' }}>Location: 📍 {p.address}</p>
                      <p style={{ margin: 0 }}>Preferred Schedule: {p.preferredDate} ({p.preferredTime})</p>
                    </div>

                    {myOffer && (
                      <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Your Submitted Quote: ৳{myOffer.proposedPrice}</span>
                          <span className={`badge ${myOffer.status === 'ACCEPTED' ? 'badge-verified' : 'badge-pending'}`}>{myOffer.status}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={!isWorkerApproved || hasActiveJob}
                    style={{
                      padding: '0.65rem',
                      fontSize: '0.85rem',
                      justifyContent: 'center',
                      opacity: (!isWorkerApproved || hasActiveJob) ? 0.6 : 1,
                      cursor: hasActiveJob ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => {
                      if (!isWorkerApproved) {
                        if (onShowToast) onShowToast("Verification Required", "You must be approved to submit problem quotes.", "warning");
                        setShowVerifModal(true);
                        return;
                      }
                      if (hasActiveJob) {
                        if (onShowToast) onShowToast("Worker Busy", "You already have an active job in progress (#BK-" + activeJob?.id + "). Complete or finalize your current job before quoting on other problems.", "error");
                        return;
                      }
                      setSelectedProblem(p);
                      setOfferPrice(myOffer ? myOffer.proposedPrice.toString() : p.budgetPrice?.toString() || '1000');
                      setOfferMessage(myOffer ? myOffer.message : '');
                      setShowProblemOfferModal(true);
                    }}
                  >
                    <Send size={14} /> {hasActiveJob ? '🔴 Busy on Active Job' : !isWorkerApproved ? 'Submit Quote (🔒 Approval Required)' : myOffer ? 'Update Quote ৳' : 'Submit Price Quote →'}
                  </button>
                </div>
              );
            })}

            {filteredProblems.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', gridColumn: 'span 2' }}>
                No open problem posts found for category "{problemCategoryFilter}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- SUBTAB 4: WORKER WALLET & EARNINGS --- */}
      {/* ============================================================ */}
      {activeSubTab === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Wallet KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
            <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Balance</span>
              <h3 style={{ fontSize: '2rem', color: 'var(--primary)', margin: '0.3rem 0 0 0' }}>৳{wallet?.balance || 0}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ready for instant withdrawal</span>
            </div>

            <div className="glass-card">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Net Earnings (95%)</span>
              <h3 style={{ fontSize: '2rem', color: 'var(--text-heading)', margin: '0.3rem 0 0 0' }}>৳{wallet?.totalEarnings || 0}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All completed service jobs</span>
            </div>

            <div className="glass-card">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Platform Fees Paid (5%)</span>
              <h3 style={{ fontSize: '2rem', color: 'var(--accent-gold)', margin: '0.3rem 0 0 0' }}>৳{wallet?.totalPlatformFees || 0}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Transparent commission</span>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outstanding COD Fees</span>
                <h3 style={{ fontSize: '1.6rem', color: wallet?.outstandingFees > 0 ? 'var(--accent-rose)' : 'var(--primary)', margin: '0.2rem 0 0 0' }}>
                  ৳{wallet?.outstandingFees || 0}
                </h3>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '0.6rem', fontSize: '0.85rem', marginTop: '0.8rem', justifyContent: 'center' }}
                onClick={() => setShowWithdrawModal(true)}
              >
                <ArrowDownRight size={16} /> Withdraw to bKash / Bank
              </button>
            </div>
          </div>

          {/* Wallet Financial Ledger */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Wallet Transactions Ledger</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{walletTransactions.length} Transactions</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {walletTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: tx.amount >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: tx.amount >= 0 ? 'var(--primary)' : 'var(--accent-rose)'
                      }}
                    >
                      {tx.amount >= 0 ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-heading)', display: 'block' }}>{tx.description}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleString()} • Type: {tx.type}
                      </span>
                    </div>
                  </div>

                  <strong style={{ fontSize: '1.1rem', color: tx.amount >= 0 ? 'var(--primary)' : 'var(--accent-rose)' }}>
                    {tx.amount >= 0 ? `+৳${tx.amount}` : `-৳${Math.abs(tx.amount)}`}
                  </strong>
                </div>
              ))}

              {walletTransactions.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No wallet transactions recorded yet.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* --- SUBTAB 5: COMPLETED JOBS & REVIEWS --- */}
      {/* ============================================================ */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', margin: 0 }}>Completed Service History & Warranty Claims</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
                Review past jobs, ratings, and active 30-day warranty service claims assigned to you.
              </p>
            </div>
            {hasActiveWarrantyClaim && (
              <span className="badge badge-warning" style={{ border: '1.5px solid #ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.45rem 0.9rem', fontWeight: 'bold' }}>
                ⚠️ {activeWarrantyBookings.length} Unresolved Warranty Claim Active
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {completedBookings.map((b) => {
              const completedDate = new Date(b.completedAt || b.paidAt || b.createdAt);
              const formattedWorkedDate = isNaN(completedDate.getTime()) ? 'Recently' : completedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
              const isWarrantyClaimed = b.warrantyStatus === 'WARRANTY_CLAIMED';
              const isWarrantyAccepted = b.warrantyStatus === 'WARRANTY_ACCEPTED';
              const isWarrantyCompleted = b.warrantyStatus === 'WARRANTY_COMPLETED';

              return (
                <div
                  key={b.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isWarrantyClaimed ? 'rgba(239, 68, 68, 0.08)' : isWarrantyAccepted ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)',
                    padding: '1.3rem',
                    borderRadius: '14px',
                    border: isWarrantyClaimed ? '1.5px solid #ef4444' : isWarrantyAccepted ? '1.5px solid #f59e0b' : '1px solid var(--border-color)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: (isWarrantyClaimed || isWarrantyAccepted) ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>{b.serviceType}</strong>
                      <span className="badge badge-verified">Completed</span>
                      {b.paymentStatus === 'PAID' && <span className="badge badge-gold">Paid ({b.paymentMethod || 'bKash'})</span>}
                      
                      {/* Warranty Status Badges for Worker */}
                      {isWarrantyClaimed ? (
                        <span className="badge badge-warning" style={{ background: '#ef4444', color: '#fff', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <ShieldAlert size={13} /> 🚨 Warranty Action Required
                        </span>
                      ) : isWarrantyAccepted ? (
                        <span className="badge badge-gold" style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#f59e0b' }}>
                          <Clock size={12} /> 🛠️ Free Warranty In Progress
                        </span>
                      ) : isWarrantyCompleted ? (
                        <span className="badge badge-verified" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' }}>
                          <CheckCircle2 size={12} /> Warranty Service Finished
                        </span>
                      ) : (
                        <span className="badge badge-verified" style={{ opacity: 0.8 }}>
                          <ShieldCheck size={12} /> 30-Day Guarantee
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', marginBottom: 0 }}>
                      Customer: <strong>{b.customer?.name}</strong> • Phone: <strong>{b.customer?.phone || '01711223344'}</strong> • Address: <strong>{b.address || b.customer?.address || 'Client Address'}</strong>
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem', marginBottom: 0 }}>
                      Worked Date: <strong>{formattedWorkedDate}</strong> • Final Price: <strong>৳{b.agreedCost || b.estimatedCost}</strong> • Net Earning: <strong style={{ color: 'var(--primary)' }}>৳{b.workerNetEarning || (b.agreedCost ? Math.round(b.agreedCost * 0.95) : 0)}</strong>
                    </p>

                    {/* Warranty issue prompt */}
                    {b.warrantyProblemDescription && (
                      <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.8rem', background: isWarrantyClaimed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', borderLeft: isWarrantyClaimed ? '3px solid #ef4444' : '3px solid #f59e0b', fontSize: '0.82rem', color: isWarrantyClaimed ? '#fca5a5' : '#f59e0b' }}>
                        <strong>⚠️ Customer Reported Warranty Issue:</strong> "{b.warrantyProblemDescription}"
                        {b.warrantyClaimedAt && <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.8 }}>Claimed on: {new Date(b.warrantyClaimedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                    )}

                    {isWarrantyAccepted && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} /> Please visit customer at their location to perform free repair. Customer will mark "Done" upon completion to lift worker restrictions.
                      </div>
                    )}

                    {b.reviewRating && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                        ⭐ {b.reviewRating}/5: <em>"{b.reviewComment || 'Great service!'}"</em>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {isWarrantyClaimed && (
                      <button
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 'bold', padding: '0.5rem 1.1rem', fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => handleAcceptWarranty(b.id)}
                      >
                        <Check size={16} /> Accept Warranty Claim
                      </button>
                    )}

                    <button className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => handleOpenDetails(b)}>
                      <Eye size={14} /> Full Record
                    </button>
                  </div>
                </div>
              );
            })}

            {completedBookings.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No completed jobs recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- SUBTAB 6: ID & VERIFICATION PROFILE (DOSSIER VIEW) --- */}
      {/* ============================================================ */}
      {activeSubTab === 'verification' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-heading)', margin: 0 }}>Technician Verification Dossier</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
                SkillVerse home-entry trust & safety checkpoints. Kept secure and confidential.
              </p>
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.2rem', fontSize: '0.85rem' }}
              onClick={() => {
                setVerifStep(1);
                setShowVerifModal(true);
              }}
            >
              ✏️ {verifDossier ? 'Update & Resubmit Dossier' : 'Fill Verification Dossier'}
            </button>
          </div>

          {/* Verification Status & Checkpoints Summary */}
          <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT STATUS</span>
              <div style={{ marginTop: '0.4rem' }}>
                {isWorkerApproved ? (
                  <span className="badge badge-verified" style={{ fontSize: '0.9rem' }}>✔ APPROVED TECHNICIAN</span>
                ) : currentVerifStatus === 'UNDER_REVIEW' || currentVerifStatus === 'PENDING' ? (
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.9rem' }}>⏳ UNDER REVIEW</span>
                ) : currentVerifStatus === 'CORRECTION_REQUIRED' ? (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.9rem' }}>⚠️ CORRECTION REQUIRED</span>
                ) : (
                  <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.9rem' }}>UNVERIFIED</span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', marginBottom: 0 }}>
                Submitted: <strong>{verifDossier?.submittedAt ? new Date(verifDossier.submittedAt).toLocaleDateString() : 'Not yet submitted'}</strong>
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>6-POINT CHECKPOINTS</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: verifForm.nidNumber ? '#34d399' : '#94a3b8' }}>{verifForm.nidNumber ? '✔' : '○'} Identity (NID)</span>
                <span style={{ color: phoneOtpVerified || verifForm.phoneVerified ? '#34d399' : '#94a3b8' }}>{phoneOtpVerified || verifForm.phoneVerified ? '✔' : '○'} Phone OTP</span>
                <span style={{ color: verifForm.presentAddress ? '#34d399' : '#94a3b8' }}>{verifForm.presentAddress ? '✔' : '○'} Address Details</span>
                <span style={{ color: verifForm.skills ? '#34d399' : '#94a3b8' }}>{verifForm.skills ? '✔' : '○'} Professional Skills</span>
                <span style={{ color: verifForm.experienceCertPhoto ? '#34d399' : '#94a3b8' }}>{verifForm.experienceCertPhoto ? '✔' : '○'} Documents</span>
                <span style={{ color: verifForm.payoutAccount ? '#34d399' : '#94a3b8' }}>{verifForm.payoutAccount ? '✔' : '○'} Payout Info</span>
              </div>
            </div>

            {verifDossier?.adminRemarks && (
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)', gridColumn: 'span 1' }}>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold' }}>ADMIN AUDIT REMARKS</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-heading)', marginTop: '0.3rem', marginBottom: 0 }}>
                  "{verifDossier.adminRemarks}"
                </p>
              </div>
            )}
          </div>

          {/* Dossier 4 Sections Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
            
            {/* 1. Identity & Personal */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <User size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', margin: 0 }}>1. Personal & Identity</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Full Legal Name:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{verifForm.fullName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date of Birth:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{verifForm.dateOfBirth}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{verifForm.phone} {phoneOtpVerified || verifForm.phoneVerified ? '✔ (OTP Verified)' : '⚠️ (Unverified)'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>NID Number:</span>
                  <strong style={{ color: 'var(--text-heading)', fontFamily: 'monospace' }}>{verifForm.nidNumber}</strong>
                </div>

                <div style={{ marginTop: '0.8rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>IDENTITY DOCUMENTS ATTACHED:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    {verifForm.nidFrontPhoto && (
                      <div style={{ textAlign: 'center' }}>
                        <img src={verifForm.nidFrontPhoto} alt="NID Front" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>NID Front</span>
                      </div>
                    )}
                    {verifForm.nidBackPhoto && (
                      <div style={{ textAlign: 'center' }}>
                        <img src={verifForm.nidBackPhoto} alt="NID Back" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>NID Back</span>
                      </div>
                    )}
                    {verifForm.profileSelfiePhoto && (
                      <div style={{ textAlign: 'center' }}>
                        <img src={verifForm.profileSelfiePhoto} alt="Selfie" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Selfie</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Address Details */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <MapPin size={18} color="#38bdf8" />
                <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', margin: 0 }}>2. Address Verification</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PRESENT / CURRENT ADDRESS:</span>
                  <strong style={{ color: 'var(--text-heading)', display: 'block', marginTop: '0.1rem' }}>{verifForm.presentAddress}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{verifForm.cityArea}, {verifForm.district}, {verifForm.division} - {verifForm.postalCode}</span>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PERMANENT / HOME ADDRESS:</span>
                  <strong style={{ color: 'var(--text-heading)', display: 'block', marginTop: '0.1rem' }}>{verifForm.permanentAddress}</strong>
                </div>

                {verifForm.detailedAddress && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>LANDMARK / DETAILED DIRECTIONS:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{verifForm.detailedAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Professional Skills */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Wrench size={18} color="var(--accent-gold)" />
                <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', margin: 0 }}>3. Professional Skills</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Years of Experience:</span>
                  <strong style={{ color: 'var(--primary)' }}>{verifForm.experienceYears} Years</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Provided Services:</span>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                    {verifForm.skills?.split(',').map((sk, idx) => (
                      <span key={idx} className="badge badge-verified" style={{ fontSize: '0.75rem' }}>{sk.trim()}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Experience Summary:</span>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                    {verifForm.experienceDescription}
                  </p>
                </div>
                {verifForm.previousEmployer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Previous Employer:</span>
                    <strong style={{ color: 'var(--text-heading)' }}>{verifForm.previousEmployer}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Payout Method */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Wallet size={18} color="#a855f7" />
                <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', margin: 0 }}>4. Payout Information</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payout Channel:</span>
                  <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>{verifForm.payoutMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Account / Phone No:</span>
                  <strong style={{ color: 'var(--text-heading)', fontFamily: 'monospace' }}>{verifForm.payoutAccount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Account Holder Name:</span>
                  <strong style={{ color: 'var(--text-heading)' }}>{verifForm.payoutAccountHolder}</strong>
                </div>
                {verifForm.payoutMethod === 'Bank' && verifForm.payoutBankName && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Bank & Branch:</span>
                    <strong style={{ color: 'var(--text-heading)' }}>{verifForm.payoutBankName} ({verifForm.payoutBankBranch})</strong>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* --- ALL MODALS --- */}
      {/* ============================================================ */}

      {/* --- DETAILS MODAL --- */}
      <WorkerBookingDetailsModal
        booking={detailsBooking}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onAcceptBooking={handleAcceptBooking}
        onOpenCounterModal={(b) => {
          if (!isWorkerApproved) {
            if (onShowToast) onShowToast("Verification Required", "Approval required to propose counter-offers.", "warning");
            return;
          }
          setSelectedBooking(b);
          setCounterPrice(b.customerOfferPrice || b.estimatedCost || '');
          setShowCounterModal(true);
        }}
        onSetOnTheWay={handleSetOnTheWay}
        onSetArrived={handleSetArrived}
        onOpenStartOtpModal={(b) => {
          setSelectedBooking(b);
          setShowStartOtpModal(true);
        }}
        onRequestCompletion={handleRequestCompletion}
        onOpenCompletionOtpModal={(b) => {
          setSelectedBooking(b);
          setShowCompletionOtpModal(true);
        }}
        onUploadPhotos={handleUploadPhotos}
        hasActiveJob={hasActiveJob}
      />

      {/* --- COUNTER OFFER MODAL --- */}
      {showCounterModal && selectedBooking && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowCounterModal(false)}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Propose Counter Price</h3>
              </div>
              <button onClick={() => setShowCounterModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Propose a revised price to <strong>{selectedBooking.customer?.name}</strong> for <em>{selectedBooking.serviceType}</em>.
            </p>

            <form onSubmit={handleSendCounterOffer}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Counter Price (BDT ৳)</label>
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
                    placeholder="e.g. 1250"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCounterModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)' }}>
                  Submit Counter Offer →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- START OTP MODAL --- */}
      {showStartOtpModal && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowStartOtpModal(false)}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <KeyRound size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Enter Start OTP</h3>
              </div>
              <button onClick={() => setShowStartOtpModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Enter the 4-digit code provided by the customer to verify arrival and begin work.
            </p>

            <form onSubmit={handleVerifyStartOtp}>
              <div style={{ marginBottom: '1.2rem' }}>
                <input
                  type="text"
                  maxLength="4"
                  required
                  autoFocus
                  className="form-input"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.3rem', fontFamily: 'monospace' }}
                  placeholder="0000"
                  value={startOtpInput}
                  onChange={(e) => setStartOtpInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStartOtpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Verify & Begin Work ✔</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COMPLETION OTP MODAL --- */}
      {showCompletionOtpModal && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowCompletionOtpModal(false)}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <KeyRound size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Enter Completion OTP</h3>
              </div>
              <button onClick={() => setShowCompletionOtpModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Enter the 4-digit code provided by the customer to verify satisfaction and complete the job.
            </p>

            <form onSubmit={handleVerifyCompletionOtp}>
              <div style={{ marginBottom: '1.2rem' }}>
                <input
                  type="text"
                  maxLength="4"
                  required
                  autoFocus
                  className="form-input"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.3rem', fontFamily: 'monospace' }}
                  placeholder="0000"
                  value={completionOtpInput}
                  onChange={(e) => setCompletionOtpInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompletionOtpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete Service ✔</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROBLEM OFFER MODAL --- */}
      {showProblemOfferModal && selectedProblem && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowProblemOfferModal(false)}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Send size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0 }}>Submit Quote for Problem</h3>
              </div>
              <button onClick={() => setShowProblemOfferModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Submitting quote for: <strong>{selectedProblem.title}</strong> (Customer budget: ৳{selectedProblem.budgetPrice})
            </p>

            <form onSubmit={handleSubmitProblemOffer}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Proposed Quote (BDT ৳)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  autoFocus
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="e.g. 1000"
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Message to Customer</label>
                <textarea
                  rows={3}
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                  placeholder="e.g. Certified technician with 8 years experience. Quality guarantee with 30-day post-service warranty on all repairs..."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProblemOfferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Quote to Customer →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- WITHDRAWAL / CASHOUT MODAL --- */}
      {showWithdrawModal && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowWithdrawModal(false)}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '20px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Wallet size={22} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0 }}>Cashout Wallet Balance</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct disbursement to Mobile Wallet or Bank</span>
                </div>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            {/* Balance Summary Header */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.9rem 1.1rem', borderRadius: '12px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Available Main Wallet</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>৳{wallet?.balance != null ? Math.max(0, wallet.balance) : 0}</strong>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Min: ৳50 • No Max</span>
                <div style={{ color: '#34d399', fontWeight: 600 }}>Instant Cashout</div>
              </div>
            </div>

            <form onSubmit={handleWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Withdrawal Method Selector */}
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Select Cashout Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {[
                    { id: 'bKash', label: 'bKash', color: '#e2136e' },
                    { id: 'Nagad', label: 'Nagad', color: '#f7941d' },
                    { id: 'Rocket', label: 'Rocket', color: '#8c3494' },
                    { id: 'Bank', label: 'Bank', color: '#3b82f6' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setWithdrawMethod(m.id)}
                      className={`btn ${withdrawMethod === m.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '0.5rem 0.3rem',
                        fontSize: '0.8rem',
                        justifyContent: 'center',
                        borderColor: withdrawMethod === m.id ? m.color : undefined
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Quick Pills */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Cashout Amount (৳)</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Cannot exceed available balance</span>
                </div>

                <input
                  type="number"
                  min="50"
                  max={wallet?.balance || 0}
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem', fontSize: '1rem' }}
                  placeholder="e.g. 500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />

                {/* Quick amount shortcuts */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      disabled={(wallet?.balance || 0) < amt}
                    >
                      ৳{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(Math.max(0, wallet?.balance || 0).toString())}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    disabled={(wallet?.balance || 0) <= 0}
                  >
                    Cashout All (৳{wallet?.balance || 0})
                  </button>
                </div>
              </div>

              {/* Mobile / Account Details */}
              {['bKash', 'Nagad', 'Rocket'].includes(withdrawMethod) ? (
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                    {withdrawMethod} Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.7rem' }}
                    placeholder="017XXXXXXXX / 019XXXXXXXX"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    Funds will be directly transferred to your {withdrawMethod} Personal/Agent account.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>Bank Name</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', padding: '0.6rem' }}
                      value={withdrawBankName}
                      onChange={(e) => setWithdrawBankName(e.target.value)}
                    >
                      <option value="Dutch-Bangla Bank" style={{ background: '#111827' }}>Dutch-Bangla Bank Limited (DBBL)</option>
                      <option value="BRAC Bank" style={{ background: '#111827' }}>BRAC Bank PLC</option>
                      <option value="Islami Bank" style={{ background: '#111827' }}>Islami Bank Bangladesh</option>
                      <option value="City Bank" style={{ background: '#111827' }}>The City Bank Limited</option>
                      <option value="Eastern Bank" style={{ background: '#111827' }}>Eastern Bank PLC (EBL)</option>
                      <option value="Sonali Bank" style={{ background: '#111827' }}>Sonali Bank Limited</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>Branch Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.6rem' }}
                        placeholder="e.g. Uttara Branch"
                        value={withdrawBranchName}
                        onChange={(e) => setWithdrawBranchName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>Account Number</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.6rem' }}
                        placeholder="1234567890"
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'block' }}>Account Holder Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.6rem' }}
                      placeholder="Full Name as in Bank"
                      value={withdrawAccountHolder}
                      onChange={(e) => setWithdrawAccountHolder(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Deduction & Remaining Balance Ledger Preview */}
              {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Current Wallet Balance:</span>
                    <strong>৳{wallet?.balance != null ? Math.max(0, wallet.balance) : 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                    <span>Deducted for Cashout:</span>
                    <strong>-৳{parseFloat(withdrawAmount) || 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', borderTop: '1px solid var(--border-color)', paddingTop: '0.3rem', fontWeight: 600 }}>
                    <span>Remaining Wallet Balance:</span>
                    <strong>৳{Math.max(0, Math.round(((wallet?.balance || 0) - (parseFloat(withdrawAmount) || 0)) * 100) / 100)}</strong>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={(wallet?.balance || 0) <= 0 || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (wallet?.balance || 0)}
                  style={{ background: 'linear-gradient(90deg, #10b981, #059669)', padding: '0.7rem 1.4rem' }}
                >
                  Confirm Cashout ৳{withdrawAmount || 0} →
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- 5-STEP WORKER VERIFICATION WIZARD MODAL (FIXED WIDESCREEN NO-SCROLL) --- */}
      {/* ============================================================ */}
      {showVerifModal && (
        <div
          className="toast-popup-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
            background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
          onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowVerifModal(false)}
        >
          <div
            className="glass-card modal-content-wide"
            style={{
              maxWidth: '860px', width: '92vw', maxHeight: '92vh', overflowY: 'auto',
              background: 'var(--bg-secondary)', padding: '1.4rem 1.6rem', borderRadius: '18px',
              border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.9rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700 }}>Technician Verification Dossier</h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Step {verifStep} of 5: {verifStep === 1 ? 'Personal & NID' : verifStep === 2 ? 'Address & Service Location' : verifStep === 3 ? 'Professional Experience' : verifStep === 4 ? 'Payout Setup' : 'Review & Submit'}</span>
                </div>
              </div>

              <button onClick={() => setShowVerifModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '0.35rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
              {[
                { s: 1, label: '1. Identity' },
                { s: 2, label: '2. Address & Location' },
                { s: 3, label: '3. Experience' },
                { s: 4, label: '4. Payout' },
                { s: 5, label: '5. Review' }
              ].map((stepItem) => (
                <div
                  key={stepItem.s}
                  onClick={() => setVerifStep(stepItem.s)}
                  style={{
                    padding: '0.35rem 0.2rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    background: verifStep === stepItem.s
                      ? 'var(--primary)'
                      : verifStep > stepItem.s
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(255,255,255,0.05)',
                    color: verifStep === stepItem.s
                      ? '#000000'
                      : verifStep > stepItem.s
                      ? '#34d399'
                      : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {stepItem.label}
                </div>
              ))}
            </div>

            {/* ================= STEP 1: PERSONAL & IDENTITY ================= */}
            {verifStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.75rem', color: '#bae6fd' }}>
                  ℹ️ Provide official NID details and verify your phone number via SMS OTP code.
                </div>

                <div className="modal-two-col">
                  {/* Left Column: Personal info & OTP */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Full Legal Name (as per NID) *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          value={verifForm.fullName}
                          onChange={(e) => setVerifForm({ ...verifForm, fullName: e.target.value })}
                          placeholder="e.g. Kamrul Islam"
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Date of Birth *</label>
                        <input
                          type="date"
                          required
                          className="form-input"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          value={verifForm.dateOfBirth}
                          onChange={(e) => setVerifForm({ ...verifForm, dateOfBirth: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Phone & OTP Simulator */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontSize: '0.74rem', margin: 0 }}>Phone & SMS OTP *</label>
                        {phoneOtpVerified || verifForm.phoneVerified ? (
                          <span className="badge badge-verified" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>✔ Verified</span>
                        ) : (
                          <span className="badge badge-pending" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>⚠️ Pending</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          required
                          className="form-input"
                          style={{ flex: 1, padding: '0.35rem 0.55rem', fontSize: '0.8rem' }}
                          value={verifForm.phone}
                          onChange={(e) => setVerifForm({ ...verifForm, phone: e.target.value })}
                          placeholder="01711223344"
                        />
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem', whiteSpace: 'nowrap' }}
                          onClick={handleSendPhoneOtp}
                        >
                          {phoneOtpSent ? '🔄 Resend' : '📲 Send Code'}
                        </button>
                      </div>

                      {phoneOtpSent && !phoneOtpVerified && (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '0.45rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Code: <strong style={{ color: 'var(--primary)' }}>{phoneOtpSimulatedCode}</strong></span>
                          <input
                            type="text"
                            maxLength="6"
                            className="form-input"
                            style={{ flex: 1, padding: '0.25rem 0.4rem', fontSize: '0.85rem', letterSpacing: '0.15rem', textAlign: 'center', fontWeight: 'bold' }}
                            placeholder="OTP"
                            value={phoneOtpInput}
                            onChange={(e) => setPhoneOtpInput(e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
                            onClick={handleVerifyPhoneOtp}
                          >
                            Verify ✔
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>National ID (NID) Number *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
                        value={verifForm.nidNumber}
                        onChange={(e) => setVerifForm({ ...verifForm, nidNumber: e.target.value })}
                        placeholder="10 or 17 digit NID number (e.g. 5928194028)"
                      />
                    </div>
                  </div>

                  {/* Right Column: NID Photos & Selfie */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.15rem' }}>NID Front Image *</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.74rem' }}
                          value={verifForm.nidFrontPhoto.substring(0, 35) + (verifForm.nidFrontPhoto.length > 35 ? '...' : '')}
                          onChange={(e) => setVerifForm({ ...verifForm, nidFrontPhoto: e.target.value })}
                          placeholder="Image URL or upload..."
                        />
                        <label className="btn btn-secondary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.55rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UploadCloud size={11} /> Upload
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLocalPhotoUpload(e, 'nidFrontPhoto')} />
                        </label>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.65rem', padding: '0.25rem 0.45rem' }}
                          onClick={() => setVerifForm({ ...verifForm, nidFrontPhoto: 'https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600' })}
                        >
                          Demo
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.15rem' }}>NID Back Image *</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.74rem' }}
                          value={verifForm.nidBackPhoto.substring(0, 35) + (verifForm.nidBackPhoto.length > 35 ? '...' : '')}
                          onChange={(e) => setVerifForm({ ...verifForm, nidBackPhoto: e.target.value })}
                          placeholder="Image URL or upload..."
                        />
                        <label className="btn btn-secondary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.55rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UploadCloud size={11} /> Upload
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLocalPhotoUpload(e, 'nidBackPhoto')} />
                        </label>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.65rem', padding: '0.25rem 0.45rem' }}
                          onClick={() => setVerifForm({ ...verifForm, nidBackPhoto: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600' })}
                        >
                          Demo
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.15rem' }}>Selfie / Profile Image *</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.74rem' }}
                          value={verifForm.profileSelfiePhoto.substring(0, 35) + (verifForm.profileSelfiePhoto.length > 35 ? '...' : '')}
                          onChange={(e) => setVerifForm({ ...verifForm, profileSelfiePhoto: e.target.value })}
                          placeholder="Image URL or upload..."
                        />
                        <label className="btn btn-secondary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.55rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UploadCloud size={11} /> Upload
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLocalPhotoUpload(e, 'profileSelfiePhoto')} />
                        </label>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.65rem', padding: '0.25rem 0.45rem' }}
                          onClick={() => setVerifForm({ ...verifForm, profileSelfiePhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=600' })}
                        >
                          Demo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 1.2rem', fontSize: '0.82rem', fontWeight: 600 }}
                    onClick={() => setVerifStep(2)}
                  >
                    Next: Address & Location →
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: ADDRESS & PUBLIC SERVICE LOCATION (FIXED 2-COLUMN NO SCROLL) ================= */}
            {verifStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.74rem', color: '#93c5fd' }}>
                  📍 Accurate present address and pinned service base are required for customer discovery and safe dispatch.
                </div>

                <div className="modal-two-col">
                  {/* Left Column: Residential Addresses */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.15rem' }}>Present / Current Living Address *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.38rem 0.55rem', fontSize: '0.78rem' }}
                        value={verifForm.presentAddress}
                        onChange={(e) => setVerifForm({ ...verifForm, presentAddress: e.target.value })}
                        placeholder="House 14, Road 4, Sector 12, Uttara, Dhaka"
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.15rem' }}>Permanent / Home Address *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.38rem 0.55rem', fontSize: '0.78rem' }}
                        value={verifForm.permanentAddress}
                        onChange={(e) => setVerifForm({ ...verifForm, permanentAddress: e.target.value })}
                        placeholder="Vill: Rasulpur, Brahmanbaria"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.1rem' }}>Division *</label>
                        <select
                          className="form-input"
                          style={{ width: '100%', padding: '0.35rem 0.4rem', fontSize: '0.74rem' }}
                          value={verifForm.division}
                          onChange={(e) => {
                            const newDiv = e.target.value;
                            const dists = BANGLADESH_DISTRICTS[newDiv] || ['Dhaka'];
                            const newDist = dists[0] || '';
                            const cities = BANGLADESH_CITIES[newDist] || ['Uttara'];
                            const newCity = cities[0] || '';
                            setVerifForm(prev => ({
                              ...prev,
                              division: newDiv,
                              district: newDist,
                              cityArea: newCity,
                              serviceArea: `${newCity}, ${newDist}`
                            }));
                          }}
                        >
                          {BANGLADESH_DIVISIONS.map(d => (
                            <option key={d} value={d} style={{ background: '#111827' }}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.1rem' }}>District *</label>
                        <select
                          className="form-input"
                          style={{ width: '100%', padding: '0.35rem 0.4rem', fontSize: '0.74rem' }}
                          value={verifForm.district}
                          onChange={(e) => {
                            const newDist = e.target.value;
                            const cities = BANGLADESH_CITIES[newDist] || ['Sadar'];
                            const newCity = cities[0] || '';
                            setVerifForm(prev => ({
                              ...prev,
                              district: newDist,
                              cityArea: newCity,
                              serviceArea: `${newCity}, ${newDist}`
                            }));
                          }}
                        >
                          {(BANGLADESH_DISTRICTS[verifForm.division] || ['Dhaka']).map(dist => (
                            <option key={dist} value={dist} style={{ background: '#111827' }}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.1rem' }}>City / Area *</label>
                        <select
                          className="form-input"
                          style={{ width: '100%', padding: '0.35rem 0.4rem', fontSize: '0.74rem' }}
                          value={verifForm.cityArea}
                          onChange={(e) => {
                            const newCity = e.target.value;
                            setVerifForm(prev => ({
                              ...prev,
                              cityArea: newCity,
                              serviceArea: `${newCity}, ${prev.district || 'Dhaka'}`
                            }));
                          }}
                        >
                          {(BANGLADESH_CITIES[verifForm.district] || ['Uttara', 'Dhanmondi', 'Gulshan', 'Mirpur', 'Sadar']).map(city => (
                            <option key={city} value={city} style={{ background: '#111827' }}>{city}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.1rem' }}>Postal Code *</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ width: '100%', padding: '0.35rem 0.4rem', fontSize: '0.74rem' }}
                          value={verifForm.postalCode}
                          onChange={(e) => setVerifForm({ ...verifForm, postalCode: e.target.value })}
                          placeholder="1230"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.15rem' }}>Landmark & Area Instructions (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '100%', padding: '0.35rem 0.55rem', fontSize: '0.76rem' }}
                        value={verifForm.detailedAddress}
                        onChange={(e) => setVerifForm({ ...verifForm, detailedAddress: e.target.value })}
                        placeholder="Near Milestone College, Sector 12"
                      />
                    </div>
                  </div>

                  {/* Right Column: Public Service Location Card (Customer Discovery Base) */}
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Compass size={16} color="#10b981" />
                        <h4 style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-heading)', fontWeight: 700 }}>
                          Public Service Base Pin *
                        </h4>
                      </div>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Customers in this radius discover and book you based on this pinpoint.
                      </p>
                    </div>

                    {/* Quick GPS & Map Select Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleUseCurrentLocationForVerif}
                        disabled={isDetectingGps}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.35rem 0.5rem',
                          justifyContent: 'center',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                          color: '#34d399'
                        }}
                      >
                        <Navigation size={12} className={isDetectingGps ? 'animate-spin' : ''} />
                        {isDetectingGps ? 'Detecting...' : 'Use My GPS'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowLocationPickerModal(true)}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.35rem 0.5rem',
                          justifyContent: 'center',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'linear-gradient(90deg, #10b981, #059669)'
                        }}
                      >
                        <MapPin size={12} />
                        Select on Map
                      </button>
                    </div>

                    {/* Pin Status Box */}
                    <div style={{
                      background: 'rgba(5, 10, 20, 0.6)',
                      padding: '0.65rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} color="#10b981" />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                            {verifForm.serviceArea || 'Sector 11, Uttara, Dhaka'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            Active Service Area (Customer Matchpoint)
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', fontFamily: 'monospace', fontSize: '0.7rem', marginTop: '0.1rem' }}>
                        <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.1rem 0.35rem' }}>
                          Lat: {Number(verifForm.latitude || 23.8720).toFixed(4)}
                        </span>
                        <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.1rem 0.35rem' }}>
                          Lon: {Number(verifForm.longitude || 90.3810).toFixed(4)}
                        </span>
                        <span className="badge badge-verified" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                          ✔ Active Pin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setVerifStep(1)}>← Back</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', fontWeight: 600 }} onClick={() => setVerifStep(3)}>Next: Professional Experience →</button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: PROFESSIONAL INFO (MULTI-SKILL ADDER) ================= */}
            {verifStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.74rem', color: '#fde68a' }}>
                  💡 Add each service skill you provide with your experience years. Multiple skills will appear on your verified profile.
                </div>

                <div className="modal-two-col">
                  {/* Left Column: Multi-Skill Selector, Badges & Bio */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {/* Add Skill Control Row */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.55rem 0.7rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label className="form-label" style={{ fontSize: '0.74rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Tag size={13} color="var(--primary)" /> Select Skill & Experience Years *
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.1fr auto', gap: '0.35rem', alignItems: 'center' }}>
                        <select
                          className="form-input"
                          style={{ width: '100%', padding: '0.35rem 0.45rem', fontSize: '0.75rem' }}
                          value={selectedSkillCategory}
                          onChange={(e) => setSelectedSkillCategory(e.target.value)}
                        >
                          {AVAILABLE_SKILLS_LIST.map(skill => (
                            <option key={skill} value={skill} style={{ background: '#111827' }}>{skill}</option>
                          ))}
                        </select>

                        <select
                          className="form-input"
                          style={{ width: '100%', padding: '0.35rem 0.45rem', fontSize: '0.75rem' }}
                          value={selectedSkillYears}
                          onChange={(e) => setSelectedSkillYears(parseInt(e.target.value) || 1)}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20].map(yr => (
                            <option key={yr} value={yr} style={{ background: '#111827' }}>
                              {yr} {yr === 1 ? 'Year' : 'Years'} Exp
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleAddSkill}
                          style={{
                            fontSize: '0.74rem',
                            padding: '0.35rem 0.7rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            whiteSpace: 'nowrap',
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            fontWeight: 600
                          }}
                        >
                          <Plus size={13} /> Add Skill
                        </button>
                      </div>
                    </div>

                    {/* Active Added Skills List Chips */}
                    <div style={{
                      background: 'rgba(5, 10, 20, 0.4)',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      minHeight: '44px',
                      maxHeight: '85px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.35rem',
                      alignItems: 'center'
                    }}>
                      {skillsItems.length === 0 ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          No skills added yet. Select a skill above and click "+ Add Skill".
                        </span>
                      ) : (
                        skillsItems.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '6px',
                              padding: '0.2rem 0.5rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.74rem',
                              color: 'var(--text-heading)'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#34d399' }}>{item.skill}</span>
                            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.05rem 0.3rem', borderRadius: '4px', fontSize: '0.68rem', color: '#94a3b8' }}>
                              {item.years} {item.years === 1 ? 'yr' : 'yrs'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#f87171',
                                cursor: 'pointer',
                                padding: '0 2px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Remove skill"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.12rem' }}>Work Experience Description *</label>
                      <textarea
                        rows={2}
                        className="form-input"
                        style={{ width: '100%', padding: '0.35rem 0.55rem', fontSize: '0.76rem', resize: 'none' }}
                        value={verifForm.experienceDescription}
                        onChange={(e) => setVerifForm({ ...verifForm, experienceDescription: e.target.value })}
                        placeholder="Technical background, brands handled, major troubleshooting capabilities..."
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.12rem' }}>Previous Employer / Company</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '100%', padding: '0.35rem 0.55rem', fontSize: '0.76rem' }}
                        value={verifForm.previousEmployer}
                        onChange={(e) => setVerifForm({ ...verifForm, previousEmployer: e.target.value })}
                        placeholder="e.g. Walton Service Center / Self-employed"
                      />
                    </div>
                  </div>

                  {/* Right Column: Optional Certs & Proof Photos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.15rem' }}>Training Certificate (Optional)</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.74rem' }}
                          value={verifForm.experienceCertPhoto ? (verifForm.experienceCertPhoto.substring(0, 30) + '...') : ''}
                          onChange={(e) => setVerifForm({ ...verifForm, experienceCertPhoto: e.target.value })}
                          placeholder="Certificate URL or upload..."
                        />
                        <label className="btn btn-secondary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.55rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UploadCloud size={11} /> Upload
                          <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => handleLocalPhotoUpload(e, 'experienceCertPhoto')} />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '0.15rem' }}>Work Site Photo / Proof (Optional)</label>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.74rem' }}
                          value={verifForm.workProofPhoto ? (verifForm.workProofPhoto.substring(0, 30) + '...') : ''}
                          onChange={(e) => setVerifForm({ ...verifForm, workProofPhoto: e.target.value })}
                          placeholder="Work site photo or upload..."
                        />
                        <label className="btn btn-secondary" style={{ fontSize: '0.68rem', padding: '0.3rem 0.55rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UploadCloud size={11} /> Upload
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLocalPhotoUpload(e, 'workProofPhoto')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setVerifStep(2)}>← Back</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', fontWeight: 600 }} onClick={() => setVerifStep(4)}>Next: Payout Setup →</button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: PAYOUT SETUP ================= */}
            {verifStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)', fontSize: '0.74rem', color: '#e9d5ff' }}>
                  💳 SkillVerse pays technicians 95% of job revenue directly to your mobile wallet or bank account.
                </div>

                <div className="modal-two-col">
                  {/* Left: Channel Selector */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Preferred Payout Channel *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
                      {['bKash', 'Nagad', 'Rocket', 'Bank'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setVerifForm({ ...verifForm, payoutMethod: m })}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: verifForm.payoutMethod === m ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            background: verifForm.payoutMethod === m ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                            color: verifForm.payoutMethod === m ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Account details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.15rem' }}>
                        {verifForm.payoutMethod === 'Bank' ? 'Bank Account Number *' : `${verifForm.payoutMethod} Mobile Number *`}
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.38rem 0.55rem', fontSize: '0.78rem', fontFamily: 'monospace' }}
                        value={verifForm.payoutAccount}
                        onChange={(e) => setVerifForm({ ...verifForm, payoutAccount: e.target.value })}
                        placeholder={verifForm.payoutMethod === 'Bank' ? 'e.g. 2050123456789' : '01711223344'}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.15rem' }}>Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '0.38rem 0.55rem', fontSize: '0.78rem' }}
                        value={verifForm.payoutAccountHolder}
                        onChange={(e) => setVerifForm({ ...verifForm, payoutAccountHolder: e.target.value })}
                        placeholder="e.g. Kamrul Islam"
                      />
                    </div>

                    {verifForm.payoutMethod === 'Bank' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.1rem' }}>Bank Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '100%', padding: '0.35rem 0.45rem', fontSize: '0.74rem' }}
                            value={verifForm.payoutBankName}
                            onChange={(e) => setVerifForm({ ...verifForm, payoutBankName: e.target.value })}
                            placeholder="DBBL"
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.1rem' }}>Branch Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '100%', padding: '0.35rem 0.45rem', fontSize: '0.74rem' }}
                            value={verifForm.payoutBankBranch}
                            onChange={(e) => setVerifForm({ ...verifForm, payoutBankBranch: e.target.value })}
                            placeholder="Uttara"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setVerifStep(3)}>← Back</button>
                  <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', fontWeight: 600 }} onClick={() => setVerifStep(5)}>Next: Review & Submit →</button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
            {verifStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--primary)', margin: '0 0 0.2rem 0', fontWeight: 700 }}>📋 Verification Dossier Summary</h4>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Please review your identity and address details before submitting for Admin approval.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem', fontSize: '0.78rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>LEGAL NAME & NID</span>
                    <strong style={{ color: 'var(--text-heading)' }}>{verifForm.fullName}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.1rem' }}>NID: {verifForm.nidNumber} | Phone: {verifForm.phone} ({phoneOtpVerified || verifForm.phoneVerified ? '✔ Verified' : '⚠️ Unverified'})</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>LOCATION & DISPATCH BASE</span>
                    <strong style={{ color: '#10b981' }}>{verifForm.serviceArea || `${verifForm.cityArea}, ${verifForm.district}`}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.1rem' }}>{verifForm.cityArea}, {verifForm.district}, {verifForm.division} - {verifForm.postalCode}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--border-color)', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SELECTED SKILLS & EXP</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 'bold' }}>Max Experience: {verifForm.experienceYears} Years</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                      {skillsItems.map((sk, idx) => (
                        <span key={idx} className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                          {sk.skill} ({sk.years} yrs)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  🔒 <strong>Technician Safety Code:</strong> By submitting this verification dossier, you agree to SkillVerse Home Service Standards, background compliance, and authentic document submission.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setVerifStep(4)}>← Back</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 1.4rem', fontSize: '0.82rem', fontWeight: 600, background: 'linear-gradient(90deg, #10b981, #059669)' }}
                    onClick={handleSubmitVerification}
                  >
                    🚀 Submit Verification Dossier →
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- REUSABLE LOCATION PICKER MODAL --- */}
      <LocationPickerModal
        isOpen={showLocationPickerModal}
        onClose={() => setShowLocationPickerModal(false)}
        initialLat={verifForm.latitude || 23.8720}
        initialLon={verifForm.longitude || 90.3810}
        initialAddress={verifForm.serviceArea || verifForm.presentAddress}
        title="Set Technician Service Location"
        description="Pin the central base where you provide services. Nearby customers within your radius will match with you."
        onConfirm={(loc) => {
          handleConfirmLocationPicker(loc);
          if (isWorkerApproved) {
            handleQuickUpdateLocation(loc);
          }
        }}
      />

    </div>
  );
}
