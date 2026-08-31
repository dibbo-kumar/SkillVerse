import React, { useState } from 'react';
import { 
  MapPin, 
  Home, 
  Building, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Star,
  Navigation
} from 'lucide-react';

export default function CustomerAddresses({
  addresses = [],
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [label, setLabel] = useState('');
  const [type, setType] = useState('Home'); // Home, Office, Other
  const [streetAddress, setStreetAddress] = useState('');
  const [area, setArea] = useState('Uttara');
  const [city, setCity] = useState('Dhaka');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setLabel('My Home');
    setType('Home');
    setStreetAddress('');
    setArea('Uttara');
    setCity('Dhaka');
    setLandmark('');
    setIsDefault(addresses.length === 0);
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setType(addr.type);
    setStreetAddress(addr.streetAddress || addr.address);
    setArea(addr.area || 'Uttara');
    setCity(addr.city || 'Dhaka');
    setLandmark(addr.landmark || '');
    setIsDefault(addr.isDefault);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!streetAddress) return;

    const addressData = {
      id: editingAddress ? editingAddress.id : Date.now(),
      label: label || `${type} Address`,
      type,
      streetAddress,
      area,
      city,
      landmark,
      address: `${streetAddress}, ${area}, ${city}`,
      isDefault
    };

    if (editingAddress) {
      onEditAddress(addressData);
    } else {
      onAddAddress(addressData);
    }

    setShowModal(false);
  };

  return (
    <div className="customer-addresses-section">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">
            <MapPin size={24} color="var(--primary)" />
            Saved Service Locations & Addresses
          </h2>
          <p className="section-subtitle">
            Manage your service locations. When booking any technician, you can select any saved address with 1 click.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Address
        </button>
      </div>

      <div className="addresses-grid">
        {addresses.length === 0 ? (
          <div className="glass-card empty-state-box" style={{ gridColumn: '1 / -1' }}>
            <MapPin size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No addresses saved yet</h3>
            <p>Save your home, office, or rental properties to autofill dispatch addresses when booking technicians.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleOpenAdd}>
              + Add First Address
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className={`glass-card address-card ${addr.isDefault ? 'is-default' : ''}`}>
              <div className="address-card-top">
                <div className="address-type-pill">
                  {addr.type === 'Office' ? <Building size={16} color="var(--accent-blue)" /> : <Home size={16} color="var(--primary)" />}
                  <span style={{ fontWeight: 'bold' }}>{addr.label || addr.type}</span>
                </div>

                {addr.isDefault && (
                  <span className="badge badge-verified">
                    <CheckCircle2 size={11} /> Default Location
                  </span>
                )}
              </div>

              <div className="address-content">
                <div className="address-street">
                  <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{addr.address || `${addr.streetAddress}, ${addr.area}, ${addr.city}`}</span>
                </div>
                {addr.landmark && (
                  <div className="address-landmark">
                    <Navigation size={12} /> Nearby Landmark: {addr.landmark}
                  </div>
                )}
              </div>

              <div className="address-card-footer">
                {!addr.isDefault ? (
                  <button 
                    className="btn btn-text" 
                    style={{ fontSize: '0.8rem', padding: '0.2rem 0' }}
                    onClick={() => onSetDefaultAddress(addr.id)}
                  >
                    Set as Default
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Used for express checkout</span>
                )}

                <div className="address-btn-actions">
                  <button className="btn btn-icon" onClick={() => handleOpenEdit(addr)} title="Edit Address">
                    <Edit3 size={15} color="var(--text-secondary)" />
                  </button>
                  <button className="btn btn-icon" onClick={() => onDeleteAddress(addr.id)} title="Delete Address">
                    <Trash2 size={15} color="var(--accent-rose)" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add/Edit Address */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 className="modal-title">
              <MapPin size={20} color="var(--primary)" />
              {editingAddress ? 'Edit Saved Address' : 'Add New Service Address'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Technicians will use this location for live GPS dispatch and navigation.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Address Tag / Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. My Apartment, Dhanmondi Office, Parents Home"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Location Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {['Home', 'Office', 'Other'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ justifyContent: 'center' }}
                      onClick={() => setType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">House / Flat / Road / Street Details</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Flat 4B, House 25, Road 7"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Area / Sector</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Uttara Sector 4, Gulshan 2"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Nearby Landmark (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Opposite to Milestone School"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>

              <div className="form-group checkbox-row" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <label htmlFor="defaultCheck" style={{ fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
                  Set as default address for technician dispatch
                </label>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAddress ? 'Save Changes' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
