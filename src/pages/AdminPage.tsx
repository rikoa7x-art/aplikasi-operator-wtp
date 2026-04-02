import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getCatatan, getUsers, saveUsers, getMingguan } from '../storage';
import type { CatatanWaktu, LaporanMingguan, User } from '../types';
import { SLOTS, getHariOperasi, getCurrentWeekRange } from '../types';
import DetailCatatan from '../components/DetailLaporan';
import { generateId } from '../storage';

type Tab = 'dashboard' | 'laporan' | 'mingguan' | 'operator';

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

    const hariOperasi = getHariOperasi();
    const weekInfo = getCurrentWeekRange();

    useEffect(() => {
        setSemua(getCatatan());
        setUsers(getUsers());
        setMingguanAll(getMingguan());
    }, [tab]);

    const hari = semua.filter(c => c.tanggal === hariOperasi);
    const slotMapToday = new Map(hari.map(c => [c.slot, c]));
    const filledToday = hari.length;

    const avgNtu = hari.filter(c => c.ntuOlahan !== '').length > 0
        ? (hari.filter(c => c.ntuOlahan !== '').reduce((s, c) => s + Number(c.ntuOlahan), 0) / hari.filter(c => c.ntuOlahan !== '').length).toFixed(1)
        : '–';
    const avgDebit = hari.filter(c => c.debitProduksi !== '').length > 0
        ? (hari.filter(c => c.debitProduksi !== '').reduce((s, c) => s + Number(c.debitProduksi), 0) / hari.filter(c => c.debitProduksi !== '').length).toFixed(1)
        : '–';

    const formatTgl = (d: string) => new Date(d + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const currentWeekMingguan = mingguanAll.filter(m => m.mingguKe === weekInfo.mingguKe);

    const turbColor = (v: number | '') => v === '' ? 'text-slate-500' : Number(v) <= 1 ? 'text-emerald-400' : Number(v) <= 5 ? 'text-amber-400' : 'text-red-400';

    const addUser = () => {
        if (!newNama.trim() || !newUser.trim() || !newPass.trim()) return;
        const updated = [...users, { id: generateId(), username: newUser.toLowerCase().trim(), password: newPass, nama: newNama.trim(), role: 'operator' as const }];
        saveUsers(updated); setUsers(updated);
        setNewNama(''); setNewUser(''); setNewPass(''); setShowAddUser(false);
    };
    const deleteUser = (id: string) => {
        if (!confirm('Hapus operator ini?')) return;
        const updated = users.filter(u => u.id !== id);
        saveUsers(updated); setUsers(updated);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 flex flex-col">

            <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Logo WTP" className="w-9 h-9 rounded-xl object-contain bg-white/5" />
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Admin WTP</p>
                        <p className="text-amber-400 text-xs mt-0.5">Administrator</p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-medium transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
                    Keluar
                </button>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/60 px-2 sticky top-[72px] z-10">
                {[
                    { key: 'dashboard' as Tab, label: 'Dashboard' },
                    { key: 'laporan' as Tab, label: 'Laporan' },
                    { key: 'mingguan' as Tab, label: 'Mingguan' },
                    { key: 'operator' as Tab, label: 'Operator' },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${tab === t.key ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6">

                {/* === DASHBOARD === */}
                {tab === 'dashboard' && (
                    <div className="page-enter space-y-4">
                        <p className="text-lg text-white font-bold">
                            {new Date(hariOperasi + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-800/60 rounded-2xl p-3 text-center border border-slate-700/50">
                                <p className="text-2xl font-extrabold text-blue-400">{filledToday}<span className="text-sm text-slate-500">/12</span></p>
                                <p className="text-[10px] text-slate-400 mt-1">Slot Terisi</p>
                            </div>
                            <div className="bg-slate-800/60 rounded-2xl p-3 text-center border border-slate-700/50">
                                <p className="text-2xl font-extrabold text-cyan-400">{avgNtu}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Rata² NTU</p>
                            </div>
                            <div className="bg-slate-800/60 rounded-2xl p-3 text-center border border-slate-700/50">
                                <p className="text-2xl font-extrabold text-emerald-400">{avgDebit}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Rata² Debit</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status Slot Hari Ini</p>
                            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
                                {SLOTS.map((s) => {
                                    const c = slotMapToday.get(s.slot);
                                    return (
                                        <button key={s.slot} onClick={() => c && setSelected(c)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-700/30 last:border-0 ${c ? 'active:bg-slate-700/50' : ''} transition`}>
                                            <span className="text-sm font-bold text-slate-300 w-12 shrink-0">{s.jam}</span>
                                            {c ? (
                                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                                    <span className={`text-sm font-semibold ${turbColor(c.ntuOlahan)}`}>{c.ntuOlahan !== '' ? `${c.ntuOlahan} NTU` : '–'}</span>
                                                    <span className="text-xs text-slate-500">{c.debitProduksi !== '' ? `${c.debitProduksi} L/s` : ''}</span>
                                                    {c.foto && <svg className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                                    <span className="text-xs text-slate-500 ml-auto shrink-0">{c.operatorNama}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-600">Belum diisi</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* === LAPORAN 2-JAM === */}
                {tab === 'laporan' && (
                    <div className="page-enter space-y-4">
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Semua Catatan Per-2-Jam</p>
                        {semua.length === 0 ? (
                            <p className="text-center text-slate-500 text-sm py-10">Belum ada data</p>
                        ) : (
                            [...new Set(semua.map(c => c.tanggal))].sort((a, b) => b.localeCompare(a)).map(tgl => {
                                const items = semua.filter(c => c.tanggal === tgl).sort((a, b) => a.slot - b.slot);
                                return (
                                    <div key={tgl}>
                                        <p className="text-xs font-semibold text-slate-400 mb-2">
                                            {new Date(tgl + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            <span className="ml-2 text-slate-600">({items.length})</span>
                                        </p>
                                        <div className="space-y-1.5">
                                            {items.map(c => (
                                                <button key={c.id} onClick={() => setSelected(c)}
                                                    className="w-full text-left bg-slate-800/60 rounded-2xl border border-slate-700/50 px-4 py-3 active:scale-[0.98] transition flex items-center gap-3">
                                                    <span className="text-blue-300 font-bold text-sm w-12 shrink-0">{c.jamLabel}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-semibold truncate ${turbColor(c.ntuOlahan)}`}>{c.ntuOlahan !== '' ? `${c.ntuOlahan} NTU` : '–'}</p>
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

                {/* === LAPORAN MINGGUAN === */}
                {tab === 'mingguan' && (
                    <div className="page-enter space-y-4">
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Laporan Bahan Kimia Mingguan</p>

                        {/* Current week summary */}
                        <div className="bg-amber-500/10 rounded-2xl border border-amber-500/30 p-4">
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Minggu Ini — {weekInfo.mingguKe}</p>
                            <p className="text-slate-400 text-xs mt-0.5 mb-3">{formatTgl(weekInfo.mulai)} — {formatTgl(weekInfo.akhir)}</p>
                            {currentWeekMingguan.length > 0 ? (
                                <div className="space-y-2">
                                    {currentWeekMingguan.map(m => (
                                        <button key={m.id} onClick={() => setSelectedMingguan(m)}
                                            className="w-full text-left bg-slate-800/50 rounded-xl p-3 active:scale-[0.98] transition flex items-center justify-between">
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

                        {/* All weekly reports sorted */}
                        {mingguanAll.filter(m => m.mingguKe !== weekInfo.mingguKe).length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Riwayat Mingguan</p>
                                <div className="space-y-2">
                                    {[...new Set(mingguanAll.filter(m => m.mingguKe !== weekInfo.mingguKe).map(m => m.mingguKe))].sort((a, b) => b.localeCompare(a)).map(wk => {
                                        const items = mingguanAll.filter(m => m.mingguKe === wk);
                                        const first = items[0];
                                        return (
                                            <div key={wk} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4">
                                                <p className="text-white font-semibold text-sm">{wk}</p>
                                                <p className="text-slate-500 text-xs mb-2">{formatTgl(first.tanggalMulai)} — {formatTgl(first.tanggalAkhir)}</p>
                                                {items.map(m => (
                                                    <button key={m.id} onClick={() => setSelectedMingguan(m)}
                                                        className="w-full text-left py-2 border-t border-slate-700/30 flex items-center justify-between active:bg-slate-700/30 transition">
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

                {/* === OPERATOR === */}
                {tab === 'operator' && (
                    <div className="page-enter space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Akun Operator</p>
                            <button onClick={() => setShowAddUser(true)} className="flex items-center gap-1 px-3 py-2 bg-blue-600 active:bg-blue-700 text-white text-xs font-medium rounded-xl transition">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Tambah
                            </button>
                        </div>
                        <div className="space-y-2">
                            {users.filter(u => u.role === 'operator').map(u => (
                                <div key={u.id} className="flex items-center justify-between bg-slate-800/60 rounded-2xl border border-slate-700/50 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{u.nama.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">{u.nama}</p>
                                            <p className="text-slate-500 text-xs mt-0.5">@{u.username} · {u.password}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteUser(u.id)} className="p-2 text-red-400 active:bg-red-500/10 rounded-xl transition">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Detail 2-Jam */}
            {selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
                    <div className="bg-slate-900 border border-slate-700 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto p-5 pb-10">
                        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />
                        <DetailCatatan catatan={selected} onClose={() => setSelected(null)} />
                    </div>
                </div>
            )}

            {/* Modal Detail Mingguan */}
            {selectedMingguan && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setSelectedMingguan(null); }}>
                    <div className="bg-slate-900 border border-slate-700 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto p-5 pb-10">
                        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />
                        <p className="text-white font-bold text-xl mb-1">{selectedMingguan.mingguKe}</p>
                        <p className="text-slate-400 text-sm mb-1">{formatTgl(selectedMingguan.tanggalMulai)} — {formatTgl(selectedMingguan.tanggalAkhir)}</p>
                        <p className="text-slate-500 text-xs mb-4">Diisi oleh {selectedMingguan.operatorNama}</p>

                        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 space-y-2 mb-3">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Pemakaian (kg)</p>
                            {[{ l: 'PAC', v: selectedMingguan.pemakaianPAC }, { l: 'Kaporit', v: selectedMingguan.pemakaianKaporit }, { l: 'Polimer', v: selectedMingguan.pemakaianPolimer }].map(r => (
                                <div key={r.l} className="flex justify-between py-1.5 border-b border-slate-700/30 last:border-0"><span className="text-slate-400 text-sm">{r.l}</span><span className="text-white font-semibold text-sm">{r.v !== '' ? `${r.v} kg` : '–'}</span></div>
                            ))}
                        </div>
                        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 space-y-2 mb-3">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Sisa Stok (kg)</p>
                            {[{ l: 'PAC', v: selectedMingguan.sisaPAC }, { l: 'Kaporit', v: selectedMingguan.sisaKaporit }, { l: 'Polimer', v: selectedMingguan.sisaPolimer }].map(r => (
                                <div key={r.l} className="flex justify-between py-1.5 border-b border-slate-700/30 last:border-0"><span className="text-slate-400 text-sm">{r.l}</span><span className="text-white font-semibold text-sm">{r.v !== '' ? `${r.v} kg` : '–'}</span></div>
                            ))}
                        </div>
                        {selectedMingguan.catatan && <p className="text-sm text-slate-400 italic mb-3">"{selectedMingguan.catatan}"</p>}

                        <button onClick={() => setSelectedMingguan(null)} className="w-full py-3.5 bg-slate-800 active:bg-slate-700 text-slate-300 font-medium rounded-2xl transition text-sm">Tutup</button>
                    </div>
                </div>
            )}

            {/* Modal Add User */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) setShowAddUser(false); }}>
                    <div className="bg-slate-900 border border-slate-700 rounded-t-3xl w-full p-5 pb-10">
                        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-5" />
                        <p className="text-white font-bold text-lg mb-4">Tambah Operator</p>
                        <div className="space-y-3">
                            <input value={newNama} onChange={e => setNewNama(e.target.value)} placeholder="Nama lengkap"
                                className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Username"
                                className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Password"
                                className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setShowAddUser(false)} className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl text-sm font-medium">Batal</button>
                            <button onClick={addUser} className="flex-[2] py-4 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-2xl">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
