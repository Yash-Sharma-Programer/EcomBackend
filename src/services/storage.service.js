import ImageKit from 'imagekit'
import config from '../config/config.js'

const imagekit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
})

async function uploadFile(buffer, prefix = "file") {
    const result = await imagekit.upload({
        file: buffer.toString("base64"),
        fileName: `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`,
    })
    return result;
}

async function uploadMultiple(files = [], prefix = "file") {
    return Promise.all(files.map(f => uploadFile(f.buffer, prefix)))
}

async function deleteFile(fileId) {
    if (!fileId) return
    try {
        await imagekit.deleteFile(fileId)
    } catch {
        // best-effort cleanup; ignore failures
    }
}

export default uploadFile;
export { uploadMultiple, deleteFile };
