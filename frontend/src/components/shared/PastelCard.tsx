import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export type PastelCardVariant = 'white' | 'mint' | 'sage';

export interface PastelCardProps {
  variant?: PastelCardVariant;
  onClick?: () => void;
  showArrow?: boolean;
  arrowIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const PastelCard: React.FC<PastelCardProps> = ({
  variant = 'white',
  onClick,
  showArrow = false,
  arrowIcon,
  children,
  className = '',
  style,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'mint':
        return 'pastel-card-mint';
      case 'sage':
        return 'pastel-card-sage';
      case 'white':
      default:
        return 'pastel-card';
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative overflow-hidden p-5 select-none ${getVariantClass()} ${
        onClick ? 'pastel-card-interactive cursor-pointer' : ''
      } ${className}`}
      style={{
        borderRadius: '24px',
        ...style,
      }}
    >
      {children}

      {showArrow && (
        <div className="absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#163832] shadow-[0_4px_14px_rgba(5,31,32,0.08)] border border-[#DAF1DE] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {arrowIcon || <ArrowUpRight size={18} strokeWidth={2.2} />}
        </div>
      )}
    </div>
  );
};

export default PastelCard;
