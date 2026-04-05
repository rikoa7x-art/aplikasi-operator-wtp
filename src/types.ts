// Types for WTP Operator App

export type Role = 'admin' | 'operator';

export interface User {
    id: string;
    username: string;
    password: string;
    nama: string;
    role: Role;
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
    
    if (jkt.h < 6) {
        // Safe date arithmetic using UTC to subtract 1 day precisely
        const yesterday = new Date(Date.UTC(jkt.y, jkt.m - 1, jkt.d - 1));
        const y = yesterday.getUTCFullYear();
        const m = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
        const d = String(yesterday.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
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
    createdAt: string;

    // 4 data utama
    debitProduksi: number | '';      // L/detik
    ntuAirBaku: number | '';         // NTU
    dosisPAC: number | '';           // gr/menit
    ntuOlahan: number | '';          // NTU setelah pengolahan

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
