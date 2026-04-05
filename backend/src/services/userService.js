const { adminClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');

async function createProfile(payload) {
  const row = {
    ...payload,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await adminClient
    .from('profiles')
    .insert([row])
    .select()
    .single();

  if (error) {
    throw new ApiError(400, error.message);
  }

  return data;
}

async function getProfileById(id) {
  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new ApiError(400, error.message);
  }

  return data;
}

async function listUsers(filters = {}) {
  let query = adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.role) query = query.eq('role', filters.role);
  if (filters.department_id) query = query.eq('department_id', filters.department_id);
  if (filters.assigned_faculty_id) query = query.eq('assigned_faculty_id', filters.assigned_faculty_id);

  const { data, error } = await query;
  if (error) {
    throw new ApiError(400, error.message);
  }

  return data || [];
}

async function listAssignedStudents(facultyId) {
  return listUsers({ role: 'student', assigned_faculty_id: facultyId });
}

module.exports = {
  createProfile,
  getProfileById,
  listUsers,
  listAssignedStudents
};
