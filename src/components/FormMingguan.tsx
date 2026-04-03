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

// Komponen NumInput harus di LUAR fungsi utama agar keyboard HP tidak hilang saat mengetik
function NumInput({ label, value, setter, unit, color = 'focus:ring-amber-500' }: {
    label: string; value: string; setter: (v: string) => void; unit: string; color?: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    value={value}
                    onChange={e => setter(e.target.value.replace(/[^0-9.]/g, ''))}
                    className={`w-full px-4 py-3.5 pr-12 bg-slate-700/60 border border-slate-600/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${color} transition`}
                    placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">{unit}</span>
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

    const formatTgl = (d: string) => new Date(d + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const all = await getMingguan();
            const data: LaporanMingguan = {
                id: existing?.id ?? generateId(), mingguKe, tanggalMulai, tanggalAkhir,
                operatorId: user!.id, operatorNama: user!.nama, createdAt: new Date().toISOString(),
                pemakaianPAC: toNum(pemakaianPAC), pemakaianKaporit: toNum(pemakaianKaporit), pemakaianPolimer: toNum(pemakaianPolimer),
                sisaPAC: toNum(sisaPAC), sisaKaporit: toNum(sisaKaporit), sisaPolimer: toNum(sisaPolimer),
                catatan,
            };
            if (existing) {
                await saveMingguanObj(data);
            } else {
                const dup = all.find(m => m.mingguKe === mingguKe && m.operatorId === user!.id);
                if (dup) {
                    await saveMingguanObj({ ...data, id: dup.id });
                } else {
                    await saveMingguanObj(data);
                }
            }
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onSuccess(); }, 900);
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan data ke Cloud");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Periode Minggu */}
            <div className="bg-amber-500/10 rounded-2xl border border-amber-500/30 p-4">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Periode Minggu</p>
                <p className="text-white font-bold text-lg">{mingguKe}</p>
                <p className="text-slate-400 text-xs mt-0.5">{formatTgl(tanggalMulai)} — {formatTgl(tanggalAkhir)}</p>
            </div>

            {/* Pemakaian Bahan Kimia */}
            <div className="bg-slate-800/60 rounded-2xl border border-emerald-500/20 p-4 space-y-3">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pemakaian Bahan Kimia</p>
                <NumInput label="Pemakaian PAC" value={pemakaianPAC} setter={setPemakaianPAC} unit="kg" color="focus:ring-emerald-500" />
                <NumInput label="Pemakaian Kaporit" value={pemakaianKaporit} setter={setPemakaianKaporit} unit="kg" color="focus:ring-emerald-500" />
                <NumInput label="Pemakaian Polimer" value={pemakaianPolimer} setter={setPemakaianPolimer} unit="kg" color="focus:ring-emerald-500" />
            </div>

            {/* Sisa Bahan Kimia */}
            <div className="bg-slate-800/60 rounded-2xl border border-blue-500/20 p-4 space-y-3">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Sisa / Stok Bahan Kimia</p>
                <NumInput label="Sisa PAC" value={sisaPAC} setter={setSisaPAC} unit="kg" color="focus:ring-blue-500" />
                <NumInput label="Sisa Kaporit" value={sisaKaporit} setter={setSisaKaporit} unit="kg" color="focus:ring-blue-500" />
                <NumInput label="Sisa Polimer" value={sisaPolimer} setter={setSisaPolimer} unit="kg" color="focus:ring-blue-500" />
            </div>

            {/* Catatan */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Catatan (opsional)</label>
                <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                    className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    placeholder="Catatan tambahan..." />
            </div>

            {success && (
                <div className="flex gap-2 items-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <p className="text-emerald-400 text-sm font-semibold">Laporan mingguan berhasil disimpan!</p>
                </div>
            )}

            <div className="flex gap-3 pt-1">
                <button type="button" onClick={onCancel} className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl active:bg-slate-800 text-sm font-medium transition">Batal</button>
                <button type="submit" className="flex-[2] py-4 bg-amber-500 active:bg-amber-600 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20">Simpan Laporan</button>
            </div>
        </form>
    );
}
