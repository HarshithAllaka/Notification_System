import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', city: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      toast.success("Signup Successful! Please Login.");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error("Signup Failed. Email might be taken.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-pink-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-96 bg-white p-8 rounded shadow-md animate-fade-in-up">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Join Nykaa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Full Name" required
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" placeholder="Email" required
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <input 
            type="text" placeholder="Phone" required
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <input 
            type="text" placeholder="City (e.g. Delhi)" required
            className="w-full border p-2 rounded"
            onChange={(e) => setFormData({...formData, city: e.target.value})}
          />
          <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-pink-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;