import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getCatatan, deleteCatatan, getMingguan, deleteMingguan } from '../storage';
import type { CatatanWaktu, LaporanMingguan } from '../types';
import { SLOTS, getHariOperasi, getCurrentSlot, getCurrentWeekRange } from '../types';
import FormCatatan from '../components/FormLaporan';
import DetailCatatan from '../components/DetailLaporan';
import FormMingguan from '../components/FormMingguan';

type View = 'grid' | 'mingguan' | 'riwayat';
type Modal =
    | { type: 'form2jam'; slot: number; existing?: CatatanWaktu }
    | { type: 'detail2jam'; catatan: CatatanWaktu }
    | { type: 'formMingguan'; existing?: LaporanMingguan }
    | { type: 'detailMingguan'; data: LaporanMingguan }
    | null;

/* ── NTU color helpers ───────────────────────────────────────── */
const turbColor   = (v: number | '') => v === '' ? 'text-slate-500' : Number(v) <= 1 ? 'text-emerald-400' : Number(v) <= 5 ? 'text-amber-400' : 'text-red-400';
const turbBgGrad  = (v: number | '') => v === '' ? 'rgba(100,116,139,0.15)' : Number(v) <= 1 ? 'rgba(52,211,153,0.12)' : Number(v) <= 5 ? 'rgba(245,158,11,0.12)' : 'rgba(248,113,113,0.12)';
const turbBorder  = (v: number | '') => v === '' ? 'rgba(100,116,139,0.2)' : Number(v) <= 1 ? 'rgba(52,211,153,0.3)' : Number(v) <= 5 ? 'rgba(245,158,11,0.3)' : 'rgba(248,113,113,0.3)';

