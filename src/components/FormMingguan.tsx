import { useState } from 'react';
import type { LaporanMingguan } from '../types';
import { getCurrentWeekRange } from '../types';
import { useAuth } from '../AuthContext';
import { getMingguan, saveMingguanObj, generateId } from '../storage';

interface Props {
    existing?: LaporanMingguan | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const toNum = (s: string): number | '' => { const n = parseFloat(s); return isNaN(n) ? '' : n; };

function NumInput({ label, value, setter, unit, accent = '#22d3ee' }: {
    label: string; value: string; setter: (v: string) => void; unit: string; accent?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">{label}</label>
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
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold"
                    style={{ color: accent, background: `${accent}18`, padding: '2px 6px', borderRadius: '6px' }}>
                    {unit}
                </span>
            </div>
        </div>
    );
}

export default function FormMingguan({ existing, onSuccess, onCancel }: Props) {
    const { user } = useAuth();
    const week = getCurrentWeekRange();

    const [mingguKe] = useState(existing?.mingguKe ?? week.mingguKe);
    const [tanggalMulai] = useState(existing?.tanggalMulai ?? week.mulai);
    const [tanggalAkhir] = useState(existing?.tanggalAkhir ?? week.akhir);

    const [pemakaianPAC, setPemakaianPAC] = useState(existing?.pemakaianPAC?.toString() ?? '');
    const [pemakaianKaporit, setPemakaianKaporit] = useState(existing?.pemakaianKaporit?.toString() ?? '');
    const [pemakaianPolimer, setPemakaianPolimer] = useState(existing?.pemakaianPolimer?.toString() ?? '');
    const [sisaPAC, setSisaPAC] = useState(existing?.sisaPAC?.toString() ?? '');
    const [sisaKaporit, setSisaKaporit] = useState(existing?.sisaKaporit?.toString() ?? '');
    const [sisaPolimer, setSisaPolimer] = useState(existing?.sisaPolimer?.toString() ?? '');
    const [catatan, setCatatan] = useState(existing?.catatan ?? '');
    const [success, setSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const formatTgl = (d: string) => new Date(d + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        setSaveError('');
        try {
            const all = await getMingguan();
            const data: LaporanMingguan = {
                id: existing?.id ?? generateId(), mingguKe, tanggalMulai, tanggalAkhir,
                operatorId: user!.id, operatorNama: user!.nama,
                operatorCabang: user!.cabang ?? '',
                createdAt: new Date().toISOString(),
                pemakaianPAC: toNum(pemakaianPAC), pemakaianKaporit: toNum(pemakaianKaporit), pemakaianPolimer: toNum(pemakaianPolimer),
                sisaPAC: toNum(sisaPAC), sisaKaporit: toNum(sisaKaporit), sisaPolimer: toNum(sisaPolimer),
                catatan,
            };
            if (existing) {
                await saveMingguanObj(data);
            } else {
                const dup = all.find(m => m.mingguKe === mingguKe && m.operatorId === user!.id);
                if (dup) { await saveMingguanObj({ ...data, id: dup.id }); }
                else { await saveMingguanObj(data); }
            }
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onSuccess(); }, 900);
        } catch (err) {
            console.error(err);
            setSaveError('Gagal menyimpan data ke Cloud. Periksa koneksi internet.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="font-display font-bold text-white text-xl">Laporan Mingguan</p>
                <button type="button" onClick={onCancel} className="p-2 rounded-xl text-slate-400 transition"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Period header */}
            <div className="rounded-2xl p-4 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(146,64,14,0.3), rgba(120,53,15,0.2))', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15), transparent 70%)' }} />
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Periode Minggu</p>
                <p className="font-display font-bold text-white text-xl">{mingguKe}</p>
                <p className="text-slate-400 text-xs mt-0.5">{formatTgl(tanggalMulai)} — {formatTgl(tanggalAkhir)}</p>
            </div>

            {/* Pemakaian Bahan Kimia */}
            <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(6,95,70,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #34d399, #059669)' }} />
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Pemakaian Bahan Kimia</p>
                </div>
                <NumInput label="Pemakaian PAC"     value={pemakaianPAC}     setter={setPemakaianPAC}     unit="kg" accent="#34d399" />
                <NumInput label="Pemakaian Kaporit" value={pemakaianKaporit} setter={setPemakaianKaporit} unit="kg" accent="#34d399" />
                <NumInput label="Pemakaian Polimer" value={pemakaianPolimer} setter={setPemakaianPolimer} unit="kg" accent="#34d399" />
            </div>

            {/* Sisa Bahan Kimia */}
            <div className="rounded-2xl p-4 space-y-4" style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #60a5fa, #1d4ed8)' }} />
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Sisa / Stok Bahan Kimia</p>
                </div>
                <NumInput label="Sisa PAC"     value={sisaPAC}     setter={setSisaPAC}     unit="kg" accent="#60a5fa" />
                <NumInput label="Sisa Kaporit" value={sisaKaporit} setter={setSisaKaporit} unit="kg" accent="#60a5fa" />
                <NumInput label="Sisa Polimer" value={sisaPolimer} setter={setSisaPolimer} unit="kg" accent="#60a5fa" />
            </div>

            {/* Catatan */}
            <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Catatan (opsional)</label>
                <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                    className="input-glass resize-none" placeholder="Catatan tambahan..." />
            </div>

            {/* Success */}
            {success && (
                <div className="flex gap-2 items-center rounded-2xl px-4 py-3"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-emerald-400 text-sm font-semibold">Laporan mingguan berhasil disimpan!</p>
                </div>
            )}

            {/* Save Error */}
            {saveError && (
                <div className="flex gap-2 items-center rounded-2xl px-4 py-3"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-400 text-sm">{saveError}</p>
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
                        background: 'linear-gradient(135deg, #92400e, #b45309)',
                        boxShadow: '0 4px 20px rgba(180,83,9,0.35), 0 0 0 1px rgba(245,158,11,0.15)'
                    }}>
                    {saving ? 'Menyimpan...' : 'Simpan Laporan'}
                </button>
            </div>
        </form>
    );
}
