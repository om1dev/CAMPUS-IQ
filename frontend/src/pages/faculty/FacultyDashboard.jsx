import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord, getRecords } from '../../services/recordService';
import { approveSubmission, getSubmissions, rejectSubmission, submitRecord } from '../../services/submissionService';
import { addStudent, getAssignedStudents } from '../../services/userService';

export default function FacultyDashboard() {
  const [tableName, setTableName] = useState('projects');
  const [records, setRecords] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    email: '',
    password: 'Student@123',
    year: ''
  });

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  async function load() {
    try {
      const [recordRes, submissionRes, studentRes] = await Promise.all([
        getRecords(tableName),
        getSubmissions(),
        getAssignedStudents()
      ]);
      setRecords(recordRes.records || []);
      setSubmissions(submissionRes.submissions || []);
      setStudents(studentRes.users || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load faculty data');
    }
  }

  useEffect(() => {
    load();
  }, [tableName]);

  async function saveDraft(values) {
    const response = await createRecord(tableName, values);
    toast.success('Faculty draft created');
    const shouldSubmit = window.confirm('Submit this faculty record now?');
    if (shouldSubmit) {
      await submitRecord(tableName, { recordId: response.record.id, remarks: 'Faculty submission' });
      toast.success('Submitted');
    }
    await load();
  }

  async function createStudent(e) {
    e.preventDefault();
    try {
      await addStudent(studentForm);
      toast.success('Student added');
      setStudentForm({ full_name: '', email: '', password: 'Student@123', year: '' });
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add student');
    }
  }

  return (
    <AppLayout title="Faculty Dashboard">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-base font-bold text-slate-900">Add Student</h3>
            <form onSubmit={createStudent} className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="Full name"
                value={studentForm.full_name}
                onChange={(e) => setStudentForm((p) => ({ ...p, full_name: e.target.value }))}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm((p) => ({ ...p, email: e.target.value }))}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Default password"
                value={studentForm.password}
                onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Year"
                type="number"
                value={studentForm.year}
                onChange={(e) => setStudentForm((p) => ({ ...p, year: e.target.value }))}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
              <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white md:col-span-2">
                Add Student
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-base font-bold text-slate-900">Assigned Students</h3>
            <div className="space-y-2">
              {students.length ? students.map((student) => (
                <div key={student.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{student.full_name}</p>
                  <p className="text-xs text-slate-500">{student.email} • Year {student.year || '-'}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No assigned students yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Create Faculty R&D Record</label>
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
          title="Pending Reviews and My Submissions"
          submissions={submissions}
          canReview
          onApprove={async (id, remarks) => { await approveSubmission(id, remarks); await load(); }}
          onReject={async (id, remarks) => { await rejectSubmission(id, remarks); await load(); }}
        />
      </div>
    </AppLayout>
  );
}
