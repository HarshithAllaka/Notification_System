import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, Bell, Settings, MapPin, ShoppingBag, Tag, Mail, User, Package, CheckCircle2, MessageSquare, Smartphone, Sparkles } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserHome = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('INBOX'); // INBOX, SHOP, ORDERS
  const [user, setUser] = useState({});
  const [pref, setPref] = useState({}); // Preferences

  // Data State
  const [notifications, setNotifications] = useState([]);
  const [products, setProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // Filter State (Inbox)
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeChannel, setActiveChannel] = useState('ALL');

  // --- HELPER: GROUP NOTIFICATIONS ---
  // This groups separate logs (Email/SMS) into one object if message content is same
  const groupNotifications = (rawList) => {
    const groupedMap = new Map();
    (rawList || []).forEach(n => {
      const key = `${n.message}|${n.content}|${n.campaignType}`;

      // Normalize channels to always be an array
      const currentChannels = Array.isArray(n.channels) ? n.channels : (n.channels ? [n.channels] : []);

      if (groupedMap.has(key)) {
        const existing = groupedMap.get(key);
        // Merge unique channels
        existing.channels = [...new Set([...(existing.channels || []), ...currentChannels])];
        // Keep the latest time
        if (new Date(n.receivedAt) > new Date(existing.receivedAt)) {
          existing.receivedAt = n.receivedAt;
        }
      } else {
        groupedMap.set(key, { ...n, channels: currentChannels });
      }
    });
    return Array.from(groupedMap.values()).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  };

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadData = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) { navigate('/login'); return; }

      const u = JSON.parse(storedUser);
      setUser(u);

      try {
        // Fetch all required data in parallel
        const [notifRes, prefRes, prodRes, ordRes] = await Promise.all([
          api.get('/users/notifications'),
          api.get('/users/preferences'),
          api.get('/shop/products'),
          api.get('/shop/my-orders')
        ]);

        // Set Data with Grouping Logic Applied
        setNotifications(groupNotifications(notifRes.data));
        setPref(prefRes.data || {});
        setProducts(prodRes.data || []);
        setMyOrders(ordRes.data || []);

      } catch (err) {
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          localStorage.clear(); navigate('/login');
        }
        // Fallback for empty data
        setNotifications([]);
        setProducts([]);
        setMyOrders([]);
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- ACTIONS ---

  const updatePref = async (key) => {
    const newPref = { ...pref, [key]: !pref[key] };
    setPref(newPref);
    try { await api.put('/users/preferences', newPref); } catch (err) { setPref(pref); }
  };

  const handleBuy = async (productId) => {
    try {
      // 1. Place Order
      await api.post(`/shop/order/${productId}`);
      toast.success("Order Placed Successfully! Check your Inbox.");

      // 2. Refresh Data (Orders & Notifications)
      const [ordRes, notifRes] = await Promise.all([
        api.get('/shop/my-orders'),
        api.get('/users/notifications')
      ]);

      setMyOrders(ordRes.data);
      // Apply grouping logic to the refreshed notifications too
      setNotifications(groupNotifications(notifRes.data));

      // 3. Switch to Inbox to see the notification
      setActiveTab('INBOX');
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  // --- FILTERING LOGIC (Inbox) ---
  const getFilteredNotifications = () => {
    let filtered = notifications;
    if (activeCategory === 'Promotion Offers') {
      // Promotions are anything that isn't Newsletter or Order
      filtered = filtered.filter(n => n.campaignType !== 'Newsletters' && n.campaignType !== 'Order Updates');
    } else if (activeCategory !== 'ALL') {
      filtered = filtered.filter(n => n.campaignType === activeCategory);
    }

    if (activeChannel !== 'ALL') {
      filtered = filtered.filter(n => n.channels && n.channels.includes(activeChannel));
    }
    return filtered;
  };

  const categories = [
    { id: 'ALL', label: 'All', icon: Bell },
    { id: 'Promotion Offers', label: 'Promotions', icon: Tag },
    { id: 'Newsletters', label: 'Newsletters', icon: Mail },
    { id: 'Order Updates', label: 'Orders', icon: ShoppingBag },
  ];

  // Helper for Styles
  const getNotificationStyle = (type) => {
    if (type === 'Order Updates') return { icon: Package, color: 'bg-green-50 text-green-600 group-hover:bg-green-100', border: 'bg-green-500', badge: 'bg-green-50 text-green-700' };
    if (type === 'Newsletters') return { icon: Mail, color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100', border: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' };
    // Default: Promotions
    return { icon: Tag, color: 'bg-nykaa-50 text-nykaa-600 group-hover:bg-nykaa-100', border: 'bg-nykaa-500', badge: 'bg-nykaa-50 text-nykaa-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <ToastContainer position="top-center" theme="colored" hideProgressBar={true} autoClose={2000} />

      {/* NAVIGATION */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-nykaa-600 to-brand-purple font-extrabold text-2xl tracking-tighter cursor-pointer" onClick={() => setActiveTab('INBOX')}>
          <Sparkles className="w-6 h-6 text-nykaa-500 fill-nykaa-500" /> Nykaa.
        </div>

        {/* CENTER TABS */}
        <div className="hidden md:flex gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
          {['INBOX', 'SHOP', 'ORDERS'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`font-bold px-6 py-2 rounded-full transition-all text-sm ${activeTab === tab ? 'bg-white text-nykaa-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/newsletters')} className="hidden sm:flex items-center gap-1 font-bold text-sm text-nykaa-600 bg-nykaa-50 px-3 py-1.5 rounded-full hover:bg-nykaa-100 transition">
            Newsletters <span className="w-2 h-2 rounded-full bg-nykaa-500 animate-pulse"></span>
          </button>
          <div className="w-px h-6 bg-gray-200 mx-2"></div>
          <button onClick={() => navigate('/profile')} className="text-gray-500 hover:text-nykaa-600 font-medium flex items-center gap-2 transition group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nykaa-100 to-purple-100 flex items-center justify-center text-nykaa-700 font-bold text-xs group-hover:scale-110 transition">{user.name?.charAt(0)}</div>
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 font-medium flex items-center gap-2 transition p-2 hover:bg-red-50 rounded-full"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-10 p-6 grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">

        {/* LEFT SIDEBAR: Profile & Settings (Sticky) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-nykaa-400 to-brand-purple rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-nykaa-500/20">{user.name?.charAt(0)}</div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 leading-tight">{user.name}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium"><MapPin className="w-3 h-3 text-nykaa-500" /> {user.city || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-6">
              <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-nykaa-50 text-sm font-bold text-gray-600 hover:text-nykaa-600 transition group">
                <span>Manage Profile</span>
                <Settings className="w-4 h-4 text-gray-400 group-hover:text-nykaa-500" />
              </button>
              <p className="text-[10px] text-gray-400 mt-4 leading-relaxed text-center">
                Go to Profile to manage your notification preferences and account settings.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="lg:col-span-3">

          {/* --- TAB: INBOX --- */}
          {activeTab === 'INBOX' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">Your Inbox</h2>
              </div>

              {/* CATEGORY TABS */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-nykaa-600 text-white shadow-lg shadow-nykaa-500/30 ring-2 ring-nykaa-600 ring-offset-2' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                      }`}>
                    <cat.icon className="w-4 h-4" /> {cat.label}
                  </button>
                ))}
              </div>

              {/* NOTIFICATION LIST */}
              <div className="space-y-4">
                {getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">All Quiet Here</h3>
                    <p className="text-gray-400">You have no new notifications.</p>
                  </div>
                ) : (
                  getFilteredNotifications().map((n, i) => {
                    const style = getNotificationStyle(n.campaignType);
                    const Icon = style.icon;

                    return (
                      <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex gap-5 group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${style.border}`}></div>

                        {/* LARGE ICON (LEFT) */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${style.color}`}>
                          <Icon size={24} />
                        </div>

                        <div className="flex-1">
                          {/* HEADER ROW */}
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${style.badge}`}>
                                {n.campaignType || 'PROMOTION'}
                              </span>
                              <span className="text-xs text-gray-400 font-medium">{new Date(n.receivedAt).toLocaleString()}</span>
                            </div>

                            {/* CHANNEL ICONS (RIGHT) */}
                            <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                              {n.channels && n.channels.includes('EMAIL') && (
                                <span title="Received via Email" className="bg-amber-50 text-amber-600 p-1.5 rounded-lg"><Mail size={14} /></span>
                              )}
                              {n.channels && n.channels.includes('SMS') && (
                                <span title="Received via SMS" className="bg-blue-50 text-blue-600 p-1.5 rounded-lg"><MessageSquare size={14} /></span>
                              )}
                              {n.channels && n.channels.includes('PUSH') && (
                                <span title="Received via Push Notification" className="bg-purple-50 text-purple-600 p-1.5 rounded-lg"><Smartphone size={14} /></span>
                              )}
                            </div>
                          </div>

                          <h4 className="font-bold text-gray-900 text-lg group-hover:text-nykaa-600 transition-colors">{n.message}</h4>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{n.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* --- TAB: SHOP --- */}
          {activeTab === 'SHOP' && (
            <>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-900">Featured Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                    <div className="h-48 bg-gray-50 rounded-2xl mb-5 flex items-center justify-center text-gray-300 group-hover:bg-nykaa-50 transition-colors relative overflow-hidden">
                      <ShoppingBag size={56} className="text-gray-200 group-hover:text-nykaa-200 transition-colors" />
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">New Arrival</div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{p.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="mt-auto flex justify-between items-center pt-5 border-t border-gray-50">
                      <span className="font-bold text-2xl text-gray-900">₹{p.price}</span>
                      <button onClick={() => handleBuy(p.id)} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-nykaa-600 transition-colors shadow-lg shadow-gray-200 active:scale-95 flex items-center gap-2">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-3 text-center py-20 text-gray-400">
                    No products available in the shop right now.
                  </div>
                )}
              </div>
            </>
          )}

          {/* --- TAB: ORDERS --- */}
          {activeTab === 'ORDERS' && (
            <>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-900">Order History</h2>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                {myOrders.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <Package className="w-12 h-12 mb-4 text-gray-200" />
                    You haven't placed any orders yet.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="p-6 font-semibold">Product</th>
                        <th className="p-6 font-semibold">Date</th>
                        <th className="p-6 font-semibold">Amount</th>
                        <th className="p-6 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {myOrders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-6 font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-gray-400" /></div>
                            {o.productName}
                          </td>
                          <td className="p-6 text-sm text-gray-500 font-medium">{new Date(o.orderDate).toLocaleDateString()}</td>
                          <td className="p-6 font-bold text-gray-900">₹{o.amount}</td>
                          <td className="p-6">
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                              <CheckCircle2 size={12} /> {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserHome;