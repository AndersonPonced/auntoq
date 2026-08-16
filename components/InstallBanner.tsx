'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    if (localStorage.getItem('install_dismissed')) {
      setDismissed(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('install_dismissed', '1');
    setDismissed(true);
  };

  if (installed || dismissed || !prompt) return null;

  return (
    <div className="mx-auto max-w-[480px] md:max-w-2xl lg:max-w-3xl px-4 py-2">
      <div className="flex items-center gap-3 bg-white border border-border rounded-[14px] px-4 py-3 shadow-sm">
        <div className="flex-shrink-0 h-10 w-10 rounded-[10px] bg-brand flex items-center justify-center shadow-sm">
          <span className="text-xl leading-none">👆</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary leading-tight">Instalar Auntoq&apos;</p>
          <p className="text-xs text-muted leading-tight mt-0.5">Agrégala a tu pantalla de inicio</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-xs text-muted hover:text-primary transition-colors px-2 py-1"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <button
            onClick={handleInstall}
            className="text-xs font-bold text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all px-3 py-1.5 rounded-full"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
