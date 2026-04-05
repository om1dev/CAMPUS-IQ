const { adminClient } = require('../config/supabase');
const { ROLE_FLOW } = require('../config/rdTables');
const ApiError = require('../utils/ApiError');
const userService = require('./userService');
const recordService = require('./recordService');
const { createSubmissionLog } = require('./auditService');
const { getSignedUrl } = require('./storageService');

function getNextRole(flow, currentIndex) {
  return flow[currentIndex] || null;
}

async function findActiveSubmission(tableName, recordId) {
  const { data, error } = await adminClient
    .from('submissions')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .in('status', ['pending_faculty', 'pending_hod', 'pending_admin', 'approved'])
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  return data;
}

async function loadRecordSnapshot(tableName, recordId) {
  const { data, error } = await adminClient
    .from(tableName)
    .select('*')
    .eq('id', recordId)
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) return null;

  if (data.attachment_path) {
    data.attachment_url = await getSignedUrl(data.attachment_path);
  } else {
    data.attachment_url = null;
  }

  return data;
}

async function loadLinkedItems(submissionId) {
  const { data, error } = await adminClient
    .from('submission_items')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  if (error) throw new ApiError(400, error.message);

  const items = data || [];
  const output = [];

  for (const item of items) {
    const linkedRecord = await loadRecordSnapshot(item.table_name, item.record_id);
    output.push({
      ...item,
      record: linkedRecord
    });
  }

  return output;
}

async function createSubmission(tableName, payload, user) {
  const record = await recordService.getRecordById(tableName, payload.recordId, user);

  if (record.owner_id !== user.profile.id && !['admin', 'superadmin'].includes(user.profile.role)) {
    throw new ApiError(403, 'Only the owner can submit this record');
  }

  const activeSubmission = await findActiveSubmission(tableName, payload.recordId);
  if (activeSubmission) {
    throw new ApiError(400, 'An active submission already exists for this record');
  }

  const flow = ROLE_FLOW[user.profile.role] || [];
  if (!flow.length) {
    throw new ApiError(400, 'This role does not require approval workflow');
  }

  const firstRole = flow[0];
  let currentReviewerId = null;

  if (firstRole === 'faculty') {
    if (!user.profile.assigned_faculty_id) {
      throw new ApiError(400, 'Student is not assigned to any faculty');
    }
    currentReviewerId = user.profile.assigned_faculty_id;
  }

  const { data, error } = await adminClient
    .from('submissions')
    .insert([{
      table_name: tableName,
      record_id: payload.recordId,
      submitter_id: user.profile.id,
      submitter_role: user.profile.role,
      department_id: user.profile.department_id,
      assigned_faculty_id: user.profile.assigned_faculty_id || null,
      current_reviewer_role: firstRole,
      current_reviewer_id: currentReviewerId,
      current_step: 1,
      status: `pending_${firstRole}`,
      remarks: payload.remarks || null
    }])
    .select()
    .single();

  if (error) throw new ApiError(400, error.message);

  const linkedRecords = Array.isArray(payload.linkedRecords) ? payload.linkedRecords : [];
  if (linkedRecords.length) {
    const items = linkedRecords.map((item) => ({
      submission_id: data.id,
      table_name: item.tableName,
      record_id: item.recordId
    }));

    const { error: itemError } = await adminClient
      .from('submission_items')
      .insert(items);

    if (itemError) throw new ApiError(400, itemError.message);
  }

  await recordService.markRecordSubmitted(tableName, payload.recordId, data.status);

  await createSubmissionLog({
    submission_id: data.id,
    action: 'submitted',
    actor_id: user.profile.id,
    actor_role: user.profile.role,
    remarks: payload.remarks || 'Submission created',
    metadata: { table_name: tableName, record_id: payload.recordId }
  });

  return await getSubmissionById(data.id, user, true);
}

function canSeeSubmission(submission, user) {
  const role = user.profile.role;
  const userId = user.profile.id;
  const departmentId = user.profile.department_id;

  if (role === 'student') {
    return submission.submitter_id === userId;
  }

  if (role === 'faculty') {
    return submission.submitter_id === userId || (
      submission.current_reviewer_role === 'faculty' &&
      submission.assigned_faculty_id === userId
    );
  }

  if (role === 'hod') {
    return submission.department_id && departmentId && submission.department_id === departmentId;
  }

  if (role === 'admin' || role === 'superadmin') {
    return true;
  }

  return false;
}

async function enrichSubmissions(rows) {
  const output = [];

  for (const row of rows) {
    const logsRes = await adminClient
      .from('submission_logs')
      .select('*')
      .eq('submission_id', row.id)
      .order('created_at', { ascending: true });

    const submitter = await userService.getProfileById(row.submitter_id);
    const reviewer = row.current_reviewer_id
      ? await userService.getProfileById(row.current_reviewer_id)
      : null;

    const record = await loadRecordSnapshot(row.table_name, row.record_id);
    const linked_items = await loadLinkedItems(row.id);

    output.push({
      ...row,
      record,
      linked_items,
      logs: logsRes.data || [],
      submitter,
      current_reviewer: reviewer
    });
  }

  return output;
}

