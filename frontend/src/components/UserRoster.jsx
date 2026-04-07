import { useState } from 'react';
import { Trash2, UserPlus, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';
import { deleteUser } from '../services/userService';

/**
 * UserRoster — reusable add + delete panel for any user role
 *
 * Props:
 *   title        – panel heading e.g. "Students"
 *   subtitle     – e.g. "Your direct reports"
 *   users        – array of user objects
 *   onAdd        – async (formValues) => void  (called after submit)
 *   onDeleted    – () => void  (called after successful delete to trigger reload)
 *   addForm      – array of field descriptors:
 *                  { name, label, type?, placeholder?, defaultValue? }
 *   accentColor  – tailwind color token e.g. 'sky' | 'indigo' | 'violet'
 *   roleLabel    – singular label e.g. 'student' | 'faculty' | 'HOD'
 */
export default function UserRoster({
  title,
  subtitle,
  users = [],
  onAdd,
  onDeleted,
  addForm = [],
  accentColor = 'sky',
  roleLabel = 'user',
}) {
  const [form,          setForm]          = useState(() => buildDefault(addForm));
  const [submitting,    setSubmitting]    = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null); // user object
  const [deletingId,    setDeletingId]    = useState(null);

  const accent = {
    sky:    { icon: 'bg-sky-50 text-sky-600',    ring: 'ring-sky-200',    badge: 'text-sky-600 ring-sky-200',    btn: 'bg-sky-500 hover:bg-sky-600',    border: 'hover:border-sky-200' },
    indigo: { icon: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-200', badge: 'text-indigo-600 ring-indigo-200', btn: 'bg-indigo-500 hover:bg-indigo-600', border: 'hover:border-indigo-200' },
    violet: { icon: 'bg-violet-50 text-violet-600', ring: 'ring-violet-200', badge: 'text-violet-600 ring-violet-200', btn: 'bg-violet-500 hover:bg-violet-600', border: 'hover:border-violet-200' },
  }[accentColor] || {};

  function buildDefault(fields) {
    return Object.fromEntries(fields.map(f => [f.name, f.defaultValue ?? '']));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd(form);
      setForm(buildDefault(addForm));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const user = deleteTarget;
    setDeleteTarget(null);
    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      toast.success(`${user.full_name} removed`);
      onDeleted?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10';

  return (
    <>
      <ConfirmDialog
        visible={!!deleteTarget}
        title={`Remove ${roleLabel}?`}
        message={`"${deleteTarget?.full_name}" will be permanently removed from the system. This cannot be undone.`}
        confirmLabel="Yes, Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">

        {/* ── Add form ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent.icon}`}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add {title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Fill in the details below to create a new account</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="p-6 grid gap-4 sm:grid-cols-2">
            {addForm.map(field => (
              <div
                key={field.name}
                className={`space-y-1.5 ${field.fullWidth ? 'sm:col-span-2' : ''}`}
              >
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={form[field.name]}
                  onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                  className={inputCls}
                  placeholder={field.placeholder || field.label}
                  required={field.required !== false}
                />
              </div>
            ))}

            <div className="sm:col-span-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60 ${accent.btn}`}
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Adding…</>
                  : `Add ${title}`
                }
              </button>
            </div>
          </form>
        </div>

        {/* ── Roster ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title} Roster</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
            </div>
            <span className={`rounded-lg bg-white px-3 py-1.5 text-xs font-bold ring-1 shadow-sm ${accent.badge}`}>
              {users.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[480px]">
            {users.length ? users.map(u => (
              <div
                key={u.id}
                className={`group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all ${accent.border} hover:shadow-sm`}
              >
                {/* Avatar initial */}
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-black ${accent.icon}`}>
                  {(u.full_name || '?')[0].toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{u.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                </div>

                {u.year && (
                  <span className="flex-shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                    Y{u.year}
                  </span>
                )}

                {/* Delete button */}
                <button
                  onClick={() => setDeleteTarget(u)}
                  disabled={deletingId === u.id}
                  className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all disabled:opacity-50"
                  title={`Remove ${u.full_name}`}
                >
                  {deletingId === u.id
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Users size={28} className="text-slate-200 mb-3" />
                <p className="text-sm font-semibold text-slate-500">No {roleLabel}s yet</p>
                <p className="text-xs text-slate-400 mt-1">Add one using the form.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
