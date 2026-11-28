import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Uploaded files are stored on Cloudinary when credentials are configured.
 * In development (or when credentials are missing) they fall back to the
 * local `server/uploads` directory, which is served at `/uploads`.
 */
export const LOCAL_UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');
export const LOCAL_UPLOAD_PATH = '/uploads';

const PLACEHOLDER_VALUES = new Set([
  '',
  'placeholder-cloud-name',
  'placeholder-api-key',
  'placeholder-api-secret',
]);

const cloudName = (process.env.CLOUD_NAME || '').trim();
const apiKey = (process.env.API_KEY || '').trim();
const apiSecret = (process.env.SECRET_KEY || '').trim();

export const isCloudinaryConfigured = Boolean(
  cloudName &&
    apiKey &&
    apiSecret &&
    !PLACEHOLDER_VALUES.has(cloudName) &&
    !PLACEHOLDER_VALUES.has(apiKey) &&
    !PLACEHOLDER_VALUES.has(apiSecret)
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  console.warn(
    '[storage] Cloudinary is not configured. Files will be stored locally in server/uploads.'
  );
}

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/aac': '.aac',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/webm': '.webm',
};

function getExtension(file) {
  const fromName = path.extname(file.originalname || '').toLowerCase();
  if (fromName && fromName.length <= 10) return fromName;
  return MIME_EXTENSIONS[file.mimetype] || '';
}

function safeBaseName(originalName) {
  const base = path
    .basename(originalName || 'file', path.extname(originalName || ''))
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48)
    .replace(/^-|-$/g, '');
  return base || 'file';
}

function buildFileName(file) {
  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeBaseName(
    file.originalname
  )}${getExtension(file)}`;
}

export function getPublicBaseUrl(req) {
  const configured = (process.env.PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;

  const host = req?.get?.('host');
  if (host) return `${req.protocol}://${host}`;

  return `http://localhost:${process.env.PORT || 3000}`;
}

export const uploadToCloudinary = async (file) => {
  if (!file?.buffer || !file?.mimetype) {
    throw new Error('Invalid file object provided.');
  }

  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured.');
  }

  const bufferStream = new Readable();
  bufferStream.push(file.buffer);
  bufferStream.push(null);

  const resourceType = file.mimetype.startsWith('image') ? 'image' : 'raw';
  const publicId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'iweohun',
        resource_type: resourceType,
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          provider: 'cloudinary',
        });
      }
    );

    bufferStream.pipe(stream);
  });
};

async function saveLocally(file, req) {
  if (!file?.buffer) {
    throw new Error('Invalid file object provided.');
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const fileName = buildFileName(file);
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, fileName), file.buffer);

  return {
    secureUrl: `${getPublicBaseUrl(req)}${LOCAL_UPLOAD_PATH}/${fileName}`,
    publicId: fileName,
    resourceType: file.mimetype.startsWith('image') ? 'image' : 'raw',
    provider: 'local',
  };
}

/**
 * Upload one multer file (memory storage) and return a public URL.
 */
export const uploadFile = async (file, req) => {
  if (!file) throw new Error('No file provided.');
  return isCloudinaryConfigured ? uploadToCloudinary(file) : saveLocally(file, req);
};

const extractCloudinaryPublicId = (url) => {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  return pathname.replace(/\.[^/.]+$/, '').replace(/^\//, '');
};

export const deleteFromCloudinary = async (input) => {
  if (!input) throw new Error('Public ID or URL is required for deletion.');
  if (!isCloudinaryConfigured) throw new Error('Cloudinary is not configured.');

  const publicId = input.startsWith('http') ? extractCloudinaryPublicId(input) : input;

  let lastResult = 'not found';
  for (const resourceType of ['image', 'raw', 'video']) {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    lastResult = result.result;
    if (result.result === 'ok') return { success: true, publicId, resourceType };
  }

  if (lastResult === 'not found') return { success: true, publicId, missing: true };
  throw new Error(`Failed to delete file with Public ID: ${publicId}. Result: ${lastResult}`);
};

const deleteLocalFile = async (input) => {
  let fileName = input;
  if (/^https?:\/\//i.test(input)) {
    try {
      fileName = path.basename(new URL(input).pathname);
    } catch {
      return { success: false, reason: 'invalid-url' };
    }
  }
  // Path traversal guard: only touch files directly inside uploads.
  fileName = path.basename(fileName);
  const fullPath = path.join(LOCAL_UPLOAD_DIR, fileName);

  try {
    await fs.unlink(fullPath);
    return { success: true, publicId: fileName };
  } catch (error) {
    if (error.code === 'ENOENT') return { success: true, publicId: fileName, missing: true };
    throw error;
  }
};

/**
 * Remove a previously uploaded file. Safe to skip when a file has no known id.
 */
export const deleteFile = async (input) => {
  if (!input) return { success: false, reason: 'no-input' };
  return isCloudinaryConfigured ? deleteFromCloudinary(input) : deleteLocalFile(input);
};

export default cloudinary;