const formatTgl = (d: string) => new Date(d + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

/* ── Chemical Badge ──────────────────────────────────────────── */
function ChemBadge({ label, value, color }: { label: string; value: number | string | ''; color: string }) {
    return (
        <div className="flex-1 rounded-2xl py-3 px-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className={`font-bold text-base font-display ${color}`}>{value !== '' ? value : '–'}</p>
            <p className="text-slate-500 text-[10px] mt-0.5 font-medium">{label}</p>
        </div>
    );
}

export default function OperatorPage() {
    const { user, logout } = useAuth();
    const [view, setView] = useState<View>('grid');
    const [semua, setSemua] = useState<CatatanWaktu[]>([]);
    const [mingguanList, setMingguanList] = useState<LaporanMingguan[]>([]);
    const [modal, setModal] = useState<Modal>(null);
    const [isLoading, setIsLoading] = useState(true);

    const hariOperasi = getHariOperasi();
    const currentSlot = getCurrentSlot();
    const weekInfo = getCurrentWeekRange();

    const reload = async () => {
        setIsLoading(true);
        try {
            const cat = await getCatatan();
            setSemua(cat.filter(c => c.operatorId === user!.id));
            const ming = await getMingguan();
            setMingguanList(ming.filter(m => m.operatorId === user!.id));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => { reload(); }, []);

    const hari = semua.filter(c => c.tanggal === hariOperasi);
    const slotMap = new Map(hari.map(c => [c.slot, c]));
    const filledToday = hari.length;
    const progressPct = Math.round((filledToday / 12) * 100);

    const currentWeekMingguan = mingguanList.find(m => m.mingguKe === weekInfo.mingguKe);

    const riwayatMap = semua.reduce<Record<string, CatatanWaktu[]>>((acc, c) => {
        if (!acc[c.tanggal]) acc[c.tanggal] = [];
        acc[c.tanggal].push(c);
        return acc;
    }, {});
    const tanggalList = Object.keys(riwayatMap).sort((a, b) => b.localeCompare(a));

    /* ── Bottom nav tabs ─────────────────────────────────────── */
    const tabs = [
        {
            key: 'grid' as View, label: 'Hari Ini',
            icon: (a: boolean) => (
                <svg className={`w-5 h-5 transition-all ${a ? 'text-cyan-400' : 'text-slate-500'}`} fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.5}
                        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
            ),
            activeColor: 'text-cyan-400',
            glowColor: 'rgba(34,211,238,0.15)',
        },
        {
            key: 'mingguan' as View, label: 'Mingguan',
            icon: (a: boolean) => (
                <svg className={`w-5 h-5 transition-all ${a ? 'text-amber-400' : 'text-slate-500'}`} fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            activeColor: 'text-amber-400',
            glowColor: 'rgba(245,158,11,0.15)',
        },
        {
            key: 'riwayat' as View, label: 'Riwayat',
            icon: (a: boolean) => (
                <svg className={`w-5 h-5 transition-all ${a ? 'text-violet-400' : 'text-slate-500'}`} fill={a ? 'none' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2 : 1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            activeColor: 'text-violet-400',
            glowColor: 'rgba(167,139,250,0.15)',
        },
    ];

    /* ── Circumference for SVG progress ring ─────────────────── */
    const r = 26;
    const circ = 2 * Math.PI * r;
    const dash = (filledToday / 12) * circ;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #060d1f 0%, #0d1a35 60%, #071628 100%)' }}>

            {/* ── Header ────────────────────────────────────────── */}
            <header className="sticky top-0 z-20 px-4 pt-4 pb-3 flex items-center justify-between"
                style={{ background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,130,200,0.12)' }}>
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-display font-bold text-white text-base"
                            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', boxShadow: '0 0 12px rgba(14,116,144,0.4)' }}>
                            {user?.nama?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 bg-emerald-400"
                            style={{ borderColor: 'rgba(6,13,31,1)' }} />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-tight">{user?.nama}</p>
                        <p className="text-xs mt-0.5 font-medium text-grad-blue">Operator WTP</p>
                    </div>
                </div>
                <button onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 text-xs font-medium transition active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    Keluar
                </button>
            </header>

            {/* ── Main ──────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto px-4 pt-4 pb-32 relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(8px)' }}>
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative w-12 h-12">
                                <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                                <div className="absolute inset-2 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                            </div>
                            <p className="text-cyan-400/60 text-xs font-medium">Memuat data...</p>
                        </div>
                    </div>
                )}

                {/* ════ GRID HARI INI ════ */}
                {view === 'grid' && (
                    <div className="page-enter space-y-5">
                        {/* Date + progress */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-display font-bold text-white text-lg leading-tight truncate">
                                    {new Date(hariOperasi + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,130,200,0.15)' }}>
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${progressPct}%`,
                                                background: 'linear-gradient(90deg, #1d4ed8, #0891b2, #22d3ee)',
                                                boxShadow: '0 0 8px rgba(34,211,238,0.4)'
                                            }} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 shrink-0">{filledToday}/12</span>
                                </div>
                            </div>
                            {/* SVG Ring */}
                            <div className="relative shrink-0" style={{ width: '64px', height: '64px' }}>
                                <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                                    <defs>
                                        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#1d4ed8" />
                                            <stop offset="100%" stopColor="#22d3ee" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(99,130,200,0.12)" strokeWidth="5" />
                                    <circle cx="32" cy="32" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="5"
                                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                                        style={{ transition: 'stroke-dasharray 0.7s ease', filter: 'drop-shadow(0 0 4px rgba(34,211,238,0.5))' }} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-display font-bold text-white text-sm">{progressPct}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Slot grid */}
                        <div className="grid grid-cols-3 gap-2.5 stagger-children">
                            {SLOTS.map(s => {
                                const filled = slotMap.get(s.slot);
                                const isActive = s.slot === currentSlot;
                                return (
                                    <button key={s.slot}
                                        onClick={() => filled
                                            ? setModal({ type: 'detail2jam', catatan: filled })
                                            : setModal({ type: 'form2jam', slot: s.slot })}
                                        className={`relative rounded-2xl p-3 text-left transition active:scale-95 ${isActive && !filled ? 'pulse-ring' : ''}`}
                                        style={{
                                            background: filled
                                                ? turbBgGrad(filled.ntuOlahan)
                                                : isActive
                                                    ? 'rgba(29,78,216,0.12)'
                                                    : 'rgba(255,255,255,0.03)',
                                            border: `1.5px solid ${filled
                                                ? turbBorder(filled.ntuOlahan)
                                                : isActive
                                                    ? 'rgba(34,211,238,0.35)'
                                                    : 'rgba(99,130,200,0.12)'}`,
                                            boxShadow: isActive && !filled ? '0 0 16px rgba(34,211,238,0.15)' : 'none'
                                        }}>
                                        {/* Active pulse dot */}
                                        {isActive && !filled && (
                                            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cyan-400"
                                                style={{ boxShadow: '0 0 6px rgba(34,211,238,0.8)', animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
                                        )}

                                        <p className={`text-sm font-bold font-display ${filled
                                            ? turbColor(filled.ntuOlahan)
                                            : isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                                            {s.jam}
                                        </p>

                                        {filled ? (
                                            <div className="mt-1.5 space-y-0.5">
                                                <p className={`text-xs font-semibold ${turbColor(filled.ntuOlahan)}`}>
                                                    {filled.ntuOlahan !== '' ? `${filled.ntuOlahan} NTU` : '–'}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    {filled.debitProduksi !== '' ? `${filled.debitProduksi} L/s` : ''}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                                        style={{ boxShadow: '0 0 4px rgba(52,211,153,0.8)' }} />
                                                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wide">Terisi</span>
                                                    {filled.foto && (
                                                        <svg className="w-2.5 h-2.5 text-violet-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={`text-[10px] mt-2 font-medium ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                                                {isActive ? '● Tap isi data' : 'Belum diisi'}
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ════ LAPORAN MINGGUAN ════ */}
                {view === 'mingguan' && (
                    <div className="page-enter space-y-4">
                        {/* Current week card */}
                        <div className="rounded-3xl p-5 relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, rgba(146,64,14,0.3) 0%, rgba(120,53,15,0.2) 100%)', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)' }} />
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Minggu Ini</p>
                            <p className="font-display font-bold text-white text-xl">{weekInfo.mingguKe}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{formatTgl(weekInfo.mulai)} — {formatTgl(weekInfo.akhir)}</p>
                            <div className="mt-3">
                                {currentWeekMingguan ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                        style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 4px rgba(52,211,153,0.8)' }} />
                                        Sudah diisi
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                        style={{ background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.2)', color: '#94a3b8' }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                        Belum diisi
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action button */}
                        <button
                            onClick={() => setModal({ type: 'formMingguan', existing: currentWeekMingguan ?? undefined })}
                            className="w-full py-4 flex items-center justify-center gap-2 font-display font-bold text-white rounded-2xl transition active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
                                boxShadow: '0 4px 20px rgba(180,83,9,0.4), 0 0 0 1px rgba(245,158,11,0.2)'
                            }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentWeekMingguan ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 4v16m8-8H4'} />
                            </svg>
                            {currentWeekMingguan ? 'Edit Laporan Minggu Ini' : 'Isi Laporan Minggu Ini'}
                        </button>

                        {/* Weekly detail */}
                        {currentWeekMingguan && (
                            <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.12)' }}>
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Pemakaian (kg)</p>
                                    <div className="flex gap-2">
                                        <ChemBadge label="PAC" value={currentWeekMingguan.pemakaianPAC} color="text-emerald-400" />
                                        <ChemBadge label="Kaporit" value={currentWeekMingguan.pemakaianKaporit} color="text-cyan-400" />
                                        <ChemBadge label="Polimer" value={currentWeekMingguan.pemakaianPolimer} color="text-violet-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Sisa Stok (kg)</p>
                                    <div className="flex gap-2">
                                        <ChemBadge label="PAC" value={currentWeekMingguan.sisaPAC} color="text-blue-300" />
                                        <ChemBadge label="Kaporit" value={currentWeekMingguan.sisaKaporit} color="text-sky-300" />
                                        <ChemBadge label="Polimer" value={currentWeekMingguan.sisaPolimer} color="text-indigo-300" />
                                    </div>
                                </div>
                                {currentWeekMingguan.catatan && (
                                    <p className="text-xs text-slate-400 italic border-t pt-3" style={{ borderColor: 'rgba(99,130,200,0.12)' }}>
                                        "{currentWeekMingguan.catatan}"
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Riwayat mingguan */}
                        {mingguanList.filter(m => m.mingguKe !== weekInfo.mingguKe).length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Riwayat Mingguan</p>
                                <div className="space-y-2">
                                    {mingguanList
                                        .filter(m => m.mingguKe !== weekInfo.mingguKe)
                                        .sort((a, b) => b.mingguKe.localeCompare(a.mingguKe))
                                        .map(m => (
                                            <button key={m.id}
                                                onClick={() => setModal({ type: 'detailMingguan', data: m })}
                                                className="w-full text-left rounded-2xl px-4 py-3.5 active:scale-[0.98] transition flex items-center justify-between"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.12)' }}>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{m.mingguKe}</p>
                                                    <p className="text-slate-500 text-xs mt-0.5">{formatTgl(m.tanggalMulai)} — {formatTgl(m.tanggalAkhir)}</p>
                                                </div>
                                                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ════ RIWAYAT 2-JAM ════ */}
                {view === 'riwayat' && (
                    <div className="page-enter space-y-5">
                        {tanggalList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,130,200,0.12)' }}>
                                    <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">Belum ada riwayat</p>
                            </div>
                        ) : tanggalList.map(tgl => {
                            const items = riwayatMap[tgl].sort((a, b) => a.slot - b.slot);
                            return (
                                <div key={tgl}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {new Date(tgl + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: 'rgba(99,130,200,0.1)', color: '#94a3b8', border: '1px solid rgba(99,130,200,0.15)' }}>
                                            {items.length} data
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {items.map(c => (
                                            <button key={c.id} onClick={() => setModal({ type: 'detail2jam', catatan: c })}
                                                className="w-full text-left rounded-2xl px-4 py-3.5 active:scale-[0.98] transition flex items-center justify-between gap-3"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.12)' }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                        style={{ background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                                        <span className="text-blue-300 font-bold text-xs font-display">{c.jamLabel}</span>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-semibold ${turbColor(c.ntuOlahan)}`}>
                                                            {c.ntuOlahan !== '' ? `${c.ntuOlahan} NTU` : '–'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5">Debit: {c.debitProduksi !== '' ? `${c.debitProduksi} L/s` : '–'}</p>
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

            {/* ── Bottom Nav ─────────────────────────────────────── */}
            <nav className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-5 pt-2"
                style={{ background: 'linear-gradient(to top, rgba(6,13,31,1) 60%, transparent)' }}>
                <div className="flex rounded-2xl p-1.5 gap-1"
                    style={{ background: 'rgba(13,26,53,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,130,200,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    {tabs.map(t => {
                        const active = view === t.key;
                        return (
                            <button key={t.key}
                                onClick={() => { setView(t.key); reload(); }}
                                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl transition-all active:scale-95 relative"
                                style={active ? { background: t.glowColor, boxShadow: `0 0 12px ${t.glowColor}` } : {}}>
                                {t.icon(active)}
                                <span className={`text-[10px] font-bold uppercase tracking-wide transition-all ${active ? t.activeColor : 'text-slate-600'}`}>
                                    {t.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* ── Modal ──────────────────────────────────────────── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
                    <div className="w-full max-h-[92vh] overflow-y-auto rounded-t-3xl p-5 pb-10 anim-slide-up"
                        style={{ background: '#0d1a35', border: '1px solid rgba(99,130,200,0.15)', borderBottom: 'none' }}>
                        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(99,130,200,0.3)' }} />

                        {modal.type === 'form2jam' && (
                            <FormCatatan initialSlot={modal.slot} existing={modal.existing}
                                onSuccess={() => { reload(); setModal(null); }} onCancel={() => setModal(null)} />
                        )}

                        {modal.type === 'detail2jam' && (
                            <>
                                <DetailCatatan catatan={modal.catatan} onClose={() => setModal(null)} />
                                <button onClick={() => setModal({ type: 'form2jam', slot: modal.catatan.slot, existing: modal.catatan })}
                                    className="mt-3 w-full py-3.5 text-sm font-semibold rounded-2xl transition active:scale-[0.98]"
                                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                                    Edit Data
                                </button>
                                <button onClick={async () => {
                                    if (!confirm('Hapus data ini?')) return;
                                    await deleteCatatan(modal.catatan.id);
                                    reload(); setModal(null);
                                }} className="mt-2 w-full py-3.5 text-sm font-semibold rounded-2xl transition active:scale-[0.98]"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                    Hapus Data
                                </button>
                            </>
                        )}

                        {modal.type === 'formMingguan' && (
                            <FormMingguan existing={modal.existing}
                                onSuccess={() => { reload(); setModal(null); }} onCancel={() => setModal(null)} />
                        )}

                        {modal.type === 'detailMingguan' && (
                            <div>
                                <p className="font-display font-bold text-white text-2xl mb-1">{modal.data.mingguKe}</p>
                                <p className="text-slate-400 text-sm mb-1">{formatTgl(modal.data.tanggalMulai)} — {formatTgl(modal.data.tanggalAkhir)}</p>
                                <p className="text-slate-500 text-xs mb-4">Diisi oleh {modal.data.operatorNama}</p>

                                <div className="rounded-2xl p-4 mb-3 space-y-2" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Pemakaian (kg)</p>
                                    {[{ l: 'PAC', v: modal.data.pemakaianPAC }, { l: 'Kaporit', v: modal.data.pemakaianKaporit }, { l: 'Polimer', v: modal.data.pemakaianPolimer }].map(r => (
                                        <div key={r.l} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(52,211,153,0.1)' }}>
                                            <span className="text-slate-400 text-sm">{r.l}</span>
                                            <span className="text-white font-semibold text-sm">{r.v !== '' ? `${r.v} kg` : '–'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-2xl p-4 mb-3 space-y-2" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Sisa Stok (kg)</p>
                                    {[{ l: 'PAC', v: modal.data.sisaPAC }, { l: 'Kaporit', v: modal.data.sisaKaporit }, { l: 'Polimer', v: modal.data.sisaPolimer }].map(r => (
                                        <div key={r.l} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
                                            <span className="text-slate-400 text-sm">{r.l}</span>
                                            <span className="text-white font-semibold text-sm">{r.v !== '' ? `${r.v} kg` : '–'}</span>
                                        </div>
                                    ))}
                                </div>
                                {modal.data.catatan && <p className="text-sm text-slate-400 italic mb-4">"{modal.data.catatan}"</p>}

                                <button onClick={() => setModal(null)}
                                    className="w-full py-3.5 text-slate-300 font-medium rounded-2xl transition text-sm mb-2"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,130,200,0.15)' }}>
                                    Tutup
                                </button>
                                <button onClick={async () => {
                                    if (!confirm('Hapus laporan ini?')) return;
                                    await deleteMingguan(modal.data.id);
                                    reload(); setModal(null);
                                }} className="w-full py-3 text-sm rounded-2xl transition"
                                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>
                                    Hapus
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
