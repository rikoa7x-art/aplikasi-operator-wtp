import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getUsers } from '../storage';
import { CABANG_LIST, getTipeOperatorLabel, getWtpLabel, type TipeOperator } from '../types';
import type { User } from '../types';

type Step = 'cabang' | 'tipe' | 'operator';

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

/* ── Step indicator ─────────────────────────────────────────── */
function StepIndicator({ current }: { current: Step }) {
    const steps: { key: Step; label: string }[] = [
        { key: 'cabang',   label: 'Cabang' },
        { key: 'tipe',     label: 'Tipe' },
        { key: 'operator', label: 'Login' },
    ];
    const idx = steps.findIndex(s => s.key === current);
    return (
        <div className="flex items-center gap-0 mb-6">
            {steps.map((s, i) => (
                <React.Fragment key={s.key}>
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                            style={i <= idx
                                ? { background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', color: 'white', boxShadow: '0 0 10px rgba(14,116,144,0.4)' }
                                : { background: 'rgba(99,130,200,0.1)', color: '#475569', border: '1px solid rgba(99,130,200,0.2)' }}>
                            {i < idx ? '✓' : i + 1}
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider"
                            style={{ color: i <= idx ? '#22d3ee' : '#475569' }}>
                            {s.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className="flex-1 h-px mx-1 mb-4 transition-all"
                            style={{ background: i < idx ? 'rgba(34,211,238,0.5)' : 'rgba(99,130,200,0.15)' }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default function LoginPage() {
    const { login } = useAuth();

    const [step, setStep] = useState<Step>('cabang');
    const [selectedCabang, setSelectedCabang] = useState('');
    const [selectedTipe, setSelectedTipe] = useState<TipeOperator | ''>('');
    const [operators, setOperators] = useState<User[]>([]);
    const [loadingOps, setLoadingOps] = useState(false);
    const [loggingIn, setLoggingIn] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [adminUsername, setAdminUsername] = useState('');
    const [adminError, setAdminError] = useState('');
    const [adminLoading, setAdminLoading] = useState(false);

    // Fetch operators when entering step 'operator'
    useEffect(() => {
        if (step === 'operator') {
            setLoadingOps(true);
            setError('');
            getUsers()
                .then(users => {
                    const filtered = users.filter(u =>
                        u.role === 'operator' &&
                        u.cabang === selectedCabang &&
                        u.tipeOperator === selectedTipe
                    );
                    setOperators(filtered);
                    if (filtered.length === 0) setError('Belum ada operator terdaftar untuk cabang & tipe ini.');
                })
                .catch(() => setError('Gagal memuat data operator.'))
                .finally(() => setLoadingOps(false));
        }
    }, [step]);

    const handleSelectOperator = async (username: string) => {
        setLoggingIn(username);
        setError('');
        const ok = await login(username);
        if (!ok) {
            setError('Login gagal. Silakan hubungi administrator.');
            setLoggingIn(null);
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminUsername.trim()) return;
        setAdminLoading(true);
        setAdminError('');
        const ok = await login(adminUsername.trim());
        if (!ok) {
            setAdminError('Username admin tidak ditemukan.');
        }
        setAdminLoading(false);
    };

    const goBack = () => {
        setError('');
        if (step === 'tipe') setStep('cabang');
        else if (step === 'operator') setStep('tipe');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-5 pt-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #060d1f 0%, #0d1a35 50%, #071628 100%)' }}>

            {/* Ambient glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(14,116,144,0.15) 0%, transparent 70%)', top: '-80px' }} />
            <div className="absolute bottom-32 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)' }} />
            <WaterWave />

            <div className="w-full max-w-sm relative z-10">

                {/* ── Logo & Title ─────────────────────────────── */}
                <div className="flex flex-col items-center mb-7">
                    <div className="relative mb-3 anim-float">
                        <div className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                                border: '2px solid rgba(34,211,238,0.25)',
                                borderRadius: '50%',
                                width: '116px', height: '116px',
                                left: '-8px', top: '-8px',
                                animation: 'pulse-ring 2.5s ease-out infinite'
                            }} />
                        <div className="rounded-full flex items-center justify-center"
                            style={{
                                width: '100px', height: '100px',
                                background: 'rgba(255,255,255,0.06)',
                                boxShadow: '0 0 40px rgba(14,116,144,0.45), 0 0 80px rgba(14,116,144,0.15), inset 0 0 20px rgba(255,255,255,0.04)',
                                border: '1.5px solid rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(6px)',
                                overflow: 'hidden'
                            }}>
                            <img src="/logo-wtp.png" alt="Logo WTP"
                                style={{ width: '88px', height: '88px', objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(14,116,144,0.5))' }} />
                        </div>
                    </div>
                    <h1 className="font-display font-bold text-2xl text-white mt-2">Operator WTP</h1>
                    <p className="text-cyan-400/70 text-xs mt-1 font-medium tracking-wide">Sistem Laporan Harian Pengolahan Air</p>
                </div>

                {/* ── Card ──────────────────────────────────────── */}
                <div className="glass rounded-3xl p-5 glow-blue" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>

                    <StepIndicator current={step} />

                    {/* Back button */}
                    {step !== 'cabang' && (
                        <button onClick={goBack}
                            className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-4 transition active:scale-95">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali
                        </button>
                    )}

                    {/* ════ STEP 1: Pilih Cabang ════ */}
                    {step === 'cabang' && (
                        <div>
                            <p className="text-slate-300 text-sm font-bold mb-1">Pilih Cabang</p>
                            <p className="text-slate-500 text-xs mb-4">Pilih cabang tempat Anda bertugas</p>
                            <div className="grid grid-cols-3 gap-2">
                                {CABANG_LIST.map(c => (
                                    <button key={c}
                                        onClick={() => { setSelectedCabang(c); setStep('tipe'); }}
                                        className="py-3 px-1 rounded-2xl text-xs font-bold transition active:scale-95 text-center leading-tight"
                                        style={{
                                            background: selectedCabang === c
                                                ? 'linear-gradient(135deg, #1d4ed8, #0891b2)'
                                                : 'rgba(255,255,255,0.04)',
                                            color: selectedCabang === c ? 'white' : '#94a3b8',
                                            border: selectedCabang === c
                                                ? '1px solid rgba(34,211,238,0.3)'
                                                : '1px solid rgba(99,130,200,0.15)',
                                            boxShadow: selectedCabang === c ? '0 4px 12px rgba(14,116,144,0.3)' : 'none'
                                        }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 2: Pilih Tipe ════ */}
                    {step === 'tipe' && (
                        <div>
                            <p className="text-slate-300 text-sm font-bold mb-1">Pilih Tipe Operator</p>
                            <p className="text-slate-500 text-xs mb-1">
                                Cabang: <span className="text-amber-400 font-semibold">📍 {selectedCabang}</span>
                            </p>
                            <p className="text-slate-500 text-xs mb-5">Pilih jenis tugas Anda</p>

                            <div className="space-y-3">
                                {/* WTP */}
                                <button
                                    onClick={() => { setSelectedTipe('operator_wtp'); setStep('operator'); }}
                                    className="w-full rounded-2xl p-4 text-left transition active:scale-[0.98] flex items-center gap-4"
                                    style={{ background: 'rgba(14,116,144,0.12)', border: '1.5px solid rgba(34,211,238,0.25)', boxShadow: '0 0 20px rgba(14,116,144,0.1)' }}>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                        style={{ background: 'rgba(14,116,144,0.2)', border: '1px solid rgba(34,211,238,0.2)' }}>
                                        🏭
                                    </div>
                                    <div>
                                        <p className="text-cyan-300 font-bold text-sm">Operator {getWtpLabel(selectedCabang)}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">Pencatatan operasional {getWtpLabel(selectedCabang)}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-600 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Reservoir */}
                                <button
                                    onClick={() => { setSelectedTipe('operator_reservoir'); setStep('operator'); }}
                                    className="w-full rounded-2xl p-4 text-left transition active:scale-[0.98] flex items-center gap-4"
                                    style={{ background: 'rgba(124,58,237,0.12)', border: '1.5px solid rgba(167,139,250,0.25)', boxShadow: '0 0 20px rgba(124,58,237,0.1)' }}>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                        style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.2)' }}>
                                        💧
                                    </div>
                                    <div>
                                        <p className="text-violet-300 font-bold text-sm">Operator Reservoir</p>
                                        <p className="text-slate-500 text-xs mt-0.5">Pencatatan operasional Reservoir</p>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-600 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════ STEP 3: Pilih Operator / Login ════ */}
                    {step === 'operator' && (
                        <div>
                            <p className="text-slate-300 text-sm font-bold mb-1">Pilih Nama Anda</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                    style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                                    📍 {selectedCabang}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                    style={selectedTipe === 'operator_wtp'
                                        ? { background: 'rgba(14,116,144,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }
                                        : { background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' }}>
                                    {selectedTipe === 'operator_wtp' ? '🏭' : '💧'} {selectedTipe ? getTipeOperatorLabel(selectedTipe, selectedCabang) : ''}
                                </span>
                            </div>

                            {/* Loading */}
                            {loadingOps && (
                                <div className="flex flex-col items-center py-10 gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                                    <p className="text-slate-500 text-xs">Memuat daftar operator...</p>
                                </div>
                            )}

                            {/* Operator list */}
                            {!loadingOps && operators.length > 0 && (
                                <div className="space-y-2">
                                    {operators.map(op => (
                                        <button key={op.id}
                                            onClick={() => handleSelectOperator(op.username)}
                                            disabled={!!loggingIn}
                                            className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3 transition active:scale-[0.98] disabled:opacity-60"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,130,200,0.15)' }}>
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shrink-0"
                                                style={{
                                                    background: selectedTipe === 'operator_wtp'
                                                        ? 'linear-gradient(135deg, #0e7490, #1d4ed8)'
                                                        : 'linear-gradient(135deg, #7c3aed, #1d4ed8)'
                                                }}>
                                                {op.nama.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-semibold text-sm">{op.nama}</p>
                                                <p className="text-slate-500 text-xs">@{op.username}</p>
                                            </div>
                                            {loggingIn === op.username ? (
                                                <div className="w-5 h-5 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin shrink-0" />
                                            ) : (
                                                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Empty state */}
                            {!loadingOps && operators.length === 0 && !error && (
                                <div className="flex flex-col items-center py-10 gap-2">
                                    <div className="text-3xl">👷</div>
                                    <p className="text-slate-500 text-sm text-center">Belum ada operator terdaftar untuk pilihan ini</p>
                                    <p className="text-slate-600 text-xs text-center">Hubungi administrator untuk mendaftarkan akun</p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 mt-3"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-600 text-xs mt-5">
                    © 2026 Sistem Laporan Harian WTP
                </p>

                {/* Admin login button */}
                <div className="flex justify-center mt-2">
                    <button
                        onClick={() => { setShowAdminLogin(true); setAdminError(''); setAdminUsername(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 text-[10px] font-medium transition active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.08)' }}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Login Admin
                    </button>
                </div>
            </div>

            {/* ── Modal Admin Login ─────────────────────────── */}
            {showAdminLogin && (
                <div className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowAdminLogin(false); }}>
                    <div className="w-full max-w-sm rounded-t-3xl p-6 pb-10"
                        style={{ background: '#0d1a35', border: '1px solid rgba(99,130,200,0.15)', borderBottom: 'none' }}>
                        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(99,130,200,0.3)' }} />

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #92400e, #b45309)', boxShadow: '0 0 12px rgba(180,83,9,0.4)' }}>
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-display font-bold text-white text-lg">Login Administrator</p>
                                <p className="text-slate-500 text-xs">Akses panel admin</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdminLogin} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Username</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={adminUsername}
                                        onChange={e => setAdminUsername(e.target.value)}
                                        className="input-glass pl-11"
                                        placeholder="Username admin"
                                        autoCapitalize="none"
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                            </div>

                            {adminError && (
                                <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-400 text-sm">{adminError}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAdminLogin(false)}
                                    className="flex-1 py-4 rounded-2xl text-slate-400 text-sm font-medium transition active:scale-[0.98]"
                                    style={{ border: '1px solid rgba(99,130,200,0.2)' }}>
                                    Batal
                                </button>
                                <button type="submit" disabled={adminLoading || !adminUsername.trim()}
                                    className="flex-[2] py-4 text-white font-bold rounded-2xl transition active:scale-[0.98] disabled:opacity-50 font-display"
                                    style={{ background: 'linear-gradient(135deg, #92400e, #b45309)', boxShadow: '0 4px 16px rgba(180,83,9,0.3)' }}>
                                    {adminLoading ? 'Memproses...' : 'Masuk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
