import React, { useState } from 'react';
import { LogIn, Building2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (username: string, pwd: string) => {
    setEmail(username);
    setPassword(pwd);
    setError('');
    setLoading(true);
    try {
      await onLogin(username, pwd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Plateforme Vie Associative</h1>
          <p className="text-gray-600">La Rochelle Université</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Nom d'utilisateur ou Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin ou user1"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Test Users */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-900">💡</span>
            </div>
            <div>
              <p className="text-blue-900 mb-1">Comptes de test disponibles</p>
              <p className="text-blue-800 text-sm">
                Cliquez sur un compte pour vous connecter
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => quickLogin('admin', 'admin123')}
              disabled={loading}
              className="w-full bg-white hover:bg-blue-50 disabled:opacity-50 border border-blue-300 text-blue-900 py-2 px-4 rounded-lg transition-colors text-left text-sm"
            >
              <span className="font-medium">👨‍💼 Admin</span>
              <span className="text-blue-700 block text-xs">admin / admin123</span>
            </button>

            <button
              onClick={() => quickLogin('user1', 'pass123')}
              disabled={loading}
              className="w-full bg-white hover:bg-blue-50 disabled:opacity-50 border border-blue-300 text-blue-900 py-2 px-4 rounded-lg transition-colors text-left text-sm"
            >
              <span className="font-medium">🎓 User 1</span>
              <span className="text-blue-700 block text-xs">user1 / pass123</span>
            </button>

            <button
              onClick={() => quickLogin('user2', 'pass123')}
              disabled={loading}
              className="w-full bg-white hover:bg-blue-50 disabled:opacity-50 border border-blue-300 text-blue-900 py-2 px-4 rounded-lg transition-colors text-left text-sm"
            >
              <span className="font-medium">🎓 User 2</span>
              <span className="text-blue-700 block text-xs">user2 / pass123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
