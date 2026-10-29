import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightAction,
  multiline = false,
  rows = 3,
  className = '',
  id,
  value,
  disabled,
  ...props
}) => {
  const generatedId = id || `field_${label.toLowerCase().replace(/\s+/g, '_')}`;
  const isFilled = value !== undefined && value !== '';

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label
        htmlFor={generatedId}
        className="text-xs font-bold text-[#051F20] select-none pl-1"
      >
        {label}
      </label>

      <div
        className={`relative flex items-center bg-white border ${
          error ? 'border-[#D9534F] ring-1 ring-[#D9534F]/30' : 'border-[#DAF1DE] focus-within:border-[#8EB69B] focus-within:ring-2 focus-within:ring-[#8EB69B]/30'
        } shadow-[0_2px_8px_rgba(5,31,32,0.04)] transition-all`}
        style={{
          borderRadius: '16px',
          padding: '0 14px',
          minHeight: multiline ? `${rows * 28}px` : '48px',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {leftIcon && (
          <span className="text-[#235347] shrink-0 mr-2.5">{leftIcon}</span>
        )}

        {multiline ? (
          <textarea
            {...(props as any)}
            id={generatedId}
            rows={rows}
            value={value}
            disabled={disabled}
            className="w-full py-3 bg-transparent text-sm text-[#051F20] placeholder-[#8EB69B] outline-none font-medium resize-none"
          />
        ) : (
          <input
            {...props}
            id={generatedId}
            value={value}
            disabled={disabled}
            className="w-full h-full py-3 bg-transparent text-sm text-[#051F20] placeholder-[#8EB69B] outline-none font-medium"
          />
        )}

        {rightAction && <div className="shrink-0 ml-2">{rightAction}</div>}
      </div>

      {error ? (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D9534F] pl-1 animate-fadeIn">
          <AlertCircle size={13} strokeWidth={2.2} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <span className="text-xs font-medium text-[#235347] pl-1">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default FormField;
