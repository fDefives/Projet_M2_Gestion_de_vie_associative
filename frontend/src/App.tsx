import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AssociationDashboard } from './components/AssociationDashboard';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import * as API from './api';

export type UserRole = 'admin' | 'user' | null;

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const user = await API.getCurrentUser();
          setCurrentUser({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.is_staff ? 'admin' : 'user',
            first_name: user.first_name,
            last_name: user.last_name,
          });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      const { access, refresh, user } = await API.loginUser(username, password);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setCurrentUser({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.is_staff ? 'admin' : 'user',
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === 'user') {
    return (
      <AssociationDashboard
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

// Composant pour la route de reset password
function ResetPasswordRoute() {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();

  if (!uidb64 || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Lien invalide</div>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate('/');
  };

  return <ResetPasswordPage uidb64={uidb64} token={token} onSuccess={handleSuccess} />;
}

// App wrapper avec Router
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordRoute />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </Router>
  );
}
