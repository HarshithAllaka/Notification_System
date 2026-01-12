import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  PenTool, Users, LogOut, Send, LayoutDashboard, 
  MapPin, MessageSquare, Plus, Edit2, FileText, Download,
  Tag, Mail, ShoppingBag, Filter
} from 'lucide-react';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('CAMPAIGNS');

  // Campaign State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignData, setCampaignData] = useState({ 
    name: '', type: 'SMS', content: '', schedule: '', targetCity: '' 
  });
  const [editingCampaign, setEditingCampaign] = useState(null); 
  const [filterType, setFilterType] = useState('ALL'); // <--- NEW FILTER STATE
  
  // User State
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({ name: '', email: '', password: '', city: '', phone: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [file, setFile] = useState(null);

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
      setCampaigns(campRes.data);
      setUsers(userRes.data);
    } catch (err) { console.error("Failed to load data"); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- LOGIC ---
  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign}`, campaignData);
        toast.success("Campaign Updated!");
      } else {
        await api.post('/campaigns/create', campaignData);
        toast.success("Campaign Created!");
      }
      setCampaignData({ name: '', type: 'SMS', content: '', schedule: '', targetCity: '' });
      setEditingCampaign(null);
      fetchData();
    } catch (err) { toast.error("Operation failed."); }
  };

  const startEditCampaign = (c) => {
    setEditingCampaign(c.id);
    setCampaignData({ 
        name: c.campaignName, type: c.type, content: c.content, schedule: '', targetCity: c.targetCity || '' 
    });
    setActiveTab('CAMPAIGNS'); window.scrollTo(0,0);
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
    try { await api.post('/users/upload-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success("Uploaded!"); fetchData(); } catch(err) { toast.error("Failed."); }
  };

  const handleViewReport = async (camp) => {
    setSelectedCampaign(camp);
    try { const { data } = await api.get(`/campaigns/${camp.id}/recipients`); setRecipients(data); } catch (err) {}
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
      { id: 'SMS', label: 'Promotions', icon: Tag },
      { id: 'EMAIL', label: 'Newsletters', icon: Mail },
      { id: 'PUSH', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Creator Studio
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('CAMPAIGNS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab==='CAMPAIGNS'?'bg-purple-50 text-purple-700':'text-gray-600 hover:bg-gray-100'}`}>
            <PenTool className="w-5 h-5" /> Campaign Manager
          </button>
          <button onClick={() => setActiveTab('USERS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab==='USERS'?'bg-purple-50 text-purple-700':'text-gray-600 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5" /> Audience Base
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900">{activeTab === 'CAMPAIGNS' ? 'Campaign Orchestration' : 'Audience Management'}</h1>
           <p className="text-gray-500 mt-1">Manage your marketing efforts and customer data.</p>
        </header>

        {activeTab === 'CAMPAIGNS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-purple-600"/> {editingCampaign ? 'Edit Campaign' : 'Compose Campaign'}</h3>
              <form onSubmit={handleCampaignSubmit} className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Internal Name</label>
                   <input type="text" placeholder="e.g. Diwali Flash Sale" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-purple-500 transition" value={campaignData.name} onChange={(e) => setCampaignData({...campaignData, name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Channel</label>
                    <select className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={campaignData.type} onChange={(e) => setCampaignData({...campaignData, type: e.target.value})}>
                      <option value="SMS">Promotional Offer</option>
                      <option value="EMAIL">Newsletter</option>
                      <option value="PUSH">Order Update</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Target City</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                        <input type="text" placeholder="All Cities" className="w-full pl-9 bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={campaignData.targetCity} onChange={(e) => setCampaignData({...campaignData, targetCity: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase">Message Content</label>
                   <textarea rows="4" placeholder="Type your message..." className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-purple-500 transition" value={campaignData.content} onChange={(e) => setCampaignData({...campaignData, content: e.target.value})} required />
                </div>
                <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition flex justify-center items-center gap-2">
                   {editingCampaign ? <><Edit2 className="w-4 h-4"/> Update Campaign</> : <><Send className="w-4 h-4"/> Launch Now</>}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
               {/* NEW FILTER TABS */}
               <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {filters.map(f => (
                      <button key={f.id} onClick={() => setFilterType(f.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${filterType === f.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-purple-50'}`}>
                          <f.icon className="w-4 h-4"/> {f.label}
                      </button>
                  ))}
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">Recent Campaigns</div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="text-gray-500 border-b"><tr><th className="p-4">Campaign Details</th><th className="p-4">Target</th><th className="p-4 text-right">Actions</th></tr></thead>
                     <tbody className="divide-y divide-gray-100">
                       {getFilteredCampaigns().map((c, i) => (
                         <tr key={i} className="hover:bg-gray-50 transition">
                           <td className="p-4">
                             <div className="font-bold text-gray-900">{c.campaignName}</div>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${c.type==='SMS'?'bg-blue-100 text-blue-700':c.type==='EMAIL'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>
                                    {c.type==='SMS'?'PROMO':c.type==='EMAIL'?'NEWS':'ORDER'}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                             </div>
                           </td>
                           <td className="p-4 text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3"/> {c.targetCity || "Global"}</td>
                           <td className="p-4 text-right space-x-2">
                             <button onClick={() => startEditCampaign(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4"/></button>
                             <button onClick={() => handleViewReport(c)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"><FileText className="w-4 h-4"/></button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* ... (Users Tab code remains exactly the same as before) ... */}
        {activeTab === 'USERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-purple-600"/> Add Subscriber</h3>
                <form onSubmit={handleUserSubmit} className="space-y-3">
                   <input type="text" placeholder="Name" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} required />
                   <input type="email" placeholder="Email" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} required />
                   <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Phone" className="bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
                      <input type="text" placeholder="City" className="bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.city} onChange={e => setUserData({...userData, city: e.target.value})} />
                   </div>
                   <input type="password" placeholder="Password" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
                   <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition">Save User</button>
                </form>
                <div className="mt-6 pt-6 border-t border-gray-100">
                   <div className="flex gap-2">
                      <input type="file" className="text-xs w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" onChange={e => setFile(e.target.files[0])} />
                      <button onClick={handleUpload} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700">Upload</button>
                   </div>
                </div>
             </div>
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Location</th><th className="p-4">Edit</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.userId} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">{u.name}</td>
                        <td className="p-4 text-gray-500">{u.email}</td>
                        <td className="p-4 text-gray-500">{u.city}</td>
                        <td className="p-4"><button onClick={() => {setEditingUser(u.userId); setUserData(u);}} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><Edit2 className="w-4 h-4"/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold">Analytics: {selectedCampaign.campaignName}</h3>
                <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-white">✕</button>
             </div>
             <div className="p-6 max-h-80 overflow-y-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Status</th></tr></thead>
                   <tbody>{recipients.map((r,i)=><tr key={i} className="border-b"><td className="p-2">{r.name}</td><td className="p-2">{r.email}</td><td className="p-2 text-green-600 font-bold">{r.status}</td></tr>)}</tbody>
                </table>
             </div>
             <div className="p-4 border-t flex justify-end bg-gray-50">
                <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg flex items-center gap-2"><Download className="w-4 h-4"/> Export CSV</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;