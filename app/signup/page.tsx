'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLogo from '@/components/AppLogo';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Cuenta creada y sesión guardada — pasamos directo a crear la tienda
      router.push('/registro');
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#FFF4F3] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-gradient-to-b from-[#FF6B35]/20 to-transparent -z-10 blur-[80px] rounded-full pointer-events-none"></div>

      <header className="w-full px-5 py-6 flex justify-between items-center z-10">
        <div className="transition-transform hover:scale-105">
          <AppLogo />
        </div>
        <Link href="/login" className="text-sm font-semibold text-[#FF6B35] hover:text-[#A63300] hover:underline transition-colors px-3 py-1.5 rounded-full hover:bg-[#FF6B35]/10">
          Iniciar sesión
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-5 z-10 pb-20">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 md:p-10 border border-[#E09C96]/30">

          <div className="text-center mb-8">
            <h1 className="font-headline font-bold text-[#4E211E] text-2xl md:text-3xl mb-2 tracking-tight">
              Crea tu cuenta
            </h1>
            <p className="text-[#834C48] text-sm md:text-base">
              Únete y empieza a vender a tus vecinos
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-2xl text-sm mb-6 flex items-start gap-2.5">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#4E211E] mb-1.5 ml-1">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFF4F3]/50 border border-[#E09C96]/50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-[#4E211E] transition-all placeholder:text-[#834C48]/50 font-medium"
                placeholder="Ej. María Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#4E211E] mb-1.5 ml-1">
                Número de WhatsApp
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFF4F3]/50 border border-[#E09C96]/50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-[#4E211E] transition-all placeholder:text-[#834C48]/50 font-medium"
                placeholder="Ej. +584141234567"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#4E211E] mb-1.5 ml-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFF4F3]/50 border border-[#E09C96]/50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-[#4E211E] transition-all placeholder:text-[#834C48]/50 font-medium"
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#4E211E] mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-[#FFF4F3]/50 border border-[#E09C96]/50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-[#4E211E] transition-all placeholder:text-[#834C48]/50 font-medium"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#834C48]/60 hover:text-[#FF6B35] transition-colors p-1"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#4E211E] mb-1.5 ml-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-[#FFF4F3]/50 border border-[#E09C96]/50 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-[#4E211E] transition-all placeholder:text-[#834C48]/50 font-medium"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B35] hover:bg-[#A63300] text-white font-bold text-[15px] py-4 rounded-2xl shadow-[0_8px_20px_rgba(255,107,53,0.25)] hover:shadow-[0_4px_10px_rgba(255,107,53,0.2)] transition-all disabled:opacity-60 disabled:shadow-none active:scale-[0.98] flex justify-center items-center h-[56px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creando cuenta...
                  </span>
                ) : 'Registrarse'}
              </button>
            </div>

            <p className="text-center text-xs text-[#834C48] pt-1">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-semibold text-[#FF6B35] hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
