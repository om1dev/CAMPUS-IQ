const { adminClient, anonClient } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const userService = require('./userService');

async function signUpUser(payload) {
  const { email, password, full_name, role = 'student', department_id = null, year = null } = payload;

  if (role !== 'student') {
    throw new ApiError(403, 'Public signup is allowed only for students');
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
  });

  if (error) {
    throw new ApiError(400, error.message);
  }

  const profile = await userService.createProfile({
    id: data.user.id,
    email,
    full_name,
    role,
    department_id,
    year,
    assigned_faculty_id: null,
    created_by: data.user.id
  });

  const login = await loginUser({ email, password });
  return { ...login, profile };
}

async function loginUser(payload) {
  const { email, password } = payload;
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) {
    throw new ApiError(401, error.message);
  }

  const profile = await userService.getProfileById(data.user.id);
  return {
    session: data.session,
    user: data.user,
    profile
  };
}

async function getAuthUserFromToken(token) {
  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data?.user) {
    throw new ApiError(401, error?.message || 'Invalid token');
  }

  const profile = await userService.getProfileById(data.user.id);
  if (!profile) {
    throw new ApiError(403, 'Profile not found for authenticated user');
  }

  return {
    auth: data.user,
    profile
  };
}

async function createUserByAdmin(payload, creator) {
  const { email, password, full_name, role, department_id = null, year = null, assigned_faculty_id = null } = payload;

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
  });

  if (error) {
    throw new ApiError(400, error.message);
  }

  const profile = await userService.createProfile({
    id: data.user.id,
    email,
    full_name,
    role,
    department_id,
    year,
    assigned_faculty_id,
    created_by: creator.profile.id
  });

  return {
    user: data.user,
    profile
  };
}

module.exports = {
  signUpUser,
  loginUser,
  getAuthUserFromToken,
  createUserByAdmin
};
