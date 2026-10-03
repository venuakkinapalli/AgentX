import React from 'react';
import { UserPlus, Database, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentTab: 'overview' | 'students' | 'add-student' | 'complaints';
  onNavigateAdd: () => void;
  storageMode: string;
  totalStudents: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateAdd,
  storageMode,
  totalStudents,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'overview':
        return {
          title: 'Hostel Dashboard Overview',
          subtitle: 'Real-time student registry, occupancy statistics, and administration',
        };
      case 'students':
        return {
          title: 'Registered Students Directory',
          subtitle: `Viewing all ${totalStudents} registered hostel resident(s)`,
        };
      case 'add-student':
        return {
          title: 'New Student Registration',
          subtitle: 'Enroll a student into hostel records and assign room credentials',
        };
      case 'complaints':
        return {
          title: 'Student Complaints Registry',
          subtitle: 'Viewing issues and maintenance requests submitted by hostel residents (View Only)',
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 font-normal mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Architecture & DB status badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300">Backend: <span className="font-semibold text-white">FastAPI</span></span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            {storageMode === 'supabase' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-emerald-400">Supabase Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="font-medium text-amber-300">Local Dev DB</span>
              </>
            )}
          </div>
        </div>

        {/* Action Button (Add Student on overview/students pages only) */}
        {(currentTab === 'overview' || currentTab === 'students') && (
          <button
            onClick={onNavigateAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        )}
      </div>
    </header>
  );
};
