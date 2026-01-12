import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, Bell, Settings, CheckCircle2, MapPin, ShoppingBag, Tag, Mail } from 'lucide-react';

const UserHome = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pref, setPref] = useState({ offers: true, newsletter: true, orderUpdates: true });
  const [user, setUser] = useState({});
  
  // New State for Inbox Tabs
  const [activeCategory, setActiveCategory] = useState('ALL');

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
        setNotifications(notifRes.data);
        setPref(prefRes.data);
      } catch (err) {
        if(err.response && (err.response.status === 403 || err.response.status === 401)) {
            localStorage.clear(); navigate('/login');
        }
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
    if (activeCategory === 'ALL') return notifications;
    return notifications.filter(n => n.type === activeCategory);
  };

  const categories = [
    { id: 'ALL', label: 'All', icon: Bell },
    { id: 'SMS', label: 'Promotions', icon: Tag },       // SMS = Promotional
    { id: 'EMAIL', label: 'Newsletters', icon: Mail },   // EMAIL = Newsletters
    { id: 'PUSH', label: 'Orders', icon: ShoppingBag },  // PUSH = Order Updates
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
       <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-2xl"><span>Nykaa.</span></div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 transition"><LogOut className="w-5 h-5"/> Sign Out</button>
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
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Settings className="w-4 h-4"/> Settings</h3>
                <div className="space-y-3">
                {[
                    { key: 'offers', label: 'Promotions' },
                    { key: 'newsletter', label: 'Newsletters' },
                    { key: 'orderUpdates', label: 'Orders' }
                ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${pref[item.key] ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => updatePref(item.key)}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${pref[item.key] ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                ))}
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
             
             {/* LIST */}
             <div className="space-y-4">
                {getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                        <p className="text-gray-400">No {activeCategory === 'ALL' ? '' : activeCategory.toLowerCase()} messages yet.</p>
                    </div>
                ) : (
                    getFilteredNotifications().map((n, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            n.type === 'SMS' ? 'bg-blue-50 text-blue-600' : 
                            n.type === 'EMAIL' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                        }`}>
                            {n.type === 'SMS' && <Tag className="w-6 h-6"/>}
                            {n.type === 'EMAIL' && <Mail className="w-6 h-6"/>}
                            {n.type === 'PUSH' && <ShoppingBag className="w-6 h-6"/>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    n.type === 'SMS' ? 'bg-blue-100 text-blue-700' : 
                                    n.type === 'EMAIL' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {n.type === 'SMS' ? 'PROMO' : n.type === 'EMAIL' ? 'NEWS' : 'ORDER'}
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