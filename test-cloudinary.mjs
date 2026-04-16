import https from 'https';

const CLOUD_NAME = 'dd4eq9rxe';
const UPLOAD_PRESET = 'wtp_laporan';

const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const postData = new URLSearchParams();
postData.append('file', base64Data);
postData.append('upload_preset', UPLOAD_PRESET);
postData.append('folder', 'wtp-laporan');

const options = {
    hostname: 'api.cloudinary.com',
    path: `/v1_1/${CLOUD_NAME}/image/upload`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData.toString())
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', (e) => console.error(e));
req.write(postData.toString());
req.end();
