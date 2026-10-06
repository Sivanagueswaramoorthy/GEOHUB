import React from 'react';

export interface OrgBrandingConfig {
  orgName: string;
  wordmarkPart1: string;
  wordmarkPart2: string;
  tagline: string;
  brandGreen: string;
  darkGreen: string;
  mintTint: string;
  mintBorder: string;
  appTitle: string;
}

export const orgConfig: OrgBrandingConfig = {
  orgName: 'Green Eco Organization',
  wordmarkPart1: 'Green Eco',
  wordmarkPart2: 'Organization',
  tagline: 'Environmental Conservation & Geo Club Management',
  brandGreen: '#10B981',
  darkGreen: '#064E3B',
  mintTint: '#E7F9F1',
  mintBorder: '#A7F3D0',
  appTitle: 'GeoHub',
};

/**
 * Official Green Eco Organization HD Mark Icon
 * Used in the rounded card on the Home screen and brand markers
 */
export const OrgLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 38, className = '' }) => (
  <div
    className={`flex items-center justify-center shrink-0 ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${Math.round(size * 0.32)}px`,
      backgroundColor: '#E7F9F1',
      overflow: 'hidden',
      padding: '3px',
    }}
  >
    <img
      src="/geo-hub-logo-hd.png"
      alt={orgConfig.orgName}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  </div>
);
