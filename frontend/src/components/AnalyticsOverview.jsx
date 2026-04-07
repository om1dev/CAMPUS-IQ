import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.12)',
  fontSize: '12px',
};

function ChartCard({ title, subtitle, children, empty }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex flex-col">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>
      </div>
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="text-slate-300 text-lg">—</span>
          </div>
          <p className="text-xs font-semibold text-slate-400">No data yet</p>
        </div>
      ) : children}
    </div>
  );
}

export default function AnalyticsOverview({ records, submissions, title = null, subtitle = null }) {

  const categoryData = useMemo(() => {
    const counts = {};
    [...records, ...submissions.map(s => s.record)].forEach(r => {
      if (!r?.table_name) return;
      counts[r.table_name] = (counts[r.table_name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [records, submissions]);

  const statusData = useMemo(() => {
    const counts = {};
    submissions.forEach(s => {
      const label = String(s.status || '').replace(/_/g, ' ');
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [submissions]);

  const hasData = records.length > 0 || submissions.length > 0;

  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div>
          {title    && <h3 className="text-base font-black text-slate-900 leading-tight">{title}</h3>}
          {subtitle && <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="R&D Category Breakdown"
          subtitle="Records & submissions by type"
          empty={!hasData}
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  dataKey="name" type="category"
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  width={90}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={14}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Submission Pipeline"
          subtitle="Status distribution of your submissions"
          empty={statusData.length === 0}
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="44%"
                  innerRadius={50} outerRadius={74}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '6px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
