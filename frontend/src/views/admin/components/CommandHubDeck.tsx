import React from 'react';
import {
  Sliders,
  Megaphone,
  Lock,
  GraduationCap,
  UserPlus,
  Key,
} from 'lucide-react';
import { ModuleConfig } from '../types';

interface Props {
  platformModules: Record<string, boolean>;
  moduleConfigs: ModuleConfig[];
  toggleModule: (id: string, enabled: boolean) => void;
  toggleAllModules: (enabled: boolean) => void;
  onOpenBroadcast: () => void;
  onToggleMaintenanceFreeze: () => void;
  onNavigateToDeck: (deck: 'faculty' | 'students' | 'matrix') => void;
  onOpenAddFaculty: () => void;
  onOpenAddStudent: () => void;
  isHubOnly: boolean;
}

export const CommandHubDeck: React.FC<Props> = ({
  platformModules,
  moduleConfigs,
  toggleModule,
  toggleAllModules,
  onOpenBroadcast,
  onToggleMaintenanceFreeze,
  onNavigateToDeck,
  onOpenAddFaculty,
  onOpenAddStudent,
  isHubOnly,
}) => {
  const activeCount = Object.values(platformModules || {}).filter(Boolean).length;
  const isAllActive = activeCount === moduleConfigs.length;
  const isAnyPaused = Object.values(platformModules || {}).some((v) => v === false);

  return (
    <div className="mb-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#DAF1DE] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
            <Sliders size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#051F20] leading-tight">
                Platform Module Switchboard
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                {activeCount} / {moduleConfigs.length} Active
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isAllActive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {isAllActive ? '● 100% Operational' : `● Degraded (${moduleConfigs.length - activeCount} paused)`}
              </span>
            </div>
            <p className="text-xs text-[#235347]">
              Toggle respective club modules online or pause them across the platform for scheduled maintenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={onOpenBroadcast}
            className="px-2.5 py-1.5 rounded-xl bg-[#DAF1DE] hover:bg-[#8EB69B]/40 text-[#163832] text-[11px] font-bold border border-[#8EB69B]/40 transition cursor-pointer flex items-center gap-1 touch-target-44"
          >
            <Megaphone size={12} />
            <span>Broadcast Alert</span>
          </button>
          <button
            type="button"
            onClick={onToggleMaintenanceFreeze}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 touch-target-44 ${
              isAnyPaused
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#235347] border-[#DAF1DE]'
            }`}
          >
            <Lock size={12} />
            <span>{isAnyPaused ? 'Unfreeze' : 'Freeze'}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleAllModules(true)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition cursor-pointer touch-target-44"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => toggleAllModules(false)}
            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition cursor-pointer touch-target-44"
          >
            Disable All
          </button>
        </div>
      </div>

      {/* Paused Banner */}
      {isAnyPaused && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{moduleConfigs.length - activeCount} module(s) paused</span>
          </div>
          <button
            type="button"
            onClick={() => toggleAllModules(true)}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
          >
            Resume All
          </button>
        </div>
      )}

      {/* 9 Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {moduleConfigs.map((mod) => {
          const isEnabled = platformModules?.[mod.id] !== false;
          const IconComponent = mod.icon;
          return (
            <div
              key={mod.id}
              className={`p-3.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3 ${
                isEnabled
                  ? 'bg-[#F6FBF7] border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.02)] hover:border-[#8EB69B]'
                  : 'bg-amber-50/60 border-amber-200/90 shadow-[0_2px_8px_rgba(217,119,6,0.04)]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isEnabled
                      ? 'bg-[#DAF1DE] text-[#163832] border-[#8EB69B]/40'
                      : 'bg-amber-100 text-amber-800 border-amber-300/40'
                  }`}
                >
                  <IconComponent size={18} strokeWidth={2.2} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#051F20] leading-snug break-words">
                  {mod.name}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-[#DAF1DE]/70">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isEnabled
                      ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100/90 text-amber-800 border-amber-300'
                  }`}
                >
                  {isEnabled ? '● LIVE' : '⏸ PAUSED'}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={`Toggle ${mod.name} ${isEnabled ? 'Off' : 'On'}`}
                  onClick={() => toggleModule(mod.id, !isEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none touch-target-44 items-center ${
                    isEnabled ? 'bg-[#163832]' : 'bg-gray-300'
                  }`}
                  title={`Click to turn ${mod.name} ${isEnabled ? 'OFF' : 'ON'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts inside Command Hub */}
      {isHubOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-[#DAF1DE]">
          <button
            type="button"
            onClick={() => {
              onNavigateToDeck('faculty');
              onOpenAddFaculty();
            }}
            className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-2.5 transition cursor-pointer text-left shadow-2xs hover:bg-[#DAF1DE]/40 touch-target-44"
          >
            <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center font-bold shrink-0">
              <GraduationCap size={16} />
            </div>
            <span className="text-xs font-bold text-[#051F20]">+ Provision Faculty</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateToDeck('students');
              onOpenAddStudent();
            }}
            className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-2.5 transition cursor-pointer text-left shadow-2xs hover:bg-[#DAF1DE]/40 touch-target-44"
          >
            <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center font-bold shrink-0">
              <UserPlus size={16} />
            </div>
            <span className="text-xs font-bold text-[#051F20]">+ Onboard Student</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToDeck('matrix')}
            className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-2.5 transition cursor-pointer text-left shadow-2xs hover:bg-[#DAF1DE]/40 touch-target-44"
          >
            <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center font-bold shrink-0">
              <Key size={16} />
            </div>
            <span className="text-xs font-bold text-[#051F20]">Role Permissions</span>
          </button>
        </div>
      )}
    </div>
  );
};
