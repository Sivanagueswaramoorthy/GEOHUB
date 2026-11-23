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
  Building,
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
      // If user has an existing email, pre-fill it (unless it's an unformatted mock string)
      if (currentUser.email && currentUser.email.includes('@')) {
        setEmail(currentUser.email);
      } else if (currentUser.rollNo) {
        setEmail(`${currentUser.rollNo.toLowerCase()}@geohub.edu`);
      }

      // If user has a valid phone, pre-fill it stripped of +91
      if (currentUser.phone) {
        const clean = currentUser.phone.replace(/[^\d]/g, '');
        const last10 = clean.slice(-10);
        if (last10.length === 10) {
          setPhone(last10);
        }
      }
    }
  }, [isOpen, currentUser]);

  // Suppress Escape key dismissal to enforce required submission
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-time-setup-title"
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-[#051F20]/75 backdrop-blur-md animate-fade-in"
      style={{ touchAction: 'none' }}
      onClick={(e) => {
        // Prevent dismissal on backdrop click
        e.stopPropagation();
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_24px_60px_rgba(5,31,32,0.3)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header Accent */}
        <div className="bg-gradient-to-r from-[#163832] via-[#235347] to-[#163832] p-5 text-white flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-[11px] font-bold tracking-wider uppercase text-[#DAF1DE]">
              <Sparkles size={12} className="text-[#8EB69B]" />
              First Time Scholar Setup
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#8EB69B]">
              <ShieldCheck size={14} />
              Required
            </div>
          </div>

          <div>
            <h2
              id="first-time-setup-title"
              className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1"
            >
              Complete Your Profile
            </h2>
            <p className="text-xs text-[#DAF1DE]/90 mt-1 leading-relaxed">
              Welcome, <strong className="text-white font-bold">{currentUser.name}</strong>! Please enter your official contact details to activate your chapter account.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-5 flex flex-col gap-4">
          {/* Scholar Information Dossier (Read-Only Confirmation) */}
          <div className="p-3 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#235347] flex items-center gap-1.5">
                <GraduationCap size={14} className="text-[#163832]" />
                Scholar Identity
              </span>
              <span className="font-bold text-[#163832] bg-[#DAF1DE] px-2 py-0.5 rounded-full text-[11px] border border-[#8EB69B]">
                {currentUser.role ? currentUser.role.toUpperCase() : 'STUDENT'}
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
                  {currentUser.department || 'Geoinformatics'}
                </p>
              </div>
            </div>
          </div>

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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-[#051F20] transition-all outline-hidden ${
                  emailError
                    ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-[#DAF1DE] bg-white focus:border-[#163832] focus:ring-2 focus:ring-[#DAF1DE]'
                }`}
                autoComplete="email"
                required
              />
              {email && !emailError && (
                <CheckCircle2 size={16} className="absolute right-3 top-3 text-[#163832]" />
              )}
            </div>
            {emailError ? (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {emailError}
              </p>
            ) : (
              <p className="text-[11px] text-[#235347]/75">
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
                className={`w-full pl-16 pr-3.5 py-2.5 rounded-xl border text-sm font-mono font-medium text-[#051F20] tracking-wide transition-all outline-hidden ${
                  phoneError
                    ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-[#DAF1DE] bg-white focus:border-[#163832] focus:ring-2 focus:ring-[#DAF1DE]'
                }`}
                autoComplete="tel"
                maxLength={10}
                required
              />
              {phone && phone.length === 10 && !phoneError && (
                <CheckCircle2 size={16} className="absolute right-3 top-3 text-[#163832]" />
              )}
            </div>
            {phoneError ? (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {phoneError}
              </p>
            ) : (
              <p className="text-[11px] text-[#235347]/75">
                Required for SMS OTP authentication, emergency attendance, and squad alerts.
              </p>
            )}
          </div>

          {/* Submission Notice */}
          <div className="p-2.5 rounded-xl bg-[#DAF1DE]/40 border border-[#8EB69B]/40 flex items-start gap-2 text-[11px] text-[#163832]">
            <ShieldCheck size={15} className="text-[#163832] shrink-0 mt-0.5" />
            <span>
              All details are saved securely to your institutional record. This setup popup will <strong>not</strong> appear again on your next login.
            </span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            data-testid="first-time-submit-btn"
            disabled={isSubmitting}
            className="w-full mt-1 py-3 px-4 rounded-2xl bg-[#163832] hover:bg-[#051F20] text-white font-bold text-sm tracking-wide shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            style={{ minHeight: '48px' }}
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
