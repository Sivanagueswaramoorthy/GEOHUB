import React, { createContext, useContext } from 'react';
import { useApp } from '../../context/AppContext';
import { UserModel } from '../../types';
import {
  ModuleId,
  AccessLevel,
  moduleAccess,
  can,
} from '../../core/permissions';

export interface ModuleAccessContextValue {
  moduleId: ModuleId;
  access: AccessLevel;
  readOnly: boolean;
  canApprove: boolean;
  canGrant: boolean;
  user: UserModel | null;
}

const ModuleAccessContext = createContext<ModuleAccessContextValue | null>(null);

export interface UseAccessResult {
  access: AccessLevel;
  readOnly: boolean;
  isHidden: boolean;
  isWrite: boolean;
  canApprove: boolean;
  canGrant: boolean;
}

/**
 * Hook to retrieve effective module access for the current user.
 */
export const useAccess = (
  moduleId: ModuleId,
  eventId?: string,
  overrideUser?: UserModel | null
): UseAccessResult => {
  const { currentUser } = useApp();
  const targetUser = overrideUser !== undefined ? overrideUser : currentUser;

  const access = moduleAccess(targetUser, moduleId, eventId);
  const readOnly = access === 'read';
  const isHidden = access === 'hidden';
  const isWrite = access === 'write';
  const canApprove = can(targetUser?.role, moduleId, 'approve');
  const canGrant = can(targetUser?.role, moduleId, 'grant');

  return {
    access,
    readOnly,
    isHidden,
    isWrite,
    canApprove,
    canGrant,
  };
};

/**
 * Hook to retrieve module context from the nearest ModuleGuard.
 */
export const useModuleContext = (): ModuleAccessContextValue | null => {
  return useContext(ModuleAccessContext);
};

export interface ModuleGuardProps {
  moduleId: ModuleId;
  eventId?: string;
  user?: UserModel | null;
  fallback?: React.ReactNode;
  children:
    | React.ReactNode
    | ((props: {
        readOnly: boolean;
        access: AccessLevel;
        canApprove: boolean;
        canGrant: boolean;
      }) => React.ReactNode);
}

/**
 * ModuleGuard: Blocks hidden routes and passes readOnly context / props to children.
 */
export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  moduleId,
  eventId,
  user,
  fallback,
  children,
}) => {
  const { currentUser } = useApp();
  const targetUser = user !== undefined ? user : currentUser;
  const { access, readOnly, isHidden, canApprove, canGrant } = useAccess(moduleId, eventId, targetUser);

  if (isHidden) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return (
      <div
        className="p-8 text-center bg-white rounded-2xl border border-[#8EB69B]/30 m-4 shadow-sm"
        data-testid="module-guard-restricted"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
          <span className="text-xl font-bold">✕</span>
        </div>
        <h3 className="font-heading font-bold text-[#051F20] text-base">
          Access Restricted
        </h3>
        <p className="text-[12px] text-[#235347] mt-1 max-w-sm mx-auto">
          You do not have permission to access the requested module.
        </p>
      </div>
    );
  }

  const contextValue: ModuleAccessContextValue = {
    moduleId,
    access,
    readOnly,
    canApprove,
    canGrant,
    user: targetUser,
  };

  const renderedContent =
    typeof children === 'function'
      ? children({ readOnly, access, canApprove, canGrant })
      : children;

  return (
    <ModuleAccessContext.Provider value={contextValue}>
      {renderedContent}
    </ModuleAccessContext.Provider>
  );
};

export default ModuleGuard;
