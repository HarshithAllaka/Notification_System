import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, CheckCircle2, Plus, ArrowLeft, XCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserNewsletters = () => {
    const navigate = useNavigate();
    
    // Data State
    const [newsletters, setNewsletters] = useState([]);
    const [mySubs, setMySubs] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [hoveredSub, setHoveredSub] = useState(null); // To toggle button text on hover

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) { navigate('/login'); return; }

            try {
                const [allRes, subRes] = await Promise.all([
                    api.get('/newsletters/all'),
                    api.get('/newsletters/my-subscriptions')
                ]);

                setNewsletters(allRes.data || []);
                const subMap = {};
                (subRes.data || []).forEach(sub => { subMap[sub.newsletter.id] = sub; });
                setMySubs(subMap);

            } catch (err) {
                console.error("Failed to load newsletters", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    // --- ACTIONS ---

    const handleSubscribe = async (newsletterId) => {
        // Optimistic Update
        const tempSub = { id: 'temp', newsletter: { id: newsletterId } };
        setMySubs(prev => ({ ...prev, [newsletterId]: tempSub }));

        try {
            await api.post(`/newsletters/${newsletterId}/subscribe`, {}); 
            toast.success("Subscribed!");
            
            // Refresh
            const res = await api.get('/newsletters/my-subscriptions');
            const subMap = {};
            res.data.forEach(sub => { subMap[sub.newsletter.id] = sub; });
            setMySubs(subMap);
        } catch (err) {
            toast.error("Failed to subscribe");
            setMySubs(prev => { const n = { ...prev }; delete n[newsletterId]; return n; });
        }
    };

    const handleUnsubscribe = async (newsletterId) => {
        if(!window.confirm("Unsubscribe from this newsletter?")) return;

        // Optimistic Update
        const backup = { ...mySubs };
        setMySubs(prev => { const n = { ...prev }; delete n[newsletterId]; return n; });

        try {
            await api.delete(`/newsletters/${newsletterId}/unsubscribe`);
            toast.info("Unsubscribed.");
        } catch (err) {
            toast.error("Failed to unsubscribe");
            setMySubs(backup); // Revert
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <ToastContainer position="top-center" theme="colored" />
            
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/user-home')}>
                    <span className="text-pink-600 font-extrabold text-2xl">Nykaa.</span>
                    <span className="text-gray-400 text-sm font-medium border-l border-gray-300 pl-2 ml-2">Newsletters</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/user-home')} className="text-gray-500 hover:text-pink-600 font-bold text-sm flex items-center gap-2 transition">
                         <ArrowLeft size={16}/> Back to Inbox
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 transition"><LogOut className="w-5 h-5"/></button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto mt-10 p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Explore Newsletters</h1>
                    <p className="text-gray-500 mt-2">Subscribe to content. Manage notifications in your Inbox settings.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {newsletters.map(n => {
                            const isSubscribed = !!mySubs[n.id];

                            return (
                                <div key={n.id} className={`bg-white rounded-2xl p-6 border transition-all ${isSubscribed ? 'border-green-200 shadow-sm ring-1 ring-green-50' : 'border-gray-200 hover:shadow-md'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{n.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.description || "No description."}</p>
                                        </div>
                                        
                                        {isSubscribed ? (
                                            <button 
                                                onClick={() => handleUnsubscribe(n.id)}
                                                onMouseEnter={() => setHoveredSub(n.id)}
                                                onMouseLeave={() => setHoveredSub(null)}
                                                className={`text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                                                    hoveredSub === n.id 
                                                    ? 'bg-red-100 text-red-600' 
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                            >
                                                {hoveredSub === n.id ? (
                                                    <><XCircle size={14}/> Unsubscribe</>
                                                ) : (
                                                    <><CheckCircle2 size={14}/> Subscribed</>
                                                )}
                                            </button>
                                        ) : (
                                            <button onClick={() => handleSubscribe(n.id)} className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition">
                                                <Plus size={16}/> Subscribe
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {newsletters.length === 0 && <div className="col-span-full text-center py-20 text-gray-400">No newsletters found.</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNewsletters;