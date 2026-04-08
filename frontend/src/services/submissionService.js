import api from '../lib/axios';

export async function submitRecord(tableName, payload) {
  const { data } = await api.post(`/submissions/submit/${tableName}`, payload);
  return data;
}

export async function getSubmissions(params = {}) {
  const { data } = await api.get('/submissions', { params });
  return data;
}

export async function getSubmissionById(id) {
  const { data } = await api.get(`/submissions/${id}`);
  return data;
}

export async function approveSubmission(id, remarks) {
  const { data } = await api.post(`/submissions/approve/${id}`, { remarks });
  return data;
}

export async function rejectSubmission(id, remarks) {
  const { data } = await api.post(`/submissions/reject/${id}`, { remarks });
  return data;
}

export async function getReviewHistorySummary() {
  const { data } = await api.get('/submissions/review-history/summary');
  return data;
}