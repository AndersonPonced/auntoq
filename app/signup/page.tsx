'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLogo from '@/components/AppLogo';
import { signUp } from '@/lib/auth';

// Componente para inputs con animación "floating label"
function AnimatedInput({ 
  id, label, type, value, onChange, placeholder = "", required = false, minLength, className = "", delay = "0ms" 
}: any) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword && showPassword ? 'text' : type;

  return (
    <div 
      className={`relative animate-fade-up ${className}`} 
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className={`relative border rounded-2xl transition-all duration-300 bg-[#FFF4F3]/30 backdrop-blur-sm ${focused ? 'border-[#FF6B35] ring-4 ring-[#FF6B35]/10 bg-white' : 'border-[#E09C96]/50 hover:border-[#FF6B35]/50'}`}>
        <label 
          htmlFor={id} 
          className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${active ? 'top-2 text-[10px] text-[#FF6B35] uppercase tracking-wider' : 'top-3.5 text-sm text-[#834C48]/70'}`}
        >
          {label}
        </label>
        <input
          id={id}
          type={currentType}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 pt-6 pb-2 bg-transparent outline-none text-[#4E211E] font-medium text-[15px] placeholder-transparent transition-all`}
          placeholder={active ? placeholder : ''}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#834C48]/60 hover:text-[#FF6B35] transition-colors p-1"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animación suave de entrada
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    const { error } = await signUp({
      email,
      password,
      nombre_completo: fullName,
      telefono: phone,
    });

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push('/registro');
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-[100dvh] bg-[#FFF4F3] flex flex-col relative overflow-hidden selection:bg-[#FF6B35]/30">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#FF6B35]/20 to-transparent blur-[100px] rounded-full pointer-events-none animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#FF6B35]/10 to-transparent blur-[100px] rounded-full pointer-events-none"></div>

      <header className="w-full px-6 py-6 flex justify-between items-center z-10 animate-fade-in">
        <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
          <AppLogo />
        </Link>
        <Link href="/login" className="text-sm font-bold text-[#FF6B35] hover:text-[#A63300] transition-colors px-4 py-2 rounded-full hover:bg-[#FF6B35]/10">
          Iniciar sesión
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-5 z-10 pb-20">
        <div className="w-full max-w-[440px]">
          
          <div className="text-center mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <span className="inline-block py-1 px-3 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-[11px] font-extrabold uppercase tracking-widest mb-4">
              Vende fácil y rápido
            </span>
            <h1 className="font-headline font-extrabold text-[#4E211E] text-3xl md:text-4xl mb-3 tracking-tight leading-tight">
              Crea tu cuenta
            </h1>
            <p className="text-[#834C48] text-[15px] md:text-base px-4">
              Únete a Auntokke y empieza a conectar tu negocio con tus vecinos hoy mismo.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgb(0,0,0,0.05)] p-6 md:p-10 border border-white/50 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {error && (
              <div className="bg-red-50 border border-red-100/50 text-red-600 p-4 rounded-2xl text-sm mb-6 flex items-start gap-3 shadow-sm animate-fade-in">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <AnimatedInput
                id="fullName"
                label="Nombre completo"
                type="text"
                value={fullName}
                onChange={(e: any) => setFullName(e.target.value)}
                required
                placeholder="Ej. María Pérez"
                delay="300ms"
              />

              <AnimatedInput
                id="phone"
                label="Número de WhatsApp"
                type="tel"
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
                required
                placeholder="Ej. +584141234567"
                delay="350ms"
              />

              <AnimatedInput
                id="email"
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
                delay="400ms"
              />

              <AnimatedInput
                id="password"
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                delay="450ms"
              />

              <AnimatedInput
                id="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e: any) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Repite tu contraseña"
                delay="500ms"
              />

              <div className="pt-4 animate-fade-up" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full bg-[#FF6B35] hover:bg-[#A63300] text-white font-bold text-[16px] py-4 rounded-2xl shadow-[0_8px_25px_rgba(255,107,53,0.3)] hover:shadow-[0_12px_30px_rgba(255,107,53,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:shadow-none disabled:hover:translate-y-0 overflow-hidden flex justify-center items-center h-[60px]"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Creando cuenta...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Registrarme
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <p className="text-center text-[13px] text-[#834C48]/80 mt-8 animate-fade-in" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
            Al registrarte aceptas nuestros{' '}
            <a href="#" className="font-semibold text-[#834C48] hover:text-[#FF6B35] underline underline-offset-2 transition-colors">Términos de servicio</a>
            {' '}y{' '}
            <a href="#" className="font-semibold text-[#834C48] hover:text-[#FF6B35] underline underline-offset-2 transition-colors">Política de privacidad</a>.
          </p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </main>
  );
}
