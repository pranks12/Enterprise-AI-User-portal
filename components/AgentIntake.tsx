
import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, AlertTriangle, Check, ArrowRight, Loader2, 
  ShieldAlert, XCircle, ExternalLink, ChevronRight, Server, Activity, Clock, Terminal, ShieldCheck, RefreshCcw, Copy, Info, AlertCircle
} from 'lucide-react';
import { analyzeIntakeRequest, submitToGovernancePortal, getApprovalStatus } from '../services/geminiService';
import { PORTAL_CONFIG } from '../config';

// Stable Input Component
const StableInput = memo(({ label, subLabel, value, onChange, placeholder, isTextArea = false }: any) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex flex-col">
        <label className="text-sm font-bold text-slate-700">
          {label}
        </label>
        {subLabel && (
          <span className="text-[11px] text-slate-400 italic mb-1">
            {subLabel}
          </span>
        )}
      </div>
      
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-300 text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-300 text-sm"
        />
      )}
    </div>
  );
});

StableInput.displayName = 'StableInput';

const AgentIntake: React.FC = () => {
  const [formData, setFormData] = useState({
    requestorEmail: 'priyanks@serv',
    requestorDept: 'Engineering',
    agentName: '',
    purpose: '',
    description: '',
  });
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [pipelineStage, setPipelineStage] = useState<'encoding' | 'handshake' | 'registration'>('encoding');
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [liveResult, setLiveResult] = useState<any>(null);
  
  const pollingIntervalRef = useRef<any>(null);
  const pollCountRef = useRef(0);

  const handleUpdate = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update history in localStorage
  const updateSubmissionHistory = (id: string, name: string, status: string, details?: any) => {
    const existing = JSON.parse(localStorage.getItem('user_portal_submissions') || '[]');
    const index = existing.findIndex((e: any) => e.id === id);
    
    const entry = { 
      id, 
      agentName: name, 
      timestamp: index >= 0 ? existing[index].timestamp : new Date().toISOString(), 
      status: status,
      message: details?.rejectionReason || details?.message,
      admin: details?.admin
    };

    if (index >= 0) {
      existing[index] = entry;
    } else {
      existing.unshift(entry);
    }
    
    localStorage.setItem('user_portal_submissions', JSON.stringify(existing.slice(0, 20)));
  };

  const handleCheckStatus = async (isAuto: boolean = false) => {
    const id = submittedRequest?.approvalId || submittedRequest?.id;
    if (!id) return;
    
    if (!isAuto) setIsCheckingStatus(true);
    
    try {
      const result = await getApprovalStatus(id);
      if (result) {
        setLiveResult(result);
        updateSubmissionHistory(id, formData.agentName, result.status, result);
        
        // If we reached a terminal state (approved or rejected), stop the auto-poll
        if (result.status === 'APPROVED' || result.status === 'REJECTED') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        }
      }
    } catch (error: any) {
      console.error("Async status check failed", error);
    } finally {
      if (!isAuto) setIsCheckingStatus(false);
    }
  };

  // Start smart polling when the request is registered
  useEffect(() => {
    if (step === 3 && submittedRequest) {
      // Poll every 10 seconds to catch early decisions
      pollingIntervalRef.current = setInterval(() => {
        pollCountRef.current += 1;
        // Decaying/Stop policy: Stop auto-polling after 2 minutes
        if (pollCountRef.current > 12) {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          return;
        }
        handleCheckStatus(true);
      }, 10000);
    }

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [step, submittedRequest]);

  const handleFinalSubmit = async (simulate: boolean = false) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setStep(4);
    
    setPipelineStage('encoding');
    await new Promise(r => setTimeout(r, 700));
    setPipelineStage('handshake');
    
    try {
      const result = await submitToGovernancePortal(formData, analysis);
      setPipelineStage('registration');
      await new Promise(r => setTimeout(r, 800));
      setSubmittedRequest(result);
      updateSubmissionHistory(result.approvalId || result.id, formData.agentName, 'PENDING');
      setStep(3);
    } catch (error: any) {
      setSubmitError(error.message);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className="bg-[#0f172a] p-10 flex items-center justify-between">
             <div>
                <h2 className="text-2xl font-bold text-white mb-1">Deployment Pipeline</h2>
                <p className="text-blue-400 text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" /> Initiating Asynchronous Review
                </p>
             </div>
          </div>
          <div className="p-10">
            <div className="space-y-8">
              {[
                { id: 'encoding', label: 'Payload Preparation', desc: 'Encoding metadata for gateway validation.', icon: Terminal },
                { id: 'handshake', label: 'Gateway Handshake', desc: `Handing over to Governance API`, icon: Server },
                { id: 'registration', label: 'Request Registered', desc: 'Request is now in the governance queue.', icon: Clock }
              ].map((stage, idx) => {
                const isCurrent = pipelineStage === stage.id;
                const isPast = (idx === 0 && pipelineStage !== 'encoding') || (idx === 1 && pipelineStage === 'registration');
                const isFailed = submitError && stage.id === 'handshake';
                return (
                  <div key={stage.id} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                      isFailed ? 'bg-red-50 border-red-500 text-red-600' : isPast ? 'bg-green-50 border-green-500 text-green-600' :
                      isCurrent ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-200 text-slate-300'
                    }`}>
                      {isFailed ? <XCircle className="w-6 h-6" /> : isPast ? <Check className="w-6 h-6" /> : <stage.icon className={`w-6 h-6 ${isCurrent ? 'animate-pulse' : ''}`} />}
                    </div>
                    <div>
                      <h4 className={`font-bold ${isFailed ? 'text-red-600' : isCurrent ? 'text-blue-600' : 'text-slate-800'}`}>{stage.label}</h4>
                      <p className="text-xs text-slate-500">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
              {submitError && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl space-y-4">
                  <p className="text-sm text-red-600 font-medium">Gateway Error: {submitError}</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleFinalSubmit(false)} className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold">Retry Submission</button>
                    <button onClick={() => setStep(1)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold">Go Back</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const status = liveResult?.status || 'PENDING';
    const isApproved = status === 'APPROVED';
    const isRejected = status === 'REJECTED';

    return (
      <div className="max-w-2xl mx-auto py-12 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <div className={`transition-colors duration-700 p-12 text-center ${
            isRejected ? 'bg-red-900' : isApproved ? 'bg-green-800' : 'bg-[#0f172a]'
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transition-all ${
              isRejected ? 'bg-red-500' : isApproved ? 'bg-green-500' : 'bg-blue-500 pulse'
            }`}>
              {isApproved ? <ShieldCheck className="w-8 h-8 text-white" /> : 
               isRejected ? <AlertTriangle className="w-8 h-8 text-white" /> : 
               <Clock className="w-8 h-8 text-white animate-pulse" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isRejected ? 'Governance Rejected' : isApproved ? 'Governance Approved' : 'Awaiting Review'}
            </h2>
            <p className="text-blue-100 text-sm opacity-80">
              {isRejected ? 'The request did not meet corporate standards.' : 
               isApproved ? 'Successfully registered and approved.' : 
               'Request is being processed by the Governance Portal.'}
            </p>
          </div>
          
          <div className="p-10 space-y-6">
            <div className={`p-6 rounded-2xl border transition-all ${
              isRejected ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Request Tracking ID</span>
                  <span className="font-mono font-bold text-xl text-slate-900">
                    {submittedRequest?.approvalId || submittedRequest?.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    isApproved ? 'bg-green-600 text-white' : 
                    isRejected ? 'bg-red-600 text-white' : 
                    'bg-blue-600 text-white animate-pulse'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>

              {/* REJECTION REASON DISPLAY */}
              {isRejected && (liveResult?.rejectionReason || liveResult?.message) && (
                <div className="mt-6 p-4 bg-white border border-red-200 rounded-xl animate-fadeIn">
                   <div className="flex gap-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-black text-red-900 uppercase text-[9px] mb-1 tracking-wider">Reason for Rejection:</p>
                        <p className="text-slate-700 leading-relaxed font-medium italic">
                          "{liveResult.rejectionReason || liveResult.message}"
                        </p>
                        {liveResult.admin && (
                          <p className="mt-3 text-[10px] font-bold text-slate-400">Decision by: {liveResult.admin}</p>
                        )}
                      </div>
                   </div>
                </div>
              )}

              {/* PENDING INFO */}
              {!isApproved && !isRejected && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    This request is handled <strong>asynchronously</strong>. Automated checks are running now, but human review may take longer. You can safely close this page—the Dashboard will continue tracking this ID.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={() => handleCheckStatus(false)} 
                 disabled={isCheckingStatus || isApproved || isRejected}
                 className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {isCheckingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                 Check Now
               </button>
               <button 
                 onClick={() => window.location.reload()} 
                 className="py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
               >
                 Go to Dashboard
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Request New AI Agent</h1>
        <p className="text-sm text-slate-500">Intake orchestration for corporate AI governance.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StableInput label="Requestor Email" value={formData.requestorEmail} onChange={(v:any) => handleUpdate('requestorEmail', v)} />
            <StableInput label="Department" value={formData.requestorDept} onChange={(v:any) => handleUpdate('requestorDept', v)} />
          </div>
          
          <StableInput label="Agent Name" value={formData.agentName} onChange={(v:any) => handleUpdate('agentName', v)} placeholder="e.g., FinanceAuditAgent" />
          
          <StableInput label="Agent Purpose" value={formData.purpose} onChange={(v:any) => handleUpdate('purpose', v)} placeholder="Primary business goal..." />
          
          <StableInput label="Business Justification" isTextArea value={formData.description} onChange={(v:any) => handleUpdate('description', v)} placeholder="Provide context for governance review..." />
          
          <div className="flex justify-end pt-4">
            <button 
              onClick={async () => {
                if (!formData.agentName || !formData.purpose) return alert("Agent Name and Purpose are required.");
                setIsAnalyzing(true);
                const res = await analyzeIntakeRequest(formData.agentName, formData.description, formData.purpose);
                setAnalysis(res);
                setIsAnalyzing(false);
                setStep(2);
              }}
              className="bg-blue-600 text-white px-12 py-4 rounded-xl font-bold shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <>Pre-Validate Intake <ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>

          {analysis && step === 2 && (
            <div className="p-8 bg-blue-50 border-2 border-blue-200 rounded-2xl animate-fadeIn space-y-4 mt-8">
              <div className="flex items-center gap-3 font-bold text-blue-900">
                <Sparkles className="w-5 h-5" /> AI Pre-Analysis
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">{analysis.analysis}</p>
              <button 
                onClick={() => handleFinalSubmit(false)} 
                className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold hover:bg-black transition-colors"
              >
                Submit for Governance Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentIntake;
