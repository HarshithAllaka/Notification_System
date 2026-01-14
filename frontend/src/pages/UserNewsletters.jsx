import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, CheckCircle2, Plus, ArrowLeft, XCircle, Sparkles, Mail } from 'lucide-react';
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
        if (!window.confirm("Unsubscribe from this newsletter?")) return;

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
            <ToastContainer position="top-center" theme="colored" autoClose={2000} />

            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/user-home')}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-nykaa-600 to-brand-purple font-extrabold text-2xl flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-nykaa-500 fill-nykaa-500" /> Nykaa.
                    </span>
                    <span className="text-gray-400 text-sm font-medium border-l border-gray-300 pl-2 ml-2 group-hover:text-gray-600 transition">Newsletters</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/user-home')} className="text-gray-500 hover:text-nykaa-600 font-bold text-sm flex items-center gap-2 transition">
                        <ArrowLeft size={16} /> Back to Inbox
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 font-medium flex items-center gap-2 transition p-2 hover:bg-red-50 rounded-full"><LogOut className="w-5 h-5" /></button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto mt-12 p-6 animate-fade-in">
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Explore Newsletters</h1>
                    <p className="text-lg text-gray-500">Subscribe to content that matters to you. We'll deliver updates directly to your inbox based on your preferences.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading newsletters...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {newsletters.map(n => {
                            const isSubscribed = !!mySubs[n.id];

                            return (
                                <div key={n.id} className={`bg-white rounded-3xl p-8 border transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 ${isSubscribed ? 'border-green-200 shadow-md ring-1 ring-green-100' : 'border-gray-100 shadow-sm hover:shadow-xl'}`}>
                                    {isSubscribed && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">Active</div>}

                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isSubscribed ? 'bg-green-100 text-green-600' : 'bg-nykaa-50 text-nykaa-600'}`}>
                                                <Mail size={24} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{n.title}</h3>
                                            <p className="text-gray-500 leading-relaxed mb-6">{n.description || "Fresh content delivered to you directly."}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {isSubscribed ? (
                                            <button
                                                onClick={() => handleUnsubscribe(n.id)}
                                                onMouseEnter={() => setHoveredSub(n.id)}
                                                onMouseLeave={() => setHoveredSub(null)}
                                                className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${hoveredSub === n.id
                                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                                        : 'bg-green-50 text-green-700 border border-green-200'
                                                    }`}
                                            >
                                                {hoveredSub === n.id ? (
                                                    <><XCircle size={18} /> Unsubscribe</>
                                                ) : (
                                                    <><CheckCircle2 size={18} /> Subscribed</>
                                                )}
                                            </button>
                                        ) : (
                                            <button onClick={() => handleSubscribe(n.id)} className="w-full bg-gray-900 hover:bg-nykaa-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                                                <Plus size={18} /> Subscribe Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {newsletters.length === 0 && <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">No newsletters found.</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNewsletters;