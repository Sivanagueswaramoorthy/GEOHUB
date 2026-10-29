import React from 'react';

export interface AmountInputProps {
  label?: string;
  value: string | number;
  onChange: (value: any) => void;
  currency?: string;
  placeholder?: string;
  error?: string | null;
  className?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  label = 'Amount',
  value,
  onChange,
  currency = '₹',
  placeholder = '0',
  error,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-[#051F20] select-none pl-1">
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center bg-white border ${
          error ? 'border-[#D9534F] ring-1 ring-[#D9534F]/30' : 'border-[#DAF1DE] focus-within:border-[#8EB69B] focus-within:ring-2 focus-within:ring-[#8EB69B]/30'
        } shadow-[0_2px_8px_rgba(5,31,32,0.04)] px-4 transition-all`}
        style={{
          borderRadius: '16px',
          height: '56px',
        }}
      >
        <span className="text-xl font-extrabold text-[#163832] mr-2 select-none">
          {currency}
        </span>

        <input
          type="number"
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            const parsed = raw === '' ? 0 : Number(raw);
            onChange(typeof value === 'number' ? parsed : raw);
          }}
          placeholder={placeholder}
          className="w-full h-full bg-transparent text-xl font-extrabold text-[#051F20] outline-none placeholder:text-[#8EB69B]/60"
        />
      </div>

      {error && (
        <span className="text-xs font-semibold text-[#D9534F] pl-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default AmountInput;
