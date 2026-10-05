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
 * Standard Leaf / Globe Mark SVG Icon
 * Used in the rounded card on the Home screen and brand markers
 */
export const OrgLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 28, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="40" height="40" rx="12" fill="#E7F9F1" />
    {/* Globe contour */}
    <circle cx="20" cy="20" r="13" stroke="#10B981" strokeWidth="2" strokeDasharray="1 3" opacity="0.6" />
    <path
      d="M20 7C14.5 12 11 16 11 21C11 26 15 29.5 20 29.5C25 29.5 29 26 29 21C29 16 25.5 12 20 7Z"
      fill="#10B981"
    />
    {/* Leaf central vein */}
    <path
      d="M20 12V26M20 16L15.5 19.5M20 20L24.5 22"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
