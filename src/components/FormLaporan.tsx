import { useState, useRef } from 'react';
import type { CatatanWaktu } from '../types';
import { SLOTS, getHariOperasi, getCurrentSlot } from '../types';
import { useAuth } from '../AuthContext';
import { getCatatan, saveCatatan, generateId } from '../storage';
import { uploadToCloudinary } from '../cloudinary';

interface Props {
    initialSlot?: number;
    existing?: CatatanWaktu | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const toNum = (s: string): number | '' => { const n = parseFloat(s); return isNaN(n) ? '' : n; };

// Komponen Num harus di LUAR fungsi utama agar keyboard HP tidak hilang saat mengetik
function NumInput({ label, value, setter, unit }: { label: string; value: string; setter: (v: string) => void; unit: string }) {
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
                    className="w-full px-4 py-3.5 pr-16 bg-slate-700/60 border border-slate-600/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">{unit}</span>
            </div>
        </div>
    );
}

async function processPhoto(file: File, slotJam: string, tanggal: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal membaca gambar')); };
        img.onload = () => {
            const MAX = 1200;
            let w = img.width, h = img.height;
            if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
            if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, w, h);

            const now = new Date();
            const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const tgl = new Date(tanggal + 'T08:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const line1 = `Slot ${slotJam}  •  ${waktu}`;

            const fs = Math.max(14, Math.round(w / 28));
            const pad = Math.round(fs * 0.7);
            const boxH = (fs + pad) * 2 + pad * 1.5;
            const grad = ctx.createLinearGradient(0, h - boxH - 10, 0, h);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.3, 'rgba(0,0,0,0.75)');
            grad.addColorStop(1, 'rgba(0,0,0,0.88)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, h - boxH - 10, w, boxH + 10);

            ctx.font = `bold ${fs}px Arial, sans-serif`;
            ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 4;
            ctx.fillText(line1, pad, h - (fs + pad) - pad * 0.8);
            ctx.font = `${Math.round(fs * 0.82)}px Arial, sans-serif`;
            ctx.fillStyle = 'rgba(200,235,255,0.9)';
            ctx.fillText(tgl, pad, h - pad * 0.6);

            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = url;
    });
}

type FotoStatus = 'idle' | 'processing' | 'uploading' | 'done' | 'error';

