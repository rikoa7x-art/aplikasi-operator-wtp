import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

function WaterWave() {
    return (
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none" style={{ height: '180px' }}>
            <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave 8s linear infinite' }}>
                <path fill="rgba(14,116,144,0.18)"
                    d="M0,100 C240,140 480,60 720,100 C960,140 1200,60 1440,100 L1440,180 L0,180 Z" />
            </svg>
            <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave 12s linear infinite reverse', opacity: 0.7 }}>
                <path fill="rgba(59,130,246,0.12)"
                    d="M0,120 C360,70 720,150 1080,110 C1260,90 1350,130 1440,120 L1440,180 L0,180 Z" />
            </svg>
            <svg viewBox="0 0 1440 180" xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute', bottom: 0, width: '200%', animation: 'wave 6s linear infinite', opacity: 0.5 }}>
                <path fill="rgba(34,211,238,0.08)"
                    d="M0,140 C180,100 360,160 540,140 C720,120 900,160 1080,140 C1260,120 1350,160 1440,140 L1440,180 L0,180 Z" />
            </svg>
        </div>
    );
}

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            const ok = login(username, password);
            if (!ok) setError('Username atau password salah.');
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #060d1f 0%, #0d1a35 50%, #071628 100%)' }}>

            {/* Ambient glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(14,116,144,0.15) 0%, transparent 70%)', top: '-80px' }} />
            <div className="absolute bottom-32 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)' }} />

            {/* Water waves at bottom */}
            <WaterWave />

            {/* Content */}
            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                        {/* Outer pulse ring */}
                        <div className="absolute inset-0 rounded-full"
                            style={{
                                border: '2px solid rgba(34,211,238,0.3)',
                                borderRadius: '50%',
                                width: '88px', height: '88px',
                                left: '-8px', top: '-8px',
                                animation: 'pulse-ring 2.5s ease-out infinite'
                            }} />
                        <div className="w-18 h-18 rounded-2xl flex items-center justify-center anim-float"
                            style={{
                                width: '72px', height: '72px',
                                background: 'linear-gradient(135deg, #0e7490 0%, #1d4ed8 100%)',
                                boxShadow: '0 0 30px rgba(14,116,144,0.5), 0 0 60px rgba(14,116,144,0.2)'
                            }}>
                            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 3c-4.97 5.24-7 8.78-7 11a7 7 0 0014 0c0-2.22-2.03-5.76-7-11z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="font-display font-bold text-3xl text-white mt-1">Operator WTP</h1>
                    <p className="text-cyan-400/70 text-sm mt-1.5 font-medium tracking-wide">Sistem Laporan Harian Pengolahan Air</p>
                </div>

                {/* Card */}
                <div className="glass rounded-3xl p-6 glow-blue" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
                    <p className="text-slate-300 text-sm font-semibold mb-5">Masuk ke akun Anda</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="input-glass pl-11"
                                    placeholder="Username"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="input-glass pl-11 pr-12"
                                    placeholder="Password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                                    {showPass ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-white font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60 font-display text-base mt-2"
                            style={{
                                background: loading
                                    ? 'linear-gradient(135deg, #1e40af, #0e7490)'
                                    : 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)',
                                boxShadow: '0 4px 24px rgba(14,116,144,0.4), 0 0 0 1px rgba(34,211,238,0.15)',
                                backgroundSize: loading ? 'auto' : '200% auto',
                                animation: loading ? 'none' : 'shimmer 2s linear infinite'
                            }}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : 'Masuk'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">
                    © 2026 Sistem Laporan Harian WTP
                </p>
            </div>
        </div>
    );
}
