import React, { useState } from 'react';
import { LogIn, Building2, AlertCircle } from 'lucide-react';
import { requestPasswordReset } from '../api';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    setResetLoading(true);
    try {
      await requestPasswordReset(resetEmail || email);
      setResetMessage('Si un compte existe, un email a été envoyé.');
    } finally {
      setResetLoading(false);
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
                Adresse Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
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

            <div className="text-center">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm"
                onClick={() => {
                  setShowForgotPassword((prev) => !prev);
                  setResetMessage('');
                  setResetEmail((prev) => prev || email);
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          {showForgotPassword && (
            <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-gray-700 mb-2">
                  Email pour la réinitialisation
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                  required
                  disabled={resetLoading}
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 py-3 rounded-lg transition-colors"
              >
                {resetLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </button>
              {resetMessage && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  {resetMessage}
                </p>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
