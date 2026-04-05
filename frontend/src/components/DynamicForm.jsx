import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function DynamicForm({ tableName, tableConfig, onSave }) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);
  const [values, setValues] = useState({});

  const fields = useMemo(() => tableConfig?.fields || [], [tableConfig]);

  function updateValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!title) {
      toast.error('Title is required');
      return;
    }

    const missingRequired = fields.find((field) => field.required && !values[field.name]);
    if (missingRequired) {
      toast.error(`${missingRequired.label} is required`);
      return;
    }

    await onSave({
      title,
      year,
      file,
      data: values
    });

    setTitle('');
    setValues({});
    setFile(null);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">{tableConfig?.label || tableName}</h3>
        <p className="text-sm text-slate-500">Create a draft record and submit it into the approval workflow.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Attachment</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        {fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="mb-1 block text-xs font-semibold text-slate-600">{field.label}</label>

            {field.type === 'textarea' ? (
              <textarea
                value={values[field.name] || ''}
                onChange={(e) => updateValue(field.name, e.target.value)}
                className="min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            ) : field.type === 'select' ? (
              <select
                value={values[field.name] || ''}
                onChange={(e) => updateValue(field.name, e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                value={values[field.name] || ''}
                onChange={(e) => updateValue(field.name, e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Save Draft
      </button>
    </form>
  );
}
