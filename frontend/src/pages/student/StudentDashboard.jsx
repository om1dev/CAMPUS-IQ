import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Inbox, PieChart, Plus, Send, Loader2 } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import DynamicForm from '../../components/DynamicForm';
import SubmissionPanel from '../../components/SubmissionPanel';
import AnalyticsOverview from '../../components/AnalyticsOverview';
import { RD_TABLES } from '../../lib/tableConfig';
import { createRecord, getRecords } from '../../services/recordService';
import { getSubmissions, submitRecord } from '../../services/submissionService';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tableName, setTableName] = useState('publications');
  const [records, setRecords] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loadingTask, setLoadingTask] = useState(null);

  const currentTable = useMemo(() => RD_TABLES[tableName], [tableName]);

  const sidebarItems = [
    { id: 'overview', label: 'Analytics Hub', icon: PieChart },
    { id: 'new', label: 'Draft New Record', icon: Plus },
    { id: 'drafts', label: 'Local Drafts', icon: Inbox },
    { id: 'workflows', label: 'Active Workflows', icon: Send },
  ];

  async function load() {
    try {
      const [recordRes, submissionRes] = await Promise.all([
        getRecords(tableName),
        getSubmissions()
      ]);
      setRecords(recordRes.records || []);
      setSubmissions(submissionRes.submissions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to sync data');
    }
  }

  useEffect(() => {
    load();
  }, [tableName]);

  async function saveDraft(values) {
    const response = await createRecord(tableName, values);
    toast.success('Draft secured successfully');
    
    // Switch to drafts tab automatically
    setActiveTab('drafts');
    await load();
  }

  const artificialDelay = () => new Promise(resolve => setTimeout(resolve, 10000));

  async function routeRecord(record) {
     const shouldSubmit = window.confirm(`Route "${record.title}" into the formal approval workflow?`);
     if (shouldSubmit) {
      setLoadingTask('Initiating Workflow Routing...');
      try {
        await submitRecord(tableName, { recordId: record.id, remarks: 'Student Submission' });
        await artificialDelay();
        toast.success('Routed to Reviewers');
        setActiveTab('workflows');
        await load();
      } catch (err) {
        toast.error('Workflow routing failed.');
      } finally {
        setLoadingTask(null);
      }
    }
  }

  return (
    <AppLayout 
      title="Student Operations" 
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

        {/* Form Entry */}
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

        {/* Local Drafts */}
        {activeTab === 'drafts' && (
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm min-h-[500px]">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h2 className="text-xl font-bold text-slate-900">Unsubmitted Drafts</h2>
                 <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-1">Local Database</p>
              </div>
              <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[12px] font-bold shadow-sm">{records.length} items</span>
            </div>
            
            {records.length ? (
              <ul className="divide-y divide-slate-100/50">
                {records.map((record) => (
                  <li key={record.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                    <div className="flex items-start gap-5">
                      <div className="mt-1 bg-white ring-1 ring-slate-200 shadow-sm p-3 rounded-xl text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 group-hover:ring-sky-200 transition-all">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-slate-900 leading-tight">{record.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-500">
                           <span className="bg-slate-100 px-2.5 py-1 rounded-md shadow-sm">Year {record.year}</span>
                           <span>•</span>
                           <span className="uppercase tracking-widest">{record.status}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => routeRecord(record)}
                      className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-5 py-3 rounded-xl text-[13px] font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm self-start sm:self-center"
                    >
                      Route to Faculty <Send size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-center">
                  <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-5 text-slate-300">
                     <Inbox size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Archive Empty</h3>
                  <p className="text-[13px] text-slate-500 mt-2 max-w-[250px]">Draft a new record to see it stored safely here.</p>
                </div>
            )}
          </div>
        )}

        {/* Submission Panel */}
        {activeTab === 'workflows' && (
          <SubmissionPanel title="Active Workflows" submissions={submissions} />
        )}

      </div>
    </AppLayout>
  );
}
