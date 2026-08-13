// Página de Dashboard - Sistema de Control de Vehículos

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Car, LogIn, LogOut, AlertTriangle,
  Clock, Users, Calendar, RefreshCw
} from 'lucide-react';
import { VehicleStatusBadge } from '../components/StatusBadge';
import { dashboardApi } from '../services/dashboardApi';
import { useTheme } from '../contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Car;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'blue' | 'green' | 'amber' | 'red';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: StatCardProps) {
  const { theme } = useTheme();
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-500 dark:text-blue-400',
    green: 'bg-green-500/20 text-green-500 dark:text-green-400',
    amber: 'bg-amber-500/20 text-amber-500 dark:text-amber-400',
    red: 'bg-red-500/20 text-red-500 dark:text-red-400',
  };

  return (
    <div className={`rounded-xl p-6 border transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-slate-800 border-slate-700/50 hover:border-slate-600'
        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-500 dark:text-green-400' : trend === 'down' ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-foreground mb-1 font-mono">{value}</p>
      <p className="text-muted-foreground text-sm">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
    </div>
  );
}

export function DashboardPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statsData, setStatsData] = useState({
    totalEntries: 0, totalExits: 0, totalIncidents: 0,
    unresolvedIncidents: 0, entriesToday: 0, exitsToday: 0, pendingExits: 0
  });

  const [recentData, setRecentData] = useState<{
    recentEntries: any[]; recentExits: any[]; recentIncidents: any[];
  }>({ recentEntries: [], recentExits: [], recentIncidents: [] });

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [statsRes, recentRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecent(30)
      ]);
      if (statsRes.success && statsRes.data) setStatsData(statsRes.data);
      if (recentRes.success && recentRes.data) setRecentData(recentRes.data);
    } catch {
      setError('Error de comunicación con el servidor API');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const hourlyData = useMemo(() => {
    const hours = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i, 0, 0, 0);
      const nextHour = new Date(hour);
      nextHour.setHours(nextHour.getHours() + 1);
      const count = recentData.recentEntries.filter(e => {
        const entryTime = new Date(e.entryTimestamp);
        return entryTime >= hour && entryTime < nextHour;
      }).length;
      hours.push({ hour: hour.getHours(), label: `${hour.getHours()}:00`, count });
    }
    return hours;
  }, [recentData.recentEntries]);

  const maxHourlyCount = useMemo(() => Math.max(...hourlyData.map(h => h.count), 1), [hourlyData]);
  const displayRecentEntries = useMemo(() => recentData.recentEntries.slice(0, 5), [recentData.recentEntries]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Cargando panel de control y estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Dashboard
            {refreshing && <RefreshCw className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-spin" />}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Resumen del sistema - {new Date().toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          disabled={refreshing}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar ahora
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Ingresos Hoy" value={statsData.entriesToday} icon={LogIn}
          trend={statsData.entriesToday > 0 ? "up" : undefined}
          trendValue={statsData.entriesToday > 0 ? `+${statsData.entriesToday}` : undefined} color="blue" />
        <StatCard title="Salidas Hoy" value={statsData.exitsToday} icon={LogOut}
          trend={statsData.exitsToday > 0 ? "up" : undefined}
          trendValue={statsData.exitsToday > 0 ? `+${statsData.exitsToday}` : undefined} color="green" />
        <StatCard title="En Planta (Pendientes)" value={statsData.pendingExits} icon={Car}
          subtitle="Vehículos sin registro de salida" color="amber" />
        <StatCard title="Incidentes Activos" value={statsData.unresolvedIncidents} icon={AlertTriangle}
          subtitle={`Total histórico: ${statsData.totalIncidents}`}
          trend={statsData.unresolvedIncidents > 0 ? "down" : "neutral"} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Ingresos por Hora (Recientes)
          </h2>
          <div className="h-48 flex items-end gap-2 pt-6">
            {hourlyData.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-full rounded-t-lg relative ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'}`} style={{ height: '120px' }}>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(h.count / maxHourlyCount) * 100}%` }} />
                  {h.count > 0 && (
                    <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold px-1.5 py-0.5 rounded border ${
                      theme === 'dark'
                        ? 'text-white bg-slate-900 border-slate-700'
                        : 'text-slate-700 bg-white border-slate-200'
                    }`}>
                      {h.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 font-mono">{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            Estado de Vehículos de Hoy
          </h2>
          <div className="space-y-5 py-2">
            {[
              { label: 'En Planta (Sin Salida)', value: statsData.pendingExits, color: 'bg-amber-500', total: statsData.entriesToday || statsData.pendingExits || 1 },
              { label: 'Salidos Hoy', value: statsData.exitsToday, color: 'bg-green-500', total: statsData.entriesToday || statsData.exitsToday || 1 },
              { label: 'Total Registrados Hoy', value: statsData.entriesToday, color: 'bg-blue-500', total: statsData.entriesToday || 1 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-medium font-mono">{item.value}</span>
                </div>
                <div className={`h-2.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.value / item.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`rounded-xl p-6 border ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-500 dark:text-green-400" />
          Últimos Registros de Ingreso
        </h2>

        {displayRecentEntries.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border border-dashed ${
            theme === 'dark' ? 'text-muted-foreground bg-slate-900/30 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-200'
          }`}>
            <Car className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
            <p className="text-sm">No hay registros de ingreso en el sistema hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayRecentEntries.map(entry => (
              <div key={entry.id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-700/30 hover:bg-slate-700/60 border-slate-700/40'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}>
                <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ${
                  theme === 'dark' ? 'bg-slate-600 border border-slate-600/50' : 'bg-slate-200 border border-slate-300'
                }`}>
                  {entry.vehiclePhoto ? (
                    <img src={entry.vehiclePhoto} alt={entry.licensePlate} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Car className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground tracking-wider text-base">{entry.licensePlate}</span>
                    <VehicleStatusBadge hasExit={entry.hasExit} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                      {new Date(entry.entryTimestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {entry.guard && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
                        Vigilante: {entry.guard.fullName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono text-muted-foreground/70">
                    Hace {Math.max(0, Math.round((Date.now() - new Date(entry.entryTimestamp).getTime()) / 60000))} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
