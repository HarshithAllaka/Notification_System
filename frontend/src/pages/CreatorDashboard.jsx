import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  PenTool, Users, LogOut, Send, LayoutDashboard,
  MapPin, Plus, Edit2, FileText, Download,
  Tag, Mail, Filter, User, BarChart3, Trash2, CalendarClock,
  Sparkles, CheckCircle2, ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('CAMPAIGNS');

  // Campaign State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignData, setCampaignData] = useState({
    name: '', type: 'Promotion Offers', content: '', schedule: '', targetCities: [], channels: ['EMAIL', 'SMS', 'PUSH'], scheduledAt: ''
  });

  // User State
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({ name: '', email: '', password: '', city: '', phone: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [file, setFile] = useState(null);

  // Campaign UI State
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Dynamically get unique cities from users
  const getAvailableCities = () => {
    const uniqueCities = [...new Set(users.map(u => u.city).filter(Boolean))].sort();
    return ['All Cities', ...uniqueCities];
  };
  const cities = getAvailableCities();

  // Reporting
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [campRes, userRes] = await Promise.all([
        api.get('/campaigns/history'),
        api.get('/admin/users/all')
      ]);
      const sortedCampaigns = (campRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCampaigns(sortedCampaigns);
      setUsers(userRes.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
      setCampaigns([]);
      setUsers([]);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- LOGIC ---
  const handleCampaignSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...campaignData,
      scheduledAt: campaignData.scheduledAt ? campaignData.scheduledAt + ':00' : null
    };

    try {
      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign}`, payload);
        toast.success("Campaign Updated!");
      } else {
        await api.post('/campaigns/create', payload);
        if (payload.scheduledAt) toast.info("Campaign Scheduled Successfully!");
        else toast.success("Campaign Launched!");
      }

      setCampaignData({ name: '', type: 'Promotion Offers', content: '', schedule: '', targetCities: [], channels: ['EMAIL', 'SMS', 'PUSH'], scheduledAt: '' });
      setEditingCampaign(null);
      fetchData();
    } catch (err) { toast.error("Operation failed."); }
  };

  const startEditCampaign = (c) => {
    setEditingCampaign(c.id);
    const cities = c.targetCities && c.targetCities.length > 0
      ? c.targetCities
      : (c.targetCity ? [c.targetCity] : []);
    setCampaignData({
      name: c.campaignName,
      type: c.type,
      content: c.content,
      schedule: '',
      targetCities: cities,
      channels: ['EMAIL', 'SMS', 'PUSH'],
      scheduledAt: '' // Reset schedule on edit
    });
    setActiveTab('CAMPAIGNS'); window.scrollTo(0, 0);
  };

  const handleCityToggle = (city) => {
    if (city === 'All Cities') {
      if (campaignData.targetCities.includes('All Cities')) {
        setCampaignData({ ...campaignData, targetCities: [] });
      } else {
        setCampaignData({ ...campaignData, targetCities: ['All Cities'] });
      }
    } else {
      let newCities = campaignData.targetCities.filter(c => c !== 'All Cities');
      if (newCities.includes(city)) {
        newCities = newCities.filter(c => c !== city);
      } else {
        newCities.push(city);
      }
      setCampaignData({ ...campaignData, targetCities: newCities });
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) await api.put(`/admin/users/${editingUser}`, userData);
      else await api.post('/admin/users/create', userData);
      toast.success(editingUser ? "Updated!" : "Created!");
      setUserData({ name: '', email: '', password: '', city: '', phone: '' }); setEditingUser(null); fetchData();
    } catch (err) { toast.error("Failed."); }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Select file!");
    const fd = new FormData(); fd.append('file', file);
    try { await api.post('/users/upload-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success("Uploaded!"); fetchData(); } catch (err) { toast.error("Failed."); }
  };

  const handleViewReport = async (camp) => {
    setSelectedCampaign(camp);
    try { const { data } = await api.get(`/campaigns/${camp.id}/recipients`); setRecipients(data); } catch (err) { }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success("Campaign deleted!");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete campaign.");
    }
  };

  const downloadCSV = () => {
    const headers = "Name,Email,Status,Sent At\n";
    const rows = recipients.map(r => `${r.name},${r.email},${r.status},${r.sentAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${selectedCampaign.campaignName}_Report.csv`; a.click();
  };

  // --- FILTER HELPER ---
  const getFilteredCampaigns = () => {
    if (filterType === 'ALL') return campaigns;
    return campaigns.filter(c => c.type === filterType);
  };

  const filters = [
    { id: 'ALL', label: 'All', icon: Filter },
    { id: 'Promotion Offers', label: 'Promotions', icon: Tag },
    { id: 'Newsletters', label: 'Newsletters', icon: Mail },
  ];

  const SideNavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${activeTab === id ? 'text-white shadow-lg shadow-nykaa-500/30' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      {activeTab === id && (
        <div className="absolute inset-0 bg-gradient-to-r from-nykaa-600 to-brand-purple animate-fade-in"></div>
      )}
      <div className="relative z-10 flex items-center gap-3">
        <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-gray-400 group-hover:text-nykaa-500'}`} />
        {label}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" hideProgressBar={false} />

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 hidden md:flex flex-col z-50">
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-nykaa-500 to-brand-purple flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 fill-white" />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nykaa-600 to-brand-purple">
              Nykaa
            </span>
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 ml-1">Creator Studio</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SideNavItem id="CAMPAIGNS" icon={PenTool} label="Campaign Manager" />
          <SideNavItem id="ANALYTICS" icon={BarChart3} label="Performance" />
          <SideNavItem id="USERS" icon={Users} label="Audience Base" />

          <div className="pt-8 pb-2">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Settings</p>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-gray-500 hover:bg-gray-100 hover:text-gray-900 group">
              <User className="w-5 h-5 text-gray-400 group-hover:text-nykaa-500" /> My Profile
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-nykaa-100 to-purple-100 flex items-center justify-center text-nykaa-700 font-bold">CN</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Creator Name</p>
              <p className="text-xs text-gray-500 truncate">creator@nykaa.com</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition font-medium text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">

        {/* TOP BAR MOBILE */}
        <div className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 p-4 flex justify-between items-center">
          <span className="font-bold text-lg text-nykaa-600">Nykaa Studio</span>
          <button onClick={handleLogout}><LogOut className="w-5 h-5 text-gray-500" /></button>
        </div>

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 capitalize tracking-tight mb-2">
                {activeTab === 'CAMPAIGNS' && 'Campaign Manager'}
                {activeTab === 'ANALYTICS' && 'Analytics Overview'}
                {activeTab === 'USERS' && 'Audience Management'}
              </h1>
              <p className="text-gray-500 text-lg">
                {activeTab === 'CAMPAIGNS' && 'Create, schedule, and track your marketing campaigns.'}
                {activeTab === 'ANALYTICS' && 'Deep dive into your campaign performance metrics.'}
                {activeTab === 'USERS' && 'Manage your subscriber database and segments.'}
              </p>
            </div>
            {/* Context Action Button could go here */}
          </header>

          {/* --- ANALYTICS TAB --- */}
          {activeTab === 'ANALYTICS' && (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Campaign Distribution</h3>
                  <select className="bg-gray-50 border-none text-sm font-semibold text-gray-600 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 transition">
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={[
                    { name: 'Promotions', count: campaigns.filter(c => c.type === 'Promotion Offers' || c.type === 'SMS').length },
                    { name: 'Newsletters', count: campaigns.filter(c => c.type === 'Newsletters' || c.type === 'EMAIL').length },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="count" fill="#db2777" radius={[6, 6, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* --- CAMPAIGNS TAB --- */}
          {activeTab === 'CAMPAIGNS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LIST SECTION (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Filters */}
                <div className="flex gap-3 bg-white/50 p-1.5 rounded-xl border border-gray-200/50 w-fit backdrop-blur-sm">
                  {filters.map(f => (
                    <button key={f.id} onClick={() => setFilterType(f.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${filterType === f.id ? 'bg-white text-nykaa-600 shadow-sm' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}>
                      <f.icon className="w-4 h-4" /> {f.label}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="p-6 font-semibold">Campaign Details</th>
                          <th className="p-6 font-semibold">Targets</th>
                          <th className="p-6 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {getFilteredCampaigns().map((c, i) => (
                          <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
                            <td className="p-6">
                              <div className="font-bold text-gray-900 group-hover:text-nykaa-600 transition-colors mb-1">{c.campaignName}</div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${c.type === 'SMS' || c.type === 'Promotion Offers' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                  {c.type === 'Promotion Offers' || c.type === 'SMS' ? 'PROMO' : 'NEWS'}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                {c.targetCities && c.targetCities.length > 0 ? (
                                  <span className="truncate max-w-[150px]">{c.targetCities.join(', ')}</span>
                                ) : (
                                  <span>{c.targetCity || "Global"}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-6 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditCampaign(c)} className="w-9 h-9 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleViewReport(c)} className="w-9 h-9 rounded-full flex items-center justify-center text-nykaa-600 hover:bg-pink-50 transition" title="Report"><BarChart3 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCampaign(c.id)} className="w-9 h-9 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {getFilteredCampaigns().length === 0 && (
                          <tr>
                            <td colSpan="3" className="p-12 text-center text-gray-400">
                              No campaigns found. Start by creating one!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* FORM SECTION (4 Cols) */}
              <div className="lg:col-span-4">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4">
                    <div className="w-8 h-8 rounded-lg bg-nykaa-50 flex items-center justify-center text-nykaa-600">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    {editingCampaign ? 'Edit Campaign' : 'Compose New'}
                  </h3>

                  <form onSubmit={handleCampaignSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Internal Name</label>
                      <input type="text" placeholder="e.g. Diwali Flash Sale" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3.5 outline-none focus:ring-4 focus:ring-nykaa-50 transition-all font-medium text-sm" value={campaignData.name} onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })} required />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Campaign Type</label>
                      <div className="relative">
                        <select className="appearance-none w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3.5 outline-none transition-all font-medium text-sm text-gray-700" value={campaignData.type} onChange={(e) => setCampaignData({ ...campaignData, type: e.target.value })}>
                          <option value="Promotion Offers">Promotional Offer</option>
                          <option value="Newsletters">Newsletter Blast</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Channels</label>
                      <div className="flex flex-wrap gap-2">
                        {['EMAIL', 'SMS', 'PUSH'].map(channel => (
                          <label key={channel} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border transition-all select-none ${campaignData.channels.includes(channel) ? 'bg-nykaa-50 border-nykaa-200 text-nykaa-700 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            <input
                              type="checkbox"
                              checked={campaignData.channels.includes(channel)}
                              onChange={(e) => {
                                const newChannels = e.target.checked
                                  ? [...campaignData.channels, channel]
                                  : campaignData.channels.filter(c => c !== channel);
                                setCampaignData({ ...campaignData, channels: newChannels });
                              }}
                              className="hidden"
                            />
                            <span className="text-xs">{channel}</span>
                            {campaignData.channels.includes(channel) && <CheckCircle2 className="w-3 h-3" />}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Target Cities</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                          className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 hover:bg-gray-100 rounded-xl p-3.5 text-left flex items-center justify-between transition-all group"
                        >
                          <span className={`text-sm font-medium ${campaignData.targetCities.length ? 'text-gray-900' : 'text-gray-400'}`}>
                            {campaignData.targetCities.length === 0 ? 'Select cities...' : `${campaignData.targetCities.length} Cities Selected`}
                          </span>
                          <MapPin className="w-4 h-4 text-gray-400 group-hover:text-nykaa-500 transition-colors" />
                        </button>

                        {cityDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setCityDropdownOpen(false)}></div>
                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in custom-scrollbar">
                              <div className="p-2 space-y-1">
                                {cities.map(city => (
                                  <label key={city} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                                    <input
                                      type="checkbox"
                                      checked={campaignData.targetCities.includes(city)}
                                      onChange={() => handleCityToggle(city)}
                                      className="w-4 h-4 text-nykaa-600 border-gray-300 rounded focus:ring-nykaa-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{city}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {campaignData.targetCities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {campaignData.targetCities.slice(0, 3).map(c => <span key={c} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-600">{c}</span>)}
                            {campaignData.targetCities.length > 3 && <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-600">+{campaignData.targetCities.length - 3} more</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Message Content</label>
                      <textarea
                        rows="4"
                        placeholder="Type your compelling message here..."
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3.5 outline-none focus:ring-4 focus:ring-nykaa-50 transition-all font-medium text-sm resize-none"
                        value={campaignData.content}
                        onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                        required
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                        <CalendarClock className="w-3 h-3" /> Schedule Launch (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-sm font-medium text-gray-600 focus:border-nykaa-200 transition"
                        value={campaignData.scheduledAt}
                        onChange={(e) => setCampaignData({ ...campaignData, scheduledAt: e.target.value })}
                      />
                    </div>

                    <button className="w-full bg-gradient-to-r from-nykaa-600 to-brand-purple text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-nykaa-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                      {editingCampaign ? <><Edit2 className="w-4 h-4" /> Update Campaign</> : (
                        campaignData.scheduledAt ? <><CalendarClock className="w-4 h-4" /> Schedule Campaign</> : <><Send className="w-4 h-4" /> Launch Now</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === 'USERS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-nykaa-600" /> Add Subscriber</h3>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3 outline-none transition text-sm" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} required />
                    <input type="email" placeholder="Email Address" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3 outline-none transition text-sm" value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Phone" className="bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3 outline-none transition text-sm" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} />
                      <input type="text" placeholder="City" className="bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3 outline-none transition text-sm" value={userData.city} onChange={e => setUserData({ ...userData, city: e.target.value })} />
                    </div>
                    <input type="password" placeholder="Password (Optional)" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3 outline-none transition text-sm" value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} />
                  </div>
                  <button className="w-full bg-nykaa-600 text-white py-3 rounded-xl font-bold hover:bg-nykaa-700 transition">Save User</button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Bulk Import</p>
                  <div className="flex flex-col gap-3">
                    <input type="file" className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-nykaa-50 file:text-nykaa-700 hover:file:bg-nykaa-100 transition" onChange={e => setFile(e.target.files[0])} />
                    <button onClick={handleUpload} className="w-full bg-white border-2 border-green-500 text-green-700 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition">Upload CSV</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr><th className="p-5 font-semibold">Subscriber</th><th className="p-5 font-semibold">Contact Info</th><th className="p-5 font-semibold">Location</th><th className="p-5 font-semibold">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.userId} className="hover:bg-gray-50/50 transition">
                        <td className="p-5">
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-400">ID: {u.userId}</div>
                        </td>
                        <td className="p-5 text-gray-600 font-medium">{u.email}</td>
                        <td className="p-5 text-gray-600"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{u.city}</span></td>
                        <td className="p-5"><button onClick={() => { setEditingUser(u.userId); setUserData(u); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"><Edit2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md flex justify-center items-center p-4 z-[100] animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up ring-1 ring-black/5">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">{selectedCampaign.campaignName}</h3>
                <p className="text-gray-400 text-sm">Delivery Report</p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">✕</button>
            </div>
            <div className="p-0 max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0"><tr><th className="p-4 font-semibold">Name</th><th className="p-4 font-semibold">Email</th><th className="p-4 font-semibold">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {recipients.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-900">{r.name}</td>
                      <td className="p-4 text-gray-500">{r.email}</td>
                      <td className="p-4"><span className="text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button onClick={downloadCSV} className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md flex items-center gap-2 transition hover:scale-105 active:scale-95"><Download className="w-4 h-4" /> Export CSV Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;