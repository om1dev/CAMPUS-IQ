import { useState } from 'react';
import { XCircle, X, AlertCircle } from 'lucide-react';

/**
 * RejectRemarkModal — forces reviewer to enter a non-empty remark before rejecting
 *
 * Props:
 *   visible     – boolean
 *   recordTitle – string shown in the modal
 *   onConfirm   – (remark: string) => void
 *   onCancel    – () => void
 */
export default function RejectRemarkModal({ visible, recordTitle, onConfirm, onCancel }) {
  const [remark, setRemark] = useState('');
  const [error,  setError]  = useState(false);

  if (!visible) return null;

  function handleConfirm() {
    if (!remark.trim()) {
      setError(true);
      return;
    }
    const val = remark.trim();
    setRemark('');
    setError(false);
    onConfirm(val);
  }

  function handleCancel() {
    setRemark('');
    setError(false);
    onCancel();
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="h-1 w-full bg-rose-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50">
              <XCircle size={18} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Reject Submission</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[260px]">{recordTitle || 'Selected record'}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={remark}
              onChange={e => { setRemark(e.target.value); setError(false); }}
              rows={4}
              placeholder="Explain why this submission is being rejected. This will be visible to the submitter."
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-slate-900 outline-none resize-none transition-all placeholder:text-slate-300
                ${error
                  ? 'border-rose-400 bg-rose-50 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-200 bg-slate-50 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10'
                }`}
            />
            {error && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-500">
                <AlertCircle size={12} /> A rejection reason is required.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-[11px] font-semibold text-amber-700">
              This action cannot be undone. The submitter will need to create a new submission.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={handleCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-600 transition-all shadow-sm shadow-rose-200 active:scale-95"
          >
            <XCircle size={14} /> Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
