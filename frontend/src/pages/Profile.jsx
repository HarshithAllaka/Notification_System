import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Save, LogOut, ArrowLeft, Mail, Phone, MapPin, Shield, Edit3, Bell, Lock, Sparkles } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', city: '', password: '', oldPassword: '',
    emailOffers: true, smsOffers: true, pushOffers: true,
    emailNewsletters: true, smsNewsletters: true, pushNewsletters: true,
    emailOrders: true, smsOrders: true, pushOrders: true
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile/me');
      setProfile(data);
      setFormData({
        name: data.name || '', email: data.email || '', phone: data.phone || '', city: data.city || '',
        password: '', oldPassword: '',
        emailOffers: data.preference?.emailOffers ?? true, smsOffers: data.preference?.smsOffers ?? true, pushOffers: data.preference?.pushOffers ?? true,
        emailNewsletters: data.preference?.emailNewsletters ?? true, smsNewsletters: data.preference?.smsNewsletters ?? true, pushNewsletters: data.preference?.pushNewsletters ?? true,
        emailOrders: data.preference?.emailOrders ?? true, smsOrders: data.preference?.smsOrders ?? true, pushOrders: data.preference?.pushOrders ?? true
      });
    } catch (err) { toast.error('Failed to load profile'); }
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put('/profile/me', formData);
      setProfile(data);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) { toast.error('Failed to update profile'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const goBack = () => navigate(-1);

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'CREATOR': return 'bg-pink-100 text-pink-700';
      case 'VIEWER': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 from-gray-50 to-white font-sans text-gray-800">
      <ToastContainer position="top-center" theme="colored" autoClose={2000} />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        </div>
        <button onClick={handleLogout} className="text-red-500 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-xl transition flex items-center gap-2">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <main className="max-w-4xl mx-auto p-6 md:p-10 animate-fade-in-up">

        {/* Profile Header Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-nykaa-500 to-brand-purple"></div>

          <div className="relative flex flex-col md:flex-row items-end -mt-12 md:items-center justify-between gap-6 pt-12">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-[2rem] bg-white p-1 shadow-xl">
                <div className="w-full h-full bg-gray-100 rounded-[1.8rem] flex items-center justify-center text-4xl font-bold text-gray-400">
                  {profile.name?.charAt(0)}
                </div>
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-500 font-medium">{profile.email}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleColor(profile.role)}`}>{profile.role}</span>
                </div>
              </div>
            </div>
            <div className="mb-4 md:mb-0">
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center gap-2">
                  <Edit3 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Personal Info */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2"><User className="text-nykaa-500" /> Personal Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                  <input disabled={!editMode} type="text" className={`w-full p-4 rounded-xl font-medium transition-all ${editMode ? 'bg-gray-50 focus:bg-white border-transparent focus:ring-4 focus:ring-nykaa-50' : 'bg-transparent text-gray-900'}`} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                  <input disabled type="email" className="w-full p-4 rounded-xl font-medium bg-gray-50/50 text-gray-500 cursor-not-allowed border-transparent" value={formData.email} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <input disabled={!editMode} type="text" className={`w-full p-4 pl-12 rounded-xl font-medium transition-all ${editMode ? 'bg-gray-50 focus:bg-white border-transparent focus:ring-4 focus:ring-nykaa-50' : 'bg-transparent text-gray-900'}`} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Add phone number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <input disabled={!editMode} type="text" className={`w-full p-4 pl-12 rounded-xl font-medium transition-all ${editMode ? 'bg-gray-50 focus:bg-white border-transparent focus:ring-4 focus:ring-nykaa-50' : 'bg-transparent text-gray-900'}`} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Add city" />
                  </div>
                </div>
              </div>
            </section>

            {editMode && (
              <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2"><Lock className="text-nykaa-500" /> Security</h3>
                <div className="space-y-4">
                  <input type="password" placeholder="Current Password" className="w-full bg-gray-50 rounded-xl p-4 font-medium focus:bg-white focus:ring-4 focus:ring-nykaa-50 transition-all border-transparent" value={formData.oldPassword} onChange={e => setFormData({ ...formData, oldPassword: e.target.value })} />
                  <input type="password" placeholder="New Password" className="w-full bg-gray-50 rounded-xl p-4 font-medium focus:bg-white focus:ring-4 focus:ring-nykaa-50 transition-all border-transparent" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </section>
            )}

            {editMode && (
              <div className="flex gap-4">
                <button onClick={handleSave} className="flex-1 bg-gradient-to-r from-nykaa-500 to-nykaa-600 text-white py-4 rounded-xl font-extrabold text-lg shadow-xl shadow-nykaa-500/30 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
                <button onClick={() => setEditMode(false)} className="px-8 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Preferences */}
          <div className="md:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-full">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2"><Bell className="text-nykaa-500" /> Preferences</h3>
              <p className="text-sm text-gray-400 mb-8">Manage how you want to receive updates.</p>

              <div className="space-y-8">
                {[
                  { title: 'Promotions', prefix: 'Offers' },
                  { title: 'Newsletters', prefix: 'Newsletters' },
                  { title: 'Orders', prefix: 'Orders' }
                ].map((section) => (
                  <div key={section.title}>
                    <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">{section.title}</h4>
                    <div className="space-y-2">
                      {['email', 'sms', 'push'].map(channel => {
                        const key = `${channel}${section.prefix}`;
                        return (
                          <label key={key} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${editMode ? 'hover:bg-gray-50' : 'opacity-70 pointer-events-none'}`}>
                            <span className="capitalize font-medium text-gray-600">{channel}</span>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData[key] ? 'bg-nykaa-500' : 'bg-gray-200'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${formData[key] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input type="checkbox" className="hidden" checked={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.checked })} />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;