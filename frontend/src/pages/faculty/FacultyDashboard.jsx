import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Users, BarChart2, Inbox, PenTool, UserPlus,
  Loader2, UserCircle2, GraduationCap, Send,
  CheckCircle2, Clock, XCircle, ChevronRight, BookOpen
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsOverview from '../../components/AnalyticsOverview';
import StatusBadge from '../../components/StatusBadge';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord, getRecords } from '../../services/recordService';
import { approveSubmission, getSubmissions, rejectSubmission, submitRecord } from '../../services/submissionService';
import { addStudent, getAssignedStudents } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { id: 'overview',  label: 'Overview',        icon: BarChart2 },
  { id: 'approvals', label: 'Approval Queue',   icon: Inbox },
  { id: 'students',  label: 'My Students',      icon: Users },
  { id: 'new',       label: 'My R&D Record',    icon: PenTool },
];

export default function FacultyDashboard() {
  const { profile } = useAuth();
  const [activeTab,    setActiveTab]    = useState('overview');
  const [analyticsTab, setAnalyticsTab] = useState('own');
  const [tableName,    setTableName]    = useState('projects');
  const [records,      setRecords]      = useState([]);
  const [submissions,  setSubmissions]  = useState([]);
  const [students,     setStudents]     = useState([]);
  const [loadingTask,  setLoadingTask]  = useState(null);
  const [studentForm,  setStudentForm]  = useState({ full_name: '', email: '', password: 'Student@123', year: '' });

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  const ownSubmissions     = useMemo(() => submissions.filter(s => s.submitter_id === profile?.id), [submissions, profile]);
  const studentSubmissions = useMemo(() => submissions.filter(s => s.submitter_id !== profile?.id), [submissions, profile]);
  const pendingApprovals   = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'faculty'), [submissions]);

  async function load() {
    try {
      const [rRes, sRes, stRes] = await Promise.all([getRecords(tableName), getSubmissions(), getAssignedStudents()]);
      setRecords(rRes.records || []);
      setSubmissions(sRes.submissions || []);
      setStudents(stRes.users || []);
    } catch {
      toast.error('Failed to load data');
    }
  }

  useEffect(() => { load(); }, [tableName]);

  async function saveDraft(values) {
    const res = await createRecord(tableName, values);
    toast.success('Record saved');
    if (window.confirm('Submit this record to HOD now?')) {
      setLoadingTask('Submitting to HOD…');
      try {
        await submitRecord(tableName, { recordId: res.record.id, remarks: 'Faculty submission' });
        toast.success('Submitted to HOD');
      } catch {
        toast.error('Submission failed');
      } finally {
        setLoadingTask(null);
      }
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
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add student');
    }
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10';

  return (
    <AppLayout title="Faculty Dashboard" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab}>

      {loadingTask && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="flex w-72 flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
            <Loader2 size={36} className="animate-spin text-sky-500" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">{loadingTask}</p>
              <p className="mt-1 text-xs text-slate-400">Please wait…</p>
            </div>
          </div>
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'My Records',       value: records.length,              color: 'bg-sky-50 text-sky-600',      icon: BookOpen },
              { label: 'Pending Approval', value: pendingApprovals.length,     color: 'bg-amber-50 text-amber-600',  icon: Clock },
              { label: 'Students',         value: students.length,             color: 'bg-indigo-50 text-indigo-600', icon: Users },
              { label: 'Approved',         value: ownSubmissions.filter(s => s.status === 'approved').length, color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{value}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Analytics sub-tabs */}
          <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 w-fit">
            {[
              { id: 'own',     label: 'My Analytics',      icon: UserCircle2 },
              { id: 'student', label: 'Student Analytics',  icon: GraduationCap },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAnalyticsTab(id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all ${
                  analyticsTab === id
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {analyticsTab === 'own' && (
            <AnalyticsOverview records={records} submissions={ownSubmissions} title="My R&D Activity" subtitle="Your personal records & submissions" />
          )}
          {analyticsTab === 'student' && (
            <AnalyticsOverview records={[]} submissions={studentSubmissions} title="Student Activity" subtitle="Submissions from your assigned students" />
          )}

          {/* Pending approvals quick-list */}
          {pendingApprovals.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Awaiting Your Approval</h3>
                <button onClick={() => setActiveTab('approvals')} className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700">
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {pendingApprovals.slice(0, 4).map(s => (
                  <li key={s.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.record?.title || '—'}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{s.submitter?.full_name || s.submitter?.email || '—'}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── APPROVAL QUEUE ── */}
      {activeTab === 'approvals' && (
        <SubmissionPanel
          title="Approval Queue"
          submissions={submissions}
          canReview
          onApprove={async (id, r) => { await approveSubmission(id, r); await load(); }}
          onReject={async (id, r)  => { await rejectSubmission(id, r);  await load(); }}
        />
      )}

      {/* ── MY STUDENTS ── */}
      {activeTab === 'students' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Add student form */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add New Student</h3>
                <p className="text-xs text-slate-400">Student will be assigned to you automatically</p>
              </div>
            </div>
            <form onSubmit={createStudent} className="p-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                <input value={studentForm.full_name} onChange={e => setStudentForm(p => ({ ...p, full_name: e.target.value }))} className={inputCls} placeholder="Student full name" />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email</label>
                <input type="email" value={studentForm.email} onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="student@university.edu" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Academic Year</label>
                <input type="number" value={studentForm.year} onChange={e => setStudentForm(p => ({ ...p, year: e.target.value }))} className={inputCls} placeholder="e.g. 2024" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Default Password</label>
                <input value={studentForm.password} onChange={e => setStudentForm(p => ({ ...p, password: e.target.value }))} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm">
                  Add Student
                </button>
              </div>
            </form>
          </div>

          {/* Student roster */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assigned Students</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Your direct reports</p>
              </div>
              <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-sky-600 ring-1 ring-sky-200 shadow-sm">{students.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {students.length ? students.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-sky-200 hover:shadow-sm transition-all">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.full_name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.email}</p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Y{s.year || '—'}</span>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Users size={28} className="text-slate-200 mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No students yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MY R&D RECORD ── */}
      {activeTab === 'new' && (
        <div className="space-y-5 max-w-3xl">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-1.5 w-fit">
            <select
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              className="appearance-none bg-transparent pl-4 pr-10 py-2.5 text-sm font-bold text-sky-600 focus:outline-none cursor-pointer"
            >
              {Object.entries(RD_TABLES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <DynamicForm tableName={tableName} tableConfig={currentTable} onSave={saveDraft} />
        </div>
      )}

    </AppLayout>
  );
}
