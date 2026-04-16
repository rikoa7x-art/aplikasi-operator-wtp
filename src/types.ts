// Types for WTP Operator App

export type Role = 'admin' | 'operator';
export type TipeOperator = 'operator_wtp' | 'operator_reservoir';

export const CABANG_LIST: string[] = [
    'Subang',
    'Pagaden',
    'Jalan Cagak',
    'Kasomalang',
    'Sagalaherang',
    'Cisalak',
    'Tanjungsiang',
    'Binong',
    'Pamanukan',
    'Compreng',
    'Pusakanagara',
    'Blanakan',
    'Pabuaran',
    'Kalijati',
    'Purwadadi',
];

export const TIPE_OPERATOR_LABEL: Record<TipeOperator, string> = {
    operator_wtp: 'Operator WTP',
    operator_reservoir: 'Operator Reservoir',
};

export function getWtpLabel(cabang?: string): string {
    if (cabang && ['Cisalak', 'Kasomalang', 'Jalan Cagak'].includes(cabang)) {
        return 'Sistem Pompa';
    }
    if (cabang && ['Subang', 'Tanjungsiang'].includes(cabang)) {
        return 'WTP Gravitasi';
    }
    return 'WTP';
}

export function getTipeOperatorLabel(tipe: TipeOperator | '', cabang?: string): string {
    if (!tipe) return '';
    if (tipe === 'operator_wtp') {
        return 'Operator ' + getWtpLabel(cabang);
    }
    return TIPE_OPERATOR_LABEL[tipe];
}

export interface User {
    id: string;
    username: string;
    nama: string;
    role: Role;
    tipeOperator?: TipeOperator;
    cabang?: string;
}

// 12 slot waktu per hari operasi (mulai 06:00)
export const SLOTS: { slot: number; jam: string }[] = [
    { slot: 1,  jam: '06:00' },
    { slot: 2,  jam: '08:00' },
    { slot: 3,  jam: '10:00' },
    { slot: 4,  jam: '12:00' },
    { slot: 5,  jam: '14:00' },
    { slot: 6,  jam: '16:00' },
    { slot: 7,  jam: '18:00' },
    { slot: 8,  jam: '20:00' },
    { slot: 9,  jam: '22:00' },
    { slot: 10, jam: '00:00' },
    { slot: 11, jam: '02:00' },
    { slot: 12, jam: '04:00' },
];

interface JktTime {
    y: number; m: number; d: number; h: number; weekday: string; dateStr: string;
}

/** Utility untuk selalu mendapatkan waktu dalam zona Waktu Indonesia Barat (Asia/Jakarta) */
function getJakartaTime(date: Date = new Date()): JktTime {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', hourCycle: 'h23', weekday: 'short'
    }).formatToParts(date);
    
    const val = (t: string) => parts.find(p => p.type === t)?.value || '0';
    const y = parseInt(val('year'), 10);
    const m = parseInt(val('month'), 10);
    const d = parseInt(val('day'), 10);
    const h = parseInt(val('hour'), 10);
    
    return {
        y, m, d, h, weekday: val('weekday'),
        dateStr: `${val('year')}-${val('month')}-${val('day')}`
    };
}

/** Hari operasi: sebelum jam 06:00 dianggap masih hari kemarin (Waktu Jakarta) */
export function getHariOperasi(): string {
    const jkt = getJakartaTime();
    
    // Shift malam: sebelum jam 06:00 → masih hari operasi kemarin
    if (jkt.h < 6) {
        const yesterday = new Date(Date.UTC(jkt.y, jkt.m - 1, jkt.d));
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yy = yesterday.getUTCFullYear();
        const mm = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(yesterday.getUTCDate()).padStart(2, '0');
        return `${yy}-${mm}-${dd}`;
    }
    
    return jkt.dateStr;
}

/** Slot aktif berdasarkan jam sekarang (Waktu Jakarta) */
export function getCurrentSlot(): number {
    const h = getJakartaTime().h;
    if (h >= 6  && h < 8)  return 1;
    if (h >= 8  && h < 10) return 2;
    if (h >= 10 && h < 12) return 3;
    if (h >= 12 && h < 14) return 4;
    if (h >= 14 && h < 16) return 5;
    if (h >= 16 && h < 18) return 6;
    if (h >= 18 && h < 20) return 7;
    if (h >= 20 && h < 22) return 8;
    if (h >= 22)            return 9;
    if (h >= 0  && h < 2)  return 10;
    if (h >= 2  && h < 4)  return 11;
    return 12;
}

