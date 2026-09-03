import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, CheckCircle2, Clock, DollarSign, Wrench, ShieldCheck } from 'lucide-react';

export default function NotificationBell({ notifications = [], onMarkAllRead, onNotificationClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'var(--transition)'
        }}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#f43f5e',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              borderRadius: '10px',
              padding: '1px 6px',
              border: '2px solid var(--bg-primary)',
              boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            width: '360px',
            maxWidth: '90vw',
            maxHeight: '480px',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Notifications</strong>
              {unreadCount > 0 && <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>{unreadCount} unread</span>}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => onMarkAllRead && onMarkAllRead()}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}
              >
                <CheckCheck size={14} /> Mark All as Read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (onNotificationClick) onNotificationClick(n);
                  setIsOpen(false);
                }}
                style={{
                  background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(16, 185, 129, 0.08)',
                  border: n.read ? '1px solid var(--border-color)' : '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.8rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{n.title}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time || 'Just now'}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
              </div>
            ))}

            {notifications.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications yet. Status updates, price offers, and job progress will appear here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
