import ImageKit from 'imagekit'
import config from '../config/config.js'

const imagekit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
})

async function uploadFile(buffer) {
    const result = await imagekit.upload({
        file: buffer.toString("base64"),
        fileName: `product_${Date.now()}.jpg`,
    })
    return result;
}

export default uploadFile
