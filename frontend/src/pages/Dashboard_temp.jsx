import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Users, Briefcase, Megaphone, LogOut, UploadCloud, 
  Plus, Trash2, Edit2, Shield, Search, Power,
  Filter, Tag, Mail, ShoppingBag, User, BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('USERS'); 

  // Data States
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [file, setFile] = useState(null);
  const [filterType, setFilterType] = useState('ALL'); // <--- NEW FILTER
  
  // Forms
  const [userData, setUserData] = useState({ name: '', email: '', password: '', city: '', phone: '' });
  const [staffData, setStaffData] = useState({ name: '', email: '', password: '', role: 'CREATOR' });

  // Reporting (Admin View)
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [userRes, staffRes, campRes] = await Promise.all([
        api.get('/admin/users/all'),
        api.get('/admin/all'),
        api.get('/campaigns/history')
      ]);
      setUsers(userRes.data);
      setStaff(staffRes.data);
      setCampaigns(campRes.data);
    } catch (err) { console.error("Error loading data", err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if(editingUser) await api.put(`/admin/users/${editingUser}`, userData);
      else await api.post('/admin/users/create', userData);
      toast.success(editingUser ? "User Updated!" : "User Created!");
      setUserData({ name: '', email: '', password: '', city: '', phone: '' }); setEditingUser(null); fetchAllData();
    } catch(err) { toast.error("Operation failed."); }
  };

  const handleDelete = async (endpoint, id) => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    try { await api.delete(`${endpoint}/${id}`); toast.success("Deleted!"); fetchAllData(); } catch(err){ toast.error("Failed."); }
  };

  const handleToggleStatus = async (userId) => {
    try { await api.put(`/admin/users/${userId}/toggle-status`); toast.success("Status Updated"); fetchAllData(); } catch (err) { toast.error("Update failed"); }
  };

  const handleUpload = async () => {
    if(!file) return toast.error("Select file!");
    const fd = new FormData(); fd.append('file', file);
    try { await api.post('/users/upload-csv', fd, {headers:{'Content-Type':'multipart/form-data'}}); toast.success("Uploaded!"); fetchAllData(); } catch(err){ toast.error("Failed."); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/create-staff', staffData); toast.success("Staff Added!"); fetchAllData(); } catch(err){ toast.error("Failed."); }
  };

  const handleViewReport = async (camp) => {
    setSelectedCampaign(camp);
    try { const { data } = await api.get(`/campaigns/${camp.id}/recipients`); setRecipients(data); } catch(err){}
  };

  const downloadCSV = () => {
    const headers = "Name,Email,Status,Sent At\n";
    const rows = recipients.map(r => `${r.name},${r.email},${r.status},${r.sentAt}`).join("\n");
    const blob = new Blob([headers+rows], {type:'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`Report.csv`; a.click();
  };

  // --- FILTER HELPER ---
  const getFilteredCampaigns = () => {
    if (filterType === 'ALL') return campaigns;
    return campaigns.filter(c => c.type === filterType);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Nykaa Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[{ id: 'USERS', icon: Users, label: 'Customer Base' }, { id: 'STAFF', icon: Briefcase, label: 'Staff Management' }, { id: 'CAMPAIGNS', icon: Megaphone, label: 'Campaigns' }, { id: 'ANALYTICS', icon: BarChart3, label: 'Analytics' }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === item.id ? 'bg-pink-50 text-pink-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </button>
          ))}
          <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-gray-600 hover:bg-gray-100">
            <User className="w-5 h-5" /> My Profile
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"><LogOut className="w-5 h-5" /> Logout</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'USERS' && 'Customer Management'}
              {activeTab === 'STAFF' && 'Staff Directory'}
              {activeTab === 'CAMPAIGNS' && 'System Campaigns'}
              {activeTab === 'ANALYTICS' && 'System Analytics'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage and organize your system data.</p>
          </div>
          <button onClick={() => navigate('/creator-dashboard')} className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition"><Plus className="w-5 h-5" /> Launch Campaign</button>
        </header>

        {activeTab === 'USERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-pink-500" /> {editingUser ? 'Edit User' : 'Add New User'}</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} required />
                <input type="email" placeholder="Email Address" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} required />
                <input type="password" placeholder="Password" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Phone" className="bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
                    <input type="text" placeholder="City" className="bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={userData.city} onChange={e => setUserData({...userData, city: e.target.value})} />
                </div>
                <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition">{editingUser ? 'Save Changes' : 'Create User'}</button>
              </form>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2"><UploadCloud className="w-4 h-4"/> Bulk Import</h4>
                <div className="flex gap-2"><input type="file" className="text-xs w-full text-gray-500" onChange={e => setFile(e.target.files[0])} /><button onClick={handleUpload} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700">Upload</button></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
               <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <span className="font-bold text-gray-600">Total Users: {users.length}</span>
                  <div className="relative"><Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-pink-500" onChange={(e) => setSearchTerm(e.target.value)} /></div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-white text-gray-500 border-b"><tr><th className="p-4 font-semibold">User</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold text-right">Actions</th></tr></thead>
                   <tbody className="divide-y divide-gray-100">
                     {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                       <tr key={u.userId} className={`hover:bg-gray-50 transition ${!u.active ? 'opacity-60 bg-gray-50' : ''}`}>
                         <td className="p-4"><div className="font-bold text-gray-900">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                         <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                         <td className="p-4 flex justify-end gap-2">
                           <button onClick={() => handleToggleStatus(u.userId)} className={`p-2 rounded-lg transition ${u.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}><Power className="w-4 h-4"/></button>
                           <button onClick={() => {setEditingUser(u.userId); setUserData(u);}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                           <button onClick={() => handleDelete('/admin/users', u.userId)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Customers', value: users.length, color: '#ec4899' },
                      { name: 'Admins', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                      { name: 'Creators', value: staff.filter(s => s.role === 'CREATOR').length, color: '#10b981' },
                      { name: 'Viewers', value: staff.filter(s => s.role === 'VIEWER').length, color: '#3b82f6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => ${name} %}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Customers', value: users.length, color: '#ec4899' },
                      { name: 'Admins', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                      { name: 'Creators', value: staff.filter(s => s.role === 'CREATOR').length, color: '#10b981' },
                      { name: 'Viewers', value: staff.filter(s => s.role === 'VIEWER').length, color: '#3b82f6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Campaign Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'SMS', count: campaigns.filter(c => c.type === 'SMS').length },
                  { name: 'EMAIL', count: campaigns.filter(c => c.type === 'EMAIL').length },
                  { name: 'PUSH', count: campaigns.filter(c => c.type === 'PUSH').length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'STAFF' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-purple-600" /> Hire Staff</h3>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                   <input type="text" placeholder="Name" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} required />
                   <input type="email" placeholder="Email" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={staffData.email} onChange={e => setStaffData({...staffData, email: e.target.value})} required />
                   <input type="password" placeholder="Password" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={staffData.password} onChange={e => setStaffData({...staffData, password: e.target.value})} required />
                   <select className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 outline-none" value={staffData.role} onChange={e => setStaffData({...staffData, role: e.target.value})}>
                      <option value="CREATOR">Creator (Can Launch Campaigns)</option>
                      <option value="VIEWER">Viewer (Read Only)</option>
                   </select>
                   <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition">Add Member</button>
                </form>
             </div>
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Staff Member</th><th className="p-4">Role</th><th className="p-4 text-right">Remove</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {staff.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-4"><div className="font-bold">{s.name}</div><div className="text-xs text-gray-500">{s.email}</div></td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${s.role==='CREATOR'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{s.role}</span></td>
                        <td className="p-4 text-right"><button onClick={() => handleDelete('/admin', s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4"/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Customers', value: users.length, color: '#ec4899' },
                      { name: 'Admins', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                      { name: 'Creators', value: staff.filter(s => s.role === 'CREATOR').length, color: '#10b981' },
                      { name: 'Viewers', value: staff.filter(s => s.role === 'VIEWER').length, color: '#3b82f6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => ${name} %}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Customers', value: users.length, color: '#ec4899' },
                      { name: 'Admins', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                      { name: 'Creators', value: staff.filter(s => s.role === 'CREATOR').length, color: '#10b981' },
                      { name: 'Viewers', value: staff.filter(s => s.role === 'VIEWER').length, color: '#3b82f6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Campaign Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'SMS', count: campaigns.filter(c => c.type === 'SMS').length },
                  { name: 'EMAIL', count: campaigns.filter(c => c.type === 'EMAIL').length },
                  { name: 'PUSH', count: campaigns.filter(c => c.type === 'PUSH').length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'CAMPAIGNS' && (
          <div>
            {/* NEW FILTER TABS */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {[{id:'ALL',label:'All',icon:Filter},{id:'SMS',label:'Promotions',icon:Tag},{id:'EMAIL',label:'Newsletters',icon:Mail},{id:'PUSH',label:'Orders',icon:ShoppingBag}].map(f => (
                    <button key={f.id} onClick={() => setFilterType(f.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${filterType === f.id ? 'bg-pink-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-pink-50'}`}>
                        <f.icon className="w-4 h-4"/> {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Campaign</th><th className="p-4">Date</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                    {getFilteredCampaigns().map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-4">
                        <div className="font-bold text-gray-900">{c.campaignName}</div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${c.type==='SMS'?'bg-blue-100 text-blue-700':c.type==='EMAIL'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>
                             {c.type==='SMS'?'PROMO':c.type==='EMAIL'?'NEWS':'ORDER'}
                        </span>
                        </td>
                        <td className="p-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 flex justify-end gap-3">
                        <button onClick={() => handleViewReport(c)} className="text-purple-600 hover:underline text-xs font-bold">View Report</button>
                        <button onClick={() => handleDelete('/campaigns', c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">User Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Customers', value: users.length, color: '#ec4899' },
                      { name: 'Admins', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                      { name: 'Creators', value: staff.filter(s => s.role === 'CREATOR').length, color: '#10b981' },
                      { name: 'Viewers', value: staff.filter(s => s.role === 'VIEWER').length, color: '#3b82f6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => ${name} %}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Customers', value: users.length, color: '#ec4899' },
                      { name: 'Admins', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                      { name: 'Creators', value: staff.filter(s => s.role === 'CREATOR').length, color: '#10b981' },
                      { name: 'Viewers', value: staff.filter(s => s.role === 'VIEWER').length, color: '#3b82f6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Campaign Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'SMS', count: campaigns.filter(c => c.type === 'SMS').length },
                  { name: 'EMAIL', count: campaigns.filter(c => c.type === 'EMAIL').length },
                  { name: 'PUSH', count: campaigns.filter(c => c.type === 'PUSH').length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 flex justify-between items-center">
                <h3 className="font-bold">Report: {selectedCampaign.campaignName}</h3>
                <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-white">✕</button>
             </div>
             <div className="p-6 max-h-80 overflow-y-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-50"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Status</th></tr></thead>
                   <tbody>{recipients.map((r,i)=><tr key={i} className="border-b"><td className="p-2">{r.name}</td><td className="p-2">{r.email}</td><td className="p-2 text-green-600 font-bold">{r.status}</td></tr>)}</tbody>
                </table>
             </div>
             <div className="p-4 border-t flex justify-end bg-gray-50">
                <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg">Download CSV</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;





