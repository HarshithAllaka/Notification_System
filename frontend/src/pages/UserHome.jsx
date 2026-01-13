import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, Bell, Settings, CheckCircle2, MapPin, ShoppingBag, Tag, Mail, User, MessageSquare } from 'lucide-react';

const UserHome = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pref, setPref] = useState({ 
    offers: true, newsletter: true, orderUpdates: true,
    emailOffers: true, smsOffers: true, pushOffers: true,
    emailNewsletters: true, smsNewsletters: true, pushNewsletters: true,
    emailOrders: true, smsOrders: true, pushOrders: true
  });
  const [user, setUser] = useState({});
  
  // New State for Category and Channel Filters
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeChannel, setActiveChannel] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) { navigate('/login'); return; }

      const u = JSON.parse(storedUser);
      setUser(u);

      try {
        const [notifRes, prefRes] = await Promise.all([
           api.get('/users/notifications'),
           api.get('/users/preferences')
        ]);
        const sortedNotifications = (notifRes.data || []).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
        setNotifications(sortedNotifications);
        setPref(prefRes.data || {});
      } catch (err) {
        if(err.response && (err.response.status === 403 || err.response.status === 401)) {
            localStorage.clear(); navigate('/login');
        }
        setNotifications([]);
        setPref({});
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const updatePref = async (key) => {
    const newPref = { ...pref, [key]: !pref[key] };
    setPref(newPref);
    try { await api.put('/users/preferences', newPref); } catch (err) { setPref(pref); }
  };

  // --- FILTERING LOGIC ---
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
       <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-2xl"><span>Nykaa.</span></div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/profile')} className="text-gray-500 hover:text-blue-600 font-medium flex items-center gap-2 transition">
              <User className="w-5 h-5"/> Profile
            </button>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 transition"><LogOut className="w-5 h-5"/> Sign Out</button>
          </div>
       </nav>

       <div className="max-w-6xl mx-auto mt-10 p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT: Profile & Settings */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl uppercase">{user.name?.charAt(0)}</div>
                    <div>
                        <h2 className="font-bold text-gray-900">{user.name}</h2>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {user.city || 'N/A'}</p>
                    </div>
                </div>
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Settings className="w-4 h-4"/> Notification Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Promotion Offers</h4>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">Email</span>
                        <input type="checkbox" checked={pref.emailOffers} onChange={() => updatePref('emailOffers')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">SMS</span>
                        <input type="checkbox" checked={pref.smsOffers} onChange={() => updatePref('smsOffers')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">Push</span>
                        <input type="checkbox" checked={pref.pushOffers} onChange={() => updatePref('pushOffers')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Newsletters</h4>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">Email</span>
                        <input type="checkbox" checked={pref.emailNewsletters} onChange={() => updatePref('emailNewsletters')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">SMS</span>
                        <input type="checkbox" checked={pref.smsNewsletters} onChange={() => updatePref('smsNewsletters')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">Push</span>
                        <input type="checkbox" checked={pref.pushNewsletters} onChange={() => updatePref('pushNewsletters')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Order Updates</h4>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">Email</span>
                        <input type="checkbox" checked={pref.emailOrders} onChange={() => updatePref('emailOrders')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">SMS</span>
                        <input type="checkbox" checked={pref.smsOrders} onChange={() => updatePref('smsOrders')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm">Push</span>
                        <input type="checkbox" checked={pref.pushOrders} onChange={() => updatePref('pushOrders')} className="w-4 h-4 text-pink-600 rounded" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* RIGHT: Inbox with Tabs */}
          <div className="lg:col-span-3">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Bell className="w-6 h-6 text-pink-600"/> Your Inbox</h2>
             </div>

             {/* TABS */}
             <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                            activeCategory === cat.id 
                            ? 'bg-pink-600 text-white shadow-md' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <cat.icon className="w-4 h-4" /> {cat.label}
                    </button>
                ))}
             </div>

             {/* CHANNEL FILTERS */}
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                  { id: 'ALL', label: 'All Channels' },
                  { id: 'EMAIL', label: 'Email' },
                  { id: 'SMS', label: 'SMS' },
                  { id: 'PUSH', label: 'Push' }
                ].map(channel => (
                    <button 
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                            activeChannel === channel.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {channel.label}
                    </button>
                ))}
             </div>
             
             {/* LIST */}
             <div className="space-y-4">
                {getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                        <p className="text-gray-400">No messages found for the selected filters.</p>
                    </div>
                ) : (
                    getFilteredNotifications().map((n, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            n.channels && n.channels.includes('SMS') ? 'bg-blue-50 text-blue-600' : 
                            n.channels && n.channels.includes('EMAIL') ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                        }`}>
                            {n.channels && n.channels.includes('SMS') && <Tag className="w-6 h-6"/>}
                            {n.channels && n.channels.includes('EMAIL') && <Mail className="w-6 h-6"/>}
                            {n.channels && n.channels.includes('PUSH') && <ShoppingBag className="w-6 h-6"/>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    n.campaignType === 'Promotion Offers' ? 'bg-blue-100 text-blue-700' : 
                                    n.campaignType === 'Newsletters' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {n.campaignType === 'Promotion Offers' ? 'PROMO' : n.campaignType === 'Newsletters' ? 'NEWS' : 'ORDER'}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(n.receivedAt).toLocaleString()}</span>
                            </div>
                            <h4 className="font-bold text-gray-800">{n.message}</h4>
                            <p className="text-gray-600 leading-relaxed text-sm mt-1">{n.content}</p>
                        </div>
                    </div>
                    ))
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default UserHome;