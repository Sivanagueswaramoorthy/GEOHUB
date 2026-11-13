import React from 'react';
import { Mascot, MascotName } from './Mascot';
import { PillButton } from './PillButton';

export interface HeroCardProps {
  title: string;
  subtitle?: string;
  variant?: 'dark' | 'mint' | 'pine';
  mascot?: MascotName;
  mascotSize?: 'md' | 'lg' | 'xl';
  chip?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  title,
  subtitle,
  variant = 'mint',
  mascot,
  mascotSize = 'lg',
  chip,
  children,
  action,
  ctaLabel,
  onCtaClick,
  className = '',
  style,
}) => {
  const isDark = variant === 'dark' || variant === 'pine';

  return (
    <div
      className={`relative overflow-hidden p-6 select-none transition-all ${
        isDark ? 'hero-card-dark' : 'hero-card-mint'
      } ${className}`}
      style={{
        borderRadius: '32px',
        boxShadow: isDark
          ? '0 18px 42px -8px rgba(15, 54, 56, 0.32), 0 8px 20px -4px rgba(15, 54, 56, 0.18)'
          : '0 12px 32px -4px rgba(15, 54, 56, 0.08), 0 4px 12px rgba(15, 54, 56, 0.03)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.12)'
          : '1px solid #E5ECE8',
        ...style,
      }}
    >
      <div className="relative z-10 flex flex-col gap-3">
        {chip && <div>{chip}</div>}

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{
                color: isDark ? '#FFFFFF' : '#0F3638',
                lineHeight: 1.25,
                fontFamily: 'var(--font-family)',
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-xs font-semibold mt-1"
                style={{
                  color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#52705E',
                  opacity: isDark ? 0.9 : 1,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {mascot && (
            <div className="flex-shrink-0">
              <Mascot name={mascot} size={mascotSize} floating />
            </div>
          )}
        </div>

        {children}

        {(action || (ctaLabel && onCtaClick)) && (
          <div className="mt-2 flex items-center gap-2">
            {action}
            {ctaLabel && onCtaClick && (
              <PillButton
                variant={isDark ? 'secondary' : 'primary'}
                onClick={onCtaClick}
              >
                {ctaLabel}
              </PillButton>
            )}
          </div>
        )}
      </div>

      {/* Decorative Mint Halo behind mascot */}
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 w-44 h-44 rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(24, 78, 80, 0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(24, 78, 80, 0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default HeroCard;