export default function FormCatatan({ initialSlot, existing, onSuccess, onCancel }: Props) {
    const { user } = useAuth();
    const hariOperasi = getHariOperasi();
    const fileRef = useRef<HTMLInputElement>(null);

    const [slot, setSlot] = useState<number>(existing?.slot ?? initialSlot ?? getCurrentSlot());
    const [tanggal, setTanggal] = useState(existing?.tanggal ?? hariOperasi);
    const [debitProduksi, setDebitProduksi] = useState(existing?.debitProduksi?.toString() ?? '');
    const [ntuAirBaku, setNtuAirBaku] = useState(existing?.ntuAirBaku?.toString() ?? '');
    const [dosisPAC, setDosisPAC] = useState(existing?.dosisPAC?.toString() ?? '');
    const [ntuOlahan, setNtuOlahan] = useState(existing?.ntuOlahan?.toString() ?? '');
    const [catatan, setCatatan] = useState(existing?.catatan ?? '');
    const [foto, setFoto] = useState<string | undefined>(existing?.foto);
    const [fotoPreview, setFotoPreview] = useState<string | undefined>(existing?.foto);
    const [fotoStatus, setFotoStatus] = useState<FotoStatus>(existing?.foto ? 'done' : 'idle');
    const [fotoError, setFotoError] = useState('');
    const [success, setSuccess] = useState(false);

    const selectedSlot = SLOTS.find(s => s.slot === slot)!;

    const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (fileRef.current) fileRef.current.value = '';
        setFotoError(''); setFoto(undefined);
        try {
            setFotoStatus('processing');
            const b64 = await processPhoto(file, selectedSlot.jam, tanggal);
            setFotoPreview(b64);
            setFotoStatus('uploading');
            const url = await uploadToCloudinary(b64);
            setFoto(url); setFotoStatus('done');
        } catch (err: unknown) {
            setFotoError(err instanceof Error ? err.message : 'Upload gagal');
            setFotoStatus('error'); setFotoPreview(undefined);
        }
    };

    const removeFoto = () => { setFoto(undefined); setFotoPreview(undefined); setFotoStatus('idle'); setFotoError(''); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (fotoStatus === 'processing' || fotoStatus === 'uploading') return;
        
        try {
            const all = await getCatatan();
            const data: CatatanWaktu = {
                id: existing?.id ?? generateId(), tanggal, slot, jamLabel: selectedSlot.jam,
                operatorId: user!.id, operatorNama: user!.nama, createdAt: new Date().toISOString(),
                debitProduksi: toNum(debitProduksi), ntuAirBaku: toNum(ntuAirBaku),
                dosisPAC: toNum(dosisPAC), ntuOlahan: toNum(ntuOlahan),
                catatan, foto,
            };
            if (existing) {
                await saveCatatan(data);
            } else {
                const dup = all.find(c => c.tanggal === tanggal && c.slot === slot);
                if (dup) {
                    await saveCatatan({ ...data, id: dup.id });
                } else {
                    await saveCatatan(data);
                }
            }
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onSuccess(); }, 900);
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan data ke Cloud");
        }
    };

    const isUploading = fotoStatus === 'processing' || fotoStatus === 'uploading';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Slot */}
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

            {/* 4 Data Utama */}
            <div className="bg-slate-800/60 rounded-2xl border border-cyan-500/20 p-4 space-y-3">
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Data Operasi</p>
                <NumInput label="Debit Produksi" value={debitProduksi} setter={setDebitProduksi} unit="L/dtk" />
                <NumInput label="NTU Air Baku" value={ntuAirBaku} setter={setNtuAirBaku} unit="NTU" />
                <NumInput label="Dosis PAC" value={dosisPAC} setter={setDosisPAC} unit="gr/mnt" />
                <NumInput label="NTU Setelah Pengolahan" value={ntuOlahan} setter={setNtuOlahan} unit="NTU" />
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
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">Foto Lapangan</p>
                    {fotoStatus === 'done' && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            Tersimpan
                        </span>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} className="hidden" />

                {isUploading && (
                    <div className="flex flex-col items-center py-6 gap-2">
                        <svg className="w-10 h-10 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {fotoPreview && <img src={fotoPreview} alt="preview" className="w-full max-h-28 object-cover rounded-xl opacity-50" />}
                        <p className="text-violet-300 text-sm">{fotoStatus === 'processing' ? 'Memproses...' : 'Upload...'}</p>
                    </div>
                )}

                {fotoStatus === 'error' && (
                    <div className="space-y-2">
                        <div className="flex gap-2 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
                            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <p className="text-red-400 text-xs">{fotoError}</p>
                        </div>
                        <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-2.5 text-violet-400 border border-violet-500/30 rounded-xl text-xs font-medium active:bg-violet-500/10 transition">Coba Lagi</button>
                    </div>
                )}

                {fotoStatus === 'done' && fotoPreview && (
                    <div className="space-y-2">
                        <img src={fotoPreview} alt="Foto" className="w-full object-cover rounded-2xl max-h-52 border border-violet-500/30" />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 py-2.5 bg-slate-700/60 border border-slate-600/50 rounded-xl text-slate-300 text-xs font-medium active:bg-slate-700 transition">Ganti Foto</button>
                            <button type="button" onClick={removeFoto} className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs active:bg-red-500/20 transition">Hapus</button>
                        </div>
                    </div>
                )}

                {fotoStatus === 'idle' && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full flex flex-col items-center gap-2 py-7 rounded-2xl border-2 border-dashed border-violet-500/30 bg-violet-500/5 active:bg-violet-500/10 transition">
                        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-violet-300 text-sm font-semibold">Ambil / Upload Foto</p>
                        <p className="text-slate-500 text-xs">Jam tercetak otomatis</p>
                    </button>
                )}
            </div>

            {success && (
                <div className="flex gap-2 items-center bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <p className="text-emerald-400 text-sm font-semibold">Data berhasil disimpan!</p>
                </div>
            )}

            <div className="flex gap-3 pt-1">
                <button type="button" onClick={onCancel} className="flex-1 py-4 text-slate-400 border border-slate-700 rounded-2xl active:bg-slate-800 text-sm font-medium transition">Batal</button>
                <button type="submit" disabled={isUploading} className="flex-[2] py-4 bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20">
                    {isUploading ? 'Menunggu foto...' : 'Simpan Data'}
                </button>
            </div>
        </form>
    );
}
