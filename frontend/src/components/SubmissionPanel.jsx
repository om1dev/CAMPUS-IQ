import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ChevronRight, FileDigit, Eye, Download, Info, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import Timeline from './Timeline';
import TableToolbar from './TableToolbar';

export default function SubmissionPanel({
  title,
  submissions,
  onApprove,
  onReject,
  canReview = false
}) {
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', year: '' });
  const [rightTab, setRightTab] = useState('details'); 
  const [loadingTask, setLoadingTask] = useState(null);

  const filtered = useMemo(() => {
    return submissions.filter((item) => {
      const titleMatch = filters.search
        ? String(item.record?.title || '').toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const yearMatch = filters.year
        ? String(item.record?.year || '') === String(filters.year)
        : true;
      return titleMatch && yearMatch;
    });
  }, [submissions, filters]);

  const exportRows = filtered.map((item) => ({
    title: item.record?.title || '',
    year: item.record?.year || '',
    table: item.table_name,
    status: item.status,
    submitter: item.submitter?.full_name || item.submitter?.email || ''
  }));

  const artificialDelay = () => new Promise(resolve => setTimeout(resolve, 10000));

  async function approve(item) {
    const remarks = window.prompt('Approval remarks', 'Approved');
    if (remarks === null) return;
    setLoadingTask('Processing Institutional Approval...');
    
    try {
      await onApprove(item.id, remarks);
      await artificialDelay();
      toast.success('Approved successfully');
    } catch (err) {
      toast.error('Approval failed');
    } finally {
      setLoadingTask(null);
    }
  }

  async function reject(item) {
    const remarks = window.prompt('Rejection remarks', 'Rejected');
    if (remarks === null) return;
    setLoadingTask('Processing Document Rejection...');
    
    try {
      await onReject(item.id, remarks);
      await artificialDelay();
      toast.success('Rejected successfully');
    } catch (err) {
      toast.error('Rejection failed');
    } finally {
      setLoadingTask(null);
    }
  }

  function getDocumentUrl(record) {
    if (record?.attachment_url) return record.attachment_url;
    if (record?.attachment_path) {
       const baseUrl = import.meta.env.VITE_SUPABASE_URL;
       if (baseUrl) return `${baseUrl}/storage/v1/object/public/rd-files/${record.attachment_path}`;
    }
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      
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

      <TableToolbar title={title} rows={exportRows} filters={filters} setFilters={setFilters} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Active Institutional Workflows</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700 ring-1 ring-sky-500/20">
              {filtered.length} Active Records
            </span>
          </div>

          <div className="space-y-3">
            {filtered.length ? filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all hover:shadow-sm cursor-pointer ${
                  selected?.id === item.id 
                    ? 'border-sky-500 bg-sky-50/30 shadow-sm ring-1 ring-inset ring-sky-500/50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className={`text-[15px] font-bold ${selected?.id === item.id ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'} leading-tight`}>{item.record?.title || '-'}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <FileDigit size={12} className="text-slate-400"/>
                      <span className="uppercase tracking-widest">{item.table_name.replace('_', ' ')}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">{item.submitter?.full_name || item.submitter?.email || '-'}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-500 shadow-sm">
                      Year <span className="text-slate-900">{item.record?.year || '-'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-600 shadow-sm">
                      Phase <span className="text-slate-900">{item.current_reviewer_role || 'completed'}</span>
                    </span>
                  </div>

                  {canReview && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); approve(item); }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-500/30 transition-all hover:bg-emerald-500 hover:text-white"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); reject(item); }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-700 ring-1 ring-inset ring-rose-500/30 transition-all hover:bg-rose-500 hover:text-white"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                <div className="mb-3 rounded-lg bg-white shadow-sm ring-1 ring-slate-200 p-3">
                  <FileDigit size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-900">No submissions located.</p>
                <p className="text-xs font-semibold text-slate-500 mt-1 max-w-[250px]">Adjust search parameters or establish a new institutional record.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {selected ? (
            <>
              <div className="flex rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200">
                 <button 
                  onClick={() => setRightTab('details')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${rightTab === 'details' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                 >
                   Information Preview
                 </button>
                 <button 
                  onClick={() => setRightTab('timeline')}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${rightTab === 'timeline' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                 >
                   Approval Timeline
                 </button>
              </div>

              {rightTab === 'details' && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex flex-col h-full animate-fade-in">
                   <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                      <Info size={18} className="text-sky-500" />
                      <h4 className="text-lg font-bold text-slate-900">Record Data</h4>
                   </div>

                   <div className="flex-1 overflow-y-auto special-scrollbar space-y-6 pr-2">
                      {selected.record?.data && Object.keys(selected.record.data).length > 0 ? (
                        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                          {Object.entries(selected.record.data).map(([key, value]) => (
                            <div key={key} className="col-span-2 sm:col-span-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{key.replace(/_/g, ' ')}</p>
                              <p className="text-sm font-semibold text-slate-900 break-words">{value || '-'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-slate-500 italic">No dynamic form data attached.</p>
                      )}

                      <div className="pt-6 border-t border-slate-100">
                         <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                           <Eye size={14} /> Document Preview
                         </h4>
                         
                         {getDocumentUrl(selected.record) ? (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col items-center group">
                               <div className="w-full h-[300px] flex items-center justify-center bg-slate-100 relative">
                                  {selected.record?.attachment_path?.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                     <img src={getDocumentUrl(selected.record)} alt="Attachment" className="object-contain w-full h-full" />
                                  ) : (
                                     <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(getDocumentUrl(selected.record))}&embedded=true`} title="Document Preview" className="w-full h-full bg-white text-xs border-0" />
                                  )}
                               </div>
                               <a 
                                 href={getDocumentUrl(selected.record)} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="w-full flex items-center justify-center gap-2 py-3 bg-white text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors border-t border-slate-200"
                               >
                                 <Download size={14} /> Open Full Document
                               </a>
                            </div>
                         ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                               <FileDigit size={20} className="mx-auto text-slate-300 mb-2" />
                               <p className="text-xs font-bold text-slate-500">No Document Attached</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {rightTab === 'timeline' && (
                <div className="animate-fade-in w-full h-full">
                  <Timeline logs={selected?.logs || []} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-20 text-center h-full">
               <Info size={24} className="text-slate-300 mb-3" />
               <p className="text-sm font-bold text-slate-900">No Selection Made</p>
               <p className="text-xs font-semibold text-slate-500 mt-1 max-w-[200px]">Click on a record from the list to view its information preview and approval timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
