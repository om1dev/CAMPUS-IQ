import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, FileText, CheckCircle2, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

export default function AnalyticsOverview({ records, submissions }) {
  
  const stats = useMemo(() => {
    const totalDrafts = records.length;
    const totalSubmissions = submissions.length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const pending = submissions.filter(s => s.status === 'submitted' || s.status.includes('approved')).length; // any non-final state could be pending relative to top

    return { totalDrafts, totalSubmissions, approved, pending };
  }, [records, submissions]);

  const categoryData = useMemo(() => {
    const counts = {};
    const everything = [...records, ...submissions.map(s => s.record)];
    everything.forEach(r => {
      if (!r || !r.table_name) return;
      counts[r.table_name] = (counts[r.table_name] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value
    })).sort((a,b) => b.value - a.value).slice(0, 5); // top 5
  }, [records, submissions]);

  const statusData = useMemo(() => {
    const counts = {};
    submissions.forEach(s => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-blue-50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2 text-slate-500">
              <FileText size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Local Drafts</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.totalDrafts}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-indigo-50 transition-transform group-hover:scale-150" />
          <div className="relative">
             <div className="flex items-center gap-3 mb-2 text-slate-500">
              <TrendingUp size={16} className="text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Workflows</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.totalSubmissions}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-amber-50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2 text-slate-500">
              <Clock size={16} className="text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">In Review</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-emerald-50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2 text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Approved</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.approved}</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      {records.length > 0 || submissions.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Top R&D Categories
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Submission Pipeline Status
            </h3>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center flex flex-col items-center justify-center min-h-[300px]">
           <PieChart size={40} className="text-slate-200 mb-4" />
           <p className="text-lg font-bold text-slate-800">No Analytics Data Yet</p>
           <p className="text-sm text-slate-500 mt-1 max-w-sm">Begin drafting or submitting records to populate the interactive visualization dashboard.</p>
        </div>
      )}
    </div>
  );
}
