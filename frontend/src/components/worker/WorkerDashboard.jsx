import React, { useState, useEffect } from 'react';
import {
  Wrench, CheckCircle2, Clock, DollarSign, ArrowUpRight, TrendingUp,
  AlertCircle, ShieldCheck, MapPin, Phone, User, Play, Sparkles, Navigation,
  KeyRound, RefreshCw, Layers, ArrowDownRight, Wallet, Award, XCircle,
  Eye, CheckCheck, Star, Camera, FileText, Send, Filter, Search, RotateCcw,
  ShieldAlert, FileCheck, Check, UploadCloud, ChevronRight, HelpCircle, AlertTriangle
} from 'lucide-react';
import WorkerBookingDetailsModal from './WorkerBookingDetailsModal';

const API_BASE = "http://localhost:8081/api";

export default function WorkerDashboard({ currentWorker, onShowToast }) {
  const [activeSubTab, setActiveSubTab] = useState('active-job'); // 'active-job', 'requests', 'problems', 'wallet', 'history', 'verification'
  const [workerBookings, setWorkerBookings] = useState([]);
  const [problemPosts, setProblemPosts] = useState([]);
  const [myProblemOffers, setMyProblemOffers] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Verification State
  const [verifDossier, setVerifDossier] = useState(null);
  const [showVerifModal, setShowVerifModal] = useState(false);
  const [verifStep, setVerifStep] = useState(1); // 1: Personal, 2: Address, 3: Professional, 4: Payout, 5: Review

  // Phone OTP Verification Simulator state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpSimulatedCode, setPhoneOtpSimulatedCode] = useState('');
  const [phoneOtpInput, setPhoneOtpInput] = useState('');
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);

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
    skills: 'AC Repair, Electrical, Plumbing',
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
  }, [workerId]);

  const fetchWorkerData = async () => {
    setLoading(true);
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
    ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED'].includes(b.status)
  );
  const hasActiveJob = !!activeJob;

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
      if (res.ok) {
        const data = await res.json();
        setPhoneOtpSent(true);
        setPhoneOtpSimulatedCode(data.simulatedOtp || '1234');
        if (onShowToast) onShowToast("OTP Dispatched", `SMS OTP simulated: ${data.simulatedOtp}`, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtpInput) return;
    try {
      const res = await fetch(`${API_BASE}/verification/verify-phone-otp?phone=${encodeURIComponent(verifForm.phone)}&otp=${phoneOtpInput}`, { method: 'POST' });
      if (res.ok) {
        setPhoneOtpVerified(true);
        setVerifForm(prev => ({ ...prev, phoneVerified: true }));
        if (onShowToast) onShowToast("Phone Verified", "Your phone number is successfully OTP verified.", "success");
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Invalid OTP", err.error || "Incorrect OTP code", "error");
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
    try {
      const res = await fetch(`${API_BASE}/bookings/${bId}/accept-price?acceptedBy=WORKER`, { method: 'PUT' });
      if (res.ok) {
        fetchWorkerData();
        setActiveSubTab('active-job');
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
      const res = await fetch(`${API_BASE}/bookings/${bId}/cancel?reason=WorkerDeclined`, { method: 'PUT' });
      if (res.ok) {
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
    if (!withdrawAmount) return;
    try {
      const res = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerId,
          amount: parseFloat(withdrawAmount),
          method: withdrawMethod,
          accountNo: withdrawAccount
        })
      });

      if (res.ok) {
        if (onShowToast) onShowToast("Withdrawal Requested", `৳${withdrawAmount} withdrawal to ${withdrawMethod} processed successfully.`, "success");
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawAccount('');
        fetchWorkerData();
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Withdrawal Failed", err.error || "Insufficient funds", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingRequests = workerBookings.filter(b => b.status === 'PENDING' || b.status === 'NEGOTIATING');
  const completedBookings = workerBookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID');

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
              alt={currentWorker?.name}
              style={{ width: 62, height: 62, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
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
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>{currentWorker?.name || 'Technician'}</h2>
              
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
              Specialization: <strong style={{ color: '#ffffff' }}>{verifForm.skills || 'AC Repair, Electrical, Plumbing'}</strong> • <strong>{verifForm.experienceYears || 3}+ Years Exp</strong>
            </p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
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

      {/* --- SUBTABS NAVIGATION --- */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveSubTab('active-job')}
          className={`btn ${activeSubTab === 'active-job' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          ⚡ Current Active Job {hasActiveJob ? '🔴' : ''}
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`btn ${activeSubTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          📥 Direct Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('problems')}
          className={`btn ${activeSubTab === 'problems' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          📢 Problem Posts Marketplace ({problemPosts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('wallet')}
          className={`btn ${activeSubTab === 'wallet' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          💰 Wallet & Earnings
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`btn ${activeSubTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          📜 Completed Jobs & Reviews ({completedBookings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('verification')}
          className={`btn ${activeSubTab === 'verification' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap', border: !isWorkerApproved ? '1px solid rgba(245, 158, 11, 0.4)' : undefined }}
        >
          🛡️ ID & Verification Profile {!isWorkerApproved ? '⚠️' : '✔'}
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
                  <h2 style={{ fontSize: '1.8rem', color: '#ffffff', margin: '0.4rem 0 0.2rem 0' }}>{activeJob.serviceType}</h2>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.75rem' }}>
                  {[
                    { key: 'CONFIRMED', label: '1. Confirmed', icon: CheckCircle2, done: true },
                    { key: 'ON_THE_WAY', label: '2. On The Way', icon: Navigation, done: ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED', 'COMPLETED', 'PAID'].includes(activeJob.status) },
                    { key: 'ARRIVED', label: '3. Arrived', icon: MapPin, done: ['ARRIVED', 'IN_PROGRESS', 'COMPLETION_REQUESTED', 'COMPLETED', 'PAID'].includes(activeJob.status) },
                    { key: 'IN_PROGRESS', label: '4. In Progress (OTP)', icon: Wrench, done: ['IN_PROGRESS', 'COMPLETION_REQUESTED', 'COMPLETED', 'PAID'].includes(activeJob.status) },
                    { key: 'COMPLETION_REQUESTED', label: '5. Verify Finish', icon: KeyRound, done: ['COMPLETION_REQUESTED', 'COMPLETED', 'PAID'].includes(activeJob.status) },
                    { key: 'COMPLETED', label: '6. Payment Settled', icon: DollarSign, done: ['COMPLETED', 'PAID'].includes(activeJob.status) }
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
                  <strong style={{ fontSize: '1rem', color: '#ffffff', display: 'block' }}>{activeJob.customer?.name}</strong>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Phone: <strong style={{ color: '#ffffff' }}>{activeJob.customer?.phone || '01811223344'}</strong>
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>SERVICE ADDRESS & TIME</span>
                  <strong style={{ color: '#ffffff', display: 'block' }}>{activeJob.address}</strong>
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
                      <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>Stage 1: Ready to Depart</h4>
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
                      <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>Stage 2: Traveling to Customer</h4>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#22d3ee', margin: 0 }}>Stage 4: Work In Progress</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                          Carry out inspection and repairs. When complete, request completion to generate customer code.
                        </p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem', background: 'linear-gradient(90deg, #10b981, #059669)' }} onClick={() => handleRequestCompletion(activeJob.id)}>
                        ✔ Request Job Completion
                      </button>
                    </div>
                  </div>
                )}

                {activeJob.status === 'COMPLETION_REQUESTED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', margin: 0 }}>Stage 5: Verify Completion OTP</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        Completion requested! Customer was provided their 4-digit Completion Code. Enter it below:
                      </p>
                    </div>

                    <form onSubmit={handleVerifyCompletionOtp} style={{ display: 'flex', gap: '0.8rem', maxWidth: '400px' }}>
                      <input
                        type="text"
                        maxLength="4"
                        required
                        autoFocus
                        className="form-input"
                        style={{ flex: 1, padding: '0.8rem', fontSize: '1.3rem', fontWeight: 'bold', textAlign: 'center', letterSpacing: '0.3rem', fontFamily: 'monospace' }}
                        placeholder="0000"
                        value={completionOtpInput}
                        onChange={(e) => setCompletionOtpInput(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.4rem' }}>
                        Confirm Finish ✔
                      </button>
                    </form>
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
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>No Active Job In Progress</h3>
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
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>Incoming Direct Customer Requests</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Method 1: Direct Technician Booking</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.map((b) => {
              const isCustomerOffer = b.status === 'PENDING' || (b.status === 'NEGOTIATING' && (b.lastOfferedBy === 'CUSTOMER' || !b.lastOfferedBy));
              const isWorkerCounter = b.status === 'NEGOTIATING' && b.lastOfferedBy === 'WORKER';
              const currentPrice = b.agreedCost || b.workerCounterPrice || b.customerOfferPrice || b.estimatedCost;

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
                    border: isCustomerOffer ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                    background: isCustomerOffer ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  {/* Column 1: ID & Status */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block' }}>#BK-{b.id}</span>
                    <span className="badge badge-pending" style={{ marginTop: '0.3rem' }}>{b.status}</span>
                  </div>

                  {/* Column 2: Service & Problem */}
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#ffffff', display: 'block' }}>{b.serviceType}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                      {b.description?.length > 50 ? `${b.description.slice(0, 50)}...` : b.description}
                    </p>
                  </div>

                  {/* Column 3: Customer info */}
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block' }}>{b.customer?.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {b.address}</span>
                  </div>

                  {/* Column 4: Offered Price */}
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Offered Price</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>৳{currentPrice}</strong>
                  </div>

                  {/* Column 5: Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                    {isCustomerOffer && (
                      <>
                        <button
                          className="btn btn-primary"
                          disabled={hasActiveJob || !isWorkerApproved}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            opacity: (!isWorkerApproved || hasActiveJob) ? 0.6 : 1,
                            cursor: (!isWorkerApproved || hasActiveJob) ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleAcceptBooking(b.id)}
                          title={!isWorkerApproved ? 'Verification approval required' : hasActiveJob ? 'Finish current job first' : 'Accept offered price'}
                        >
                          <CheckCircle2 size={13} /> Accept {!isWorkerApproved && '🔒'}
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
                      <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.75rem' }}>
                        Waiting Customer (৳{currentPrice})
                      </span>
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
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>Customer Problem Posts (Method 2)</h3>
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

                    <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0.6rem 0 0.3rem 0' }}>{p.title}</h4>
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
                    style={{
                      padding: '0.65rem',
                      fontSize: '0.85rem',
                      justifyContent: 'center',
                      opacity: !isWorkerApproved ? 0.7 : 1
                    }}
                    onClick={() => {
                      if (!isWorkerApproved) {
                        if (onShowToast) onShowToast("Verification Required", "You must be approved to submit problem quotes.", "warning");
                        setShowVerifModal(true);
                        return;
                      }
                      setSelectedProblem(p);
                      setOfferPrice(myOffer ? myOffer.proposedPrice.toString() : p.budgetPrice?.toString() || '1000');
                      setOfferMessage(myOffer ? myOffer.message : '');
                      setShowProblemOfferModal(true);
                    }}
                  >
                    <Send size={14} /> {!isWorkerApproved ? 'Submit Quote (🔒 Approval Required)' : myOffer ? 'Update Quote ৳' : 'Submit Price Quote →'}
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
              <h3 style={{ fontSize: '2rem', color: '#ffffff', margin: '0.3rem 0 0 0' }}>৳{wallet?.totalEarnings || 0}</h3>
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
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Wallet Transactions Ledger</h3>
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
                      <strong style={{ color: '#ffffff', display: 'block' }}>{tx.description}</strong>
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
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>Completed Service History & Customer Ratings</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {completedBookings.map((b) => (
              <div
                key={b.id}
                className="glass-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '1.2rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{b.serviceType}</strong>
                    <span className="badge badge-verified">Completed</span>
                    {b.paymentStatus === 'PAID' && <span className="badge badge-gold">Paid ({b.paymentMethod || 'bKash'})</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', marginBottom: 0 }}>
                    Customer: <strong>{b.customer?.name}</strong> • Final Price: <strong>৳{b.agreedCost || b.estimatedCost}</strong> • 
                    Net Earning: <strong style={{ color: 'var(--primary)' }}>৳{b.workerNetEarning || (b.agreedCost ? Math.round(b.agreedCost * 0.95) : 0)}</strong>
                  </p>
                  {b.reviewRating && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                      ⭐ {b.reviewRating}/5: <em>"{b.reviewComment || 'Great service!'}"</em>
                    </div>
                  )}
                </div>

                <button className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }} onClick={() => handleOpenDetails(b)}>
                  <Eye size={14} /> Full Record
                </button>
              </div>
            ))}

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
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>Technician Verification Dossier</h3>
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
                <p style={{ fontSize: '0.85rem', color: '#ffffff', marginTop: '0.3rem', marginBottom: 0 }}>
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
                <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0 }}>1. Personal & Identity</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Full Legal Name:</span>
                  <strong style={{ color: '#ffffff' }}>{verifForm.fullName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date of Birth:</span>
                  <strong style={{ color: '#ffffff' }}>{verifForm.dateOfBirth}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                  <strong style={{ color: '#ffffff' }}>{verifForm.phone} {phoneOtpVerified || verifForm.phoneVerified ? '✔ (OTP Verified)' : '⚠️ (Unverified)'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>NID Number:</span>
                  <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{verifForm.nidNumber}</strong>
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
                <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0 }}>2. Address Verification</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PRESENT / CURRENT ADDRESS:</span>
                  <strong style={{ color: '#ffffff', display: 'block', marginTop: '0.1rem' }}>{verifForm.presentAddress}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{verifForm.cityArea}, {verifForm.district}, {verifForm.division} - {verifForm.postalCode}</span>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PERMANENT / HOME ADDRESS:</span>
                  <strong style={{ color: '#ffffff', display: 'block', marginTop: '0.1rem' }}>{verifForm.permanentAddress}</strong>
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
                <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0 }}>3. Professional Skills</h4>
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
                    <strong style={{ color: '#ffffff' }}>{verifForm.previousEmployer}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Payout Method */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Wallet size={18} color="#a855f7" />
                <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0 }}>4. Payout Information</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payout Channel:</span>
                  <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>{verifForm.payoutMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Account / Phone No:</span>
                  <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{verifForm.payoutAccount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Account Holder Name:</span>
                  <strong style={{ color: '#ffffff' }}>{verifForm.payoutAccountHolder}</strong>
                </div>
                {verifForm.payoutMethod === 'Bank' && verifForm.payoutBankName && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Bank & Branch:</span>
                    <strong style={{ color: '#ffffff' }}>{verifForm.payoutBankName} ({verifForm.payoutBankBranch})</strong>
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
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Propose Counter Price</h3>
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
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Enter Start OTP</h3>
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
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Enter Completion OTP</h3>
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
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Submit Quote for Problem</h3>
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

      {/* --- WITHDRAWAL MODAL --- */}
      {showWithdrawModal && (
        <div className="toast-popup-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(5, 10, 20, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowWithdrawModal(false)}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-secondary)', padding: '1.8rem', borderRadius: '18px', border: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Wallet size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Withdraw Wallet Earnings</h3>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Balance:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>৳{wallet?.balance || 0}</strong>
            </div>

            <form onSubmit={handleWithdrawal}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Withdraw Amount (৳)</label>
                <input
                  type="number"
                  min="50"
                  max={wallet?.balance || 100000}
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                  placeholder="e.g. 1000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Withdrawal Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                >
                  <option value="bKash" style={{ background: '#111827' }}>bKash</option>
                  <option value="Nagad" style={{ background: '#111827' }}>Nagad</option>
                  <option value="Rocket" style={{ background: '#111827' }}>Rocket</option>
                  <option value="Bank" style={{ background: '#111827' }}>Bank Transfer</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account / Mobile Number</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.7rem' }}
                  placeholder="01911223344"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Withdrawal →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* --- 5-STEP WORKER VERIFICATION WIZARD MODAL --- */}
      {/* ============================================================ */}
      {showVerifModal && (
        <div
          className="toast-popup-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
            background: 'rgba(5, 10, 20, 0.88)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            overflowY: 'auto'
          }}
          onClick={(e) => e.target.className.includes('toast-popup-overlay') && setShowVerifModal(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '750px', width: '100%', maxHeight: '92vh', overflowY: 'auto',
              background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '22px',
              border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.4rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>Technician Verification Dossier</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Step {verifStep} of 5: {verifStep === 1 ? 'Personal & NID' : verifStep === 2 ? 'Address Details' : verifStep === 3 ? 'Professional Experience' : verifStep === 4 ? 'Payout Setup' : 'Review & Submit'}</span>
                </div>
              </div>

              <button onClick={() => setShowVerifModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
              {[
                { s: 1, label: '1. Identity' },
                { s: 2, label: '2. Address' },
                { s: 3, label: '3. Professional' },
                { s: 4, label: '4. Payout' },
                { s: 5, label: '5. Review' }
              ].map((stepItem) => (
                <div
                  key={stepItem.s}
                  onClick={() => setVerifStep(stepItem.s)}
                  style={{
                    padding: '0.5rem 0.2rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)', fontSize: '0.8rem', color: '#bae6fd' }}>
                  ℹ️ Provide your official National ID (NID) and identity photo. Your phone number must be verified via SMS OTP simulator.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Legal Name (as per NID) *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.fullName}
                      onChange={(e) => setVerifForm({ ...verifForm, fullName: e.target.value })}
                      placeholder="e.g. Kamrul Islam"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date of Birth *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.dateOfBirth}
                      onChange={(e) => setVerifForm({ ...verifForm, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone & OTP Simulator */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Phone Number & Verification *</label>
                    {phoneOtpVerified || verifForm.phoneVerified ? (
                      <span className="badge badge-verified" style={{ fontSize: '0.75rem' }}>✔ Phone OTP Verified</span>
                    ) : (
                      <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>⚠️ Verification Pending</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <input
                      type="text"
                      required
                      className="form-input"
                      style={{ flex: 1, padding: '0.65rem' }}
                      value={verifForm.phone}
                      onChange={(e) => setVerifForm({ ...verifForm, phone: e.target.value })}
                      placeholder="01711223344"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.65rem 1rem' }}
                      onClick={handleSendPhoneOtp}
                    >
                      {phoneOtpSent ? '🔄 Resend OTP' : '📲 Send OTP Code'}
                    </button>
                  </div>

                  {phoneOtpSent && !phoneOtpVerified && (
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          Simulated SMS Code: <strong style={{ color: 'var(--primary)', letterSpacing: '0.1rem' }}>{phoneOtpSimulatedCode}</strong>
                        </span>
                        <input
                          type="text"
                          maxLength="6"
                          className="form-input"
                          style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem', fontSize: '1rem', letterSpacing: '0.2rem', textAlign: 'center', fontWeight: 'bold' }}
                          placeholder="Enter OTP"
                          value={phoneOtpInput}
                          onChange={(e) => setPhoneOtpInput(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', height: 'fit-content' }}
                        onClick={handleVerifyPhoneOtp}
                      >
                        Verify OTP ✔
                      </button>
                    </div>
                  )}
                </div>

                {/* NID Number */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>National ID (NID) Number *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem', fontFamily: 'monospace' }}
                    value={verifForm.nidNumber}
                    onChange={(e) => setVerifForm({ ...verifForm, nidNumber: e.target.value })}
                    placeholder="10 or 17 digit NID number (e.g. 5928194028)"
                  />
                </div>

                {/* NID Photos & Selfie */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NID Front Image URL</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
                      value={verifForm.nidFrontPhoto}
                      onChange={(e) => setVerifForm({ ...verifForm, nidFrontPhoto: e.target.value })}
                      placeholder="https://..."
                    />
                    <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.3rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => setVerifForm({ ...verifForm, nidFrontPhoto: 'https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600' })}
                      >
                        Sample NID Front
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NID Back Image URL</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
                      value={verifForm.nidBackPhoto}
                      onChange={(e) => setVerifForm({ ...verifForm, nidBackPhoto: e.target.value })}
                      placeholder="https://..."
                    />
                    <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.3rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => setVerifForm({ ...verifForm, nidBackPhoto: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600' })}
                      >
                        Sample NID Back
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recent Profile / Selfie URL</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
                      value={verifForm.profileSelfiePhoto}
                      onChange={(e) => setVerifForm({ ...verifForm, profileSelfiePhoto: e.target.value })}
                      placeholder="https://..."
                    />
                    <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.3rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => setVerifForm({ ...verifForm, profileSelfiePhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=600' })}
                      >
                        Sample Selfie
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.4rem' }}
                    onClick={() => setVerifStep(2)}
                  >
                    Next: Address Details →
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: ADDRESS DETAILS ================= */}
            {verifStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem', color: '#93c5fd' }}>
                  📍 Accurate present and permanent addresses are required for local dispatch safety and police verification records.
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Present / Current Living Address *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem' }}
                    value={verifForm.presentAddress}
                    onChange={(e) => setVerifForm({ ...verifForm, presentAddress: e.target.value })}
                    placeholder="House 14, Road 4, Sector 12, Uttara"
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Permanent / Home Address *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem' }}
                    value={verifForm.permanentAddress}
                    onChange={(e) => setVerifForm({ ...verifForm, permanentAddress: e.target.value })}
                    placeholder="Vill: Rasulpur, P.O: Bancharampur, Brahmanbaria"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Division *</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.division}
                      onChange={(e) => setVerifForm({ ...verifForm, division: e.target.value })}
                    >
                      {['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'].map(d => (
                        <option key={d} value={d} style={{ background: '#111827' }}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>District *</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.district}
                      onChange={(e) => setVerifForm({ ...verifForm, district: e.target.value })}
                      placeholder="Dhaka"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>City / Area *</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.cityArea}
                      onChange={(e) => setVerifForm({ ...verifForm, cityArea: e.target.value })}
                      placeholder="Uttara / Mirpur"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Postal Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.postalCode}
                      onChange={(e) => setVerifForm({ ...verifForm, postalCode: e.target.value })}
                      placeholder="1230"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detailed Landmark & Area Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem' }}
                    value={verifForm.detailedAddress}
                    onChange={(e) => setVerifForm({ ...verifForm, detailedAddress: e.target.value })}
                    placeholder="Near Milestone College, 3rd floor apartment..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setVerifStep(1)}>← Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => setVerifStep(3)}>Next: Professional Experience →</button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: PROFESSIONAL INFO ================= */}
            {verifStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.8rem', color: '#fde68a' }}>
                  💡 Training certificates are <strong>optional</strong> because seasoned field technicians may rely on hands-on field experience.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skills & Services Provided (comma separated) *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.skills}
                      onChange={(e) => setVerifForm({ ...verifForm, skills: e.target.value })}
                      placeholder="AC Repair, Electrical, Plumbing, Generator Maintenance"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Years of Experience *</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.experienceYears}
                      onChange={(e) => setVerifForm({ ...verifForm, experienceYears: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Work Experience Description *</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem' }}
                    value={verifForm.experienceDescription}
                    onChange={(e) => setVerifForm({ ...verifForm, experienceDescription: e.target.value })}
                    placeholder="Describe your technical background, brands handled, major troubleshooting capabilities..."
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Previous Employer / Company (if applicable)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem' }}
                    value={verifForm.previousEmployer}
                    onChange={(e) => setVerifForm({ ...verifForm, previousEmployer: e.target.value })}
                    placeholder="e.g. Walton Service Center / Self-employed contractor"
                  />
                </div>

                {/* Optional Certificates / Documents */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Experience / Training Cert (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
                      value={verifForm.experienceCertPhoto}
                      onChange={(e) => setVerifForm({ ...verifForm, experienceCertPhoto: e.target.value })}
                      placeholder="Certificate URL (optional)"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Previous Work Photo / Proof (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
                      value={verifForm.workProofPhoto}
                      onChange={(e) => setVerifForm({ ...verifForm, workProofPhoto: e.target.value })}
                      placeholder="Work site photo URL (optional)"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setVerifStep(2)}>← Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => setVerifStep(4)}>Next: Payout Setup →</button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: PAYOUT SETUP ================= */}
            {verifStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.2)', fontSize: '0.8rem', color: '#e9d5ff' }}>
                  💳 SkillVerse pays technicians 95% of job revenue directly to your chosen mobile wallet or bank account.
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preferred Payout Channel *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginTop: '0.3rem' }}>
                    {['bKash', 'Nagad', 'Rocket', 'Bank'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setVerifForm({ ...verifForm, payoutMethod: m })}
                        style={{
                          padding: '0.7rem',
                          borderRadius: '10px',
                          border: verifForm.payoutMethod === m ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: verifForm.payoutMethod === m ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                          color: verifForm.payoutMethod === m ? 'var(--primary)' : 'var(--text-secondary)',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {verifForm.payoutMethod === 'Bank' ? 'Bank Account Number *' : `${verifForm.payoutMethod} Wallet Number *`}
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem', fontFamily: 'monospace' }}
                      value={verifForm.payoutAccount}
                      onChange={(e) => setVerifForm({ ...verifForm, payoutAccount: e.target.value })}
                      placeholder={verifForm.payoutMethod === 'Bank' ? 'e.g. 2050123456789' : '01711223344'}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      style={{ width: '100%', padding: '0.65rem' }}
                      value={verifForm.payoutAccountHolder}
                      onChange={(e) => setVerifForm({ ...verifForm, payoutAccountHolder: e.target.value })}
                      placeholder="e.g. Kamrul Islam"
                    />
                  </div>
                </div>

                {verifForm.payoutMethod === 'Bank' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bank Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '100%', padding: '0.65rem' }}
                        value={verifForm.payoutBankName}
                        onChange={(e) => setVerifForm({ ...verifForm, payoutBankName: e.target.value })}
                        placeholder="e.g. Dutch-Bangla Bank"
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Branch Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: '100%', padding: '0.65rem' }}
                        value={verifForm.payoutBankBranch}
                        onChange={(e) => setVerifForm({ ...verifForm, payoutBankBranch: e.target.value })}
                        placeholder="e.g. Uttara Branch"
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setVerifStep(3)}>← Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => setVerifStep(5)}>Next: Review & Submit →</button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
            {verifStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', margin: '0 0 0.4rem 0' }}>📋 Verification Dossier Summary</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Please review your identity and address details before submitting for Admin approval.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>LEGAL NAME & NID</span>
                    <strong style={{ color: '#ffffff' }}>{verifForm.fullName}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>NID: {verifForm.nidNumber} • DOB: {verifForm.dateOfBirth}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PHONE & OTP STATUS</span>
                    <strong style={{ color: '#ffffff' }}>{verifForm.phone}</strong>
                    <div style={{ color: phoneOtpVerified || verifForm.phoneVerified ? '#34d399' : '#f59e0b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      {phoneOtpVerified || verifForm.phoneVerified ? '✔ Phone Verified' : '⚠️ OTP Not Verified'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PRESENT ADDRESS</span>
                    <strong style={{ color: '#ffffff' }}>{verifForm.presentAddress}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{verifForm.cityArea}, {verifForm.division}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PAYOUT METHOD</span>
                    <strong style={{ color: '#ffffff' }}>{verifForm.payoutMethod}: {verifForm.payoutAccount}</strong>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Holder: {verifForm.payoutAccountHolder}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🔒 <strong>Technician Safety Code:</strong> By submitting this verification dossier, you agree to SkillVerse Home Service Standards, zero-tolerance background compliance, and authentic document submission.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setVerifStep(4)}>← Back</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.7rem 1.6rem', fontSize: '0.9rem', background: 'linear-gradient(90deg, #10b981, #059669)' }}
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

    </div>
  );
}
