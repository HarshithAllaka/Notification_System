import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('USERS'); // Tabs: USERS, STAFF, CAMPAIGNS

  // Data States
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  
  // Form States
  const [userData, setUserData] = useState({ name: '', email: '', password: '', city: '', phone: '' });
  const [staffData, setStaffData] = useState({ name: '', email: '', password: '', role: 'CREATOR' });
  const [editingUser, setEditingUser] = useState(null); // ID of user being edited
  const [file, setFile] = useState(null);

  // Load Data
  useEffect(() => {
    fetchAllData();
  }, []);

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
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- TAB 1: USER LOGIC ---
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
      fetchAllData();
    } catch (err) { toast.error("Operation failed."); }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User Deleted");
      fetchAllData();
    } catch(err) { toast.error("Delete failed"); }
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
      fetchAllData();
    } catch(err) { toast.error("Upload failed"); }
  };

  // --- TAB 2: STAFF LOGIC ---
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-staff', staffData);
      toast.success("Staff Added!");
      setStaffData({ name: '', email: '', password: '', role: 'CREATOR' });
      fetchAllData();
    } catch (err) { toast.error("Failed to add staff."); }
  };

  const handleDeleteStaff = async (id) => {
    if(!window.confirm("Delete this staff member?")) return;
    try {
      await api.delete(`/admin/${id}`);
      toast.success("Staff Deleted");
      fetchAllData();
    } catch(err) { toast.error("Delete failed"); }
  };

  // --- TAB 3: CAMPAIGN LOGIC ---
  const handleDeleteCampaign = async (id) => {
    if(!window.confirm("Delete campaign? This deletes all reports too.")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success("Campaign Deleted");
      fetchAllData();
    } catch(err) { toast.error("Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10">
      <ToastContainer position="top-right" autoClose={2000} />
      
      <header className="bg-pink-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Control Panel</h1>
        <div className="flex gap-4">
            <button onClick={() => navigate('/creator-dashboard')} className="bg-white text-pink-600 px-4 py-2 rounded font-bold hover:bg-gray-100">🚀 Launch Campaign</button>
            <button onClick={handleLogout} className="bg-pink-800 text-white px-4 py-2 rounded font-bold hover:bg-pink-700">Logout</button>
        </div>
      </header>

      {/* TABS */}
      <div className="max-w-6xl mx-auto mt-6 flex gap-4 border-b-2 border-gray-300 pb-2 px-4 overflow-x-auto">
        {['USERS', 'STAFF', 'CAMPAIGNS'].map(tab => (
            <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-bold rounded transition ${activeTab === tab ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
                Manage {tab}
            </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-6 p-4">
        
        {/* === TAB 1: USERS === */}
        {activeTab === 'USERS' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow h-fit animate-fade-in-up">
                    <h3 className="font-bold text-lg mb-4 text-pink-600">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                    <form onSubmit={handleUserSubmit} className="space-y-3">
                        <input type="text" placeholder="Name" className="w-full border p-2 rounded" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} required />
                        <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} required />
                        <input type="password" placeholder="Password" className="w-full border p-2 rounded" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} />
                        <input type="text" placeholder="Phone" className="w-full border p-2 rounded" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
                        <input type="text" placeholder="City" className="w-full border p-2 rounded" value={userData.city} onChange={e => setUserData({...userData, city: e.target.value})} />
                        <button className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">{editingUser ? 'Update User' : 'Create User'}</button>
                        {editingUser && <button type="button" onClick={() => {setEditingUser(null); setUserData({ name: '', email: '', password: '', city: '', phone: '' })}} className="w-full mt-2 text-gray-500 underline">Cancel Edit</button>}
                    </form>
                    
                    <div className="mt-8 pt-4 border-t">
                        <h4 className="font-bold text-sm mb-2">Or Bulk Upload CSV</h4>
                        <div className="flex gap-2">
                            <input type="file" className="text-xs w-full" onChange={e => setFile(e.target.files[0])} />
                            <button onClick={handleUpload} className="bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700">Upload</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow md:col-span-2 overflow-y-auto max-h-[80vh] animate-fade-in-up delay-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">All Customers ({users.length})</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Actions</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.userId} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{u.name}</td>
                                    <td className="p-2">{u.email}</td>
                                    <td className="p-2 flex gap-3">
                                        <button onClick={() => startEditUser(u)} className="text-blue-600 font-bold hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteUser(u.userId)} className="text-red-600 font-bold hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* === TAB 2: STAFF === */}
        {activeTab === 'STAFF' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow h-fit animate-fade-in-up">
                    <h3 className="font-bold text-lg mb-4 text-pink-600">Add Staff Member</h3>
                    <form onSubmit={handleCreateStaff} className="space-y-3">
                        <input type="text" placeholder="Name" className="w-full border p-2 rounded" value={staffData.name} onChange={e => setStaffData({...staffData, name: e.target.value})} required />
                        <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={staffData.email} onChange={e => setStaffData({...staffData, email: e.target.value})} required />
                        <input type="password" placeholder="Password" className="w-full border p-2 rounded" value={staffData.password} onChange={e => setStaffData({...staffData, password: e.target.value})} required />
                        <select className="w-full border p-2 rounded bg-white" value={staffData.role} onChange={e => setStaffData({...staffData, role: e.target.value})}>
                            <option value="CREATOR">Creator</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                        <button className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">Add Staff</button>
                    </form>
                </div>
                <div className="bg-white p-6 rounded shadow md:col-span-2 animate-fade-in-up delay-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Staff Directory</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Action</th></tr></thead>
                        <tbody>
                            {staff.map(s => (
                                <tr key={s.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.email}</td>
                                    <td className="p-2"><span className="bg-gray-200 px-2 rounded text-xs font-bold text-gray-600">{s.role}</span></td>
                                    <td className="p-2"><button onClick={() => handleDeleteStaff(s.id)} className="text-red-600 font-bold hover:underline">Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* === TAB 3: CAMPAIGNS === */}
        {activeTab === 'CAMPAIGNS' && (
            <div className="bg-white p-6 rounded shadow animate-fade-in-up">
                <h3 className="font-bold text-lg mb-4 text-gray-700">System Campaign History</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th className="p-2">Type</th><th className="p-2">Date</th><th className="p-2">Action</th></tr></thead>
                    <tbody>
                        {campaigns.map(c => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-medium">{c.campaignName}</td>
                                <td className="p-2"><span className="bg-gray-200 px-2 rounded text-xs font-bold">{c.type}</span></td>
                                <td className="p-2 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="p-2">
                                    <button onClick={() => handleDeleteCampaign(c.id)} className="text-red-600 font-bold hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;