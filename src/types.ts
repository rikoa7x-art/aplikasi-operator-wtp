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

function getLocalYYYYMMDD(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Hari operasi: sebelum jam 06:00 dianggap masih hari kemarin */
export function getHariOperasi(): string {
    const now = new Date();
    if (now.getHours() < 6) {
        const kemarin = new Date(now);
        kemarin.setDate(kemarin.getDate() - 1);
        return getLocalYYYYMMDD(kemarin);
    }
    return getLocalYYYYMMDD(now);
}


/** Slot aktif berdasarkan jam sekarang */
export function getCurrentSlot(): number {
    const h = new Date().getHours();
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

/** Menghitung ISO week string "YYYY-Www" dari tanggal */
export function getISOWeek(d: Date): string {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** Tanggal Senin dan Minggu dari minggu saat ini */
export function getCurrentWeekRange(): { mulai: string; akhir: string; mingguKe: string } {
    const now = new Date();
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const senin = new Date(now);
    senin.setDate(now.getDate() + diffToMon);
    const minggu = new Date(senin);
    minggu.setDate(senin.getDate() + 6);
    return {
        mulai: getLocalYYYYMMDD(senin),
        akhir: getLocalYYYYMMDD(minggu),
        mingguKe: getISOWeek(now),
    };
}
