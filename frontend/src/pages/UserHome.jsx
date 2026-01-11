import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    offers: false, newsletter: false, orderUpdates: false
  });

  // Fetch Data on Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const notifRes = await api.get('/users/notifications');
      setNotifications(notifRes.data);

      const prefRes = await api.get('/users/preferences');
      setPreferences(prefRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs); // Optimistic UI update
    
    try {
      await api.put('/users/preferences', newPrefs);
      toast.success("Preferences Updated!");
    } catch (err) {
      toast.error("Update Failed");
      setPreferences(preferences); // Revert on fail
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <ToastContainer position="top-right" autoClose={2000} />
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-600">Nykaa Customer Portal</h1>
        <button onClick={handleLogout} className="text-gray-600 hover:text-pink-600 font-semibold">
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto mt-8 p-4">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8 gap-8">
          <button 
            onClick={() => setActiveTab('messages')}
            className={`pb-2 text-lg font-medium ${activeTab === 'messages' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
          >
            My Messages
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`pb-2 text-lg font-medium ${activeTab === 'preferences' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}
          >
            Communication Preferences
          </button>
        </div>

        {/* Tab 1: Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-4 animate-fade-in">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No messages yet!</div>
            ) : (
              notifications.map((notif, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-pink-500">
                  <h3 className="font-bold text-lg text-gray-800">{notif.message}</h3>
                  <p className="text-xs text-gray-400 mt-2">
                    Received: {new Date(notif.receivedAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Preferences */}
        {activeTab === 'preferences' && (
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-lg mx-auto animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Manage what you receive</h2>
            
            <div className="space-y-6">
              {['offers', 'newsletter', 'orderUpdates'].map((key) => (
                <div key={key} className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <button 
                    onClick={() => handleToggle(key)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences[key] ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${preferences[key] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserHome;