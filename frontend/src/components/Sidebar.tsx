import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  ShieldCheck,
  LogOut,
  Sparkles,
  Wrench,
  MessageSquareWarning,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'overview' | 'students' | 'add-student' | 'complaints';
  onSelectTab: (tab: 'overview' | 'students' | 'add-student' | 'complaints') => void;
  storageMode: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  storageMode,
}) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Top Branding */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              Hostel<span className="text-blue-400">Admin</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Smart Residence System</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Management
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'overview'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('students')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'students'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </button>

            <button
              onClick={() => onSelectTab('add-student')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'add-student'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => onSelectTab('complaints')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'complaints'
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <MessageSquareWarning className="w-4 h-4" />
              <span>Complaints</span>
            </button>
          </nav>

          {/* Modular Roadmap indicators */}
          <div className="mt-8 pt-4 border-t border-slate-800/60">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Next Modules</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Stage 3</span>
            </p>
            <div className="space-y-1 opacity-60">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 cursor-not-allowed">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Classification</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Upcoming</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 cursor-not-allowed">
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>Maintenance SLA</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database status and User footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {/* Backend & DB indicator */}
        <div className="px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 text-[11px]">Database:</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            storageMode === 'supabase'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {storageMode === 'supabase' ? 'Supabase DB' : 'Local SQLite'}
          </span>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Hostel Warden</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Admin Office
              </p>
            </div>
          </div>
          <button
            title="Logout"
            onClick={() => alert('Logged out from Admin session.')}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
