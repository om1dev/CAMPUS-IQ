import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, PieChart, Inbox, PenTool, LayoutTemplate, Loader2 } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsOverview from '../../components/AnalyticsOverview';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord, getRecords } from '../../services/recordService';
import { approveSubmission, getSubmissions, rejectSubmission, submitRecord } from '../../services/submissionService';
import { addStudent, getAssignedStudents } from '../../services/userService';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tableName, setTableName] = useState('projects');
  const [records, setRecords] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingTask, setLoadingTask] = useState(null);
  
  const [studentForm, setStudentForm] = useState({
    full_name: '',
    email: '',
    password: 'Student@123',
    year: ''
  });

  const sidebarItems = [
    { id: 'overview', label: 'Analytics Hub', icon: PieChart },
    { id: 'approvals', label: 'Approvals Queue', icon: Inbox },
    { id: 'students', label: 'Student Mapping', icon: Users },
    { id: 'new', label: 'My R&D Logging', icon: PenTool }
  ];

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  async function load() {
    try {
      const [recordRes, submissionRes, studentRes] = await Promise.all([
        getRecords(tableName),
        getSubmissions(),
        getAssignedStudents()
      ]);
      setRecords(recordRes.records || []);
      setSubmissions(submissionRes.submissions || []);
      setStudents(studentRes.users || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Data integration fault');
    }
  }

  useEffect(() => {
    load();
  }, [tableName]);

  const artificialDelay = () => new Promise(resolve => setTimeout(resolve, 10000));

  async function saveDraft(values) {
    const response = await createRecord(tableName, values);
    toast.success('R&D record committed');
    
    const shouldSubmit = window.confirm('Elevate this to HOD Review workflow?');
    if (shouldSubmit) {
      setLoadingTask('Establishing Workflow Protocol...');
      try {
        await submitRecord(tableName, { recordId: response.record.id, remarks: 'Faculty verified submission' });
        await artificialDelay();
        toast.success('Routed successfully');
      } catch (err) {
        toast.error('Workflow routing failed');
      } finally {
        setLoadingTask(null);
      }
    }
    await load();
  }

  async function createStudent(e) {
    e.preventDefault();
    try {
      await addStudent(studentForm);
      toast.success('Student provisioned in system');
      setStudentForm({ full_name: '', email: '', password: 'Student@123', year: '' });
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Provisioning fault');
    }
  }

  return (
    <AppLayout 
      title="Faculty Operations"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="animate-fade-in w-full relative">
        
        {/* 10 Second Mandatory Loader Screen */}
        {loadingTask && (
          <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-md">
            <div className="flex w-[300px] flex-col items-center rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
              <Loader2 size={40} strokeWidth={2.5} className="animate-spin text-sky-500 mb-6" />
              <h3 className="text-base font-black tracking-tight text-slate-900 text-center">{loadingTask}</h3>
              <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Executing verification protocols... Please wait.</p>
            </div>
          </div>
        )}

        {/* Analytics Hub */}
        {activeTab === 'overview' && (
           <AnalyticsOverview records={records} submissions={submissions} />
        )}

        {/* Approvals Queue */}
        {activeTab === 'approvals' && (
          <SubmissionPanel
            title="Team & Personal Approvals"
            submissions={submissions}
            canReview
            onApprove={async (id, remarks) => { await approveSubmission(id, remarks); await load(); }}
            onReject={async (id, remarks) => { await rejectSubmission(id, remarks); await load(); }}
          />
        )}

        {/* Student Management */}
        {activeTab === 'students' && (
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-sky-500 to-indigo-500" />
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                 <div className="bg-sky-100 p-2 rounded-xl text-sky-600">
                   <LayoutTemplate size={20} />
                 </div>
                 Provision New Account
              </h3>
              <form onSubmit={createStudent} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Legal Name</label>
                  <input
                    value={studentForm.full_name}
                    onChange={(e) => setStudentForm((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">University Email</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Academic Year</label>
                    <input
                      type="number"
                      value={studentForm.year}
                      onChange={(e) => setStudentForm((p) => ({ ...p, year: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Reset Password</label>
                    <input
                      value={studentForm.password}
                      onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-5 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
                <button className="w-full mt-6 rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md">
                  Execute Provisioning
                </button>
              </form>
            </div>

            <div className="rounded-[2rem] bg-white p-0 shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col h-[600px]">
               <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Secured Roster</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Direct Reports</p>
                </div>
                <span className="text-[12px] font-bold bg-white text-sky-600 ring-1 ring-sky-200 px-3 py-1.5 rounded-lg shadow-sm">{students.length} Accounts</span>
              </div>
              <div className="overflow-y-auto special-scrollbar flex-1 p-4">
                {students.length ? (
                  <ul className="space-y-3">
                    {students.map((student) => (
                      <li key={student.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center hover:border-sky-300 hover:shadow-md transition-all cursor-default">
                        <div>
                          <p className="text-[14px] font-bold text-slate-900 leading-tight">{student.full_name}</p>
                          <p className="text-[11px] font-bold text-slate-500 mt-1">{student.email}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 px-2 py-1 rounded">Y{student.year || '-'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <Users size={28} className="text-slate-400" />
                    </div>
                    <p className="text-base font-bold text-slate-900">No Roster Mapped</p>
                    <p className="text-[13px] font-medium text-slate-500 mt-2">Provision a student to bind them to your assigned faculty ID.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generate Record */}
        {activeTab === 'new' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm max-w-sm">
              <div className="relative">
                <select
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full appearance-none bg-transparent px-5 py-3 text-[15px] font-bold text-sky-600 focus:outline-none cursor-pointer capitalize"
                >
                  {Object.entries(RD_TABLES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-sky-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <DynamicForm tableName={tableName} tableConfig={currentTable} onSave={saveDraft} />
          </div>
        )}

      </div>
    </AppLayout>
  );
}
