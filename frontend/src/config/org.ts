import React from 'react';

export interface OrgBrandingConfig {
  orgName: string;
  wordmarkPart1: string;
  wordmarkPart2: string;
  tagline: string;
  department: string;
  brandGreen: string;
  darkGreen: string;
  mintTint: string;
  mintBorder: string;
  appTitle: string;
  logoUrl: string;
  version: string;
}

export const orgConfig: OrgBrandingConfig = {
  orgName: 'Green Eco Organization',
  wordmarkPart1: 'Green Eco',
  wordmarkPart2: 'Organization',
  tagline: 'Your club, organized.',
  department: 'Department of Geography',
  brandGreen: '#235347',
  darkGreen: '#0B2B26',
  mintTint: '#DAF1DE',
  mintBorder: '#8EB69B',
  appTitle: 'GeoHub',
  logoUrl: './geo-hub-logo-hd.png',
  version: 'v2.4.0',
};

/**
 * Official Green Eco Organization HD Mark Icon
 * Used in the rounded card on the Home screen and brand markers
 */
export const OrgLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 38, className = '' }) =>
  React.createElement(
    'div',
    {
      className: `flex items-center justify-center shrink-0 ${className}`,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.32)}px`,
        backgroundColor: '#DAF1DE',
        overflow: 'hidden',
        padding: '3px',
      },
    },
    React.createElement('img', {
      src: './geo-hub-logo-hd.png',
      alt: orgConfig.orgName,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
      },
    })
  );
