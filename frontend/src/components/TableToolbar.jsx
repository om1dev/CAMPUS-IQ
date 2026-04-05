import { exportRowsToExcel, exportRowsToPdf } from '../lib/exportUtils';

export default function TableToolbar({ title, rows, filters, setFilters }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Search</label>
        <input
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Search title..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">Year</label>
        <input
          value={filters.year}
          onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="2026"
        />
      </div>
      <div className="ml-auto flex gap-2">
        <button
          onClick={() => exportRowsToExcel(`${title}.xlsx`, rows)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Export Excel
        </button>
        <button
          onClick={() => exportRowsToPdf(`${title}.pdf`, title, rows)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
