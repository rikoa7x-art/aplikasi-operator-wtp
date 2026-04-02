import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getCatatan, deleteCatatan } from '../storage';
import type { CatatanWaktu } from '../types';
import { SLOTS, getHariOperasi, getCurrentSlot } from '../types';
import FormCatatan from '../components/FormLaporan';
import DetailCatatan from '../components/DetailLaporan';

type View = 'grid' | 'riwayat';
type Modal =
    | { type: 'form'; slot: number; existing?: CatatanWaktu }
    | { type: 'detail'; catatan: CatatanWaktu }
    | null;

export default function OperatorPage() {
    const { user, logout } = useAuth();
    const [view, setView] = useState<View>('grid');
    const [semua, setSemua] = useState<CatatanWaktu[]>([]);
    const [modal, setModal] = useState<Modal>(null);

    const hariOperasi = getHariOperasi();
    const currentSlot = getCurrentSlot();

    const reload = () => setSemua(getCatatan().filter(c => c.operatorId === user!.id));
    useEffect(() => { reload(); }, []);

    const hari = semua.filter(c => c.tanggal === hariOperasi);
    const slotMap = new Map(hari.map(c => [c.slot, c]));
    const filledToday = hari.length;

    // Group riwayat by tanggal
    const riwayatMap = semua.reduce<Record<string, CatatanWaktu[]>>((acc, c) => {
        if (!acc[c.tanggal]) acc[c.tanggal] = [];
        acc[c.tanggal].push(c);
        return acc;
    }, {});
    const tanggalList = Object.keys(riwayatMap).sort((a, b) => b.localeCompare(a));

    const turbColor = (v: number | '') =>
        v === '' ? 'text-slate-500' : Number(v) <= 1 ? 'text-emerald-400' : Number(v) <= 5 ? 'text-amber-400' : 'text-red-400';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 flex flex-col">

            {/* Header */}
            <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Logo WTP" className="w-9 h-9 rounded-xl object-contain bg-white/5" />
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">{user?.nama}</p>
                        <p className="text-slate-400 text-xs mt-0.5">Operator WTP</p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-medium transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    Keluar
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">

                {/* === GRID HARI INI === */}
                {view === 'grid' && (
                    <div className="page-enter space-y-4">
                        {/* Tanggal & Progress */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold text-base">
                                    {new Date(hariOperasi + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                <p className="text-slate-400 text-xs mt-0.5">{filledToday} / 12 slot terisi</p>
                            </div>
                            {/* Circular progress */}
                            <div className="relative w-14 h-14">
                                <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3.2" />
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3.2"
                                        strokeDasharray={`${(filledToday / 12) * 100} 100`} strokeLinecap="round"
                                        className="transition-all duration-500" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{filledToday}/12</span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${(filledToday / 12) * 100}%` }} />
                        </div>

                        {/* 12 Slot Cards */}
                        <div className="grid grid-cols-3 gap-2.5">
                            {SLOTS.map(s => {
                                const filled = slotMap.get(s.slot);
                                const isActive = s.slot === currentSlot;
                                return (
                                    <button key={s.slot}
                                        onClick={() => filled
                                            ? setModal({ type: 'detail', catatan: filled })
                                            : setModal({ type: 'form', slot: s.slot })}
                                        className={`relative rounded-2xl p-3 border text-left transition active:scale-95 ${filled
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : isActive
                                                ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_14px_rgba(59,130,246,0.15)]'
                                                : 'bg-slate-800/60 border-slate-700/50'}`}>
                                        {/* Active pulse dot */}
                                        {isActive && !filled && (
                                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                        )}
                                        <p className={`text-base font-bold ${filled ? 'text-emerald-300' : isActive ? 'text-blue-300' : 'text-slate-300'}`}>
                                            {s.jam}
                                        </p>
                                        {filled ? (
                                            <div className="mt-1 space-y-0.5">
                                                <p className={`text-[11px] font-semibold leading-none ${turbColor(filled.kekeruhanOlahan)}`}>
                                                    {filled.kekeruhanOlahan !== '' ? `${filled.kekeruhanOlahan} NTU` : '–'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 leading-none">
                                                    {filled.debit !== '' ? `${filled.debit} L/s` : ''}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                                                    <span className="text-[9px] text-emerald-500 font-semibold">Terisi</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={`text-[10px] mt-1.5 ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                                                {isActive ? '● Tap isi data' : 'Belum diisi'}
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* === RIWAYAT === */}
                {view === 'riwayat' && (
                    <div className="page-enter space-y-5">
                        {tanggalList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <svg className="w-14 h-14 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm">Belum ada riwayat</p>
                            </div>
                        ) : tanggalList.map(tgl => {
                            const items = riwayatMap[tgl].sort((a, b) => a.slot - b.slot);
                            return (
                                <div key={tgl}>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                        {new Date(tgl + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        <span className="ml-2 text-slate-600 normal-case">({items.length} data)</span>
                                    </p>
                                    <div className="space-y-2">
                                        {items.map(c => (
                                            <button key={c.id} onClick={() => setModal({ type: 'detail', catatan: c })}
                                                className="w-full text-left bg-slate-800/60 rounded-2xl border border-slate-700/50 px-4 py-3 active:scale-[0.98] transition flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-blue-300 font-bold text-sm w-12 shrink-0">{c.jamLabel}</span>
                                                    <div>
                                                        <p className={`text-sm font-semibold ${turbColor(c.kekeruhanOlahan)}`}>
                                                            {c.kekeruhanOlahan !== '' ? `${c.kekeruhanOlahan} NTU` : '–'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            Debit: {c.debit !== '' ? `${c.debit} L/s` : '–'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-20">
                <div className="flex">
                    {[
                        {
                            key: 'grid', label: 'Hari Ini',
                            icon: (a: boolean) => (
                                <svg className={`w-6 h-6 ${a ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2 : 1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                            )
                        },
                        {
                            key: 'riwayat', label: 'Riwayat',
                            icon: (a: boolean) => (
                                <svg className={`w-6 h-6 ${a ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2 : 1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )
                        },
                    ].map(t => {
                        const active = view === t.key as View;
                        return (
                            <button key={t.key} onClick={() => { setView(t.key as View); reload(); }}
                                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all active:scale-95">
                                {t.icon(active)}
                                <span className={`text-xs font-semibold ${active ? 'text-blue-400' : 'text-slate-500'}`}>{t.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
                    onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="bg-slate-900 border border-slate-700 rounded-t-3xl w-full max-h-[92vh] overflow-y-auto p-5 pb-10">
                        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />
                        {modal.type === 'form' && (
                            <FormCatatan
                                initialSlot={modal.slot}
                                existing={modal.existing}
                                onSuccess={() => { reload(); setModal(null); }}
                                onCancel={() => setModal(null)}
                            />
                        )}
                        {modal.type === 'detail' && (
                            <>
                                <DetailCatatan catatan={modal.catatan} onClose={() => setModal(null)} />
                                <button onClick={() => setModal({ type: 'form', slot: modal.catatan.slot, existing: modal.catatan })}
                                    className="mt-3 w-full py-3.5 text-sm font-medium text-blue-400 border border-blue-500/30 active:bg-blue-500/10 rounded-2xl transition">
                                    Edit Data Ini
                                </button>
                                <button onClick={() => {
                                    if (!confirm('Hapus data ini?')) return;
                                    deleteCatatan(modal.catatan.id); reload(); setModal(null);
                                }} className="mt-2 w-full py-3.5 text-sm font-medium text-red-400 border border-red-500/30 active:bg-red-500/10 rounded-2xl transition">
                                    Hapus Data
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
