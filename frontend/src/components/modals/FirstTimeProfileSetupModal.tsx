import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface FirstTimeProfileSetupModalProps {
  isOpen: boolean;
}

export const FirstTimeProfileSetupModal: React.FC<FirstTimeProfileSetupModalProps> = ({ isOpen }) => {
  const { currentUser, completeProfileSetup } = useApp();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize values from currentUser whenever the modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      if (currentUser.email && currentUser.email.includes('@')) {
        setEmail(currentUser.email);
      } else if (currentUser.rollNo) {
        setEmail(`${currentUser.rollNo.toLowerCase()}@geohub.edu`);
      }

      if (currentUser.phone) {
        const clean = currentUser.phone.replace(/[^\d]/g, '');
        const last10 = clean.slice(-10);
        if (last10.length === 10) {
          setPhone(last10);
        }
      }
    }
  }, [isOpen, currentUser]);

  // Suppress Escape key dismissal to enforce required submission for new scholars
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown, true);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const validateEmail = (val: string): boolean => {
    const clean = val.trim();
    if (!clean) {
      setEmailError('Email ID is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      setEmailError('Please enter a valid email address (e.g., scholar@college.edu)');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePhone = (val: string): boolean => {
    const cleanDigits = val.replace(/\D/g, '');
    if (!cleanDigits) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (cleanDigits.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (phoneError) {
      validatePhone(digitsOnly);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      validateEmail(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);

    if (!isEmailValid || !isPhoneValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = `+91 ${phone.replace(/\D/g, '')}`;
      const cleanEmail = email.trim().toLowerCase();
      await completeProfileSetup(cleanPhone, cleanEmail);
    } catch {
      // handled inside AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const scholarRoleDisplay = currentUser.role ? currentUser.role.toUpperCase() : 'STUDENT';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-time-setup-title"
      data-testid="modal-first-time-setup"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-[#051F20]/75 backdrop-blur-md overflow-y-auto select-none transition-all duration-300 animate-fadeIn"
      style={{
        zIndex: 99999,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        touchAction: 'pan-y',
      }}
      onClick={(e) => {
        // Enforce required submission: prevent dismissal on backdrop click
        e.stopPropagation();
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(5,31,32,0.35)] border border-[#DAF1DE] relative overflow-hidden flex flex-col gap-4 text-[#051F20]"
        style={{
          animation: 'geohubModalPopIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft Ambient Radiance */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#DAF1DE] rounded-full blur-2xl opacity-70 pointer-events-none" />
        <div className="absolute -top-8 -left-8 w-28 h-28 bg-[#8EB69B]/20 rounded-full blur-xl opacity-60 pointer-events-none" />

        {/* Top Header Pill Bar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Profile Verification</span>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            Required
          </span>
        </div>

        {/* Hero Section: Title & Icon */}
        <div className="flex items-center gap-3.5 pt-1 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]/40 flex items-center justify-center shadow-xs shrink-0">
            <GraduationCap size={22} className="text-[#163832]" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h2
              id="first-time-setup-title"
              className="text-base sm:text-lg font-bold text-[#051F20] truncate leading-snug"
            >
              Complete Your Profile
            </h2>
            <p className="text-xs text-[#235347] font-medium truncate">
              Welcome, <strong className="text-[#051F20] font-bold">{currentUser.name}</strong>! Enter contact details.
            </p>
          </div>
        </div>

        {/* Scholar Information Dossier (Read-Only Confirmation) */}
        <div className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-2 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#235347] flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#163832]" />
              Scholar Identity
            </span>
            <span className="font-bold text-[#163832] bg-[#DAF1DE] px-2 py-0.5 rounded-full text-[10px] border border-[#8EB69B]/50">
              {scholarRoleDisplay}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#DAF1DE]/60 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#235347]/75">Reg Number</span>
              <p className="font-mono font-bold text-[#051F20]">{currentUser.rollNo || 'Not Assigned'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#235347]/75">Department</span>
              <p className="font-semibold text-[#051F20] truncate" title={currentUser.department || 'Geoinformatics'}>
                {currentUser.department || 'Geoinformatics Engineering'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5 relative z-10">
          {/* Email ID Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="setup-email-input" className="text-xs font-bold text-[#051F20] flex items-center gap-1.5">
              <Mail size={14} className="text-[#163832]" />
              Official Email ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="setup-email-input"
                data-testid="first-time-email-input"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => validateEmail(email)}
                placeholder="e.g. 24geo181@geohub.edu"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium text-[#051F20] transition-all outline-hidden min-h-[44px] ${
                  emailError
                    ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-[#DAF1DE] bg-white focus:border-[#163832] focus:ring-2 focus:ring-[#DAF1DE]'
                }`}
                autoComplete="email"
                required
              />
              {email && !emailError && (
                <CheckCircle2 size={16} className="absolute right-3 top-3 text-emerald-600" />
              )}
            </div>
            {emailError ? (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {emailError}
              </p>
            ) : (
              <p className="text-[10px] sm:text-[11px] text-[#235347]/75">
                Used for official notifications, attendance certificates, and workshop passes.
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="setup-phone-input" className="text-xs font-bold text-[#051F20] flex items-center gap-1.5">
              <Phone size={14} className="text-[#163832]" />
              Official Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-[#235347] border-r border-[#DAF1DE] pr-2.5 py-1">
                <span>+91</span>
              </div>
              <input
                id="setup-phone-input"
                data-testid="first-time-phone-input"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onBlur={() => validatePhone(phone)}
                placeholder="98765 43210"
                className={`w-full pl-16 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-medium text-[#051F20] tracking-wide transition-all outline-hidden min-h-[44px] ${
                  phoneError
                    ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-[#DAF1DE] bg-white focus:border-[#163832] focus:ring-2 focus:ring-[#DAF1DE]'
                }`}
                autoComplete="tel"
                maxLength={10}
                required
              />
              {phone && phone.length === 10 && !phoneError && (
                <CheckCircle2 size={16} className="absolute right-3 top-3 text-emerald-600" />
              )}
            </div>
            {phoneError ? (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {phoneError}
              </p>
            ) : (
              <p className="text-[10px] sm:text-[11px] text-[#235347]/75">
                Required for SMS OTP authentication, emergency attendance, and squad alerts.
              </p>
            )}
          </div>

          {/* Submission Notice */}
          <div className="p-2.5 rounded-xl bg-[#DAF1DE]/40 border border-[#8EB69B]/40 flex items-start gap-2 text-[10.5px] sm:text-[11px] text-[#163832]">
            <ShieldCheck size={14} className="text-[#163832] shrink-0 mt-0.5" />
            <span>
              All details are saved securely to your institutional record. This setup popup will <strong>not</strong> appear again on your next login.
            </span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            data-testid="first-time-submit-btn"
            disabled={isSubmitting}
            className="w-full mt-1 h-12 rounded-2xl bg-[#163832] hover:bg-[#0B2B26] active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Activating Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstTimeProfileSetupModal;
