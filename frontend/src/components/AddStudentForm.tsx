import React, { useState } from 'react';
import {
  UserPlus,
  User,
  Phone,
  Building,
  Layers,
  DoorClosed,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { StudentFormData, Student } from '../types/student';
import { registerStudent } from '../services/api';

interface AddStudentFormProps {
  onStudentAdded: (student: Student) => void;
  onNavigateToList: () => void;
}

const COMMON_HOSTELS = [
  'Boys Hostel A',
  'Boys Hostel B',
  'Girls Hostel 1',
  'Girls Hostel 2',
  'PG Scholars Residence',
  'International Student House',
];

export const AddStudentForm: React.FC<AddStudentFormProps> = ({
  onStudentAdded,
  onNavigateToList,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    phone: '',
    name: '',
    hostel_name: '',
    block_number: '',
    room_number: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successStudent, setSuccessStudent] = useState<Student | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};

    // Phone Number (Unique Identifier)
    const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required (unique identifier).';
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneClean)) {
      newErrors.phone = 'Enter a valid 10-15 digit phone number (e.g., 9876543210).';
    }

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Student Name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    // Hostel Name
    if (!formData.hostel_name.trim()) {
      newErrors.hostel_name = 'Hostel Name is required.';
    }

    // Block Number
    if (!formData.block_number.trim()) {
      newErrors.block_number = 'Block Number is required.';
    }

    // Room Number
    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room Number is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const handleReset = () => {
    setFormData({
      phone: '',
      name: '',
      hostel_name: '',
      block_number: '',
      room_number: '',
    });
    setErrors({});
    setServerError(null);
    setSuccessStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerStudent({
        phone: formData.phone.trim(),
        name: formData.name.trim(),
        hostel_name: formData.hostel_name.trim(),
        block_number: formData.block_number.trim(),
        room_number: formData.room_number.trim(),
      });

      setSuccessStudent(response.student);
      onStudentAdded(response.student);
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while registering the student in Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Notification Banner */}
      {successStudent && (
        <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-emerald-200">
                Student Registered in Supabase!
              </h3>
              <p className="text-xs text-emerald-400 mt-1">
                <span className="font-semibold text-white">{successStudent.name}</span> (Phone:{' '}
                <span className="font-mono font-bold text-white">{successStudent.phone}</span>) has been saved into
                Supabase table <span className="font-mono text-white">students</span> &bull;{' '}
                <span className="text-white font-medium">{successStudent.hostel_name}</span>, Block{' '}
                <span className="text-white font-medium">{successStudent.block_number}</span>, Room{' '}
                <span className="text-white font-medium">{successStudent.room_number}</span>.
              </p>
              
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateToList}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-lg shadow-emerald-700/20"
                >
                  <span>View in Students Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Register Another Student</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Registration Card */}
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <span>Student Registration</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter student details. Phone number acts as the unique identifier in Supabase.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
          <div className="mt-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-300">Registration Error: </span>
              {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Row 1: Phone (Unique ID) & Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number (Unique Student Identifier) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.phone ? (
                <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-500">10-15 digits. Must be unique per resident.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Hostel Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hostel Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                list="hostels-list"
                type="text"
                placeholder="e.g. Boys Hostel A"
                value={formData.hostel_name}
                onChange={(e) => handleChange('hostel_name', e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.hostel_name
                    ? 'border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              <datalist id="hostels-list">
                {COMMON_HOSTELS.map((hostel) => (
                  <option key={hostel} value={hostel} />
                ))}
              </datalist>
            </div>
            {errors.hostel_name && (
              <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.hostel_name}</span>
              </p>
            )}
          </div>

          {/* Row 3: Block Number & Room Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Block Number / Wing <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. B"
                  value={formData.block_number}
                  onChange={(e) => handleChange('block_number', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.block_number
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.block_number && (
                <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.block_number}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Room Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <DoorClosed className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 204"
                  value={formData.room_number}
                  onChange={(e) => handleChange('room_number', e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.room_number
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.room_number && (
                <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.room_number}</span>
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Clear Fields
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-xs text-white shadow-lg transition-all ${
                isSubmitting
                  ? 'bg-blue-600/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Storing in Supabase...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Architecture note */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
          <Building className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-200">Database Single Source of Truth: </span>
          Upon submission, student data is sent to the FastAPI backend and stored directly in your permanent Supabase <code className="text-emerald-300">students</code> table.
        </div>
      </div>
    </div>
  );
};
