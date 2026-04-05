export default function StatusBadge({ status }) {
  const map = {
    draft: 'bg-slate-100 text-slate-700',
    pending_faculty: 'bg-amber-100 text-amber-700',
    pending_hod: 'bg-sky-100 text-sky-700',
    pending_admin: 'bg-violet-100 text-violet-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    submitted: 'bg-blue-100 text-blue-700'
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {String(status || '-').replaceAll('_', ' ')}
    </span>
  );
}
