import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
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
  const [redirecting, setRedirecting] = useState(false);

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
      setRedirecting(true);
      setTimeout(() => {
        navigate(roleToPath(response.profile?.role || 'student'), { replace: true });
      }, 1800);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Authentication Gateway Failed');
      setLoading(false);
    }
  }

  if (redirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc]">
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] animate-blob" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-300/20 mix-blend-multiply blur-[120px] animate-blob [animation-delay:4s]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-xl shadow-sky-500/20">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <Loader2 size={32} className="animate-spin text-sky-500" />
          <div className="text-center">
            <p className="text-base font-bold text-slate-800">Loading your workspace</p>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-widest text-slate-400">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] font-sans selection:bg-sky-500 selection:text-white">
      {/* Light ambient blobs matching AppLayout */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-sky-300/20 mix-blend-multiply blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-300/20 mix-blend-multiply blur-[120px] animate-blob [animation-delay:4s]" />
      </div>

      <div className="relative z-10 w-full max-w-[1100px] p-6 lg:p-12">
        <div className="mx-auto grid items-center gap-16 lg:grid-cols-2">

          {/* Brand Section */}
          <div className="flex flex-col justify-center animate-slide-up">
            <div className="group mb-12 inline-flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-900/20 transition-transform duration-500 group-hover:scale-110">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter text-slate-900">Campus-IQ</span>
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-sky-600">R&D Management</span>
              </div>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900 lg:text-7xl">
              Research.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Elevated.</span>
            </h1>

            <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-slate-500">
              Institutional-grade workflow platform for academic submissions and R&D analytics.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {['Students', 'Faculty', 'HOD', 'Admin'].map((r) => (
                <span key={r} className="rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">{r}</span>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 sm:p-12 animate-slide-up [animation-delay:200ms]">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-slate-900">Sign In</h2>
              <p className="mt-2 text-sm font-semibold text-slate-400">Access your institutional workspace</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {mode === 'signup' && (
                <div className="animate-fade-in space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">University Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                  placeholder="user@university.edu"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                disabled={loading}
                className="group relative mt-4 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] hover:shadow-sky-500/40 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
