import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Car, Clock, AlertTriangle, CheckCircle, X, Camera, Scan, User, ArrowLeft } from 'lucide-react';
import { useVehicleStore } from '../store';
import { PlateInput } from '../components/PlateInput';
import { CameraCapture } from '../components/CameraCapture';
import { VehicleStatusBadge } from '../components/StatusBadge';
import { entryApi } from '../services/entryApi';
import { exitApi } from '../services/exitApi';
import { incidentApi } from '../services/incidentApi';
import { facialApi, type RecognizedProfile } from '../services/facialApi';
import type { Entry, CameraState } from '../types';

type ExitVerificationState =
  | 'idle'
  | 'recognizing'
  | 'recognized'
  | 'searching'
  | 'found'
  | 'analyzing'
  | 'driver_mismatch'
  | 'not_found'
  | 'not_recognized'
  | 'success';

interface ExitPageProps {
  onComplete?: () => void;
}

export function ExitPage({ onComplete }: ExitPageProps) {
  const { setExitSearchResult } = useVehicleStore();

  const [verificationState, setVerificationState] = useState<ExitVerificationState>('idle');
  const [foundEntry, setFoundEntry] = useState<Entry | null>(null);
  const [recognizedProfile, setRecognizedProfile] = useState<RecognizedProfile | null>(null);
  const [currentDriverPhoto, setCurrentDriverPhoto] = useState<string | null>(null);
  const [driverMatch, setDriverMatch] = useState<boolean | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>({ status: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Manual plate search fallback
  const [searchPlate, setSearchPlate] = useState('');

  const autoExitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle facial recognition capture
  const handleFacialCapture = useCallback(async (photo: string) => {
    setVerificationState('recognizing');
    setCurrentDriverPhoto(photo);

    try {
      const response = await facialApi.recognize(photo);

      if (response.success && response.recognized && response.profile) {
        setRecognizedProfile(response.profile);
        setVerificationState('recognized');

        // Auto-search pending entry for this plate
        searchPendingEntry(response.profile.licensePlate);
      } else {
        setVerificationState('not_recognized');
      }
    } catch (err: any) {
      setVerificationState('not_recognized');
    }
  }, []);

  // Search pending entry by plate
  const searchPendingEntry = useCallback(async (plate: string, isManualFallback: boolean = false) => {
    setVerificationState('searching');
    setIsLoading(true);
    setError(null);

    try {
      const response = await entryApi.getUnsettled(plate);

      if (response.success && response.data && response.data.length > 0) {
        const entry = response.data[0] as any;
        setFoundEntry({
          ...entry,
          guardName: entry.guard?.fullName || '',
          hasExit: false,
        });
        if (isManualFallback) {
          setVerificationState('driver_mismatch');
        } else {
          setVerificationState('found');
        }
      } else {
        setVerificationState('not_found');
        setError(`No se encontró entrada activa para la placa ${plate}`);
      }
    } catch (err: any) {
      setVerificationState('not_found');
      setError(err.message || 'Error buscando el vehículo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual plate search (fallback)
  const handleManualSearch = useCallback(async () => {
    if (!searchPlate || searchPlate.length < 4) {
      setError('Ingrese una placa válida (mínimo 4 caracteres)');
      return;
    }
    searchPendingEntry(searchPlate, true);
  }, [searchPlate, searchPendingEntry]);

  // Process exit
  const processExit = useCallback(async () => {
    if (!foundEntry || !currentDriverPhoto) return;

    setVerificationState('analyzing');

    try {
      const response = await exitApi.create({
        licensePlate: foundEntry.licensePlate,
        driverPhotoExit: currentDriverPhoto,
      });

      const rawMatch = response?.data?.driverMatch;
      setDriverMatch(rawMatch);

      setExitSearchResult({
        found: true,
        entry: { ...foundEntry, hasExit: true },
        currentDriverPhoto: currentDriverPhoto,
        driverMatch: rawMatch ?? false,
      });

      setVerificationState('success');

      autoExitRef.current = setTimeout(() => {
        resetForm();
        if (onComplete) onComplete();
      }, 4000);
    } catch (err: any) {
      setDriverMatch(null);
      setVerificationState('driver_mismatch');
      setError(err.message || 'Error en el procesamiento de la salida');
    }
  }, [foundEntry, currentDriverPhoto, setExitSearchResult]);

  useEffect(() => {
    return () => {
      if (autoExitRef.current) clearTimeout(autoExitRef.current);
    };
  }, []);

  const handleReportIncident = useCallback(async () => {
    if (!foundEntry) return;

    try {
      await incidentApi.create({
        entryId: foundEntry.id,
        incidentType: 'driver_mismatch',
        description: 'Conductor diferente al registrado en el ingreso',
      });
      alert('Incidente reportado exitosamente. El vehículo podrá salir con autorización del supervisor.');
    } catch (err: any) {
      alert('Error reportando el incidente: ' + (err.message || 'Error desconocido'));
    }
  }, [foundEntry]);

  const overrideExit = useCallback(async () => {
    if (!foundEntry || !currentDriverPhoto) return;
    setIsLoading(true);

    try {
      await exitApi.create({
        licensePlate: foundEntry.licensePlate,
        driverPhotoExit: currentDriverPhoto,
        isDriverMatch: false,
      });

      setExitSearchResult({
        found: true,
        entry: { ...foundEntry, hasExit: true },
        currentDriverPhoto: currentDriverPhoto,
        driverMatch: false,
      });

      setDriverMatch(false);
      setVerificationState('success');

      autoExitRef.current = setTimeout(() => {
        resetForm();
        if (onComplete) onComplete();
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Error registrando la salida');
    } finally {
      setIsLoading(false);
    }
  }, [foundEntry, currentDriverPhoto, setExitSearchResult]);

  const resetForm = useCallback(() => {
    setVerificationState('idle');
    setFoundEntry(null);
    setRecognizedProfile(null);
    setCurrentDriverPhoto(null);
    setDriverMatch(null);
    setError(null);
    setSearchPlate('');
    setCameraState({ status: 'idle' });
  }, []);

  const goToManualSearch = useCallback(() => {
    setVerificationState('idle');
    setError(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Scan className="w-8 h-8 text-cyan-400" />
          Registro de Salida
        </h1>
        <p className="text-slate-400 mt-1">
          Reconocimiento facial automático para verificación de conductor
        </p>
      </div>

      {/* ESTADO INICIAL: Cámara de reconocimiento facial */}
      {verificationState === 'idle' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Reconocer Conductor</h2>
              <p className="text-slate-400">
                La cámara se activará automáticamente. El conductor debe mirar directamente a la cámara.
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <CameraCapture
              mode="driver"
              onCapture={handleFacialCapture}
              state={cameraState}
              onStateChange={setCameraState}
              autoCapture
            />
          </div>

        </div>
      )}

      {/* RECONOCIENDO... */}
      {verificationState === 'recognizing' && (
        <div className="bg-slate-800 rounded-xl p-12 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Scan className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Reconociendo Conductor...</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
            <p className="text-cyan-400">Analizando rostro</p>
          </div>
          {currentDriverPhoto && (
            <div className="mt-6">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-700 mx-auto ring-2 ring-cyan-500/50">
                <img src={currentDriverPhoto} alt="Captura" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONDUCTOR RECONOCIDO - Buscando entrada */}
      {verificationState === 'searching' && (
        <div className="bg-slate-800 rounded-xl p-12 text-center animate-fade-in">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Conductor reconocido. Buscando entrada pendiente...</p>
          {recognizedProfile && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700">
                <img src={recognizedProfile.driverPhoto} alt="Conductor" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-medium">{recognizedProfile.fullName || 'Conductor registrado'}</span>
            </div>
          )}
        </div>
      )}

      {/* CONDUCTOR RECONOCIDO - Vehículo encontrado - CONFIRMAR SALIDA */}
      {verificationState === 'found' && foundEntry && recognizedProfile && (
        <div className="space-y-6 animate-fade-in">
          {/* Info del conductor reconocido */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 ring-2 ring-green-500/50">
                <img src={recognizedProfile.driverPhoto} alt="Conductor" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-green-400 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Conductor Reconocido
                </p>
                <p className="text-white text-lg font-medium">{recognizedProfile.fullName || 'Conductor registrado'}</p>
              </div>
            </div>
          </div>

          {/* Datos del vehículo - Visual verification */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Vehículo a Verificar</h2>
              <VehicleStatusBadge hasExit={false} />
            </div>

            {/* Fotos lado a lado */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Foto del Vehículo (Perfil)</p>
                <div className="aspect-square bg-slate-700 rounded-xl overflow-hidden ring-2 ring-blue-500/50">
                  <img
                    src={recognizedProfile.vehiclePhoto}
                    alt="Vehículo perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">Foto del Conductor (Ingreso)</p>
                <div className="aspect-square bg-slate-700 rounded-xl overflow-hidden ring-2 ring-cyan-500/50">
                  <img
                    src={foundEntry.driverPhoto}
                    alt="Conductor registrado"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Datos del entry */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-400">Placa</p>
                <p className="text-2xl font-mono font-bold text-blue-400">{foundEntry.licensePlate}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-400">Hora Ingreso</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(foundEntry.entryTimestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-400">Tiempo Est.</p>
                <p className="text-lg font-semibold text-white">
                  {Math.round((Date.now() - new Date(foundEntry.entryTimestamp).getTime()) / 60000)} min
                </p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-400">Vigilante</p>
                <p className="text-lg font-semibold text-white">{foundEntry.guardName || 'N/A'}</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={resetForm}
              className="flex-1 py-4 rounded-xl border-2 border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Cancelar
            </button>
            <button
              onClick={processExit}
              disabled={isLoading}
              className="flex-1 py-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {isLoading ? 'Procesando...' : 'Confirmar Salida'}
            </button>
          </div>
        </div>
      )}

      {/* ENTRADA NO ENCONTRADA */}
      {verificationState === 'not_found' && (
        <div className="bg-slate-800 rounded-xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Entrada No Encontrada</h2>
            <p className="text-slate-400">{error || 'No se encontró registro de ingreso activo'}</p>
          </div>
          <div className="flex gap-4 max-w-md mx-auto">
            <button
              onClick={resetForm}
              className="flex-1 py-3 rounded-xl border-2 border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
            >
              Nuevo Intento
            </button>
            <button
              onClick={goToManualSearch}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            >
              Buscar por Placa
            </button>
          </div>
        </div>
      )}

      {/* CONDUCTOR NO RECONOCIDO - Fallback a búsqueda manual */}
      {verificationState === 'not_recognized' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-800 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Conductor No Reconocido</h2>
              <p className="text-slate-400">
                El conductor no está registrado en el sistema. Puede buscar la placa manualmente.
              </p>
            </div>

            {currentDriverPhoto && (
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-700 ring-2 ring-amber-500/50">
                  <img src={currentDriverPhoto} alt="Captura" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white">Búsqueda Manual por Placa</h3>
            </div>
            <PlateInput
              value={searchPlate}
              onChange={setSearchPlate}
              onSubmit={handleManualSearch}
              disabled={isLoading}
              showSuggestions={false}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleManualSearch}
              disabled={!searchPlate || searchPlate.length < 4 || isLoading}
              className={`
                w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl
                font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${searchPlate.length >= 4
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-400'
                }
              `}
            >
              {isLoading ? (
                <><span className="animate-spin">⏳</span> Buscando...</>
              ) : (
                <><Search className="w-5 h-5" /> Buscar Vehículo</>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-300 text-sm flex items-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a intentar reconocimiento facial
            </button>
          </div>
        </div>
      )}

      {/* ANALIZANDO SALIDA */}
      {verificationState === 'analyzing' && (
        <div className="bg-slate-800 rounded-xl p-12 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Scan className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Procesando Salida...</h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
            <p className="text-cyan-400">Verificando conductor</p>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-700 mx-auto mb-2 ring-2 ring-cyan-500/50">
                <img src={foundEntry?.driverPhoto} alt="Registrado" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-slate-400">Registrado</p>
            </div>
            {currentDriverPhoto && (
              <div className="text-center">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-700 mx-auto mb-2 ring-2 ring-cyan-500/50">
                  <img src={currentDriverPhoto} alt="Actual" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-slate-400">Actual</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONDUCTOR NO VERIFICADO - MISMATCH */}
      {verificationState === 'driver_mismatch' && foundEntry && (
        <div className="bg-slate-800 rounded-xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">¡Conductor No Verificado!</h2>
            <p className="text-slate-400">
              El reconocimiento facial no pudo verificar al conductor
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Registrado</p>
              <div className="aspect-square bg-slate-700 rounded-xl overflow-hidden ring-2 ring-slate-600">
                <img src={foundEntry.driverPhoto} alt="Conductor registrado" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Actual</p>
              <div className="aspect-square bg-slate-700 rounded-xl overflow-hidden ring-2 ring-red-500/50">
                {currentDriverPhoto && (
                  <img src={currentDriverPhoto} alt="Conductor actual" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={resetForm} className="flex-1 py-4 rounded-xl border-2 border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors">
              Cancelar
            </button>
            <button onClick={handleReportIncident} className="flex-1 py-4 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-500 transition-colors">
              Reportar Incidente
            </button>
            <button onClick={overrideExit} disabled={isLoading} className="flex-1 py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors disabled:opacity-50">
              {isLoading ? 'Procesando...' : 'Confirmar de Todos Modos'}
            </button>
          </div>
        </div>
      )}

      {/* ÉXITO */}
      {verificationState === 'success' && (
        <div className="bg-slate-800 rounded-xl p-12 text-center animate-fade-in">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce ${
            driverMatch === false ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            {driverMatch === false ? (
              <AlertTriangle className="w-16 h-16 text-red-400" />
            ) : (
              <CheckCircle className="w-16 h-16 text-green-400" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">¡Salida Registrada!</h2>
          <div className={`inline-block rounded-xl px-4 py-2 mb-4 text-sm font-semibold ${
            driverMatch === null
              ? 'bg-yellow-500/20 text-yellow-400'
              : driverMatch
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {driverMatch === null
              ? 'Reconocimiento facial: No se pudo verificar el rostro'
              : driverMatch
                ? 'Reconocimiento facial: Conductor verificado exitosamente'
                : 'Reconocimiento facial: Conductor diferente al registrado'
            }
          </div>
          <p className="text-slate-400 mb-6">
            El vehículo {foundEntry?.licensePlate} ha salido exitosamente
          </p>
          <div className="inline-block bg-slate-700 rounded-xl px-6 py-3">
            <p className="text-sm text-slate-400">Hora de salida</p>
            <p className="text-2xl font-semibold text-green-400">
              {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
