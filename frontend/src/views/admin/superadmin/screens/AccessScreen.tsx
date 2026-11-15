import React, { useState } from 'react';
import {
  Key,
  Shield,
  Repeat,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { RoleMeta, OperationDef } from '../types';
import { PermissionRow } from '../components/PermissionRow';
import { ActAsRolePreviewBanner } from '../components/ActAsRolePreviewBanner';
import { botanicalTheme } from '../theme';

export interface AccessScreenProps {
  roles: RoleMeta[];
  selectedRoleKey: string;
  onSelectRole: (roleKey: string) => void;
  operations: OperationDef[];
  rolePermissions: Record<string, Record<string, boolean>>;
  onTogglePermission: (roleKey: string, opKey: string, newState: boolean) => void;
  onEnableAllForRole: (roleKey: string) => void;
  onDisableAllForRole: (roleKey: string) => void;
  onResetToDefault: (roleKey: string) => void;
  onActAsRole: (roleKey: string) => void;
  hasUnsavedChanges?: boolean;
  onSaveChanges?: () => Promise<void>;
  isSaving?: boolean;
}

export const AccessScreen: React.FC<AccessScreenProps> = ({
  roles,
  selectedRoleKey,
  onSelectRole,
  operations,
  rolePermissions,
  onTogglePermission,
  onEnableAllForRole,
  onDisableAllForRole,
  onResetToDefault,
  onActAsRole,
  hasUnsavedChanges = false,
  onSaveChanges,
  isSaving = false,
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const activeRole = roles.find((r) => r.role === selectedRoleKey) || roles[0];

  // Group operations by category
  const categories: Array<{ id: string; label: string; pill: string; count: number }> = [
    { id: 'events', label: 'Events Operations', pill: 'Events (5)', count: 5 },
    { id: 'attendance', label: 'Attendance & Gate Operations', pill: 'Attendance (2)', count: 2 },
    { id: 'finance', label: 'Treasury & Financial Ledger', pill: 'Finance (5)', count: 5 },
    { id: 'docs', label: 'Documentation & Media Gallery', pill: 'Docs (4)', count: 4 },
    { id: 'members', label: 'Member & Squad Directory', pill: 'Members (3)', count: 3 },
    { id: 'system', label: 'Institutional System Settings', pill: 'System (4)', count: 4 },
    { id: 'audits', label: 'Notification & Governance Audits', pill: 'Audits (3)', count: 3 },
  ];

  const displayedCategories =
    selectedCategory === 'all'
      ? categories
      : categories.filter((c) => c.id === selectedCategory);

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const currentRolePerms = rolePermissions[selectedRoleKey] || {};
  const activeCount = operations.filter((op) => currentRolePerms[op.key] !== false).length;

  return (
    <div className="flex flex-col gap-4 animate-fadeIn select-none">
      {/* 1. Header with Role Selector Chips */}
      <div className="p-4 rounded-2xl bg-white border border-[#DAF1DE] shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#DAF1DE]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: botanicalTheme.colors.paleMint,
                color: botanicalTheme.colors.emeraldSlate,
                borderColor: botanicalTheme.colors.softSage,
              }}
            >
              <Key size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#051F20]">
                Role & Permission Matrix
              </h2>
              <p className="text-xs text-[#235347]">
                Granular authority matrix for all 9 canonical platform roles
              </p>
            </div>
          </div>

          {/* Act as Role (Live Preview) Button */}
          <button
            type="button"
            onClick={() => onActAsRole(selectedRoleKey)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer touch-target-44 self-start sm:self-auto shadow-xs active:scale-97"
            style={{ backgroundColor: botanicalTheme.colors.emeraldSlate }}
            title={`Preview portal as ${activeRole.badge}`}
          >
            <Repeat size={14} />
            <span>Act as {activeRole.badge} (Live Preview)</span>
          </button>
        </div>

        {/* 9 Selectable Role Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {roles.map((r) => {
            const isSelected = r.role === selectedRoleKey;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => onSelectRole(r.role)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer touch-target-44 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#163832] text-white shadow-2xs'
                    : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:border-[#8EB69B]'
                }`}
              >
                <Shield size={12} strokeWidth={isSelected ? 2.5 : 1.8} />
                <span>{r.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Operations Authority Actions & Counter */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#051F20]">
            Permissions for {activeRole.badge}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#163832]">
            {activeCount} / {operations.length} Active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEnableAllForRole(selectedRoleKey)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition cursor-pointer touch-target-44"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => onDisableAllForRole(selectedRoleKey)}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition cursor-pointer touch-target-44"
          >
            Disable All
          </button>
          <button
            type="button"
            onClick={() => onResetToDefault(selectedRoleKey)}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold transition cursor-pointer touch-target-44"
          >
            Default
          </button>
        </div>
      </div>

      {/* 3. Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer touch-target-44 ${
            selectedCategory === 'all'
              ? 'bg-[#163832] text-white shadow-2xs'
              : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:border-[#8EB69B]'
          }`}
        >
          All ({operations.length})
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer touch-target-44 ${
                isSelected
                  ? 'bg-[#163832] text-white shadow-2xs'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE] hover:border-[#8EB69B]'
              }`}
            >
              {cat.pill}
            </button>
          );
        })}
      </div>

      {/* 4. 26 Operations in Collapsible Category Sections */}
      <div className="flex flex-col gap-3">
        {displayedCategories.map((cat) => {
          const catOps = operations.filter((op) => op.cat === cat.id);
          const isCollapsed = Boolean(collapsedCategories[cat.id]);
          const activeInCat = catOps.filter((op) => currentRolePerms[op.key] !== false).length;

          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-[#DAF1DE] bg-[#F6FBF7] overflow-hidden shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggleCategoryCollapse(cat.id)}
                className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#DAF1DE]/40 transition touch-target-44"
                aria-expanded={!isCollapsed}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#051F20] uppercase tracking-wider">
                    {cat.label}
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#DAF1DE] text-[#163832]">
                    {activeInCat} / {catOps.length}
                  </span>
                </div>

                <div className="text-[#235347]">
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </button>

              {!isCollapsed && (
                <div className="p-3 pt-0 flex flex-col gap-2">
                  {catOps.map((op) => {
                    const isEnabled = currentRolePerms[op.key] !== false;
                    return (
                      <PermissionRow
                        key={op.key}
                        operation={op}
                        isEnabled={isEnabled}
                        onToggle={(key, state) =>
                          onTogglePermission(selectedRoleKey, key, state)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Floating Save Changes Bar (Only when unsaved edits exist) */}
      {hasUnsavedChanges && onSaveChanges && (
        <aside
          aria-label="Pending Changes Actions"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md p-3 rounded-2xl bg-[#051F20] text-white shadow-xl flex items-center justify-between gap-3 animate-slideUp select-none"
        >
          <div className="flex items-center gap-2 text-xs">
            <Sparkles size={16} className="text-[#DAF1DE] shrink-0" />
            <span className="font-semibold text-[#DAF1DE]">Unsaved matrix changes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onResetToDefault(selectedRoleKey)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onSaveChanges}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#051F20] transition flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: botanicalTheme.colors.paleMint }}
            >
              <Save size={13} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default AccessScreen;
