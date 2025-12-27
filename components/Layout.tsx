import React from 'react';
import { LayoutDashboard, PlusCircle, Search, MessageSquarePlus, ShieldCheck, User, Terminal } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discovery', label: 'Browse Agents', icon: Search },
    { id: 'intake', label: 'Request New Agent', icon: PlusCircle },
    { id: 'enhancement', label: 'Enhancements', icon: MessageSquarePlus },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">Enterprise AI</h1>
              <p className="text-xs text-slate-400 font-medium">User Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 m-4 bg-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="text-sm font-semibold text-white">John Doe</p>
                <p className="text-xs text-slate-400">Product Manager</p>
              </div>
            </div>
            
            {/* Developer Mode Toggle - Hidden from main nav */}
            <button
              onClick={() => setActiveTab('playground')}
              className={`p-2 rounded-lg transition-all ${
                activeTab === 'playground' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' 
                  : 'text-slate-500 hover:bg-slate-700 hover:text-indigo-400'
              }`}
              title="Open Agent Playground (Developer Mode)"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'playground' ? 'Developer Playground' : navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <div className="flex gap-4">
              {activeTab === 'playground' ? (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200 flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> Dev Mode Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                  System Status: Operational
                </span>
              )}
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;