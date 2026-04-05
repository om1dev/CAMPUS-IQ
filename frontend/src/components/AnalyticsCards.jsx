import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function makeData(obj = {}) {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}

export default function AnalyticsCards({ analytics }) {
  if (!analytics) return null;

  const statusData = makeData(analytics.byStatus);
  const roleData = makeData(analytics.byRole);
  const tableData = makeData(analytics.byTable).slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-500">Total Submissions</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.totalSubmissions}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
        <h3 className="mb-3 text-sm font-bold text-slate-900">By Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide={false} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">By Submitter Role</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Top R&D Tables</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tableData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
