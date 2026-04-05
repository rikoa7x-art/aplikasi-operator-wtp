import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getCatatan, getUsers, saveUsers, getMingguan } from '../storage';
import type { CatatanWaktu, LaporanMingguan, User } from '../types';
import { SLOTS, getHariOperasi, getCurrentWeekRange } from '../types';
import DetailCatatan from '../components/DetailLaporan';
import { generateId } from '../storage';

type Tab = 'dashboard' | 'laporan' | 'mingguan' | 'operator';


const formatTgl  = (d: string) => new Date(d + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

/* ── Stat Card ─────────────────────────────────────────────────── */
interface StatCardProps { label: string; value: string | number; sub?: string; accent: string; bg: string; border: string; icon: React.ReactNode }
function StatCard({ label, value, sub, accent, bg, border, icon }: StatCardProps) {
    return (
        <div className="stat-card rounded-2xl p-4 relative overflow-hidden" style={{ background: bg, border: `1.5px solid ${border}` }}>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${bg.replace('0.08', '0.2')} 0%, transparent 70%)` }} />
            <div className={`mb-2 ${accent}`}>{icon}</div>
            <p className={`font-display font-extrabold text-2xl ${accent}`}>{value}</p>
            {sub && <p className="text-slate-500 text-[10px] font-semibold">{sub}</p>}
            <p className="text-slate-400 text-xs mt-1 font-medium">{label}</p>
        </div>
    );
}

/* ── NTU Badge ─────────────────────────────────────────────────── */
function NtuBadge({ v }: { v: number | '' }) {
    if (v === '') return <span className="text-slate-600 text-xs">–</span>;
    const n = Number(v);
    const [bg, color] = n <= 1 ? ['rgba(52,211,153,0.12)', '#34d399'] : n <= 5 ? ['rgba(245,158,11,0.12)', '#f59e0b'] : ['rgba(248,113,113,0.12)', '#f87171'];
    return (
        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: bg, color }}>
            {v} NTU
        </span>
    );
}

export default function AdminPage() {
    const { logout } = useAuth();
    const [tab, setTab] = useState<Tab>('dashboard');
    const [semua, setSemua] = useState<CatatanWaktu[]>([]);
    const [mingguanAll, setMingguanAll] = useState<LaporanMingguan[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selected, setSelected] = useState<CatatanWaktu | null>(null);
    const [selectedMingguan, setSelectedMingguan] = useState<LaporanMingguan | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newNama, setNewNama] = useState('');
    const [newUser, setNewUser] = useState('');
    const [newPass, setNewPass] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const hariOperasi = getHariOperasi();
    const weekInfo = getCurrentWeekRange();

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [c, u, m] = await Promise.all([getCatatan(), getUsers(), getMingguan()]);
            setSemua(c); setUsers(u); setMingguanAll(m);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };
    useEffect(() => { loadData(); }, [tab]);

    const hari = semua.filter(c => c.tanggal === hariOperasi);
    const slotMapToday = new Map(hari.map(c => [c.slot, c]));
    const filledToday = hari.length;

    const avgNtu = hari.filter(c => c.ntuOlahan !== '').length > 0
        ? (hari.filter(c => c.ntuOlahan !== '').reduce((s, c) => s + Number(c.ntuOlahan), 0) / hari.filter(c => c.ntuOlahan !== '').length).toFixed(1)
        : '–';
    const avgDebit = hari.filter(c => c.debitProduksi !== '').length > 0
        ? (hari.filter(c => c.debitProduksi !== '').reduce((s, c) => s + Number(c.debitProduksi), 0) / hari.filter(c => c.debitProduksi !== '').length).toFixed(1)
        : '–';

    const currentWeekMingguan = mingguanAll.filter(m => m.mingguKe === weekInfo.mingguKe);

    const addUser = async () => {
        if (!newNama.trim() || !newUser.trim() || !newPass.trim()) return;
        setIsLoading(true);
        const updated = [...users, { id: generateId(), username: newUser.toLowerCase().trim(), password: newPass, nama: newNama.trim(), role: 'operator' as const }];
        await saveUsers(updated);
        setUsers(updated);
        setNewNama(''); setNewUser(''); setNewPass(''); setShowAddUser(false);
        setIsLoading(false);
    };
    const deleteUser = async (id: string) => {
        if (!confirm('Hapus operator ini?')) return;
        setIsLoading(true);
        const updated = users.filter(u => u.id !== id);
        await saveUsers(updated);
        setUsers(updated);
        setIsLoading(false);
    };

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'laporan',   label: 'Laporan',   icon: '📋' },
        { key: 'mingguan',  label: 'Mingguan',  icon: '📆' },
        { key: 'operator',  label: 'Operator',  icon: '👷' },
    ];

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #060d1f 0%, #0d1a35 60%, #071628 100%)' }}>

            {/* ── Header ─────────────────────────────────────────── */}
            <header className="sticky top-0 z-20 px-4 pt-4 pb-3 flex items-center justify-between"
                style={{ background: 'rgba(6,13,31,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,130,200,0.12)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #92400e, #b45309)', boxShadow: '0 0 12px rgba(180,83,9,0.4)' }}>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-tight">Admin WTP</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                            Administrator
                        </span>
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

            {/* ── Tab Bar ────────────────────────────────────────── */}
            <div className="sticky z-10 px-4 py-2 flex gap-2 overflow-x-auto"
                style={{ top: '72px', background: 'rgba(6,13,31,0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(99,130,200,0.1)' }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0"
                        style={tab === t.key ? {
                            background: 'rgba(29,78,216,0.2)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59,130,246,0.3)',
                            boxShadow: '0 0 12px rgba(59,130,246,0.15)'
                        } : {
                            background: 'transparent',
                            color: '#64748b',
                            border: '1px solid transparent'
                        }}>
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Main ───────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto px-4 pt-5 pb-8 relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(8px)' }}>
                        <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin" />
                    </div>
                )}

                {/* ════ DASHBOARD ════ */}
                {tab === 'dashboard' && (
                    <div className="page-enter space-y-5">
                        <div>
                            <p className="font-display font-bold text-white text-lg">
                                {new Date(hariOperasi + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">Ringkasan operasi hari ini</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 stagger-children">
                            <StatCard
                                label="Slot Terisi" value={filledToday} sub={`dari 12`}
                                accent="text-blue-400" bg="rgba(29,78,216,0.08)" border="rgba(59,130,246,0.2)"
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>}
                            />
                            <StatCard
                                label="Rata² NTU" value={avgNtu}
                                accent="text-cyan-400" bg="rgba(8,145,178,0.08)" border="rgba(34,211,238,0.2)"
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            />
                            <StatCard
                                label="Rata² Debit" value={avgDebit} sub="L/dtk"
                                accent="text-emerald-400" bg="rgba(6,95,70,0.08)" border="rgba(52,211,153,0.2)"
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            />
                        </div>

                        {/* Slot status list */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status Slot Hari Ini</p>
                            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,130,200,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                                {SLOTS.map((s, idx) => {
                                    const c = slotMapToday.get(s.slot);
                                    return (
                                        <button key={s.slot} onClick={() => c && setSelected(c)}
                                            className="w-full flex items-center gap-3 px-4 py-3.5 transition"
                                            style={{ borderBottom: idx < SLOTS.length - 1 ? '1px solid rgba(99,130,200,0.07)' : 'none', background: c ? 'transparent' : 'transparent' }}>
                                            <div className="w-10 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: c ? 'rgba(52,211,153,0.1)' : 'rgba(99,130,200,0.06)', border: `1px solid ${c ? 'rgba(52,211,153,0.2)' : 'rgba(99,130,200,0.1)'}` }}>
                                                <span className={`text-xs font-bold font-display ${c ? 'text-emerald-400' : 'text-slate-600'}`}>{s.jam}</span>
                                            </div>
                                            {c ? (
                                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                                    <NtuBadge v={c.ntuOlahan} />
                                                    {c.debitProduksi !== '' && <span className="text-xs text-slate-500">{c.debitProduksi} L/s</span>}
                                                    {c.foto && <svg className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                                    <span className="text-xs text-slate-500 ml-auto shrink-0 truncate max-w-[80px]">{c.operatorNama}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-700 font-medium">Belum diisi</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ LAPORAN 2-JAM ════ */}
                {tab === 'laporan' && (
                    <div className="page-enter space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semua Catatan Per-2-Jam</p>
                        {semua.length === 0 ? (
                            <div className="flex flex-col items-center py-16 gap-3 text-slate-600">
                                <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <p className="text-sm">Belum ada data</p>
                            </div>
                        ) : (
                            [...new Set(semua.map(c => c.tanggal))].sort((a, b) => b.localeCompare(a)).map(tgl => {
                                const items = semua.filter(c => c.tanggal === tgl).sort((a, b) => a.slot - b.slot);
                                return (
                                    <div key={tgl}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-xs font-bold text-slate-400">
                                                {new Date(tgl + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                style={{ background: 'rgba(99,130,200,0.1)', color: '#64748b', border: '1px solid rgba(99,130,200,0.15)' }}>
                                                {items.length}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {items.map(c => (
                                                <button key={c.id} onClick={() => setSelected(c)}
                                                    className="w-full text-left rounded-2xl px-4 py-3 active:scale-[0.98] transition flex items-center gap-3"
                                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.1)' }}>
                                                    <div className="w-10 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                        style={{ background: 'rgba(29,78,216,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                                                        <span className="text-blue-300 font-bold text-xs font-display">{c.jamLabel}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <NtuBadge v={c.ntuOlahan} />
                                                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{c.operatorNama}</p>
                                                    </div>
                                                    {c.foto && <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                                    <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ════ LAPORAN MINGGUAN ════ */}
                {tab === 'mingguan' && (
                    <div className="page-enter space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Laporan Bahan Kimia Mingguan</p>

                        {/* Current week */}
                        <div className="rounded-2xl p-4" style={{ background: 'rgba(146,64,14,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Minggu Ini — {weekInfo.mingguKe}</p>
                            <p className="text-slate-400 text-xs mt-0.5 mb-3">{formatTgl(weekInfo.mulai)} — {formatTgl(weekInfo.akhir)}</p>
                            {currentWeekMingguan.length > 0 ? (
                                <div className="space-y-2">
                                    {currentWeekMingguan.map(m => (
                                        <button key={m.id} onClick={() => setSelectedMingguan(m)}
                                            className="w-full text-left rounded-xl p-3 active:scale-[0.98] transition flex items-center justify-between"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,130,200,0.1)' }}>
                                            <div>
                                                <p className="text-white text-sm font-semibold">{m.operatorNama}</p>
                                                <p className="text-slate-500 text-xs mt-0.5">
                                                    PAC: {m.pemakaianPAC !== '' ? `${m.pemakaianPAC}kg` : '–'} · Kaporit: {m.pemakaianKaporit !== '' ? `${m.pemakaianKaporit}kg` : '–'} · Polimer: {m.pemakaianPolimer !== '' ? `${m.pemakaianPolimer}kg` : '–'}
                                                </p>
                                            </div>
                                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">Belum ada laporan untuk minggu ini</p>
                            )}
                        </div>

                        {/* Historical */}
                        {mingguanAll.filter(m => m.mingguKe !== weekInfo.mingguKe).length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Riwayat Mingguan</p>
                                <div className="space-y-2">
                                    {[...new Set(mingguanAll.filter(m => m.mingguKe !== weekInfo.mingguKe).map(m => m.mingguKe))].sort((a, b) => b.localeCompare(a)).map(wk => {
                                        const items = mingguanAll.filter(m => m.mingguKe === wk);
                                        const first = items[0];
                                        return (
                                            <div key={wk} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.1)' }}>
                                                <p className="text-white font-semibold text-sm font-display">{wk}</p>
                                                <p className="text-slate-500 text-xs mb-3">{formatTgl(first.tanggalMulai)} — {formatTgl(first.tanggalAkhir)}</p>
                                                {items.map(m => (
                                                    <button key={m.id} onClick={() => setSelectedMingguan(m)}
                                                        className="w-full text-left py-2.5 border-t flex items-center justify-between active:opacity-70 transition"
                                                        style={{ borderColor: 'rgba(99,130,200,0.1)' }}>
                                                        <span className="text-slate-300 text-sm">{m.operatorNama}</span>
                                                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ════ OPERATOR ════ */}
                {tab === 'operator' && (
                    <div className="page-enter space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akun Operator</p>
                            <button onClick={() => setShowAddUser(true)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', boxShadow: '0 4px 12px rgba(14,116,144,0.3)' }}>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Tambah
                            </button>
                        </div>
                        <div className="space-y-2">
                            {users.filter(u => u.role === 'operator').map((u, idx) => (
                                <div key={u.id} className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(99,130,200,0.12)',
                                        animation: `stagger-in 0.25s ease-out ${idx * 0.08}s both`
                                    }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white text-base"
                                            style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)' }}>
                                            {u.nama.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{u.nama}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">@{u.username} · {u.password}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteUser(u.id)}
                                        className="p-2 rounded-xl transition active:scale-95"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* ── Modal Detail 2-Jam ──────────────────────────────── */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
                    <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-5 pb-10 anim-slide-up"
                        style={{ background: '#0d1a35', border: '1px solid rgba(99,130,200,0.15)', borderBottom: 'none' }}>
                        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(99,130,200,0.3)' }} />
                        <DetailCatatan catatan={selected} onClose={() => setSelected(null)} />
                    </div>
                </div>
            )}

            {/* ── Modal Detail Mingguan ───────────────────────────── */}
            {selectedMingguan && (
                <div className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={e => { if (e.target === e.currentTarget) setSelectedMingguan(null); }}>
                    <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl p-5 pb-10 anim-slide-up"
                        style={{ background: '#0d1a35', border: '1px solid rgba(99,130,200,0.15)', borderBottom: 'none' }}>
                        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(99,130,200,0.3)' }} />
                        <p className="font-display font-bold text-white text-2xl mb-1">{selectedMingguan.mingguKe}</p>
                        <p className="text-slate-400 text-sm mb-1">{formatTgl(selectedMingguan.tanggalMulai)} — {formatTgl(selectedMingguan.tanggalAkhir)}</p>
                        <p className="text-slate-500 text-xs mb-4">Diisi oleh {selectedMingguan.operatorNama}</p>
                        <div className="rounded-2xl p-4 space-y-2 mb-3" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Pemakaian (kg)</p>
                            {[{ l: 'PAC', v: selectedMingguan.pemakaianPAC }, { l: 'Kaporit', v: selectedMingguan.pemakaianKaporit }, { l: 'Polimer', v: selectedMingguan.pemakaianPolimer }].map(r => (
                                <div key={r.l} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(52,211,153,0.1)' }}>
                                    <span className="text-slate-400 text-sm">{r.l}</span>
                                    <span className="text-white font-semibold text-sm">{r.v !== '' ? `${r.v} kg` : '–'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl p-4 space-y-2 mb-3" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Sisa Stok (kg)</p>
                            {[{ l: 'PAC', v: selectedMingguan.sisaPAC }, { l: 'Kaporit', v: selectedMingguan.sisaKaporit }, { l: 'Polimer', v: selectedMingguan.sisaPolimer }].map(r => (
                                <div key={r.l} className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
                                    <span className="text-slate-400 text-sm">{r.l}</span>
                                    <span className="text-white font-semibold text-sm">{r.v !== '' ? `${r.v} kg` : '–'}</span>
                                </div>
                            ))}
                        </div>
                        {selectedMingguan.catatan && <p className="text-sm text-slate-400 italic mb-4">"{selectedMingguan.catatan}"</p>}
                        <button onClick={() => setSelectedMingguan(null)}
                            className="w-full py-3.5 text-slate-300 font-medium rounded-2xl transition text-sm"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,130,200,0.15)' }}>
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* ── Modal Add User ──────────────────────────────────── */}
            {showAddUser && (
                <div className="fixed inset-0 z-50 flex items-end justify-center"
                    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowAddUser(false); }}>
                    <div className="w-full rounded-t-3xl p-5 pb-10 anim-slide-up"
                        style={{ background: '#0d1a35', border: '1px solid rgba(99,130,200,0.15)', borderBottom: 'none' }}>
                        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(99,130,200,0.3)' }} />
                        <p className="font-display font-bold text-white text-xl mb-5">Tambah Operator</p>
                        <div className="space-y-3">
                            {[
                                { val: newNama, set: setNewNama, ph: 'Nama lengkap' },
                                { val: newUser, set: setNewUser, ph: 'Username' },
                                { val: newPass, set: setNewPass, ph: 'Password' },
                            ].map(f => (
                                <input key={f.ph} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                                    className="input-glass" />
                            ))}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowAddUser(false)}
                                className="flex-1 py-4 rounded-2xl text-slate-400 text-sm font-medium transition"
                                style={{ border: '1px solid rgba(99,130,200,0.2)' }}>
                                Batal
                            </button>
                            <button onClick={addUser}
                                className="flex-[2] py-4 text-white font-bold rounded-2xl transition active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)', boxShadow: '0 4px 16px rgba(14,116,144,0.3)' }}>
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
