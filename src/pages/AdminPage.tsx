import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { getCatatan, getUsers, saveUsers, deleteCatatan, generateId } from '../storage';
import type { CatatanWaktu, User } from '../types';
import { SLOTS, getHariOperasi } from '../types';
import DetailCatatan from '../components/DetailLaporan';

type Tab = 'dashboard' | 'laporan' | 'operator';

export default function AdminPage() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState<Tab>('dashboard');
    const [semua, setSemua] = useState<CatatanWaktu[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selected, setSelected] = useState<CatatanWaktu | null>(null);
    const [filterDate, setFilterDate] = useState('');
    const [showFormUser, setShowFormUser] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [formNama, setFormNama] = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState<'admin' | 'operator'>('operator');

    const hariOperasi = getHariOperasi();
    const reload = () => { setSemua(getCatatan()); setUsers(getUsers()); };
    useEffect(() => { reload(); }, []);

    const todayCatatan = semua.filter(c => c.tanggal === hariOperasi);
    const slotMapToday = new Map(todayCatatan.map(c => [c.slot, c]));
    const filledCount = todayCatatan.length;

    const turbValues = todayCatatan.filter(c => c.kekeruhanOlahan !== '').map(c => Number(c.kekeruhanOlahan));
    const avgTurb = turbValues.length > 0 ? turbValues.reduce((a, b) => a + b, 0) / turbValues.length : null;
    const debitValues = todayCatatan.filter(c => c.debit !== '').map(c => Number(c.debit));
    const avgDebit = debitValues.length > 0 ? debitValues.reduce((a, b) => a + b, 0) / debitValues.length : null;

    const filteredSemua = filterDate ? semua.filter(c => c.tanggal === filterDate) : [...semua].reverse();

    const turbColor = (v: number | '') =>
        v === '' ? 'text-slate-500' : Number(v) <= 1 ? 'text-emerald-400' : Number(v) <= 5 ? 'text-amber-400' : 'text-red-400';
    const turbBg = (v: number | '') =>
        v === '' ? '' : Number(v) <= 1 ? 'bg-emerald-500/10' : Number(v) <= 5 ? 'bg-amber-500/10' : 'bg-red-500/10';

    const openEditUser = (u: User) => { setEditUser(u); setFormNama(u.nama); setFormUsername(u.username); setFormPassword(u.password); setFormRole(u.role); setShowFormUser(true); };
    const openNewUser = () => { setEditUser(null); setFormNama(''); setFormUsername(''); setFormPassword(''); setFormRole('operator'); setShowFormUser(true); };
    const saveUser = () => {
        const all = getUsers();
        if (editUser) {
            const idx = all.findIndex(u => u.id === editUser.id);
            if (idx !== -1) all[idx] = { ...editUser, nama: formNama, username: formUsername, password: formPassword, role: formRole };
        } else {
            all.push({ id: generateId(), nama: formNama, username: formUsername, password: formPassword, role: formRole });
        }
        saveUsers(all); setShowFormUser(false); reload();
    };
    const deleteUser = (id: string) => {
        if (id === user!.id) return alert('Tidak bisa menghapus akun sendiri!');
        if (!confirm('Hapus operator ini?')) return;
        saveUsers(getUsers().filter(u => u.id !== id)); reload();
    };

    const tabs = [
        { key: 'dashboard', label: 'Dashboard', icon: (a: boolean) => <svg className={`w-6 h-6 ${a ? 'text-amber-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2 : 1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg> },
        { key: 'laporan', label: 'Laporan', icon: (a: boolean) => <svg className={`w-6 h-6 ${a ? 'text-amber-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2 : 1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { key: 'operator', label: 'Operator', icon: (a: boolean) => <svg className={`w-6 h-6 ${a ? 'text-amber-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2 : 1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-950 flex flex-col">

            {/* Header */}
            <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Logo WTP" className="w-9 h-9 rounded-xl object-contain bg-white/5" />
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Admin WTP</p>
                        <p className="text-amber-400 text-xs mt-0.5">Administrator</p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-300 text-xs font-medium transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    Keluar
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">

                {/* === DASHBOARD === */}
                {tab === 'dashboard' && (
                    <div className="page-enter space-y-4">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            {new Date(hariOperasi + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {/* Stats cards */}
                        <div className="grid grid-cols-3 gap-2.5">
                            <div className="bg-slate-800/60 rounded-2xl border border-blue-500/20 p-3 text-center">
                                <p className="text-2xl font-bold text-white">{filledCount}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">/ 12 Slot</p>
                                <p className="text-[10px] text-blue-400 font-semibold mt-0.5">Terisi</p>
                            </div>
                            <div className={`bg-slate-800/60 rounded-2xl border p-3 text-center ${avgTurb === null ? 'border-slate-700/50' : avgTurb <= 1 ? 'border-emerald-500/20' : avgTurb <= 5 ? 'border-amber-500/20' : 'border-red-500/20'}`}>
                                <p className={`text-2xl font-bold ${avgTurb === null ? 'text-slate-500' : avgTurb <= 1 ? 'text-emerald-400' : avgTurb <= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {avgTurb !== null ? avgTurb.toFixed(1) : '–'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">NTU</p>
                                <p className={`text-[10px] font-semibold mt-0.5 ${avgTurb === null ? 'text-slate-600' : avgTurb <= 1 ? 'text-emerald-400' : avgTurb <= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {avgTurb === null ? 'Turb. Avg' : avgTurb <= 1 ? '✓ Baik' : avgTurb <= 5 ? '⚠ Perhatian' : '✗ Tinggi'}
                                </p>
                            </div>
                            <div className="bg-slate-800/60 rounded-2xl border border-cyan-500/20 p-3 text-center">
                                <p className="text-2xl font-bold text-cyan-300">
                                    {avgDebit !== null ? avgDebit.toFixed(1) : '–'}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">L/dtk</p>
                                <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">Debit Avg</p>
                            </div>
                        </div>

                        {/* Tabel 12 slot hari ini */}
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status Slot Hari Ini</p>
                            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
                                {SLOTS.map((s) => {
                                    const c = slotMapToday.get(s.slot);
                                    return (
                                        <button key={s.slot} onClick={() => c && setSelected(c)}
                                            className={`w-full flex items-center px-4 py-2.5 border-b border-slate-700/30 last:border-0 transition ${c ? 'active:bg-slate-700/30' : ''} ${turbBg(c?.kekeruhanOlahan ?? '')}`}>
                                            <span className="text-slate-400 text-xs font-bold w-12 shrink-0">{s.jam}</span>
                                            {c ? (
                                                <>
                                                    <span className="flex-1 text-xs text-slate-300 truncate">{c.operatorNama}</span>
                                                    <span className={`text-xs font-semibold w-16 text-right ${turbColor(c.kekeruhanOlahan)}`}>
                                                        {c.kekeruhanOlahan !== '' ? `${c.kekeruhanOlahan} NTU` : '–'}
                                                    </span>
                                                    <span className="text-xs text-cyan-400 w-14 text-right">
                                                        {c.debit !== '' ? `${c.debit} L/s` : '–'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">Belum diisi</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* === LAPORAN === */}
                {tab === 'laporan' && (
                    <div className="page-enter space-y-3">
                        <div className="flex gap-2">
                            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                                className="flex-1 px-3 py-3 bg-slate-800/60 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
                            {filterDate && (
                                <button onClick={() => setFilterDate('')} className="px-4 py-3 border border-slate-700 rounded-2xl text-slate-400 active:bg-slate-800 text-sm transition">Reset</button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">{filteredSemua.length} catatan</p>
                        {filteredSemua.map(c => (
                            <button key={c.id} onClick={() => setSelected(c)}
                                className="w-full text-left bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 active:scale-[0.98] transition flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-300 font-bold text-sm w-12 shrink-0">{c.jamLabel}</span>
                                    <div>
                                        <p className="text-white text-sm font-semibold">
                                            {new Date(c.tanggal + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-0.5">{c.operatorNama}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-semibold ${turbColor(c.kekeruhanOlahan)}`}>
                                        {c.kekeruhanOlahan !== '' ? `${c.kekeruhanOlahan} NTU` : '–'}
                                    </p>
                                    <p className="text-xs text-cyan-400">{c.debit !== '' ? `${c.debit} L/s` : ''}</p>
                                </div>
                            </button>
                        ))}
                        {filteredSemua.length === 0 && <p className="text-slate-500 text-sm text-center py-12">Tidak ada data</p>}
                    </div>
                )}

                {/* === KELOLA OPERATOR === */}
                {tab === 'operator' && (
                    <div className="page-enter space-y-3">
                        <button onClick={openNewUser} className="w-full py-3.5 flex items-center justify-center gap-2 bg-amber-500 active:bg-amber-400 text-white font-semibold rounded-2xl transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Operator
                        </button>
                        {users.map(u => (
                            <div key={u.id} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {u.nama.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm truncate">{u.nama}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">@{u.username} · <span className={u.role === 'admin' ? 'text-amber-400' : 'text-blue-400'}>{u.role}</span></p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => openEditUser(u)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700/50 active:bg-slate-700 transition">
                                        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    {u.id !== user!.id && (
                                        <button onClick={() => deleteUser(u.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 active:bg-red-500/20 transition">
                                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-20">
                <div className="flex">
                    {tabs.map(t => {
                        const active = tab === t.key;
                        return (
                            <button key={t.key} onClick={() => { setTab(t.key as Tab); reload(); }}
                                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all active:scale-95">
                                {t.icon(active)}
                                <span className={`text-xs font-semibold ${active ? 'text-amber-400' : 'text-slate-500'}`}>{t.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Modal Detail */}
            {selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
                    <div className="bg-slate-900 border border-slate-700 rounded-t-3xl w-full max-h-[90vh] overflow-y-auto p-5 pb-8">
                        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
                        <DetailCatatan catatan={selected} onClose={() => setSelected(null)} />
                        <button onClick={() => { if (!confirm('Hapus data ini?')) return; deleteCatatan(selected.id); setSelected(null); reload(); }}
                            className="mt-3 w-full py-3 text-sm font-medium text-red-400 border border-red-500/30 active:bg-red-500/10 rounded-2xl transition">
                            Hapus Data Ini
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Form User */}
            {showFormUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center">
                    <div className="bg-slate-900 border border-slate-700 rounded-t-3xl w-full p-5 pb-8">
                        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
                        <h3 className="text-white font-bold text-lg mb-5">{editUser ? 'Edit Operator' : 'Tambah Operator'}</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Nama Lengkap', val: formNama, set: setFormNama, ph: 'Nama lengkap' },
                                { label: 'Username', val: formUsername, set: setFormUsername, ph: 'username' },
                                { label: 'Password', val: formPassword, set: setFormPassword, ph: 'password' },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                                    <input type="text" value={f.val} onChange={e => f.set(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                                        placeholder={f.ph} />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5">Role</label>
                                <select value={formRole} onChange={e => setFormRole(e.target.value as 'admin' | 'operator')}
                                    className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition">
                                    <option value="operator">Operator</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowFormUser(false)} className="flex-1 py-3.5 text-slate-400 border border-slate-700 rounded-2xl active:bg-slate-800 text-sm font-medium transition">Batal</button>
                            <button onClick={saveUser} disabled={!formNama || !formUsername || !formPassword}
                                className="flex-1 py-3.5 bg-amber-500 active:bg-amber-400 disabled:opacity-50 text-white rounded-2xl font-semibold transition">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
