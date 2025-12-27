
import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, Check, ArrowRight, Loader2, CheckCircle, Info, Clock, UserCheck, ShieldAlert } from 'lucide-react';
import { analyzeIntakeRequest, submitToGovernancePortal } from '../services/geminiService';
import { AgentStatus } from '../types';

const AgentIntake: React.FC = () => {
  const [formData, setFormData] = useState({
    requestorName: 'Sarah Johnson',
    requestorEmail: 'sarah@company.com',
    requestorDept: 'Finance',
    requestorManager: 'Alice Smith',
    agentName: '',
    useCase: '',
    description: '',
    permissions: '',
    dataAccess: '',
    duration: '6 months',
    externalAPIs: false,
    systems: ''
  });
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [submittedRequest, setSubmittedRequest] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!formData.agentName || !formData.description) return;
    setIsAnalyzing(true);
    const result = await analyzeIntakeRequest(formData.agentName, formData.description, formData.useCase);
    setAnalysis(result);
    setIsAnalyzing(false);
    if (result && !result.safetyTriggered && !result.isDuplicate) setStep(2);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const result: any = await submitToGovernancePortal(formData);
    setSubmittedRequest(result);
    setIsSubmitting(false);
    setStep(3);
  };

  const Field = ({ label, helper, children }: any) => (
    <div className="space-y-1">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      <p className="text-xs text-slate-400 italic mb-2">{helper}</p>
      {children}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Request New AI Agent</h1>
        <p className="text-slate-500">User Portal orchestration. Requests are submitted to the Governance Portal for review.</p>
      </div>

      <div className="flex items-center mb-8 border-b border-slate-200 pb-4 overflow-x-auto">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step === s ? 'bg-blue-600 text-white shadow-lg' : step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`ml-2 mr-6 text-sm font-bold ${step === s ? 'text-blue-900' : 'text-slate-500'}`}>
              {s === 1 ? 'Definition' : s === 2 ? 'Validation' : 'Confirmation'}
            </span>
          </div>
        ))}
      </div>

      {step === 3 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <UserCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Successfully Orchestrated</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Your request has been sent to the <span className="font-bold text-slate-700">Governance Portal</span>.</p>
          <div className="max-w-sm mx-auto bg-slate-50 rounded-xl p-6 border border-slate-200 text-left mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Request ID</span>
              <span className="text-sm font-mono font-bold text-slate-900">{submittedRequest?.requestId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold uppercase">{submittedRequest?.status}</span>
            </div>
          </div>
          <button onClick={() => {setStep(1); setAnalysis(null);}} className="text-blue-600 font-bold hover:underline">Submit Another Request</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Field label="Requestor Name" helper="Governance identity check.">
                  <input type="text" value={formData.requestorName} readOnly className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 outline-none" />
                </Field>
                <Field label="Department" helper="Cost center alignment.">
                  <input type="text" value={formData.requestorDept} readOnly className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 outline-none" />
                </Field>
              </div>

              <div className="space-y-6">
                <Field label="Agent Name" helper="Short, descriptive name.">
                  <input type="text" value={formData.agentName} onChange={e => setFormData({...formData, agentName: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Talent Scout AI" />
                </Field>
                <Field label="Use Case" helper="What specific problem is this solving?">
                  <input type="text" value={formData.useCase} onChange={e => setFormData({...formData, useCase: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Processing resumes..." />
                </Field>
                <Field label="Detailed Purpose" helper="ROI justification.">
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Why do we need this?" />
                </Field>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={handleAnalyze} disabled={isAnalyzing || !formData.agentName} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                  {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  Validate Intake Request
                </button>
              </div>
            </div>

            {analysis && (
              <div className={`p-6 rounded-xl border animate-fadeIn ${analysis.safetyTriggered ? 'bg-red-50 border-red-200' : analysis.isDuplicate ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
                <div className="flex items-start gap-4">
                  {analysis.safetyTriggered ? <ShieldAlert className="text-red-600 w-6 h-6 mt-1" /> : analysis.isDuplicate ? <AlertTriangle className="text-amber-600 w-6 h-6 mt-1" /> : <CheckCircle className="text-indigo-600 w-6 h-6 mt-1" />}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold">{analysis.safetyTriggered ? 'Security Guardrail' : analysis.isDuplicate ? 'Duplicate Found' : 'Validation Passed'}</h4>
                    <p className="text-sm mt-1 text-slate-700">{analysis.analysis || analysis.duplicateReason}</p>
                    {!analysis.isDuplicate && !analysis.safetyTriggered && (
                       <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-100">
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Refined Governance Justification</p>
                          <p className="text-sm italic text-slate-700">"{analysis.refinedDescription}"</p>
                          <div className="mt-6 flex justify-end">
                             <button onClick={handleFinalSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                               {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Check className="w-4 h-4" /> Submit to Governance API</>}
                             </button>
                          </div>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6 sticky top-24 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg"><Bot className="w-6 h-6" /></div>
                <div><h3 className="font-bold">Intake Orchestrator</h3><p className="text-xs text-blue-200">User Portal Agent</p></div>
              </div>
              <div className="text-sm text-slate-400 space-y-4">
                <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-1"><Info className="w-4 h-4" /> Architecture</div>
                  <p className="text-[10px]">Requests are orchestrated from this Portal to the Governance Node via REST APIs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentIntake;
