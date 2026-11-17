import React from 'react';
import { TopBar, TopBarProps } from '../shared/TopBar';

export interface SuperAdminTopNavProps extends TopBarProps {
  latencyMs?: number;
  onOpenNotifications?: () => void;
}

/**
 * SuperAdmin TopBar - rebuilt to match the standard canonical TopBar (as like in Faculty role).
 * Single Source of Truth for GeoHub navigation header.
 */
export const SuperAdminTopNav: React.FC<SuperAdminTopNavProps> = ({
  onOpenNotifications,
  onNotifications,
  ...props
}) => {
  return (
    <TopBar
      onNotifications={onOpenNotifications || onNotifications}
      {...props}
    />
  );
};

export default SuperAdminTopNav;
