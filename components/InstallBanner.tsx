'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default true to avoid flash

  useEffect(() => {
    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) {
      setInstalled(true);
      return;
    }
    
    if (localStorage.getItem('install_dismissed')) {
      setDismissed(true);
      return;
    }

    // Detect iOS and Mobile
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    
    setIsIOS(isIosDevice);

    if (!isMobileDevice) {
      // Don't listen or show anything if not on a mobile device
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
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
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

  // Show banner if: not installed, not dismissed, not standalone, and either we have a prompt (Android) OR it's iOS
  const shouldShowBanner = !installed && !dismissed && !isStandalone && (prompt || isIOS);

  if (!shouldShowBanner) return null;

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 z-40 mx-auto max-w-[400px] px-4 animate-slide-up">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl p-3 shadow-xl">
          <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border p-1 overflow-hidden">
            <Image src="/logo.png" alt="Auntokke Logo" width={40} height={40} className="object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-primary leading-tight">Instalar Auntokke</p>
            <p className="text-xs text-muted leading-tight mt-0.5 font-medium">Usa la app rápido y sin gastar datos</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="text-sm font-bold text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all px-4 py-2 rounded-full shadow-md"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-surface text-muted hover:bg-border transition-colors ml-1"
              aria-label="Cerrar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md border border-border p-2">
                <Image src="/logo.png" alt="Auntokke Logo" width={56} height={56} className="object-contain" />
              </div>
            </div>
            <h3 className="text-xl font-black text-center text-primary mb-2">Instalar en tu iPhone</h3>
            <p className="text-center text-muted mb-6 text-sm">Instala Auntokke en tu pantalla de inicio para acceso instantáneo.</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-brand font-bold text-sm">1</div>
                <p className="text-sm text-primary flex-1">
                  Toca el botón <strong>Compartir</strong> en la barra de abajo
                </p>
                <svg className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </div>
              <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-sm text-brand font-bold text-sm">2</div>
                <p className="text-sm text-primary flex-1">
                  Desliza y selecciona <strong>Agregar a inicio</strong>
                </p>
                <svg className="w-6 h-6 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
            </div>
            
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-brand text-white font-bold py-3.5 rounded-xl hover:bg-brand-dark transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
