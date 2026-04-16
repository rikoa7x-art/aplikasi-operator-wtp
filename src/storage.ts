import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { User, CatatanWaktu, LaporanMingguan, CatatanListrik } from './types';
import { db } from './firebase';

const SESSION_KEY = 'wtp_session';

const defaultUsers: User[] = [
    { id: 'u_admin', username: 'admin',   nama: 'Administrator', role: 'admin' },
    // Subang
    { id: 'u_sbg_1', username: 'fajar',   nama: 'Fajar', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Subang' },
    { id: 'u_sbg_2', username: 'tio',     nama: 'Tio',   role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Subang' },
    { id: 'u_sbg_3', username: 'andri',   nama: 'Andri', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Subang' },
    { id: 'u_sbg_4', username: 'ade',     nama: 'Ade',   role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Subang' },
    { id: 'u_sbg_5', username: 'jajang',  nama: 'Jajang',role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Subang' },
    // Jalan Cagak
    { id: 'u_jc_1',  username: 'didin',   nama: 'Didin', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Jalan Cagak' },
    { id: 'u_jc_2',  username: 'yayat',   nama: 'Yayat', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Jalan Cagak' },
    // Kasomalang
    { id: 'u_ksm_1', username: 'korib',   nama: 'Korib', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Kasomalang' },
    { id: 'u_ksm_2', username: 'cepin',   nama: 'Cepin', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Kasomalang' },
    // Cisalak
    { id: 'u_csl_1', username: 'itang',   nama: 'Itang', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Cisalak' },
    { id: 'u_csl_2', username: 'gino',    nama: 'Gino',  role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Cisalak' },
    // Tanjungsiang
    { id: 'u_tjs_1', username: 'ajat',    nama: 'Ajat',  role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Tanjungsiang' },
    { id: 'u_tjs_2', username: 'ajang',   nama: 'Ajang', role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Tanjungsiang' },
    // Sagalaherang
    { id: 'u_sgh_1', username: 'agus',    nama: 'Agus',  role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Sagalaherang' },
    { id: 'u_sgh_2', username: 'tono',    nama: 'Tono',  role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Sagalaherang' },
    // Pagaden
    { id: 'u_pgd_1', username: 'adit',    nama: 'Adit',  role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Pagaden' },
    // Binong
    { id: 'u_bng_1', username: 'jejen',   nama: 'Jejen', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Binong' },
    { id: 'u_bng_2', username: 'kandi',   nama: 'Kandi', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Binong' },
    { id: 'u_bng_3', username: 'yopi',    nama: 'Yopi',  role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Binong' },
    { id: 'u_bng_4', username: 'surwi',   nama: 'Surwi', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Binong' },
    // Pamanukan
    { id: 'u_pmn_1', username: 'bimbim',  nama: 'Bimbim',role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Pamanukan' },
    { id: 'u_pmn_2', username: 'heri',    nama: 'Heri',  role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Pamanukan' },
    // Compreng
    { id: 'u_cmp_1', username: 'ratno',   nama: 'Ratno', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Compreng' },
    { id: 'u_cmp_2', username: 'dedi',    nama: 'Dedi',  role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Compreng' },
    { id: 'u_cmp_3', username: 'arya',    nama: 'Arya',  role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Compreng' },
    // Pusakanagara
    { id: 'u_psk_1', username: 'arja',    nama: 'Arja',  role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Pusakanagara' },
    // Blanakan
    { id: 'u_blk_1', username: 'yana',    nama: 'Yana',  role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Blanakan' },
    { id: 'u_blk_2', username: 'dadan',   nama: 'Dadan', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Blanakan' },
    // Pabuaran
    { id: 'u_pbr_1', username: 'adrian',  nama: 'Adrian',role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Pabuaran' },
    { id: 'u_pbr_2', username: 'aan',     nama: 'Aan',   role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Pabuaran' },
    // Kalijati (Note: Fajar username modified to 'fajar_k' to prevent dup with Subang)
    { id: 'u_klj_1', username: 'fajar_k', nama: 'Fajar', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Kalijati' },
    { id: 'u_klj_2', username: 'rizki',   nama: 'Rizki', role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Kalijati' },
    { id: 'u_klj_3', username: 'deni',    nama: 'Deni',  role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Kalijati' },
    { id: 'u_klj_4', username: 'hendrik', nama: 'Hendrik',role: 'operator', tipeOperator: 'operator_wtp', cabang: 'Kalijati' },
    // Purwadadi
    { id: 'u_pwd_1', username: 'edi',     nama: 'Edi',   role: 'operator', tipeOperator: 'operator_reservoir', cabang: 'Purwadadi' },
];

/** Utility to generate unique ID */
export function generateId(): string { 
    return Date.now().toString(36) + Math.random().toString(36).slice(2); 
}

/** Hapus semua field undefined/null dari objek sebelum dikirim ke Firestore */
function stripUndefined<T extends object>(obj: T): T {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
    ) as T;
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
export async function login(username: string): Promise<User | null> {
    const users = await getUsers();
    const u = users.find(u => u.username === username);
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
        let firestoreUsers: User[] = [];
        
        if (snap.empty) {
            // Seed initial users completely if empty
            await Promise.all(defaultUsers.map(u => setDoc(doc(db!, 'users', u.id), u)));
            return defaultUsers;
        } else {
            firestoreUsers = snap.docs.map((d: any) => d.data() as User);
        }

        // Auto-sync: pastikan semua field user selalu up-to-date dari defaultUsers
        // Penting: sync cabang, tipeOperator, dan id agar filter admin bekerja dengan benar
        for (const du of defaultUsers) {
            const existingMatch = firestoreUsers.find(u => u.username === du.username);
            if (!existingMatch) {
                // User baru — tambahkan ke Firestore
                await setDoc(doc(db!, 'users', du.id), du);
                firestoreUsers.push(du);
            } else {
                // Cek apakah ada field yang perlu diupdate
                const needsUpdate =
                    existingMatch.tipeOperator !== du.tipeOperator ||
                    existingMatch.cabang !== du.cabang ||
                    !existingMatch.cabang; // cabang kosong/undefined = pasti perlu diupdate
                if (needsUpdate) {
                    const updated: User = {
                        ...existingMatch,
                        tipeOperator: du.tipeOperator,
                        cabang: du.cabang,     // pastikan cabang selalu benar
                        id: existingMatch.id,  // pertahankan id asli
                    };
                    await setDoc(doc(db!, 'users', existingMatch.id), updated);
                    Object.assign(existingMatch, updated);
                }
            }
        }
        
        return firestoreUsers;
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
export async function saveUser(u: User): Promise<void> {
    await ensureDb();
    await setDoc(doc(db!, 'users', u.id), u);
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
    await setDoc(doc(db!, 'catatan', c.id), stripUndefined(c));
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
    await setDoc(doc(db!, 'laporan_mingguan', m.id), stripUndefined(m));
}
export async function deleteMingguan(id: string): Promise<void> { 
    await ensureDb();
    await deleteDoc(doc(db!, 'laporan_mingguan', id));
}

// --- Catatan Listrik Harian (WBP / LWBP / KVARH) ---
export async function getCatatanListrik(): Promise<CatatanListrik[]> {
    await ensureDb();
    const snap = await getDocs(collection(db!, 'catatan_listrik'));
    return snap.docs.map((d: any) => d.data() as CatatanListrik);
}
export async function saveCatatanListrik(c: CatatanListrik): Promise<void> {
    await ensureDb();
    await setDoc(doc(db!, 'catatan_listrik', c.id), stripUndefined(c));
}
export async function deleteCatatanListrik(id: string): Promise<void> {
    await ensureDb();
    await deleteDoc(doc(db!, 'catatan_listrik', id));
}

// --- Filtered Queries (Performance Optimized) ---

/** Catatan per operator (untuk halaman operator) */
export async function getCatatanByOperator(operatorId: string): Promise<CatatanWaktu[]> {
    await ensureDb();
    const q = query(collection(db!, 'catatan'), where('operatorId', '==', operatorId));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => d.data() as CatatanWaktu);
}

/** Catatan per tanggal (untuk admin dashboard) */
export async function getCatatanByDate(tanggal: string): Promise<CatatanWaktu[]> {
    await ensureDb();
    const q = query(collection(db!, 'catatan'), where('tanggal', '==', tanggal));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => d.data() as CatatanWaktu);
}

/** Laporan mingguan per operator */
export async function getMingguanByOperator(operatorId: string): Promise<LaporanMingguan[]> {
    await ensureDb();
    const q = query(collection(db!, 'laporan_mingguan'), where('operatorId', '==', operatorId));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => d.data() as LaporanMingguan);
}

/** Catatan listrik per operator */
export async function getCatatanListrikByOperator(operatorId: string): Promise<CatatanListrik[]> {
    await ensureDb();
    const q = query(collection(db!, 'catatan_listrik'), where('operatorId', '==', operatorId));
    const snap = await getDocs(q);
    return snap.docs.map((d: any) => d.data() as CatatanListrik);
}
