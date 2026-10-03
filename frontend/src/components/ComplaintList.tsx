import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  Calendar,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  ImageIcon,
  X,
  ExternalLink,
  Shield,
  MessageSquareWarning,
  User,
  DoorClosed,
  Phone,
  Loader2
} from 'lucide-react';
import { Complaint } from '../types/complaint';
import { fetchComplaints } from '../services/api';

export const ComplaintList: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and status filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals for read-only viewing
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchComplaints();
      setComplaints(data);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Distinct statuses for filter dropdown
  const statusOptions = useMemo(() => {
    const list = Array.from(new Set(complaints.map((c) => c.status))).filter(Boolean);
    return list.sort();
  }, [complaints]);

  // Filter complaints based on search query and status filter
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const idStr = String(item.complaint_id || item.id);
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        idStr.toLowerCase().includes(term) ||
        (item.student_name && item.student_name.toLowerCase().includes(term)) ||
        item.student_phone.toLowerCase().includes(term) ||
        item.problem.toLowerCase().includes(term) ||
        (item.room_number && item.room_number.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString?: string | null) => {
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

  const getStatusBadge = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s.includes('RESOLV') || s === 'CLOSED' || s === 'COMPLETED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (s.includes('PROGRESS') || s === 'ASSIGNED') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (s.includes('REJECT') || s === 'CANCELLED') {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="space-y-5">
      {/* Notice Banner: View-Only Mode */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Administrator View (Read-Only): </span>
            <span>All complaints are submitted by hostel residents. Viewing complete details, statuses, and photos.</span>
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700">
          View Only
        </span>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, Student, Phone, Room, Problem..."
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

        {/* Filter Dropdown & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-slate-400 text-xs">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
              {statusOptions.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
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
            onClick={loadComplaints}
            disabled={isLoading}
            title="Refresh complaints from Supabase"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ERROR STATE: "Failed to load complaints. Please try again." */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">Failed to load complaints. Please try again.</span>
          </div>
          <button
            onClick={loadComplaints}
            className="text-xs px-3 py-1 rounded-md bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Complaints Table Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">Complaints</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {filteredComplaints.length} {filteredComplaints.length === 1 ? 'complaint' : 'complaints'}
            </span>
          </div>
          {hasActiveFilters && (
            <span className="text-[11px] text-slate-400">
              Showing filtered results out of {complaints.length} total
            </span>
          )}
        </div>

        {/* LOADING STATE: "Loading complaints..." */}
        {isLoading && complaints.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-300">Loading complaints...</p>
            <p className="text-xs text-slate-500 mt-1">Connecting to Supabase complaints registry</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          /* EMPTY STATE: "No complaints found" */
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
              <MessageSquareWarning className="w-8 h-8 text-slate-500" />
            </div>
            <h4 className="text-base font-bold text-white">No complaints found</h4>
            <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
              {hasActiveFilters
                ? 'No complaints match your active filter criteria. Try clearing search or status filters.'
                : 'Complaints submitted by students from the student portal will appear here.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          /* Complaints Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-5">Phone</th>
                  <th className="py-3 px-5">Room</th>
                  <th className="py-3 px-5">Problem</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5">Photo</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Created</th>
                  <th className="py-3 px-5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredComplaints.map((item) => {
                  const idValue = String(item.complaint_id || item.id);
                  const isCopied = copiedId === idValue;
                  const hasPhoto = Boolean(item.photo_url && item.photo_url.trim());

                  return (
                    <tr
                      key={idValue}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-[11px]">
                            #{idValue.length > 8 ? idValue.slice(0, 8) : idValue}
                          </span>
                          <button
                            onClick={() => handleCopy(idValue, idValue)}
                            title="Copy ID"
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

                      {/* Student */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                            {(item.student_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-200">
                            {item.student_name || 'Student'}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-5 text-slate-300 font-mono">
                        <a
                          href={`tel:${item.student_phone}`}
                          className="hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{item.student_phone}</span>
                        </a>
                      </td>

                      {/* Room */}
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                          {item.room_number || 'N/A'}
                        </span>
                      </td>

                      {/* Problem */}
                      <td className="py-3.5 px-5 font-medium text-slate-200">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-blue-300 border border-slate-700/80 font-medium">
                          {item.problem}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-5 text-slate-400 max-w-xs truncate" title={item.description || ''}>
                        {item.description ? item.description : <span className="text-slate-600 italic">No description provided</span>}
                      </td>

                      {/* Photo: Image preview or View Photo */}
                      <td className="py-3.5 px-5">
                        {hasPhoto ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewPhotoUrl(item.photo_url!)}
                              title="Click to view photo"
                              className="relative group/thumb w-9 h-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0 hover:border-blue-500 transition-colors"
                            >
                              <img
                                src={item.photo_url!}
                                alt="Complaint attachment"
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </button>
                            <button
                              onClick={() => setViewPhotoUrl(item.photo_url!)}
                              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1"
                            >
                              <span>View Photo</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">No Photo</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                          {item.status || 'PENDING'}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-5 text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedComplaint(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                          title="View Complaint Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* READ-ONLY COMPLAINT DETAILS MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <MessageSquareWarning className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Complaint Details</span>
                    <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      #{String(selectedComplaint.complaint_id || selectedComplaint.id)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Submitted by student &bull; Read-Only View</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-6 space-y-5">
              {/* Student and Room Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Student</span>
                  <span className="font-semibold text-white mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    {selectedComplaint.student_name || 'Student'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Phone</span>
                  <span className="font-mono text-slate-200 mt-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedComplaint.student_phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Room</span>
                  <span className="font-mono text-indigo-300 font-semibold mt-1 flex items-center gap-1.5">
                    <DoorClosed className="w-3.5 h-3.5 text-indigo-400" />
                    Room {selectedComplaint.room_number || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Problem Title & Status */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Problem</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{selectedComplaint.problem}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border uppercase ${getStatusBadge(
                      selectedComplaint.status
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {selectedComplaint.status || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                  Description
                </label>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description || (
                    <span className="text-slate-500 italic">No additional description provided by the student.</span>
                  )}
                </div>
              </div>

              {/* Attached Photo */}
              {selectedComplaint.photo_url && selectedComplaint.photo_url.trim() && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Uploaded Photo (View Only)</span>
                    </label>
                    <button
                      onClick={() => setViewPhotoUrl(selectedComplaint.photo_url!)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <span>Expand Photo</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div
                    onClick={() => setViewPhotoUrl(selectedComplaint.photo_url!)}
                    className="relative cursor-pointer group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-72 flex items-center justify-center"
                  >
                    <img
                      src={selectedComplaint.photo_url}
                      alt="Complaint attachment"
                      className="max-h-72 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Click to view full size</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Created At: {formatDate(selectedComplaint.created_at)}</span>
                <span className="italic text-slate-400">View-Only</span>
              </div>
            </div>

            {/* Modal Actions (Close Only) */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PHOTO LIGHTBOX MODAL */}
      {viewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Uploaded Complaint Photo (View Only)</span>
              </span>
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center bg-black/40 rounded-xl p-2">
              <img
                src={viewPhotoUrl}
                alt="Complaint Full View"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="w-full pt-3 flex justify-end">
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Close Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
