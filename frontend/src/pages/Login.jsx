import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));

      // Add a small delay for the animation to finish if it was instant
      setTimeout(() => {
        if (data.role === 'ADMIN') navigate('/dashboard');
        else if (data.role === 'CREATOR') navigate('/creator-dashboard');
        else if (data.role === 'VIEWER') navigate('/viewer-dashboard');
        else navigate('/user-home');
      }, 500);

    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-brand-dark">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-nykaa-600 blur-[120px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple blur-[120px] opacity-20 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-5xl h-[85vh] m-4 flex rounded-3xl overflow-hidden glass shadow-2xl animate-fade-in border border-white/10">

        {/* Left Side - Visual */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center p-12 relative overflow-hidden bg-gradient-to-br from-nykaa-600/90 to-brand-purple/90 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571781348782-f2c4263cd066?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
          <div className="relative z-10">
            <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Experience <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-white">Notifications</span> <br />
              Reimagined.
            </h1>
            <p className="text-lg text-pink-50 max-w-md leading-relaxed font-light">
              Connect with your audience through our premium notification orchestration platform. Targeted, timely, and beautiful.
            </p>
          </div>

          {/* Decorative circles */}
          <div className="absolute bottom-10 left-10 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-white opacity-80"></div>
            <div className="w-3 h-3 rounded-full bg-white opacity-40"></div>
            <div className="w-3 h-3 rounded-full bg-white opacity-20"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-white/80 backdrop-blur-xl flex flex-col justify-center p-8 lg:p-16">
          <div className="max-w-md w-full mx-auto">
            <div className="text-left mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 rounded-md text-sm mb-6 flex items-center gap-3 animate-fade-in">
                <div className="bg-red-100 p-1 rounded-full"><span className="block w-2 h-2 bg-red-600 rounded-full"></span></div>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-nykaa-500 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-nykaa-100 focus:border-nykaa-500 transition-all duration-300 outline-none shadow-sm group-hover:bg-gray-50/50"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-nykaa-500 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-nykaa-100 focus:border-nykaa-500 transition-all duration-300 outline-none shadow-sm group-hover:bg-gray-50/50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-nykaa-600 to-brand-purple text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-nykaa-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In Account'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-nykaa-600 hover:text-nykaa-800 transition-colors">
                  Create a new account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;