import { Clock3 } from 'lucide-react';

export default function Timeline({ logs = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-bold text-slate-900">Submission Timeline</h3>
      <div className="space-y-3">
        {logs.length ? logs.map((log) => (
          <div key={log.id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mt-0.5 rounded-full bg-blue-100 p-2 text-blue-700">
              <Clock3 size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{log.action}</p>
              <p className="text-xs text-slate-500">
                {log.actor_role || '-'} • {new Date(log.created_at).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-700">{log.remarks || 'No remarks'}</p>
            </div>
          </div>
        )) : (
          <p className="text-sm text-slate-500">No timeline items yet.</p>
        )}
      </div>
    </div>
  );
}
