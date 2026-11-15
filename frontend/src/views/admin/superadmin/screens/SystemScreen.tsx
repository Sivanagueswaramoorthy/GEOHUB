import React from 'react';
import { DatabaseTelemetryCard } from '../components/DatabaseTelemetryCard';
import { AuditLogList } from '../components/AuditLogList';
import { BackupExportPanel } from '../components/BackupExportPanel';
import { DangerZone } from '../components/DangerZone';

export interface SystemScreenProps {
  latencyMs: number;
  onTestConnection: () => Promise<void>;
  lastSyncTime: string;
  onConfirmPurge: () => Promise<void>;
  isPurging?: boolean;
}

export const SystemScreen: React.FC<SystemScreenProps> = ({
  latencyMs,
  onTestConnection,
  lastSyncTime,
  onConfirmPurge,
  isPurging = false,
}) => {
  return (
    <div className="flex flex-col gap-4 animate-fadeIn select-none">
      {/* 1. Database Diagnostics Card */}
      <DatabaseTelemetryCard
        latencyMs={latencyMs}
        onTestConnection={onTestConnection}
        lastSyncTime={lastSyncTime}
      />

      {/* 2. Audit Log Trail */}
      <AuditLogList />

      {/* 3. Backup and Export Panel */}
      <BackupExportPanel />

      {/* 4. Danger Zone (Collapsed by default, requires typing CONFIRM) */}
      <DangerZone
        onConfirmPurge={onConfirmPurge}
        isPurging={isPurging}
      />
    </div>
  );
};

export default SystemScreen;
