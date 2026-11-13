import React, { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface PasswordFieldProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  autoComplete?: string;
  className?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      id = 'login-password',
      name = 'password',
      value = '',
      onChange,
      onBlur,
      onFocus,
      onVisibilityChange,
      error,
      disabled = false,
      placeholder = 'Enter your password',
      label = 'Password',
      autoComplete = 'current-password',
      className = '',
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [capsLockActive, setCapsLockActive] = useState(false);

    const handleToggle = () => {
      const next = !showPassword;
      setShowPassword(next);
      onVisibilityChange?.(next);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setCapsLockActive(false);
      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState && typeof e.getModifierState === 'function') {
        setCapsLockActive(e.getModifierState('CapsLock'));
      }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState && typeof e.getModifierState === 'function') {
        setCapsLockActive(e.getModifierState('CapsLock'));
      }
    };

    return (
      <div className={`auth-field-group ${className}`}>
        {/* Label and CapsLock chip */}
        <div className="flex items-center justify-between pl-0.5">
          <label htmlFor={id} className="auth-field-label">
            {label}
          </label>
          {capsLockActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
              Caps Lock is on
            </span>
          )}
        </div>

        {/* Input container with direct Lock icon and Eye toggle */}
        <div
          className={`auth-input-box ${
            error ? 'has-error' : isFocused ? 'is-focused' : ''
          }`}
        >
          <Lock size={19} className="text-[#8EB69B] shrink-0" strokeWidth={1.8} aria-hidden="true" />

          <input
            ref={ref}
            id={id}
            name={name}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-label={label}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />

          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="p-1 rounded-lg text-[#8EB69B] hover:text-[#051F20] hover:bg-[#DAF1DE]/40 transition-colors focus:outline-none shrink-0 cursor-pointer"
          >
            {showPassword ? (
              <EyeOff size={19} strokeWidth={1.8} />
            ) : (
              <Eye size={19} strokeWidth={1.8} />
            )}
          </button>
        </div>

        {error && (
          <div
            id={`${id}-error`}
            role="alert"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#D9534F] mt-0.5 pl-1"
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';
export default PasswordField;
