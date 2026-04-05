const { adminClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function createSubmissionLog({ submission_id, action, actor_id, actor_role, remarks = null, metadata = {} }) {
  const { data, error } = await adminClient
    .from('submission_logs')
    .insert([{
      submission_id,
      action,
      actor_id,
      actor_role,
      remarks,
      metadata
    }])
    .select()
    .single();

  if (error) {
    throw new ApiError(400, error.message);
  }

  return data;
}

module.exports = {
  createSubmissionLog
};