async function listSubmissions(user, filters = {}) {
  let query = adminClient
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.department_id) query = query.eq('department_id', filters.department_id);

  const { data, error } = await query;
  if (error) throw new ApiError(400, error.message);

  let visible = (data || []).filter((row) => canSeeSubmission(row, user));

  if (filters.year || filters.search) {
    const enriched = await enrichSubmissions(visible);
    visible = enriched.filter((item) => {
      const okYear = filters.year ? Number(item.record?.year) === Number(filters.year) : true;
      const okSearch = filters.search
        ? String(item.record?.title || '').toLowerCase().includes(String(filters.search).toLowerCase())
        : true;
      return okYear && okSearch;
    });
    return visible;
  }

  return enrichSubmissions(visible);
}

async function getSubmissionById(id, user, bypassVisibility = false) {
  const { data, error } = await adminClient
    .from('submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'Submission not found');

  if (!bypassVisibility && !canSeeSubmission(data, user)) {
    throw new ApiError(403, 'You cannot access this submission');
  }

  const enriched = await enrichSubmissions([data]);
  return enriched[0];
}

function assertCanReview(submission, user) {
  const role = user.profile.role;

  if (role === 'faculty') {
    if (!(submission.current_reviewer_role === 'faculty' && submission.assigned_faculty_id === user.profile.id)) {
      throw new ApiError(403, 'Only assigned faculty can review this submission');
    }
    return;
  }

  if (role === 'hod') {
    if (submission.current_reviewer_role !== 'hod') {
      throw new ApiError(403, 'This submission is not waiting for HOD approval');
    }
    if (!user.profile.department_id || submission.department_id !== user.profile.department_id) {
      throw new ApiError(403, 'HOD can see only department submissions');
    }
    return;
  }

  if (role === 'admin' || role === 'superadmin') {
    if (submission.current_reviewer_role !== 'admin') {
      throw new ApiError(403, 'This submission is not waiting for admin approval');
    }
    return;
  }

  throw new ApiError(403, 'You cannot review this submission');
}

async function approveSubmission(id, user, remarks = '') {
  const submission = await getSubmissionById(id, user, true);
  assertCanReview(submission, user);

  const flow = ROLE_FLOW[submission.submitter_role] || [];
  const nextRole = getNextRole(flow, submission.current_step);

  const patch = {
    updated_at: new Date().toISOString(),
    remarks: remarks || submission.remarks
  };

  if (nextRole) {
    patch.status = `pending_${nextRole}`;
    patch.current_reviewer_role = nextRole;
    patch.current_step = submission.current_step + 1;
    patch.current_reviewer_id = nextRole === 'faculty' ? submission.assigned_faculty_id : null;
  } else {
    patch.status = 'approved';
    patch.current_reviewer_role = null;
    patch.current_reviewer_id = null;
    patch.current_step = submission.current_step + 1;
  }

  const { error } = await adminClient
    .from('submissions')
    .update(patch)
    .eq('id', id);

  if (error) throw new ApiError(400, error.message);

  await recordService.updateRecordSubmissionStatus(submission.table_name, submission.record_id, patch.status);

  await createSubmissionLog({
    submission_id: id,
    action: patch.status === 'approved' ? 'approved_final' : 'approved_step',
    actor_id: user.profile.id,
    actor_role: user.profile.role,
    remarks: remarks || 'Approved',
    metadata: { next_status: patch.status }
  });

  return getSubmissionById(id, user, true);
}

async function rejectSubmission(id, user, remarks = '') {
  const submission = await getSubmissionById(id, user, true);
  assertCanReview(submission, user);

  const patch = {
    status: 'rejected',
    current_reviewer_role: null,
    current_reviewer_id: null,
    updated_at: new Date().toISOString(),
    remarks: remarks || submission.remarks
  };

  const { error } = await adminClient
    .from('submissions')
    .update(patch)
    .eq('id', id);

  if (error) throw new ApiError(400, error.message);

  await recordService.updateRecordSubmissionStatus(submission.table_name, submission.record_id, 'rejected');

  await createSubmissionLog({
    submission_id: id,
    action: 'rejected',
    actor_id: user.profile.id,
    actor_role: user.profile.role,
    remarks: remarks || 'Rejected',
    metadata: {}
  });

  return getSubmissionById(id, user, true);
}

module.exports = {
  createSubmission,
  listSubmissions,
  getSubmissionById,
  approveSubmission,
  rejectSubmission
};