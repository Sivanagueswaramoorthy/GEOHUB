import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export interface EffectiveModulesState {
  modules: Record<string, boolean>;
  loading: boolean;
  isModuleEnabled: (key: string) => boolean;
  refresh: () => Promise<void>;
}

export function useEffectiveModules(): EffectiveModulesState {
  const { currentUser, isAuthenticated } = useApp();
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const fetchModules = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      setModules({});
      return;
    }

    if (currentUser.role === 'super_admin') {
      // SuperAdmin always has effective access to everything
      setModules({
        events: true,
        tasks: true,
        approvals: true,
        gallery: true,
        attendance: true,
        finance: true,
        inventory: true,
        forum: true,
        reports: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.getEffectiveModules();
      if (res && res.modules) {
        setModules(res.modules);
      }
    } catch {
      // Fallback: all enabled by default in offline/local demo mode
      setModules({
        events: true,
        tasks: true,
        approvals: true,
        gallery: true,
        attendance: true,
        finance: true,
        inventory: true,
        forum: true,
        reports: true,
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const isModuleEnabled = useCallback(
    (key: string): boolean => {
      if (currentUser?.role === 'super_admin') return true;
      if (typeof modules[key] === 'boolean') {
        return modules[key];
      }
      return true; // Default permissive fallback
    },
    [currentUser?.role, modules]
  );

  return {
    modules,
    loading,
    isModuleEnabled,
    refresh: fetchModules,
  };
}
