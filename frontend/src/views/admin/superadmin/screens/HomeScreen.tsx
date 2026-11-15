import React from 'react';
import { HeroCard } from '../components/HeroCard';
import { StatTilesGrid } from '../components/StatTile';
import { QuickActionChips } from '../components/QuickActionChips';
import { NeedsAttentionCard } from '../components/NeedsAttentionCard';
import { ModuleConfig } from '../types';

export interface HomeScreenProps {
  onRefresh: () => void;
  isSyncing: boolean;
  databaseLatencyMs: number;
  facultyCount: number;
  studentCount: number;
  onlineModulesCount: number;
  totalModulesCount: number;
  pausedModules: ModuleConfig[];
  onResumeModule: (moduleId: string) => void;
  syncError?: string | null;
  onRetrySync?: () => void;
  onNavigateTab: (tab: 'home' | 'control' | 'people' | 'access' | 'system') => void;
  onAddFacultyTrigger: () => void;
  onAddStudentTrigger: () => void;
  onEnableAllModules: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onRefresh,
  isSyncing,
  databaseLatencyMs,
  facultyCount,
  studentCount,
  onlineModulesCount,
  totalModulesCount,
  pausedModules,
  onResumeModule,
  syncError,
  onRetrySync,
  onNavigateTab,
  onAddFacultyTrigger,
  onAddStudentTrigger,
  onEnableAllModules,
}) => {
  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* 1. Hero Card */}
      <HeroCard
        onRefresh={onRefresh}
        isSyncing={isSyncing}
        onlineModulesCount={onlineModulesCount}
        totalModulesCount={totalModulesCount}
      />

      {/* 2. 2x2 Live Stat Tiles */}
      <StatTilesGrid
        databaseLatencyMs={databaseLatencyMs}
        facultyCount={facultyCount}
        studentCount={studentCount}
        onlineModulesCount={onlineModulesCount}
        totalModulesCount={totalModulesCount}
      />

      {/* 3. Quick Action Chips */}
      <QuickActionChips
        onAddFaculty={onAddFacultyTrigger}
        onAddStudent={onAddStudentTrigger}
        onEnableAll={onEnableAllModules}
        onOpenMatrix={() => onNavigateTab('access')}
      />

      {/* 4. Needs Attention Alert Card (Auto-hidden when empty) */}
      <NeedsAttentionCard
        pausedModules={pausedModules}
        onResumeModule={onResumeModule}
        syncError={syncError}
        onRetrySync={onRetrySync}
      />
    </div>
  );
};

export default HomeScreen;
