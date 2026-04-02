import type { CatatanWaktu } from '../types';

interface Props {
    catatan: CatatanWaktu;
    onClose: () => void;
}

export default function DetailCatatan({ catatan: c, onClose }: Props) {
    const turb = Number(c.kekeruhanOlahan);
    const turbColor = c.kekeruhanOlahan === '' ? 'text-slate-500' : turb <= 1 ? 'text-emerald-400' : turb <= 5 ? 'text-amber-400' : 'text-red-400';
    const turbLabel = c.kekeruhanOlahan === '' ? '–' : turb <= 1 ? 'Baik' : turb <= 5 ? 'Perhatian' : 'Tinggi';
    const turbBadge = c.kekeruhanOlahan === '' ? 'bg-slate-700/50 text-slate-400' : turb <= 1 ? 'bg-emerald-500/15 text-emerald-400' : turb <= 5 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400';

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
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="text-white font-bold text-2xl">{c.jamLabel}</p>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {new Date(c.tanggal + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${turbBadge}`}>{turbLabel}</span>
            </div>

            {/* Operator */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 rounded-2xl mb-4">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {c.operatorNama.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm text-white font-semibold">{c.operatorNama}</p>
                    <p className="text-xs text-slate-400">
                        Dicatat pukul {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Data Air */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 mb-3">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Data Air</p>
                <Row label="Kekeruhan Air Baku" value={c.kekeruhanAirBaku} unit="NTU" />
                <Row label="Debit Air Baku" value={c.debit} unit="L/dtk" />
                <div className="flex items-center justify-between py-2.5">
                    <span className="text-slate-400 text-sm">Kekeruhan Olahan</span>
                    <span className={`font-bold text-sm ${turbColor}`}>
                        {c.kekeruhanOlahan !== '' ? `${c.kekeruhanOlahan} NTU` : '–'}
                    </span>
                </div>
            </div>

            {/* Dosis Kimia */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 mb-3">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Dosis Bahan Kimia</p>
                <Row label="PAC" value={c.dosisPAC} unit="gr/mnt" />
                <Row label="Kaporit" value={c.dosisKaporit} unit="gr/mnt" />
                <Row label="Polimer" value={c.dosisPolimer} unit="gr/mnt" />
            </div>

            {/* Catatan */}
            {c.catatan && (
                <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-4 mb-3">
                    <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Catatan</p>
                    <p className="text-sm text-white leading-relaxed">{c.catatan}</p>
                </div>
            )}

            <button onClick={onClose}
                className="w-full py-3.5 bg-slate-800 active:bg-slate-700 text-slate-300 font-medium rounded-2xl transition text-sm mt-1">
                Tutup
            </button>
        </div>
    );
}
