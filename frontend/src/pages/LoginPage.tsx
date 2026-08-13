// Componente Login - Sistema de Control de Vehículos

import { useState } from 'react';
import { Shield, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useVehicleStore } from '../store';
import { authApi } from '../services/authApi';
import { useTheme } from '../contexts/ThemeContext';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { setAuth } = useVehicleStore();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Ingrese usuario y contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login(username, password);

      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuth(
          {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role as 'guard' | 'support' | 'admin',
            isActive: true,
          },
          token
        );
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-100 via-white to-slate-100'
    }`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className={`backdrop-blur-xl rounded-2xl border overflow-hidden shadow-2xl ${
          theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">SICISV</h1>
            <p className="text-blue-200 text-sm">Sistema de Control de Ingresos y Salidas de Vehículos</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                autoComplete="username"
              />
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                    theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>

            {import.meta.env.DEV && (
              <div className={`mt-6 p-4 rounded-xl ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'
              }`}>
                <p className={`text-xs text-center mb-2 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>Credenciales de desarrollo:</p>
                <div className={`space-y-1 text-sm text-center ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <div>Vigilante: <code className="text-blue-500">vigilante</code> / <code className="text-blue-500">guard123</code></div>
                  <div>Soporte: <code className="text-blue-500">soporte</code> / <code className="text-blue-500">support123</code></div>
                  <div>Admin: <code className="text-blue-500">admin</code> / <code className="text-blue-500">admin123</code></div>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className={`text-center text-sm mt-6 ${
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          © 2024 SICISV - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
