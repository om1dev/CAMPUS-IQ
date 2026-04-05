const { adminClient } = require('../config/supabase');
const { ALLOWED_TABLES } = require('../config/rdTables');
const { getSignedUrl, uploadRecordFile } = require('./storageService');
const ApiError = require('../utils/ApiError');

function validateTableName(tableName) {
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new ApiError(404, 'Invalid R&D table name');
  }
}

function applyVisibilityFilter(query, user) {
  const role = user.profile.role;

  if (role === 'student') {
    return query.eq('owner_id', user.profile.id);
  }

  if (role === 'faculty') {
    return query.eq('owner_id', user.profile.id);
  }

  if (role === 'hod') {
    if (!user.profile.department_id) {
      return query.eq('owner_id', '00000000-0000-0000-0000-000000000000');
    }
    return query.eq('department_id', user.profile.department_id);
  }

  return query;
}

async function hydrateAttachment(record) {
  if (!record) return record;
  if (Array.isArray(record)) {
    const out = [];
    for (const row of record) {
      out.push(await hydrateAttachment(row));
    }
    return out;
  }

  if (record.attachment_path) {
    record.attachment_url = await getSignedUrl(record.attachment_path);
  } else {
    record.attachment_url = null;
  }

  return record;
}

async function listRecords(tableName, user, filters = {}) {
  validateTableName(tableName);
  let query = adminClient
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });

  query = applyVisibilityFilter(query, user);

  if (filters.year) query = query.eq('year', Number(filters.year));
  if (filters.department_id) query = query.eq('department_id', filters.department_id);
  if (filters.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new ApiError(400, error.message);
  return hydrateAttachment(data || []);
}

async function getRecordById(tableName, id, user) {
  validateTableName(tableName);
  let query = adminClient.from(tableName).select('*').eq('id', id);
  query = applyVisibilityFilter(query, user);

  const { data, error } = await query.maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'Record not found');
  return hydrateAttachment(data);
}

async function createRecord(tableName, payload, file, user) {
  validateTableName(tableName);
  const attachment_path = file ? await uploadRecordFile(file, user.profile.id, tableName) : null;

  const row = {
    owner_id: user.profile.id,
    department_id: payload.department_id || user.profile.department_id || null,
    year: payload.year ? Number(payload.year) : null,
    title: payload.title,
    data: payload.data || {},
    attachment_path,
    status: 'draft',
    is_submitted: false
  };

  const { data, error } = await adminClient
    .from(tableName)
    .insert([row])
    .select()
    .single();

  if (error) throw new ApiError(400, error.message);
  return hydrateAttachment(data);
}

async function updateRecord(tableName, id, payload, file, user) {
  validateTableName(tableName);

  const existing = await getRecordById(tableName, id, user);
  if (existing.is_submitted && user.profile.role === 'student') {
    throw new ApiError(400, 'Submitted record cannot be edited by student');
  }

  const patch = {
    title: payload.title ?? existing.title,
    year: payload.year !== undefined ? Number(payload.year) : existing.year,
    data: payload.data ?? existing.data,
    updated_at: new Date().toISOString()
  };

  if (file) {
    patch.attachment_path = await uploadRecordFile(file, user.profile.id, tableName);
  }

  const { data, error } = await adminClient
    .from(tableName)
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApiError(400, error.message);
  return hydrateAttachment(data);
}

async function deleteRecord(tableName, id, user) {
  validateTableName(tableName);
  const existing = await getRecordById(tableName, id, user);

  if (existing.is_submitted) {
    throw new ApiError(400, 'Submitted record cannot be deleted');
  }

  const { error } = await adminClient
    .from(tableName)
    .delete()
    .eq('id', id);

  if (error) throw new ApiError(400, error.message);
  return true;
}

async function markRecordSubmitted(tableName, id, status = 'submitted') {
  validateTableName(tableName);
  const { data, error } = await adminClient
    .from(tableName)
    .update({
      is_submitted: true,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApiError(400, error.message);
  return data;
}

async function updateRecordSubmissionStatus(tableName, id, status) {
  validateTableName(tableName);
  const { data, error } = await adminClient
    .from(tableName)
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new ApiError(400, error.message);
  return data;
}

module.exports = {
  validateTableName,
  listRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  markRecordSubmitted,
  updateRecordSubmissionStatus
};
