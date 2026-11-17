import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  QrCode,
  DollarSign,
  Image,
  Users,
  UserCheck,
  Megaphone,
  MessageSquare,
  FileText,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { ModuleConfig, RoleMeta } from '../types';

export interface AccessTabProps {
  modules: ModuleConfig[];
  roles: RoleMeta[];
  roleModuleAccess: Record<string, Record<string, boolean>>;
  onToggleRoleModule: (roleKey: string, moduleKey: string) => void;
  onSetAllRoleModules: (roleKey: string, enabled: boolean) => void;
}

const MODULE_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
> = {
  events: Calendar,
  qr_attendance: QrCode,
  finance: DollarSign,
  archives: Image,
  squads: Users,
  members: UserCheck,
  campaigns: Megaphone,
  forum: MessageSquare,
  documents: FileText,
};

export const AccessTab: React.FC<AccessTabProps> = ({
  modules,
  roles,
  roleModuleAccess,
  onToggleRoleModule,
  onSetAllRoleModules,
}) => {
  // Exclude super_admin from regular role restrictions, or allow viewing with full lock
  const selectableRoles = roles.filter((r) => r.role !== 'super_admin');
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>(selectableRoles[0]?.role || 'coordinator');

  const selectedRole = roles.find((r) => r.role === selectedRoleKey) || selectableRoles[0];
  const permissions = roleModuleAccess[selectedRoleKey] || {};

  const enabledCount = modules.filter((m) => permissions[m.key] ?? true).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShieldCheck size={13} className="text-indigo-600" />
              Role Access Control
            </span>
            <span className="text-xs font-semibold text-slate-500">Module Permissions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Role Access & Permissions
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Click any role to toggle access on or off for respective module hubs.
          </p>
        </div>

        {/* Global Batch Buttons for Selected Role */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onSetAllRoleModules(selectedRoleKey, true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Check size={14} strokeWidth={2.4} />
            Grant All
          </button>
          <button
            type="button"
            onClick={() => onSetAllRoleModules(selectedRoleKey, false)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={2.4} />
            Decline All
          </button>
        </div>
      </div>

      {/* Role Selector Carousel / Pill Grid */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Role to Configure
          </span>
          <span className="text-xs font-semibold text-indigo-600">
            {selectableRoles.length} Roles Registered
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {selectableRoles.map((role) => {
            const isSelected = selectedRoleKey === role.role;
            const rolePerms = roleModuleAccess[role.role] || {};
            const count = modules.filter((m) => rolePerms[m.key] ?? true).length;

            return (
              <button
                key={role.role}
                type="button"
                onClick={() => setSelectedRoleKey(role.role)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {role.badge}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {role.default_name}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 truncate">
                    {role.default_post}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Clearance:</span>
                  <span
                    className={`font-bold ${
                      count > 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {count}/{modules.length} Hubs
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Role Active Banner */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {selectedRole?.badge.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">
                {selectedRole?.badge} Module Clearance
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                {selectedRole?.default_post}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Currently granted access to <strong className="text-emerald-700">{enabledCount} of {modules.length} modules</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Toggle switch to grant or decline:</span>
        </div>
      </div>

      {/* Module Hub Grid with Accessible Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const isAllowed = permissions[mod.key] ?? true;
          const Icon = MODULE_ICONS[mod.key] || Sliders;

          return (
            <div
              key={mod.key}
              className={`bg-white rounded-2xl p-4 border transition-all shadow-sm flex items-start justify-between gap-4 ${
                isAllowed
                  ? 'border-slate-200/90 hover:border-slate-300'
                  : 'border-slate-200 bg-slate-50/50 opacity-90'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    isAllowed
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {mod.label}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-slate-500 line-clamp-2">
                    {mod.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    {isAllowed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Access Granted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded-full">
                        <XCircle size={12} className="text-rose-600" />
                        Access Declined
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Accessible Toggle Button */}
              <div className="shrink-0 pt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAllowed}
                  aria-label={`Toggle access to ${mod.label} for ${selectedRole?.badge}`}
                  onClick={() => onToggleRoleModule(selectedRoleKey, mod.key)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer ${
                    isAllowed ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
                      isAllowed ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    {isAllowed ? (
                      <Check size={12} strokeWidth={3} className="text-emerald-600" />
                    ) : (
                      <X size={12} strokeWidth={3} className="text-slate-400" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccessTab;
