import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Users, Briefcase, Megaphone, LogOut, UploadCloud,
  Plus, Trash2, Edit2, Shield, Search, Power,
  Filter, Tag, Mail, ShoppingBag, User, BarChart3, Package,
  Newspaper, Send, CalendarClock, Sparkles, LayoutDashboard
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('USERS');

  // Data States
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newsletters, setNewsletters] = useState([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [file, setFile] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Forms
  const [userData, setUserData] = useState({ name: '', email: '', password: '', city: '', phone: '' });
  const [staffData, setStaffData] = useState({ name: '', email: '', password: '', role: 'CREATOR' });
  const [productData, setProductData] = useState({ name: '', price: '', description: '' });

  // Newsletter Forms
  const [newsletterData, setNewsletterData] = useState({ title: '', description: '' });
  const [postData, setPostData] = useState({ title: '', content: '', scheduledAt: '' });
  const [selectedNewsletterId, setSelectedNewsletterId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [userRes, staffRes, campRes, prodRes, orderRes, newsRes] = await Promise.all([
        api.get('/admin/users/all'),
        api.get('/admin/all'),
        api.get('/campaigns/history'),
        api.get('/shop/products'),
        api.get('/shop/orders/all'),
        api.get('/newsletters/all')
      ]);
      setUsers(userRes.data);
      setStaff(staffRes.data);
      setCampaigns(campRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setProducts(prodRes.data);
      setOrders((orderRes.data || []).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      setNewsletters(newsRes.data || []);
    } catch (err) { console.error("Error loading data", err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- HANDLERS (Same login as before, just restyled UI) ---
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) await api.put(`/admin/users/${editingUser}`, userData);
      else await api.post('/admin/users/create', userData);
      toast.success(editingUser ? "User Updated!" : "User Created!");
      setUserData({ name: '', email: '', password: '', city: '', phone: '' }); setEditingUser(null); fetchAllData();
    } catch (err) { toast.error("Operation failed."); }
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try { await api.delete(`${endpoint}/${id}`); toast.success("Deleted!"); fetchAllData(); } catch (err) { toast.error("Failed."); }
  };

  const handleToggleStatus = async (userId) => {
    try { await api.put(`/admin/users/${userId}/toggle-status`); toast.success("Status Updated"); fetchAllData(); } catch (err) { toast.error("Update failed"); }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Select file!");
    const fd = new FormData(); fd.append('file', file);
    try { await api.post('/users/upload-csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success("Uploaded!"); fetchAllData(); } catch (err) { toast.error("Failed."); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/create-staff', staffData); toast.success("Staff Added!"); fetchAllData(); } catch (err) { toast.error("Failed."); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shop/products', productData);
      toast.success("Product Added to Shop!");
      setProductData({ name: '', price: '', description: '' });
      fetchAllData();
    } catch (err) { toast.error("Failed to add product."); }
  };

  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/shop/orders/${orderId}/status?status=${newStatus}`);
      toast.success("Order Status Updated!");
      fetchAllData();
    } catch (err) { toast.error("Failed to update status"); }
  };

  const handleCreateNewsletter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/newsletters/create', newsletterData);
      toast.success("Newsletter Created!");
      setNewsletterData({ title: '', description: '' });
      fetchAllData();
    } catch (err) { toast.error("Failed to create newsletter"); }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!selectedNewsletterId) return toast.error("Select a newsletter first!");

    const payload = {
      ...postData,
      scheduledAt: postData.scheduledAt ? postData.scheduledAt + ':00' : null
    };

    try {
      await api.post(`/newsletters/${selectedNewsletterId}/publish`, payload);
      if (payload.scheduledAt) toast.info("Post Scheduled Successfully!");
      else toast.success("Post Published to Subscribers!");

      setPostData({ title: '', content: '', scheduledAt: '' });
      setSelectedNewsletterId(null);
    } catch (err) { toast.error("Publishing failed."); }
  };

  const handleViewReport = async (camp) => {
    setSelectedCampaign(camp);
    try { const { data } = await api.get(`/campaigns/${camp.id}/recipients`); setRecipients(data); } catch (err) { }
  };

  const downloadCSV = () => {
    const headers = "Name,Email,Status,Sent At\n";
    const rows = recipients.map(r => `${r.name},${r.email},${r.status},${r.sentAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Report.csv`; a.click();
  };

  const getFilteredCampaigns = () => {
    if (filterType === 'ALL') return campaigns;
    return campaigns.filter(c => c.type === filterType);
  };

  // Reused Tab Button Component
  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${activeTab === id
          ? 'bg-gradient-to-r from-nykaa-600 to-brand-purple text-white shadow-lg shadow-nykaa-500/30 ring-2 ring-white/20'
          : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-nykaa-600'
        }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-gray-400 group-hover:text-nykaa-500'}`} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-50/50 backdrop-blur-3xl border-r border-white/50 hidden md:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-6 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-nykaa-600 to-brand-purple tracking-tighter">
            <Sparkles className="w-6 h-6 text-nykaa-500 fill-nykaa-500" /> Nykaa Admin
          </div>
          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2 ml-4">Main Menu</div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar">
          <TabButton id="ANALYTICS" icon={LayoutDashboard} label="Overview & Stats" />
          <TabButton id="USERS" icon={Users} label="Customer Base" />
          <TabButton id="STAFF" icon={Shield} label="Staff Management" />

          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mt-6 mb-2 ml-4">Operations</div>
          <TabButton id="PRODUCTS" icon={ShoppingBag} label="Store Inventory" />
          <TabButton id="ORDERS" icon={Package} label="Order Management" />

          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mt-6 mb-2 ml-4">Communication</div>
          <TabButton id="NEWSLETTERS" icon={Newspaper} label="Newsletters" />
          <TabButton id="CAMPAIGNS" icon={Megaphone} label="Campaigns" />
        </nav>

        <div className="p-4 border-t border-gray-200/50 m-2 bg-white/50 rounded-3xl backdrop-blur-sm">
          <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-white transition mb-2">
            <User className="w-5 h-5 text-gray-400" /> My Profile
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition text-sm font-bold shadow-sm">
            <LogOut className="w-5 h-5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-screen relative scroll-smooth">
        {/* Header */}
        <header className="flex justify-between items-end mb-10 animate-fade-in-down">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {activeTab === 'ANALYTICS' && 'System Analytics'}
              {activeTab === 'USERS' && 'Customer Base'}
              {activeTab === 'STAFF' && 'Staff Directory'}
              {activeTab === 'PRODUCTS' && 'Store Inventory'}
              {activeTab === 'ORDERS' && 'Order Management'}
              {activeTab === 'NEWSLETTERS' && 'Newsletter Publishing'}
              {activeTab === 'CAMPAIGNS' && 'System Campaigns'}
            </h1>
            <p className="text-gray-500 font-medium mt-2">Manage your platform efficiently.</p>
          </div>

          {activeTab !== 'NEWSLETTERS' && activeTab !== 'ANALYTICS' && (
            <button onClick={() => navigate('/creator-dashboard')} className="flex items-center gap-2 bg-gradient-to-r from-nykaa-600 to-brand-purple text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-nykaa-500/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5" /> Go to Creator Studio
            </button>
          )}
        </header>

        {/* --- USERS TAB --- */}
        {activeTab === 'USERS' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
            {/* Form Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nykaa-100 flex items-center justify-center text-nykaa-600"><Users size={20} /></div>
                {editingUser ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                  <input type="text" className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-nykaa-200 focus:ring-4 focus:ring-nykaa-50 rounded-xl p-4 transition-all duration-200 font-medium" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                  <input type="email" className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-nykaa-200 focus:ring-4 focus:ring-nykaa-50 rounded-xl p-4 transition-all duration-200 font-medium" value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} required placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                  <input type="password" className="w-full bg-gray-50 border-transparent focus:bg-white focus:border-nykaa-200 focus:ring-4 focus:ring-nykaa-50 rounded-xl p-4 transition-all duration-200 font-medium" value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Phone" className="bg-gray-50 border-transparent focus:bg-white focus:border-nykaa-200 focus:ring-4 focus:ring-nykaa-50 rounded-xl p-4 font-medium" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} />
                  <input type="text" placeholder="City" className="bg-gray-50 border-transparent focus:bg-white focus:border-nykaa-200 focus:ring-4 focus:ring-nykaa-50 rounded-xl p-4 font-medium" value={userData.city} onChange={e => setUserData({ ...userData, city: e.target.value })} />
                </div>
                <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition shadow-lg active:scale-95">{editingUser ? 'Save Updates' : 'Create Account'}</button>
              </form>
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Bulk Import (CSV)</h4>
                <div className="flex gap-3">
                  <input type="file" className="text-xs w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-nykaa-50 file:text-nykaa-700 hover:file:bg-nykaa-100" onChange={e => setFile(e.target.files[0])} />
                  <button onClick={handleUpload} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 shadow-md">Upload</button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 xl:col-span-2 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center sticky top-0 z-10">
                <span className="font-bold text-gray-800 text-lg">All Customers <span className="text-gray-400 text-sm font-medium ml-2">({users.length})</span></span>
                <div className="relative group">
                  <Search className="absolute left-4 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-nykaa-500 transition-colors" />
                  <input type="text" placeholder="Search by name..." className="pl-10 pr-6 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-nykaa-500 focus:bg-white w-64 transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="overflow-x-auto custom-scrollbar flex-1 p-2">
                <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                  <thead className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <tr><th className="p-4 pl-6">User Profile</th><th className="p-4">Status</th><th className="p-4 text-right pr-6">Management</th></tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                      <tr key={u.userId} className="group hover:-translate-y-0.5 transition-transform duration-200">
                        <td className="p-4 pl-6 bg-white border border-gray-100 rounded-l-2xl group-hover:border-nykaa-100 group-hover:shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold">{u.name.charAt(0)}</div>
                            <div>
                              <div className="font-bold text-gray-900 group-hover:text-nykaa-600 transition-colors">{u.name}</div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 bg-white border-y border-gray-100 group-hover:border-nykaa-100 group-hover:shadow-sm">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${u.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {u.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right bg-white border border-gray-100 rounded-r-2xl group-hover:border-nykaa-100 group-hover:shadow-sm">
                          <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleToggleStatus(u.userId)} className="p-2 rounded-lg bg-gray-50 hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 transition"><Power className="w-4 h-4" /></button>
                            <button onClick={() => { setEditingUser(u.userId); setUserData(u); }} className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete('/admin/users', u.userId)} className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- STAFF TAB (Simplified styling for brevity, but matching aesthetic) --- */}
        {activeTab === 'STAFF' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"><Briefcase size={20} /></div>
                Hire Staff
              </h3>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <input type="text" placeholder="Name" className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 rounded-xl p-4 font-medium" value={staffData.name} onChange={e => setStaffData({ ...staffData, name: e.target.value })} required />
                <input type="email" placeholder="Email" className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 rounded-xl p-4 font-medium" value={staffData.email} onChange={e => setStaffData({ ...staffData, email: e.target.value })} required />
                <input type="password" placeholder="Password" className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 rounded-xl p-4 font-medium" value={staffData.password} onChange={e => setStaffData({ ...staffData, password: e.target.value })} required />
                <select className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-purple-50 rounded-xl p-4 font-medium cursor-pointer" value={staffData.role} onChange={e => setStaffData({ ...staffData, role: e.target.value })}>
                  <option value="CREATOR">Creator (Can Launch Campaigns)</option>
                  <option value="VIEWER">Viewer (Read Only)</option>
                </select>
                <button className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200">Add Member</button>
              </form>
            </div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden p-6">
              <h3 className="font-bold text-gray-800 text-lg mb-6">Staff Directory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map(s => (
                  <div key={s.id} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-purple-200 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${s.role === 'CREATOR' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{s.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-purple-700 transition">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1 block">{s.role}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete('/admin', s.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'PRODUCTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nykaa-100 flex items-center justify-center text-nykaa-600"><ShoppingBag size={20} /></div>
                Add Product
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input type="text" placeholder="Product Name" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} required />
                <input type="number" placeholder="Price (₹)" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} required />
                <textarea placeholder="Description" className="w-full bg-gray-50 rounded-xl p-4 font-medium h-32 resize-none" value={productData.description} onChange={e => setProductData({ ...productData, description: e.target.value })} />
                <button className="w-full bg-nykaa-500 text-white py-4 rounded-xl font-bold hover:bg-nykaa-600 transition shadow-lg shadow-nykaa-500/30">Add to Shop</button>
              </form>
            </div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="group relative bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-nykaa-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-nykaa-500 transition shadow-sm"><ShoppingBag size={24} /></div>
                      <button onClick={() => handleDelete('/shop/products', p.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </div>
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{p.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{p.description}</p>
                    <div className="font-bold text-2xl text-gray-900">₹{p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'ORDERS' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-fade-in">
            <table className="w-full text-left border-collapse">
              <thead><tr className="text-gray-400 text-xs font-bold uppercase border-b border-gray-100"><th className="p-4">Order Info</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4 text-right">Update</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 bg-transparent"><div className="font-mono font-bold text-gray-900">#{o.id}</div><div className="text-xs text-gray-400">{new Date(o.orderDate).toLocaleDateString()}</div></td>
                    <td className="p-4 font-bold text-gray-800">{o.userName}</td>
                    <td className="p-4 font-bold text-gray-900">₹{o.amount}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${o.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{o.status}</span></td>
                    <td className="p-4 text-right">
                      <select className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:border-nykaa-500 outline-none" value={o.status} onChange={(e) => handleOrderStatus(o.id, e.target.value)}>
                        <option value="CONFIRMED">CONFIRMED</option><option value="SHIPPED">SHIPPED</option><option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option><option value="DELIVERED">DELIVERED</option><option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- NEWSLETTERS & CAMPAIGNS & ANALYTICS (Similar styling pattern) --- */}
        {/* For brevity, I will apply similar card/table styling to remaining tabs without repeating too much boilerplate, merging into cleaner layouts */}
        {activeTab === 'NEWSLETTERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-6">Create Newsletter</h3>
                <form onSubmit={handleCreateNewsletter} className="space-y-4">
                  <input type="text" placeholder="Title" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={newsletterData.title} onChange={e => setNewsletterData({ ...newsletterData, title: e.target.value })} required />
                  <textarea placeholder="Description" className="w-full bg-gray-50 rounded-xl p-4 font-medium h-24 resize-none" value={newsletterData.description} onChange={e => setNewsletterData({ ...newsletterData, description: e.target.value })} />
                  <button className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-black transition">Create</button>
                </form>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-blue-500" /> Publish Issue</h3>
                <form onSubmit={handlePublishPost} className="space-y-4">
                  <select className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={selectedNewsletterId || ''} onChange={e => setSelectedNewsletterId(e.target.value)} required>
                    <option value="" disabled>Select Newsletter</option>
                    {newsletters.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
                  </select>
                  <input type="text" placeholder="Issue Title" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={postData.title} onChange={e => setPostData({ ...postData, title: e.target.value })} required />
                  <textarea placeholder="Content..." className="w-full bg-gray-50 rounded-xl p-4 font-medium h-32 resize-none" value={postData.content} onChange={e => setPostData({ ...postData, content: e.target.value })} required />
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="text-xs font-bold text-blue-600 uppercase mb-2 block">Schedule (Optional)</label>
                    <input type="datetime-local" className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm" value={postData.scheduledAt} onChange={e => setPostData({ ...postData, scheduledAt: e.target.value })} />
                  </div>
                  <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">{postData.scheduledAt ? 'Schedule' : 'Publish Now'}</button>
                </form>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-xl mb-6">Active Newsletters</h3>
              <div className="grid grid-cols-1 gap-4">
                {newsletters.map(n => (
                  <div key={n.id} className="p-6 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-default border border-transparent hover:border-gray-100">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-gray-900 text-lg">{n.title}</h4>
                      <span className="text-xs font-mono text-gray-400">ID: {n.id}</span>
                    </div>
                    <p className="text-gray-500 mt-2 text-sm">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CAMPAIGNS' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-fade-in">
            <div className="flex gap-2 mb-6 overlow-x-auto">
              {[{ id: 'ALL', label: 'All' }, { id: 'SMS', label: 'Promotions' }, { id: 'EMAIL', label: 'Newsletters' }, { id: 'PUSH', label: 'Orders' }].map(f => (
                <button key={f.id} onClick={() => setFilterType(f.id)} className={`px-5 py-2 rounded-full font-bold text-sm transition ${filterType === f.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{f.label}</button>
              ))}
            </div>
            <div className="space-y-4">
              {getFilteredCampaigns().map(c => (
                <div key={c.id} className="p-6 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 flex items-center justify-between group">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${c.type === 'SMS' ? 'bg-pink-100 text-pink-700' : c.type === 'EMAIL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{c.type}</span>
                      <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">{c.campaignName}</h4>
                    <p className="text-sm text-gray-500">Target: {c.targetCities && c.targetCities.length > 0 ? c.targetCities.join(', ') : (c.targetCity || "Global")}</p>
                  </div>
                  <div className="flex gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleViewReport(c)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Reports</button>
                    <button onClick={() => handleDelete('/campaigns', c.id)} className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 transition"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'ANALYTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-xl mb-6 text-center">User Demographics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={[
                    { name: 'Customers', value: users.length, color: '#fc2779' },
                    { name: 'Admin', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                    { name: 'Staff', value: staff.filter(s => s.role !== 'ADMIN').length, color: '#10b981' }
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {[
                      { name: 'Customers', value: users.length, color: '#fc2779' },
                      { name: 'Admin', value: staff.filter(s => s.role === 'ADMIN').length, color: '#8b5cf6' },
                      { name: 'Staff', value: staff.filter(s => s.role !== 'ADMIN').length, color: '#10b981' }
                    ].map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500"><div className="w-3 h-3 rounded-full bg-nykaa-500"></div>Customers</div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500"><div className="w-3 h-3 rounded-full bg-purple-500"></div>Admin</div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500"><div className="w-3 h-3 rounded-full bg-green-500"></div>Staff</div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-xl mb-6 text-center">Campaign Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'SMS', count: campaigns.filter(c => c.type === 'SMS').length },
                  { name: 'Email', count: campaigns.filter(c => c.type === 'EMAIL').length },
                  { name: 'Push', count: campaigns.filter(c => c.type === 'PUSH').length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#fc2779" radius={[10, 10, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden scale-95 animate-in zoom-in duration-200">
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
              <h3 className="font-bold text-xl">Campaign Report</h3>
              <button onClick={() => setSelectedCampaign(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">✕</button>
            </div>
            <div className="p-0 max-h-96 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 sticky top-0"><tr className="text-xs uppercase text-gray-500"><th className="p-4">Recipient</th><th className="p-4">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {recipients.map((r, i) => (
                    <tr key={i}>
                      <td className="p-4"><div className="font-bold text-gray-900">{r.name}</div><div className="text-xs text-gray-400">{r.email}</div></td>
                      <td className="p-4"><span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md text-xs">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={downloadCSV} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg active:scale-95 transition">Download CSV Report</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;