import api from '../lib/axios';

export async function addStudent(payload) {
  const { data } = await api.post('/users/students', payload);
  return data;
}

export async function addFaculty(payload) {
  const { data } = await api.post('/users/faculty', payload);
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
