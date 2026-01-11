import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UserHome from './pages/UserHome';
import CreatorDashboard from './pages/CreatorDashboard'; // <--- IMPORT
import ViewerDashboard from './pages/ViewerDashboard';   // <--- IMPORT

function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Roles Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/user-home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />
        
        {/* NEW ROUTES */}
        <Route path="/creator-dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
        <Route path="/viewer-dashboard" element={<ProtectedRoute><ViewerDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;