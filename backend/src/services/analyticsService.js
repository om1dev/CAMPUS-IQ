const { adminClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function getAdminAnalytics() {
  const { data, error } = await adminClient
    .from('submissions')
    .select('*');

  if (error) throw new ApiError(400, error.message);

  const rows = data || [];

  const byStatus = {};
  const byRole = {};
  const byTable = {};
  const byDepartment = {};

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] || 0) + 1;
    byRole[row.submitter_role] = (byRole[row.submitter_role] || 0) + 1;
    byTable[row.table_name] = (byTable[row.table_name] || 0) + 1;
    const depKey = row.department_id || 'unknown';
    byDepartment[depKey] = (byDepartment[depKey] || 0) + 1;
  }

  return {
    totalSubmissions: rows.length,
    byStatus,
    byRole,
    byTable,
    byDepartment
  };
}

module.exports = {
  getAdminAnalytics
};
