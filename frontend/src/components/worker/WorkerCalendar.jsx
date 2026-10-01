import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, Plus, Trash2, Zap,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, CalendarDays, Filter
} from 'lucide-react';

const API_BASE = "http://localhost:8081/api";

export default function WorkerCalendar({ currentWorker, onShowToast }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Filters & Add Modal State
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for New Slot
  const [newSlotDate, setNewSlotDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("11:00");
  const [creating, setCreating] = useState(false);

  const workerId = currentWorker?.id;

  const fetchSlots = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/availability/worker/${workerId}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data || []);
      } else {
        if (onShowToast) onShowToast("Failed to fetch calendar slots", "error");
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      if (onShowToast) onShowToast("Network error fetching slots", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [workerId]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlotDate || !newStartTime || !newEndTime) {
      if (onShowToast) onShowToast("Please fill all slot fields", "warning");
      return;
    }
    if (newStartTime >= newEndTime) {
      if (onShowToast) onShowToast("Start time must be earlier than end time", "error");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/availability/worker/${workerId}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotDate: newSlotDate,
          startTime: newStartTime,
          endTime: newEndTime
        })
      });
      const data = await res.json();

      if (res.ok) {
        if (onShowToast) onShowToast("Slot added successfully!", "success");
        setShowAddModal(false);
        fetchSlots();
      } else {
        if (onShowToast) onShowToast(data.message || "Failed to add slot", "error");
      }
    } catch (err) {
      console.error("Error creating slot:", err);
      if (onShowToast) onShowToast("Network error adding slot", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this time slot?")) return;
    try {
      const res = await fetch(`${API_BASE}/availability/slots/${slotId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        if (onShowToast) onShowToast("Time slot deleted", "success");
        fetchSlots();
      } else {
        if (onShowToast) onShowToast(data.message || "Could not delete slot", "error");
      }
    } catch (err) {
      console.error("Error deleting slot:", err);
      if (onShowToast) onShowToast("Network error deleting slot", "error");
    }
  };

  const handleGenerateDefaults = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/availability/worker/${workerId}/generate-default-slots?days=7`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        if (onShowToast) onShowToast(`Generated ${data.createdCount} standard slots for the week!`, "success");
        fetchSlots();
      } else {
        if (onShowToast) onShowToast(data.message || "Failed to generate slots", "error");
      }
    } catch (err) {
      console.error("Error generating defaults:", err);
      if (onShowToast) onShowToast("Network error generating slots", "error");
    } finally {
      setGenerating(false);
    }
  };

  // Dates set for filtering
  const uniqueDates = Array.from(new Set(slots.map(s => s.slotDate))).sort();

  const filteredSlots = slots.filter(slot => {
    if (selectedDateFilter === 'ALL') return true;
    return slot.slotDate === selectedDateFilter;
  });

  const isSlotBooked = (s) => Boolean(s.booked || s.isBooked);

  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => !isSlotBooked(s)).length;
  const bookedSlots = slots.filter(s => isSlotBooked(s)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <CalendarDays size={24} style={{ color: 'var(--primary, #6366f1)' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              Smart Availability Calendar
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Set your open bookable slots so customers can easily pick the right time to hire you without double-booking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={handleGenerateDefaults}
            disabled={generating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: generating ? 'wait' : 'pointer'
            }}
          >
            {generating ? <RefreshCw className="spin" size={16} /> : <Zap size={16} style={{ color: '#f59e0b' }} />}
            Auto-Generate 7-Day Slots
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '10px',
              padding: '0.6rem 1.2rem',
              fontWeight: '600',
              background: 'var(--primary, #6366f1)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            Add Custom Slot
          </button>
        </div>
      </div>

      {/* Quick Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '12px',
          padding: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1'
          }}>
            <CalendarIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Slots</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{totalSlots}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '12px',
          padding: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e'
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Open For Booking</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>{availableSlots}</div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '12px',
          padding: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reserved / Booked</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{bookedSlots}</div>
          </div>
        </div>
      </div>

      {/* Date Filter Pills */}
      {uniqueDates.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
            <Filter size={14} /> Filter Date:
          </div>
          <button
            onClick={() => setSelectedDateFilter('ALL')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              border: selectedDateFilter === 'ALL' ? '1px solid var(--primary, #6366f1)' : '1px solid var(--border-color)',
              background: selectedDateFilter === 'ALL' ? 'var(--primary, #6366f1)' : 'var(--bg-card)',
              color: selectedDateFilter === 'ALL' ? '#fff' : 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Dates ({totalSlots})
          </button>
          {uniqueDates.map(dateStr => {
            const count = slots.filter(s => s.slotDate === dateStr).length;
            const formatted = new Date(dateStr + "T00:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateFilter(dateStr)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  border: selectedDateFilter === dateStr ? '1px solid var(--primary, #6366f1)' : '1px solid var(--border-color)',
                  background: selectedDateFilter === dateStr ? 'var(--primary, #6366f1)' : 'var(--bg-card)',
                  color: selectedDateFilter === dateStr ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {formatted} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Slots List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <RefreshCw className="spin" size={28} style={{ marginBottom: '0.5rem' }} />
          <div>Loading your availability schedule...</div>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div style={{
          background: 'var(--bg-card, #1e293b)',
          border: '1px border-dashed var(--border-color, #334155)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <CalendarIcon size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No Time Slots Found</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
            You haven't set up any bookable slots yet. Add your open hours or click "Auto-Generate 7-Day Slots" to get started instantly!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={handleGenerateDefaults} disabled={generating}>
              ⚡ Generate Next 7 Days
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add First Slot
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {filteredSlots.map(slot => {
            const dateObj = new Date(slot.slotDate + "T00:00:00");
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const isBooked = isSlotBooked(slot);

            return (
              <div
                key={slot.id}
                style={{
                  background: 'var(--bg-card, #1e293b)',
                  border: isBooked
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid var(--border-color, #334155)',
                  borderRadius: '14px',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--primary, #6366f1)',
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px'
                      }}>
                        {dayName}
                      </span>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                        {dateStr}
                      </div>
                    </div>

                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '20px',
                      background: isBooked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: isBooked ? '#ef4444' : '#22c55e',
                      border: isBooked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                      {isBooked ? (
                        <>
                          <XCircle size={12} /> Booked #{slot.bookingId || ''}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={12} /> Available
                        </>
                      )}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: 'rgba(0, 0, 0, 0.15)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <Clock size={16} style={{ color: 'var(--primary, #6366f1)' }} />
                    {slot.startTime} – {slot.endTime}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {!isBooked ? (
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      title="Delete slot"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.85rem',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      Reserved by Customer
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Slot Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '1.8rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: 'var(--primary, #6366f1)' }} />
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>Add Bookable Time Slot</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                  Slot Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  style={{ borderRadius: '8px', padding: '0.6rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                  style={{ borderRadius: '8px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {creating ? <RefreshCw className="spin" size={16} /> : <Plus size={16} />}
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
