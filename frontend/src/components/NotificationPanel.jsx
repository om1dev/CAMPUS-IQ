import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function NotificationPanel({ notifications = [] }) {
  const [open, setOpen] = useState(false);

  const unread = notifications.length;

  const iconMap = {
    approved: { icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-500', ring: 'ring-emerald-200', label: 'Approved' },
    rejected:  { icon: XCircle,     bg: 'bg-rose-50',    color: 'text-rose-500',    ring: 'ring-rose-200',    label: 'Rejected'  },
    pending:   { icon: Clock,       bg: 'bg-amber-50',   color: 'text-amber-500',   ring: 'ring-amber-200',   label: 'Pending'   },
  };

  function fmt(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  }

  const dropdown = open && createPortal(
    <>
      {/* Full-screen backdrop — sits above everything */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={() => setOpen(false)}
      />

      {/* Panel — anchored via JS position, above backdrop */}
      <div
        id="notification-panel"
        className="fixed w-[380px] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-fade-in"
        style={{ zIndex: 9999, top: 72, right: 24 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{unread} update{unread !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
          {notifications.length ? notifications.map((n, i) => {
            const cfg = iconMap[n.type] || iconMap.pending;
            const Icon = cfg.icon;
            return (
              <div key={n.id || i} className="flex gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${cfg.bg} ${cfg.ring}`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 leading-snug truncate">{n.title}</p>
                    <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ${cfg.bg} ${cfg.color} ${cfg.ring}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {n.submitter && (
                    <p className="text-[11px] text-slate-400 mt-0.5">By {n.submitter}</p>
                  )}
                  {n.remark && (
                    <div className={`mt-2 rounded-lg px-3 py-2 ${n.type === 'rejected' ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50 border border-slate-100'}`}>
                      <p className={`text-[11px] font-semibold leading-relaxed ${n.type === 'rejected' ? 'text-rose-700' : 'text-slate-600'}`}>
                        "{n.remark}"
                      </p>
                    </div>
                  )}
                  {n.tableName && (
                    <p className="text-[10px] text-slate-400 mt-1.5 capitalize">{n.tableName.replace(/_/g, ' ')}</p>
                  )}
                  <p className="text-[10px] text-slate-300 mt-1">{fmt(n.timestamp)}</p>
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Bell size={20} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-700">No notifications</p>
              <p className="text-xs text-slate-400 mt-1">Updates on your submissions will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 hover:bg-slate-50 transition-all"
      >
        <Bell size={17} className="text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {dropdown}
    </div>
  );
}
