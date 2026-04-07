import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Users, BarChart2, Inbox, PenTool, UserPlus,
  CheckCircle2, Clock, BookOpen, ChevronRight,
  GraduationCap, UserCog
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsOverview from '../../components/AnalyticsOverview';
import StatusBadge from '../../components/StatusBadge';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord } from '../../services/recordService';
import { approveSubmission, getSubmissions, rejectSubmission, submitRecord } from '../../services/submissionService';
import { addFaculty, getUsers } from '../../services/userService';

const sidebarItems = [
  { id: 'overview',  label: 'Overview',          icon: BarChart2 },
  { id: 'approvals', label: 'Approval Queue',     icon: Inbox },
  { id: 'faculty',   label: 'Manage Faculty',     icon: Users },
  { id: 'new',       label: 'My R&D Record',      icon: PenTool },
];

export default function HodDashboard() {
  const [activeTab,      setActiveTab]      = useState('overview');
  const [tableName,      setTableName]      = useState('grants');
  const [submissions,    setSubmissions]    = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [facultyForm,    setFacultyForm]    = useState({ full_name: '', email: '', password: 'Faculty@123' });

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  const pendingApprovals = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'hod'), [submissions]);
  const approved         = useMemo(() => submissions.filter(s => s.status === 'approved').length, [submissions]);
  const rejected         = useMemo(() => submissions.filter(s => s.status === 'rejected').length, [submissions]);

  async function load() {
    try {
      const [sRes, fRes] = await Promise.all([getSubmissions(), getUsers({ role: 'faculty' })]);
      setSubmissions(sRes.submissions || []);
      setFacultyMembers(fRes.users || []);
    } catch {
      toast.error('Failed to load data');
    }
  }

  useEffect(() => { load(); }, []);

  async function saveDraft(values) {
    const res = await createRecord(tableName, values);
    if (window.confirm('Submit this record to Admin now?')) {
      await submitRecord(tableName, { recordId: res.record.id, remarks: 'HOD submission' });
      toast.success('Submitted to Admin');
    } else {
      toast.success('Draft saved');
    }
    load();
  }

  async function createFaculty(e) {
    e.preventDefault();
    try {
      await addFaculty(facultyForm);
      toast.success('Faculty added');
      setFacultyForm({ full_name: '', email: '', password: 'Faculty@123' });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add faculty');
    }
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10';

  const HOD_ROLE_TABS = [
    { role: 'student', label: 'Students', icon: GraduationCap },
    { role: 'faculty', label: 'Faculty',  icon: UserCog },
  ];

  return (
    <AppLayout title="HOD Dashboard" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab}>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Submissions', value: submissions.length,       color: 'bg-sky-50 text-sky-600',       icon: BookOpen },
              { label: 'Pending Approval',  value: pendingApprovals.length,  color: 'bg-amber-50 text-amber-600',   icon: Clock },
              { label: 'Faculty Members',   value: facultyMembers.length,    color: 'bg-indigo-50 text-indigo-600', icon: Users },
              { label: 'Approved',          value: approved,                 color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
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

          <AnalyticsOverview records={[]} submissions={submissions} title="Department Analytics" subtitle="All submissions in your department" />

          {/* Pending quick-list */}
          {pendingApprovals.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Awaiting HOD Approval</h3>
                <button onClick={() => setActiveTab('approvals')} className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700">
                  View all <ChevronRight size={14} />
                </button>
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

          {/* Faculty quick-list */}
          {facultyMembers.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Department Faculty</h3>
                <button onClick={() => setActiveTab('faculty')} className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700">
                  Manage <ChevronRight size={14} />
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {facultyMembers.slice(0, 4).map(f => (
                  <li key={f.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                      <Users size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{f.full_name}</p>
                      <p className="text-[11px] text-slate-400">{f.email}</p>
                    </div>
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
          title="Department Approval Queue"
          submissions={submissions}
          canReview
          roleTabs={HOD_ROLE_TABS}
          onApprove={async (id, r) => { await approveSubmission(id, r); await load(); }}
          onReject={async (id, r)  => { await rejectSubmission(id, r);  await load(); }}
        />
      )}

      {/* ── MANAGE FACULTY ── */}
      {activeTab === 'faculty' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Add faculty form */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add New Faculty</h3>
                <p className="text-xs text-slate-400">Faculty will be assigned to your department</p>
              </div>
            </div>
            <form onSubmit={createFaculty} className="p-6 grid gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                <input value={facultyForm.full_name} onChange={e => setFacultyForm(p => ({ ...p, full_name: e.target.value }))} className={inputCls} placeholder="Faculty full name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email</label>
                <input type="email" value={facultyForm.email} onChange={e => setFacultyForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="faculty@university.edu" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Default Password</label>
                <input value={facultyForm.password} onChange={e => setFacultyForm(p => ({ ...p, password: e.target.value }))} className={inputCls} />
              </div>
              <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm">
                Add Faculty
              </button>
            </form>
          </div>

          {/* Faculty roster */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Faculty Roster</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Department members</p>
              </div>
              <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 ring-1 ring-indigo-200 shadow-sm">{facultyMembers.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {facultyMembers.length ? facultyMembers.map(f => (
                <div key={f.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-200 hover:shadow-sm transition-all">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                    <Users size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{f.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{f.email}</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Users size={28} className="text-slate-200 mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No faculty yet</p>
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
