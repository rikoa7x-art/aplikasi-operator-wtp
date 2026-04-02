import { useState, useRef } from 'react';
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

const toNum = (s: string): number | '' => {
    const n = parseFloat(s);
    return isNaN(n) ? '' : n;
};

/** Kompres & tambahkan timestamp pada gambar menggunakan Canvas */
async function processPhoto(file: File, slotJam: string, tanggal: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            // Resize max 1200px untuk hemat storage
            const MAX = 1200;
            let w = img.width;
            let h = img.height;
            if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
            if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, w, h);

            // Timestamp: jam slot + waktu aktual + tanggal
            const now = new Date();
            const waktuFoto = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const tglFoto = new Date(tanggal + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const line1 = `Slot ${slotJam}  •  ${waktuFoto}`;
            const line2 = tglFoto;

            const fontSize = Math.max(14, Math.round(w / 28));
            const padding = Math.round(fontSize * 0.7);
            const lineH = fontSize + padding;
            const boxH = lineH * 2 + padding * 1.5;

            // Background strip bawah
            const grad = ctx.createLinearGradient(0, h - boxH - 10, 0, h);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.3, 'rgba(0,0,0,0.75)');
            grad.addColorStop(1, 'rgba(0,0,0,0.88)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, h - boxH - 10, w, boxH + 10);

            // Teks
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(line1, padding, h - lineH - padding * 0.8);

            ctx.font = `${Math.round(fontSize * 0.82)}px Arial, sans-serif`;
            ctx.fillStyle = 'rgba(200,235,255,0.9)';
            ctx.fillText(line2, padding, h - padding * 0.6);

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = url;
    });
}

export default function FormCatatan({ initialSlot, existing, onSuccess, onCancel }: Props) {
    const { user } = useAuth();
    const hariOperasi = getHariOperasi();
    const fileRef = useRef<HTMLInputElement>(null);

    const [slot, setSlot] = useState<number>(existing?.slot ?? initialSlot ?? getCurrentSlot());
    const [tanggal, setTanggal] = useState(existing?.tanggal ?? hariOperasi);
    const [kekeruhanAirBaku, setKekeruhanAirBaku] = useState(existing?.kekeruhanAirBaku?.toString() ?? '');
    const [debit, setDebit] = useState(existing?.debit?.toString() ?? '');
    const [kekeruhanOlahan, setKekeruhanOlahan] = useState(existing?.kekeruhanOlahan?.toString() ?? '');
    const [dosisPAC, setDosisPAC] = useState(existing?.dosisPAC?.toString() ?? '');
    const [dosisKaporit, setDosisKaporit] = useState(existing?.dosisKaporit?.toString() ?? '');
    const [dosisPolimer, setDosisPolimer] = useState(existing?.dosisPolimer?.toString() ?? '');
    const [catatan, setCatatan] = useState(existing?.catatan ?? '');
    const [foto, setFoto] = useState<string | undefined>(existing?.foto);
    const [fotoLoading, setFotoLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const selectedSlot = SLOTS.find(s => s.slot === slot)!;

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFotoLoading(true);
        try {
            const result = await processPhoto(file, selectedSlot.jam, tanggal);
            setFoto(result);
        } catch {
            alert('Gagal memproses foto. Coba lagi.');
        } finally {
            setFotoLoading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

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
            foto,
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

    const Num = ({ label, value, setter, unit, ring = 'focus:ring-blue-500' }:
        { label: string; value: string; setter: (v: string) => void; unit: string; ring?: string }) => (
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type="text" inputMode="decimal" pattern="[0-9.]*" value={value}
                    onChange={e => setter(e.target.value.replace(/[^0-9.]/g, ''))}
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

            {/* Upload Foto */}
            <div className="bg-slate-800/60 rounded-2xl border border-violet-500/20 p-4">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">Foto Lapangan</p>

                {/* Hidden file input */}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFotoChange}
                    className="hidden"
                />

                {foto ? (
                    /* Preview foto dengan timestamp */
                    <div className="space-y-2">
                        <div className="relative rounded-2xl overflow-hidden">
                            <img src={foto} alt="Foto lapangan" className="w-full object-cover rounded-2xl max-h-60" />
                            {/* Badge timestamp sudah di dalam gambar */}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => fileRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700/60 border border-slate-600/50 rounded-xl text-slate-300 text-xs font-medium active:bg-slate-700 transition">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Ganti Foto
                            </button>
                            <button type="button" onClick={() => setFoto(undefined)}
                                className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium active:bg-red-500/20 transition">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Tombol upload / kamera */
                    <button type="button" onClick={() => fileRef.current?.click()}
                        disabled={fotoLoading}
                        className="w-full flex flex-col items-center justify-center gap-2.5 py-8 rounded-2xl border-2 border-dashed border-violet-500/30 bg-violet-500/5 active:bg-violet-500/10 transition disabled:opacity-50">
                        {fotoLoading ? (
                            <>
                                <svg className="w-8 h-8 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <p className="text-violet-300 text-sm font-medium">Memproses foto...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <p className="text-violet-300 text-sm font-semibold">Ambil / Upload Foto</p>
                                    <p className="text-slate-500 text-xs mt-0.5">Jam pengambilan otomatis tercetak</p>
                                </div>
                            </>
                        )}
                    </button>
                )}
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
