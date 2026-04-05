import type { CatatanWaktu } from '../types';

interface Props {
    catatan: CatatanWaktu;
    onClose: () => void;
}

export default function DetailCatatan({ catatan: c, onClose }: Props) {
    const turb = Number(c.ntuOlahan);
    const turbColor  = c.ntuOlahan === '' ? 'text-slate-500' : turb <= 1 ? 'text-emerald-400' : turb <= 5 ? 'text-amber-400' : 'text-red-400';
    const turbLabel  = c.ntuOlahan === '' ? '–' : turb <= 1 ? 'Baik' : turb <= 5 ? 'Perhatian' : 'Tinggi';
    const [turbBg, turbBorder] = c.ntuOlahan === ''
        ? ['rgba(100,116,139,0.12)', 'rgba(100,116,139,0.2)']
        : turb <= 1
            ? ['rgba(52,211,153,0.12)', 'rgba(52,211,153,0.3)']
            : turb <= 5
                ? ['rgba(245,158,11,0.12)', 'rgba(245,158,11,0.3)']
                : ['rgba(248,113,113,0.12)', 'rgba(248,113,113,0.3)'];

    const Row = ({ label, value, unit = '', color }: { label: string; value: number | '' | string; unit?: string; color?: string }) => (
        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(99,130,200,0.08)' }}>
            <span className="text-slate-400 text-sm">{label}</span>
            <span className={`font-semibold text-sm ${color ?? 'text-white'}`}>
                {value !== '' ? `${value}${unit ? ' ' + unit : ''}` : <span className="text-slate-600">–</span>}
            </span>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <p className="font-display font-bold text-white text-3xl leading-none">{c.jamLabel}</p>
                    <p className="text-slate-400 text-sm mt-1.5">
                        {new Date(c.tanggal + 'T08:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${turbColor}`}
                    style={{ background: turbBg, border: `1px solid ${turbBorder}` }}>
                    {turbLabel}
                </span>
            </div>

            {/* Operator info */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,130,200,0.1)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white text-base shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)' }}>
                    {c.operatorNama.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-white text-sm font-semibold">{c.operatorNama}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Dicatat {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Data Operasi */}
            <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(8,145,178,0.05)', border: '1px solid rgba(34,211,238,0.12)' }}>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #22d3ee, #1d4ed8)' }} />
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Data Operasi</p>
                </div>
                <Row label="Debit Produksi" value={c.debitProduksi} unit="L/dtk" />
                <Row label="NTU Air Baku" value={c.ntuAirBaku} unit="NTU" />
                <Row label="Dosis PAC" value={c.dosisPAC} unit="gr/mnt" />
                <div className="flex items-center justify-between pt-2.5">
                    <span className="text-slate-400 text-sm">NTU Setelah Pengolahan</span>
                    <span className={`font-bold text-sm ${turbColor}`}>
                        {c.ntuOlahan !== '' ? `${c.ntuOlahan} NTU` : '–'}
                    </span>
                </div>
            </div>

            {/* Catatan */}
            {c.catatan && (
                <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.12)' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #fb7185, #e11d48)' }} />
                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Catatan</p>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{c.catatan}</p>
                </div>
            )}

            {/* Foto */}
            {c.foto && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #a78bfa, #7c3aed)' }} />
                        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Foto Lapangan</p>
                    </div>
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(167,139,250,0.2)' }}>
                        <img src={c.foto} alt="Foto lapangan" className="w-full object-cover" />
                    </div>
                </div>
            )}

            <button onClick={onClose}
                className="w-full py-3.5 text-slate-300 font-medium rounded-2xl transition text-sm mt-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,130,200,0.15)' }}>
                Tutup
            </button>
        </div>
    );
}
