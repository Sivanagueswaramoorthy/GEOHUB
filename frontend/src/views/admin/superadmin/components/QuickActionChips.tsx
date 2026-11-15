import React from 'react';
import { UserPlus, GraduationCap, CheckCircle2, Key } from 'lucide-react';
import { botanicalTheme } from '../theme';

export interface QuickActionChipsProps {
  onAddFaculty: () => void;
  onAddStudent: () => void;
  onEnableAll: () => void;
  onOpenMatrix: () => void;
}

export const QuickActionChips: React.FC<QuickActionChipsProps> = ({
  onAddFaculty,
  onAddStudent,
  onEnableAll,
  onOpenMatrix,
}) => {
  const actions = [
    {
      id: 'add-faculty',
      label: '+ Provision Faculty',
      icon: GraduationCap,
      onClick: onAddFaculty,
    },
    {
      id: 'add-student',
      label: '+ Onboard Student',
      icon: UserPlus,
      onClick: onAddStudent,
    },
    {
      id: 'enable-all',
      label: 'Enable All',
      icon: CheckCircle2,
      onClick: onEnableAll,
    },
    {
      id: 'open-matrix',
      label: 'Open Matrix',
      icon: Key,
      onClick: onOpenMatrix,
    },
  ];

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#235347]">
          Quick Actions
        </h2>
        <span className="text-[11px] text-[#8EB69B] font-semibold">Master Shortcuts</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map((act) => {
          const IconComponent = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="p-3 rounded-2xl bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all duration-150 flex items-center gap-2.5 cursor-pointer touch-target-44 text-left shadow-2xs active:scale-97"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: botanicalTheme.colors.paleMint,
                  color: botanicalTheme.colors.emeraldSlate,
                  borderColor: botanicalTheme.colors.softSage,
                }}
              >
                <IconComponent size={16} strokeWidth={2.2} />
              </div>
              <span className="text-xs font-bold text-[#051F20] tracking-tight truncate">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionChips;
