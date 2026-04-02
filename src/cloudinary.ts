/**
 * Cloudinary Upload Utility
 * Upload foto ke Cloudinary menggunakan Unsigned Upload Preset
 */

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

/**
 * Upload base64 dataURL ke Cloudinary
 * @returns Cloudinary secure_url (https://...)
 */
export async function uploadToCloudinary(dataUrl: string): Promise<string> {
    if (!CLOUD_NAME || CLOUD_NAME === 'isi_cloud_name_anda_disini') {
        throw new Error('Cloud Name belum diisi. Edit file .env terlebih dahulu.');
    }
    if (!UPLOAD_PRESET) {
        throw new Error('Upload Preset belum diisi. Edit file .env terlebih dahulu.');
    }

    const formData = new FormData();
    formData.append('file', dataUrl);               // base64 dataURL
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'wtp-laporan');       // disimpan di folder wtp-laporan

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
    );

    if (!res.ok) {
        let msg = `Upload gagal (HTTP ${res.status})`;
        try {
            const err = await res.json();
            if (err?.error?.message) msg = err.error.message;
        } catch { /* ignore */ }
        throw new Error(msg);
    }

    const data = await res.json();
    return data.secure_url as string; // URL permanen Cloudinary
}
