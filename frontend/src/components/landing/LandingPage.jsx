import React from 'react';
import {
  ShieldCheck,
  Wrench,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  ShoppingBag,
  Star,
  Users,
  Compass,
  PhoneCall,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Zap,
  DollarSign
} from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  const serviceCategories = [
    { title: 'AC & HVAC Servicing', desc: 'Gas charging, jet wash, compressor & PCB repair', icon: '❄️', count: '45+ Pros' },
    { title: 'Electrical & House Wiring', desc: 'Short circuit fix, DB board, switchgear & earthing', icon: '⚡', count: '60+ Pros' },
    { title: 'Plumbing & Concealed Pipe', desc: 'Water leak detection, sanitary, pump & bathroom fittings', icon: '🔧', count: '38+ Pros' },
    { title: 'Refrigerator & Freezers', desc: 'Thermostat, gas refill, cooling coil & inverter PCB', icon: '🧊', count: '32+ Pros' },
    { title: 'Washing Machines & Dryers', desc: 'Drum replacement, drain pump, motor & belt fix', icon: '🌀', count: '25+ Pros' },
    { title: 'Solar & Backup Inverters', desc: 'Solar panel installation, IPS inverter & battery maintenance', icon: '☀️', count: '20+ Pros' },
  ];

  const features = [
    {
      icon: <ShieldCheck size={28} color="#10b981" />,
      title: '100% NID & Biometric Verified',
      desc: 'Every technician undergoes rigorous national identity verification, criminal background audit, and professional skill testing before joining.'
    },
    {
      icon: <Lock size={28} color="#3b82f6" />,
      title: 'Dual OTP Safety Protocol',
      desc: 'Unique Start OTP and Completion OTP ensure technicians can only enter and finish jobs with your explicit real-time authorization.'
    },
    {
      icon: <Compass size={28} color="#8b5cf6" />,
      title: 'Real-Time GPS Radius Match',
      desc: 'Instant Haversine GPS matching finds certified technicians near you with transparent arrival tracking on interactive maps.'
    },
    {
      icon: <Zap size={28} color="#f59e0b" />,
      title: 'Competitive Direct Bidding',
      desc: 'Post your repair issue with photos and get competitive price quotes from top-rated professionals within minutes.'
    },
    {
      icon: <GraduationCap size={28} color="#06b6d4" />,
      title: 'SkillVerse Academy',
      desc: 'Hands-on practical training courses and certifications that empower local technical youth into master service technicians.'
    },
    {
      icon: <ShoppingBag size={28} color="#ec4899" />,
      title: 'Pro Tool Store & Equipment',
      desc: 'Direct access to genuine diagnostic tools, multi-meters, HVAC manifolds, and spare parts with platform warranty.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Choose Service or Post Problem',
      desc: 'Select a verified technician nearby on the GPS map or post your repair problem with photos and your target budget.'
    },
    {
      num: '02',
      title: 'Agree on Fair Price',
      desc: 'Transparent pricing with zero hidden fees. Accept a direct quote or negotiate through our fair bidding pipeline.'
    },
    {
      num: '03',
      title: 'Verify Arrival & Start OTP',
      desc: 'Track technician on live map. Check their photo ID at your door and share your 4-digit Start OTP to begin.'
    },
    {
      num: '04',
      title: 'Inspect & Settle Securely',
      desc: 'Once work is verified, share the Completion OTP and pay via bKash, Nagad, Card, or Cash backed by our 30-day warranty.'
    }
  ];

  return (
    <div className="landing-page-wrapper">
      {/* 1. HERO BANNER */}
      <section className="landing-hero-section">
        <div className="landing-container">
          <div className="landing-hero-badge">
            <Sparkles size={15} color="#10b981" />
            <span>AI-Powered Verified Skills Marketplace & Service Ecosystem</span>
          </div>

          <h1 className="landing-hero-title">
            Empowering Verified Skills.<br />
            <span className="gradient-text">Delivering Reliable Home Services.</span>
          </h1>

          <p className="landing-hero-desc">
            Connect directly with police & NID-verified electricians, HVAC specialists, plumbers, and home repair professionals in Bangladesh. Live GPS tracking, Dual OTP safety, transparent bidding, and a 30-day service guarantee.
          </p>

          <div className="landing-hero-cta-row">
            <button
              className="btn btn-primary btn-hero-primary"
              onClick={() => onOpenAuth('signup', 'CUSTOMER')}
            >
              <Wrench size={18} /> Book a Verified Service <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary btn-hero-secondary"
              onClick={() => onOpenAuth('signup', 'WORKER')}
            >
              <Users size={18} /> Join as a Service Pro
            </button>
            <button
              className="btn btn-secondary btn-hero-secondary"
              onClick={() => onOpenAuth('login', 'CUSTOMER')}
            >
              <Lock size={16} /> Sign In
            </button>
          </div>

          {/* Stats Badges */}
          <div className="landing-stats-grid">
            <div className="landing-stat-card glass-card">
              <strong className="stat-number">15,000+</strong>
              <span className="stat-label">Verified Jobs Done</span>
            </div>
            <div className="landing-stat-card glass-card">
              <strong className="stat-number">4.9 / 5.0</strong>
              <span className="stat-label">★ Customer Satisfaction</span>
            </div>
            <div className="landing-stat-card glass-card">
              <strong className="stat-number">100%</strong>
              <span className="stat-label">NID & Police Audited</span>
            </div>
            <div className="landing-stat-card glass-card">
              <strong className="stat-number">30 Days</strong>
              <span className="stat-label">Free Service Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE ECOSYSTEM PILLARS */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-tag">Why SkillVerse?</span>
            <h2 className="section-heading">Engineered for Absolute Trust & Quality</h2>
            <p className="section-subtext">
              We eliminated the guesswork, price gouging, and security worries from home technical repairs.
            </p>
          </div>

          <div className="landing-features-grid">
            {features.map((f, i) => (
              <div key={i} className="glass-card feature-box">
                <div className="feature-icon-wrapper">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR SERVICE CATEGORIES */}
      <section className="landing-section landing-section-alt" id="services">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-tag">On-Demand Expertise</span>
            <h2 className="section-heading">Popular Technical Services</h2>
            <p className="section-subtext">
              From emergency electrical fixes to comprehensive HVAC chemical overhauls.
            </p>
          </div>

          <div className="landing-categories-grid">
            {serviceCategories.map((cat, i) => (
              <div
                key={i}
                className="glass-card category-card"
                onClick={() => onOpenAuth('signup', 'CUSTOMER')}
                style={{ cursor: 'pointer' }}
              >
                <div className="category-emoji">{cat.icon}</div>
                <div className="category-content">
                  <h4 className="category-name">{cat.title}</h4>
                  <p className="category-desc">{cat.desc}</p>
                  <span className="category-count">{cat.count} Available</span>
                </div>
                <ChevronRight size={18} color="var(--primary)" className="category-arrow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="landing-section" id="how-it-works">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-tag">Simple & Transparent</span>
            <h2 className="section-heading">How SkillVerse Works</h2>
            <p className="section-subtext">
              Get certified technical assistance at your door in four straightforward steps.
            </p>
          </div>

          <div className="landing-steps-grid">
            {steps.map((st, i) => (
              <div key={i} className="glass-card step-card">
                <div className="step-number-badge">{st.num}</div>
                <h4 className="step-title">{st.title}</h4>
                <p className="step-desc">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ACADEMY & TOOL STORE PREVIEW */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-dual-cards-grid">
            {/* Academy Card */}
            <div className="glass-card promo-card" style={{ borderLeft: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)' }}>
                  <GraduationCap size={28} color="#06b6d4" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff' }}>SkillVerse Academy</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Professional Certification Programs</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Upskill in Inverter AC Diagnostics, Multi-Story House Wiring, Modern Refrigeration, and Industrial Motor Controls. Receive verifiable digital badges upon passing assessments.
              </p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '1rem', width: 'fit-content' }}
                onClick={() => onOpenAuth('signup', 'CUSTOMER')}
              >
                Explore Courses <ArrowRight size={15} />
              </button>
            </div>

            {/* Tool Store Card */}
            <div className="glass-card promo-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)' }}>
                  <ShoppingBag size={28} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff' }}>Pro Equipment & Tool Store</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Authentic Gear with Warranty</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Equip yourself with digital manifold gauges, high-voltage insulation testers, leak detectors, and authentic spare parts with express nationwide delivery.
              </p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '1rem', width: 'fit-content' }}
                onClick={() => onOpenAuth('signup', 'CUSTOMER')}
              >
                Browse Tool Store <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & WARRANTY BANNER */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="glass-card guarantee-card">
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.8rem' }}>
                <CheckCircle2 size={15} /> 100% Peace of Mind
              </div>
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.6rem 0', color: '#ffffff' }}>
                The 30-Day SkillVerse Service Guarantee
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                If any repaired appliance or electrical fitting develops the same issue within 30 days of completion, our team will dispatch a senior master technician for a free re-inspection and resolution.
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
              onClick={() => onOpenAuth('signup', 'CUSTOMER')}
            >
              Get Started Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top-row">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <ShieldCheck size={26} color="#10b981" />
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>SkillVerse</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '340px' }}>
                Bangladesh's premier ecosystem for verified technical professionals, doorstep services, skills development, and equipment.
              </p>
            </div>

            <div className="footer-links-group">
              <span className="footer-links-title">Services</span>
              <a href="#services" onClick={() => onOpenAuth('signup', 'CUSTOMER')}>AC & Cooling</a>
              <a href="#services" onClick={() => onOpenAuth('signup', 'CUSTOMER')}>Electrical Work</a>
              <a href="#services" onClick={() => onOpenAuth('signup', 'CUSTOMER')}>Plumbing & Water</a>
              <a href="#services" onClick={() => onOpenAuth('signup', 'CUSTOMER')}>Appliance Repair</a>
            </div>

            <div className="footer-links-group">
              <span className="footer-links-title">Platform</span>
              <a href="#features">Verified Technicians</a>
              <a href="#how-it-works">Dual OTP Safety</a>
              <a href="#features">Skill Academy</a>
              <a href="#features">Tool Store</a>
            </div>

            <div className="footer-links-group">
              <span className="footer-links-title">Access</span>
              <button className="footer-text-btn" onClick={() => onOpenAuth('login', 'CUSTOMER')}>Customer Login</button>
              <button className="footer-text-btn" onClick={() => onOpenAuth('signup', 'CUSTOMER')}>Create Account</button>
              <button className="footer-text-btn" onClick={() => onOpenAuth('signup', 'WORKER')}>Join as Worker</button>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div>© 2026 SkillVerse Bangladesh. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>24/7 Hotline: +880 1700 000000</span>
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
