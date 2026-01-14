import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, Bell, Settings, MapPin, ShoppingBag, Tag, Mail, User, Package, CheckCircle2 } from 'lucide-react';
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

        // Set Data
        setNotifications((notifRes.data || []).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)));
        setPref(prefRes.data || {});
        setProducts(prodRes.data || []);
        setMyOrders(ordRes.data || []);

      } catch (err) {
        if(err.response && (err.response.status === 403 || err.response.status === 401)) {
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
        setNotifications((notifRes.data || []).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)));
        
        // 3. Switch to Inbox to see the notification
        setActiveTab('INBOX');
    } catch(err) {
        toast.error("Failed to place order. Please try again.");
    }
  };

  // --- FILTERING LOGIC (Inbox) ---
  const getFilteredNotifications = () => {
    let filtered = notifications;
    if (activeCategory !== 'ALL') {
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
       <ToastContainer position="top-center" theme="colored" />
       
       {/* NAVIGATION */}
       <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-2xl"><span>Nykaa.</span></div>
          
          {/* CENTER TABS */}
          <div className="hidden md:flex gap-8">
             <button onClick={() => setActiveTab('INBOX')} className={`font-bold pb-1 border-b-2 transition ${activeTab==='INBOX' ? 'text-pink-600 border-pink-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>Inbox</button>
             <button onClick={() => setActiveTab('SHOP')} className={`font-bold pb-1 border-b-2 transition ${activeTab==='SHOP' ? 'text-pink-600 border-pink-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>Shop</button>
             <button onClick={() => setActiveTab('ORDERS')} className={`font-bold pb-1 border-b-2 transition ${activeTab==='ORDERS' ? 'text-pink-600 border-pink-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>My Orders</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/profile')} className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-2 transition">
              <User className="w-5 h-5"/> <span className="hidden sm:inline">{user.name}</span>
            </button>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 transition"><LogOut className="w-5 h-5"/></button>
          </div>
       </nav>

       <div className="max-w-6xl mx-auto mt-10 p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR: Profile & Settings (Always Visible) */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl uppercase">{user.name?.charAt(0)}</div>
                    <div>
                        <h2 className="font-bold text-gray-900">{user.name}</h2>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {user.city || 'N/A'}</p>
                    </div>
                </div>
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Settings className="w-4 h-4"/> Preferences</h3>
                
                {/* PREFERENCES LIST */}
                <div className="space-y-4">
                   {/* PROMOTIONS */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Promotions</h4>
                    <div className="space-y-1">
                      {['emailOffers', 'smsOffers', 'pushOffers'].map(k => (
                          <label key={k} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <span className="text-sm text-gray-600 capitalize">{k.replace('Offers', '')}</span>
                              <input type="checkbox" checked={!!pref[k]} onChange={() => updatePref(k)} className="accent-pink-600"/>
                          </label>
                      ))}
                    </div>
                  </div>

                  {/* NEWSLETTERS (ADDED) */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Newsletters</h4>
                    <div className="space-y-1">
                      {['emailNewsletters', 'smsNewsletters', 'pushNewsletters'].map(k => (
                          <label key={k} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <span className="text-sm text-gray-600 capitalize">{k.replace('Newsletters', '')}</span>
                              <input type="checkbox" checked={!!pref[k]} onChange={() => updatePref(k)} className="accent-pink-600"/>
                          </label>
                      ))}
                    </div>
                  </div>

                   {/* ORDERS */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Orders</h4>
                    <div className="space-y-1">
                      {['emailOrders', 'smsOrders', 'pushOrders'].map(k => (
                          <label key={k} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <span className="text-sm text-gray-600 capitalize">{k.replace('Orders', '')}</span>
                              <input type="checkbox" checked={!!pref[k]} onChange={() => updatePref(k)} className="accent-pink-600"/>
                          </label>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
          </div>

          {/* RIGHT MAIN CONTENT AREA */}
          <div className="lg:col-span-3">

             {/* --- TAB: INBOX --- */}
             {activeTab === 'INBOX' && (
               <>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Bell className="w-6 h-6 text-pink-600"/> Your Inbox</h2>
                 </div>

                 {/* CATEGORY TABS */}
                 <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                                activeCategory === cat.id ? 'bg-pink-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}>
                            <cat.icon className="w-4 h-4" /> {cat.label}
                        </button>
                    ))}
                 </div>
                 
                 {/* NOTIFICATION LIST */}
                 <div className="space-y-4">
                    {getFilteredNotifications().length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                            <p className="text-gray-400">No messages found.</p>
                        </div>
                    ) : (
                        getFilteredNotifications().map((n, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                n.channels?.includes('SMS') ? 'bg-blue-50 text-blue-600' : 
                                n.channels?.includes('EMAIL') ? 'bg-yellow-50 text-yellow-600' : 'bg-pink-50 text-pink-600'
                            }`}>
                                {n.campaignType === 'Order Updates' ? <Package size={20}/> : <Tag size={20}/>}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-gray-100 text-gray-600">
                                        {n.campaignType || 'SYSTEM'}
                                    </span>
                                    <span className="text-xs text-gray-400">{new Date(n.receivedAt).toLocaleString()}</span>
                                </div>
                                <h4 className="font-bold text-gray-800">{n.message}</h4>
                                <p className="text-gray-600 text-sm mt-1">{n.content}</p>
                            </div>
                        </div>
                        ))
                    )}
                 </div>
               </>
             )}

             {/* --- TAB: SHOP --- */}
             {activeTab === 'SHOP' && (
                <>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-pink-600"/> Shop Products</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition">
                            <div className="h-40 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-300">
                                <ShoppingBag size={48} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                                <span className="font-bold text-xl text-gray-900">₹{p.price}</span>
                                <button onClick={() => handleBuy(p.id)} className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 transition active:scale-95">
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
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="w-6 h-6 text-pink-600"/> Order History</h2>
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        {myOrders.length === 0 ? (
                            <div className="p-10 text-center text-gray-400">You haven't placed any orders yet.</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Product</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {myOrders.map(o => (
                                        <tr key={o.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-bold text-gray-800">{o.productName}</td>
                                            <td className="p-4 text-sm text-gray-500">{new Date(o.orderDate).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium">₹{o.amount}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                    <CheckCircle2 size={12}/> {o.status}
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