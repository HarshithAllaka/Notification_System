import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, BarChart3, Download, FileText, Calendar, Filter, Tag, Mail, ShoppingBag } from 'lucide-react';

const ViewerDashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // <--- NEW

  useEffect(() => {
    const fetchHistory = async () => {
       try { const { data } = await api.get('/campaigns/history'); setCampaigns(data); } catch (err) {}
    };
    fetchHistory();
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleViewReport = async (campaign) => {
    setSelectedCampaign(campaign);
    try { const { data } = await api.get(`/campaigns/${campaign.id}/recipients`); setRecipients(data); } catch (err) {}
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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
           <h2 className="text-2xl font-extrabold text-blue-600">Nykaa Viewer</h2>
        </div>
        <div className="flex-1 p-4">
           <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium"><BarChart3 className="w-5 h-5"/> Reports Portal</button>
        </div>
        <div className="p-4 border-t border-gray-100">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition"><LogOut className="w-5 h-5"/> Logout</button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
         <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
            <p className="text-gray-500 mt-1">View historical data and download delivery reports.</p>
         </header>

         {/* FILTERS */}
         <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {filters.map(f => (
                <button key={f.id} onClick={() => setFilterType(f.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${filterType === f.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'}`}>
                    <f.icon className="w-4 h-4"/> {f.label}
                </button>
            ))}
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Campaign Name</th><th className="p-4">Type</th><th className="p-4">Sent Date</th><th className="p-4">Actions</th></tr></thead>
               <tbody className="divide-y divide-gray-100">
                 {getFilteredCampaigns().map((c, i) => (
                   <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-bold text-gray-900">{c.campaignName}</td>
                      <td className="p-4">
                         <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${c.type==='SMS'?'bg-blue-100 text-blue-700':c.type==='EMAIL'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>
                             {c.type==='SMS'?'PROMO':c.type==='EMAIL'?'NEWS':'ORDER'}
                         </span>
                      </td>
                      <td className="p-4 text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400"/> {new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                         <button onClick={() => handleViewReport(c)} className="flex items-center gap-2 text-blue-600 font-bold hover:underline"><FileText className="w-4 h-4"/> View Report</button>
                      </td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>
      </main>

      {/* Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                 <h3 className="font-bold">Report: {selectedCampaign.campaignName}</h3>
                 <button onClick={() => setSelectedCampaign(null)} className="text-blue-200 hover:text-white">✕</button>
              </div>
              <div className="p-6 max-h-80 overflow-y-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50"><tr><th className="p-2">Recipient</th><th className="p-2">Status</th></tr></thead>
                    <tbody>{recipients.map((r,i)=><tr key={i} className="border-b"><td className="p-2 font-medium">{r.email}</td><td className="p-2 text-green-600 font-bold">{r.status}</td></tr>)}</tbody>
                 </table>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                 <button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"><Download className="w-4 h-4"/> Download CSV</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ViewerDashboard;