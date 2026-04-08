import api from '../lib/axios';

export async function addStudent(payload) {
  const { data } = await api.post('/users/students', payload);
  return data;
}

export async function addFaculty(payload) {
  const { data } = await api.post('/users/faculty', payload);
  return data;
}

export async function addHod(payload) {
  const { data } = await api.post('/users/hod', payload);
  return data;
}

export async function getAssignedStudents() {
  const { data } = await api.get('/users/assigned-students');
  return data;
}

export async function getUsers(params = {}) {
  const { data } = await api.get('/users', { params });
  return data;
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}
