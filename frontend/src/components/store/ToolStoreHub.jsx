import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Heart, Star, CheckCircle, ShieldCheck, 
  Truck, ArrowRight, XCircle, Plus, Minus, CreditCard, ChevronRight, 
  Package, Clock, AlertCircle, Wrench, RefreshCw, Zap, Award, ThumbsUp, Tag,
  Camera, ImageIcon, X, AlertTriangle, ArrowUpRight, Upload
} from 'lucide-react';

const API_BASE = "http://localhost:8081/api/store";

function ToolStoreContent({ currentUser, onShowToast, contextualBooking = null, onCloseContextual = null }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(contextualBooking ? contextualBooking.serviceType : 'All');
  const [sortBy, setSortBy] = useState('recommended');

  // Navigation State
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'cart', 'orders', 'my-tools', 'wishlist'
  const [orderSubTab, setOrderSubTab] = useState('active'); // 'active', 'delivered', 'cancelled'

  // Cart & Wishlist State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('skillverse_store_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(item => item && item.product) : [];
    } catch (e) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('skillverse_store_wishlist');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(item => item && item.id) : [];
    } catch (e) {
      return [];
    }
  });

  // Save cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('skillverse_store_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('skillverse_store_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Modals & Selected Views State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [instantBuyProduct, setInstantBuyProduct] = useState(null); // Direct buy product
  const [placedOrder, setPlacedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  // Review Submission Modal State
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewBase64Photo, setNewReviewBase64Photo] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Checkout Form State
  const [deliveryForm, setDeliveryForm] = useState({
    customerName: currentUser?.name || '',
    phone: currentUser?.phone || '01811223344',
    address: currentUser?.address || 'House 14, Road 4, Sector 12, Uttara, Dhaka',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Uttara',
    postalCode: '1230',
    deliveryInstructions: '',
    paymentMethod: 'BKASH'
  });

  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Sync contextual booking service filter
  useEffect(() => {
    if (contextualBooking) {
      setSelectedService(contextualBooking.serviceType);
    }
  }, [contextualBooking]);

  // Fetch initial products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchUserOrders();
    fetchUserReviews();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/products?sort=${sortBy}`;
      if (selectedCategory && selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (selectedService && selectedService !== 'All') {
        url += `&serviceType=${encodeURIComponent(selectedService)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchUserOrders = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const res = await fetch(`${API_BASE}/orders/user/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
    }
  };

  const fetchUserReviews = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/user/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserReviews(data);
      }
    } catch (err) {
      console.error("Error fetching user reviews:", err);
    }
  };

  const fetchProductReviews = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, selectedService]);

  // Cart Operations
  const addToCart = (product, qty = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prevCart, { product, quantity: qty }];
    });
    onShowToast && onShowToast("Added to Cart", `${product.title} added to your shopping cart.`, "success");
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        onShowToast && onShowToast("Removed from Wishlist", `${product.title} removed.`, "info");
        return prev.filter(item => item.id !== product.id);
      } else {
        onShowToast && onShowToast("Added to Wishlist", `${product.title} saved to wishlist.`, "success");
        return [...prev, product];
      }
    });
  };

  const safeCart = Array.isArray(cart) ? cart.filter(item => item && item.product) : [];
  const cartSubtotal = safeCart.reduce((sum, item) => sum + ((item?.product?.price || 0) * (item?.quantity || 1)), 0);
  const deliveryFee = safeCart.length > 0 ? 60.0 : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    fetchProductReviews(product.id);
  };

  // Direct Buy Button Handler (Opens checkout payment popup directly, does NOT touch cart)
  const handleInstantBuy = (product) => {
    if (product.stockQuantity <= 0) {
      onShowToast && onShowToast("Out of Stock", "This product is currently out of stock for instant purchase.", "error");
      return;
    }
    setInstantBuyProduct(product);
    setSelectedProduct(null);
    setCheckoutModalOpen(true);
  };

  // Device File Upload Handler (Base64 conversion)
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onShowToast && onShowToast("File Too Large", "Please select an image smaller than 5MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewReviewBase64Photo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);

    try {
      const itemsPayload = instantBuyProduct 
        ? [{ productId: instantBuyProduct.id, quantity: 1 }]
        : cart.map(item => ({ productId: item.product.id, quantity: item.quantity }));

      if (itemsPayload.length === 0) {
        setPaymentProcessing(false);
        return;
      }

      const orderPayload = {
        userId: currentUser.id,
        serviceBookingId: contextualBooking ? contextualBooking.id : null,
        customerName: deliveryForm.customerName,
        phone: deliveryForm.phone,
        address: deliveryForm.address,
        division: deliveryForm.division,
        district: deliveryForm.district,
        area: deliveryForm.area,
        postalCode: deliveryForm.postalCode,
        deliveryInstructions: deliveryForm.deliveryInstructions,
        paymentMethod: deliveryForm.paymentMethod,
        items: itemsPayload
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const orderData = await res.json();

        if (deliveryForm.paymentMethod !== 'CASH_ON_DELIVERY') {
          await fetch(`${API_BASE}/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: orderData.orderNumber,
              transactionId: `BKASH-TXN-${Date.now().toString().slice(-6)}`
            })
          });
        }

        setPlacedOrder(orderData);
        if (instantBuyProduct) {
          setInstantBuyProduct(null);
        } else {
          clearCart();
        }
        setCheckoutModalOpen(false);
        fetchUserOrders();
        fetchProducts();
        onShowToast && onShowToast("Order Placed 🎉", `Order ${orderData.orderNumber} confirmed!`, "success");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      onShowToast && onShowToast("Checkout Failed", "Could not complete order. Please try again.", "error");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: 'PUT'
      });
      if (res.ok) {
        onShowToast && onShowToast("Order Cancelled", "Your order has been cancelled.", "info");
        fetchUserOrders();
        fetchProducts();
      } else {
        const errText = await res.text();
        onShowToast && onShowToast("Cancellation Failed", errText, "error");
      }
    } catch (err) {
      console.error("Cancel order failed:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: reviewModalProduct.id,
          userId: currentUser.id,
          rating: newReviewRating,
          comment: newReviewComment,
          photoUrl: newReviewBase64Photo
        })
      });

      if (res.ok) {
        onShowToast && onShowToast("Review Submitted ⭐", "Thank you for your verified product review!", "success");
        setReviewModalOrder(null);
        setReviewModalProduct(null);
        setNewReviewComment('');
        setNewReviewBase64Photo('');
        fetchUserOrders();
        fetchUserReviews();
        fetchProducts();
      } else {
        const errMsg = await res.text();
        onShowToast && onShowToast("Review Error", errMsg, "error");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Check if current user has a DELIVERED order containing this product
  const userHasDeliveredProduct = (productId) => {
    if (!currentUser || !currentUser.id) return false;
    return userOrders.some(o => 
      o.orderStatus === 'DELIVERED' && 
      o.items.some(item => (item.product?.id === productId || item.product_id === productId))
    );
  };

  // Check if user already submitted a review for this product
  const userAlreadyReviewedProduct = (productId) => {
    if (!productId) return false;
    const prodId = Number(productId);
    return userReviews.some(r => Number(r.product?.id || r.productId || r.product_id) === prodId) ||
           reviews.some(r => (Number(r.user?.id || r.user_id) === Number(currentUser?.id)) && Number(r.product?.id || r.productId || r.product_id) === prodId);
  };

  // Filter My Orders Sub-Tabs
  const activeOrdersList = userOrders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');
  const deliveredOrdersList = userOrders.filter(o => o.orderStatus === 'DELIVERED');
  const cancelledOrdersList = userOrders.filter(o => o.orderStatus === 'CANCELLED');

  // Render Order Status Visual Timeline Steps (EXCLUDES PAYMENT_CONFIRMED for Cash on Delivery!)
  const renderOrderTimeline = (status, paymentMethod) => {
    let steps = [
      { key: 'ORDER_PLACED', label: 'Order Placed' },
      { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed' },
      { key: 'PROCESSING', label: 'Processing' },
      { key: 'PACKED', label: 'Packed' },
      { key: 'SHIPPED', label: 'Shipped' },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
      { key: 'DELIVERED', label: 'Delivered' }
    ];

    // Hide PAYMENT_CONFIRMED for Cash on Delivery!
    const isCOD = paymentMethod && (paymentMethod.toUpperCase().includes('CASH') || paymentMethod.toUpperCase().includes('COD'));
    if (isCOD) {
      steps = steps.filter(s => s.key !== 'PAYMENT_CONFIRMED');
    }

    const currentIdx = steps.findIndex(s => s.key === status);
    const activeIndex = currentIdx === -1 ? 0 : currentIdx;

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.2rem', marginBottom: '1.2rem', position: 'relative', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, minWidth: '75px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isDone ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                color: isDone ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '0.75rem',
                border: isCurrent ? '2px solid #3b82f6' : 'none',
                boxShadow: isDone ? '0 0 8px rgba(16,185,129,0.4)' : 'none'
              }}>
                {isDone ? <CheckCircle size={14} /> : idx + 1}
              </div>
              <span style={{ fontSize: '0.65rem', color: isDone ? '#fff' : 'var(--text-muted)', marginTop: '0.3rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

      {/* --- CONTEXTUAL SERVICE BANNER --- */}
      {contextualBooking && (
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
          border: '1px solid var(--primary)',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          borderRadius: '12px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Wrench size={24} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>
                Shopping Required Parts for Service Request #{contextualBooking.id}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Service: <strong>{contextualBooking.serviceType}</strong> | Showing recommended tools & spare parts
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => {
            setSelectedService('All');
            onCloseContextual && onCloseContextual();
          }}>
            Show All Products
          </button>
        </div>
      )}

      {/* --- HEADER BAR --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={32} color="var(--primary)" />
            <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', margin: 0 }}>Tool Store</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Find the certified tools, spare parts, and accessories you need for your home maintenance and repair services.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Store
          </button>

          <button 
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab('orders'); fetchUserOrders(); }}
            style={{ position: 'relative' }}
          >
            <Package size={16} /> My Orders
            {userOrders.length > 0 && (
              <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', marginLeft: '0.4rem' }}>
                {userOrders.length}
              </span>
            )}
          </button>

          {currentUser?.role === 'WORKER' && (
            <button 
              className={`btn ${activeTab === 'my-tools' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('my-tools')}
            >
              <Wrench size={16} /> My Tools & Equipment
            </button>
          )}

          <button 
            className="btn btn-secondary" 
            onClick={() => setActiveTab('wishlist')}
            style={{ position: 'relative' }}
            title="Wishlist"
          >
            <Heart size={18} color={wishlist.length > 0 ? "var(--accent-rose)" : "currentColor"} fill={wishlist.length > 0 ? "var(--accent-rose)" : "none"} />
            {wishlist.length > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--accent-rose)', color: '#fff', fontSize: '0.65rem', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishlist.length}
              </span>
            )}
          </button>

          <button 
            className="btn btn-primary" 
            onClick={() => setActiveTab('cart')}
            style={{ position: 'relative', padding: '0.5rem 1.2rem', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' }}
          >
            <ShoppingBag size={18} /> Cart
            {cart.length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontWeight: 'bold', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '12px', marginLeft: '0.4rem' }}>
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- SLEEK SEARCH & CATEGORY FILTERS UI WITH HIGH CONTRAST & ROUNDED CORNERS --- */}
      {activeTab === 'browse' && (
        <>
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(14, 21, 38, 0.95) 0%, rgba(20, 30, 55, 0.95) 100%)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              
              {/* Search Bar with Smooth Rounded Corners */}
              <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search tools, capacitors, brand, model or SKU (e.g. AC capacitor, multimeter)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.8rem', height: '46px', fontSize: '0.95rem', background: '#131b2e', color: '#ffffff', borderRadius: '12px', borderColor: 'rgba(16,185,129,0.5)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Service Filter Dropdown (Bright white text, dark background, rounded corners) */}
              <div>
                <select 
                  className="form-input" 
                  style={{ height: '46px', background: '#131b2e', color: '#ffffff', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', fontWeight: '600', paddingLeft: '1rem' }}
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="All" style={{ background: '#131b2e', color: '#ffffff' }}>All Compatible Services</option>
                  <option value="AC Servicing / Repair" style={{ background: '#131b2e', color: '#ffffff' }}>AC Servicing / Repair</option>
                  <option value="Refrigerator Repair" style={{ background: '#131b2e', color: '#ffffff' }}>Refrigerator Repair</option>
                  <option value="Electrical Wiring / Circuit Repair" style={{ background: '#131b2e', color: '#ffffff' }}>Electrical Wiring</option>
                  <option value="Plumbing & Water-Line Repair" style={{ background: '#131b2e', color: '#ffffff' }}>Plumbing & Water Line</option>
                  <option value="Fan Servicing / Repair" style={{ background: '#131b2e', color: '#ffffff' }}>Fan Servicing</option>
                </select>
              </div>

              {/* Price / Rating Sort Dropdown (Bright white text, dark background, rounded corners) */}
              <div>
                <select 
                  className="form-input" 
                  style={{ height: '46px', background: '#131b2e', color: '#ffffff', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.2)', fontWeight: '600', paddingLeft: '1rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended" style={{ background: '#131b2e', color: '#ffffff' }}>Sort: Recommended</option>
                  <option value="price_asc" style={{ background: '#131b2e', color: '#ffffff' }}>Price: Low → High</option>
                  <option value="price_desc" style={{ background: '#131b2e', color: '#ffffff' }}>Price: High → Low</option>
                  <option value="rating" style={{ background: '#131b2e', color: '#ffffff' }}>Highest Rated</option>
                  <option value="discount" style={{ background: '#131b2e', color: '#ffffff' }}>Biggest Discount</option>
                  <option value="popular" style={{ background: '#131b2e', color: '#ffffff' }}>Most Popular</option>
                </select>
              </div>

            </div>

            {/* Category Chips Bar */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
              <button 
                className={`btn ${selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '24px', padding: '0.4rem 1.2rem', fontSize: '0.85rem', fontWeight: 'bold' }}
                onClick={() => setSelectedCategory('All')}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  className={`btn ${selectedCategory === cat.name ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '24px', padding: '0.4rem 1.2rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* --- PRODUCT GRID --- */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <RefreshCw className="spin" size={32} style={{ marginBottom: '1rem' }} />
              <div>Loading Tool Store Catalog...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
              <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem' }}>No Products Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Try clearing your search query or selecting a different category filter.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setSelectedService('All'); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ padding: 0, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {products.map(product => (
                <div key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '1.2rem', position: 'relative', height: '100%' }}>
                  
                  {/* Discount Badge */}
                  {product.discountPercent > 0 && (
                    <span style={{
                      position: 'absolute', top: 18, left: 18, zIndex: 2,
                      background: 'var(--accent-rose)', color: '#fff',
                      fontWeight: 'bold', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px'
                    }}>
                      {product.discountPercent}% OFF
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    style={{
                      position: 'absolute', top: 18, right: 18, zIndex: 2,
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                      width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Heart size={16} color={wishlist.some(w => w.id === product.id) ? "var(--accent-rose)" : "#fff"} fill={wishlist.some(w => w.id === product.id) ? "var(--accent-rose)" : "none"} />
                  </button>

                  {/* Image */}
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    onClick={() => handleOpenDetails(product)}
                    style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}
                  />

                  {/* Category & Brand */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                    <span>{product.brand}</span>
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => handleOpenDetails(product)}
                    style={{ fontSize: '1.05rem', marginBottom: '0.4rem', cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {product.title}
                  </h3>

                  {/* Rating & Stock Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-gold)' }}>
                      <Star size={14} fill="var(--accent-gold)" />
                      <strong>{product.rating}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({product.reviewCount})</span>
                    </div>

                    <span style={{
                      fontSize: '0.75rem', fontWeight: 'bold',
                      color: product.stockQuantity > 5 ? 'var(--primary)' : product.stockQuantity > 0 ? '#f59e0b' : '#ef4444'
                    }}>
                      {product.stockQuantity > 5 ? `In Stock (${product.stockQuantity})` : product.stockQuantity > 0 ? `Only ${product.stockQuantity} Left` : `Out of Stock`}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                  </p>

                  {/* Price & Action Buttons */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.8rem' }}>
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>৳{product.price}</span>
                        {product.oldPrice && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                            ৳{product.oldPrice}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{product.warranty}</span>
                    </div>

                    {/* Both Add to Cart AND Direct Buy Now Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                        onClick={() => addToCart(product, 1)}
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>

                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                        onClick={() => handleInstantBuy(product)}
                        disabled={product.stockQuantity <= 0}
                      >
                        <Zap size={14} /> Buy Now
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* --- CART TAB --- */}
      {activeTab === 'cart' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag color="var(--primary)" /> Shopping Cart ({cart.length} items)
          </h2>

          {cart.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3>Your cart is empty</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Explore our tool store to add products, spare parts, and accessories.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('browse')}>
                Browse Store Products
              </button>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <img src={item.product.imageUrl} alt={item.product.title} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.product.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.product.category} | SKU: {item.product.sku}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.2rem' }}>
                        ৳{item.product.price} × {item.quantity} = ৳{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.2rem' }}>
                      <button className="btn-icon" onClick={() => updateCartQuantity(item.product.id, -1)} style={{ padding: '0.2rem' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button className="btn-icon" onClick={() => updateCartQuantity(item.product.id, 1)} style={{ padding: '0.2rem' }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <button className="btn-icon" onClick={() => removeFromCart(item.product.id)} style={{ color: '#ef4444' }}>
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Subtotal:</span>
                  <strong>৳{cartSubtotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>Standard Delivery Charge (Bangladesh):</span>
                  <strong>৳{deliveryFee.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  <span>Total Payable:</span>
                  <span>৳{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setActiveTab('browse')}>
                  Continue Shopping
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setInstantBuyProduct(null); setCheckoutModalOpen(true); }}>
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MY ORDERS TAB WITH THREE SUB-NAVS --- */}
      {activeTab === 'orders' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package color="var(--primary)" /> My Orders & Delivery Tracking
          </h2>

          {/* Sub-Nav Tabs: Active Orders, Delivered Orders, Cancelled Orders */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <button 
              className={`btn ${orderSubTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setOrderSubTab('active')}
              style={{ fontSize: '0.85rem', borderRadius: '20px' }}
            >
              Active Orders ({activeOrdersList.length})
            </button>
            <button 
              className={`btn ${orderSubTab === 'delivered' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setOrderSubTab('delivered')}
              style={{ fontSize: '0.85rem', borderRadius: '20px' }}
            >
              Delivered Orders ({deliveredOrdersList.length})
            </button>
            <button 
              className={`btn ${orderSubTab === 'cancelled' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setOrderSubTab('cancelled')}
              style={{ fontSize: '0.85rem', borderRadius: '20px' }}
            >
              Cancelled Orders ({cancelledOrdersList.length})
            </button>
          </div>

          {/* List display based on selected sub-tab */}
          {(() => {
            const currentList = orderSubTab === 'active' ? activeOrdersList : orderSubTab === 'delivered' ? deliveredOrdersList : cancelledOrdersList;

            if (currentList.length === 0) {
              return (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <h3>No {orderSubTab} orders found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>You have no orders in this section.</p>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {currentList.map(order => (
                  <div key={order.id} className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                          Order {order.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Placed on: {new Date(order.placedAt).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-verified" style={{ fontSize: '0.8rem' }}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                        </div>
                      </div>
                    </div>

                    {/* Order Visual Timeline (EXCLUDES PAYMENT_CONFIRMED for COD) */}
                    {renderOrderTimeline(order.orderStatus, order.paymentMethod)}

                    {/* Items List */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      {(order.items || []).map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src={item.productImageUrl || item.product?.imageUrl} alt={item.productTitle} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '4px' }} />
                            <span>{item.productTitle} (x{item.quantity})</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <strong>৳{item.subtotal}</strong>
                            
                            {/* Review Button for Delivered Orders */}
                            {order.orderStatus === 'DELIVERED' && (
                              userAlreadyReviewedProduct(item.product?.id || item.product_id) ? (
                                <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle size={12} /> Reviewed
                                </span>
                              ) : (
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                                  onClick={() => {
                                    setReviewModalOrder(order);
                                    setReviewModalProduct(item.product || { id: item.product_id, title: item.productTitle });
                                  }}
                                >
                                  <Star size={12} fill="#fff" /> Review Product
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--primary)' }}>
                        <span>Total Paid (Inc. Delivery Charge):</span>
                        <span>৳{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Footer Actions (Cancel Order before OUT_FOR_DELIVERY) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <strong>Delivery Address:</strong> {order.address}, {order.area}, {order.district}
                      </div>

                      {orderSubTab === 'active' && !['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus) && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ color: '#ef4444', borderColor: '#ef4444', fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <XCircle size={14} /> Cancel Order
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* --- WORKER MY TOOLS & EQUIPMENT TAB --- */}
      {activeTab === 'my-tools' && currentUser?.role === 'WORKER' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench color="var(--primary)" /> My Tools & Hardware Equipment
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Verified tool inventory purchased for professional service execution and warranty tracking.
          </p>

          <div className="dashboard-grid" style={{ padding: 0 }}>
            {(userOrders || []).flatMap(o => o.items || []).map((item, idx) => (
              <div key={idx} className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.2rem' }}>
                <img src={item.productImageUrl || item.product?.imageUrl} alt={item.productTitle} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.productTitle}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category: {item.productCategory}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.3rem' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    Active Warranty Covered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- WISHLIST TAB --- */}
      {activeTab === 'wishlist' && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart color="var(--accent-rose)" fill="var(--accent-rose)" /> Saved Wishlist ({wishlist.length})
          </h2>

          {wishlist.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Heart size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3>Your wishlist is empty</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Click the heart icon on any tool or part to save it here.</p>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ padding: 0 }}>
              {wishlist.map(product => (
                <div key={product.id} className="glass-card" style={{ padding: '1.2rem' }}>
                  <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '8px', marginBottom: '0.8rem' }} />
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{product.title}</h4>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.8rem' }}>৳{product.price}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => addToCart(product, 1)}>
                      Add to Cart
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => toggleWishlist(product)}>
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- PRODUCT DETAILS MODAL (WITH BOTH CART & DIRECT BUY BUTTONS) --- */}
      {selectedProduct && (
        <div className="toast-popup-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#0e1526' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-gold">{selectedProduct.category}</span>
                <h2 style={{ fontSize: '1.4rem', marginTop: '0.4rem', marginBottom: '0.2rem' }}>{selectedProduct.title}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brand: {selectedProduct.brand} | Model: {selectedProduct.model} | SKU: {selectedProduct.sku}</div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedProduct(null)}>
                <XCircle size={24} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }} />
              
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  ৳{selectedProduct.price}
                  {selectedProduct.oldPrice && (
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.6rem' }}>
                      ৳{selectedProduct.oldPrice}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                  <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {selectedProduct.warranty}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.2rem' }}>
                  {selectedProduct.description}
                </p>

                {/* Compatibility Box */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.3rem' }}>Compatible Services:</div>
                  <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{selectedProduct.compatibleServices || "Universal Maintenance"}</div>
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.3rem' }}>Compatible Models:</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{selectedProduct.compatibleModels || "Universal Standard Models"}</div>
                </div>

                {/* Both Add to Cart AND Buy Now Buttons inside Product Details */}
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.8rem' }}
                    onClick={() => { addToCart(selectedProduct, 1); }}
                  >
                    <ShoppingBag size={18} /> Add to Cart
                  </button>

                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '0.8rem' }}
                    onClick={() => handleInstantBuy(selectedProduct)}
                    disabled={selectedProduct.stockQuantity <= 0}
                  >
                    <Zap size={18} /> Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            {selectedProduct.specifications && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.8rem' }}>Technical Specifications</h4>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '0.8rem' }}>
                  {(() => {
                    try {
                      const specs = JSON.parse(selectedProduct.specifications);
                      return (
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                          <tbody>
                            {Object.entries(specs).map(([key, val]) => (
                              <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold', width: '40%' }}>{key}</td>
                                <td style={{ padding: '0.5rem', color: '#fff' }}>{val}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    } catch (e) {
                      return <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedProduct.specifications}</div>;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Verified Customer Reviews Section */}
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.8rem' }}>Verified Customer Reviews ({reviews.length})</h4>

              {/* Informative notice if user hasn't delivered purchase */}
              {!userHasDeliveredProduct(selectedProduct.id) && (
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  ℹ️ You can submit a verified review after this product has been delivered to you.
                </div>
              )}

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {reviews.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews submitted yet for this product.</div>
                ) : (
                  reviews.map(rev => (
                    <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <strong>{rev.user?.name || 'Verified Buyer'}</strong>
                        <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>Verified Purchase</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.2rem', margin: '0.2rem 0' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>{rev.comment}</p>
                      {rev.photoUrl && (
                        <img src={rev.photoUrl} alt="Product Review Attachment" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '8px', marginTop: '0.4rem', border: '1px solid var(--border-color)' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- REVIEW SUBMISSION MODAL (DEVICE FILE PICKER + ONE REVIEW LIMIT) --- */}
      {reviewModalProduct && (
        <div className="toast-popup-overlay">
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: '#0e1526' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Review Product — {reviewModalProduct.title}</h3>
              <button className="btn-icon" onClick={() => { setReviewModalOrder(null); setReviewModalProduct(null); }}>
                <XCircle size={20} color="var(--text-muted)" />
              </button>
            </div>

            {userAlreadyReviewedProduct(reviewModalProduct.id) ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <CheckCircle size={40} color="var(--primary)" style={{ marginBottom: '0.8rem' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Review Submitted</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  You have already submitted a review for this product. Multiple reviews or modifications are not permitted once submitted.
                </p>
                <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { setReviewModalOrder(null); setReviewModalProduct(null); }}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Star Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={24} 
                        style={{ cursor: 'pointer' }}
                        fill={star <= newReviewRating ? "var(--accent-gold)" : "none"}
                        color="var(--accent-gold)"
                        onClick={() => setNewReviewRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Written Review</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    required
                    placeholder="Share your experience regarding performance, build quality, or compatibility..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                  />
                </div>

                {/* Device File Picker (Upload photo from device) */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Upload Product Image from Device (Optional)
                  </label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={16} /> Choose Image File
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {newReviewBase64Photo && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        Image Selected ✓
                      </span>
                    )}
                  </div>

                  {newReviewBase64Photo && (
                    <div style={{ marginTop: '0.8rem', position: 'relative', display: 'inline-block' }}>
                      <img src={newReviewBase64Photo} alt="Review Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--primary)' }} />
                      <button 
                        type="button" 
                        onClick={() => setNewReviewBase64Photo('')}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setReviewModalOrder(null); setReviewModalProduct(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={reviewSubmitting}>
                    Submit Verified Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- BANGLADESH CHECKOUT POPUP OVERLAY (PROMPTED DIRECTLY BY BUY NOW) --- */}
      {checkoutModalOpen && (
        <div className="toast-popup-overlay">
          <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: '#0e1526', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag color="var(--primary)" /> Checkout & Delivery Information
              </h2>
              <button className="btn-icon" onClick={() => setCheckoutModalOpen(false)}>
                <XCircle size={22} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.8rem' }}>Customer & Delivery Address</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Name</label>
                  <input type="text" className="form-input" required value={deliveryForm.customerName} onChange={(e) => setDeliveryForm({ ...deliveryForm, customerName: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</label>
                  <input type="text" className="form-input" required value={deliveryForm.phone} onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Delivery Address</label>
                <input type="text" className="form-input" required value={deliveryForm.address} onChange={(e) => setDeliveryForm({ ...deliveryForm, address: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Division</label>
                  <select className="form-input" value={deliveryForm.division} onChange={(e) => setDeliveryForm({ ...deliveryForm, division: e.target.value })}>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Sylhet">Sylhet</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>District</label>
                  <input type="text" className="form-input" required value={deliveryForm.district} onChange={(e) => setDeliveryForm({ ...deliveryForm, district: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Area / Thana</label>
                  <input type="text" className="form-input" required value={deliveryForm.area} onChange={(e) => setDeliveryForm({ ...deliveryForm, area: e.target.value })} />
                </div>
              </div>

              {/* Payment Method Selector */}
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.8rem' }}>Payment Method</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.2rem' }}>
                {['BKASH', 'NAGAD', 'ROCKET', 'CASH_ON_DELIVERY'].map(method => (
                  <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: deliveryForm.paymentMethod === method ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)', border: deliveryForm.paymentMethod === method ? '1px solid var(--primary)' : '1px solid var(--border-color)', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={deliveryForm.paymentMethod === method}
                      onChange={() => setDeliveryForm({ ...deliveryForm, paymentMethod: method })}
                    />
                    <span style={{ fontWeight: 'bold' }}>{method.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>

              {/* Order Amount Breakdown */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                {instantBuyProduct ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span>Instant Item ({instantBuyProduct.title}):</span>
                    <span>৳{instantBuyProduct.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span>Items Subtotal:</span>
                    <span>৳{cartSubtotal.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Standard Delivery Charge:</span>
                  <span>৳60.00</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                  <span>Total Amount:</span>
                  <span>৳{(instantBuyProduct ? instantBuyProduct.price + 60 : cartTotal).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' }} disabled={paymentProcessing}>
                {paymentProcessing ? 'Processing Order...' : `Place Order (৳${(instantBuyProduct ? instantBuyProduct.price + 60 : cartTotal).toFixed(2)})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ORDER CONFIRMATION CELEBRATION MODAL --- */}
      {placedOrder && (
        <div className="toast-popup-overlay">
          <div className="glass-card" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem', textAlign: 'center', background: '#0e1526' }}>
            <CheckCircle size={56} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🎉 Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your order <strong>{placedOrder.orderNumber}</strong> has been received with status <strong style={{ color: 'var(--primary)' }}>Order Placed</strong>.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0', textAlign: 'left', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Total Paid:</span>
                <strong style={{ color: 'var(--primary)' }}>৳{placedOrder.totalAmount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Payment Method:</span>
                <strong>{placedOrder.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated Delivery:</span>
                <strong>Within 24-48 Hours</strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={() => { setPlacedOrder(null); setActiveTab('orders'); setOrderSubTab('active'); }}>
              Track Order Status <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

class ToolStoreErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tool Store Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-primary)' }}>
          <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
            <AlertTriangle size={48} color="var(--accent-gold)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Tool Store Display Warning</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              A temporary display error occurred while rendering store products or saved cart data.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                localStorage.removeItem('skillverse_store_cart');
                localStorage.removeItem('skillverse_store_wishlist');
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              <RefreshCw size={16} /> Reset Store Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ToolStoreHub(props) {
  return (
    <ToolStoreErrorBoundary>
      <ToolStoreContent {...props} />
    </ToolStoreErrorBoundary>
  );
}
