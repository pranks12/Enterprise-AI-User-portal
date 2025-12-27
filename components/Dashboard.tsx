import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { MOCK_AGENTS } from '../constants';

const Dashboard: React.FC = () => {
  const data = [
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
      {/* Stats Row */}
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
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Agent Deployment by Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="agents" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
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
