import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { MEDIA } from '../styles/tokens';

export type ImageVariant = 'hero' | 'event' | 'avatar' | 'logo' | 'gallery' | 'default';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  variant?: ImageVariant;
  avatarSize?: 32 | 40 | 48 | 72;
  fallbackInitials?: string;
  isOnline?: boolean;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  aspectRatio?: string;
  children?: React.ReactNode; // Optional overlay content
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  variant = 'default',
  avatarSize = 48,
  fallbackInitials,
  isOnline = false,
  priority = false,
  className = '',
  style,
  aspectRatio,
  children,
  ...props
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback on error or empty src
  if (hasError || !src) {
    if (variant === 'avatar' && fallbackInitials) {
      return (
        <div
          className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold select-none ${className}`}
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            backgroundColor: '#E7F9F1',
            border: '1.5px solid #A7F3D0',
            color: '#065F46',
            fontSize: `${Math.round(avatarSize * 0.36)}px`,
            fontWeight: 600,
            ...style,
          }}
        >
          <span>{fallbackInitials}</span>
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 rounded-full"
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#10B981',
                boxShadow: '0 0 0 2px #FFFFFF',
              }}
            />
          )}
        </div>
      );
    }

    return (
      <div
        className={`relative inline-flex items-center justify-center bg-slate-100 text-slate-400 overflow-hidden ${className}`}
        style={{
          aspectRatio: aspectRatio || (variant === 'hero' || variant === 'event' ? '16 / 9' : '1 / 1'),
          borderRadius: variant === 'hero' ? '24px' : variant === 'avatar' ? '999px' : '16px',
          ...style,
        }}
        role="img"
        aria-label={alt || 'Image placeholder'}
      >
        <ImageIcon size={24} className="text-slate-400" />
      </div>
    );
  }

  // Variant styling rules
  let containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    display: 'block',
  };

  let imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    objectPosition: 'center',
    transition: 'opacity 0.2s ease',
    opacity: hasLoaded ? 1 : 0,
  };

  if (variant === 'hero') {
    containerStyle = {
      ...containerStyle,
      aspectRatio: '16 / 9',
      borderRadius: '24px',
      backgroundColor: '#0F172A',
    };
  } else if (variant === 'event') {
    containerStyle = {
      ...containerStyle,
      aspectRatio: '16 / 9',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
      backgroundColor: '#F1F5F9',
    };
  } else if (variant === 'avatar') {
    containerStyle = {
      ...containerStyle,
      width: `${avatarSize}px`,
      height: `${avatarSize}px`,
      borderRadius: '999px',
      flexShrink: 0,
      backgroundColor: '#F1F5F9',
    };
  } else if (variant === 'logo') {
    containerStyle = {
      ...containerStyle,
      width: '72px',
      height: '72px',
      borderRadius: '22px',
      padding: '12px',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
      border: '1px solid #EEF1F5',
    };
    imgStyle.objectFit = 'contain';
  } else if (variant === 'gallery') {
    containerStyle = {
      ...containerStyle,
      aspectRatio: '1 / 1',
      borderRadius: '16px',
      backgroundColor: '#F1F5F9',
    };
  }

  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  }

  return (
    <div className={`image-container ${className}`} style={{ ...containerStyle, ...style }}>
      {/* Neutral Skeleton while loading */}
      {!hasLoaded && (
        <div
          className="absolute inset-0 bg-slate-100 animate-pulse"
          style={{ position: 'absolute', inset: 0, backgroundColor: '#F1F5F9' }}
        />
      )}

      <img
        src={src}
        alt={alt}
        loading={priority || variant === 'hero' ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setHasLoaded(true)}
        onError={() => setHasError(true)}
        style={imgStyle}
        {...props}
      />

      {/* Hero dark gradient overlay guaranteeing AA contrast */}
      {variant === 'hero' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            position: 'absolute',
            inset: 0,
            background: MEDIA.hero.overlay,
          }}
        />
      )}

      {/* Online indicator for avatars */}
      {variant === 'avatar' && isOnline && (
        <span
          className="absolute bottom-0 right-0 rounded-full"
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: '10px',
            height: '10px',
            backgroundColor: '#10B981',
            boxShadow: '0 0 0 2px #FFFFFF',
          }}
        />
      )}

      {/* Optional Overlay / Badge Slot */}
      {children}
    </div>
  );
};
