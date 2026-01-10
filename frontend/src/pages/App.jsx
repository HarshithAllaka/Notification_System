import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Simple placeholder dashboard for now
const Dashboard = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-gray-800">Welcome to Nykaa Dashboard</h1>
    <p className="mt-4 text-gray-600">You have successfully logged in!</p>
    <button 
      onClick={() => {
        localStorage.clear();
        window.location.href = '/login';
      }}
      className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;