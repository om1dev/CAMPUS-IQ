import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart2, PenTool, ShieldCheck,
  CheckCircle2, Clock, XCircle, TrendingUp,
  ChevronRight, Users, GraduationCap, UserCog,
  UserCheck, ArrowUpRight, FileText, Activity
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsCards from '../../components/AnalyticsCards';
import StatusBadge from '../../components/StatusBadge';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord } from '../../services/recordService';
import { getAnalytics } from '../../services/analyticsService';
import { approveSubmission, getSubmissions, rejectSubmission } from '../../services/submissionService';

const sidebarItems = [
  { id: 'overview',  label: 'Overview',        icon: BarChart2 },
  { id: 'approvals', label: 'Final Approvals',  icon: ShieldCheck },
  { id: 'new',       label: 'Create Record',    icon: PenTool },
];

const ADMIN_ROLE_TABS = [
  { role: 'student', label: 'Students', icon: GraduationCap },
  { role: 'faculty', label: 'Faculty',  icon: UserCog },
  { role: 'hod',     label: 'HOD',      icon: UserCheck },
];

const ROLE_COLOR = {
  student:    'bg-sky-50 text-sky-700 ring-sky-200',
  faculty:    'bg-indigo-50 text-indigo-700 ring-indigo-200',
  hod:        'bg-violet-50 text-violet-700 ring-violet-200',
  admin:      'bg-slate-100 text-slate-700 ring-slate-200',
  superadmin: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export default function AdminDashboard() {
  const [activeTab,   setActiveTab]   = useState('overview');
  const [tableName,   setTableName]   = useState('awards');
  const [analytics,   setAnalytics]   = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  const pendingAdmin  = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'admin'), [submissions]);
  const approved      = useMemo(() => submissions.filter(s => s.status === 'approved').length, [submissions]);
  const rejected      = useMemo(() => submissions.filter(s => s.status === 'rejected').length, [submissions]);
  const totalPending  = useMemo(() => submissions.filter(s => s.status?.startsWith('pending')).length, [submissions]);

  // Per-role counts for the role breakdown strip
  const byRole = useMemo(() => ({
    student: submissions.filter(s => s.submitter_role === 'student').length,
    faculty: submissions.filter(s => s.submitter_role === 'faculty').length,
    hod:     submissions.filter(s => s.submitter_role === 'hod').length,
  }), [submissions]);

  async function load() {
    try {
      const [aRes, sRes] = await Promise.all([getAnalytics(), getSubmissions()]);
      setAnalytics(aRes.analytics);
      setSubmissions(sRes.submissions || []);
    } catch {
      toast.error('Failed to load data');
    }
  }

  useEffect(() => { load(); }, []);

  async function saveDraft(values) {
    await createRecord(tableName, values);
    toast.success('Record created');
    load();
  }

  return (
    <AppLayout title="Admin Dashboard" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab}>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* ── Row 1: KPI cards ── */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                label: 'Total Submissions',
                value: submissions.length,
                sub: 'All time',
                icon: FileText,
                iconBg: 'bg-sky-50',
                iconColor: 'text-sky-600',
                accent: 'border-l-sky-500',
              },
              {
                label: 'Pending Final',
                value: pendingAdmin.length,
                sub: 'Awaiting your review',
                icon: Clock,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
                accent: 'border-l-amber-500',
              },
              {
                label: 'Approved',
                value: approved,
                sub: `${submissions.length ? Math.round((approved / submissions.length) * 100) : 0}% approval rate`,
                icon: CheckCircle2,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-emerald-600',
                accent: 'border-l-emerald-500',
              },
              {
                label: 'Rejected',
                value: rejected,
                sub: `${submissions.length ? Math.round((rejected / submissions.length) * 100) : 0}% rejection rate`,
                icon: XCircle,
                iconBg: 'bg-rose-50',
                iconColor: 'text-rose-600',
                accent: 'border-l-rose-500',
              },
            ].map(({ label, value, sub, icon: Icon, iconBg, iconColor, accent }) => (
              <div key={label} className={`relative flex items-center gap-4 rounded-2xl border-l-4 bg-white px-5 py-5 shadow-sm ring-1 ring-slate-200 ${accent}`}>
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-0.5 text-3xl font-black text-slate-900 leading-none">{value}</p>
                  <p className="mt-1 text-[11px] text-slate-400 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Row 2: Role breakdown + pipeline progress ── */}
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

            {/* Role breakdown */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Submissions by Role</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Breakdown across all submitter types</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { role: 'student', label: 'Students',        color: 'bg-sky-500',    light: 'bg-sky-50',    text: 'text-sky-700' },
                  { role: 'faculty', label: 'Faculty Members', color: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-700' },
                  { role: 'hod',     label: 'HOD',             color: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700' },
                ].map(({ role, label, color, light, text }) => {
                  const count = byRole[role];
                  const pct   = submissions.length ? Math.round((count / submissions.length) * 100) : 0;
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
                          <span className="text-xs font-semibold text-slate-700">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${light} ${text} ring-current/20`}>{count}</span>
                          <span className="text-[11px] font-semibold text-slate-400">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pipeline progress */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Approval Pipeline</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Current stage distribution</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {[
                  { label: 'At Faculty',  value: submissions.filter(s => s.current_reviewer_role === 'faculty').length, color: 'bg-amber-400',   ring: 'ring-amber-200',   bg: 'bg-amber-50',   text: 'text-amber-700' },
                  { label: 'At HOD',      value: submissions.filter(s => s.current_reviewer_role === 'hod').length,     color: 'bg-sky-400',     ring: 'ring-sky-200',     bg: 'bg-sky-50',     text: 'text-sky-700' },
                  { label: 'At Admin',    value: pendingAdmin.length,                                                    color: 'bg-violet-400',  ring: 'ring-violet-200',  bg: 'bg-violet-50',  text: 'text-violet-700' },
                  { label: 'In Review',   value: totalPending,                                                           color: 'bg-indigo-400',  ring: 'ring-indigo-200',  bg: 'bg-indigo-50',  text: 'text-indigo-700' },
                ].map(({ label, value, color, ring, bg, text }) => (
                  <div key={label} className={`flex flex-col gap-2 rounded-xl p-4 ring-1 ${bg} ${ring}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color} bg-opacity-20`}>
                      <Activity size={15} className={text} />
                    </div>
                    <p className={`text-2xl font-black ${text}`}>{value}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 3: Charts ── */}
          <AnalyticsCards analytics={analytics} />

          {/* ── Row 4: Two-column bottom section ── */}
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

            {/* Pending final approvals */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pending Final Approval</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Submissions awaiting your decision</p>
                </div>
                {pendingAdmin.length > 0 && (
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-600 ring-1 ring-sky-200 hover:bg-sky-500 hover:text-white transition-all"
                  >
                    Review all <ArrowUpRight size={13} />
                  </button>
                )}
              </div>
              {pendingAdmin.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {pendingAdmin.slice(0, 5).map(s => (
                    <li key={s.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Clock size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{s.record?.title || '—'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                          {s.submitter_role} · {s.submitter?.full_name || s.submitter?.email || '—'}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <CheckCircle2 size={22} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">All caught up</p>
                  <p className="mt-1 text-xs text-slate-400">No submissions pending your approval.</p>
                </div>
              )}
            </div>

            {/* Recent submissions table */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Submissions</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Latest activity across all roles</p>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700"
                >
                  View all <ChevronRight size={13} />
                </button>
              </div>
              {submissions.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {submissions.slice(0, 6).map(s => (
                    <li key={s.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
                      <span className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ring-1 ${ROLE_COLOR[s.submitter_role] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                        {s.submitter_role}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{s.record?.title || '—'}</p>
                        <p className="text-[10px] text-slate-400 truncate capitalize">{s.table_name?.replace(/_/g, ' ')}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users size={24} className="text-slate-200 mb-3" />
                  <p className="text-sm font-semibold text-slate-400">No submissions yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── FINAL APPROVALS ── */}
      {activeTab === 'approvals' && (
        <SubmissionPanel
          title="Final Approval Queue"
          submissions={submissions}
          canReview
          roleTabs={ADMIN_ROLE_TABS}
          onApprove={async (id, r) => { await approveSubmission(id, r); await load(); }}
          onReject={async (id, r)  => { await rejectSubmission(id, r);  await load(); }}
        />
      )}

      {/* ── CREATE RECORD ── */}
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
