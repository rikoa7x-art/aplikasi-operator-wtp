import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import type { User, CatatanWaktu, LaporanMingguan } from './types';
import { db } from './firebase';

const SESSION_KEY = 'wtp_session';

const defaultUsers: User[] = [
    { id: 'u0', username: 'admin', password: 'admin123', nama: 'Administrator', role: 'admin' },
    { id: 'u1', username: 'andri', password: '12345',    nama: 'Andri',         role: 'operator' },
    { id: 'u2', username: 'tio',   password: '12345',    nama: 'Tio',           role: 'operator' },
    { id: 'u3', username: 'fajar', password: '12345',    nama: 'Fajar',         role: 'operator' },
    { id: 'u4', username: 'ade',   password: '12345',    nama: 'Ade',           role: 'operator' },
];

/** Utility to generate unique ID */
export function generateId(): string { 
    return Date.now().toString(36) + Math.random().toString(36).slice(2); 
}

// --- Session (Local Storage) ---
export async function getSession(): Promise<User | null> {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const userId = JSON.parse(raw) as string;
    const user = await getUserById(userId);
    return user || null;
}
export function setSession(userId: string): void { 
    localStorage.setItem(SESSION_KEY, JSON.stringify(userId)); 
}
export function clearSession(): void { 
    localStorage.removeItem(SESSION_KEY); 
}
export async function login(username: string, password: string): Promise<User | null> {
    const users = await getUsers();
    const u = users.find(u => u.username === username && u.password === password);
    if (u) setSession(u.id);
    return u ?? null;
}

// --- Helper Functions ---
async function ensureDb() {
    if (!db) throw new Error("Firebase belum dikonfigurasi. Periksa file .env.");
}

// --- Users (Firestore) ---
export async function getUsers(): Promise<User[]> {
    try {
        await ensureDb();
        const snap = await getDocs(collection(db!, 'users'));
        if (snap.empty) {
            // Seed initial users
            await Promise.all(defaultUsers.map(u => setDoc(doc(db!, 'users', u.id), u)));
            return defaultUsers;
        }
        return snap.docs.map((d: any) => d.data() as User);
    } catch (e) {
        console.error("Error getUsers:", e);
        // Fallback to local if no internet/db
        return defaultUsers;
    }
}
export async function saveUsers(users: User[]): Promise<void> { 
    await ensureDb();
    // Overwriting the collection is complex in Firestore, so we save each user.
    await Promise.all(users.map(u => setDoc(doc(db!, 'users', u.id), u)));
}
export async function deleteUser(id: string): Promise<void> {
    await ensureDb();
    await deleteDoc(doc(db!, 'users', id));
}
export async function getUserById(id: string): Promise<User | undefined> { 
    await ensureDb();
    const d = await getDoc(doc(db!, 'users', id));
    return d.exists() ? d.data() as User : undefined;
}

// --- Catatan Waktu (per 2 jam) ---
export async function getCatatan(): Promise<CatatanWaktu[]> {
    await ensureDb();
    const snap = await getDocs(collection(db!, 'catatan'));
    return snap.docs.map((d: any) => d.data() as CatatanWaktu);
}
export async function saveCatatan(c: CatatanWaktu): Promise<void> { 
    await ensureDb();
    await setDoc(doc(db!, 'catatan', c.id), c);
}
export async function deleteCatatan(id: string): Promise<void> { 
    await ensureDb();
    await deleteDoc(doc(db!, 'catatan', id));
}

// --- Laporan Mingguan ---
export async function getMingguan(): Promise<LaporanMingguan[]> {
    await ensureDb();
    const snap = await getDocs(collection(db!, 'laporan_mingguan'));
    return snap.docs.map((d: any) => d.data() as LaporanMingguan);
}
export async function saveMingguanObj(m: LaporanMingguan): Promise<void> { 
    await ensureDb();
    await setDoc(doc(db!, 'laporan_mingguan', m.id), m);
}
export async function deleteMingguan(id: string): Promise<void> { 
    await ensureDb();
    await deleteDoc(doc(db!, 'laporan_mingguan', id));
}
