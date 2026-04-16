import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { saveCatatanListrik, generateId } from '../storage';
import type { CatatanListrik } from '../types';
import { getHariOperasi } from '../types';

interface Props {
    existing?: CatatanListrik | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const toNum = (s: string): number | '' => { const n = parseFloat(s); return isNaN(n) ? '' : n; };

function NumInput({ label, value, setter, unit, hint }: {
    label: string; value: string; setter: (v: string) => void; unit: string; hint?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
            {hint && <p className="text-[10px] text-slate-600 mb-2">{hint}</p>}
            <div className="relative">
                <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    value={value}
                    onChange={e => setter(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="input-glass pr-16"
                    placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold"
                    style={{ background: 'rgba(99,130,200,0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                    {unit}
                </span>
            </div>
        </div>
    );
}

export default function FormListrik({ existing, onSuccess, onCancel }: Props) {
    const { user } = useAuth();
    const tanggal = getHariOperasi();

    const [wbp, setWbp]   = useState(existing?.wbp?.toString() ?? '');
    const [lwbp, setLwbp] = useState(existing?.lwbp?.toString() ?? '');
    const [kvarh, setKvarh] = useState(existing?.kvarh?.toString() ?? '');
    const [catatan, setCatatan] = useState(existing?.catatan ?? '');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data: CatatanListrik = {
                id: existing?.id ?? generateId(),
                tanggal,
                operatorId: user!.id,
                operatorNama: user!.nama,
                cabang: user!.cabang,
                createdAt: new Date().toISOString(),
                wbp: toNum(wbp),
                lwbp: toNum(lwbp),
                kvarh: toNum(kvarh),
                catatan,
            };
            await saveCatatanListrik(data);
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onSuccess(); }, 900);
        } catch (err) {
            console.error(err);
            alert('Gagal menyimpan data listrik');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-display font-bold text-white text-xl">⚡ Input Listrik Harian</p>
                    <p className="text-slate-500 text-xs mt-0.5">Dicatat setiap hari, pukul 08:00</p>
                </div>
                <button type="button" onClick={onCancel} className="p-2 rounded-xl text-slate-400 transition"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Tanggal */}
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.15)' }}>
                <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white font-semibold text-sm">
                    {new Date(tanggal + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(234,179,8,0.12)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.2)' }}>
                    Otomatis
                </span>
            </div>

            {/* Operator info */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.1)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0e7490, #1d4ed8)' }}>
                    {user?.nama?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">{user?.nama}</p>
                    {user?.cabang && <p className="text-[10px] text-amber-400">📍 {user.cabang}</p>}
                </div>
            </div>

            {/* Data Listrik */}
            <div className="rounded-2xl p-4 space-y-4"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #b45309)' }} />
                    <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">⚡ Data Kelistrikan</p>
                </div>

                <NumInput
                    label="WBP — Waktu Beban Puncak"
                    value={wbp} setter={setWbp} unit="kWh"
                    hint="Konsumsi listrik saat jam beban puncak"
                />
                <NumInput
                    label="LWBP — Luar Waktu Beban Puncak"
                    value={lwbp} setter={setLwbp} unit="kWh"
                    hint="Konsumsi listrik di luar jam puncak"
                />
                <NumInput
                    label="KVARH"
                    value={kvarh} setter={setKvarh} unit="kVARh"
                    hint="Daya reaktif total"
                />
            </div>

            {/* Summary calculated */}
            {(wbp !== '' || lwbp !== '') && (
                <div className="rounded-2xl px-4 py-3 flex items-center justify-between"
                    style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <p className="text-slate-400 text-xs font-medium">Total WBP + LWBP</p>
                    <p className="text-blue-300 font-bold text-sm font-display">
                        {((parseFloat(wbp) || 0) + (parseFloat(lwbp) || 0)).toFixed(2)} kWh
                    </p>
                </div>
            )}

            {/* Catatan */}
            <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Catatan (opsional)</label>
                <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                    className="input-glass resize-none" placeholder="Tambahkan catatan..." />
            </div>

            {/* Success */}
            {success && (
                <div className="flex gap-2 items-center rounded-2xl px-4 py-3"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-emerald-400 text-sm font-semibold">Data listrik berhasil disimpan!</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button type="button" onClick={onCancel}
                    className="flex-1 py-4 text-slate-400 rounded-2xl text-sm font-semibold transition"
                    style={{ border: '1px solid rgba(99,130,200,0.2)' }}>
                    Batal
                </button>
                <button type="submit" disabled={saving}
                    className="flex-[2] py-4 text-white font-display font-bold rounded-2xl transition active:scale-[0.98] disabled:opacity-60"
                    style={{
                        background: 'linear-gradient(135deg, #b45309, #d97706)',
                        boxShadow: '0 4px 20px rgba(180,83,9,0.35)',
                    }}>
                    {saving ? 'Menyimpan...' : (existing ? 'Simpan Perubahan' : 'Simpan Data Listrik')}
                </button>
            </div>
        </form>
    );
}
