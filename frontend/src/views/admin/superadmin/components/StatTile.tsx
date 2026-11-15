import React from 'react';
import { Database, GraduationCap, Users, Sliders } from 'lucide-react';
import { botanicalTheme } from '../theme';

export interface StatTilesGridProps {
  databaseLatencyMs: number;
  facultyCount: number;
  studentCount: number;
  onlineModulesCount: number;
  totalModulesCount: number;
}

export const StatTilesGrid: React.FC<StatTilesGridProps> = ({
  databaseLatencyMs,
  facultyCount,
  studentCount,
  onlineModulesCount,
  totalModulesCount,
}) => {
  const tiles = [
    {
      id: 'db',
      label: 'Database',
      value: `Live · ${databaseLatencyMs}ms`,
      sub: 'TiDB Cloud:3306',
      icon: Database,
      bg: '#F6FBF7',
      borderColor: '#DAF1DE',
      iconBg: '#DAF1DE',
      iconColor: '#163832',
      isPulse: true,
    },
    {
      id: 'faculty',
      label: 'Faculty',
      value: `${facultyCount} Advisors`,
      sub: 'Institutional Board',
      icon: GraduationCap,
      bg: '#F6FBF7',
      borderColor: '#DAF1DE',
      iconBg: '#DAF1DE',
      iconColor: '#163832',
    },
    {
      id: 'students',
      label: 'Students',
      value: `${studentCount} Scholars`,
      sub: 'Enrolled Directory',
      icon: Users,
      bg: '#F6FBF7',
      borderColor: '#DAF1DE',
      iconBg: '#DAF1DE',
      iconColor: '#163832',
    },
    {
      id: 'modules',
      label: 'Modules',
      value: `${onlineModulesCount} / ${totalModulesCount} Online`,
      sub: 'Platform Switchboard',
      icon: Sliders,
      bg: '#F6FBF7',
      borderColor: '#DAF1DE',
      iconBg: '#DAF1DE',
      iconColor: '#163832',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 select-none">
      {tiles.map((tile) => {
        const IconComponent = tile.icon;
        return (
          <div
            key={tile.id}
            className="p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-2 shadow-2xs hover:shadow-xs"
            style={{
              backgroundColor: tile.bg,
              borderColor: tile.borderColor,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wider block truncate"
                style={{ color: botanicalTheme.colors.forestMuted }}
              >
                {tile.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: tile.iconBg,
                  color: tile.iconColor,
                  borderColor: botanicalTheme.colors.softSage,
                }}
              >
                <IconComponent size={15} strokeWidth={2.2} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                {tile.isPulse && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                )}
                <span className="text-sm sm:text-base font-extrabold text-[#051F20] tracking-tight truncate block">
                  {tile.value}
                </span>
              </div>
              <span className="text-[11px] text-[#235347] font-medium block truncate mt-0.5">
                {tile.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatTilesGrid;
