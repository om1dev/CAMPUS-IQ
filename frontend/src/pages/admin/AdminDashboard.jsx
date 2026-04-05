import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsCards from '../../components/AnalyticsCards';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord } from '../../services/recordService';
import { getAnalytics } from '../../services/analyticsService';
import { approveSubmission, getSubmissions, rejectSubmission } from '../../services/submissionService';

export default function AdminDashboard() {
  const [tableName, setTableName] = useState('awards');
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  async function load() {
    try {
      const [analyticsRes, submissionRes] = await Promise.all([
        getAnalytics(),
        getSubmissions()
      ]);
      setAnalytics(analyticsRes.analytics);
      setSubmissions(submissionRes.submissions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load admin data');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveDraft(values) {
    await createRecord(tableName, values);
    toast.success('Draft created');
    load();
  }

  return (
    <AppLayout title="Admin Dashboard">
      <div className="space-y-6">
        <AnalyticsCards analytics={analytics} />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Create Admin Record</label>
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
          </div>

          <SubmissionPanel
            title="All Submissions"
            submissions={submissions}
            canReview
            onApprove={async (id, remarks) => { await approveSubmission(id, remarks); await load(); }}
            onReject={async (id, remarks) => { await rejectSubmission(id, remarks); await load(); }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
