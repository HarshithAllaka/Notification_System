import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Save Token and Role to LocalStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); 
      
      toast.success("Login Successful");

      // Redirect based on Role
      // Redirect based on Role
      if (data.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (data.role === 'USER') {
        navigate('/user-home'); 
      } else if (data.role === 'CREATOR') {
        navigate('/creator-dashboard'); // <--- Now redirects to Purple Workspace
      } else if (data.role === 'VIEWER') {
        navigate('/viewer-dashboard'); // <--- Now redirects to Blue Portal
      } else {
        navigate('/dashboard'); // Fallback
      }
      
    } catch (err) {
      toast.error("Invalid Credentials. Try admin@nykaa.com / admin123");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-pink-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-96 bg-white p-8 rounded shadow-md animate-fade-in-up">
        <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">Nykaa Portal Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="admin@nykaa.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-pink-600 text-white font-bold py-3 rounded hover:bg-pink-700 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            New to Nykaa?{' '}
            <Link to="/signup" className="text-pink-600 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;