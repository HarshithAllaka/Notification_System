import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'campaigns'
  
  // User Upload State
  const [file, setFile] = useState(null);
  
  // Campaign State
  const [campaign, setCampaign] = useState({
    campaignName: '',
    notificationType: 'offers', // Default
    cityFilter: ''
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- 1. User Upload Logic ---
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a CSV file first");
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/users/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data);
      setFile(null);
    } catch (err) {
      toast.error("Upload failed! Check console.");
      console.error(err);
    }
  };

  // --- 2. Campaign Logic ---
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the Campaign Draft
      const res = await api.post('/campaigns/create', campaign);
      const campaignId = res.data.id;
      toast.info(`Campaign Draft "${res.data.campaignName}" Created! Sending now...`);

      // 2. Trigger the Send (Mocked)
      await api.post(`/campaigns/${campaignId}/send`);
      toast.success("Campaign Sent Successfully!");
      
      // Reset form
      setCampaign({ campaignName: '', notificationType: 'offers', cityFilter: '' });
    } catch (err) {
      toast.error("Campaign Creation Failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Navbar */}
      <nav className="bg-pink-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Nykaa Notification Service</h1>
        <button onClick={handleLogout} className="bg-pink-800 px-4 py-2 rounded hover:bg-pink-900">
          Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 p-6">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-6">
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'users' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
          >
            Upload Users
          </button>
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'campaigns' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Create Campaign
          </button>
        </div>

        {/* SECTION 1: USER UPLOAD */}
        {activeTab === 'users' && (
          <div className="bg-white p-8 rounded shadow-md animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bulk User Upload</h2>
            <p className="text-gray-600 mb-6">Upload a CSV file with columns: <code>user_id, name, email, phone, city, is_active</code></p>
            
            <div className="flex gap-4">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
              <button 
                onClick={handleUpload}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
              >
                Upload
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: CAMPAIGN MANAGER */}
        {activeTab === 'campaigns' && (
          <div className="bg-white p-8 rounded shadow-md animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Campaign Name</label>
                <input 
                  type="text" 
                  value={campaign.campaignName}
                  onChange={(e) => setCampaign({...campaign, campaignName: e.target.value})}
                  placeholder="e.g. Diwali Sale Blast"
                  className="w-full border p-2 rounded focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Notification Type</label>
                  <select 
                    value={campaign.notificationType}
                    onChange={(e) => setCampaign({...campaign, notificationType: e.target.value})}
                    className="w-full border p-2 rounded focus:ring-pink-500 focus:outline-none"
                  >
                    <option value="offers">Promotional Offers</option>
                    <option value="order_updates">Order Updates</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">Target City (Optional)</label>
                  <input 
                    type="text" 
                    value={campaign.cityFilter}
                    onChange={(e) => setCampaign({...campaign, cityFilter: e.target.value})}
                    placeholder="e.g. Delhi"
                    className="w-full border p-2 rounded focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-pink-600 text-white py-3 rounded font-bold hover:bg-pink-700 transition mt-4"
              >
                Create & Send Campaign
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;