import React, { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  User,
  Building,
  Layers,
  Calendar,
  XCircle,
  UserPlus,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Student } from '../types/student';

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onNavigateAdd: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  isLoading,
  error,
  onRefresh,
  onNavigateAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('ALL');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Extract unique hostels and blocks dynamically from the student list
  const hostelOptions = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.hostel_name.trim()))).filter(Boolean);
    return list.sort();
  }, [students]);

  const blockOptions = useMemo(() => {
    const list = Array.from(
      new Set(
        students
          .filter((s) => selectedHostel === 'ALL' || s.hostel_name.trim() === selectedHostel)
          .map((s) => s.block_number.trim())
      )
    ).filter(Boolean);
    return list.sort();
  }, [students, selectedHostel]);

  // Filter students based on search, hostel, and block
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        student.phone.toLowerCase().includes(term) ||
        student.name.toLowerCase().includes(term);

      const matchesHostel =
        selectedHostel === 'ALL' || student.hostel_name.trim() === selectedHostel;

      const matchesBlock =
        selectedBlock === 'ALL' || student.block_number.trim() === selectedBlock;

      return matchesSearch && matchesHostel && matchesBlock;
    });
  }, [students, searchTerm, selectedHostel, selectedBlock]);

  const hasActiveFilters = searchTerm !== '' || selectedHostel !== 'ALL' || selectedBlock !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedHostel('ALL');
    setSelectedBlock('ALL');
  };

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5">
      {/* Control Bar: Search & Filters */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Phone Number or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hostel Filter */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedHostel}
              onChange={(e) => {
                setSelectedHostel(e.target.value);
                setSelectedBlock('ALL');
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Hostels</option>
              {hostelOptions.map((hostel) => (
                <option key={hostel} value={hostel} className="bg-slate-900 text-white">
                  {hostel}
                </option>
              ))}
            </select>
          </div>

          {/* Block Filter */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Blocks</option>
              {blockOptions.map((block) => (
                <option key={block} value={block} className="bg-slate-900 text-white">
                  Block {block}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              Clear Filters
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh records from Supabase"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="text-xs px-3 py-1 rounded-md bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Students Table Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">Registered Hostel Residents</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} (Supabase)
            </span>
          </div>
          {hasActiveFilters && (
            <span className="text-[11px] text-slate-400">
              Showing filtered results out of {students.length} total
            </span>
          )}
        </div>

        {/* Loading state skeleton */}
        {isLoading && students.length === 0 ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-800/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
              <User className="w-6 h-6" />
            </div>
            {hasActiveFilters ? (
              <>
                <h4 className="text-sm font-bold text-white">No students match your filter</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Try adjusting your search query or selecting a different hostel / block filter.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  Reset All Filters
                </button>
              </>
            ) : (
              <>
                <h4 className="text-sm font-bold text-white">No students registered in Supabase</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Start by registering your first student into your Supabase database.
                </p>
                <button
                  onClick={onNavigateAdd}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register First Student</span>
                </button>
              </>
            )}
          </div>
        ) : (
          /* Students Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Phone (Unique ID)</th>
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Hostel</th>
                  <th className="py-3 px-5">Block</th>
                  <th className="py-3 px-5">Room</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredStudents.map((student) => {
                  const isCopied = copiedPhone === student.phone;
                  return (
                    <tr
                      key={student.phone}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Phone (Unique ID) */}
                      <td className="py-3.5 px-5 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {student.phone}
                          </span>
                          <button
                            onClick={() => handleCopy(student.phone)}
                            title="Copy Phone"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-200">{student.name}</span>
                        </div>
                      </td>

                      {/* Hostel */}
                      <td className="py-3.5 px-5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{student.hostel_name}</span>
                        </div>
                      </td>

                      {/* Block */}
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                          Block {student.block_number}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[11px] font-mono font-medium border border-indigo-500/20">
                          {student.room_number}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {student.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-5 text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(student.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
