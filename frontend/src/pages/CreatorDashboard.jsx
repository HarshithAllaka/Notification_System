import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('CAMPAIGNS');

  // Campaign State
  const [campaigns, setCampaigns] = useState([]);
  // Default to 'SMS' which maps to 'Promotional Offers'
  const [campaignData, setCampaignData] = useState({ name: '', type: 'SMS', content: '', schedule: '' });
  const [editingCampaign, setEditingCampaign] = useState(null); 
  
  // User State
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({ name: '', email: '', password: '', city: '', phone: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [file, setFile] = useState(null);

  // Reporting State
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campRes, userRes] = await Promise.all([
        api.get('/campaigns/history'),
        api.get('/admin/users/all')
      ]);
      setCampaigns(campRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error("Failed to load data");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- CAMPAIGN LOGIC ---
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
      // Reset form
      setCampaignData({ name: '', type: 'SMS', content: '', schedule: '' });
      setEditingCampaign(null);
      fetchData();
    } catch (err) { toast.error("Operation failed."); }
  };

  const startEditCampaign = (c) => {
    setEditingCampaign(c.id);
    setCampaignData({ name: c.campaignName, type: c.type, content: c.content, schedule: '' });
    setActiveTab('CAMPAIGNS');
    window.scrollTo(0,0);
  };

  // --- USER LOGIC ---
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser}`, userData);
        toast.success("User Updated!");
      } else {
        await api.post('/admin/users/create', userData);
        toast.success("User Created!");
      }
      setUserData({ name: '', email: '', password: '', city: '', phone: '' });
      setEditingUser(null);
      fetchData();
    } catch (err) { toast.error("Operation failed."); }
  };

  const startEditUser = (u) => {
    setEditingUser(u.userId);
    setUserData({ name: u.name, email: u.email, password: '', city: u.city, phone: u.phone });
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Select file first");
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/users/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("CSV Uploaded!");
      fetchData();
    } catch(err) { toast.error("Upload failed"); }
  };

  // --- REPORTING LOGIC ---
  const handleViewReport = async (camp) => {
    setSelectedCampaign(camp);
    setLoadingReport(true);
    try {
      const { data } = await api.get(`/campaigns/${camp.id}/recipients`);
      setRecipients(data);
    } catch (err) { toast.error("Failed to load report"); }
    setLoadingReport(false);
  };

  const downloadCSV = () => {
    if (!recipients.length) return;
    const headers = "Name,Email,Status,Sent At\n";
    const rows = recipients.map(r => `${r.name},${r.email},${r.status},${r.sentAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCampaign.campaignName}_Report.csv`;
    a.click();
  };

  // Helper to display friendly names in the table
  const getTypeName = (type) => {
    if (type === 'SMS') return 'Promotional Offer';
    if (type === 'EMAIL') return 'Newsletter';
    if (type === 'PUSH') return 'Order Update';
    return type;
  };

  return (
    <div className="min-h-screen bg-purple-50 pb-10 font-sans">
      <ToastContainer position="top-right" autoClose={2000} />
      
      <nav className="bg-purple-700 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">🎨 Creator Workspace</h1>
        <button onClick={handleLogout} className="bg-white text-purple-700 px-4 py-2 rounded font-bold hover:bg-gray-200">Logout</button>
      </nav>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mt-6 flex justify-center gap-4 border-b-2 border-purple-200 pb-2">
        <button onClick={() => setActiveTab('CAMPAIGNS')} className={`px-6 py-2 font-bold rounded ${activeTab === 'CAMPAIGNS' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600'}`}>Manage Campaigns</button>
        <button onClick={() => setActiveTab('USERS')} className={`px-6 py-2 font-bold rounded ${activeTab === 'USERS' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600'}`}>Manage Users</button>
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        
        {/* === TAB 1: CAMPAIGNS === */}
        {activeTab === 'CAMPAIGNS' && (
          <>
            {/* Form */}
            <div className="bg-white p-6 rounded shadow mb-6 animate-fade-in-up">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{editingCampaign ? 'Edit Campaign' : 'Launch New Campaign'}</h2>
              <form onSubmit={handleCampaignSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Campaign Name</label>
                    <input type="text" required placeholder="e.g. Diwali Flash Sale" className="border p-2 rounded w-full" value={campaignData.name} onChange={(e) => setCampaignData({...campaignData, name: e.target.value})} />
                  </div>

                  {/* --- UPDATED DROPDOWN (Matches User Preferences) --- */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-1">Target Audience (Preference)</label>
                    <select 
                      className="border p-2 rounded w-full bg-white" 
                      value={campaignData.type} 
                      onChange={(e) => setCampaignData({...campaignData, type: e.target.value})}
                    >
                      <option value="SMS">Promotional Offers</option>
                      <option value="EMAIL">Newsletters</option>
                      <option value="PUSH">Order Updates</option>
                    </select>
                  </div>

                </div>
                
                {/* Content Input */}
                <div>
                   <label className="block text-gray-700 text-sm font-bold mb-1">Message Content</label>
                   <textarea required rows="3" placeholder="Type your message here..." className="w-full border p-2 rounded" value={campaignData.content} onChange={(e) => setCampaignData({...campaignData, content: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 transition">{editingCampaign ? 'Update Campaign' : '🚀 Launch Campaign'}</button>
                {editingCampaign && <button type="button" onClick={() => {setEditingCampaign(null); setCampaignData({ name: '', type: 'SMS', content: '', schedule: '' })}} className="w-full mt-2 text-gray-500 underline">Cancel Edit</button>}
              </form>
            </div>

            {/* List */}
            <div className="bg-white p-6 rounded shadow animate-fade-in-up delay-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Campaign History</h2>
              <table className="w-full text-sm text-left">
                <thead className="bg-purple-100"><tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Actions</th></tr></thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{c.campaignName}</td>
                      <td className="p-3">
                        <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-700">
                          {getTypeName(c.type)} {/* Shows friendly name in table too */}
                        </span>
                      </td>
                      <td className="p-3 flex gap-3">
                        <button onClick={() => startEditCampaign(c)} className="text-blue-600 font-bold hover:underline">Edit</button>
                        <button onClick={() => handleViewReport(c)} className="text-purple-600 font-bold hover:underline">Report</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* === TAB 2: USERS === */}
        {activeTab === 'USERS' && (
          <div className="bg-white p-6 rounded shadow animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{editingUser ? 'Edit User' : 'Add New User'}</h2>
            
            {/* User Form */}
            <form onSubmit={handleUserSubmit} className="space-y-3 mb-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Name" className="border p-2 rounded" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} required />
                  <input type="email" placeholder="Email" className="border p-2 rounded" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} required />
                  <input type="password" placeholder="Password" className="border p-2 rounded" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
                  <input type="text" placeholder="Phone" className="border p-2 rounded" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
               </div>
               <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">{editingUser ? 'Update User' : 'Create User'}</button>
               {editingUser && <button type="button" onClick={() => {setEditingUser(null); setUserData({ name: '', email: '', password: '', city: '', phone: '' })}} className="w-full mt-2 text-gray-500 underline">Cancel Edit</button>}
            </form>

            <div className="border-t pt-4 mb-6">
                <h4 className="font-bold text-sm mb-2">Or Bulk Upload CSV</h4>
                <div className="flex gap-2">
                    <input type="file" className="text-xs w-full" onChange={e => setFile(e.target.files[0])} />
                    <button onClick={handleUpload} className="bg-green-600 text-white px-4 py-1 text-xs rounded hover:bg-green-700">Upload</button>
                </div>
            </div>

            {/* User List */}
            <h3 className="font-bold text-gray-700 mb-3">Customer Database</h3>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Edit</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.userId} className="border-b hover:bg-gray-50">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2"><button onClick={() => startEditUser(u)} className="text-blue-600 font-bold hover:underline">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Report Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-purple-700 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Report: {selectedCampaign.campaignName}</h3>
              <button onClick={() => setSelectedCampaign(null)} className="text-2xl font-bold">&times;</button>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto">
              {loadingReport ? <p className="text-center">Loading...</p> : (
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100"><tr><th className="p-2 border">Name</th><th className="p-2 border">Email</th><th className="p-2 border">Status</th></tr></thead>
                  <tbody>{recipients.map((r, i) => (<tr key={i}><td className="p-2 border">{r.name}</td><td className="p-2 border">{r.email}</td><td className="p-2 border text-green-600 font-bold">{r.status}</td></tr>))}</tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t flex justify-end"><button onClick={downloadCSV} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">📥 Download CSV</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;