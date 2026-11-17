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
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 font-bold',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-bold',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 font-bold',
    danger: 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold',
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
