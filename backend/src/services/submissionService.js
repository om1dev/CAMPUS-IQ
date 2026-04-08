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

  return {
    ...data,
    attachment_url: data.attachment_path ? await getSignedUrl(data.attachment_path) : null,
  };
}

async function loadLinkedItems(submissionId) {
  const { data, error } = await adminClient
    .from('submission_items')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  if (error) throw new ApiError(400, error.message);

  const rows = data || [];
  const output = [];

  for (const row of rows) {
    const record = await loadRecordSnapshot(row.table_name, row.record_id);
    output.push({
      ...row,
      record,
    });
  }

  return output;
}

async function enrichLogs(logs = []) {
  const uniqueActorIds = [...new Set(logs.map((log) => log.actor_id).filter(Boolean))];
  const actorMap = {};

  for (const actorId of uniqueActorIds) {
    actorMap[actorId] = await userService.getProfileById(actorId);
  }

  return logs.map((log) => ({
    ...log,
    actor: log.actor_id ? actorMap[log.actor_id] || null : null,
  }));
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
      remarks: payload.remarks || null,
    }])
    .select()
    .single();

  if (error) throw new ApiError(400, error.message);

  const linkedRecords = Array.isArray(payload.linkedRecords) ? payload.linkedRecords : [];
  if (linkedRecords.length) {
    const items = linkedRecords.map((item) => ({
      submission_id: data.id,
      table_name: item.tableName,
      record_id: item.recordId,
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
    metadata: {
      table_name: tableName,
      record_id: payload.recordId,
      to_status: data.status,
    },
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
    // IMPORTANT FIX:
    // faculty must continue seeing student records assigned to them
    // even after the item moves from faculty -> HOD -> admin
    return submission.submitter_id === userId || submission.assigned_faculty_id === userId;
  }

  if (role === 'hod') {
    // HOD should see full department history, not just currently pending_hod
    return Boolean(submission.department_id && departmentId && submission.department_id === departmentId);
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

    if (logsRes.error) throw new ApiError(400, logsRes.error.message);

    const record = await loadRecordSnapshot(row.table_name, row.record_id);
    const linked_items = await loadLinkedItems(row.id);

    const submitter = await userService.getProfileById(row.submitter_id);
    const reviewer = row.current_reviewer_id
      ? await userService.getProfileById(row.current_reviewer_id)
      : null;

    const logs = await enrichLogs(logsRes.data || []);

    output.push({
      ...row,
      record,
      linked_items,
      logs,
      submitter,
      current_reviewer: reviewer,
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
    remarks: remarks || submission.remarks,
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
    metadata: {
      table_name: submission.table_name,
      record_id: submission.record_id,
      from_status: submission.status,
      to_status: patch.status,
      previous_reviewer_role: submission.current_reviewer_role,
      next_reviewer_role: patch.current_reviewer_role,
    },
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
    remarks: remarks || submission.remarks,
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
    metadata: {
      table_name: submission.table_name,
      record_id: submission.record_id,
      from_status: submission.status,
      to_status: 'rejected',
      previous_reviewer_role: submission.current_reviewer_role,
    },
  });

  return getSubmissionById(id, user, true);
}

async function getReviewHistorySummary(user) {
  const role = user.profile.role;

  if (!['faculty', 'hod', 'admin', 'superadmin'].includes(role)) {
    return {
      totalReviewed: 0,
      approvedCount: 0,
      rejectedCount: 0,
      finalApprovedCount: 0,
      pendingNow: 0,
      recentHistory: [],
    };
  }

  const { data: logs, error: logsError } = await adminClient
    .from('submission_logs')
    .select('*')
    .eq('actor_id', user.profile.id)
    .in('action', ['approved_step', 'approved_final', 'rejected'])
    .order('created_at', { ascending: false });

  if (logsError) throw new ApiError(400, logsError.message);

  let pendingQuery = adminClient
    .from('submissions')
    .select('*', { count: 'exact', head: true });

  if (role === 'faculty') {
    pendingQuery = pendingQuery
      .eq('current_reviewer_role', 'faculty')
      .eq('assigned_faculty_id', user.profile.id);
  } else if (role === 'hod') {
    pendingQuery = pendingQuery
      .eq('current_reviewer_role', 'hod')
      .eq('department_id', user.profile.department_id);
  } else {
    pendingQuery = pendingQuery.eq('current_reviewer_role', 'admin');
  }

  const { count: pendingNow, error: pendingError } = await pendingQuery;
  if (pendingError) throw new ApiError(400, pendingError.message);

  const enrichedLogs = await enrichLogs(logs || []);
  const recentHistory = [];

  for (const log of enrichedLogs.slice(0, 20)) {
    let submission = null;
    let record = null;
    let submitter = null;

    if (log.submission_id) {
      const { data: submissionRow, error: submissionError } = await adminClient
        .from('submissions')
        .select('*')
        .eq('id', log.submission_id)
        .maybeSingle();

      if (submissionError) throw new ApiError(400, submissionError.message);

      submission = submissionRow || null;

      if (submission?.table_name && submission?.record_id) {
        record = await loadRecordSnapshot(submission.table_name, submission.record_id);
      }

      if (submission?.submitter_id) {
        submitter = await userService.getProfileById(submission.submitter_id);
      }
    }

    recentHistory.push({
      ...log,
      submission,
      record,
      submitter,
      table_name: submission?.table_name || log?.metadata?.table_name || null,
      record_id: submission?.record_id || log?.metadata?.record_id || null,
    });
  }

  return {
    totalReviewed: enrichedLogs.length,
    approvedCount: enrichedLogs.filter(
      (log) => log.action === 'approved_step' || log.action === 'approved_final'
    ).length,
    rejectedCount: enrichedLogs.filter((log) => log.action === 'rejected').length,
    finalApprovedCount: enrichedLogs.filter((log) => log.action === 'approved_final').length,
    pendingNow: pendingNow || 0,
    recentHistory,
  };
}

module.exports = {
  createSubmission,
  listSubmissions,
  getSubmissionById,
  approveSubmission,
  rejectSubmission,
  getReviewHistorySummary,
};