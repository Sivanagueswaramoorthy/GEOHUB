import React from 'react';
import { TopBar, TopBarProps } from './shared/TopBar';

export type HeaderProps = TopBarProps;

/**
 * Global Header delegate - delegates directly to the rebuilt TopBar (Single Source of Truth)
 */
export const Header: React.FC<HeaderProps> = (props) => {
  return <TopBar {...props} />;
};

export default Header;
