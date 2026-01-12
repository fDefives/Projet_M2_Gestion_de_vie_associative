import React, { useState } from 'react';
import { LogIn, Building2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo123');
    setTimeout(() => onLogin(userEmail, 'demo123'), 100);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="nom@univ-larochelle.fr"
                required
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
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </button>

            <button
              type="button"
              className="w-full text-blue-600 hover:text-blue-700 py-2 transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </form>
        </div>

        {/* Comptes de démonstration */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-900">💡</span>
            </div>
            <div>
              <p className="text-amber-900 mb-1">Démo - Comptes de test</p>
              <p className="text-amber-800 text-sm">
                Cliquez sur un compte pour vous connecter instantanément
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => quickLogin('admin@univ-larochelle.fr')}
              className="w-full bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 py-2 px-4 rounded-lg transition-colors text-left text-sm"
            >
              <span className="font-medium">👨‍💼 Administration</span>
              <span className="text-amber-700 block text-xs">admin@univ-larochelle.fr</span>
            </button>

            <button
              onClick={() => quickLogin('asso-bde@associations.fr')}
              className="w-full bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 py-2 px-4 rounded-lg transition-colors text-left text-sm"
            >
              <span className="font-medium">🎓 BDE La Rochelle</span>
              <span className="text-amber-700 block text-xs">asso-bde@associations.fr</span>
            </button>

            <button
              onClick={() => quickLogin('asso-sport@associations.fr')}
              className="w-full bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 py-2 px-4 rounded-lg transition-colors text-left text-sm"
            >
              <span className="font-medium">⚽ Sport & Co</span>
              <span className="text-amber-700 block text-xs">asso-sport@associations.fr</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
