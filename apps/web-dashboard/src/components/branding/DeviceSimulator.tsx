'use client';

import { Globe, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import { RefObject } from 'react';
import { cn } from '@/lib/utils';

interface DeviceSimulatorProps {
  previewUrl: string;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onRefresh: () => void;
  iframeKey: number;
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

export function DeviceSimulator({
  previewUrl,
  previewDevice,
  onDeviceChange,
  onRefresh,
  iframeKey,
  iframeRef,
}: DeviceSimulatorProps) {
  return (
    <div className="lg:col-span-6 sticky top-20 space-y-3">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Simulator Website Live</span>
        </span>

        {/* DEVICE TOGGLE BUTTONS */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={() => onDeviceChange('desktop')}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              previewDevice === 'desktop'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            )}
            title="Tampilan Desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('tablet')}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              previewDevice === 'tablet'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            )}
            title="Tampilan Tablet"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange('mobile')}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer',
              previewDevice === 'mobile'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            )}
            title="Tampilan Smartphone"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-l border-slate-100 dark:border-slate-800 ml-1 cursor-pointer"
            title="Muat Ulang Simulator"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* FRAME CONTAINER (APPLE STUDIO DISPLAY BEZEL) */}
      <div className="bg-slate-200/90 dark:bg-slate-900/80 p-3 sm:p-4 rounded-3xl border border-slate-300/80 dark:border-slate-800 shadow-inner flex justify-center overflow-hidden transition-all">
        <div
          className={cn(
            'bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-800 transition-all duration-300',
            previewDevice === 'desktop'
              ? 'w-full h-[620px]'
              : previewDevice === 'tablet'
              ? 'w-[480px] h-[620px]'
              : 'w-[320px] h-[580px]'
          )}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Live Preview Website Dewan"
          />
        </div>
      </div>
    </div>
  );
}
