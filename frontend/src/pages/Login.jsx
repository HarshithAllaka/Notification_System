import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await api.post('/auth/login', { email, password });
      
      // Save token and role
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      toast.success('Login Successful!');
      
      // Redirect to dashboard after 1 second
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error(error);
      toast.error('Invalid Credentials. Try admin@nykaa.com / admin123');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-pink-50">
      <ToastContainer />
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-pink-600">Nykaa Portal Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border rounded focus:ring-pink-500 focus:outline-none"
              placeholder="admin@nykaa.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border rounded focus:ring-pink-500 focus:outline-none"
              placeholder="admin123"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-pink-600 rounded hover:bg-pink-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;