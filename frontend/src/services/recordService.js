import api from '../lib/axios';

export async function getTableMeta() {
  const { data } = await api.get('/records/meta/tables');
  return data;
}

export async function getRecords(tableName, params = {}) {
  const { data } = await api.get(`/records/${tableName}`, { params });
  return data;
}

export async function createRecord(tableName, values) {
  const formData = new FormData();
  formData.append('title', values.title);
  formData.append('year', values.year || '');
  formData.append('data', JSON.stringify(values.data || {}));
  if (values.file) formData.append('file', values.file);

  const { data } = await api.post(`/records/${tableName}`, formData);
  return data;
}

export async function updateRecord(tableName, id, values) {
  const formData = new FormData();
  formData.append('title', values.title);
  formData.append('year', values.year || '');
  formData.append('data', JSON.stringify(values.data || {}));
  if (values.file) formData.append('file', values.file);

  const { data } = await api.put(`/records/${tableName}/${id}`, formData);
  return data;
}

export async function deleteRecord(tableName, id) {
  const { data } = await api.delete(`/records/${tableName}/${id}`);
  return data;
}
