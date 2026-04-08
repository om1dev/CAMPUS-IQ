import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FileText, Inbox, BarChart2, Plus, Send, Loader2,
  CheckCircle2, Clock, XCircle, BookOpen,
  ChevronRight, ArrowUpRight, Activity, Layers
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsOverview from '../../components/AnalyticsOverview';
import StatusBadge from '../../components/StatusBadge';
import SuccessPopup from '../../components/SuccessPopup';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord, getRecords } from '../../services/recordService';
import { getSubmissions, submitRecord } from '../../services/submissionService';
import { useNotifications } from '../../hooks/useNotifications';

const sidebarItems = [
  { id: 'overview',  label: 'Overview',    icon: BarChart2 },
  { id: 'new',       label: 'New Record',  icon: Plus },
  { id: 'drafts',    label: 'My Drafts',   icon: Inbox },
  { id: 'workflows', label: 'Submissions', icon: Send },
];

// Maps each status to a step index for the progress tracker
const STEP_MAP = {
  pending_faculty: 1,
  pending_hod:     2,
  pending_admin:   3,
  approved:        4,
  rejected:        -1,
};

export default function StudentDashboard() {
  const [activeTab,    setActiveTab]    = useState('overview');
  const [tableName,    setTableName]    = useState('publications');
  const [records,      setRecords]      = useState([]);
  const [submissions,  setSubmissions]  = useState([]);
  const [loadingTask,  setLoadingTask]  = useState(null);
  const [popup,        setPopup]        = useState(null); // { type, title, message, meta, onAction }

  const notifications = useNotifications(submissions);

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  async function load() {
    try {
      const [rRes, sRes] = await Promise.all([getRecords(tableName), getSubmissions()]);
      setRecords(rRes.records || []);
      setSubmissions(sRes.submissions || []);
    } catch {
      toast.error('Failed to load data');
    }
  }

  useEffect(() => { load(); }, [tableName]);

  async function saveDraft(values) {
    const res = await createRecord(tableName, values);
    setActiveTab('drafts');
    await load();
    setPopup({
      type: 'draft',
      title: 'Draft Saved',
      message: 'Your record has been saved locally. Go to My Drafts to submit it.',
      meta: [
        { label: 'Title', value: res?.record?.title || values?.title || 'Record' },
        { label: 'Type',  value: RD_TABLES[tableName]?.label || tableName },
      ],
      onAction: { label: 'View Drafts', fn: () => setActiveTab('drafts') },
    });
  }

  async function submitDirect(values) {
    setLoadingTask('Submitting for review…');
    try {
      const res = await createRecord(tableName, values);
      await submitRecord(tableName, { recordId: res.record.id, remarks: 'Student submission' });
      // No deleteRecord needed — markRecordSubmitted sets is_submitted:true
      // so it won't appear in drafts (drafts only shows is_submitted:false)
      setActiveTab('workflows');
      await load();
      setPopup({
        type: 'submit',
        title: 'Submitted Successfully',
        message: 'Your record has been routed to your assigned faculty for review.',
        meta: [
          { label: 'Record', value: res?.record?.title || values?.title || 'Record' },
          { label: 'Next',   value: 'Faculty Review' },
        ],
        onAction: { label: 'View Submissions', fn: () => setActiveTab('workflows') },
      });
    } catch {
      toast.error('Submission failed');
    } finally {
      setLoadingTask(null);
    }
  }

  async function routeRecord(record) {
    setLoadingTask('Submitting for review…');
    try {
      await submitRecord(tableName, { recordId: record.id, remarks: 'Student submission' });
      // markRecordSubmitted sets is_submitted:true — record disappears from drafts automatically
      setActiveTab('workflows');
      await load();
      setPopup({
        type: 'submit',
        title: 'Submitted Successfully',
        message: 'Your record has been routed to your assigned faculty for review.',
        meta: [
          { label: 'Record', value: record.title },
          { label: 'Next',   value: 'Faculty Review' },
          { label: 'Year',   value: record.year || '—' },
        ],
        onAction: { label: 'View Submissions', fn: () => setActiveTab('workflows') },
      });
    } catch {
      toast.error('Submission failed');
    } finally {
      setLoadingTask(null);
    }
  }

  // Only unsubmitted records appear in drafts
  const draftRecords = useMemo(() => records.filter(r => !r.is_submitted), [records]);

  // Derived stats
  const approved  = useMemo(() => submissions.filter(s => s.status === 'approved').length,               [submissions]);
  const pending   = useMemo(() => submissions.filter(s => s.status?.startsWith('pending')).length,       [submissions]);
  const rejected  = useMemo(() => submissions.filter(s => s.status === 'rejected').length,               [submissions]);
  const atFaculty = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'faculty').length, [submissions]);
  const atHod     = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'hod').length,     [submissions]);
  const atAdmin   = useMemo(() => submissions.filter(s => s.current_reviewer_role === 'admin').length,   [submissions]);

  return (
    <AppLayout title="Student Dashboard" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} notifications={notifications}>

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

          {/* Row 1 — KPI cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                label: 'Total Drafts',
                value: draftRecords.length,
                sub: 'Saved locally',
                icon: BookOpen,
                iconBg: 'bg-sky-50', iconColor: 'text-sky-600',
                accent: 'border-l-sky-500',
              },
              {
                label: 'Submitted',
                value: submissions.length,
                sub: 'Entered workflow',
                icon: Send,
                iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600',
                accent: 'border-l-indigo-500',
              },
              {
                label: 'Approved',
                value: approved,
                sub: submissions.length
                  ? `${Math.round((approved / submissions.length) * 100)}% success rate`
                  : 'No submissions yet',
                icon: CheckCircle2,
                iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
                accent: 'border-l-emerald-500',
              },
              {
                label: 'Rejected',
                value: rejected,
                sub: rejected > 0 ? 'Needs resubmission' : 'None rejected',
                icon: XCircle,
                iconBg: 'bg-rose-50', iconColor: 'text-rose-600',
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

          {/* Row 2 — Workflow tracker + pipeline stage breakdown */}
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">

            {/* Approval journey tracker */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Approval Journey</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Track where your submissions currently stand</p>
              </div>
              <div className="p-6">
                {/* Step track */}
                <div className="relative flex items-center justify-between mb-8">
                  {/* connector line */}
                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-100 z-0" />
                  {[
                    { label: 'Submitted',    step: 0, color: 'bg-slate-400' },
                    { label: 'Faculty',      step: 1, color: 'bg-amber-400' },
                    { label: 'HOD',          step: 2, color: 'bg-sky-400' },
                    { label: 'Admin',        step: 3, color: 'bg-violet-400' },
                    { label: 'Approved',     step: 4, color: 'bg-emerald-400' },
                  ].map(({ label, step, color }) => {
                    const count = step === 0
                      ? submissions.length
                      : step === 1 ? atFaculty
                      : step === 2 ? atHod
                      : step === 3 ? atAdmin
                      : approved;
                    const active = count > 0;
                    return (
                      <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${
                          active
                            ? `${color} border-transparent text-white shadow-md`
                            : 'bg-white border-slate-200 text-slate-300'
                        }`}>
                          {count}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-slate-700' : 'text-slate-300'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Stage rows */}
                <div className="space-y-2.5">
                  {[
                    { label: 'Pending Faculty Review', value: atFaculty, color: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-700' },
                    { label: 'Pending HOD Review',     value: atHod,     color: 'bg-sky-400',    bg: 'bg-sky-50',    text: 'text-sky-700' },
                    { label: 'Pending Admin Review',   value: atAdmin,   color: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700' },
                  ].map(({ label, value, color, bg, text }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
                        <Activity size={13} className={text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-slate-600">{label}</span>
                          <span className={`text-[11px] font-black ${text}`}>{value}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all duration-700`}
                            style={{ width: submissions.length ? `${Math.round((value / submissions.length) * 100)}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions + recent activity */}
            <div className="flex flex-col gap-5">
              {/* Quick actions */}
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'New Record',   icon: Plus,      tab: 'new',       bg: 'bg-sky-500',     hover: 'hover:bg-sky-600' },
                    { label: 'My Drafts',    icon: Inbox,     tab: 'drafts',    bg: 'bg-slate-800',   hover: 'hover:bg-slate-900' },
                    { label: 'Submissions',  icon: Layers,    tab: 'workflows', bg: 'bg-indigo-500',  hover: 'hover:bg-indigo-600' },
                    { label: 'View Status',  icon: Activity,  tab: 'workflows', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
                  ].map(({ label, icon: Icon, tab, bg, hover }) => (
                    <button
                      key={label}
                      onClick={() => setActiveTab(tab)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl py-4 text-white shadow-sm transition-all active:scale-95 ${bg} ${hover}`}
                    >
                      <Icon size={18} />
                      <span className="text-[11px] font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pending count summary */}
              <div className={`rounded-2xl p-5 shadow-sm ring-1 ${
                pending > 0
                  ? 'bg-amber-50 ring-amber-200'
                  : approved > 0
                  ? 'bg-emerald-50 ring-emerald-200'
                  : 'bg-slate-50 ring-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    pending > 0 ? 'bg-amber-100 text-amber-600' : approved > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {pending > 0 ? <Clock size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${pending > 0 ? 'text-amber-800' : approved > 0 ? 'text-emerald-800' : 'text-slate-600'}`}>
                      {pending > 0
                        ? `${pending} submission${pending > 1 ? 's' : ''} in review`
                        : approved > 0
                        ? `${approved} submission${approved > 1 ? 's' : ''} approved`
                        : 'No active submissions'}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${pending > 0 ? 'text-amber-600' : approved > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {pending > 0 ? 'Awaiting reviewer action' : approved > 0 ? 'Great work!' : 'Submit a draft to get started'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 — Charts */}
          <AnalyticsOverview records={records} submissions={submissions} />

          {/* Row 4 — Recent submissions */}
          {submissions.length > 0 && (
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Submissions</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Your latest workflow activity</p>
                </div>
                <button
                  onClick={() => setActiveTab('workflows')}
                  className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-600 ring-1 ring-sky-200 hover:bg-sky-500 hover:text-white transition-all"
                >
                  View all <ArrowUpRight size={13} />
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {submissions.slice(0, 5).map(s => (
                  <li key={s.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{s.record?.title || '—'}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                        {s.table_name?.replace(/_/g, ' ')}
                        {s.record?.year ? ` · ${s.record.year}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

      {/* ── NEW RECORD ── */}
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
          <DynamicForm tableName={tableName} tableConfig={currentTable} onSave={saveDraft} onSubmitDirect={submitDirect} />
        </div>
      )}

      {/* ── DRAFTS ── */}
      {activeTab === 'drafts' && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Drafts</h2>
              <p className="text-xs text-slate-400 mt-0.5">Records saved locally, not yet submitted</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{draftRecords.length} records</span>
          </div>

          {draftRecords.length ? (
            <ul className="divide-y divide-slate-100">
              {draftRecords.map(record => (
                <li key={record.id} className="group flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{record.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">Year {record.year}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400 capitalize">{record.status}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => routeRecord(record)}
                    className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                  >
                    Submit <Send size={13} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                <Inbox size={26} />
              </div>
              <p className="text-sm font-bold text-slate-900">No drafts yet</p>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">Create a new record and it will appear here before submission.</p>
              <button onClick={() => setActiveTab('new')} className="mt-5 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-600 transition-colors">
                Create Record
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSIONS ── */}
      {activeTab === 'workflows' && (
        <SubmissionPanel title="My Submissions" submissions={submissions} />
      )}

      <SuccessPopup
        visible={!!popup}
        type={popup?.type}
        title={popup?.title}
        message={popup?.message}
        meta={popup?.meta}
        onAction={popup?.onAction}
        onClose={() => setPopup(null)}
      />

    </AppLayout>
  );
}
