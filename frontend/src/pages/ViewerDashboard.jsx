import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
// REMOVED: import { CSVLink } from 'react-csv'; <--- This line caused the error

const ViewerDashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  
  // Modal State
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/campaigns/history');
      setCampaigns(data);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 1. Fetch Recipients
  const handleViewReport = async (campaign) => {
    setSelectedCampaign(campaign);
    setLoading(true);
    try {
      const { data } = await api.get(`/campaigns/${campaign.id}/recipients`);
      setRecipients(data);
    } catch (err) {
      alert("Failed to fetch report");
    }
    setLoading(false);
  };

  // 2. CSV Download Logic (Native Javascript - No Library Needed)
  const downloadCSV = () => {
    if (!recipients.length) return;
    
    const headers = "Name,Email,Status,Sent At\n";
    const rows = recipients.map(r => 
      `${r.name},${r.email},${r.status},${r.sentAt}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCampaign.campaignName}_Report.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <nav className="bg-blue-700 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">📊 Viewer Portal</h1>
        <button onClick={handleLogout} className="bg-white text-blue-700 px-4 py-2 rounded font-bold hover:bg-gray-200">
          Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto mt-10 p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Campaign History</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date Sent</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.length === 0 ? (
                 <tr><td colSpan="4" className="p-4 text-center text-gray-500">No campaigns found.</td></tr>
              ) : (
                campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{c.campaignName || "Untitled"}</td>
                    <td className="p-4"><span className="bg-gray-200 px-2 py-1 rounded text-xs">{c.type}</span></td>
                    <td className="p-4 text-gray-600">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "N/A"}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleViewReport(c)}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REPORT MODAL --- */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Report: {selectedCampaign.campaignName}</h3>
              <button onClick={() => setSelectedCampaign(null)} className="text-2xl font-bold">&times;</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-center text-gray-500">Loading data...</p>
              ) : recipients.length === 0 ? (
                <p className="text-center text-gray-500">No recipients found for this campaign.</p>
              ) : (
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2 border">{r.name}</td>
                        <td className="p-2 border">{r.email}</td>
                        <td className="p-2 border text-green-600 font-bold">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={downloadCSV}
                disabled={recipients.length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 disabled:opacity-50 transition"
              >
                📥 Download CSV
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ViewerDashboard;