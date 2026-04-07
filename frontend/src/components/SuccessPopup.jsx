import { useEffect, useState } from 'react';
import { CheckCircle2, X, ArrowRight, Send } from 'lucide-react';

/**
 * SuccessPopup
 *
 * Props:
 *   visible   – boolean
 *   type      – 'submit' | 'approve' | 'reject' | 'draft' | 'created'
 *   title     – main heading
 *   message   – sub-text
 *   meta      – optional { label, value }[] shown as small tags
 *   onClose   – called when dismissed
 *   onAction  – optional { label, fn } secondary CTA
 */

const CONFIG = {
  submit: {
    icon: Send,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    accent: 'from-sky-500 to-indigo-500',
    ring: 'ring-sky-200',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  approve: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    accent: 'from-emerald-500 to-teal-500',
    ring: 'ring-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  reject: {
    icon: X,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    accent: 'from-rose-500 to-pink-500',
    ring: 'ring-rose-200',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  draft: {
    icon: CheckCircle2,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    accent: 'from-slate-500 to-slate-600',
    ring: 'ring-slate-200',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
  created: {
    icon: CheckCircle2,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    accent: 'from-indigo-500 to-violet-500',
    ring: 'ring-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
};

export default function SuccessPopup({ visible, type = 'submit', title, message, meta = [], onClose, onAction }) {
  const [show, setShow] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  const cfg = CONFIG[type] || CONFIG.submit;
  const Icon = cfg.icon;

  // Auto-close after 6 s
  useEffect(() => {
    if (!visible) return;
    setShow(true);
    setAnimateOut(false);
    const timer = setTimeout(() => close(), 6000);
    return () => clearTimeout(timer);
  }, [visible]);

  function close() {
    setAnimateOut(true);
    setTimeout(() => {
      setShow(false);
      setAnimateOut(false);
      onClose?.();
    }, 300);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ${cfg.ring} overflow-hidden
          transition-all duration-300
          ${animateOut ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}
        `}
        style={{ animation: animateOut ? undefined : 'popIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Top accent bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.accent}`} />

        {/* Progress bar (auto-close indicator) */}
        <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${cfg.accent} origin-left`}
            style={{ animation: 'shrink 6s linear forwards' }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={close}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
        >
          <X size={14} />
        </button>

        <div className="px-8 py-8">
          {/* Icon */}
          <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${cfg.iconBg} ring-1 ${cfg.ring}`}>
            <Icon size={30} className={cfg.iconColor} strokeWidth={2} />
          </div>

          {/* Text */}
          <h2 className="text-xl font-black text-slate-900 leading-tight">{title}</h2>
          {message && (
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
          )}

          {/* Meta tags */}
          {meta.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {meta.map(({ label, value }) => (
                <div key={label} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold ring-1 ${cfg.badge}`}>
                  <span className="opacity-60">{label}</span>
                  <span className="opacity-40">·</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-7 flex items-center gap-3">
            {onAction && (
              <button
                onClick={() => { onAction.fn(); close(); }}
                className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${cfg.accent} px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-95`}
              >
                {onAction.label} <ArrowRight size={15} />
              </button>
            )}
            <button
              onClick={close}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              {onAction ? 'Dismiss' : 'Close'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.92) translateY(16px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