/** Data pencatatan tiap 2 jam */
export interface CatatanWaktu {
    id: string;
    tanggal: string;      // YYYY-MM-DD (hari operasi)
    slot: number;         // 1-12
    jamLabel: string;     // "06:00", "08:00", ...
    operatorId: string;
    operatorNama: string;
    operatorCabang?: string; // cabang operator (untuk filter admin)
    cabang?: string;         // cabang operator (alias lama)
    createdAt: string;

    // Data umum (semua tipe operator)
    debitProduksi: number | '';      // L/detik
    ntuAirBaku: number | '';         // NTU
    dosisPAC: number | '';           // gr/menit
    ntuOlahan: number | '';          // NTU setelah pengolahan

    // Data khusus Operator WTP (opsional, tidak wajib ada di data lama)
    debitAirBaku?: number | '';      // L/dtk (Khusus WTP Gravitasi)
    tekananPompa?: number | '';      // bar
    wmProduksiAwal?: number | '';    // m³
    wmProduksiAkhir?: number | '';   // m³
    wmDistribusiAwal?: number | '';  // m³
    wmDistribusiAkhir?: number | ''; // m³
    // Produksi (dihitung otomatis: wmProduksiAkhir - wmProduksiAwal)
    volumeProduksi?: number | '';    // m³ — Volume Produksi
    // digunakan sebagai debit produksi (volume / 3.6 / 2)
    ampere?: number | '';            // A
    voltase?: number | '';           // V
    sisaChlor?: number | '';         // mg/L
    dosisKaporit?: number | '';      // ppm
    // Distribusi (dihitung otomatis: wmDistribusiAkhir - wmDistribusiAwal)
    volumeDistribusi?: number | '';  // m³ — Volume Distribusi
    debitDistribusi?: number | '';   // L/dtk — Debit Distribusi (volumeDistribusi / 3.6 / 2)

    catatan: string;
    foto?: string;  // URL Cloudinary
}

/** Laporan mingguan — pemakaian & sisa bahan kimia */
export interface LaporanMingguan {
    id: string;
    mingguKe: string;       // "2026-W14" format ISO week
    tanggalMulai: string;   // YYYY-MM-DD (Senin)
    tanggalAkhir: string;   // YYYY-MM-DD (Minggu)
    operatorId: string;
    operatorNama: string;
    operatorCabang?: string; // cabang operator (untuk filter admin)
    createdAt: string;

    // Pemakaian bahan kimia (kg)
    pemakaianPAC: number | '';
    pemakaianKaporit: number | '';
    pemakaianPolimer: number | '';

    // Sisa / stok bahan kimia (kg)
    sisaPAC: number | '';
    sisaKaporit: number | '';
    sisaPolimer: number | '';

    catatan: string;
}

/** Data kelistrikan harian — diisi sekali per hari jam 08:00, khusus Operator WTP */
export interface CatatanListrik {
    id: string;
    tanggal: string;        // YYYY-MM-DD
    operatorId: string;
    operatorNama: string;
    cabang?: string;
    createdAt: string;

    wbp: number | '';       // kWh — Waktu Beban Puncak
    lwbp: number | '';      // kWh — Luar Waktu Beban Puncak
    kvarh: number | '';     // kVARh

    catatan: string;
}

/** Menghitung ISO week string "YYYY-Www" secara konsisten dengan UTC agar bebas timezone offset */
export function getISOWeek(baseUtcStr: Date): string {
    const date = new Date(baseUtcStr.getTime());
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
    const week1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** Tanggal Senin dan Minggu dari minggu saat ini (Waktu Jakarta) */
export function getCurrentWeekRange(): { mulai: string; akhir: string; mingguKe: string } {
    const jkt = getJakartaTime();
    
    // Convert short weekday to day index (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const dayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const day = dayMap[jkt.weekday];
    
    // Arithmetic safely done in UTC space
    const base = new Date(Date.UTC(jkt.y, jkt.m - 1, jkt.d));
    const diffToMon = day === 0 ? -6 : 1 - day;
    
    const senin = new Date(base.getTime());
    senin.setUTCDate(senin.getUTCDate() + diffToMon);
    
    const minggu = new Date(senin.getTime());
    minggu.setUTCDate(minggu.getUTCDate() + 6);
    
    const formatUTC = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    
    return {
        mulai: formatUTC(senin),
        akhir: formatUTC(minggu),
        mingguKe: getISOWeek(base),
    };
}
