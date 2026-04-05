import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord } from '../../services/recordService';
import { approveSubmission, getSubmissions, rejectSubmission, submitRecord } from '../../services/submissionService';
import { addFaculty, getUsers } from '../../services/userService';

export default function HodDashboard() {
  const [tableName, setTableName] = useState('grants');
  const [submissions, setSubmissions] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [facultyForm, setFacultyForm] = useState({
    full_name: '',
    email: '',
    password: 'Faculty@123'
  });

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  async function load() {
    try {
      const [submissionRes, facultyRes] = await Promise.all([
        getSubmissions(),
        getUsers({ role: 'faculty' })
      ]);
      setSubmissions(submissionRes.submissions || []);
      setFacultyMembers(facultyRes.users || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load HOD data');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveDraft(values) {
    const response = await createRecord(tableName, values);
    const shouldSubmit = window.confirm('Submit this HOD record now?');
    if (shouldSubmit) {
      await submitRecord(tableName, { recordId: response.record.id, remarks: 'HOD submission' });
      toast.success('HOD record submitted');
    } else {
      toast.success('Draft created');
    }
    load();
  }

  async function createFaculty(e) {
    e.preventDefault();
    try {
      await addFaculty(facultyForm);
      toast.success('Faculty created');
      setFacultyForm({ full_name: '', email: '', password: 'Faculty@123' });
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create faculty');
    }
  }

  return (
    <AppLayout title="HOD Dashboard">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-base font-bold text-slate-900">Add Faculty</h3>
            <form onSubmit={createFaculty} className="grid gap-3">
              <input
                placeholder="Full name"
                value={facultyForm.full_name}
                onChange={(e) => setFacultyForm((p) => ({ ...p, full_name: e.target.value }))}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Email"
                type="email"
                value={facultyForm.email}
                onChange={(e) => setFacultyForm((p) => ({ ...p, email: e.target.value }))}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Default password"
                value={facultyForm.password}
                onChange={(e) => setFacultyForm((p) => ({ ...p, password: e.target.value }))}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">
                Add Faculty
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-base font-bold text-slate-900">Department Faculty</h3>
            <div className="space-y-2">
              {facultyMembers.length ? facultyMembers.map((faculty) => (
                <div key={faculty.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{faculty.full_name}</p>
                  <p className="text-xs text-slate-500">{faculty.email}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No faculty found.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Create HOD Record</label>
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
          title="Department Submissions"
          submissions={submissions}
          canReview
          onApprove={async (id, remarks) => { await approveSubmission(id, remarks); await load(); }}
          onReject={async (id, remarks) => { await rejectSubmission(id, remarks); await load(); }}
        />
      </div>
    </AppLayout>
  );
}
