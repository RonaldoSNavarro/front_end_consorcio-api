import { Loader2 } from 'lucide-react';

export const LoadingFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-brand-500 absolute animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Carregando módulo...
      </p>
    </div>
  );
};