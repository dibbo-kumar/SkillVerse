import React, { useState } from 'react';
import { 
  Gift, 
  Award, 
  Tag, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function CustomerRewards({
  rewards = { points: 450, tier: 'Gold Tier Member', referralCode: 'FIX-ANIS-8821' },
  onRedeemVoucher
}) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const vouchers = [
    {
      id: 'vouch-1',
      title: '৳200 Off AC Seasonal Servicing',
      minSpend: 'Min spend ৳1,000',
      pointsCost: 200,
      code: 'COOL200',
      expiry: '30 Oct 2026',
      icon: '❄️'
    },
    {
      id: 'vouch-2',
      title: '৳150 Off Home Plumbing & Pipe Repairs',
      minSpend: 'Min spend ৳750',
      pointsCost: 150,
      code: 'PLUMB150',
      expiry: '15 Nov 2026',
      icon: '🔧'
    },
    {
      id: 'vouch-3',
      title: 'Free Priority Dispatch & Safety Guarantee',
      minSpend: 'Any verified booking',
      pointsCost: 300,
      code: 'PRIORITYVIP',
      expiry: '31 Dec 2026',
      icon: '⚡'
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(rewards.referralCode || 'FIX-ANIS-8821');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="customer-rewards-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <Gift size={24} color="var(--accent-gold)" />
            SkillPoints, Rewards & Referral Hub
          </h2>
          <p className="section-subtitle">
            Earn points on every completed booking, redeem service discounts, and earn ৳250 wallet credit when your friends hire their first technician.
          </p>
        </div>
      </div>

      {/* Top Banner: Points & Tier Progress */}
      <div className="rewards-hero-card glass-card">
        <div className="rewards-hero-left">
          <div className="points-badge-box">
            <Sparkles size={24} color="var(--accent-gold)" />
            <div>
              <span className="points-label">Your Balance</span>
              <div className="points-number">{rewards.points} <span className="points-unit">SkillPoints</span></div>
            </div>
          </div>

          <div className="tier-info-box">
            <div className="tier-title-row">
              <Award size={18} color="var(--accent-gold)" />
              <strong className="tier-name">{rewards.tier}</strong>
              <span className="tier-multiplier">1.25x Points Boost</span>
            </div>
            <p className="tier-desc">
              You are only 150 points away from unlocking <strong>Platinum Tier</strong> (Free Priority Dispatches & Dedicated Support).
            </p>
            <div className="tier-progress-bar">
              <div className="tier-progress-fill" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Referral Card */}
        <div className="referral-box">
          <div className="referral-badge">Invite & Earn ৳250</div>
          <h3 className="referral-title">Refer Friends to FixConnect</h3>
          <p className="referral-subtitle">
            Give your friends <strong>৳150 off</strong> their first service, and you'll receive <strong>৳250 credit</strong> when they complete their first job.
          </p>

          <div className="referral-code-input-group">
            <span className="referral-code-text">{rewards.referralCode || 'FIX-ANIS-8821'}</span>
            <button className="btn btn-primary" onClick={handleCopy} style={{ padding: '0.4rem 0.8rem' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button className="btn btn-secondary share-btn" onClick={() => setShowShareModal(true)}>
            <Share2 size={15} /> Share Invite Link
          </button>
        </div>
      </div>

      {/* Redeemable Discount Vouchers */}
      <div className="vouchers-section">
        <h3 className="section-title">
          <Tag size={20} color="var(--primary)" />
          Available Reward Vouchers
        </h3>

        <div className="vouchers-grid">
          {vouchers.map((vouch) => {
            const canAfford = rewards.points >= vouch.pointsCost;

            return (
              <div key={vouch.id} className="glass-card voucher-card">
                <div className="voucher-icon">{vouch.icon}</div>
                <div className="voucher-content">
                  <h4 className="voucher-title">{vouch.title}</h4>
                  <div className="voucher-terms">{vouch.minSpend} • Valid until {vouch.expiry}</div>
                  <div className="voucher-cost-tag">
                    <Sparkles size={13} color="var(--accent-gold)" /> Cost: {vouch.pointsCost} Points
                  </div>
                </div>

                <button 
                  className={`btn ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={!canAfford}
                  onClick={() => onRedeemVoucher && onRedeemVoucher(vouch)}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', fontSize: '0.85rem' }}
                >
                  {canAfford ? 'Redeem Voucher' : 'Need More Points'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Modal Simulation */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 className="modal-title">
              <Share2 size={20} color="var(--primary)" />
              Share FixConnect Invite
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Share your referral code <strong>{rewards.referralCode}</strong> directly with friends & family in Bangladesh.
            </p>

            <div className="share-channels-list">
              <button 
                className="btn btn-secondary share-channel-btn"
                onClick={() => {
                  window.open(`https://wa.me/?text=Get%20৳150%20off%20verified%20technicians%20in%20Dhaka%20on%20FixConnect!%20Use%20my%20code:%20${rewards.referralCode}`, '_blank');
                  setShowShareModal(false);
                }}
              >
                💬 Share on WhatsApp
              </button>

              <button 
                className="btn btn-secondary share-channel-btn"
                onClick={() => {
                  handleCopy();
                  alert("Invite text and referral code copied to your clipboard!");
                  setShowShareModal(false);
                }}
              >
                📋 Copy SMS Message Text
              </button>

              <button 
                className="btn btn-secondary share-channel-btn"
                onClick={() => {
                  window.location.href = `mailto:?subject=FixConnect%20Invitation&body=Use%20my%20code%20${rewards.referralCode}%20for%20discounts%20on%20home%20services.`;
                  setShowShareModal(false);
                }}
              >
                ✉️ Send via Email
              </button>
            </div>

            <div className="modal-footer-row" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowShareModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
