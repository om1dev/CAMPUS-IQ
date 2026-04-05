import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login, signup } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { profile, saveSession, refreshMe, roleToPath } = useAuth();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    department_id: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.role) {
      navigate(roleToPath(profile.role), { replace: true });
    }
  }, [profile, navigate, roleToPath]);

  function update(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await signup(form);

      saveSession(response.session, response.profile);
      await refreshMe();
      toast.success(mode === 'login' ? 'Authentication successful' : 'Provisioning successful');
      navigate(roleToPath(response.profile?.role || 'student'), { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Authentication Gateway Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#0f172a] font-sans selection:bg-sky-500 selection:text-white">
      {/* Immersive Dark Mode Animated Background for Login */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[1000px] w-[1000px] rounded-full bg-sky-900/40 mix-blend-screen blur-[150px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-900/40 mix-blend-screen blur-[150px] animate-blob [animation-delay:4s]" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] p-6 lg:p-12">
        <div className="mx-auto grid items-center gap-16 lg:grid-cols-2">
          
          {/* Stunning Brand Section */}
          <div className="flex flex-col justify-center animate-slide-up">
            <div className="group mb-12 inline-flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-2xl transition-transform duration-500 group-hover:scale-110">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter text-white">Campus-IQ</span>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-400">Next-Gen Interface</span>
              </div>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-white lg:text-7xl">
              Research.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">Elevated.</span>
            </h1>
            
            <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-slate-400">
              Enter the highly secure, institutional-grade workflow platform designed to perfectly arrange your academic submissions and intelligence analytics.
            </p>
          </div>

          {/* Premium Login Panel */}
          <div className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 sm:p-12 animate-slide-up [animation-delay:200ms]">
             <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-white">System Gateway</h2>
                <p className="mt-2 text-sm font-semibold text-slate-400">Establish your secure connection</p>
             </div>

             <div className="mb-10 flex rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10">
                <button
                  className={`flex-1 rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-300 ${mode === 'login' ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setMode('login')}
                  type="button"
                >
                  Authentication
                </button>
             </div>

             <form onSubmit={submit} className="space-y-6">
                {mode === 'signup' && (
                  <div className="animate-fade-in space-y-6">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Full Legal Name</label>
                       <input
                        value={form.full_name}
                        onChange={(e) => update('full_name', e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/50 focus:bg-white/10 focus:ring-4 focus:ring-sky-500/20"
                        placeholder="John Doe"
                       />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                   <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">University Email</label>
                   <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/50 focus:bg-white/10 focus:ring-4 focus:ring-sky-500/20"
                    placeholder="user@university.edu"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Secure Protocol Key</label>
                   <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/50 focus:bg-white/10 focus:ring-4 focus:ring-sky-500/20"
                    placeholder="••••••••••••"
                   />
                </div>

                <button
                  disabled={loading}
                  className="group relative mt-10 w-full overflow-hidden rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-900 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-100 to-indigo-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <span className="relative z-10">{loading ? 'Negotiating handshake...' : mode === 'login' ? 'Initiate Link' : 'Provision Identity'}</span>
                </button>
             </form>
          </div>

        </div>
      </div>
    </div>
  );
}
