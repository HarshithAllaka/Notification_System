import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, Bell, Settings, CheckCircle2, MapPin } from 'lucide-react';

const UserHome = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pref, setPref] = useState({ offers: true, newsletter: true, orderUpdates: true });
  const [user, setUser] = useState({});

  useEffect(() => {
    const loadData = async () => {
      // 1. Get User Details from Local Storage
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        navigate('/login');
        return;
      }

      const u = JSON.parse(storedUser);
      setUser(u);

      try {
        // --- FIX IS HERE ---
        // Your backend uses the Token to find the user, so we don't need to pass IDs in the URL.
        const [notifRes, prefRes] = await Promise.all([
           api.get('/users/notifications'), // Matches your @GetMapping("/notifications")
           api.get('/users/preferences')    // Matches your @GetMapping("/preferences")
        ]);

        setNotifications(notifRes.data);
        setPref(prefRes.data);
      } catch (err) {
        console.error("Failed to load user data", err);
        // If 403/401, token might be expired
        if(err.response && (err.response.status === 403 || err.response.status === 401)) {
            localStorage.clear();
            navigate('/login');
        }
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const updatePref = async (key) => {
    const newPref = { ...pref, [key]: !pref[key] };
    setPref(newPref); // Optimistic Update
    try {
      // --- FIX IS HERE ---
      // Matches your @PutMapping("/preferences")
      await api.put('/users/preferences', newPref);
    } catch (err) {
      setPref(pref); // Revert on error
      console.error("Failed to update preferences");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
       {/* Navbar */}
       <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 text-pink-600 font-extrabold text-2xl">
             <span>Nykaa.</span>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 transition">
            <LogOut className="w-5 h-5"/> Sign Out
          </button>
       </nav>

       <div className="max-w-5xl mx-auto mt-10 p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: User Profile & Preferences */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div>
                   <h2 className="font-bold text-gray-900">{user.name}</h2>
                   <p className="text-xs text-gray-500">{user.email}</p>
                   <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                     <MapPin className="w-3 h-3"/> {user.city || 'Location N/A'}
                   </p>
                </div>
             </div>
             
             <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
               <Settings className="w-4 h-4"/> Notification Settings
             </h3>
             
             <div className="space-y-3">
               {[
                 { key: 'offers', label: 'Promotional Offers' },
                 { key: 'newsletter', label: 'Weekly Newsletters' },
                 { key: 'orderUpdates', label: 'Order Updates' }
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

          {/* Right Column: Notifications Feed */}
          <div className="md:col-span-2 space-y-4">
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <Bell className="w-6 h-6 text-pink-600"/> Your Inbox
             </h2>
             
             {notifications.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                   <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                   <p className="text-gray-400">No new notifications yet.</p>
                </div>
             ) : (
                notifications.map((n, i) => (
                   <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4">
                      <div className="bg-pink-50 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                         <CheckCircle2 className="w-6 h-6 text-pink-600"/>
                      </div>
                      <div>
                         {/* Your backend sends the campaign name in the 'message' field */}
                         <h4 className="font-bold text-gray-800">{n.message || "New Notification"}</h4>
                         <p className="text-gray-600 leading-relaxed text-sm mt-1">
                            You have received a new update from Nykaa.
                         </p>
                         <p className="text-xs text-gray-400 mt-2">{new Date(n.receivedAt).toLocaleString()}</p>
                      </div>
                   </div>
                ))
             )}
          </div>

       </div>
    </div>
  );
};

export default UserHome;