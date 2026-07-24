'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useExamFullscreen } from '@/hooks/useExamFullscreen';

type Props = {
  title: string;
  subtitle?: string;
  stageLabel?: string;
  children: ReactNode;
  /** When false, navigation remains visible (e.g. drive lobby before starting a stage). */
  focusMode?: boolean;
  /**
   * Immersive Drive Day (PRD §6): force fullscreen stakes, warn on exit.
   */
  immersive?: boolean;
  exitWarning?: string;
};

export function ExamFocusShell({
  title,
  subtitle,
  stageLabel,
  children,
  focusMode = true,
  immersive = false,
  exitWarning,
}: Props) {
  const { isFullscreen, toggleFullscreen, enterFullscreen } = useExamFullscreen({
    autoEnter: focusMode,
  });

  if (!focusMode) {
    return (
      <DashboardLayout requiredUserType="student">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">{children}</div>
      </DashboardLayout>
    );
  }

  const handleFullscreenClick = () => {
    if (immersive && isFullscreen) {
      const msg =
        exitWarning ||
        'Leaving fullscreen may be flagged by the Proctor Agent — this mirrors a real online assessment. Continue?';
      if (!window.confirm(msg)) return;
    }
    void toggleFullscreen();
  };

  return (
    <DashboardLayout requiredUserType="student" hideNavigation>
      <div
        className={`flex h-[calc(100vh-5rem)] min-h-0 flex-col overflow-hidden font-sans select-none ${
          immersive ? 'bg-slate-950' : 'bg-gray-100'
        }`}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className={`relative z-20 flex h-16 shrink-0 items-center justify-between px-6 text-white shadow-md ${
            immersive ? 'bg-slate-900' : 'bg-[#2563EB]'
          }`}
        >
          <div className="min-w-0">
            {stageLabel && (
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  immersive ? 'text-slate-400' : 'text-blue-100'
                }`}
              >
                {stageLabel}
              </p>
            )}
            <h1 className="truncate text-xl font-bold">{title}</h1>
            {subtitle && (
              <p className={`truncate text-sm ${immersive ? 'text-slate-400' : 'text-blue-100'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {immersive && !isFullscreen && (
              <button
                type="button"
                onClick={() => void enterFullscreen()}
                className="shrink-0 rounded-md bg-amber-500/90 px-3 py-2 text-xs font-semibold text-slate-950"
              >
                Return to fullscreen
              </button>
            )}
            <button
              type="button"
              onClick={handleFullscreenClick}
              className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                immersive ? 'bg-white/10 hover:bg-white/20' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isFullscreen ? (immersive ? 'Exit (flagged)' : 'Exit Fullscreen') : 'Enter Fullscreen'}
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </DashboardLayout>
  );
}
