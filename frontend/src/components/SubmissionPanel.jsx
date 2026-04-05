import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import Timeline from './Timeline';
import TableToolbar from './TableToolbar';

export default function SubmissionPanel({
  title,
  submissions,
  onApprove,
  onReject,
  canReview = false
}) {
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', year: '' });

  const filtered = useMemo(() => {
    return submissions.filter((item) => {
      const titleMatch = filters.search
        ? String(item.record?.title || '').toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const yearMatch = filters.year
        ? String(item.record?.year || '') === String(filters.year)
        : true;
      return titleMatch && yearMatch;
    });
  }, [submissions, filters]);

  const exportRows = filtered.map((item) => ({
    title: item.record?.title || '',
    year: item.record?.year || '',
    table: item.table_name,
    status: item.status,
    submitter: item.submitter?.full_name || item.submitter?.email || ''
  }));

  async function approve(item) {
    const remarks = window.prompt('Approval remarks', 'Approved');
    if (remarks === null) return;
    await onApprove(item.id, remarks);
    toast.success('Approved');
  }

  async function reject(item) {
    const remarks = window.prompt('Rejection remarks', 'Rejected');
    if (remarks === null) return;
    await onReject(item.id, remarks);
    toast.success('Rejected');
  }

  return (
    <div className="space-y-4">
      <TableToolbar title={title} rows={exportRows} filters={filters} setFilters={setFilters} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-4 text-base font-bold text-slate-900">{title}</h3>
          <div className="space-y-3">
            {filtered.length ? filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.record?.title || '-'}</p>
                    <p className="text-xs text-slate-500">
                      {item.table_name} • {item.submitter?.full_name || item.submitter?.email || '-'}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Year: {item.record?.year || '-'}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Current: {item.current_reviewer_role || 'completed'}</span>
                </div>

                {canReview ? (
                  <div className="mt-3 flex gap-2">
                    <span
                      onClick={(e) => { e.stopPropagation(); approve(item); }}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Approve
                    </span>
                    <span
                      onClick={(e) => { e.stopPropagation(); reject(item); }}
                      className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Reject
                    </span>
                  </div>
                ) : null}
              </div>
            )) : (
              <p className="text-sm text-slate-500">No submissions found.</p>
            )}
          </div>
        </div>

        <Timeline logs={selected?.logs || []} />
      </div>
    </div>
  );
}
