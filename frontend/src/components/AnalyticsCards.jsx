import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.12)',
  fontSize: '12px',
};

function makeData(obj = {}) {
  return Object.entries(obj).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex flex-col">
      <div className="mb-5">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsCards({ analytics }) {
  if (!analytics) {
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const statusData = makeData(analytics.byStatus);
  const roleData   = makeData(analytics.byRole);
  const tableData  = makeData(analytics.byTable).slice(0, 8);

  return (
    <div className="grid gap-5 lg:grid-cols-3">

      {/* Status donut */}
      <ChartCard title="Pipeline Status" subtitle="Distribution across all stages">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="45%"
                innerRadius={52} outerRadius={78}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: '#64748b', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* By role */}
      <ChartCard title="Submissions by Role" subtitle="Volume per submitter category">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false} tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={32}>
                {roleData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Top R&D categories */}
      <ChartCard title="Top R&D Categories" subtitle="Most active submission types">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tableData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                dataKey="name" type="category"
                axisLine={false} tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                width={88}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={14}>
                {tableData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

    </div>
  );
}
