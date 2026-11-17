import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SuperAdminTab } from '../types';

export interface FeaturesTabProps {
  onAddStudent: (data: {
    rollno: string;
    name: string;
    year: string;
    department?: string;
    email?: string;
  }) => void;
  onAddFaculty: (data: {
    rollno: string;
    name: string;
    department: string;
    designation?: string;
    email?: string;
  }) => void;
  onNavigateTab: (tab: SuperAdminTab) => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({
  onAddStudent,
  onAddFaculty,
  onNavigateTab,
}) => {
  const [memberType, setMemberType] = useState<'student' | 'faculty'>('student');

  // Student Form State
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentYear, setStudentYear] = useState('1st Year');
  const [studentDept, setStudentDept] = useState('Geoinformatics');

  // Faculty Form State
  const [facultyRollNo, setFacultyRollNo] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [facultyDept, setFacultyDept] = useState('Geoinformatics Engineering');
  const [facultyDesignation, setFacultyDesignation] = useState('Faculty Advisor');

  // Success Feedback
  const [lastAdded, setLastAdded] = useState<{
    type: 'student' | 'faculty';
    name: string;
    roll: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentRollNo.trim()) {
      setErrorMsg('Please enter student roll number');
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('Please enter student name');
      return;
    }

    onAddStudent({
      rollno: studentRollNo,
      name: studentName,
      year: studentYear,
      department: studentDept,
      email: `${studentRollNo.toLowerCase().trim()}@college.edu`,
    });

    setLastAdded({
      type: 'student',
      name: studentName.trim(),
      roll: studentRollNo.toUpperCase().trim(),
    });

    // Reset Form
    setStudentRollNo('');
    setStudentName('');
  };

  const handleFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!facultyRollNo.trim()) {
      setErrorMsg('Please enter faculty roll number / ID');
      return;
    }
    if (!facultyName.trim()) {
      setErrorMsg('Please enter faculty name');
      return;
    }
    if (!facultyDept.trim()) {
      setErrorMsg('Please enter faculty department');
      return;
    }

    onAddFaculty({
      rollno: facultyRollNo,
      name: facultyName,
      department: facultyDept,
      designation: facultyDesignation,
      email: `${facultyName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
    });

    setLastAdded({
      type: 'faculty',
      name: facultyName.trim(),
      roll: facultyRollNo.toUpperCase().trim(),
    });

    // Reset Form
    setFacultyRollNo('');
    setFacultyName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <UserPlus size={13} className="text-emerald-600" />
              Member Provisioning
            </span>
            <span className="text-xs font-semibold text-slate-500">Add Features</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Add Student or Faculty
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Choose whether to onboard a student or faculty advisor to the platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('logs')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          View All in Logs &rarr;
        </button>
      </div>

      {/* The ASK Switcher: Student or Faculty */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Select Member Category
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => {
              setMemberType('student');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
              memberType === 'student'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <GraduationCap size={18} strokeWidth={2.4} />
            Student
          </button>

          <button
            type="button"
            onClick={() => {
              setMemberType('faculty');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
              memberType === 'faculty'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Briefcase size={18} strokeWidth={2.4} />
            Faculty
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {lastAdded && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} strokeWidth={2.6} />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Successfully enrolled {lastAdded.type === 'student' ? 'Student' : 'Faculty'}!
              </p>
              <p className="text-xs font-semibold text-emerald-700">
                {lastAdded.name} ({lastAdded.roll}) is now provisioned with active status.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('logs')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-white border border-emerald-300 px-3 py-1.5 rounded-lg shadow-sm shrink-0 cursor-pointer flex items-center gap-1"
          >
            Inspect in Logs <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-center gap-2 text-rose-700 text-xs font-bold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          {memberType === 'student' ? (
            /* Student Form: rollno, name, year */
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">Student Enrollment Form</h2>
                <p className="text-xs text-slate-500">
                  Required fields: Roll Number, Full Name, and Year of Study.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Roll Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24GEO055"
                  value={studentRollNo}
                  onChange={(e) => setStudentRollNo(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-semibold uppercase text-slate-900 outline-none transition-all"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Roll number will be used as user login ID.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kavya Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-semibold text-slate-900 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Year of Study *
                  </label>
                  <select
                    value={studentYear}
                    onChange={(e) => setStudentYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-semibold text-slate-900 bg-white outline-none transition-all cursor-pointer"
                  >
                    <option value="1st Year">1st Year (Fresher)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={studentDept}
                    onChange={(e) => setStudentDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Default temporary password: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">geohub</code>
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={16} strokeWidth={2.4} />
                  Add Student
                </button>
              </div>
            </form>
          ) : (
            /* Faculty Form: ROLLNO, NAME, DEPARTMENT */
            <form onSubmit={handleFacultySubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">Faculty Provisioning Form</h2>
                <p className="text-xs text-slate-500">
                  Required fields: ROLL NO, NAME, and DEPARTMENT.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  ROLLNO (Faculty ID) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAC05"
                  value={facultyRollNo}
                  onChange={(e) => setFacultyRollNo(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold uppercase text-slate-900 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-900 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    DEPARTMENT *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Geoinformatics Engineering"
                    value={facultyDept}
                    onChange={(e) => setFacultyDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-900 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={facultyDesignation}
                    onChange={(e) => setFacultyDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-semibold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Portal clearance: <strong className="text-slate-700">Faculty Advisor Role</strong>
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={16} strokeWidth={2.4} />
                  Add Faculty
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye size={16} className="text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Badge Preview
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${
                    memberType === 'student'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {memberType === 'student'
                    ? (studentName.slice(0, 2).toUpperCase() || 'ST')
                    : (facultyName.slice(0, 2).toUpperCase() || 'FA')}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {memberType === 'student'
                      ? studentName || 'Student Name'
                      : facultyName || 'Faculty Name'}
                  </h3>
                  <p className="text-xs font-mono font-bold text-slate-600">
                    {memberType === 'student'
                      ? studentRollNo || '24GEO000'
                      : facultyRollNo || 'FAC00'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200/70 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-bold text-slate-800 capitalize">{memberType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                    {memberType === 'student' ? studentDept : facultyDept}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {memberType === 'student' ? 'Year:' : 'Designation:'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {memberType === 'student' ? studentYear : facultyDesignation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[10px]">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" />
              Instantly synchronized into Logs & Directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesTab;
