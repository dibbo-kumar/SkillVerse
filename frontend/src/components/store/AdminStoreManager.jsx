import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Package, Plus, Edit, Trash2, CheckCircle, Clock,
  DollarSign, TrendingUp, AlertTriangle, RefreshCw, Layers, ShieldCheck, Search, XCircle, Star, Eye
} from 'lucide-react';

const API_BASE = "http://localhost:8089/api/store";

export default function AdminStoreManager({ onShowToast }) {
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'products', 'categories', 'orders'
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);
  const [adminOrderReviews, setAdminOrderReviews] = useState({});

  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 500,
    oldPrice: 600,
    type: 'SPARE_PART',
    category: 'AC & Cooling',
    brand: '',
    model: '',
    sku: '',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500',
    stockQuantity: 20,
    lowStockThreshold: 5,
    compatibleServices: 'AC Servicing / Repair',
    compatibleModels: 'Gree 1.5 Ton Inverter',
    warranty: '6 Months Warranty',
    specifications: '{"Voltage":"450V"}'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300'
  });

  const STATUS_RANKS = {
    'ORDER_PLACED': 1,
    'PAYMENT_CONFIRMED': 2,
    'PROCESSING': 3,
    'PACKED': 4,
    'SHIPPED': 5,
    'OUT_FOR_DELIVERY': 6,
    'DELIVERED': 7,
    'CANCELLED': 99
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resAnal, resProd, resCat, resOrd] = await Promise.all([
        fetch(`${API_BASE}/analytics`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/orders`)
      ]);

      if (resAnal.ok) setAnalytics(await resAnal.json());
      if (resProd.ok) setProducts(await resProd.json());
      if (resCat.ok) setCategories(await resCat.json());
      if (resOrd.ok) setOrders(await resOrd.json());
    } catch (err) {
      console.error("Failed to load admin store data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrderDetails = async (order) => {
    setSelectedAdminOrder(order);
    // Fetch reviews for products in this order
    const reviewsMap = {};
    for (let item of order.items) {
      const pId = item.product?.id || item.product_id;
      if (pId) {
        try {
          const res = await fetch(`${API_BASE}/reviews/product/${pId}`);
          if (res.ok) {
            const revs = await res.json();
            // Filter review left by this order's user
            const userRev = revs.find(r => r.user?.id === order.user?.id || r.user_id === order.user?.id);
            if (userRev) reviewsMap[pId] = userRev;
          }
        } catch (e) { }
      }
    }
    setAdminOrderReviews(reviewsMap);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        id: editingProduct ? editingProduct.id : null,
        price: parseFloat(productForm.price),
        oldPrice: productForm.oldPrice ? parseFloat(productForm.oldPrice) : null,
        stockQuantity: parseInt(productForm.stockQuantity),
        lowStockThreshold: parseInt(productForm.lowStockThreshold)
      };

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onShowToast && onShowToast("Product Saved", "Tool store catalog updated successfully.", "success");
        setProductModalOpen(false);
        setEditingProduct(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Save product failed:", err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product from the store catalog?")) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast && onShowToast("Product Deleted", "Item removed from store.", "info");
        fetchAdminData();
      }
    } catch (err) {
      console.error("Delete product failed:", err);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...categoryForm,
        id: editingCategory ? editingCategory.id : null
      };

      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onShowToast && onShowToast("Category Saved", "Category catalog updated.", "success");
        setCategoryModalOpen(false);
        setEditingCategory(null);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Save category failed:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const currentOrder = orders.find(o => o.id === orderId);
    if (currentOrder) {
      const currentRank = STATUS_RANKS[currentOrder.orderStatus] || 0;
      const newRank = STATUS_RANKS[newStatus] || 0;

      if (newRank < currentRank && newRank !== 99) {
        onShowToast && onShowToast("Status Error", `Order status cannot be moved backwards from ${currentOrder.orderStatus} to ${newStatus}`, "error");
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        onShowToast && onShowToast("Order Status Updated", `Order updated to ${newStatus}`, "success");
        fetchAdminData();
        if (selectedAdminOrder && selectedAdminOrder.id === orderId) {
          const updated = await res.json();
          setSelectedAdminOrder(updated);
        }
      } else {
        const errTxt = await res.text();
        onShowToast && onShowToast("Status Error", errTxt, "error");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.8rem', marginTop: '2rem' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, color: '#f59e0b' }}>
            <ShoppingBag color="#f59e0b" /> Tool Store Administration Portal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage e-commerce products, stock inventory thresholds, category taxonomies, orders, and customer reviews.
          </p>
        </div>

        {/* Admin Subtabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['overview', 'products', 'categories', 'orders'].map(tab => (
            <button
              key={tab}
              className={`btn ${adminTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}
              onClick={() => setAdminTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* --- OVERVIEW METRICS CARDS --- */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Store Sales</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.2rem' }}>
              ৳{analytics.totalSales.toLocaleString()}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders Placed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.2rem' }}>
              {analytics.totalOrders}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Catalog Products</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.2rem' }}>
              {analytics.activeProducts} / {analytics.totalProducts}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low Stock / Out of Stock</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
              {analytics.lowStock} Low | {analytics.outOfStock} Out
            </div>
          </div>
        </div>
      )}

      {/* --- PRODUCTS MANAGEMENT TAB --- */}
      {adminTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Catalog Products ({products.length})</h3>
            <button className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}>
              <Plus size={16} /> Add New Store Product
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem' }}>Product</th>
                  <th style={{ padding: '0.6rem' }}>Category</th>
                  <th style={{ padding: '0.6rem' }}>Price</th>
                  <th style={{ padding: '0.6rem' }}>Stock</th>
                  <th style={{ padding: '0.6rem' }}>SKU</th>
                  <th style={{ padding: '0.6rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img src={p.imageUrl} alt={p.title} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{p.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem' }}>{p.category}</td>
                    <td style={{ padding: '0.6rem', color: 'var(--primary)', fontWeight: 'bold' }}>৳{p.price}</td>
                    <td style={{ padding: '0.6rem' }}>
                      <span style={{ color: p.stockQuantity <= 5 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>{p.sku}</td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn-icon" onClick={() => { setEditingProduct(p); setProductForm(p); setProductModalOpen(true); }}>
                          <Edit size={16} color="#3b82f6" />
                        </button>
                        <button className="btn-icon" onClick={() => handleDeleteProduct(p.id)}>
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CATEGORIES MANAGEMENT TAB --- */}
      {adminTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Product Categories ({categories.length})</h3>
            <button className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}>
              <Plus size={16} /> Create New Category
            </button>
          </div>

          <div className="dashboard-grid" style={{ padding: 0 }}>
            {categories.map(cat => (
              <div key={cat.id} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={cat.imageUrl} alt={cat.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ORDERS MANAGEMENT TAB --- */}
      {adminTab === 'orders' && (
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Store Orders ({orders.length})</h3>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem' }}>Order #</th>
                  <th style={{ padding: '0.6rem' }}>Customer</th>
                  <th style={{ padding: '0.6rem' }}>Total Amount</th>
                  <th style={{ padding: '0.6rem' }}>Payment</th>
                  <th style={{ padding: '0.6rem' }}>Current Status</th>
                  <th style={{ padding: '0.6rem' }}>Update Status</th>
                  <th style={{ padding: '0.6rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const currentRank = STATUS_RANKS[o.orderStatus] || 0;
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>{o.orderNumber}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <div>{o.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.phone}</div>
                      </td>
                      <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>৳{o.totalAmount}</td>
                      <td style={{ padding: '0.6rem' }}>{o.paymentMethod} ({o.paymentStatus})</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span className="badge badge-gold">{o.orderStatus.replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '0.6rem' }}>
                        {/* Status dropdown with forward-only validation */}
                        <select
                          className="input-field"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          disabled={o.orderStatus === 'DELIVERED' || o.orderStatus === 'CANCELLED'}
                        >
                          <option value="ORDER_PLACED" disabled={currentRank > 1}>Order Placed</option>
                          <option value="PAYMENT_CONFIRMED" disabled={currentRank > 2}>Payment Confirmed</option>
                          <option value="PROCESSING" disabled={currentRank > 3}>Processing</option>
                          <option value="PACKED" disabled={currentRank > 4}>Packed</option>
                          <option value="SHIPPED" disabled={currentRank > 5}>Shipped</option>
                          <option value="OUT_FOR_DELIVERY" disabled={currentRank > 6}>Out for Delivery</option>
                          <option value="DELIVERED" disabled={currentRank > 7}>Delivered</option>
                          <option value="CANCELLED">Cancel Order</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.6rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleOpenOrderDetails(o)}>
                          <Eye size={12} /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADMIN ORDER DETAILS MODAL --- */}
      {selectedAdminOrder && (
        <div className="toast-popup-overlay">
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '650px', padding: '2rem', background: '#0e1526', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--primary)' }}>
                  Order Details — {selectedAdminOrder.orderNumber}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Placed on: {new Date(selectedAdminOrder.placedAt).toLocaleString()}
                </div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedAdminOrder(null)}>
                <XCircle size={22} color="var(--text-muted)" />
              </button>
            </div>

            {/* Customer & Delivery Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>Customer & Delivery Info</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <div><strong>Name:</strong> {selectedAdminOrder.customerName}</div>
                <div><strong>Phone:</strong> {selectedAdminOrder.phone}</div>
              </div>
              <div><strong>Address:</strong> {selectedAdminOrder.address}, {selectedAdminOrder.area}, {selectedAdminOrder.district}, {selectedAdminOrder.division} ({selectedAdminOrder.postalCode})</div>
              {selectedAdminOrder.deliveryInstructions && (
                <div style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}><strong>Instructions:</strong> {selectedAdminOrder.deliveryInstructions}</div>
              )}
            </div>

            {/* Products Table */}
            <div style={{ marginBottom: '1.2rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem' }}>Purchased Products</h4>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.4rem' }}>Item</th>
                    <th style={{ padding: '0.4rem' }}>Qty</th>
                    <th style={{ padding: '0.4rem' }}>Unit Price</th>
                    <th style={{ padding: '0.4rem' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAdminOrder.items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <img src={item.productImageUrl || item.product?.imageUrl} alt={item.productTitle} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: '4px' }} />
                        <span>{item.productTitle}</span>
                      </td>
                      <td style={{ padding: '0.4rem' }}>x{item.quantity}</td>
                      <td style={{ padding: '0.4rem' }}>৳{item.unitPrice}</td>
                      <td style={{ padding: '0.4rem', fontWeight: 'bold' }}>৳{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.6rem', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1rem' }}>
                <span>Total Amount Paid (Inc. ৳60 Delivery):</span>
                <span>৳{selectedAdminOrder.totalAmount}</span>
              </div>
            </div>

            {/* User Submitted Review if Order is Delivered */}
            {selectedAdminOrder.orderStatus === 'DELIVERED' && (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={16} fill="var(--primary)" /> Delivered Customer Verified Review
                </h4>

                {Object.keys(adminOrderReviews).length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Customer has not submitted a review yet for this delivered order.</div>
                ) : (
                  Object.entries(adminOrderReviews).map(([pId, rev]) => (
                    <div key={pId} style={{ marginTop: '0.4rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                        ))}
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', marginLeft: 6 }}>{rev.rating} / 5</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>"{rev.comment}"</p>
                      {rev.photoUrl && (
                        <img src={rev.photoUrl} alt="Review attachment" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '6px', marginTop: '0.4rem' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Close button */}
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedAdminOrder(null)}>
              Close Order Details
            </button>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {productModalOpen && (
        <div className="toast-popup-overlay" onClick={() => setProductModalOpen(false)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '650px', padding: '2rem', background: '#0e1526' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>
              {editingProduct ? 'Edit Tool Store Product' : 'Add New Tool Store Product'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Product Title</label>
                <input type="text" className="input-field" required value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category</label>
                <select className="input-field" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                  <option value="AC & Cooling">AC & Cooling</option>
                  <option value="Refrigerator">Refrigerator</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Fan">Fan</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price (BDT)</label>
                <input type="number" className="input-field" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Old Price (Optional for Discount)</label>
                <input type="number" className="input-field" value={productForm.oldPrice || ''} onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Quantity</label>
                <input type="number" className="input-field" required value={productForm.stockQuantity} onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brand</label>
                <input type="text" className="input-field" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU Code</label>
                <input type="text" className="input-field" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Image URL</label>
                <input type="text" className="input-field" value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compatible Services</label>
                <input type="text" className="input-field" placeholder="e.g. AC Servicing / Repair, Refrigerator Repair" value={productForm.compatibleServices} onChange={(e) => setProductForm({ ...productForm, compatibleServices: e.target.value })} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea className="input-field" rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setProductModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
