import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Briefcase, Megaphone, LogOut, UploadCloud,
  Plus, Search, Power,
  Filter, Tag, Mail, ShoppingBag, User, BarChart3, Package,
  Newspaper, Send, CalendarClock, Sparkles, LayoutDashboard,
  CheckCircle2, MapPin, Download, FileText, Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ViewerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ANALYTICS');

  // Data States
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newsletters, setNewsletters] = useState([]);

  // Newsletter View State
  const [viewingNewsletter, setViewingNewsletter] = useState(null);
  const [newsletterPosts, setNewsletterPosts] = useState([]);

  // Reporting
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      const [campRes, prodRes, orderRes, newsRes] = await Promise.all([
        api.get('/campaigns/history'),
        api.get('/shop/products'),
        api.get('/shop/orders/all'),
        api.get('/newsletters/all')
      ]);
      setCampaigns(campRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setProducts(prodRes.data);
      setOrders((orderRes.data || []).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      setNewsletters(newsRes.data || []);
    } catch (err) { console.error("Error loading data", err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // --- NEWSLETTER VIEW HANDLERS ---
  const handleViewPosts = async (newsletter) => {
    setViewingNewsletter(newsletter);
    try {
      const { data } = await api.get(`/newsletters/${newsletter.id}/posts`);
      setNewsletterPosts(data.sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)));
    } catch (err) { toast.error("Failed to load issues"); }
  };

  // --- CAMPAIGN REPORT HANDLERS ---
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
            <Sparkles className="w-6 h-6 text-nykaa-500 fill-nykaa-500" /> Nykaa Viewer
          </div>
          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2 ml-4">Main Menu</div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar">
          <TabButton id="ANALYTICS" icon={BarChart3} label="Analytics" />

          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase mt-6 mb-2 ml-4">Operations</div>
          <TabButton id="PRODUCTS" icon={ShoppingBag} label="Store Inventory" />
          <TabButton id="ORDERS" icon={Package} label="Order History" />

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
        <header className="mb-10 animate-fade-in-down">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {activeTab === 'ANALYTICS' && 'Analytics Overview'}
            {activeTab === 'PRODUCTS' && 'Store Inventory (Read Only)'}
            {activeTab === 'ORDERS' && 'Order History'}
            {activeTab === 'NEWSLETTERS' && 'Active Newsletters'}
            {activeTab === 'PROMOTIONS' && 'Campaign Reports'}
          </h1>
          <p className="text-gray-500 font-medium mt-2">View-only access to platform data.</p>
        </header>

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'PRODUCTS' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.length === 0 ? <p className="text-gray-400 col-span-4 text-center py-10">No products available.</p> : products.map(p => (
                <div key={p.id} className="group relative bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-nykaa-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-nykaa-500 transition shadow-sm mb-4 overflow-hidden">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <ShoppingBag size={24} />}
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-1">{p.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{p.description}</p>
                  <div className="font-bold text-2xl text-gray-900">₹{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'ORDERS' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 animate-fade-in">
            <table className="w-full text-left border-collapse">
              <thead><tr className="text-gray-400 text-xs font-bold uppercase border-b border-gray-100"><th className="p-4">Order Info</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4 text-right">Status</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 bg-transparent"><div className="font-mono font-bold text-gray-900">#{o.id}</div><div className="text-xs text-gray-400">{new Date(o.orderDate).toLocaleDateString()}</div></td>
                    <td className="p-4 font-bold text-gray-800">{o.userName}</td>
                    <td className="p-4 font-bold text-gray-900">₹{o.amount}</td>
                    <td className="p-4 text-right"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${o.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- NEWSLETTERS TAB --- */}
        {activeTab === 'NEWSLETTERS' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-in">
            <div className="grid grid-cols-1 gap-4">
              {newsletters.length === 0 ? <p className="text-gray-400 py-10 text-center">No newsletters.</p> : newsletters.map(n => (
                <div key={n.id} className="p-6 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 group flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{n.title}</h4>
                    <p className="text-gray-500 text-sm">{n.description}</p>
                  </div>
                  <button onClick={() => handleViewPosts(n)} className="px-5 py-2.5 bg-white text-blue-600 text-xs font-bold rounded-xl shadow-sm border border-gray-100 hover:bg-blue-50 transition">View Publications</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- NEWSLETTER POSTS MODAL --- */}
        {viewingNewsletter && (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md flex justify-center items-center p-4 z-[100] animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up ring-1 ring-black/5 flex flex-col max-h-[85vh]">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-2xl">{viewingNewsletter.title}</h3>
                  <p className="text-gray-400 font-medium">Publication History</p>
                </div>
                <button onClick={() => setViewingNewsletter(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-lg">✕</button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                {newsletterPosts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><Newspaper size={32} /></div>
                    <p className="text-gray-500 font-bold">No publications involved.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="text-gray-400 text-xs font-bold uppercase sticky top-0 bg-white z-10"><tr className="border-b border-gray-100"><th className="p-4 pl-0">Subject</th><th className="p-4">Status</th><th className="p-4">Sent At</th><th className="p-4 text-right pr-0">Reach</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {newsletterPosts.map(p => {
                        const displayStatus = p.status || (p.sentAt ? 'SENT' : 'DRAFT');
                        return (
                          <tr key={p.id} className="hover:bg-gray-50/50 transition">
                            <td className="p-4 pl-0 font-bold text-gray-800">{p.title}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${displayStatus === 'SENT' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{displayStatus}</span></td>
                            <td className="p-4 text-sm text-gray-500">{p.sentAt ? new Date(p.sentAt).toLocaleString() : 'Scheduled'}</td>
                            <td className="p-4 font-mono text-xs font-bold text-gray-600 text-right pr-0">{p.recipientsCount || 0} Sent</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- PROMOTIONS TAB --- */}
        {activeTab === 'PROMOTIONS' && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900">Active Offers Reports</h3>
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
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-100 transition-opacity">
                    <button onClick={() => handleViewReport(c)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition flex items-center gap-2"><FileText className="w-4 h-4" /> Report</button>
                  </div>
                </div>
              ))}
              {campaigns.filter(c => c.type === 'Promotion Offers').length === 0 && (
                <div className="text-center py-10 text-gray-400">No active promotional offers found.</div>
              )}
            </div>
          </div>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'ANALYTICS' && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-in">
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
        )}

      </main>

      {/* REPORT MODAL */}
      {selectedCampaign && (
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
                      <td className="p-4"><div className="font-bold text-gray-900">{r.email}</div></td>
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
              <button onClick={downloadCSV} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg active:scale-95 transition flex items-center gap-2"><Download className="w-4 h-4" /> Download CSV</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewerDashboard;