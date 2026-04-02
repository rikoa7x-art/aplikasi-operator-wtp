import type { User, CatatanWaktu, LaporanMingguan } from './types';

const USERS_KEY    = 'wtp_users';
const CATATAN_KEY  = 'wtp_catatan';
const MINGGUAN_KEY = 'wtp_mingguan';
const SESSION_KEY  = 'wtp_session';

const defaultUsers: User[] = [
    { id: 'u0', username: 'admin', password: 'admin123', nama: 'Administrator', role: 'admin' },
    { id: 'u1', username: 'andri', password: '12345',    nama: 'Andri',         role: 'operator' },
    { id: 'u2', username: 'tio',   password: '12345',    nama: 'Tio',           role: 'operator' },
    { id: 'u3', username: 'fajar', password: '12345',    nama: 'Fajar',         role: 'operator' },
    { id: 'u4', username: 'ade',   password: '12345',    nama: 'Ade',           role: 'operator' },
];

// --- Users ---
export function getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) { localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers)); return defaultUsers; }
    return JSON.parse(raw);
}
export function saveUsers(u: User[]): void { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
export function getUserById(id: string): User | undefined { return getUsers().find(u => u.id === id); }

// --- Session ---
export function getSession(): User | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return getUserById(JSON.parse(raw) as string) ?? null;
}
export function setSession(userId: string): void { localStorage.setItem(SESSION_KEY, JSON.stringify(userId)); }
export function clearSession(): void { localStorage.removeItem(SESSION_KEY); }
export function login(username: string, password: string): User | null {
    const u = getUsers().find(u => u.username === username && u.password === password);
    if (u) setSession(u.id);
    return u ?? null;
}

// --- Catatan Waktu (per 2 jam) ---
export function getCatatan(): CatatanWaktu[] {
    const raw = localStorage.getItem(CATATAN_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}
export function saveCatatan(list: CatatanWaktu[]): void { localStorage.setItem(CATATAN_KEY, JSON.stringify(list)); }
export function addCatatan(c: CatatanWaktu): void { const list = getCatatan(); list.push(c); saveCatatan(list); }
export function deleteCatatan(id: string): void { saveCatatan(getCatatan().filter(c => c.id !== id)); }
export function getCatatanByTanggal(tanggal: string): CatatanWaktu[] { return getCatatan().filter(c => c.tanggal === tanggal); }

// --- Laporan Mingguan ---
export function getMingguan(): LaporanMingguan[] {
    const raw = localStorage.getItem(MINGGUAN_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}
export function saveMingguan(list: LaporanMingguan[]): void { localStorage.setItem(MINGGUAN_KEY, JSON.stringify(list)); }
export function addMingguan(m: LaporanMingguan): void { const list = getMingguan(); list.push(m); saveMingguan(list); }
export function deleteMingguan(id: string): void { saveMingguan(getMingguan().filter(m => m.id !== id)); }

// --- Utility ---
export function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
