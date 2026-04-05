import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord, getRecords } from '../../services/recordService';
import { getSubmissions, submitRecord } from '../../services/submissionService';

export default function StudentDashboard() {
  const [tableName, setTableName] = useState('publications');
  const [records, setRecords] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  async function load() {
    try {
      const [recordRes, submissionRes] = await Promise.all([
        getRecords(tableName),
        getSubmissions()
      ]);
      setRecords(recordRes.records || []);
      setSubmissions(submissionRes.submissions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load student data');
    }
  }

  useEffect(() => {
    load();
  }, [tableName]);

  async function saveDraft(values) {
    const response = await createRecord(tableName, values);
    toast.success('Draft created');
    const shouldSubmit = window.confirm('Do you want to submit this record now?');
    if (shouldSubmit) {
      await submitRecord(tableName, { recordId: response.record.id, remarks: 'Submitted from student dashboard' });
      toast.success('Record submitted');
    }
    await load();
  }

  return (
    <AppLayout title="Student Dashboard">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Select R&D Table</label>
            <select
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >
              {Object.entries(RD_TABLES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          <DynamicForm tableName={tableName} tableConfig={currentTable} onSave={saveDraft} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-base font-bold text-slate-900">My Drafts</h3>
            <div className="space-y-3">
              {records.length ? records.map((record) => (
                <div key={record.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{record.title}</p>
                  <p className="text-xs text-slate-500">Year {record.year || '-'} • {record.status}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No records for this table yet.</p>
              )}
            </div>
          </div>
        </div>

        <SubmissionPanel title="My Submission Status" submissions={submissions} />
      </div>
    </AppLayout>
  );
}
