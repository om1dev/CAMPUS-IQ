import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  History,
  Clock4,
  ShieldCheck,
  X,
  ChevronRight,
  User2,
  FileText,
  CalendarClock,
  BadgeInfo,
} from 'lucide-react';

function prettyAction(action) {
  if (action === 'approved_final') return 'Final Approved';
  if (action === 'approved_step') return 'Approved';
  if (action === 'rejected') return 'Rejected';
  return action || '-';
}

function actionStyle(action) {
  if (action === 'approved_final') {
    return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
  }
  if (action === 'approved_step') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }
  if (action === 'rejected') {
    return 'bg-rose-50 text-rose-700 ring-rose-200';
  }
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function roleStyle(role) {
  if (role === 'student') return 'bg-sky-50 text-sky-700 ring-sky-200';
  if (role === 'faculty') return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
  if (role === 'hod') return 'bg-violet-50 text-violet-700 ring-violet-200';
  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function formatDate(ts) {
  if (!ts) return '-';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

function humanLabel(key) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function getRecordEntries(record) {
  if (!record || typeof record !== 'object') return [];

  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return Object.entries(record.data).filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    );
  }

  const skip = new Set([
    'id',
    'owner_id',
    'created_at',
    'updated_at',
    'attachment_path',
    'attachment_url',
    'submission_status',
  ]);

  return Object.entries(record).filter(
    ([key, value]) =>
      !skip.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== '' &&
      typeof value !== 'object'
  );
}

function renderValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export default function ReviewHistoryCards({ summary, title = 'Review History' }) {
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cards = useMemo(
    () => [
      {
        label: 'Total Cleared',
        value: summary?.totalReviewed ?? 0,
        icon: History,
        color: 'bg-sky-50 text-sky-600',
      },
      {
        label: 'Approved',
        value: summary?.approvedCount ?? 0,
        icon: CheckCircle2,
        color: 'bg-emerald-50 text-emerald-600',
      },
      {
        label: 'Rejected',
        value: summary?.rejectedCount ?? 0,
        icon: XCircle,
        color: 'bg-rose-50 text-rose-600',
      },
      {
        label: 'Final Approved',
        value: summary?.finalApprovedCount ?? 0,
        icon: ShieldCheck,
        color: 'bg-indigo-50 text-indigo-600',
      },
      {
        label: 'Pending Now',
        value: summary?.pendingNow ?? 0,
        icon: Clock4,
        color: 'bg-amber-50 text-amber-600',
      },
    ],
    [summary]
  );

  useEffect(() => {
    if (selected) {
      const raf = requestAnimationFrame(() => setDrawerOpen(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [selected]);

  function openDrawer(item) {
    setSelected(item);
    setDrawerOpen(false);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelected(null);
    }, 260);
  }

  if (!summary) return null;

  return (
    <>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {cards.map(({ label, value, icon: Icon, color }) => (
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

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Click any card to view complete submission information
            </p>
          </div>

          {summary.recentHistory?.length ? (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {summary.recentHistory.map((item) => {
                const actorName =
                  item.submitter?.full_name ||
                  item.submitter?.email ||
                  item.actor?.full_name ||
                  item.actor?.email ||
                  '-';

                const recordTitle =
                  item.record?.title ||
                  item.record?.name ||
                  item.record?.project_title ||
                  item.record?.paper_title ||
                  'Untitled Submission';

                const submitterRole =
                  item.submitter?.role ||
                  item.submission?.submitter_role ||
                  '-';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openDrawer(item)}
                    className="group text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${actionStyle(item.action)}`}>
                            {prettyAction(item.action)}
                          </span>

                          <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${roleStyle(submitterRole)}`}>
                            {submitterRole}
                          </span>
                        </div>

                        <h4 className="mt-3 text-sm font-bold text-slate-900 line-clamp-2">
                          {recordTitle}
                        </h4>

                        <p className="mt-2 text-xs font-semibold text-slate-600">
                          {actorName}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all group-hover:bg-sky-50 group-hover:text-sky-600">
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Remarks
                      </p>
                      <p className="mt-1 text-sm text-slate-700 line-clamp-2">
                        {item.remarks || 'No remarks'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-500">No review history yet</p>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[300] overflow-hidden">
          <div
            onClick={closeDrawer}
            className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
              drawerOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            className={`absolute inset-y-0 right-0 w-full max-w-[1100px] transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex h-full flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${actionStyle(selected.action)}`}>
                      {prettyAction(selected.action)}
                    </span>

                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${roleStyle(selected.submitter?.role || selected.submission?.submitter_role)}`}>
                      {selected.submitter?.role || selected.submission?.submitter_role || '-'}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-black text-slate-900">
                    {selected.record?.title ||
                      selected.record?.name ||
                      selected.record?.project_title ||
                      selected.record?.paper_title ||
                      'Submission Details'}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Complete approval / rejection information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-bold text-slate-900">Person Information</h4>

                      <div className="mt-4 grid gap-3">
                        <div className="flex items-start gap-3 rounded-xl bg-white p-3">
                          <User2 size={16} className="mt-0.5 text-sky-600" />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Name</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {selected.submitter?.full_name || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-white p-3">
                          <BadgeInfo size={16} className="mt-0.5 text-indigo-600" />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Email</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {selected.submitter?.email || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-white p-3">
                          <ShieldCheck size={16} className="mt-0.5 text-violet-600" />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Role</p>
                            <p className="text-sm font-semibold text-slate-900 capitalize">
                              {selected.submitter?.role || selected.submission?.submitter_role || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-bold text-slate-900">Approval Information</h4>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Action</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {prettyAction(selected.action)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Time</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatDate(selected.created_at)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">From Status</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selected.metadata?.from_status || '-'}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">To Status</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selected.metadata?.to_status || '-'}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 md:col-span-2">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Remarks</p>
                          <p className="mt-1 text-sm text-slate-800">
                            {selected.remarks || 'No remarks'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-bold text-slate-900">Submission Information</h4>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Record Title</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {selected.record?.title ||
                              selected.record?.name ||
                              selected.record?.project_title ||
                              selected.record?.paper_title ||
                              '-'}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Table</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                            {(selected.table_name || '-').replace(/_/g, ' ')}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Submission ID</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 break-all">
                            {selected.submission?.id || '-'}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Record ID</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 break-all">
                            {selected.record_id || selected.record?.id || '-'}
                          </p>
                        </div>
                      </div>

                      {selected.record?.attachment_url ? (
                        <div className="mt-4">
                          <a
                            href={selected.record.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                          >
                            <FileText size={15} />
                            Open Attachment
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <CalendarClock size={16} className="text-sky-600" />
                        <h4 className="text-sm font-bold text-slate-900">Submitted Data</h4>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {getRecordEntries(selected.record).length ? (
                          getRecordEntries(selected.record).map(([key, value]) => (
                            <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                {humanLabel(key)}
                              </p>
                              <p className="mt-1 text-sm text-slate-900 break-words">
                                {renderValue(value)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="md:col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                            <p className="text-sm font-semibold text-slate-500">
                              No detailed record fields available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}