import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Users, BarChart2, Inbox, PenTool,
  CheckCircle2, Clock, BookOpen, ChevronRight,
  GraduationCap, UserCog
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsOverview from '../../components/AnalyticsOverview';
import StatusBadge from '../../components/StatusBadge';
import SuccessPopup from '../../components/SuccessPopup';
import UserRoster from '../../components/UserRoster';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord } from '../../services/recordService';
import { approveSubmission, getSubmissions, rejectSubmission, submitRecord } from '../../services/submissionService';
import { addFaculty, addStudent, getUsers } from '../../services/userService';

const sidebarItems = [
  { id: 'overview',  label: 'Overview',      icon: BarChart2 },
  { id: 'approvals', label: 'Approval Queue', icon: Inbox },
  { id: 'users',     label: 'Manage Users',   icon: Users },
  { id: 'new',       label: 'My R&D Record',  icon: PenTool },
];

const HOD_ROLE_TABS = [
  { role: 'student', label: 'Students', icon: GraduationCap },
  { role: 'faculty', label: 'Faculty',  icon: UserCog },
];

const FACULTY_FIELDS = [
  { name: 'full_name', label: 'Full Name',        placeholder: 'Faculty full name',       fullWidth: true },
  { name: 'email',     label: 'Email',            type: 'email', placeholder: 'faculty@university.edu', fullWidth: true },
  { name: 'password',  label: 'Default Password', defaultValue: 'Faculty@123',            fullWidth: true },
];

const STUDENT_FIELDS = [
  { name: 'full_name', label: 'Full Name',        placeholder: 'Student full name',       fullWidth: true },
  { name: 'email',     label: 'Email',            type: 'email', placeholder: 'student@university.edu', fullWidth: true },
  { name: 'year',      label: 'Academic Year',    type: 'number', placeholder: 'e.g. 2024' },
  { name: 'password',  label: 'Default Password', defaultValue: 'Student@123' },
];

export default function HodDashboard() {
  const [activeTab,      setActiveTab]      = useState('overview');
  const [userTab,        setUserTab]        = useState('faculty');
  const [tableName,      setTableName]      = useState('grants');
  const [submissions,    setSubmissions]    = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [students,       setStudents]       = useState([]);
  const [popup,          setPopup]          = useState(null);

  const currentTable     = useMemo(() => RD_TABLES[tableName], [tableName]);
  const pendingApprovals = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'hod'), [submissions]);
  const approved         = useMemo(() => submissions.filter(s => s.status === 'approved').length, [submissions]);

  async function load() {
    try {
      const [sRes, fRes, stRes] = await Promise.all([
        getSubmissions(),
        getUsers({ role: 'faculty' }),
        getUsers({ role: 'student' }),
      ]);
      setSubmissions(sRes.submissions || []);
      setFacultyMembers(fRes.users || []);
      setStudents(stRes.users || []);
    } catch { toast.error('Failed to load data'); }
  }

  useEffect(() => { load(); }, []);

  async function saveDraft(values) {
    const res = await createRecord(tableName, values);
    if (window.confirm('Submit this record to Admin now?')) {
      await submitRecord(tableName, { recordId: res.record.id, remarks: 'HOD submission' });
      await load();
      setPopup({ type: 'submit', title: 'Submitted to Admin', message: 'Your R&D record has been forwarded to Admin for final approval.',
        meta: [{ label: 'Record', value: res?.record?.title || values?.title }, { label: 'Next', value: 'Admin Review' }],
        onAction: { label: 'View Queue', fn: () => setActiveTab('approvals') } });
    } else {
      await load();
      setPopup({ type: 'draft', title: 'Draft Saved', message: 'Record saved locally. Submit it to Admin when ready.',
        meta: [{ label: 'Title', value: res?.record?.title || values?.title }] });
    }
  }

  async function handleAddFaculty(form) {
    try {
      await addFaculty(form);
      await load();
      setPopup({ type: 'created', title: 'Faculty Added', message: `${form.full_name} has been provisioned and assigned to your department.`,
        meta: [{ label: 'Name', value: form.full_name }, { label: 'Email', value: form.email }] });
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to add faculty'); }
  }

  async function handleAddStudent(form) {
    try {
      await addStudent(form);
      await load();
      setPopup({ type: 'created', title: 'Student Added', message: `${form.full_name} has been provisioned.`,
        meta: [{ label: 'Name', value: form.full_name }, { label: 'Email', value: form.email }] });
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to add student'); }
  }

  return (
    <AppLayout title="HOD Dashboard" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab}>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Submissions', value: submissions.length,      color: 'bg-sky-50 text-sky-600',       icon: BookOpen },
              { label: 'Pending Approval',  value: pendingApprovals.length, color: 'bg-amber-50 text-amber-600',   icon: Clock },
              { label: 'Faculty Members',   value: facultyMembers.length,   color: 'bg-indigo-50 text-indigo-600', icon: Users },
              { label: 'Approved',          value: approved,                color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
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

          <AnalyticsOverview records={[]} submissions={submissions} title="Department Analytics" subtitle="All submissions in your department" />

          {pendingApprovals.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Awaiting HOD Approval</h3>
                <button onClick={() => setActiveTab('approvals')} className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700">View all <ChevronRight size={14} /></button>
              </div>
              <ul className="divide-y divide-slate-100">
                {pendingApprovals.slice(0, 5).map(s => (
                  <li key={s.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{s.record?.title || '—'}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{s.submitter_role} · {s.submitter?.full_name || s.submitter?.email || '—'}</p>
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
        <SubmissionPanel title="Department Approval Queue" submissions={submissions} canReview roleTabs={HOD_ROLE_TABS}
          onApprove={async (id, r) => { await approveSubmission(id, r); await load(); }}
          onReject={async (id, r)  => { await rejectSubmission(id, r);  await load(); }}
        />
      )}

      {/* ── MANAGE USERS ── */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* Sub-tab switcher */}
          <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 w-fit">
            {[
              { id: 'faculty', label: 'Faculty',  icon: UserCog },
              { id: 'student', label: 'Students', icon: GraduationCap },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setUserTab(id)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all ${userTab === id ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {userTab === 'faculty' && (
            <UserRoster title="Faculty" subtitle="Department members" users={facultyMembers}
              addForm={FACULTY_FIELDS} onAdd={handleAddFaculty} onDeleted={load}
              accentColor="indigo" roleLabel="faculty" />
          )}
          {userTab === 'student' && (
            <UserRoster title="Student" subtitle="Students in your department" users={students}
              addForm={STUDENT_FIELDS} onAdd={handleAddStudent} onDeleted={load}
              accentColor="sky" roleLabel="student" />
          )}
        </div>
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
