
import React, { useState } from 'react';
import { Search, Shield, Users, ArrowUpRight, Sparkles, Loader2, Info, Lock } from 'lucide-react';
import { MOCK_AGENTS } from '../constants';
import { searchAgentCatalog } from '../services/geminiService';
import { Agent, RiskLevel, AgentStatus } from '../types';

const AgentCatalog: React.FC = () => {
  const [query, setQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [isSearching, setIsSearching] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
        setAgents(MOCK_AGENTS);
        setAiReasoning(null);
        return;
    }

    setIsSearching(true);
    const result = await searchAgentCatalog(query);
    setIsSearching(false);

    if (result && result.matchedAgentIds) {
      const filtered = MOCK_AGENTS.filter(a => result.matchedAgentIds.includes(a.id));
      setAgents(filtered);
      setAiReasoning(result.reasoning);
    }
  };

  const StatusBadge = ({ status }: { status: AgentStatus }) => {
    const colors = {
      [AgentStatus.ACTIVE]: 'bg-green-100 text-green-700 border-green-200',
      [AgentStatus.PENDING_GOVERNANCE]: 'bg-blue-100 text-blue-700 border-blue-200',
      [AgentStatus.PENDING_SECURITY]: 'bg-amber-100 text-amber-700 border-amber-200',
      [AgentStatus.APPROVED]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      [AgentStatus.APPROVED_WITH_CONDITIONS]: 'bg-purple-100 text-purple-700 border-purple-200',
      [AgentStatus.REJECTED]: 'bg-red-100 text-red-700 border-red-200',
      [AgentStatus.SUBMITTED]: 'bg-slate-100 text-slate-700 border-slate-200',
      [AgentStatus.EXPIRING_SOON]: 'bg-orange-100 text-orange-700 border-orange-200',
      [AgentStatus.EXPIRED]: 'bg-slate-500 text-white border-slate-600',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[status]}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Enterprise Agent Catalog</h1>
        <p className="text-slate-500">
          Source: <span className="font-bold text-slate-700">Governance Portal API</span>. Reuse existing agents to save budget and ensure compliance.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for capabilities (e.g., 'invoice matching', 'payroll')..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 shadow-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all"
          />
          <div className="absolute left-4 top-4 text-slate-400">
            {isSearching ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
          </div>
          <button type="submit" className="absolute right-3 top-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium">
            Search
          </button>
        </form>

        {aiReasoning && (
          <div className="mt-4 bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start gap-3 animate-fadeIn">
             <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
             <div>
               <p className="text-xs font-bold text-indigo-800 uppercase mb-1">Discovery Assistant</p>
               <p className="text-sm text-indigo-900">{aiReasoning}</p>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <StatusBadge status={agent.status} />
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <Shield className="w-3 h-3" />
                  {agent.riskLevel} Risk
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{agent.name}</h3>
              <p className="text-xs font-bold text-slate-400 mb-3">{agent.useCase}</p>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {agent.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3 h-3" />
                  <span>Systems: {agent.systems.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center">
               <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
                 <Users className="w-3 h-3" />
                 <span>{agent.usageCount} Uses</span>
               </div>
               <button className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                 View Detail <ArrowUpRight className="w-3 h-3" />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-bold">Reuse Note:</p>
          <p>Always check if an existing agent fits your needs before requesting a new one. Enhancements to existing agents are processed faster than new builds.</p>
        </div>
      </div>
    </div>
  );
};

export default AgentCatalog;
