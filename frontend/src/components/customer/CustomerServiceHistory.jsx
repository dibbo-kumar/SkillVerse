import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Award, 
  Calendar, 
  Download, 
  Eye, 
  CheckCircle2, 
  Wrench, 
  Clock, 
  Printer, 
  Tag, 
  ArrowRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export default function CustomerServiceHistory({
  serviceHistory = [],
  onOpenInvoice,
  onNavigateTab
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredHistory = serviceHistory.filter(item => {
    const matchesSearch = item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.problemReported.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="customer-history-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <FileText size={24} color="var(--primary)" />
            Service History & Official Invoices
          </h2>
          <p className="section-subtitle">
            Comprehensive digital records of all fulfilled services, parts replaced, itemized labor breakdowns, and warranty certificates.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="history-filter-bar">
        <input 
          type="text"
          className="form-input history-search-input"
          placeholder="Search by service, technician name, or problem keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="history-category-pills">
          {['ALL', 'HVAC & AC', 'Plumbing', 'Electrical', 'Appliances'].map(cat => (
            <button 
              key={cat} 
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service Records Grid */}
      <div className="history-records-list">
        {filteredHistory.length === 0 ? (
          <div className="glass-card empty-state-box">
            <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No service records found</h3>
            <p>Once your technicians complete bookings and verify safety codes, official service certificates and invoices will appear here.</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              onClick={() => onNavigateTab('find-services')}
            >
              Book a Service
            </button>
          </div>
        ) : (
          filteredHistory.map((record) => {
            const isWarrantyActive = record.warrantyDaysRemaining > 0;

            return (
              <div key={record.id} className="glass-card service-history-card">
                {/* Header info */}
                <div className="history-card-header">
                  <div className="history-main-info">
                    <div className="history-tag-row">
                      <span className="history-job-id">Job #{record.jobId || `JOB-${record.id}`}</span>
                      <span className="badge badge-verified">
                        <CheckCircle2 size={12} /> {record.status || 'Verified Completed'}
                      </span>
                      {isWarrantyActive ? (
                        <span className="badge badge-emerald-glow">
                          <ShieldCheck size={12} /> {record.warrantyDaysRemaining} Days Warranty Active
                        </span>
                      ) : (
                        <span className="badge badge-pending">
                          <Clock size={12} /> Warranty Expired
                        </span>
                      )}
                    </div>
                    <h3 className="history-service-title">{record.serviceName}</h3>
                    <div className="history-tech-details">
                      <span>Technician: <strong>{record.technicianName}</strong></span> • 
                      <span> Date: <strong>{record.date}</strong></span> • 
                      <span> Property: <strong>{record.property || 'Home Apartment'}</strong></span>
                    </div>
                  </div>

                  <div className="history-cost-summary">
                    <div className="history-total-label">Total Amount Paid</div>
                    <div className="history-total-price">৳{record.total}</div>
                    <span className="history-payment-mode">Paid via {record.paymentMethod || 'bKash Escrow'}</span>
                  </div>
                </div>

                {/* Scope of Work Breakdown */}
                <div className="history-breakdown-grid">
                  {/* Left: Problem & Work Performed */}
                  <div className="history-work-details">
                    <div className="work-item">
                      <span className="work-label">Problem Reported:</span>
                      <p className="work-text">{record.problemReported}</p>
                    </div>

                    <div className="work-item">
                      <span className="work-label">Work Performed by Technician:</span>
                      <p className="work-text">{record.workPerformed}</p>
                    </div>

                    {/* Parts Used */}
                    {record.partsUsed && record.partsUsed.length > 0 && (
                      <div className="work-item">
                        <span className="work-label">Replacement Parts & Materials:</span>
                        <div className="parts-tags-list">
                          {record.partsUsed.map((part, pIdx) => (
                            <span key={pIdx} className="part-tag">
                              <Wrench size={12} color="var(--primary)" /> {part.name} ({part.quantity || 1}x) - ৳{part.cost}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Itemized Cost Statement */}
                  <div className="history-cost-breakdown-box">
                    <h4 className="cost-breakdown-title">
                      <DollarSign size={16} color="var(--primary)" />
                      Itemized Cost Breakdown
                    </h4>

                    <div className="cost-breakdown-table">
                      <div className="cost-row">
                        <span>Technician Labor Charge</span>
                        <strong>৳{record.laborCost || (record.total - (record.partsCost || 0))}</strong>
                      </div>
                      <div className="cost-row">
                        <span>Parts & Materials</span>
                        <strong>৳{record.partsCost || 0}</strong>
                      </div>
                      <div className="cost-row">
                        <span>FixConnect Trust Fee</span>
                        <strong>৳{record.platformFee || 0}</strong>
                      </div>
                      <div className="cost-row discount">
                        <span>Rewards Discount</span>
                        <strong>-৳{record.discount || 0}</strong>
                      </div>
                      <div className="cost-row total-row">
                        <span>Grand Total</span>
                        <span className="total-accent">৳{record.total}</span>
                      </div>
                    </div>

                    {/* Warranty note */}
                    <div className="warranty-notice-box">
                      <ShieldCheck size={16} color="var(--primary)" />
                      <div>
                        <strong>{record.warrantyTitle || '30-Day Service Guarantee'}</strong>
                        <p>{record.warrantyDescription || 'Free re-inspection and repairs if identical issues occur within 30 days.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="history-actions-bar">
                  <div className="history-safety-code-tag">
                    Completion Security Code: <code>{record.completionCode || '9143'}</code>
                  </div>

                  <div className="history-btn-group">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => onOpenInvoice(record)}
                    >
                      <Eye size={15} /> View Full Invoice
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => onOpenInvoice(record, true)}
                    >
                      <Download size={15} /> Download PDF Receipt
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
