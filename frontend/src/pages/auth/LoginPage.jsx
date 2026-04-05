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
      toast.success(mode === 'login' ? 'Logged in' : 'Signup successful');
      navigate(roleToPath(response.profile?.role || 'student'), { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
          <span className="rounded-full bg-blue-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Role Based R&D Workflow
          </span>
          <h1 className="mt-5 text-4xl font-black text-slate-900">
            Research and development approvals made simple
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Students create submissions, faculty reviews assigned students, HOD handles department approvals,
            and admin gets the final decision layer with analytics and exports.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              'Dynamic forms for 16 R&D tables',
              'Submission logs and timeline tracking',
              'Faculty to HOD to Admin routing',
              'Department based visibility',
              'Supabase storage for attachments',
              'Excel and PDF export'
            ].map((text) => (
              <div key={text} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold ${mode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Login
            </button>
            {/* <button
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold ${mode === 'signup' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
              onClick={() => setMode('signup')}
              type="button"
            >
              Student Signup
            </button> */}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' ? (
              <>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Role</label>
                    <input
                      value="student"
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Year</label>
                    <input
                      value={form.year}
                      onChange={(e) => update('year', e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create student account'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Faculty, HOD, Admin, and Superadmin accounts should be created from backend or by higher roles after first bootstrap.
          </div>
        </div>
      </div>
    </div>
  );
}
