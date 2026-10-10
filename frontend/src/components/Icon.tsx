import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ICONS, IconSizeToken } from '../styles/tokens';

export type IconName = keyof typeof LucideIcons;

export interface IconProps {
  name: string;
  size?: IconSizeToken | number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  container?: 'list' | 'tile' | 'chevron' | 'none';
  containerBg?: string;
  containerBorder?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  'aria-label'?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  color = 'currentColor',
  strokeWidth = ICONS.strokeWidth,
  container = 'none',
  containerBg,
  containerBorder,
  style,
  onClick,
  'aria-label': ariaLabel,
}) => {
  // Map size token to exact pixel values: sm=16, md=20, lg=24, xl=28, 2xl=48
  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? ICONS.sizes.sm
      : size === 'md'
      ? ICONS.sizes.md
      : size === 'lg'
      ? ICONS.sizes.lg
      : size === 'xl'
      ? ICONS.sizes.xl
      : size === '2xl'
      ? ICONS.sizes['2xl']
      : ICONS.sizes.md;

  // Resolve Lucide Component (handle kebab-case or PascalCase)
  const pascalName = name
    .replace(/(^\w|-\w)/g, (clear) => clear.replace('-', '').toUpperCase());

  // @ts-expect-error dynamic lucide component access
  const LucideComponent = (LucideIcons[pascalName] || LucideIcons[name] || LucideIcons.HelpCircle) as React.ComponentType<{
    size: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    strokeLinecap?: 'round' | 'inherit';
    strokeLinejoin?: 'round' | 'inherit';
  }>;

  const renderedSvg = (
    <LucideComponent
      size={numericSize}
      color={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={container === 'none' ? className : undefined}
    />
  );

  if (container === 'none') {
    return renderedSvg;
  }

  // Handle standard container sizes (40px for list, 44px for tile, 36px for chevron)
  const containerDimensions =
    container === 'list'
      ? { width: '40px', height: '40px', borderRadius: '12px' }
      : container === 'tile'
      ? { width: '44px', height: '44px', borderRadius: '12px' }
      : { width: '36px', height: '36px', borderRadius: '999px' };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        ...containerDimensions,
        backgroundColor: containerBg || 'transparent',
        border: containerBorder ? `1px solid ${containerBorder}` : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      {renderedSvg}
    </div>
  );
};
