import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Briefcase, Megaphone, LogOut, UploadCloud,
  Plus, Trash2, Edit2, Shield, Search, Power,
  Filter, Tag, Mail, ShoppingBag, User, BarChart3, Package,
  Newspaper, Send, CalendarClock, Sparkles, LayoutDashboard,
  CheckCircle2, MapPin
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PROMOTIONS');

  // Data States
  const [users, setUsers] = useState([]); // Kept for Analytics & Cities
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newsletters, setNewsletters] = useState([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingNewsletter, setEditingNewsletter] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Forms
  const [productData, setProductData] = useState({ name: '', price: '', description: '', imageUrl: '' });

  // Newsletter Forms
  const [newsletterData, setNewsletterData] = useState({ title: '', description: '' });
  const [postData, setPostData] = useState({ title: '', content: '', scheduledAt: '' });
  const [selectedNewsletterId, setSelectedNewsletterId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Campaign State
  const [campaignData, setCampaignData] = useState({ name: '', type: 'Promotion Offers', content: '', schedule: '', targetCities: [], channels: ['EMAIL', 'SMS', 'PUSH'], scheduledAt: '' });
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  // Newsletter View State
  const [viewingNewsletter, setViewingNewsletter] = useState(null);
  const [newsletterPosts, setNewsletterPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  // --- HANDLERS ---
  const handleViewPosts = async (newsletter) => {
    setViewingNewsletter(newsletter);
    try {
      const { data } = await api.get(`/newsletters/${newsletter.id}/posts`);
      setNewsletterPosts(data.sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)));
    } catch (err) { toast.error("Failed to load issues"); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      await api.delete(`/newsletters/posts/${postId}`);
      toast.success("Issue deleted");
      setNewsletterPosts(newsletterPosts.filter(p => p.id !== postId));
    } catch (err) { toast.error("Failed"); }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostData({
      title: post.title,
      content: post.content,
      scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : '' // Format for datetime-local
    });
    setSelectedNewsletterId(viewingNewsletter.id);
    setViewingNewsletter(null); // Close modal to show form
    // Optional: scroll to form
  };

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      // NOTE: We fetch users for analytics/cities, but we do NOT manage them.
      // We do NOT fetch staff (/admin/all).
      const [userRes, campRes, prodRes, orderRes, newsRes] = await Promise.all([
        api.get('/admin/users/all'),
        api.get('/campaigns/history'),
        api.get('/shop/products'),
        api.get('/shop/orders/all'),
        api.get('/newsletters/all')
      ]);
      setUsers(userRes.data);
      setCampaigns(campRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setProducts(prodRes.data);
      setOrders((orderRes.data || []).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      setNewsletters(newsRes.data || []);
    } catch (err) { console.error("Error loading data", err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try { await api.delete(`${endpoint}/${id}`); toast.success("Deleted!"); fetchAllData(); } catch (err) { toast.error("Failed."); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/shop/products/${editingProduct.id}`, productData);
        toast.success("Product Updated!");
        setEditingProduct(null);
      } else {
        await api.post('/shop/products', productData);
        toast.success("Product Added to Shop!");
      }
      setProductData({ name: '', price: '', description: '', imageUrl: '' });
      fetchAllData();
    } catch (err) { toast.error("Failed to save product."); }
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
      if (editingNewsletter) {
        await api.put(`/newsletters/${editingNewsletter.id}`, newsletterData);
        toast.success("Newsletter Updated!");
        setEditingNewsletter(null);
      } else {
        await api.post('/newsletters/create', newsletterData);
        toast.success("Newsletter Created!");
      }
      setNewsletterData({ title: '', description: '' });
      fetchAllData();
    } catch (err) { toast.error("Failed to save newsletter"); }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!selectedNewsletterId) return toast.error("Select a newsletter first!");

    const payload = {
      ...postData,
      scheduledAt: postData.scheduledAt ? postData.scheduledAt + ':00' : null
    };

    try {
      if (editingPost) {
        await api.put(`/newsletters/posts/${editingPost.id}`, payload);
        toast.success("Post Updated Successfully!");
        setEditingPost(null);
      } else {
        await api.post(`/newsletters/${selectedNewsletterId}/publish`, payload);
        if (payload.scheduledAt) toast.info("Post Scheduled Successfully!");
        else toast.success("Post Published to Subscribers!");
      }

      setPostData({ title: '', content: '', scheduledAt: '' });
      setSelectedNewsletterId(null);
    } catch (err) { toast.error("Operation failed."); }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...campaignData, scheduledAt: campaignData.scheduledAt ? campaignData.scheduledAt + ':00' : null };
    try {
      if (editingCampaign) {
        await api.put(`/campaigns/${editingCampaign.id}`, payload);
        toast.success("Promotion Updated!");
        setEditingCampaign(null);
      } else {
        await api.post('/campaigns/create', payload);
        toast.success("Promotion Launched!");
      }
      setCampaignData({ name: '', type: 'Promotion Offers', content: '', schedule: '', targetCities: [], channels: ['EMAIL', 'SMS', 'PUSH'], scheduledAt: '' });
      fetchAllData();
    } catch (err) { toast.error("Operation failed."); }
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

  const handleViewReport = async (camp) => {
    setSelectedCampaign(camp);
    try {
      const { data } = await api.get(`/campaigns/${camp.id}/recipients`);
      const groupedMap = new Map();
      (data || []).forEach(r => {
        if (!groupedMap.has(r.email)) {
          groupedMap.set(r.email, { ...r, channels: r.channel ? [r.channel] : [] });
        } else {
          const existing = groupedMap.get(r.email);
          if (r.channel && !existing.channels.includes(r.channel)) {
            existing.channels.push(r.channel);
          }
        }
      });
      setRecipients(Array.from(groupedMap.values()));
    } catch (err) { }
  };

  const downloadCSV = () => {
    const headers = "Name,Email,Status,Channels,Sent At\n";
    const rows = recipients.map(r => `${r.name},${r.email},${r.status},"${r.channels.join('|')}",${r.sentAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Report.csv`; a.click();
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
            <Sparkles className="w-6 h-6 text-nykaa-500 fill-nykaa-500" /> Nykaa Creator
          </div>
          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2 ml-4">Main Menu</div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar">
          <TabButton id="ANALYTICS" icon={LayoutDashboard} label="Overview & Stats" />

          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mt-6 mb-2 ml-4">Operations</div>
          <TabButton id="PRODUCTS" icon={ShoppingBag} label="Store Inventory" />
          <TabButton id="ORDERS" icon={Package} label="Order Management" />

          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mt-6 mb-2 ml-4">Communication</div>
          <TabButton id="NEWSLETTERS" icon={Newspaper} label="Newsletters" />
          <TabButton id="PROMOTIONS" icon={Megaphone} label="Promotional Offers" />
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
              {activeTab === 'PRODUCTS' && 'Store Inventory'}
              {activeTab === 'ORDERS' && 'Order Management'}
              {activeTab === 'NEWSLETTERS' && 'Newsletter Publishing'}
              {activeTab === 'PROMOTIONS' && 'Promotional Offers'}
            </h1>
            <p className="text-gray-500 font-medium mt-2">Manage your creator platform.</p>
          </div>
        </header>

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'PRODUCTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nykaa-100 flex items-center justify-center text-nykaa-600"><ShoppingBag size={20} /></div>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input type="text" placeholder="Product Name" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} required />
                <input type="number" placeholder="Price (₹)" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} required />
                <input type="text" placeholder="Image URL (Optional)" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={productData.imageUrl || ''} onChange={e => setProductData({ ...productData, imageUrl: e.target.value })} />
                <textarea placeholder="Description" className="w-full bg-gray-50 rounded-xl p-4 font-medium h-32 resize-none" value={productData.description} onChange={e => setProductData({ ...productData, description: e.target.value })} />
                <div className="flex gap-2">
                  {editingProduct && <button type="button" onClick={() => { setEditingProduct(null); setProductData({ name: '', price: '', description: '', imageUrl: '' }); }} className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>}
                  <button className="w-full bg-nykaa-500 text-white py-4 rounded-xl font-bold hover:bg-nykaa-600 transition shadow-lg shadow-nykaa-500/30">{editingProduct ? 'Update Product' : 'Add to Shop'}</button>
                </div>
              </form>
            </div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="group relative bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-nykaa-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-nykaa-500 transition shadow-sm overflow-hidden">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingBag size={24} />}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingProduct(p); setProductData(p); }} className="text-gray-300 hover:text-blue-500 transition p-1"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete('/shop/products', p.id)} className="text-gray-300 hover:text-red-500 transition p-1"><Trash2 size={18} /></button>
                      </div>
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

        {/* --- NEWSLETTERS TAB --- */}
        {activeTab === 'NEWSLETTERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-6">{editingNewsletter ? 'Edit Newsletter' : 'Create Newsletter'}</h3>
                <form onSubmit={handleCreateNewsletter} className="space-y-4">
                  <input type="text" placeholder="Title" className="w-full bg-gray-50 rounded-xl p-4 font-medium" value={newsletterData.title} onChange={e => setNewsletterData({ ...newsletterData, title: e.target.value })} required />
                  <textarea placeholder="Description" className="w-full bg-gray-50 rounded-xl p-4 font-medium h-24 resize-none" value={newsletterData.description} onChange={e => setNewsletterData({ ...newsletterData, description: e.target.value })} />
                  <div className="flex gap-2">
                    {editingNewsletter && <button type="button" onClick={() => { setEditingNewsletter(null); setNewsletterData({ title: '', description: '' }); }} className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>}
                    <button className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-black transition">{editingNewsletter ? 'Update' : 'Create'}</button>
                  </div>
                </form>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-blue-500" /> {editingPost ? 'Edit Publication' : 'Publish'}</h3>
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
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="text-xs font-bold text-blue-600 uppercase mb-2 block">Schedule (Optional)</label>
                    <input type="datetime-local" className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm" value={postData.scheduledAt} onChange={e => setPostData({ ...postData, scheduledAt: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    {editingPost && <button type="button" onClick={() => { setEditingPost(null); setPostData({ title: '', content: '', scheduledAt: '' }); setSelectedNewsletterId(null); }} className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>}
                    <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">{editingPost ? 'Update' : (postData.scheduledAt ? 'Schedule' : 'Publish Now')}</button>
                  </div>
                </form>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="font-bold text-xl mb-6">Active Newsletters</h3>
              <div className="grid grid-cols-1 gap-4">
                {newsletters.map(n => (
                  <div key={n.id} className="p-6 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-lg">{n.title}</h4>
                          <button onClick={() => { setEditingNewsletter(n); setNewsletterData(n); }} className="p-1 text-gray-300 hover:text-blue-500 transition opacity-0 group-hover:opacity-100"><Edit2 size={14} /></button>
                        </div>
                        <span className="text-xs font-mono text-gray-400">ID: {n.id}</span>
                      </div>
                      <button onClick={() => handleViewPosts(n)} className="px-4 py-2 bg-white text-blue-600 text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-blue-50">
                        Publications
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm">{n.description}</p>
                    <button onClick={() => handleViewPosts(n)} className="mt-4 w-full py-2 bg-gray-200/50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition">View History</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
        }

        {/* --- NEWSLETTER POSTS MODAL --- */}
        {
          viewingNewsletter && (
            <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md flex justify-center items-center p-4 z-[100] animate-fade-in">
              <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up ring-1 ring-black/5 flex flex-col max-h-[85vh]">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-bold text-2xl">{viewingNewsletter.title}</h3>
                    <p className="text-gray-400 font-medium">Publication History & Performance</p>
                  </div>
                  <button onClick={() => setViewingNewsletter(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-lg">✕</button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                  {newsletterPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><Newspaper size={32} /></div>
                      <p className="text-gray-500 font-bold">No publications yet.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="text-gray-400 text-xs font-bold uppercase sticky top-0 bg-white z-10"><tr className="border-b border-gray-100"><th className="p-4 pl-0">Subject</th><th className="p-4">Status</th><th className="p-4">Sent At</th><th className="p-4">Reach</th><th className="p-4 text-right pr-0">Actions</th></tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {newsletterPosts.map(p => {
                          // Fallback for null status on legacy posts
                          const displayStatus = p.status || (p.sentAt ? 'SENT' : 'DRAFT');
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition">
                              <td className="p-4 pl-0 font-bold text-gray-800">{p.title}</td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${displayStatus === 'SENT' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{displayStatus}</span></td>
                              <td className="p-4 text-sm text-gray-500">{p.sentAt ? new Date(p.sentAt).toLocaleString() : 'Scheduled'}</td>
                              <td className="p-4 font-mono text-xs font-bold text-gray-600">{p.recipientsCount || 0} Sent</td>
                              <td className="p-4 pr-0 text-right">
                                <button onClick={() => handleDeletePost(p.id)} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {/* --- PROMOTIONS TAB --- */}
        {
          activeTab === 'PROMOTIONS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              {/* LIST SECTION */}
              <div className="lg:col-span-8">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-gray-900">Active Offers</h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{campaigns.filter(c => c.type === 'Promotion Offers').length} Active</span>
                  </div>

                  <div className="space-y-4">
                    {campaigns.filter(c => c.type === 'Promotion Offers').map(c => (
                      <div key={c.id} className="p-6 rounded-3xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 flex items-center justify-between group">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-pink-100 text-pink-700">PROMO</span>
                            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">{c.campaignName}</h4>
                          <div className="flex gap-2 mt-1">
                            {c.channels && c.channels.map(ch => (
                              <span key={ch} className="text-[10px] font-bold text-gray-500 border border-gray-200 px-1.5 rounded">{ch}</span>
                            ))}
                            {c.scheduledAt && new Date(c.scheduledAt) > new Date() ? (
                              <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-1.5 rounded flex items-center gap-1">
                                <CalendarClock size={10} /> Scheduled: {new Date(c.scheduledAt).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-1.5 rounded flex items-center gap-1">
                                <CheckCircle2 size={10} /> Sent
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingCampaign(c); setCampaignData({ ...c, name: c.campaignName, type: 'Promotion Offers', channels: c.channels || [], targetCities: c.targetCities || [] }); }} className="p-2 bg-white text-blue-500 rounded-xl hover:bg-blue-50 transition border border-gray-100"><Edit2 size={18} /></button>
                          <button onClick={() => handleViewReport(c)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Reports</button>
                          <button onClick={() => handleDelete('/campaigns', c.id)} className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-50 transition"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    ))}
                    {campaigns.filter(c => c.type === 'Promotion Offers').length === 0 && (
                      <div className="text-center py-10 text-gray-400">No active promotional offers. Create one!</div>
                    )}
                  </div>
                </div>
              </div>

              {/* CREATE FORM SECTION */}
              <div className="lg:col-span-4">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                      <Tag className="w-5 h-5" />
                    </div>
                    {editingCampaign ? 'Edit Offer' : 'Create New Offer'}
                  </h3>

                  <form onSubmit={(e) => { e.preventDefault(); handleCampaignSubmit(e); }} className="space-y-5">
                    <input type="hidden" value="Promotion Offers" />

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Offer Name</label>
                      <input type="text" placeholder="e.g. Monsoon Sale 50% Off" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3.5 outline-none focus:ring-4 focus:ring-nykaa-50 transition-all font-medium text-sm" value={campaignData.name} onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value, type: 'Promotion Offers' })} required />
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
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Details / Content</label>
                      <textarea
                        rows="4"
                        placeholder="Describe the offer..."
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-nykaa-200 rounded-xl p-3.5 outline-none focus:ring-4 focus:ring-nykaa-50 transition-all font-medium text-sm resize-none"
                        value={campaignData.content}
                        onChange={(e) => setCampaignData({ ...campaignData, content: e.target.value })}
                        required
                      />
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
                                {['All Cities', ...new Set(users.map(u => u.city).filter(Boolean))].map(city => (
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
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingCampaign && <button type="button" onClick={() => { setEditingCampaign(null); setCampaignData({ name: '', type: 'Promotion Offers', content: '', schedule: '', targetCities: [], channels: ['EMAIL', 'SMS', 'PUSH'], scheduledAt: '' }); }} className="w-1/3 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>}
                      <button className="w-full bg-gradient-to-r from-nykaa-600 to-brand-purple text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-nykaa-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                        <Send className="w-4 h-4" /> {editingCampaign ? 'Update' : 'Launch'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        }

        {/* --- ANALYTICS TAB --- */}
        {
          activeTab === 'ANALYTICS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
              {/* Promotion Channel Distribution */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 col-span-2">
                <h3 className="font-bold text-xl mb-2 text-center">Promotions Activity</h3>
                <p className="text-center text-xs text-gray-400 font-bold uppercase mb-6">Breakdown by Channel</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Email', count: campaigns.filter(c => c.type === 'Promotion Offers' && c.channels && c.channels.includes('EMAIL')).length },
                    { name: 'SMS', count: campaigns.filter(c => c.type === 'Promotion Offers' && c.channels && c.channels.includes('SMS')).length },
                    { name: 'Push', count: campaigns.filter(c => c.type === 'Promotion Offers' && c.channels && c.channels.includes('PUSH')).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#fc2779" radius={[10, 10, 0, 0]} barSize={50}>
                      <Cell fill="#f59e0b" /> {/* Email - Amber */}
                      <Cell fill="#3b82f6" /> {/* SMS - Blue */}
                      <Cell fill="#a855f7" /> {/* Push - Purple */}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        }
      </main >

      {/* MODAL */}
      {
        selectedCampaign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden scale-95 animate-in zoom-in duration-200">
              <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                <h3 className="font-bold text-xl">Campaign Report</h3>
                <button onClick={() => setSelectedCampaign(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">✕</button>
              </div>
              <div className="p-0 max-h-96 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 sticky top-0"><tr className="text-xs uppercase text-gray-500"><th className="p-4">Recipient</th><th className="p-4">Channels</th><th className="p-4">Status</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((r, i) => (
                      <tr key={i}>
                        <td className="p-4"><div className="font-bold text-gray-900">{r.name}</div><div className="text-xs text-gray-400">{r.email}</div></td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {r.channels && r.channels.map(ch => (
                              <span key={ch} className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-gray-50 text-gray-500 border-gray-200">{ch}</span>
                            ))}
                          </div>
                        </td>
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
        )
      }

    </div >
  );
};

export default CreatorDashboard;