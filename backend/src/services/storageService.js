const path = require('path');
const env = require('../config/env');
const { adminClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function uploadRecordFile(file, ownerId, tableName) {
  if (!file) return null;

  const ext = path.extname(file.originalname || '') || '';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = `${tableName}/${ownerId}/${safeName}`;

  const { error } = await adminClient.storage
    .from(env.storageBucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    throw new ApiError(400, error.message);
  }

  return filePath;
}

async function getSignedUrl(filePath) {
  if (!filePath) return null;

  const { data, error } = await adminClient.storage
    .from(env.storageBucket)
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    return null;
  }

  return data?.signedUrl || null;
}

module.exports = {
  uploadRecordFile,
  getSignedUrl
};
