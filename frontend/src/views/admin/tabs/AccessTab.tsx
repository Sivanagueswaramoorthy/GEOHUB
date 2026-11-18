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
import { Toggle } from '../ui/Toggle';

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
    <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-16 font-sans">
      {/* Page Header (Clean Mint Design System) */}
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              style={{ backgroundColor: '#DAF1DE', borderColor: '#DAF1DE', color: '#163832' }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border"
            >
              <ShieldCheck size={13} className="text-emerald-700" />
              Role Access Control
            </span>
            <span style={{ color: '#235347' }} className="text-xs font-semibold">
              Module Permissions Matrix
            </span>
          </div>
          <h1 style={{ color: '#051F20' }} className="text-xl sm:text-2xl font-black tracking-tight">
            Role Access & Permissions
          </h1>
          <p style={{ color: '#235347' }} className="text-xs sm:text-sm font-medium mt-1">
            Configure permission clearances across all academic hubs for verified roles.
          </p>
        </div>

        {/* Global Batch Buttons for Selected Role */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onSetAllRoleModules(selectedRoleKey, true)}
            style={{ backgroundColor: '#DAF1DE', borderColor: '#DAF1DE', color: '#163832' }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs hover:brightness-95 transition-all cursor-pointer active:scale-95"
          >
            <Check size={14} strokeWidth={2.4} />
            Grant All
          </button>
          <button
            type="button"
            onClick={() => onSetAllRoleModules(selectedRoleKey, false)}
            style={{ backgroundColor: '#F6FBF7', borderColor: '#D9534F', color: '#D9534F' }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs hover:brightness-95 transition-all cursor-pointer active:scale-95"
          >
            <X size={14} strokeWidth={2.4} />
            Decline All
          </button>
        </div>
      </div>

      {/* Role Selector Carousel / Pill Grid */}
      <div
        style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE' }}
        className="cockpit-card rounded-2xl p-4 sm:p-5 border shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <span style={{ color: '#235347' }} className="text-xs font-bold uppercase tracking-wider">
            Select Role to Configure
          </span>
          <span style={{ color: '#163832' }} className="text-xs font-bold">
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
                style={{
                  backgroundColor: isSelected ? '#FFFFFF' : '#F6FBF7',
                  borderColor: isSelected ? '#051F20' : '#DAF1DE',
                  boxShadow: isSelected ? '0 0 0 1px #051F20, 0 2px 4px rgba(45,26,18,0.06)' : undefined,
                }}
                className="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      style={{
                        backgroundColor: isSelected ? '#051F20' : '#DAF1DE',
                        color: isSelected ? '#FFFFFF' : '#235347',
                      }}
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                      {role.badge}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    )}
                  </div>
                  <p style={{ color: '#051F20' }} className="text-xs font-bold truncate">
                    {role.default_name}
                  </p>
                  <p style={{ color: '#235347' }} className="text-xs font-medium truncate mt-0.5">
                    {role.default_post}
                  </p>
                </div>

                <div
                  style={{ borderColor: '#DAF1DE' }}
                  className="mt-2.5 pt-2 border-t flex items-center justify-between text-xs"
                >
                  <span style={{ color: '#235347' }} className="font-medium">Clearance:</span>
                  <span
                    style={{ color: count > 0 ? '#163832' : '#D9534F' }}
                    className="font-bold"
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
      <div
        style={{ backgroundColor: '#FFFFFF', borderColor: '#DAF1DE' }}
        className="rounded-2xl p-3.5 sm:p-4 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: '#051F20', color: '#FFFFFF' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0"
          >
            {selectedRole?.badge.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 style={{ color: '#051F20' }} className="text-sm sm:text-base font-black">
                {selectedRole?.badge} Module Clearance
              </h2>
              <span
                style={{ backgroundColor: '#F6FBF7', borderColor: '#DAF1DE', color: '#235347' }}
                className="text-xs font-bold px-2 py-0.5 rounded-md border"
              >
                {selectedRole?.default_post}
              </span>
            </div>
            <p style={{ color: '#235347' }} className="text-xs font-medium mt-0.5">
              Currently granted access to <strong style={{ color: '#163832' }}>{enabledCount} of {modules.length} modules</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span style={{ color: '#235347' }} className="text-xs font-medium">Toggle switches below to update:</span>
        </div>
      </div>

      {/* Module Hub Grid with Accessible Tactile Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {modules.map((mod) => {
          const isAllowed = permissions[mod.key] ?? true;
          const Icon = MODULE_ICONS[mod.key] || Sliders;

          return (
            <div
              key={mod.key}
              style={{
                backgroundColor: '#F6FBF7',
                borderColor: '#DAF1DE',
              }}
              className="cockpit-card rounded-2xl p-3.5 sm:p-4 border shadow-sm flex items-start justify-between gap-3.5"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  style={{
                    backgroundColor: isAllowed ? '#DAF1DE' : '#F6FBF7',
                    borderColor: isAllowed ? '#DAF1DE' : '#D9534F',
                    color: isAllowed ? '#163832' : '#D9534F',
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
                >
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 style={{ color: '#051F20' }} className="text-xs sm:text-sm font-bold truncate">
                      {mod.label}
                    </h3>
                  </div>
                  <p style={{ color: '#235347' }} className="text-xs font-medium line-clamp-2">
                    {mod.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    {isAllowed ? (
                      <span
                        style={{ backgroundColor: '#DAF1DE', borderColor: '#DAF1DE', color: '#163832' }}
                        className="inline-flex items-center gap-1 text-xs font-bold border px-2 py-0.5 rounded-full"
                      >
                        <CheckCircle2 size={12} className="text-emerald-700" />
                        Access Granted
                      </span>
                    ) : (
                      <span
                        style={{ backgroundColor: '#F6FBF7', borderColor: '#D9534F', color: '#D9534F' }}
                        className="inline-flex items-center gap-1 text-xs font-bold border px-2 py-0.5 rounded-full"
                      >
                        <XCircle size={12} className="text-rose-600" />
                        Access Declined
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Accessible Tactile Toggle Button with Donut Indicator */}
              <div className="shrink-0 pt-1">
                <Toggle
                  checked={isAllowed}
                  onChange={() => onToggleRoleModule(selectedRoleKey, mod.key)}
                  label={`Toggle access to ${mod.label} for ${selectedRole?.badge}`}
                  color="emerald"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccessTab;
