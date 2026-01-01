
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, DollarSign, Clock, RefreshCcw, ExternalLink, ShieldCheck, XCircle, Info } from 'lucide-react';
import { MOCK_AGENTS } from '../constants';
import { getApprovalStatus } from '../services/geminiService';
import { PORTAL_CONFIG } from '../config';

const Dashboard: React.FC = () => {
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const pollTimerRef = useRef<any>(null);

  // Load history from localStorage
  const loadSubmissions = () => {
    const saved = localStorage.getItem('user_portal_submissions');
    if (saved) {
      setMySubmissions(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadSubmissions();
    
    // Auto-poll every 30 seconds for any pending requests
    pollTimerRef.current = setInterval(() => {
      syncAllPending(true);
    }, 30000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const syncAllPending = async (isSilent: boolean = false) => {
    const saved = localStorage.getItem('user_portal_submissions');
    const submissions = saved ? JSON.parse(saved) : [];
    const pending = submissions.filter((s: any) => s.status === 'PENDING' || s.status === 'SUBMITTED');
    
    if (pending.length > 0) {
      if (!isSilent) setIsSyncingAll(true);
      await Promise.allSettled(pending.map((sub: any) => refreshStatus(sub.id, true)));
      if (!isSilent) setIsSyncingAll(false);
    }
  };

  const refreshStatus = async (id: string, isSilent: boolean = false) => {
    if (!isSilent) setIsRefreshing(id);
    try {
      const result = await getApprovalStatus(id);
      
      if (result) {
        setMySubmissions(prev => {
          const updated = prev.map(sub => 
            sub.id === id ? { 
              ...sub, 
              status: result.status, 
              message: result.message || result.rejectionReason,
              // Use combined admin field and ensure approvedBy/rejectedBy references are valid from updated service
              admin: result.admin || result.approvedBy || result.rejectedBy || sub.admin,
              approvedAt: result.approvedAt,
              rejectedAt: result.rejectedAt
            } : sub
          );
          localStorage.setItem('user_portal_submissions', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error(`Failed to refresh ${id}:`, error);
    } finally {
      if (!isSilent) setIsRefreshing(null);
    }
  };

  const chartData = [
    { name: 'Finance', agents: 4 },
    { name: 'HR', agents: 3 },
    { name: 'Eng', agents: 7 },
    { name: 'Sales', agents: 5 },
    { name: 'Support', agents: 6 },
  ];

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          <p className={`text-xs mt-2 font-medium ${subtext.includes('+') ? 'text-green-600' : 'text-slate-400'}`}>
            {subtext}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Active Agents" 
          value={MOCK_AGENTS.length} 
          subtext="+2 this month" 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Duplicate Builds Prevented" 
          value="14" 
          subtext="Est. $280k Saved" 
          icon={CheckCircle} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Shadow AI Risks Detected" 
          value="3" 
          subtext="Pending Review" 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Total ROI Generated" 
          value="$1.2M" 
          subtext="Annualized" 
          icon={DollarSign} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Agent Deployment by Department</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="agents" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-slate-800">My Governance Pipeline</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Polling enabled: 30s</span>
              </div>
              <button 
                onClick={() => syncAllPending(false)}
                className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                {isSyncingAll ? 'Syncing...' : 'Sync Status'}
              </button>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                 <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                 <p className="text-slate-400 text-sm font-medium">No recent requests tracked.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mySubmissions.map((sub) => (
                  <div key={sub.id} className="flex flex-col p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors gap-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          sub.status === 'APPROVED' ? 'bg-green-100 text-green-600 border border-green-200' :
                          sub.status === 'REJECTED' ? 'bg-red-100 text-red-600 border border-red-200' :
                          'bg-blue-100 text-blue-600 animate-pulse border border-blue-200'
                        }`}>
                          {sub.status === 'APPROVED' ? <ShieldCheck className="w-5 h-5" /> : 
                           sub.status === 'REJECTED' ? <XCircle className="w-5 h-5" /> : 
                           <RefreshCcw className={`w-5 h-5 ${isRefreshing === sub.id ? 'animate-spin' : ''}`} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{sub.agentName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {sub.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right">
                          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                            sub.status === 'APPROVED' ? 'text-green-600' :
                            sub.status === 'REJECTED' ? 'text-red-600' :
                            'text-blue-500'
                          }`}>{sub.status || 'PENDING'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(sub.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => refreshStatus(sub.id)}
                            disabled={isRefreshing === sub.id}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                            title="Check Status"
                          >
                            <RefreshCcw className={`w-4 h-4 ${isRefreshing === sub.id ? 'animate-spin' : ''}`} />
                          </button>
                          <a 
                            href={`${PORTAL_CONFIG.governanceApiUrl}/api/approvals/${sub.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {sub.message && (
                      <div className={`mt-1 p-3 rounded-lg flex gap-3 text-xs animate-fadeIn ${
                        sub.status === 'REJECTED' ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-blue-50 text-blue-800 border border-blue-100'
                      }`}>
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                           <p className="font-bold mb-1 uppercase text-[9px] opacity-70">Governance Update:</p>
                           <p className="leading-relaxed">{sub.message}</p>
                           {sub.admin && <p className="mt-1 font-bold text-[9px] tracking-tight">— Reviewed by {sub.admin}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Governance Feed</h3>
          <div className="space-y-4">
            {[
              { text: "Finance Bot v2 approved by Security", time: "2h ago", type: "success" },
              { text: "New request: 'Marketing Copy Gen'", time: "4h ago", type: "info" },
              { text: "High drift detected on HR Assistant", time: "Yesterday", type: "warning" },
              { text: "Duplicate intake prevented: 'Invoice AI'", time: "Yesterday", type: "neutral" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  item.type === 'success' ? 'bg-green-500' :
                  item.type === 'warning' ? 'bg-red-500' :
                  item.type === 'info' ? 'bg-blue-500' : 'bg-slate-400'
                }`} />
                <div>
                  <p className="text-sm text-slate-700 font-medium">{item.text}</p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-100 bg-blue-50 py-2 rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
