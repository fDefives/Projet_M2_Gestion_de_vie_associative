import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AssociationDashboard } from './components/AssociationDashboard';

export type UserRole = 'admin' | 'association' | null;

export interface User {
  id: string;
  email: string;
  role: UserRole;
  associationId?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock login - en production, cela serait géré par Supabase
    if (email === 'admin@univ-larochelle.fr') {
      setCurrentUser({
        id: '1',
        email,
        role: 'admin',
      });
    } else if (email.includes('asso')) {
      // Simuler une connexion d'association
      const associationId = email.split('@')[0];
      setCurrentUser({
        id: associationId,
        email,
        role: 'association',
        associationId,
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === 'association') {
    return (
      <AssociationDashboard
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
