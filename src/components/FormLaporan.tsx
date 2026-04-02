import { useState } from 'react';
import type { CatatanWaktu } from '../types';
import { SLOTS, getHariOperasi, getCurrentSlot } from '../types';
import { useAuth } from '../AuthContext';
import { addCatatan, getCatatan, saveCatatan, generateId } from '../storage';

interface Props {
    initialSlot?: number;
    existing?: CatatanWaktu | null;
    onSuccess: () => void;
    onCancel: () => void;
}

// Konversi string ke number | '' untuk disimpan
const toNum = (s: string): number | '' => {
    const n = parseFloat(s);
    return isNaN(n) ? '' : n;
};

export default function FormCatatan({ initialSlot, existing, onSuccess, onCancel }: Props) {
    const { user } = useAuth();
    const hariOperasi = getHariOperasi();

    const [slot, setSlot] = useState<number>(existing?.slot ?? initialSlot ?? getCurrentSlot());
    const [tanggal, setTanggal] = useState(existing?.tanggal ?? hariOperasi);

    // Simpan sebagai string agar keyboard tidak hilang saat mengetik
    const [kekeruhanAirBaku, setKekeruhanAirBaku] = useState(existing?.kekeruhanAirBaku?.toString() ?? '');
    const [debit, setDebit] = useState(existing?.debit?.toString() ?? '');
    const [kekeruhanOlahan, setKekeruhanOlahan] = useState(existing?.kekeruhanOlahan?.toString() ?? '');
    const [dosisPAC, setDosisPAC] = useState(existing?.dosisPAC?.toString() ?? '');
    const [dosisKaporit, setDosisKaporit] = useState(existing?.dosisKaporit?.toString() ?? '');
    const [dosisPolimer, setDosisPolimer] = useState(existing?.dosisPolimer?.toString() ?? '');
    const [catatan, setCatatan] = useState(existing?.catatan ?? '');
    const [success, setSuccess] = useState(false);

    const selectedSlot = SLOTS.find(s => s.slot === slot)!;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const all = getCatatan();
        const data: CatatanWaktu = {
            id: existing?.id ?? generateId(),
            tanggal, slot,
            jamLabel: selectedSlot.jam,
            operatorId: user!.id,
            operatorNama: user!.nama,
            createdAt: new Date().toISOString(),
            kekeruhanAirBaku: toNum(kekeruhanAirBaku),
            debit: toNum(debit),
            kekeruhanOlahan: toNum(kekeruhanOlahan),
            dosisPAC: toNum(dosisPAC),
            dosisKaporit: toNum(dosisKaporit),
            dosisPolimer: toNum(dosisPolimer),
            catatan,
        };
        if (existing) {
            const idx = all.findIndex(c => c.id === existing.id);
            if (idx !== -1) all[idx] = data; else all.push(data);
            saveCatatan(all);
        } else {
            const dup = all.findIndex(c => c.tanggal === tanggal && c.slot === slot);
            if (dup !== -1) { all[dup] = { ...data, id: all[dup].id }; saveCatatan(all); }
            else addCatatan(data);
        }
        setSuccess(true);
        setTimeout(() => { setSuccess(false); onSuccess(); }, 900);
    };

    // Input angka — type="text" + inputMode="decimal" agar keyboard tidak hilang di HP
    const Num = ({ label, value, setter, unit, ring = 'focus:ring-blue-500' }:
        { label: string; value: string; setter: (v: string) => void; unit: string; ring?: string }) => (
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    value={value}
                    onChange={e => {
                        // Hanya izinkan angka dan titik desimal
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setter(val);
                    }}
                    className={`w-full px-4 py-3.5 pr-16 bg-slate-700/60 border border-slate-600/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${ring} transition`}
                    placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">{unit}</span>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Slot selector */}
            <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Pilih Jam</label>
                <div className="grid grid-cols-4 gap-1.5">
                    {SLOTS.map(s => (
                        <button key={s.slot} type="button" onClick={() => setSlot(s.slot)}
                            className={`py-2.5 rounded-xl text-xs font-bold transition active:scale-95 ${slot === s.slot
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-slate-700/50 text-slate-400 active:bg-slate-700'}`}>
                            {s.jam}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tanggal */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tanggal</label>
                <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-700/60 border border-slate-600/60 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            {/* Data Air */}
            <div className="bg-slate-800/60 rounded-2xl border border-cyan-500/20 p-4 space-y-3">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Data Air</p>
                <Num label="Kekeruhan Air Baku" value={kekeruhanAirBaku} setter={setKekeruhanAirBaku} unit="NTU" />
                <Num label="Debit Air Baku" value={debit} setter={setDebit} unit="L/dtk" />
                <Num label="Kekeruhan Hasil Olahan" value={kekeruhanOlahan} setter={setKekeruhanOlahan} unit="NTU" />
            </div>

            {/* Dosis Kimia */}
            <div className="bg-slate-800/60 rounded-2xl border border-emerald-500/20 p-4 space-y-3">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Dosis Bahan Kimia</p>
                <Num label="Dosis PAC" value={dosisPAC} setter={setDosisPAC} unit="gr/mnt" ring="focus:ring-emerald-500" />
                <Num label="Dosis Kaporit" value={dosisKaporit} setter={setDosisKaporit} unit="gr/mnt" ring="focus:ring-emerald-500" />
                <Num label="Dosis Polimer" value={dosisPolimer} setter={setDosisPolimer} unit="gr/mnt" ring="focus:ring-emerald-500" />
            </div>

            {/* Catatan */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Catatan (opsional)</label>
                <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                    className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    placeholder="Tambahkan catatan..." />
            </div>

            {success && (
                <div className="flex gap-2 items-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-emerald-400 text-sm font-semibold">Data berhasil disimpan!</p>
                </div>
            )}

            <div className="flex gap-3 pt-1">
                <button type="button" onClick={onCancel}
                    className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl active:bg-slate-800 text-sm font-medium transition">
                    Batal
                </button>
                <button type="submit"
                    className="flex-[2] py-4 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20">
                    Simpan Data
                </button>
            </div>
        </form>
    );
}
