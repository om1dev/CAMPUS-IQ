import { useEffect, useState } from 'react';
import { LogOut, User, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

function ISTClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const date = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200/60">
      <Clock size={14} className="text-sky-500 flex-shrink-0" />
      <div className="flex flex-col leading-none">
        <span className="text-[13px] font-black tracking-tight text-slate-900 tabular-nums">{time}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{date} · IST</span>
      </div>
    </div>
  );
}

const navMap = {
  student: 'Student Intelligence',
  faculty: 'Faculty Intelligence',
  hod: 'HOD Overview',
  admin: 'Admin Console',
  superadmin: 'Superadmin Console'
};

export default function AppLayout({ title, sidebarItems = [], activeTab = '', onTabChange, notifications = [], children }) {
  const { profile, logout } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] font-sans selection:bg-sky-500 selection:text-white">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden bg-mesh opacity-80 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-300/20 mix-blend-multiply blur-[120px] animate-blob [animation-delay:4s]" />
      </div>

      {/* Advanced Sidebar */}
      <aside className="relative z-20 flex w-[280px] flex-col border-r border-slate-200/60 bg-white/60 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Branding */}
        <div className="flex items-center gap-4 px-6 py-8 border-b border-slate-200/50">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg shadow-slate-900/20 ring-1 ring-white/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20mix-blend-overlay"></div>
             <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Campus-IQ</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 leading-none">{profile?.role} Access</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2 special-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group relative flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 ring-1 ring-sky-500/50'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200/60'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-white/30 rounded-r-full" />}
                
                <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-sky-500'}`} />
                <span className="tracking-wide relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200/50 bg-white/40">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/60 mb-3">
             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
                <User size={16} className="text-slate-600" />
             </div>
             <div className="flex flex-col overflow-hidden">
               <span className="truncate text-[13px] font-bold text-slate-900 leading-tight">{profile?.full_name}</span>
               <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">{profile?.email}</span>
             </div>
          </div>
          <button
            onClick={logout}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-rose-50 hover:text-rose-600 hover:ring-1 hover:ring-rose-200 active:scale-95"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
            Secure Disconnect
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="relative z-10 flex w-full flex-col overflow-hidden">
        {/* Dynamic Header */}
        <header className="flex h-[88px] items-center justify-between border-b border-slate-200/50 bg-white/30 px-10 backdrop-blur-xl">
           <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 leading-tight">Current Workspace</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{sidebarItems.find(i => i.id === activeTab)?.label || title}</h2>
           </div>
           
           <div className="hidden items-center gap-3 md:flex">
              <NotificationPanel notifications={notifications} />
              <ISTClock />
           </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto px-10 py-8 special-scrollbar">
           <div className="mx-auto max-w-[1400px] animate-fade-in">
             {children}
           </div>
        </div>
      </main>

    </div>
  );
}
