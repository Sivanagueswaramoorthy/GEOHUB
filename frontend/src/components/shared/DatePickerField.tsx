import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  min?: string;
  max?: string;
  className?: string;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  min,
  max,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label className="text-xs font-bold text-[#051F20] select-none pl-1">
        {label}
      </label>

      <div
        className={`relative flex items-center bg-white border ${
          error ? 'border-[#D9534F] ring-1 ring-[#D9534F]/30' : 'border-[#DAF1DE] focus-within:border-[#8EB69B] focus-within:ring-2 focus-within:ring-[#8EB69B]/30'
        } shadow-[0_2px_8px_rgba(5,31,32,0.04)] transition-all`}
        style={{
          borderRadius: '16px',
          padding: '0 14px',
          height: '48px',
        }}
      >
        <CalendarIcon size={18} strokeWidth={2} className="text-[#235347] shrink-0 mr-2.5" />
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-[#051F20] outline-none font-medium cursor-pointer"
        />
      </div>

      {error && (
        <span className="text-xs font-semibold text-[#D9534F] pl-1">{error}</span>
      )}
    </div>
  );
};

export default DatePickerField;
