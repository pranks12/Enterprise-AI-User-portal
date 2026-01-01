
import React, { useState } from 'react';
import { MessageSquarePlus, ThumbsUp, Activity, ArrowRight, Lightbulb, Loader2, Info, XCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { MOCK_AGENTS, MOCK_ENHANCEMENTS } from '../constants';
import { analyzeEnhancement, submitEnhancementToGovernancePortal } from '../services/geminiService';
import { EnhancementRequest } from '../types';
import { PORTAL_CONFIG } from '../config';

const AgentEnhancement: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState(MOCK_AGENTS[0].id);
  const [feedback, setFeedback] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [requests, setRequests] = useState<EnhancementRequest[]>(MOCK_ENHANCEMENTS);

  // Editable user context for testing
  const [userContext, setUserContext] = useState({
    email: 'your-email@company.com',
    dept: 'Engineering'
  });

  const selectedAgent = MOCK_AGENTS.find(a => a.id === selectedAgentId);
  const agentRequests = requests.filter(r => r.agentId === selectedAgentId);

  const handleAnalyzeFeedback = async () => {
    if (!selectedAgent || !feedback) return;
    setIsProcessing(true);
    setSubmitStatus('idle');
    const result = await analyzeEnhancement(selectedAgent.name, feedback);
    setAnalysis(result);
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    if (!feedback || !selectedAgent || !analysis) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await submitEnhancementToGovernancePortal(
        selectedAgent.name, 
        userContext.email, 
        userContext.dept, 
        feedback, 
        analysis
      );
      
      setSubmittedData(response);

      const newRequest: EnhancementRequest = {
        id: `enh_${Date.now()}`,
        agentId: selectedAgent.id,
        requester: userContext.email,
        description: feedback,
        businessValue: analysis.businessValue,
        upvotes: 1,
        status: 'Submitted'
      };
      
      setRequests([...requests, newRequest]);
      setFeedback('');
      setAnalysis(null);
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      
      <div className="lg:col-span-4 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Target Agent</h2>
        <div className="space-y-2">
          {MOCK_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => { setSelectedAgentId(agent.id); setAnalysis(null); setSubmitStatus('idle'); }}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                selectedAgentId === agent.id 
                  ? 'bg-blue-600 border-blue-700 shadow-lg text-white ring-2 ring-blue-300 ring-offset-2' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <h3 className="font-bold">{agent.name}</h3>
              <p className={`text-[10px] uppercase font-bold mt-1 ${selectedAgentId === agent.id ? 'text-blue-100' : 'text-slate-400'}`}>
                {agent.department}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Request Enhancement</h2>
              <p className="text-sm text-slate-500 italic">This triggers an <code>enhance</code> action to the Governance API.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase">Your Email</label>
               <input 
                 type="email" 
                 value={userContext.email} 
                 onChange={e => setUserContext({...userContext, email: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
               />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
               <input 
                 type="text" 
                 value={userContext.dept} 
                 onChange={e => setUserContext({...userContext, dept: e.target.value})}
                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
               />
             </div>
          </div>

          <div className="space-y-4">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={`Suggest a feature or improvement for ${selectedAgent?.name}...`}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
            />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-slate-400">
                 <Info className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase font-mono">API: {PORTAL_CONFIG.governanceApiUrl}</span>
              </div>
              <button
                onClick={handleAnalyzeFeedback}
                disabled={!feedback || isProcessing}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : 'Refine Enhancement'}
              </button>
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-2xl animate-fadeIn">
              <div className="flex items-center gap-3 text-green-700 font-bold mb-4">
                <CheckCircle className="w-5 h-5" />
                Enhancement Posted Successfully!
              </div>
              <p className="text-sm text-green-800 mb-6">The request was mapped to <code>action: enhance</code> and sent to the delmgovernance gateway.</p>
              {(submittedData?.approvalId || submittedData?.id) && (
                <a 
                  href={`${PORTAL_CONFIG.governanceApiUrl}/api/approvals/${submittedData?.approvalId || submittedData?.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-green-600 bg-white border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                >
                  View Approval Status <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-100 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-3 animate-fadeIn">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold">API Connection Failed</p>
                <p className="opacity-80 text-xs">Verify the governance portal is accessible from your location.</p>
              </div>
            </div>
          )}

          {analysis && !analysis.safetyTriggered && submitStatus !== 'success' && (
            <div className="mt-8 bg-indigo-900 text-white p-6 rounded-2xl animate-fadeIn shadow-2xl border border-indigo-700">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Activity className="w-5 h-5 text-indigo-100" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-indigo-300 uppercase tracking-widest mb-3">AI Enhancement Analysis</h4>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-indigo-300 font-bold block mb-1 text-[10px] uppercase">Governance Value:</span>
                      <p className="text-white leading-relaxed">{analysis.businessValue}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="mt-8 w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><ArrowRight className="w-4 h-4" /> Final Submit to Governance API</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center justify-between">
            <span>Historical Requests for {selectedAgent?.name}</span>
            <span className="text-xs text-slate-400 font-normal">{agentRequests.length} Community Ideas</span>
          </h3>
          <div className="space-y-3">
            {agentRequests.map(req => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-5 hover:border-blue-200 transition-colors">
                <div className="flex flex-col items-center gap-1">
                   <button className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100">
                     <ThumbsUp className="w-4 h-4" />
                   </button>
                   <span className="text-xs font-bold text-slate-700">{req.upvotes}</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-bold mb-1">{req.description}</p>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{req.businessValue}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested By {req.requester}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEnhancement;
