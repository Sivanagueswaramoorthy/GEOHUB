import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  badge?: number | boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'secondary',
  size = 'md',
  badge,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[#051F20] text-white hover:bg-[#163832] shadow-xs',
    secondary: 'bg-white text-[#235347] border border-[#E3EEE6] hover:bg-[#F7FAF8]',
    ghost: 'bg-transparent text-[#235347] hover:bg-[#F0F5F2]',
    danger: 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100',
  };

  return (
    <button
      type="button"
      className={`min-w-[44px] min-h-[44px] w-11 h-11 relative inline-flex items-center justify-center rounded-xl transition-all cursor-pointer focus:outline-none shrink-0 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
      {badge !== undefined && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      )}
    </button>
  );
};

export default IconButton;
