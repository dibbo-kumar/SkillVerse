import React, { useState } from 'react';
import { 
  Building, 
  Home, 
  Plus, 
  Wrench, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';

export default function CustomerProperties({
  properties = [],
  onAddProperty,
  onDeleteProperty,
  onAddAppliance,
  onDeleteAppliance,
  onOpenBookingModal
}) {
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showAddApplianceModal, setShowAddApplianceModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // Form states for Property
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState('Home'); // Home, Office, Commercial, Other
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropCity, setNewPropCity] = useState('Dhaka');

  // Form states for Appliance
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('HVAC & AC');
  const [newAppBrand, setNewAppBrand] = useState('');
  const [newAppModel, setNewAppModel] = useState('');
  const [newAppLastService, setNewAppLastService] = useState('');

  const handleCreateProperty = (e) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;

    onAddProperty({
      id: Date.now(),
      name: newPropName,
      type: newPropType,
      address: `${newPropAddress}, ${newPropCity}`,
      appliances: []
    });

    setNewPropName('');
    setNewPropAddress('');
    setShowAddPropertyModal(false);
  };

  const handleCreateAppliance = (e) => {
    e.preventDefault();
    if (!newAppName || !selectedPropertyId) return;

    onAddAppliance(selectedPropertyId, {
      id: Date.now(),
      name: newAppName,
      category: newAppCategory,
      brand: newAppBrand || 'Standard Brand',
      model: newAppModel || 'N/A',
      lastServiceDate: newAppLastService || 'Just Added',
      nextServiceDate: 'In 3 Months',
      maintenanceDue: false
    });

    setNewAppName('');
    setNewAppBrand('');
    setNewAppModel('');
    setNewAppLastService('');
    setShowAddApplianceModal(false);
  };

  return (
    <div className="customer-properties-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <Building size={24} color="var(--primary)" />
            My Properties & Appliance Maintenance Records
          </h2>
          <p className="section-subtitle">
            Organize your homes, offices, and connected equipment to receive automated preventative maintenance alerts and 1-click servicing.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddPropertyModal(true)}>
          <Plus size={16} /> Add New Property
        </button>
      </div>

      {/* Property Cards Grid */}
      <div className="properties-container">
        {properties.length === 0 ? (
          <div className="glass-card empty-state-box">
            <Building size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No properties registered yet</h3>
            <p>Add your home or office to link your appliances and keep track of warranty, servicing schedules, and parts.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowAddPropertyModal(true)}>
              + Add Your First Property
            </button>
          </div>
        ) : (
          properties.map((prop) => (
            <div key={prop.id} className="glass-card property-hub-card">
              {/* Property Header */}
              <div className="property-hub-header">
                <div className="property-title-wrap">
                  <div className="prop-icon-box">
                    {prop.type === 'Office' ? <Building size={22} color="var(--accent-blue)" /> : <Home size={22} color="var(--primary)" />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 className="property-name">{prop.name}</h3>
                      <span className="badge badge-pending">{prop.type}</span>
                    </div>
                    <div className="property-address-text">
                      <MapPin size={13} color="var(--text-muted)" />
                      {prop.address}
                    </div>
                  </div>
                </div>

                <div className="property-top-actions">
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      setShowAddApplianceModal(true);
                    }}
                  >
                    <Plus size={14} /> Add Appliance
                  </button>
                  <button 
                    className="btn btn-icon" 
                    title="Delete Property"
                    onClick={() => onDeleteProperty(prop.id)}
                  >
                    <Trash2 size={16} color="var(--accent-rose)" />
                  </button>
                </div>
              </div>

              {/* Appliances List inside Property */}
              <div className="property-appliances-area">
                <div className="appliances-header-row">
                  <span className="appliances-count-tag">
                    Tracked Equipment & Assets ({(prop.appliances || []).length})
                  </span>
                </div>

                {(prop.appliances || []).length === 0 ? (
                  <div className="empty-appliance-box">
                    <Wrench size={24} color="var(--text-muted)" />
                    <span>No appliances added yet. Add an AC, refrigerator, or water pump for preventative maintenance reminders.</span>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => {
                        setSelectedPropertyId(prop.id);
                        setShowAddApplianceModal(true);
                      }}
                    >
                      + Add First Appliance
                    </button>
                  </div>
                ) : (
                  <div className="appliances-grid">
                    {prop.appliances.map((app) => (
                      <div key={app.id} className={`appliance-card ${app.maintenanceDue ? 'maintenance-alert-active' : ''}`}>
                        <div className="appliance-top">
                          <div>
                            <h4 className="appliance-title">{app.name}</h4>
                            <div className="appliance-specs">
                              {app.brand} • {app.category} {app.model ? `(${app.model})` : ''}
                            </div>
                          </div>

                          {app.maintenanceDue ? (
                            <span className="badge badge-warning">
                              <AlertTriangle size={11} /> Due for Service
                            </span>
                          ) : (
                            <span className="badge badge-verified">
                              <CheckCircle2 size={11} /> Healthy
                            </span>
                          )}
                        </div>

                        {/* Preventative Maintenance Schedule banner */}
                        {app.maintenanceDue && (
                          <div className="appliance-warning-box">
                            <AlertTriangle size={14} color="var(--accent-gold)" />
                            <span>Recommended seasonal coil cleaning & gas pressure check.</span>
                          </div>
                        )}

                        <div className="appliance-service-meta">
                          <div>
                            <span className="meta-label">Last Service</span>
                            <div className="meta-val">{app.lastServiceDate || 'Not recorded'}</div>
                          </div>
                          <div>
                            <span className="meta-label">Next Recommended</span>
                            <div className="meta-val" style={{ color: app.maintenanceDue ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                              {app.nextServiceDate || 'In 3 months'}
                            </div>
                          </div>
                        </div>

                        <div className="appliance-actions">
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.4rem' }}
                            onClick={() => {
                              onOpenBookingModal({
                                serviceType: `${app.category} Maintenance`,
                                description: `Scheduled servicing & maintenance for ${app.name} (${app.brand} ${app.model || ''}) at ${prop.name} (${prop.address})`,
                                suggestedCost: 1000,
                                propertyAddress: prop.address
                              });
                            }}
                          >
                            <Zap size={14} /> Book Service
                          </button>
                          <button 
                            className="btn btn-icon" 
                            title="Remove Appliance"
                            onClick={() => onDeleteAppliance(prop.id, app.id)}
                          >
                            <Trash2 size={14} color="var(--text-muted)" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Property */}
      {showAddPropertyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 className="modal-title">
              <Building size={20} color="var(--primary)" />
              Add New Property
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Create a dedicated profile for your home or office space.
            </p>

            <form onSubmit={handleCreateProperty}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Property Name / Label</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Uttara Residence, Gulshan Penthouse, Dhanmondi Office"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Property Type</label>
                <select 
                  className="form-select"
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value)}
                >
                  <option value="Home">Home / Residential Apartment</option>
                  <option value="Office">Office / Workspace</option>
                  <option value="Commercial">Commercial Shop / Showroom</option>
                  <option value="Other">Other Property</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Full Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. House 14, Road 4, Sector 12"
                  value={newPropAddress}
                  onChange={(e) => setNewPropAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">City / Zone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newPropCity}
                  onChange={(e) => setNewPropCity(e.target.value)}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPropertyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Appliance */}
      {showAddApplianceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 className="modal-title">
              <Wrench size={20} color="var(--primary)" />
              Register New Appliance / Equipment
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Add equipment details to automatically track warranty and schedule timely preventative servicing.
            </p>

            <form onSubmit={handleCreateAppliance}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Appliance Name / Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Master Bedroom Inverter AC, Kitchen Double Door Fridge"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={newAppCategory}
                  onChange={(e) => setNewAppCategory(e.target.value)}
                >
                  <option value="HVAC & AC">Air Conditioning (HVAC)</option>
                  <option value="Refrigeration">Refrigerator / Deep Freezer</option>
                  <option value="Plumbing & Pumps">Submersible Water Pump</option>
                  <option value="Electrical & Power">IPS / UPS / Generator</option>
                  <option value="Kitchen Appliances">Microwave / Oven / Chimney</option>
                  <option value="Washing & Cleaning">Washing Machine / Geyser</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Brand</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. General, Gree, Singer"
                    value={newAppBrand}
                    onChange={(e) => setNewAppBrand(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Model / Capacity</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 1.5 Ton Inverter"
                    value={newAppModel}
                    onChange={(e) => setNewAppModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Last Serviced Date (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 15 Jan 2026"
                  value={newAppLastService}
                  onChange={(e) => setNewAppLastService(e.target.value)}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddApplianceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Appliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
