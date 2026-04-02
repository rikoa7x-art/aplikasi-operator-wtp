import type { CatatanWaktu } from '../types';

interface Props {
    catatan: CatatanWaktu;
    onClose: () => void;
}

export default function DetailCatatan({ catatan: c, onClose }: Props) {
    const turb = Number(c.ntuOlahan);
    const turbColor = c.ntuOlahan === '' ? 'text-slate-500' : turb <= 1 ? 'text-emerald-400' : turb <= 5 ? 'text-amber-400' : 'text-red-400';
    const turbLabel = c.ntuOlahan === '' ? '–' : turb <= 1 ? 'Baik' : turb <= 5 ? 'Perhatian' : 'Tinggi';
    const turbBadge = c.ntuOlahan === '' ? 'bg-slate-700/50 text-slate-400' : turb <= 1 ? 'bg-emerald-500/15 text-emerald-400' : turb <= 5 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400';

    const Row = ({ label, value, unit = '' }: { label: string; value: number | '' | string; unit?: string }) => (
        <div className="flex items-center justify-between py-2.5 border-b border-slate-700/40 last:border-0">
            <span className="text-slate-400 text-sm">{label}</span>
            <span className="text-white font-semibold text-sm">
                {value !== '' ? `${value}${unit ? ' ' + unit : ''}` : <span className="text-slate-600">–</span>}
            </span>
        </div>
    );

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-white font-bold text-2xl">{c.jamLabel}</p>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {new Date(c.tanggal + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${turbBadge}`}>{turbLabel}</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 rounded-2xl mb-4">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {c.operatorNama.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm text-white font-semibold">{c.operatorNama}</p>
                    <p className="text-xs text-slate-400">
                        Dicatat {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 mb-3">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Data Operasi</p>
                <Row label="Debit Produksi" value={c.debitProduksi} unit="L/dtk" />
                <Row label="NTU Air Baku" value={c.ntuAirBaku} unit="NTU" />
                <Row label="Dosis PAC" value={c.dosisPAC} unit="gr/mnt" />
                <div className="flex items-center justify-between py-2.5">
                    <span className="text-slate-400 text-sm">NTU Setelah Pengolahan</span>
                    <span className={`font-bold text-sm ${turbColor}`}>
                        {c.ntuOlahan !== '' ? `${c.ntuOlahan} NTU` : '–'}
                    </span>
                </div>
            </div>

            {c.catatan && (
                <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 mb-3">
                    <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Catatan</p>
                    <p className="text-sm text-white leading-relaxed">{c.catatan}</p>
                </div>
            )}

            {c.foto && (
                <div className="mb-3">
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">Foto Lapangan</p>
                    <div className="rounded-2xl overflow-hidden border border-violet-500/20">
                        <img src={c.foto} alt="Foto lapangan" className="w-full object-cover" />
                    </div>
                </div>
            )}

            <button onClick={onClose} className="w-full py-3.5 bg-slate-800 active:bg-slate-700 text-slate-300 font-medium rounded-2xl transition text-sm mt-1">Tutup</button>
        </div>
    );
}
