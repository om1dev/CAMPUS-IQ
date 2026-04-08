import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2, XCircle, FileDigit, Eye,
  Download, Info, Loader2, X, ExternalLink
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import Timeline from './Timeline';
import TableToolbar from './TableToolbar';
import SuccessPopup from './SuccessPopup';
import RejectRemarkModal from './RejectRemarkModal';

// ─── Submission list + detail panel (reusable) ───────────────────────────────
function SubmissionList({ items, selected, setSelected, canReview, onApprove, onReject, getDocumentUrl, setPreviewRecord }) {
  return (
    <div className="space-y-2.5">
      {items.length ? items.map((item) => {
        const isTerminal = item.status === 'approved' || item.status === 'rejected';
        return (
        <div
          key={item.id}
          onClick={() => setSelected(item)}
          className={`group relative rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
            selected?.id === item.id
              ? 'border-sky-500 bg-sky-50/40 ring-1 ring-inset ring-sky-500/40'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 leading-snug truncate">
                {item.record?.title || '—'}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
                <span className="capitalize font-medium">{item.table_name?.replace(/_/g, ' ')}</span>
                <span>·</span>
                <span className="font-semibold text-slate-600">{item.submitter?.full_name || item.submitter?.email || '—'}</span>
              </div>
            </div>
            <StatusBadge status={item.status} />
          </div>

          {/* Bottom row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex gap-2">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {item.record?.year || '—'}
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 capitalize">
                {item.current_reviewer_role ? `Pending ${item.current_reviewer_role}` : 'Completed'}
              </span>
            </div>

            <div className="flex gap-1.5">
              {getDocumentUrl(item.record) && (
                <button
                  onClick={e => { e.stopPropagation(); setPreviewRecord(item.record); }}
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-[11px] font-bold text-sky-700 ring-1 ring-inset ring-sky-200 hover:bg-sky-500 hover:text-white transition-all"
                >
                  <Eye size={13} /> Preview
                </button>
              )}
              {canReview && (
                <>
                  <button
                    disabled={isTerminal}
                    onClick={e => { e.stopPropagation(); if (!isTerminal) onApprove(item); }}
                    title={isTerminal ? `Already ${item.status}` : 'Approve'}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ring-1 ring-inset transition-all ${
                      isTerminal
                        ? 'bg-slate-50 text-slate-300 ring-slate-200 cursor-not-allowed'
                        : 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-500 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button
                    disabled={isTerminal}
                    onClick={e => { e.stopPropagation(); if (!isTerminal) onReject(item); }}
                    title={isTerminal ? `Already ${item.status}` : 'Reject'}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ring-1 ring-inset transition-all ${
                      isTerminal
                        ? 'bg-slate-50 text-slate-300 ring-slate-200 cursor-not-allowed'
                        : 'bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        );
      }) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <FileDigit size={20} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-700">No submissions here</p>
          <p className="mt-1 text-xs text-slate-400 max-w-[220px]">Nothing to review in this category right now.</p>
        </div>
      )}
    </div>
  );
}

// ─── Detail panel (right side) ───────────────────────────────────────────────
function DetailPanel({ selected, getDocumentUrl, setPreviewRecord }) {
  const [rightTab, setRightTab] = useState('details');

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-20 text-center h-full min-h-[400px]">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <Info size={20} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-700">Select a submission</p>
        <p className="mt-1 text-xs text-slate-400 max-w-[200px]">Click any record on the left to view its details and timeline.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Tab switcher */}
      <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
        {[
          { id: 'details',  label: 'Record Details' },
          { id: 'timeline', label: 'Approval Timeline' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setRightTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              rightTab === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rightTab === 'details' && (
        <div className="flex-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 overflow-y-auto animate-fade-in">
          {/* Submitter info */}
          <div className="mb-5 pb-5 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Submitted By</p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 flex-shrink-0 text-sm font-black">
                {(selected.submitter?.full_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selected.submitter?.full_name || '—'}</p>
                <p className="text-[11px] text-slate-400">{selected.submitter?.email || '—'} · <span className="capitalize">{selected.submitter_role}</span></p>
              </div>
            </div>
          </div>

          {/* Record fields */}
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Record Fields</p>
            {selected.record?.data && Object.keys(selected.record.data).length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {Object.entries(selected.record.data).map(([key, value]) => (
                  <div key={key} className={String(value || '').length > 40 ? 'col-span-2' : ''}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-semibold text-slate-800 break-words">{value || '—'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional fields.</p>
            )}
          </div>

          {/* Remarks from logs — show all reviewer remarks */}
          {(() => {
            const remarkLogs = (selected.logs || []).filter(l => l.remarks && l.remarks.trim());
            if (!remarkLogs.length) return null;
            return (
              <div className="mb-5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Reviewer Remarks</p>
                {remarkLogs.map((log, i) => {
                  const isRejection = log.action === 'rejected';
                  return (
                    <div key={log.id || i} className={`rounded-xl border px-4 py-3 ${
                      isRejection ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          isRejection ? 'text-rose-500' : 'text-emerald-600'
                        }`}>{log.action?.replace(/_/g, ' ')} · {log.actor_role}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold leading-relaxed ${
                        isRejection ? 'text-rose-800' : 'text-emerald-800'
                      }`}>"{log.remarks}"</p>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Document */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Eye size={12} /> Attachment
            </p>
            {getDocumentUrl(selected.record) ? (
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="h-52 bg-slate-100">
                  {selected.record?.attachment_path?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img src={getDocumentUrl(selected.record)} alt="Attachment" className="w-full h-full object-contain" />
                  ) : (
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(getDocumentUrl(selected.record))}&embedded=true`}
                      title="Preview"
                      className="w-full h-full border-0"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 truncate max-w-[160px]">{selected.record.attachment_path?.split('/').pop()}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewRecord(selected.record)}
                      className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700"
                    >
                      <Eye size={12} /> Expand
                    </button>
                    <a
                      href={getDocumentUrl(selected.record)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900"
                    >
                      <Download size={12} /> Download
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                <FileDigit size={18} className="mx-auto text-slate-300 mb-1.5" />
                <p className="text-xs text-slate-400">No attachment</p>
              </div>
            )}
          </div>
        </div>
      )}

      {rightTab === 'timeline' && (
        <div className="animate-fade-in flex-1">
          <Timeline logs={selected?.logs || []} />
        </div>
      )}
    </div>
  );
}

// ─── Main SubmissionPanel ─────────────────────────────────────────────────────
export default function SubmissionPanel({
  title,
  submissions,
  onApprove,
  onReject,
  onRefresh,
  canReview = false,
  roleTabs = null,
}) {
  const [selected,      setSelected]      = useState(null);
  const [filters,       setFilters]       = useState({ search: '', year: '' });
  const [loadingTask,   setLoadingTask]   = useState(null);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [activeRole,    setActiveRole]    = useState(roleTabs?.[0]?.role ?? null);
  const [popup,         setPopup]         = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null); // item pending rejection

  // Reset selected when switching role tab
  function switchRole(role) {
    setActiveRole(role);
    setSelected(null);
  }

  const filtered = useMemo(() => {
    return submissions.filter(item => {
      const roleMatch  = activeRole ? item.submitter_role === activeRole : true;
      const titleMatch = filters.search
        ? String(item.record?.title || '').toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const yearMatch  = filters.year
        ? String(item.record?.year || '') === String(filters.year)
        : true;
      return roleMatch && titleMatch && yearMatch;
    });
  }, [submissions, filters, activeRole]);

  // Count per role tab (unfiltered by search/year so badges always reflect reality)
  const countByRole = useMemo(() => {
    if (!roleTabs) return {};
    return Object.fromEntries(
      roleTabs.map(t => [t.role, submissions.filter(s => s.submitter_role === t.role).length])
    );
  }, [submissions, roleTabs]);

  const exportRows = filtered.map(item => ({
    title:     item.record?.title || '',
    year:      item.record?.year  || '',
    table:     item.table_name,
    status:    item.status,
    submitter: item.submitter?.full_name || item.submitter?.email || '',
    role:      item.submitter_role,
  }));

  const artificialDelay = () => new Promise(r => setTimeout(r, 5000));

  async function handleApprove(item) {
    setLoadingTask('Processing Approval…');
    try {
      await onApprove(item.id, 'Approved');
      await artificialDelay();
      setSelected(null);
      onRefresh?.();
      setPopup({
        type: 'approve',
        title: 'Submission Approved',
        message: 'The record has been approved and forwarded to the next level.',
        meta: [
          { label: 'Record', value: item.record?.title || '—' },
          { label: 'By',     value: item.submitter?.full_name || item.submitter?.email || '—' },
        ],
      });
    } catch {
      toast.error('Approval failed');
    } finally {
      setLoadingTask(null);
    }
  }

  function handleRejectClick(item) {
    setRejectTarget(item);
  }

  async function executeReject(remark) {
    const item = rejectTarget;
    setRejectTarget(null);
    setLoadingTask('Processing Rejection…');
    try {
      await onReject(item.id, remark);
      await artificialDelay();
      setSelected(null);
      onRefresh?.();
      setPopup({
        type: 'reject',
        title: 'Submission Rejected',
        message: 'The record has been rejected. The submitter will be notified.',
        meta: [
          { label: 'Record', value: item.record?.title || '—' },
          { label: 'By',     value: item.submitter?.full_name || item.submitter?.email || '—' },
          { label: 'Reason', value: remark },
        ],
      });
    } catch {
      toast.error('Rejection failed');
    } finally {
      setLoadingTask(null);
    }
  }

  function getDocumentUrl(record) {
    if (record?.attachment_url) return record.attachment_url;
    if (record?.attachment_path) {
      const base = import.meta.env.VITE_SUPABASE_URL;
      if (base) return `${base}/storage/v1/object/public/rd-files/${record.attachment_path}`;
    }
    return null;
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Processing overlay */}
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

      {/* Document preview modal */}
      {previewRecord && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setPreviewRecord(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <p className="text-sm font-bold text-slate-900 truncate max-w-[500px]">{previewRecord.title || 'Document Preview'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Full Preview</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getDocumentUrl(previewRecord)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-[11px] font-bold text-sky-700 ring-1 ring-sky-200 hover:bg-sky-500 hover:text-white transition-all"
                >
                  <ExternalLink size={13} /> Open in Tab
                </a>
                <button
                  onClick={() => setPreviewRecord(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100" style={{ minHeight: '60vh' }}>
              {previewRecord.attachment_path?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <div className="flex h-full items-center justify-center p-6">
                  <img src={getDocumentUrl(previewRecord)} alt="Attachment" className="max-h-full max-w-full rounded-xl object-contain shadow-md" />
                </div>
              ) : (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(getDocumentUrl(previewRecord))}&embedded=true`}
                  title="Document Preview"
                  className="w-full h-full border-0"
                  style={{ minHeight: '60vh' }}
                />
              )}
            </div>
          </div>
        </div>
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

      <RejectRemarkModal
        visible={!!rejectTarget}
        recordTitle={rejectTarget?.record?.title}
        onConfirm={executeReject}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Toolbar */}
      <TableToolbar title={title} rows={exportRows} filters={filters} setFilters={setFilters} />

      {/* Role tabs (HOD: student/faculty | Admin: student/faculty/hod) */}
      {roleTabs && (
        <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 w-fit">
          {roleTabs.map(tab => (
            <button
              key={tab.role}
              onClick={() => switchRole(tab.role)}
              className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all ${
                activeRole === tab.role
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon && <tab.icon size={15} />}
              {tab.label}
              {countByRole[tab.role] > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
                  activeRole === tab.role ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {countByRole[tab.role]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left — list */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {roleTabs ? roleTabs.find(t => t.role === activeRole)?.label : title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            {filtered.length > 0 && (
              <span className="rounded-lg bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-700 ring-1 ring-sky-200">
                {filtered.filter(s => s.current_reviewer_role).length} pending
              </span>
            )}
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-280px)]">
            <SubmissionList
              items={filtered}
              selected={selected}
              setSelected={setSelected}
              canReview={canReview}
              onApprove={handleApprove}
              onReject={handleRejectClick}
              getDocumentUrl={getDocumentUrl}
              setPreviewRecord={setPreviewRecord}
            />
          </div>
        </div>

        {/* Right — detail */}
        <div className="min-h-[400px]">
          <DetailPanel
            selected={selected}
            getDocumentUrl={getDocumentUrl}
            setPreviewRecord={setPreviewRecord}
          />
        </div>
      </div>
    </div>
  );
}
