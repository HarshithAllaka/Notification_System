import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LogOut, Bell, Mail, MessageSquare, Smartphone, CheckCircle2, Plus, User, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserNewsletters = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    
    // Data State
    const [newsletters, setNewsletters] = useState([]);
    const [mySubs, setMySubs] = useState([]); // Map of newsletterId -> Subscription Object
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) { navigate('/login'); return; }
            setUser(JSON.parse(storedUser));

            try {
                const [allRes, subRes] = await Promise.all([
                    api.get('/newsletters/all'),
                    api.get('/newsletters/my-subscriptions')
                ]);

                setNewsletters(allRes.data);
                
                // Convert Array of Subs to a Map for easy lookup: { newsletterId: subObject }
                const subMap = {};
                subRes.data.forEach(sub => {
                    subMap[sub.newsletter.id] = sub;
                });
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
        // Default Preferences: Email=True, SMS=False, Push=True
        const defaultPref = { receiveEmail: true, receiveSms: false, receivePush: true };
        
        try {
            await api.post(`/newsletters/${newsletterId}/subscribe`, defaultPref);
            toast.success("Subscribed!");
            
            // Refresh Subscriptions
            const res = await api.get('/newsletters/my-subscriptions');
            const subMap = {};
            res.data.forEach(sub => { subMap[sub.newsletter.id] = sub; });
            setMySubs(subMap);
            
        } catch (err) {
            toast.error(err.response?.data || "Failed to subscribe");
        }
    };

    const updateChannel = async (subId, channel, currentValue) => {
        const sub = Object.values(mySubs).find(s => s.id === subId);
        if(!sub) return;

        // Create update payload
        const updates = {
            receiveEmail: sub.receiveEmail,
            receiveSms: sub.receiveSms,
            receivePush: sub.receivePush,
            [channel]: !currentValue // Toggle the specific channel
        };

        // Optimistic UI Update (Update state immediately for speed)
        const updatedSub = { ...sub, ...updates };
        setMySubs(prev => ({ ...prev, [sub.newsletter.id]: updatedSub }));

        try {
            await api.put(`/newsletters/subscription/${subId}`, updates);
        } catch (err) {
            toast.error("Failed to update preference");
            // Revert on failure
            setMySubs(prev => ({ ...prev, [sub.newsletter.id]: sub }));
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <ToastContainer position="top-center" theme="colored" />
            
            {/* NAVBAR */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/user-home')}>
                    <span className="text-pink-600 font-extrabold text-2xl">Nykaa.</span>
                    <span className="text-gray-400 text-sm font-medium border-l border-gray-300 pl-2 ml-2">Newsletters</span>
                </div>
                
                <div className="flex items-center gap-4">
                     {/* Back to Home Button */}
                    <button onClick={() => navigate('/user-home')} className="text-gray-500 hover:text-pink-600 font-bold text-sm flex items-center gap-2 transition">
                         <ArrowLeft size={16}/> Back to Inbox
                    </button>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 transition">
                        <LogOut className="w-5 h-5"/>
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto mt-10 p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Explore Newsletters</h1>
                    <p className="text-gray-500 mt-2">Subscribe to curated content and get updates directly to your inbox.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading newsletters...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {newsletters.map(n => {
                            const subscription = mySubs[n.id];
                            const isSubscribed = !!subscription;

                            return (
                                <div key={n.id} className={`bg-white rounded-2xl p-6 border transition-all ${isSubscribed ? 'border-pink-200 shadow-sm ring-1 ring-pink-50' : 'border-gray-200 hover:shadow-md'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{n.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.description || "No description available."}</p>
                                        </div>
                                        {isSubscribed ? (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                <CheckCircle2 size={12}/> Subscribed
                                            </span>
                                        ) : (
                                            <button onClick={() => handleSubscribe(n.id)} className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition">
                                                <Plus size={16}/> Subscribe
                                            </button>
                                        )}
                                    </div>

                                    {/* Subscription Controls */}
                                    {isSubscribed && (
                                        <div className="mt-6 pt-4 border-t border-gray-50">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Receive via:</p>
                                            <div className="flex gap-4">
                                                
                                                {/* Email Toggle */}
                                                <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition ${subscription.receiveEmail ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                                    <Mail size={16} className={subscription.receiveEmail ? "text-yellow-600" : "text-gray-400"}/>
                                                    <span className={`text-sm font-bold ${subscription.receiveEmail ? "text-yellow-800" : "text-gray-500"}`}>Email</span>
                                                    <input type="checkbox" className="hidden" 
                                                        checked={subscription.receiveEmail} 
                                                        onChange={() => updateChannel(subscription.id, 'receiveEmail', subscription.receiveEmail)} 
                                                    />
                                                </label>

                                                {/* SMS Toggle */}
                                                <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition ${subscription.receiveSMS ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                                    <MessageSquare size={16} className={subscription.receiveSMS ? "text-blue-600" : "text-gray-400"}/>
                                                    <span className={`text-sm font-bold ${subscription.receiveSMS ? "text-blue-800" : "text-gray-500"}`}>SMS</span>
                                                    <input type="checkbox" className="hidden" 
                                                        checked={subscription.receiveSMS} 
                                                        onChange={() => updateChannel(subscription.id, 'receiveSMS', subscription.receiveSMS)} 
                                                    />
                                                </label>

                                                {/* Push Toggle */}
                                                <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition ${subscription.receivePush ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                                    <Smartphone size={16} className={subscription.receivePush ? "text-purple-600" : "text-gray-400"}/>
                                                    <span className={`text-sm font-bold ${subscription.receivePush ? "text-purple-800" : "text-gray-500"}`}>Push</span>
                                                    <input type="checkbox" className="hidden" 
                                                        checked={subscription.receivePush} 
                                                        onChange={() => updateChannel(subscription.id, 'receivePush', subscription.receivePush)} 
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {newsletters.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-400">No newsletters found. Admins need to create some!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNewsletters;