import { useSyncExternalStore } from 'react';
import {
  getGlobalLoadingSnapshot,
  subscribeGlobalLoading,
} from '../utils/loadingTracker';

export function GlobalLoading() {
  const isLoading = useSyncExternalStore(
    subscribeGlobalLoading,
    getGlobalLoadingSnapshot,
    () => false,
  );

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="rounded-xl border border-emerald-200 bg-white/95 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold text-slate-700">Cargando...</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Por favor, espera un momento.</p>
      </div>
    </div>
  );
}
