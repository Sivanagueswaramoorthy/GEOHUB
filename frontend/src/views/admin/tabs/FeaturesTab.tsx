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
  Hash,
  User,
  Calendar,
  Building2,
  Award,
  QrCode,
  Radio,
  FileSpreadsheet,
  KeyRound,
  Check,
  Zap,
  ChevronDown,
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
  const [showLivePass, setShowLivePass] = useState(true);

  // Quick Prefix Helpers
  const studentPrefixes = ['24GEO', '23GEO', '22GEO', '21GEO'];
  const departmentOptions = ['Geoinformatics', 'Civil Engineering', 'Computer Science', 'Environmental Eng'];
  const designationOptions = ['Faculty Advisor', 'Professor & HOD', 'Associate Professor', 'Assistant Professor'];

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

      // Reset Form fields
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

      // Reset Form fields
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

  const getInitials = (name: string, fallback: string) => {
    if (!name.trim()) return fallback;
    const parts = name.replace(/Dr\.|Prof\./gi, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || fallback).toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-24 font-sans select-none max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER CARD (Elevated Botanical Luxury)                           */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F6FBF7 50%, #DAF1DE 100%)',
          borderColor: '#DAF1DE',
          boxShadow: '0 10px 30px -8px rgba(5, 31, 32, 0.07)',
        }}
        className="rounded-3xl p-5 sm:p-6 border relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
      >
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#8EB69B]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#DAF1DE]/60 blur-2xl pointer-events-none" />

        <div className="relative z-10 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Member Provisioning Badge */}
            <span
              style={{
                backgroundColor: '#DAF1DE',
                borderColor: '#8EB69B',
                color: '#163832',
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs"
            >
              <UserPlus size={13} className="text-emerald-700 shrink-0" />
              <span>Member Provisioning</span>
            </span>

            {/* Live TiDB Status Ping */}
            <span className="text-xs font-bold text-[#235347] flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-900/10 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Live TiDB Cloud Onboarding</span>
            </span>
          </div>

          <h1
            style={{ color: '#051F20' }}
            className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight"
          >
            Add Student or Faculty
          </h1>
          <p
            style={{ color: '#235347' }}
            className="text-xs sm:text-sm font-medium mt-1 sm:mt-1.5 max-w-xl leading-relaxed"
          >
            New scholars are onboarded primarily as active members; custom posts can be assigned afterwards.
          </p>
        </div>

        {/* Action: View All in Directory */}
        <div className="relative z-10 flex items-center gap-2 shrink-0 self-start sm:self-auto pt-1 sm:pt-0">
          <button
            type="button"
            onClick={() => onNavigateTab('logs')}
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DAF1DE',
              color: '#051F20',
              boxShadow: '0 2px 8px rgba(5, 31, 32, 0.04)',
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold hover:border-[#8EB69B] hover:bg-[#F6FBF7] transition-all cursor-pointer border active:scale-95 group"
          >
            <span>View All in Directory</span>
            <ArrowRight size={14} className="text-emerald-700 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUCCESS ALERT BANNER (If newly provisioned)                            */}
      {/* ========================================================================= */}
      {lastAdded && (
        <div
          style={{
            background: 'linear-gradient(135deg, #DAF1DE 0%, #FFFFFF 100%)',
            borderColor: '#8EB69B',
            boxShadow: '0 6px 20px -3px rgba(22, 56, 50, 0.1)',
          }}
          className="rounded-2xl sm:rounded-3xl p-4 border flex items-center justify-between gap-3 animate-slideUp"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{ backgroundColor: '#163832', color: '#FFFFFF' }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            >
              <CheckCircle2 size={20} strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <p style={{ color: '#051F20' }} className="text-xs sm:text-sm font-black truncate">
                Successfully enrolled {lastAdded.type === 'student' ? 'Student Member' : 'Faculty Advisor'} in TiDB!
              </p>
              <p style={{ color: '#163832' }} className="text-xs font-semibold mt-0.5 truncate">
                {lastAdded.name} ({lastAdded.roll}) is now provisioned. You can assign their post and squad in Directory.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('logs')}
            style={{ backgroundColor: '#051F20', color: '#FFFFFF' }}
            className="text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 hover:bg-[#163832] active:scale-95 transition-all"
          >
            <span>Assign Post</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ERROR ALERT BANNER                                                     */}
      {/* ========================================================================= */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-bold animate-fadeIn shadow-xs">
          <AlertCircle size={17} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SELECT MEMBER CATEGORY CARD                                            */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#DAF1DE',
          boxShadow: '0 4px 16px -2px rgba(5, 31, 32, 0.04)',
        }}
        className="rounded-3xl p-4 sm:p-5 border space-y-3"
      >
        <div className="flex items-center justify-between">
          <label style={{ color: '#235347' }} className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={13} className="text-emerald-600" />
            <span>SELECT MEMBER CATEGORY</span>
          </label>
          <span className="text-xs font-bold text-[#235347]">
            {memberType === 'student' ? 'Enrolling Scholar' : 'Enrolling Academic Staff'}
          </span>
        </div>

        {/* Premium High-Contrast Dual Switcher */}
        <div
          style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
          className="p-1.5 rounded-2xl border grid grid-cols-2 gap-2 shadow-inner"
        >
          {/* Student Button */}
          <button
            type="button"
            onClick={() => {
              setMemberType('student');
              setErrorMsg('');
            }}
            className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
              memberType === 'student'
                ? 'bg-[#051F20] text-white shadow-md shadow-emerald-950/20 scale-[1.01]'
                : 'text-[#235347] hover:text-[#051F20] hover:bg-white/70'
            }`}
          >
            <GraduationCap size={18} strokeWidth={2.4} className={memberType === 'student' ? 'text-emerald-300' : 'text-[#235347]'} />
            <span>Student</span>
          </button>

          {/* Faculty Button */}
          <button
            type="button"
            onClick={() => {
              setMemberType('faculty');
              setErrorMsg('');
            }}
            className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
              memberType === 'faculty'
                ? 'bg-[#051F20] text-white shadow-md shadow-emerald-950/20 scale-[1.01]'
                : 'text-[#235347] hover:text-[#051F20] hover:bg-white/70'
            }`}
          >
            <Briefcase size={18} strokeWidth={2.4} className={memberType === 'faculty' ? 'text-emerald-300' : 'text-[#235347]'} />
            <span>Faculty</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN ENROLLMENT FORM & DIGITAL BADGE PREVIEW GRID                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Form Card (Desktop: 7 or 8 columns) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#DAF1DE',
            boxShadow: '0 10px 30px -5px rgba(5, 31, 32, 0.05)',
          }}
          className="lg:col-span-7 xl:col-span-8 rounded-3xl p-5 sm:p-7 border space-y-5"
        >
          {memberType === 'student' ? (
            /* ===================================================================== */
            /* STUDENT ENROLLMENT FORM                                               */
            /* ===================================================================== */
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div style={{ borderColor: '#DAF1DE' }} className="border-b pb-3.5 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                    <h2 style={{ color: '#051F20' }} className="text-base sm:text-lg font-black tracking-tight">
                      Student Enrollment Form
                    </h2>
                  </div>
                  <p style={{ color: '#235347' }} className="text-xs font-medium mt-1">
                    Required: Roll Number, Full Name, and Year. Scholar joins as a primary Member.
                  </p>
                </div>

                {/* Mobile Preview Toggle */}
                <button
                  type="button"
                  onClick={() => setShowLivePass(!showLivePass)}
                  className="lg:hidden text-xs font-bold text-[#163832] bg-[#F6FBF7] border border-[#DAF1DE] px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-[#DAF1DE] transition-colors shadow-2xs shrink-0"
                >
                  <Eye size={13} />
                  <span>{showLivePass ? 'Hide Card' : 'Show Card'}</span>
                </button>
              </div>

              {/* Field 1: Roll Number with Clean Flex Container & Quick Batch Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    ROLL NUMBER *
                  </label>
                  <span className="text-xs font-semibold text-[#8EB69B]">
                    Primary Unique Key
                  </span>
                </div>

                <div
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                  className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs"
                >
                  <div
                    style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <Hash size={14} strokeWidth={2.4} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 24GEO055"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value.toUpperCase())}
                    style={{ color: '#051F20' }}
                    className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-black uppercase placeholder:text-[#8EB69B] placeholder:font-semibold"
                    required
                  />
                </div>

                {/* Quick Roll Number Prefix Chips */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-xs font-bold text-[#235347]">Quick batch:</span>
                  {studentPrefixes.map((pfx) => (
                    <button
                      key={pfx}
                      type="button"
                      onClick={() => {
                        if (!studentRollNo.startsWith(pfx)) {
                          setStudentRollNo(pfx);
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-[#FFFFFF] border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] transition-colors cursor-pointer shadow-2xs"
                    >
                      +{pfx}
                    </button>
                  ))}
                  <p style={{ color: '#235347' }} className="text-xs font-medium ml-auto">
                    Roll number will be used as student login ID.
                  </p>
                </div>
              </div>

              {/* Field 2: Student Full Name with Monogram Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    STUDENT FULL NAME *
                  </label>
                  {studentName.trim() && (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-[#DAF1DE] px-2 py-0.5 rounded-full border border-[#8EB69B]/40">
                      <Check size={12} strokeWidth={3} />
                      <span>{getInitials(studentName, 'ST')}</span>
                    </span>
                  )}
                </div>

                <div
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                  className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs"
                >
                  <div
                    style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <User size={14} strokeWidth={2.4} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Kavya Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{ color: '#051F20' }}
                    className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-bold placeholder:text-[#8EB69B]"
                    required
                  />
                </div>
              </div>

              {/* Field 3 & 4: Year of Study & Department Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    YEAR OF STUDY *
                  </label>
                  <div
                    style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                    className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs relative"
                  >
                    <div
                      style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      <Calendar size={14} strokeWidth={2.4} />
                    </div>
                    <select
                      value={studentYear}
                      onChange={(e) => setStudentYear(e.target.value)}
                      style={{ color: '#051F20' }}
                      className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-bold cursor-pointer appearance-none pr-6"
                    >
                      <option value="1st Year">1st Year (Fresher)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior)</option>
                      <option value="4th Year">4th Year (Senior)</option>
                    </select>
                    <ChevronDown size={14} strokeWidth={2.4} className="text-[#235347] absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    DEPARTMENT
                  </label>
                  <div
                    style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                    className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs"
                  >
                    <div
                      style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      <Building2 size={14} strokeWidth={2.4} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Geoinformatics"
                      value={studentDept}
                      onChange={(e) => setStudentDept(e.target.value)}
                      style={{ color: '#051F20' }}
                      className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-bold placeholder:text-[#8EB69B]"
                    />
                  </div>
                </div>
              </div>

              {/* Department Quick Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-xs font-bold text-[#235347]">Suggestions:</span>
                {departmentOptions.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setStudentDept(dept)}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] transition-colors cursor-pointer shadow-2xs"
                  >
                    {dept.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Action Footer & Security Note */}
              <div
                style={{ borderColor: '#DAF1DE' }}
                className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                  <KeyRound size={14} className="text-emerald-700 shrink-0" />
                  <span>
                    Default password:{' '}
                    <code
                      style={{
                        backgroundColor: '#F6FBF7',
                        borderColor: '#DAF1DE',
                        color: '#051F20',
                      }}
                      className="px-2.5 py-1 rounded-lg border font-mono font-black"
                    >
                      geohub
                    </code>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#163832',
                    color: '#FFFFFF',
                  }}
                  className="min-h-[44px] px-7 py-3 rounded-2xl font-black text-xs sm:text-sm hover:bg-[#235347] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            /* ===================================================================== */
            /* FACULTY PROVISIONING FORM                                             */
            /* ===================================================================== */
            <form onSubmit={handleFacultySubmit} className="space-y-4">
              <div style={{ borderColor: '#DAF1DE' }} className="border-b pb-3.5 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
                    <h2 style={{ color: '#051F20' }} className="text-base sm:text-lg font-black tracking-tight">
                      Faculty Provisioning Form
                    </h2>
                  </div>
                  <p style={{ color: '#235347' }} className="text-xs font-medium mt-1">
                    Required fields: ROLL NO, NAME, and DEPARTMENT.
                  </p>
                </div>

                {/* Mobile Preview Toggle */}
                <button
                  type="button"
                  onClick={() => setShowLivePass(!showLivePass)}
                  className="lg:hidden text-xs font-bold text-[#163832] bg-[#F6FBF7] border border-[#DAF1DE] px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-[#DAF1DE] transition-colors shadow-2xs shrink-0"
                >
                  <Eye size={13} />
                  <span>{showLivePass ? 'Hide Card' : 'Show Card'}</span>
                </button>
              </div>

              {/* Faculty Roll / Staff ID with Flex Container */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    ROLLNO (Faculty ID) *
                  </label>
                  <span className="text-xs font-semibold text-[#8EB69B]">
                    Staff Identity
                  </span>
                </div>

                <div
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                  className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs"
                >
                  <div
                    style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <Hash size={14} strokeWidth={2.4} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. FAC05"
                    value={facultyRollNo}
                    onChange={(e) => setFacultyRollNo(e.target.value.toUpperCase())}
                    style={{ color: '#051F20' }}
                    className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-black uppercase placeholder:text-[#8EB69B] placeholder:font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Faculty Name with Flex Container */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    NAME *
                  </label>
                  {facultyName.trim() && (
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                      <Check size={12} strokeWidth={3} />
                      <span>{getInitials(facultyName, 'FA')}</span>
                    </span>
                  )}
                </div>

                <div
                  style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                  className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs"
                >
                  <div
                    style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <User size={14} strokeWidth={2.4} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    style={{ color: '#051F20' }}
                    className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-bold placeholder:text-[#8EB69B]"
                    required
                  />
                </div>
              </div>

              {/* Department & Designation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    DEPARTMENT *
                  </label>
                  <div
                    style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                    className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs"
                  >
                    <div
                      style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      <Building2 size={14} strokeWidth={2.4} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Geoinformatics Engineering"
                      value={facultyDept}
                      onChange={(e) => setFacultyDept(e.target.value)}
                      style={{ color: '#051F20' }}
                      className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-bold placeholder:text-[#8EB69B]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label style={{ color: '#235347' }} className="block text-xs font-bold uppercase tracking-wider">
                    Designation
                  </label>
                  <div
                    style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
                    className="flex items-center gap-2.5 px-3.5 h-12 rounded-2xl border transition-all focus-within:border-[#163832] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#8EB69B]/20 shadow-2xs"
                  >
                    <div
                      style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    >
                      <Award size={14} strokeWidth={2.4} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Faculty Advisor"
                      value={facultyDesignation}
                      onChange={(e) => setFacultyDesignation(e.target.value)}
                      style={{ color: '#051F20' }}
                      className="flex-1 h-full bg-transparent border-0 outline-none text-xs sm:text-sm font-bold placeholder:text-[#8EB69B]"
                    />
                  </div>
                </div>
              </div>

              {/* Designation Quick Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-xs font-bold text-[#235347]">Presets:</span>
                {designationOptions.map((desig) => (
                  <button
                    key={desig}
                    type="button"
                    onClick={() => setFacultyDesignation(desig)}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#DAF1DE] text-[#163832] hover:bg-[#DAF1DE] transition-colors cursor-pointer shadow-2xs"
                  >
                    {desig}
                  </button>
                ))}
              </div>

              {/* Action Footer */}
              <div
                style={{ borderColor: '#DAF1DE' }}
                className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-[#235347]">
                  <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                  <span>
                    Role clearance:{' '}
                    <strong style={{ color: '#051F20' }} className="font-bold">
                      Faculty Advisor Privilege
                    </strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#163832',
                    color: '#FFFFFF',
                  }}
                  className="min-h-[44px] px-7 py-3 rounded-2xl font-black text-xs sm:text-sm hover:bg-[#235347] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

        {/* ===================================================================== */}
        {/* LIVE DIGITAL CAMPUS SMART PASS (Desktop side-panel & Mobile preview) */}
        {/* ===================================================================== */}
        {showLivePass && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DAF1DE',
              boxShadow: '0 10px 30px -5px rgba(5, 31, 32, 0.05)',
            }}
            className="lg:col-span-5 xl:col-span-4 rounded-3xl p-5 border space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-emerald-700" />
                <span style={{ color: '#051F20' }} className="text-xs font-black uppercase tracking-wider">
                  Live Badge Preview
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40">
                Holographic Pass
              </span>
            </div>

            {/* Premium Digital Membership Card */}
            <div
              style={{
                background: 'linear-gradient(145deg, #051F20 0%, #163832 60%, #235347 100%)',
                boxShadow: '0 12px 28px -6px rgba(5, 31, 32, 0.35)',
              }}
              className="rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden space-y-4 border border-[#8EB69B]/30"
            >
              {/* Card Watermark & Ambient Sheen */}
              <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />

              {/* Card Top: Brand & Antenna */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono tracking-widest text-[#8EB69B] uppercase font-bold">
                    GeoHub Smart Pass
                  </span>
                </div>
                <Radio size={16} className="text-[#8EB69B]/70" />
              </div>

              {/* Profile Monogram & Name */}
              <div className="flex items-center gap-3 pt-1">
                <div
                  style={{ backgroundColor: '#DAF1DE', color: '#051F20' }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shadow-md shrink-0 border border-white/20"
                >
                  {memberType === 'student'
                    ? getInitials(studentName, 'ST')
                    : getInitials(facultyName, 'FA')}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-white truncate leading-tight">
                    {memberType === 'student'
                      ? studentName || 'Student Name'
                      : facultyName || 'Faculty Name'}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#8EB69B] mt-0.5">
                    {memberType === 'student'
                      ? studentRollNo || '24GEO000'
                      : facultyRollNo || 'FAC00'}
                  </p>
                </div>
              </div>

              {/* Pass Metadata Grid */}
              <div className="bg-black/25 backdrop-blur-xs rounded-xl p-3 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#8EB69B] font-medium text-xs">Category:</span>
                  <span className="font-bold text-white capitalize text-xs">{memberType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8EB69B] font-medium text-xs">Department:</span>
                  <span className="font-semibold text-white truncate max-w-[150px] text-xs">
                    {memberType === 'student' ? studentDept : facultyDept}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8EB69B] font-medium text-xs">
                    {memberType === 'student' ? 'Primary Post:' : 'Designation:'}
                  </span>
                  <span className="font-semibold text-white truncate max-w-[150px] text-xs">
                    {memberType === 'student' ? 'Student Member' : facultyDesignation}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-white/10">
                  <span className="text-[#8EB69B] font-medium text-xs">Status:</span>
                  <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-black px-2 py-0.5 rounded-full">
                    Active Verified
                  </span>
                </div>
              </div>

              {/* Digital Code & Email Footprint */}
              <div className="flex items-center justify-between pt-0.5 text-xs font-mono text-[#8EB69B]/90">
                <span className="truncate max-w-[170px]">
                  {memberType === 'student'
                    ? `${studentRollNo.toLowerCase() || 'scholar'}@college.edu`
                    : `${facultyName.toLowerCase().replace(/\s+/g, '.') || 'faculty'}@college.edu`}
                </span>
                <QrCode size={16} className="text-white/60 shrink-0" />
              </div>
            </div>

            {/* Sync Guarantee Note */}
            <div className="p-3 bg-[#F6FBF7] rounded-2xl border border-[#DAF1DE] flex items-center gap-2 text-xs font-semibold text-[#235347]">
              <Sparkles size={14} className="text-amber-600 shrink-0" />
              <span>Instantly synchronized into Logs &amp; Directory.</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. CSV BATCH PROVISIONING QUICK BANNER                                    */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F6FBF7 100%)',
          borderColor: '#DAF1DE',
        }}
        className="rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#163832] shrink-0">
            <FileSpreadsheet size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h4 style={{ color: '#051F20' }} className="text-xs sm:text-sm font-black">
              Batch Provisioning via CSV Spreadsheet?
            </h4>
            <p style={{ color: '#235347' }} className="text-xs font-medium">
              Upload multiple scholar entries at once with automated validation and error preview.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('students' as any)}
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#DAF1DE',
            color: '#163832',
          }}
          className="text-xs font-bold px-3.5 py-2 rounded-xl border shadow-xs hover:bg-[#DAF1DE] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Open Batch Import</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default FeaturesTab;
