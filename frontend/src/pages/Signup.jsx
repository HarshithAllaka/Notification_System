import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, Sparkles, Loader2, Heart } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', city: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      return toast.error("Phone number must be exactly 10 digits");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success("Welcome to Nykaa! Redirecting...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error("Signup Failed. Email usually taken.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-brand-dark overflow-hidden font-sans">
      <ToastContainer position="top-center" theme="dark" hideProgressBar={true} />

      {/* LEFT: BRANDING SIDE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-nykaa-600 to-brand-purple items-center justify-center text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">Nykaa.</h1>
          </div>

          <h2 className="text-3xl font-bold mb-6 leading-tight animate-slide-up">Join the <span className="text-brand-light">Community</span> and Experience Beauty.</h2>
          <p className="text-nykaa-100 text-lg mb-10 leading-relaxed max-w-md animate-slide-up animation-delay-100">
            Create an account to access exclusive offers, latest trends, and manage your orders seamlessly.
          </p>

          <div className="grid grid-cols-2 gap-4 animate-slide-up animation-delay-200">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold text-xl mb-1">10M+</h3>
              <p className="text-sm text-nykaa-200">Happy Customers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold text-xl mb-1">100%</h3>
              <p className="text-sm text-nykaa-200">Authentic Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: SIGNUP FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Background Orbs for Mobile */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-nykaa-500/20 rounded-full blur-[120px] pointer-events-none lg:hidden"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none lg:hidden"></div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">Join us today! It takes less than a minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Name */}
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nykaa-500 transition-colors w-5 h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-nykaa-500 focus:ring-1 focus:ring-nykaa-500 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nykaa-500 transition-colors w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-nykaa-500 focus:ring-1 focus:ring-nykaa-500 transition-all font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nykaa-500 transition-colors w-5 h-5" />
                <input
                  type="password"
                  placeholder="Create Password"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-nykaa-500 focus:ring-1 focus:ring-nykaa-500 transition-all font-medium"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nykaa-500 transition-colors w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Phone (10 digits)"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-nykaa-500 focus:ring-1 focus:ring-nykaa-500 transition-all font-medium"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    required
                  />
                </div>
                {/* City */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-nykaa-500 transition-colors w-5 h-5" />
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-nykaa-500 focus:ring-1 focus:ring-nykaa-500 transition-all font-medium"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-nykaa-500 to-nykaa-600 hover:from-nykaa-400 hover:to-nykaa-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-nykaa-500/30 flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Get Started <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-nykaa-400 font-bold hover:text-nykaa-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;