import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, BarChart3, Download, FileText, Calendar, Filter, Tag, Mail, ShoppingBag, User, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ViewerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('CAMPAIGNS');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/campaigns/history');
        const sortedCampaigns = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCampaigns(sortedCampaigns);
      } catch (err) { }
    };
    fetchHistory();
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleViewReport = async (campaign) => {
    setSelectedCampaign(campaign);
    try { const { data } = await api.get(`/campaigns/${campaign.id}/recipients`); setRecipients(data); } catch (err) { }
  };

  const downloadCSV = () => {
    const headers = "Name,Email,Status,Sent At\n";
    const rows = recipients.map(r => `${r.name},${r.email},${r.status},${r.sentAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${selectedCampaign.campaignName}_Report.csv`; a.click();
  };

  // --- FILTER LOGIC ---
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

      {/* Sidebar */}
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 ml-1">Viewer Portal</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SideNavItem id="CAMPAIGNS" icon={FileText} label="Campaign Reports" />
          <SideNavItem id="ANALYTICS" icon={BarChart3} label="Analytics" />

          <div className="pt-8 pb-2">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Settings</p>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-gray-500 hover:bg-gray-100 hover:text-gray-900 group">
              <User className="w-5 h-5 text-gray-400 group-hover:text-nykaa-500" /> My Profile
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition font-medium text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full animate-fade-in">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 capitalize tracking-tight mb-2">
              {activeTab === 'CAMPAIGNS' && 'Campaign Reports'}
              {activeTab === 'ANALYTICS' && 'Analytics Overview'}
            </h1>
            <p className="text-gray-500 text-lg">
              {activeTab === 'CAMPAIGNS' && 'Access historical campaign data and delivery status reports.'}
              {activeTab === 'ANALYTICS' && 'Visualize engagement metrics across all channels.'}
            </p>
          </header>

          {activeTab === 'ANALYTICS' && (
            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Engagement by Channel</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={[
                    { name: 'Promotions', count: campaigns.filter(c => c.type === 'SMS').length },
                    { name: 'Newsletters', count: campaigns.filter(c => c.type === 'EMAIL').length },
                    { name: 'Orders', count: campaigns.filter(c => c.type === 'PUSH').length }
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

          {activeTab === 'CAMPAIGNS' && (
            <>
              {/* FILTERS */}
              <div className="flex gap-3 bg-white/50 p-1.5 rounded-xl border border-gray-200/50 w-fit backdrop-blur-sm mb-6">
                {filters.map(f => (
                  <button key={f.id} onClick={() => setFilterType(f.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${filterType === f.id ? 'bg-white text-nykaa-600 shadow-sm' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}>
                    <f.icon className="w-4 h-4" /> {f.label}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-6 font-semibold">Campaign Name</th>
                      <th className="p-6 font-semibold">Type</th>
                      <th className="p-6 font-semibold">Target Cities</th>
                      <th className="p-6 font-semibold">Sent Date</th>
                      <th className="p-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {getFilteredCampaigns().map((c, i) => (
                      <tr key={i} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="p-6 font-bold text-gray-900 group-hover:text-nykaa-600 transition-colors">{c.campaignName}</td>
                        <td className="p-6">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide ${c.type === 'SMS' ? 'bg-blue-50 text-blue-600' : c.type === 'EMAIL' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                            {c.type === 'SMS' ? 'PROMO' : c.type === 'EMAIL' ? 'NEWS' : 'ORDER'}
                          </span>
                        </td>
                        <td className="p-6 text-gray-600 text-sm font-medium">
                          {c.targetCities && c.targetCities.length > 0 ? c.targetCities.join(', ') : (c.targetCity ? c.targetCity : "Global")}
                        </td>
                        <td className="p-6 text-gray-500 flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleViewReport(c)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-nykaa-50 text-nykaa-700 rounded-xl text-xs font-bold hover:bg-nykaa-100 transition"><FileText className="w-3 h-3" /> View Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md flex justify-center items-center p-4 z-[100] animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">{selectedCampaign.campaignName}</h3>
                <p className="text-gray-400 text-sm">Delivery Status Report</p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">✕</button>
            </div>
            <div className="p-0 max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0"><tr><th className="p-4 font-semibold">Recipient</th><th className="p-4 font-semibold">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {recipients.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-900">{r.email}</td>
                      <td className="p-4"><span className="text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button onClick={downloadCSV} className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-green-700 shadow-md flex items-center gap-2 transition hover:scale-105 active:scale-95"><Download className="w-4 h-4" /> Download CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerDashboard;