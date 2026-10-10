import React from 'react';
import { AlertCircle } from 'lucide-react';
import { COMPONENTS, TYPOGRAPHY } from '../styles/tokens';

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
  containerStyle?: React.CSSProperties;
}

export const Field: React.FC<FieldProps> = ({
  label,
  helper,
  error,
  leadingIcon,
  trailingIcon,
  className = '',
  containerStyle,
  disabled,
  id,
  ...props
}) => {
  const generatedId = id || (label ? `field-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div
      className={`flex flex-col w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: `${COMPONENTS.forms.fieldGap}px`,
        boxSizing: 'border-box',
        ...containerStyle,
      }}
    >
      {/* Label: 13/18 600 above, 8px gap */}
      {label && (
        <label
          htmlFor={generatedId}
          style={{
            fontSize: `${COMPONENTS.forms.labelFontSize}px`,
            lineHeight: `${COMPONENTS.forms.labelLineHeight}px`,
            fontWeight: COMPONENTS.forms.labelWeight,
            color: '#0F172A',
            marginBottom: `${COMPONENTS.forms.labelGap}px`,
            fontFamily: 'var(--font-family)',
          }}
        >
          {label}
        </label>
      )}

      {/* Input container (48px tall, radius 16) */}
      <div
        className="relative flex items-center w-full transition-all duration-150"
        style={{
          height: `${COMPONENTS.forms.inputHeight}px`,
          minHeight: `${COMPONENTS.forms.inputHeight}px`,
          borderRadius: `${COMPONENTS.forms.inputRadius}px`,
          border: error ? '1px solid #EF4444' : '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          paddingLeft: leadingIcon ? '12px' : '16px',
          paddingRight: trailingIcon ? '12px' : '16px',
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {leadingIcon && (
          <span className="inline-flex shrink-0 mr-2 text-slate-400">{leadingIcon}</span>
        )}

        <input
          id={generatedId}
          disabled={disabled}
          className="w-full h-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: '14px',
            lineHeight: '22px',
            fontWeight: 400,
          }}
          {...props}
        />

        {trailingIcon && (
          <span className="inline-flex shrink-0 ml-2 text-slate-400">{trailingIcon}</span>
        )}
      </div>

      {/* Helper text: 12 below with 4px gap */}
      {helper && !error && (
        <span
          style={{
            fontSize: `${COMPONENTS.forms.helperFontSize}px`,
            lineHeight: '16px',
            fontWeight: 500,
            color: '#64748B',
            marginTop: `${COMPONENTS.forms.helperGap}px`,
            fontFamily: 'var(--font-family)',
          }}
        >
          {helper}
        </span>
      )}

      {/* Error state: 16px icon and red caption */}
      {error && (
        <div
          className="flex items-center gap-2"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: `${COMPONENTS.forms.helperGap}px`,
            color: '#EF4444',
            fontSize: `${COMPONENTS.forms.helperFontSize}px`,
            lineHeight: '16px',
            fontWeight: 500,
            fontFamily: 'var(--font-family)',
          }}
        >
          <AlertCircle size={COMPONENTS.forms.errorIconSize} strokeWidth={1.75} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
