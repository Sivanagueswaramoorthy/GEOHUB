import React, { useState } from 'react';
import {
  UserPlus,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SuperAdminTab } from '../types';

export interface FeaturesTabProps {
  onAddStudent: (data: {
    rollno: string;
    name: string;
    year: string;
    department?: string;
    email?: string;
  }) => void | Promise<any>;
  onAddFaculty: (data: {
    rollno: string;
    name: string;
    department: string;
    designation?: string;
    email?: string;
  }) => void | Promise<any>;
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

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAdded, setLastAdded] = useState<{
    type: 'student' | 'faculty';
    name: string;
    roll: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');

    if (!studentRollNo.trim()) {
      setErrorMsg('Please enter student roll number');
      return;
    }
    if (!studentName.trim()) {
      setErrorMsg('Please enter student name');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddStudent({
        rollno: studentRollNo.trim(),
        name: studentName.trim(),
        year: studentYear,
        department: studentDept.trim(),
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
    } catch (err: any) {
      const msg =
        err?.message === 'Failed to fetch' || err?.message?.includes('NetworkError')
          ? 'Unable to reach cloud server. Please check your internet connection.'
          : err?.message || 'Failed to onboard student to TiDB Cloud';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
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

    try {
      setIsSubmitting(true);
      await onAddFaculty({
        rollno: facultyRollNo.trim(),
        name: facultyName.trim(),
        department: facultyDept.trim(),
        designation: facultyDesignation.trim(),
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
    } catch (err: any) {
      const msg =
        err?.message === 'Failed to fetch' || err?.message?.includes('NetworkError')
          ? 'Unable to reach cloud server. Please check your internet connection.'
          : err?.message || 'Failed to provision faculty to TiDB Cloud';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-16 font-sans">
      {/* Page Header (Light Peach Theme) */}
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              style={{ backgroundColor: '#DAF1DE', borderColor: '#8EB69B', color: '#163832' }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border"
            >
              <UserPlus size={13} className="text-emerald-700" />
              Member Provisioning
            </span>
            <span style={{ color: '#235347' }} className="text-xs font-semibold">
              Live TiDB Cloud Onboarding
            </span>
          </div>
          <h1 style={{ color: '#051F20' }} className="text-xl sm:text-2xl font-black tracking-tight">
            Add Student or Faculty
          </h1>
          <p style={{ color: '#235347' }} className="text-xs sm:text-sm font-medium mt-1">
            New scholars are onboarded primarily as active members; custom posts can be assigned afterwards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('logs')}
          style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer self-start sm:self-auto shrink-0 border active:scale-95"
        >
          View All in Directory &rarr;
        </button>
      </div>

      {/* The ASK Switcher: Student or Faculty (Clean Mint Card) */}
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-4 sm:p-5 border shadow-sm"
      >
        <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-2">
          Select Member Category
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => {
              setMemberType('student');
              setErrorMsg('');
            }}
            style={{
              backgroundColor: memberType === 'student' ? '#051F20' : '#FFFFFF',
              color: memberType === 'student' ? '#FFFFFF' : '#051F20',
              borderColor: memberType === 'student' ? '#051F20' : '#DAF1DE',
            }}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer border shadow-xs active:scale-95"
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
            style={{
              backgroundColor: memberType === 'faculty' ? '#051F20' : '#FFFFFF',
              color: memberType === 'faculty' ? '#FFFFFF' : '#051F20',
              borderColor: memberType === 'faculty' ? '#051F20' : '#DAF1DE',
            }}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer border shadow-xs active:scale-95"
          >
            <Briefcase size={18} strokeWidth={2.4} />
            Faculty
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {lastAdded && (
        <div
          style={{ backgroundColor: '#DAF1DE', borderColor: '#8EB69B' }}
          className="rounded-2xl p-4 border flex items-center justify-between gap-3 animate-fadeIn shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: '#163832', color: '#FFFFFF' }}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            >
              <CheckCircle2 size={18} strokeWidth={2.6} />
            </div>
            <div>
              <p style={{ color: '#051F20' }} className="text-sm font-black">
                Successfully enrolled {lastAdded.type === 'student' ? 'Student Member' : 'Faculty Advisor'} in TiDB!
              </p>
              <p style={{ color: '#163832' }} className="text-xs font-semibold mt-0.5">
                {lastAdded.name} ({lastAdded.roll}) is now provisioned. You can assign their post and squad in Directory.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('logs')}
            style={{ backgroundColor: '#FFFFFF', borderColor: '#8EB69B', color: '#051F20' }}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border shadow-xs shrink-0 cursor-pointer flex items-center gap-1 active:scale-95"
          >
            Assign Post <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div
          style={{ backgroundColor: '#F6FBF7', borderColor: '#D9534F', color: '#D9534F' }}
          className="rounded-2xl p-3.5 border flex items-center gap-2 text-xs font-bold animate-fadeIn"
        >
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Form Container (2 Columns) */}
        <div
          style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
          className="lg:col-span-2 cockpit-card rounded-2xl p-5 sm:p-6 border shadow-sm"
        >
          {memberType === 'student' ? (
            /* Student Form: rollno, name, year */
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div style={{ borderColor: '#DAF1DE' }} className="border-b pb-3 mb-4">
                <h2 style={{ color: '#051F20' }} className="text-base font-black">
                  Student Enrollment Form
                </h2>
                <p style={{ color: '#235347' }} className="text-xs font-medium mt-0.5">
                  Required: Roll Number, Full Name, and Year. Scholar joins as a primary Member.
                </p>
              </div>

              <div>
                <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Roll Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24GEO055"
                  value={studentRollNo}
                  onChange={(e) => setStudentRollNo(e.target.value.toUpperCase())}
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold uppercase outline-none focus:border-emerald-600 transition-all shadow-xs"
                  required
                />
                <p style={{ color: '#235347' }} className="text-xs font-medium mt-1">Roll number will be used as student login ID.</p>
              </div>

              <div>
                <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kavya Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-emerald-600 transition-all shadow-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Year of Study *
                  </label>
                  <select
                    value={studentYear}
                    onChange={(e) => setStudentYear(e.target.value)}
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none focus:border-emerald-600 transition-all shadow-xs cursor-pointer"
                  >
                    <option value="1st Year">1st Year (Fresher)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={studentDept}
                    onChange={(e) => setStudentDept(e.target.value)}
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-emerald-600 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div style={{ borderColor: '#DAF1DE' }} className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span style={{ color: '#235347' }} className="text-xs font-medium">
                  Default temporary password: <code style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }} className="px-1.5 py-0.5 rounded border font-bold">geohub</code>
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#051F20', color: '#FFFFFF' }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} strokeWidth={2.4} />
                      <span>Add Student</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Faculty Form: ROLLNO, NAME, DEPARTMENT */
            <form onSubmit={handleFacultySubmit} className="space-y-4">
              <div style={{ borderColor: '#DAF1DE' }} className="border-b pb-3 mb-4">
                <h2 style={{ color: '#051F20' }} className="text-base font-black">
                  Faculty Provisioning Form
                </h2>
                <p style={{ color: '#235347' }} className="text-xs font-medium mt-0.5">
                  Required fields: ROLL NO, NAME, and DEPARTMENT.
                </p>
              </div>

              <div>
                <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  ROLLNO (Faculty ID) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAC05"
                  value={facultyRollNo}
                  onChange={(e) => setFacultyRollNo(e.target.value.toUpperCase())}
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold uppercase outline-none focus:border-blue-600 transition-all shadow-xs"
                  required
                />
              </div>

              <div>
                <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-blue-600 transition-all shadow-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    DEPARTMENT *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Geoinformatics Engineering"
                    value={facultyDept}
                    onChange={(e) => setFacultyDept(e.target.value)}
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-blue-600 transition-all shadow-xs"
                    required
                  />
                </div>

                <div>
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={facultyDesignation}
                    onChange={(e) => setFacultyDesignation(e.target.value)}
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE', color: '#051F20' }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:border-blue-600 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div style={{ borderColor: '#DAF1DE' }} className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span style={{ color: '#235347' }} className="text-xs font-medium">
                  Portal clearance: <strong style={{ color: '#051F20' }}>Faculty Advisor Role</strong>
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#051F20', color: '#FFFFFF' }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} strokeWidth={2.4} />
                      <span>Add Faculty</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Preview Card (Light Peach Theme) */}
        <div
          style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
          className="cockpit-card rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye size={16} className="text-emerald-700" />
              <span style={{ color: '#235347' }} className="text-xs font-bold uppercase tracking-wider">
                Live Badge Preview
              </span>
            </div>

            <div
              style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
              className="p-4 rounded-xl border space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: '#051F20',
                    color: '#FFFFFF',
                  }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-xs shrink-0"
                >
                  {memberType === 'student'
                    ? (studentName.slice(0, 2).toUpperCase() || 'ST')
                    : (facultyName.slice(0, 2).toUpperCase() || 'FA')}
                </div>
                <div className="min-w-0">
                  <h3 style={{ color: '#051F20' }} className="text-sm font-black truncate">
                    {memberType === 'student'
                      ? studentName || 'Student Name'
                      : facultyName || 'Faculty Name'}
                  </h3>
                  <p style={{ color: '#235347' }} className="text-xs font-mono font-bold">
                    {memberType === 'student'
                      ? studentRollNo || '24GEO000'
                      : facultyRollNo || 'FAC00'}
                  </p>
                </div>
              </div>

              <div style={{ borderColor: '#DAF1DE' }} className="space-y-1.5 pt-2 border-t text-xs">
                <div className="flex justify-between">
                  <span style={{ color: '#235347' }}>Category:</span>
                  <span style={{ color: '#051F20' }} className="font-bold capitalize">{memberType}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#235347' }}>Department:</span>
                  <span style={{ color: '#051F20' }} className="font-semibold truncate max-w-[140px]">
                    {memberType === 'student' ? studentDept : facultyDept}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#235347' }}>
                    {memberType === 'student' ? 'Primary Post:' : 'Designation:'}
                  </span>
                  <span style={{ color: '#051F20' }} className="font-semibold">
                    {memberType === 'student' ? 'Student Member' : facultyDesignation}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: '#235347' }}>Status:</span>
                  <span
                    style={{ backgroundColor: '#DAF1DE', borderColor: '#8EB69B', color: '#163832' }}
                    className="font-bold px-2 py-0.5 rounded-full text-xs border"
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderColor: '#DAF1DE' }} className="mt-4 pt-3 border-t">
            <p style={{ color: '#235347' }} className="text-xs font-medium flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-600 shrink-0" />
              Instantly synchronized into Logs & Directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesTab;
