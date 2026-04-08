import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDialog — generic destructive confirmation modal
 *
 * Props:
 *   visible   – boolean
 *   title     – heading
 *   message   – body text
 *   confirmLabel – button label (default "Delete")
 *   onConfirm – called on confirm
 *   onCancel  – called on cancel / close
 */
export default function ConfirmDialog({ visible, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Top danger bar */}
        <div className="h-1 w-full bg-rose-500" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <AlertTriangle size={20} className="text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 transition-all shadow-sm shadow-rose-200 active:scale-95"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
