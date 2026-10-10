import React, { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = 'Password', error, id = 'login-password', disabled, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockActive, setCapsLockActive] = useState(false);

    const handleKeyActivity = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isCapsLock = e.getModifierState && e.getModifierState('CapsLock');
      setCapsLockActive(Boolean(isCapsLock));
      props.onKeyDown?.(e);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isCapsLock = e.getModifierState && e.getModifierState('CapsLock');
      setCapsLockActive(Boolean(isCapsLock));
      props.onKeyUp?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setCapsLockActive(false);
      props.onBlur?.(e);
    };

    const errorId = `${id}-error`;
    const capsLockId = `${id}-capslock`;

    return (
      <div className={`login-field-group ${className}`}>
        <div className="login-label">
          <label htmlFor={id}>{label}</label>
          {capsLockActive && (
            <span
              id={capsLockId}
              className="caps-lock-chip"
              role="status"
              aria-live="polite"
            >
              Caps Lock is on
            </span>
          )}
        </div>

        <div className="login-input-wrapper">
          <span className="login-input-icon" aria-hidden="true">
            <Lock size={20} strokeWidth={1.75} />
          </span>

          <input
            {...props}
            ref={ref}
            id={id}
            type={showPassword ? 'text' : 'password'}
            disabled={disabled}
            autoComplete="current-password"
            className={`login-input ${error ? 'has-error' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={[
              error ? errorId : null,
              capsLockActive ? capsLockId : null,
            ].filter(Boolean).join(' ') || undefined}
            onKeyDown={handleKeyActivity}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
            placeholder={props.placeholder || 'Enter your password'}
          />

          <button
            type="button"
            className="password-toggle-btn"
            disabled={disabled}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
          </button>
        </div>

        {error && (
          <div id={errorId} className="field-error-text" role="alert">
            <AlertCircle size={16} strokeWidth={1.75} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';
