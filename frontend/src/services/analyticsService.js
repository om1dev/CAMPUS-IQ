import api from '../lib/axios';

export async function getAnalytics() {
  const { data } = await api.get('/analytics/summary');
  return data;
}
