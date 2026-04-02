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

/** Hari operasi: sebelum jam 06:00 dianggap masih hari kemarin */
export function getHariOperasi(): string {
    const now = new Date();
    if (now.getHours() < 6) {
        const kemarin = new Date(now);
        kemarin.setDate(kemarin.getDate() - 1);
        return kemarin.toISOString().split('T')[0];
    }
    return now.toISOString().split('T')[0];
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

export interface CatatanWaktu {
    id: string;
    tanggal: string;      // YYYY-MM-DD (hari operasi)
    slot: number;         // 1-12
    jamLabel: string;     // "06:00", "08:00", ...
    operatorId: string;
    operatorNama: string;
    createdAt: string;

    // Data utama
    kekeruhanAirBaku: number | '';  // NTU
    debit: number | '';             // L/detik
    kekeruhanOlahan: number | '';   // NTU

    // Dosis bahan kimia
    dosisPAC: number | '';      // gr/menit
    dosisKaporit: number | '';  // gr/menit
    dosisPolimer: number | '';  // gr/menit

    catatan: string;
    foto?: string; // base64 data URL dengan timestamp
}
