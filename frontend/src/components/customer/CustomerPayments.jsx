import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Download, 
  Plus, 
  ShieldCheck,
  Zap,
  Tag,
  Eye
} from 'lucide-react';

export default function CustomerPayments({
  transactions = [],
  onOpenReceipt,
  onAddPaymentMethod
}) {
  const [filterType, setFilterType] = useState('ALL'); // ALL, COMPLETED, PENDING

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.status === filterType;
  });

  const totalSpent = transactions
    .filter(tx => tx.status === 'COMPLETED' || tx.status === 'PAID')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="customer-payments-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <CreditCard size={24} color="var(--primary)" />
            Payments & Transaction Ledger
          </h2>
          <p className="section-subtitle">
            Secure multi-channel escrow records, digital receipts, and payment method configurations.
          </p>
        </div>
      </div>

      {/* Top Cards: Balance / Total Spend & Saved Methods */}
      <div className="payments-overview-grid">
        {/* Total Maintenance Expenditure */}
        <div className="glass-card payment-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Verified Expenditure</span>
            <div className="stat-badge">Lifetime</div>
          </div>
          <div className="stat-big-val">৳{totalSpent.toLocaleString()}</div>
          <div className="stat-meta-text">
            <ShieldCheck size={14} color="var(--primary)" /> 100% Escrow Protected Transactions
          </div>
        </div>

        {/* Saved Payment Methods Box */}
        <div className="glass-card saved-methods-box">
          <div className="methods-header">
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={18} color="var(--accent-blue)" /> Saved Payment Channels
            </h3>
            <span className="badge badge-verified">Active</span>
          </div>

          <div className="methods-list">
            <div className="method-item active">
              <div className="method-icon bkash-icon">bKash</div>
              <div className="method-info">
                <strong>bKash Mobile Wallet (Personal)</strong>
                <span>01811****44 • Default Channel</span>
              </div>
            </div>

            <div className="method-item">
              <div className="method-icon nagad-icon">Nagad</div>
              <div className="method-info">
                <strong>Nagad Direct Merchant Pay</strong>
                <span>01811****44</span>
              </div>
            </div>

            <div className="method-item">
              <div className="method-icon cash-icon">Cash</div>
              <div className="method-info">
                <strong>Cash on Service Delivery</strong>
                <span>Direct Handover to Technician</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="glass-card transactions-table-card">
        <div className="table-header-row">
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            <DollarSign size={20} color="var(--primary)" />
            Recent Service Transactions
          </h3>

          <div className="history-category-pills">
            <button 
              className={`category-pill ${filterType === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterType('ALL')}
            >
              All Transactions ({transactions.length})
            </button>
            <button 
              className={`category-pill ${filterType === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setFilterType('COMPLETED')}
            >
              Paid ({transactions.filter(t => t.status === 'COMPLETED' || t.status === 'PAID').length})
            </button>
          </div>
        </div>

        <div className="transactions-table-wrap">
          {filteredTransactions.length === 0 ? (
            <div className="empty-state-box">
              <CreditCard size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <p>No transaction history records found.</p>
            </div>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Service Details & Booking</th>
                  <th>Technician</th>
                  <th>Date & Time</th>
                  <th>Channel</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className="tx-id-code">{tx.txCode || `TXN-${tx.id}`}</span>
                    </td>
                    <td>
                      <div className="tx-service-name">{tx.serviceName}</div>
                      <span className="tx-booking-ref">Booking Ref: #{tx.bookingId || `BK-${tx.id}`}</span>
                    </td>
                    <td>
                      <span className="tx-worker-name">{tx.technicianName || 'Kamrul Islam'}</span>
                    </td>
                    <td>
                      <span className="tx-date">{tx.date || '31 Aug 2026'}</span>
                    </td>
                    <td>
                      <span className="tx-method-badge">{tx.method || 'bKash Wallet'}</span>
                    </td>
                    <td>
                      <strong className="tx-amount">৳{tx.amount}</strong>
                    </td>
                    <td>
                      <span className={`badge ${tx.status === 'COMPLETED' || tx.status === 'PAID' ? 'badge-verified' : 'badge-pending'}`}>
                        {tx.status === 'COMPLETED' || tx.status === 'PAID' ? 'Paid & Verified' : tx.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-icon"
                        title="View Digital Receipt"
                        onClick={() => onOpenReceipt(tx)}
                      >
                        <Eye size={15} color="var(--primary)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
