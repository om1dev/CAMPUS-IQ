import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Users, BarChart2, Inbox, PenTool,
  Loader2, UserCircle2, GraduationCap,
  CheckCircle2, Clock, ChevronRight, BookOpen
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsOverview from '../../components/AnalyticsOverview';
import StatusBadge from '../../components/StatusBadge';
import SuccessPopup from '../../components/SuccessPopup';
import UserRoster from '../../components/UserRoster';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord, getRecords } from '../../services/recordService';
import { approveSubmission, getSubmissions, rejectSubmission, submitRecord } from '../../services/submissionService';
import { addStudent, getAssignedStudents } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { id: 'overview',  label: 'Overview',      icon: BarChart2 },
  { id: 'approvals', label: 'Approval Queue', icon: Inbox },
  { id: 'students',  label: 'My Students',    icon: Users },
  { id: 'new',       label: 'My R&D Record',  icon: PenTool },
];

const STUDENT_FIELDS = [
  { name: 'full_name', label: 'Full Name',        placeholder: 'Student full name',      fullWidth: true },
  { name: 'email',     label: 'Email',            type: 'email', placeholder: 'student@university.edu', fullWidth: true },
  { name: 'year',      label: 'Academic Year',    type: 'number', placeholder: 'e.g. 2024' },
  { name: 'password',  label: 'Default Password', defaultValue: 'Student@123' },
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
  const [popup,        setPopup]        = useState(null);

  const currentTable     = useMemo(() => RD_TABLES[tableName], [tableName]);
  const ownSubmissions   = useMemo(() => submissions.filter(s => s.submitter_id === profile?.id), [submissions, profile]);
  const studentSubs      = useMemo(() => submissions.filter(s => s.submitter_id !== profile?.id), [submissions, profile]);
  const pendingApprovals = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'faculty'), [submissions]);

  async function load() {
    try {
      const [rRes, sRes, stRes] = await Promise.all([getRecords(tableName), getSubmissions(), getAssignedStudents()]);
      setRecords(rRes.records || []);
      setSubmissions(sRes.submissions || []);
      setStudents(stRes.users || []);
    } catch { toast.error('Failed to load data'); }
  }

  useEffect(() => { load(); }, [tableName]);

  async function saveDraft(values) {
    const res = await createRecord(tableName, values);
    if (window.confirm('Submit this record to HOD now?')) {
      setLoadingTask('Submitting to HOD…');
      try {
        await submitRecord(tableName, { recordId: res.record.id, remarks: 'Faculty submission' });
        await load();
        setPopup({ type: 'submit', title: 'Submitted to HOD', message: 'Your R&D record has been routed to the HOD for review.',
          meta: [{ label: 'Record', value: res?.record?.title || values?.title }, { label: 'Next', value: 'HOD Review' }],
          onAction: { label: 'View Queue', fn: () => setActiveTab('approvals') } });
      } catch { toast.error('Submission failed'); }
      finally { setLoadingTask(null); }
    } else {
      await load();
      setPopup({ type: 'draft', title: 'Draft Saved', message: 'Record saved. Submit it to HOD when ready.',
        meta: [{ label: 'Title', value: res?.record?.title || values?.title }] });
    }
  }

  async function handleAddStudent(form) {
    try {
      await addStudent(form);
      await load();
      setPopup({ type: 'created', title: 'Student Added', message: `${form.full_name} has been provisioned and assigned to you.`,
        meta: [{ label: 'Name', value: form.full_name }, { label: 'Email', value: form.email }] });
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to add student'); }
  }

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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'My Records',       value: records.length,                                              color: 'bg-sky-50 text-sky-600',       icon: BookOpen },
              { label: 'Pending Approval', value: pendingApprovals.length,                                     color: 'bg-amber-50 text-amber-600',   icon: Clock },
              { label: 'Students',         value: students.length,                                             color: 'bg-indigo-50 text-indigo-600', icon: Users },
              { label: 'Approved',         value: ownSubmissions.filter(s => s.status === 'approved').length,  color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}><Icon size={20} /></div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{value}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 w-fit">
            {[{ id: 'own', label: 'My Analytics', icon: UserCircle2 }, { id: 'student', label: 'Student Analytics', icon: GraduationCap }].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setAnalyticsTab(id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all ${analyticsTab === id ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {analyticsTab === 'own'     && <AnalyticsOverview records={records}  submissions={ownSubmissions} title="My R&D Activity"   subtitle="Your personal records & submissions" />}
          {analyticsTab === 'student' && <AnalyticsOverview records={[]}       submissions={studentSubs}    title="Student Activity"  subtitle="Submissions from your assigned students" />}

          {pendingApprovals.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Awaiting Your Approval</h3>
                <button onClick={() => setActiveTab('approvals')} className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700">View all <ChevronRight size={14} /></button>
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
        <SubmissionPanel title="Approval Queue" submissions={submissions} canReview
          onApprove={async (id, r) => { await approveSubmission(id, r); await load(); }}
          onReject={async (id, r)  => { await rejectSubmission(id, r);  await load(); }}
        />
      )}

      {/* ── MY STUDENTS ── */}
      {activeTab === 'students' && (
        <UserRoster
          title="Student"
          subtitle="Your direct reports"
          users={students}
          addForm={STUDENT_FIELDS}
          onAdd={handleAddStudent}
          onDeleted={load}
          accentColor="sky"
          roleLabel="student"
        />
      )}

      {/* ── MY R&D RECORD ── */}
      {activeTab === 'new' && (
        <div className="space-y-5 max-w-3xl">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-1.5 w-fit">
            <select value={tableName} onChange={e => setTableName(e.target.value)}
              className="appearance-none bg-transparent pl-4 pr-10 py-2.5 text-sm font-bold text-sky-600 focus:outline-none cursor-pointer">
              {Object.entries(RD_TABLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <DynamicForm tableName={tableName} tableConfig={currentTable} onSave={saveDraft} />
        </div>
      )}

      <SuccessPopup visible={!!popup} type={popup?.type} title={popup?.title} message={popup?.message}
        meta={popup?.meta} onAction={popup?.onAction} onClose={() => setPopup(null)} />

    </AppLayout>
  );
}
