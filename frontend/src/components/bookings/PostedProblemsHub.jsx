import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, CheckCircle2, DollarSign, User, Phone, XCircle, ArrowRight, MessageSquare, Wrench } from 'lucide-react';

const API_BASE = "http://localhost:8081/api";

export default function PostedProblemsHub({ isOpen, onClose, currentUser, onAcceptWorkerOffer, onShowToast }) {
  const [activeTab, setActiveTab] = useState('OPEN'); // 'OPEN', 'ASSIGNED', 'CLOSED'
  const [problemPosts, setProblemPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchUserProblems();
    }
  }, [isOpen, currentUser?.id]);

  const fetchUserProblems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/problems/customer/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setProblemPosts(data);
        if (data.length > 0 && !selectedProblem) {
          setSelectedProblem(data[0]);
          fetchOffersForProblem(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffersForProblem = async (problemId) => {
    try {
      const res = await fetch(`${API_BASE}/problems/${problemId}/offers`);
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    fetchOffersForProblem(prob.id);
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await fetch(`${API_BASE}/problems/offers/${offerId}/accept`, { method: 'PUT' });
      if (res.ok) {
        const createdBooking = await res.json();
        if (onShowToast) onShowToast("Offer Accepted!", "Technician quote accepted. Redirecting to My Bookings...", "success");
        onClose();
        if (onAcceptWorkerOffer) onAcceptWorkerOffer(createdBooking);
      } else {
        const err = await res.json();
        if (onShowToast) onShowToast("Error", err.error || "Failed to accept offer", "error");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const filteredPosts = problemPosts.filter((p) => {
    if (activeTab === 'OPEN') return p.status === 'OPEN';
    if (activeTab === 'ASSIGNED') return p.status === 'ASSIGNED';
    if (activeTab === 'CLOSED') return p.status === 'CLOSED';
    return true;
  });

  return (
    <div
      className="toast-popup-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={(e) => e.target.className.includes('toast-popup-overlay') && onClose()}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '2rem',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0 }}>📋 Your Posted Problems</h2>
              <span className="badge badge-verified">{problemPosts.length} Total Posts</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Review worker price offers and accept the right technician</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <XCircle size={26} />
          </button>
        </div>

        {/* Tab Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('OPEN')}
            className={`btn ${activeTab === 'OPEN' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Current / Open Posts ({problemPosts.filter(p => p.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setActiveTab('ASSIGNED')}
            className={`btn ${activeTab === 'ASSIGNED' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Assigned Posts ({problemPosts.filter(p => p.status === 'ASSIGNED').length})
          </button>
          <button
            onClick={() => setActiveTab('CLOSED')}
            className={`btn ${activeTab === 'CLOSED' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Closed Posts ({problemPosts.filter(p => p.status === 'CLOSED').length})
          </button>
        </div>

        {/* Main Split Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
          
          {/* Left Column: List of Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto' }}>
            {filteredPosts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectProblem(p)}
                style={{
                  background: selectedProblem?.id === p.id ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: selectedProblem?.id === p.id ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  padding: '1rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>{p.serviceCategory}</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Budget: ৳{p.budgetPrice}</strong>
                </div>
                <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: '0 0 0.3rem 0' }}>{p.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>{p.description.slice(0, 70)}...</p>
              </div>
            ))}

            {filteredPosts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No posts found in this category.
              </div>
            )}
          </div>

          {/* Right Column: Offers for Selected Problem */}
          {selectedProblem ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>{selectedProblem.title}</h3>
                  <span className="badge badge-gold">Offers ({offers.length})</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{selectedProblem.description}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Schedule: {selectedProblem.preferredDate} ({selectedProblem.preferredTime}) • Address: {selectedProblem.address}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', marginBottom: '0.8rem' }}>Technician Price Quotes & Offers</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '320px', overflowY: 'auto' }}>
                  {offers.map((off) => (
                    <div key={off.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img
                            src={off.worker?.profilePicture || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100"}
                            alt={off.worker?.name}
                            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block' }}>{off.worker?.name || 'Technician'}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⭐ {off.worker?.rating || 4.9} • {off.estimatedArrival || 'Within 1 hour'}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Quote Price</span>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>৳{off.proposedPrice}</strong>
                        </div>
                      </div>

                      {off.message && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.8rem', borderRadius: '8px', margin: 0 }}>
                          "{off.message}"
                        </p>
                      )}

                      {selectedProblem.status === 'OPEN' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.5rem', fontSize: '0.8rem', marginTop: '0.4rem', justifyContent: 'center' }}
                          onClick={() => handleAcceptOffer(off.id)}
                        >
                          Accept Worker Quote (৳{off.proposedPrice}) →
                        </button>
                      )}
                    </div>
                  ))}

                  {offers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No worker quotes submitted yet for this post. Technicians in your area are reviewing your post.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Select a post from the left column to view submitted worker quotes.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
