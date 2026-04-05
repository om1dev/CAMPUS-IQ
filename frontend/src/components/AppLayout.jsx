import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navMap = {
  student: 'Student Dashboard',
  faculty: 'Faculty Dashboard',
  hod: 'HOD Dashboard',
  admin: 'Admin Dashboard',
  superadmin: 'Superadmin Dashboard'
};

export default function AppLayout({ title, children }) {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">R&D Management System</p>
            <h1 className="text-xl font-bold text-slate-900">{title || navMap[profile?.role]}</h1>
            <p className="text-sm text-slate-500">
              {profile?.full_name} • {profile?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
