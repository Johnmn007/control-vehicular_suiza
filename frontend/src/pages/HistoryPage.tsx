// Página de Historial - Sistema de Control de Vehículos

import { useState, useEffect, useCallback } from 'react';
import { History, Search, Filter, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { entryApi } from '../services/entryApi';
import { VehicleStatusBadge } from '../components/StatusBadge';
import { ExportButton } from '../components/ExportButton';
import { RecordDetailModal } from '../components/RecordDetailModal';
import { useTheme } from '../contexts/ThemeContext';

interface EntryRecord {
  id: string;
  licensePlate: string;
  entryTimestamp: string;
  vehiclePhoto: string;
  driverPhoto: string;
  hasExit: boolean;
  guard?: { fullName: string };
  notes?: string;
}

export function HistoryPage() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchPlate, setSearchPlate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<any | null>(null);

  const LIMIT = 10;

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await entryApi.getAll({
        licensePlate: searchPlate || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: LIMIT,
      });
      if (response.success && response.data) {
        setEntries(response.data.entries as any);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando el historial');
    } finally {
      setIsLoading(false);
    }
  }, [searchPlate, startDate, endDate, page]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleSearch = () => { setPage(1); loadEntries(); };
  const clearFilters = () => { setSearchPlate(''); setStartDate(''); setEndDate(''); setPage(1); };

  const handleOpenDetail = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await entryApi.getById(id);
      if (response.success && response.data) {
        setDetailEntry(response.data);
        setDetailOpen(true);
      } else {
        setError('No se pudo encontrar el detalle de este registro');
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener detalles del registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <History className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            Historial de Registros
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {total} registros encontrados en total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : theme === 'dark'
                  ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <ExportButton
            type="entries"
            filters={{
              licensePlate: searchPlate || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined
            }}
          />
        </div>
      </div>

      {showFilters && (
        <div className={`border rounded-xl p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-200 ${
          theme === 'dark' ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>Placa</label>
              <input
                type="text"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className={`w-full px-3.5 py-2.5 border focus:border-blue-500 rounded-lg font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 border focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 border focus:border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-md transition-colors"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
              <button
                onClick={clearFilters}
                className={`px-3.5 py-2.5 rounded-lg transition-colors border ${
                  theme === 'dark'
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                }`}
                title="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground text-sm font-medium">Buscando en la base de datos...</p>
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className={`border rounded-xl overflow-hidden shadow-lg ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  theme === 'dark' ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'
                }`}>
                  <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Placa</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha / Hora</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Vigilante</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-right py-4 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Detalles</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-slate-700' : 'divide-slate-100'
              }`}>
                {entries.map((entry) => (
                  <tr key={entry.id} className={`transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
                  }`}>
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-blue-500 dark:text-blue-400 text-base tracking-wider">{entry.licensePlate}</span>
                    </td>
                    <td className={`py-3.5 px-5 text-sm font-mono ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {new Date(entry.entryTimestamp).toLocaleDateString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}{' '}
                      {new Date(entry.entryTimestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className={`py-3.5 px-5 text-sm font-semibold ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {(entry as any).guard?.fullName || 'N/A'}
                    </td>
                    <td className="py-3.5 px-5">
                      <VehicleStatusBadge hasExit={entry.hasExit} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenDetail(entry.id)}
                        className={`p-2 rounded-lg transition-colors border border-transparent ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700/80 hover:border-slate-600'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                        title="Ver reporte completo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={`flex items-center justify-between px-5 py-4 border-t ${
              theme === 'dark' ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className="text-xs font-medium text-muted-foreground">
                Página {page} de {totalPages} • Total: {total} registros
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors border ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors border ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className={`border rounded-xl p-16 text-center ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700/40' : 'bg-white border-slate-200'
        }`}>
          <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-foreground text-lg font-bold">No se encontraron registros</p>
          <p className="text-muted-foreground text-sm mt-1">Pruebe ajustando los filtros de búsqueda</p>
        </div>
      )}

      <RecordDetailModal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailEntry(null); }}
        entry={detailEntry}
      />
    </div>
  );
}
