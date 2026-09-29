const { v2: cloudinary } = require("cloudinary");
require("dotenv").config({ path: require('node:path').join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isUploadConfigured = () => ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].every(key => Boolean(process.env[key]?.trim()));
/** Shared storage only: never fall back to an instance's local filesystem. */
const uploadBuffer = (buffer, folder = "misty-mounts") => {
  if (!isUploadConfigured()) return Promise.reject(Object.assign(new Error('Uploads are not configured'), { status: 503 }));
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'], timeout: 20000 },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.on('error', reject);
    stream.end(buffer);
  });
};

module.exports = { cloudinary, uploadBuffer, isUploadConfigured };
