import React from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { Student } from '../types/student';
import { StatCards } from './StatCards';

interface DashboardOverviewProps {
  students: Student[];
  onNavigateTab: (tab: 'overview' | 'students' | 'add-student') => void;
  storageMode: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  onNavigateTab,
}) => {
  const recentStudents = students.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-500/20 p-6 md:p-8 backdrop-blur-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Hostel Management Platform &bull; Supabase Live</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Hostel Administration & Student Registry
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
            Centralized Administration Dashboard backed directly by your Supabase PostgreSQL database. Register residents, allocate rooms, and maintain real-time institutional records.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('add-student')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Student</span>
            </button>
            <button
              onClick={() => onNavigateTab('students')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>View Registered Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Cards */}
      <StatCards students={students} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Recent Registrations (Supabase)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time records from your Supabase students table</p>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentStudents.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No students found in your Supabase database yet.</p>
              <button
                onClick={() => onNavigateTab('add-student')}
                className="mt-3 text-xs text-blue-400 hover:underline"
              >
                Register student now &rarr;
              </button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-800/60">
              {recentStudents.map((student) => (
                <div
                  key={student.phone}
                  className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{student.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {student.phone} &bull; {student.hostel_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      Room {student.room_number} (Blk {student.block_number})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Architecture Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Database & Security</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your Supabase project is the permanent, single source of truth. No local storage or mock database is used.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">React + TypeScript</p>
                <p className="text-[11px] text-slate-400">No secret keys in client</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">FastAPI Backend</p>
                <p className="text-[11px] text-slate-400">Server-side validation</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Your Supabase PostgreSQL</p>
                <p className="text-[11px] text-emerald-400 font-mono">efxmgkzsoopmyeyuqoty</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
