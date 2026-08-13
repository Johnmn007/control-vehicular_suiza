// Página de Inicio Rápido para Vigilantes - Portada de Control Vehicular

import { LogIn, LogOut, ArrowRight, User, Shield, Camera, Car, Search, CheckCircle } from 'lucide-react';
import type { TabId } from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

interface GuardHomePageProps {
  onNavigate: (tab: TabId) => void;
  user: any;
}

export function GuardHomePage({ onNavigate, user }: GuardHomePageProps) {
  const { theme } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className={`relative overflow-hidden border rounded-3xl p-6 md:p-8 mb-8 shadow-xl ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/40 border-slate-800'
          : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border-slate-200'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center border border-blue-400/20 shadow-lg shadow-blue-500/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-blue-500 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">{getGreeting()}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mt-0.5">
                {user?.fullName || 'Vigilante de Turno'}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                SICISV Garita Principal • Modo Control de Tráfico Activo
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 self-start md:self-auto ${
            theme === 'dark'
              ? 'bg-slate-900/60 border-slate-800'
              : 'bg-white/60 border-slate-200'
          }`}>
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full absolute" />
            <span className="text-xs text-foreground font-semibold uppercase tracking-wider pl-1">Turno Activo</span>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="text-center md:text-left mb-6">
        <h3 className="text-lg font-bold text-foreground">¿Qué acción desea realizar ahora?</h3>
        <p className="text-muted-foreground text-sm mt-1">Seleccione una opción para registrar una unidad de transporte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('entry')}
          className={`group relative text-left border rounded-3xl p-6 md:p-8 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/5 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-slate-900/80 to-slate-900/40 hover:from-blue-950/20 hover:to-slate-900/40 border-slate-800 hover:border-blue-500/40'
              : 'bg-gradient-to-b from-white to-slate-50 hover:from-blue-50 hover:to-slate-50 border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600/10 group-hover:border-blue-500/40 transition-colors">
              <LogIn className="w-7 h-7 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors" />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-500 group-hover:bg-blue-500/20 group-hover:text-blue-400'
                : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'
            }`}>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <h4 className="text-xl font-extrabold text-foreground group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            Registrar Ingreso Vehicular
          </h4>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Inicie el protocolo de entrada. Captura de seguridad del conductor, foto panorámica del vehículo, lectura de placa alfanumérica y confirmación de ingreso.
          </p>

          <div className={`mt-8 pt-6 border-t flex items-center justify-between text-xs text-muted-foreground ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500/70" />
              <span>1. Conductor</span>
            </div>
            <div className={`w-4 h-0.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-500/70" />
              <span>2. Vehículo</span>
            </div>
            <div className={`w-4 h-0.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-500/70" />
              <span>3. Placa</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('exit')}
          className={`group relative text-left border rounded-3xl p-6 md:p-8 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/5 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-slate-900/80 to-slate-900/40 hover:from-amber-950/20 hover:to-slate-900/40 border-slate-800 hover:border-amber-500/40'
              : 'bg-gradient-to-b from-white to-slate-50 hover:from-amber-50 hover:to-slate-50 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center group-hover:bg-amber-600/10 group-hover:border-amber-500/40 transition-colors">
              <LogOut className="w-7 h-7 text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors" />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-500 group-hover:bg-amber-500/20 group-hover:text-amber-400'
                : 'bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-500'
            }`}>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <h4 className="text-xl font-extrabold text-foreground group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
            Registrar Salida Vehicular
          </h4>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Inicie el protocolo de salida. Búsqueda rápida por placa en planta, verificación facial comparativa del conductor actual contra la foto de ingreso y autorización.
          </p>

          <div className={`mt-8 pt-6 border-t flex items-center justify-between text-xs text-muted-foreground ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-500/70" />
              <span>1. Buscar Placa</span>
            </div>
            <div className={`w-4 h-0.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500/70" />
              <span>2. Verificar Rostro</span>
            </div>
            <div className={`w-4 h-0.5 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-amber-500/70" />
              <span>3. Confirmar</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
