import React from 'react';
import {
  Shield,
  Key,
  User,
  Mail,
  Lock,
  Sparkles,
  Check,
  Copy,
  Repeat,
  SlidersHorizontal,
  RotateCcw,
  X,
  Calendar,
  Coins,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import { RoleMeta, OperationDef } from '../types';

interface Props {
  roles: RoleMeta[];
  selectedRoleKey: string;
  setSelectedRoleKey: (key: string) => void;
  activeRoleMeta: RoleMeta;
  nameInput: string;
  setNameInput: (val: string) => void;
  rollInput: string;
  setRollInput: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  statusInput: string;
  setStatusInput: (val: string) => void;
  copiedPass: boolean;
  onGeneratePassword: () => void;
  onCopyPassword: () => void;
  onSaveCredentials: () => Promise<void>;
  savingCredentials: boolean;
  onActAsRole: () => void;

  operations: OperationDef[];
  filteredOperations: OperationDef[];
  currentRolePermissions: Record<string, boolean>;
  activeCount: number;
  selectedCat: string;
  setSelectedCat: (cat: any) => void;
  onToggleOperation: (opKey: string) => Promise<void>;
  onEnableAll: () => Promise<void>;
  onDisableAll: () => Promise<void>;
  onResetToDefault: () => Promise<void>;
  onApplySecurityPreset: (preset: 'baseline' | 'event_sprint' | 'exam_hiatus') => Promise<void>;
  togglingOperation: boolean;
}

export const RoleMatrixDeck: React.FC<Props> = ({
  roles,
  selectedRoleKey,
  setSelectedRoleKey,
  activeRoleMeta,
  nameInput,
  setNameInput,
  rollInput,
  setRollInput,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  statusInput,
  setStatusInput,
  copiedPass,
  onGeneratePassword,
  onCopyPassword,
  onSaveCredentials,
  savingCredentials,
  onActAsRole,
  operations,
  filteredOperations,
  currentRolePermissions,
  activeCount,
  selectedCat,
  setSelectedCat,
  onToggleOperation,
  onEnableAll,
  onDisableAll,
  onResetToDefault,
  onApplySecurityPreset,
  togglingOperation,
}) => {
  return (
    <div>
      {/* Role Selection Horizontal Bar */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-[#163832] uppercase tracking-wider mb-2">
          Select Official Chapter Role
        </label>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {roles.map((r) => {
            const isSelected = r.role === selectedRoleKey;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => setSelectedRoleKey(r.role)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 touch-target-44 active:scale-95 border ${
                  isSelected
                    ? 'bg-[#163832] text-white border-[#163832] shadow-sm'
                    : 'bg-white text-[#163832] border-[#DAF1DE] hover:border-[#8EB69B] hover:bg-[#F6FBF7]'
                }`}
              >
                <Shield size={14} className={isSelected ? 'text-[#8EB69B]' : 'text-[#235347]'} />
                <span>{r.badge}</span>
                {r.is_registered && (
                  <span
                    className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#8EB69B]' : 'bg-emerald-500'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column: Role Credentials Card (5 cols) */}
        <div className="md:col-span-5 bg-white border border-[#DAF1DE] rounded-2xl p-4 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-[#DAF1DE] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                <Key size={16} strokeWidth={2.4} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#051F20] leading-tight">Role Credentials</h2>
                <p className="text-xs text-[#235347]">Account & login access</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
              {activeRoleMeta.badge}
            </span>
          </div>

          {/* Scholar Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
              <User size={13} className="text-[#235347]" /> Scholar Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] transition"
            />
          </div>

          {/* Roll No / Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
              <Shield size={13} className="text-[#235347]" /> Username / Roll Number
            </label>
            <input
              type="text"
              value={rollInput}
              onChange={(e) => setRollInput(e.target.value)}
              placeholder="e.g. 21GEO001 or FAC01"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#051F20] uppercase focus:outline-none focus:border-[#235347] transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
              <Mail size={13} className="text-[#235347]" /> Institutional Email
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="scholar@college.edu"
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] transition"
            />
          </div>

          {/* Password with Generator & Copy */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#163832] flex items-center gap-1.5">
                <Lock size={13} className="text-[#235347]" /> Set / Change Password
              </label>
              <button
                type="button"
                onClick={onGeneratePassword}
                className="text-xs font-bold text-[#235347] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles size={12} /> Generate
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Leave blank to keep unchanged"
                className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] transition"
              />
              <button
                type="button"
                onClick={onCopyPassword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#235347] hover:text-[#051F20] cursor-pointer p-1"
                title="Copy password"
              >
                {copiedPass ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#163832]">Account Status</label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full bg-[#F6FBF7] border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#051F20] focus:outline-none focus:border-[#235347] transition capitalize"
            >
              <option value="active">Active (Verified Access)</option>
              <option value="disabled">Disabled (Suspended)</option>
            </select>
          </div>

          {/* Save Credentials Action */}
          <button
            type="button"
            onClick={onSaveCredentials}
            disabled={savingCredentials}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#163832] hover:bg-[#235347] text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-50 shadow-sm touch-target-44"
          >
            <Shield size={14} />
            <span>{savingCredentials ? 'Saving Credentials...' : 'Save Role Credentials'}</span>
          </button>

          {/* Act as Role (Live Preview) */}
          <button
            type="button"
            onClick={onActAsRole}
            className="w-full py-2.5 px-4 rounded-xl bg-[#DAF1DE] hover:bg-[#c6ebd0] text-[#163832] font-bold text-xs flex items-center justify-center gap-2 border border-[#8EB69B]/40 transition active:scale-98 cursor-pointer shadow-2xs touch-target-44"
            title={`Preview application and controls as ${activeRoleMeta.badge}`}
          >
            <Repeat size={14} strokeWidth={2.4} />
            <span>Act as {activeRoleMeta.badge} (Live Preview)</span>
          </button>
        </div>

        {/* Right Column: Operations Authority & Master Switches (7 cols) */}
        <div className="md:col-span-7 bg-white border border-[#DAF1DE] rounded-2xl p-4 shadow-[0_4px_20px_rgba(5,31,32,0.04)] flex flex-col gap-3.5">
          {/* Header & Master Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DAF1DE] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#235347]">
                <SlidersHorizontal size={16} strokeWidth={2.4} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#051F20] leading-tight">Operation Authorities</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#235347]">
                    {activeCount} / 26 Active
                  </span>
                </div>
                <p className="text-xs text-[#235347]">Instant toggle switches for {activeRoleMeta.badge}</p>
              </div>
            </div>

            {/* Master Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={onEnableAll}
                disabled={togglingOperation}
                className="px-2.5 py-1.5 rounded-xl bg-[#DAF1DE] hover:bg-[#8EB69B]/40 text-[#235347] font-bold text-xs border border-[#8EB69B]/40 flex items-center gap-1 cursor-pointer transition active:scale-95 touch-target-44"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>Enable All</span>
              </button>

              <button
                type="button"
                onClick={onDisableAll}
                disabled={togglingOperation || selectedRoleKey === 'super_admin'}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 flex items-center gap-1 cursor-pointer transition active:scale-95 touch-target-44 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X size={13} strokeWidth={2.5} />
                <span>Disable All</span>
              </button>

              <button
                type="button"
                onClick={onResetToDefault}
                disabled={togglingOperation}
                className="px-2.5 py-1.5 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] text-[#235347] font-bold text-xs border border-[#DAF1DE] flex items-center gap-1 cursor-pointer transition active:scale-95 touch-target-44"
                title="Restore default institutional baseline"
              >
                <RotateCcw size={13} />
                <span>Default</span>
              </button>
            </div>
          </div>

          {/* Security Presets Quick Actions */}
          <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE]">
            <span className="text-[10px] font-bold text-[#8EB69B] uppercase tracking-wider">Presets:</span>
            <button
              type="button"
              onClick={() => onApplySecurityPreset('baseline')}
              disabled={togglingOperation}
              className="px-2 py-1 rounded-lg text-xs font-bold text-[#163832] bg-white border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <span>🏛️ Baseline</span>
            </button>
            <button
              type="button"
              onClick={() => onApplySecurityPreset('event_sprint')}
              disabled={togglingOperation}
              className="px-2 py-1 rounded-lg text-xs font-bold text-[#163832] bg-white border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <Zap size={11} className="text-amber-600" />
              <span>Event Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => onApplySecurityPreset('exam_hiatus')}
              disabled={togglingOperation}
              className="px-2 py-1 rounded-lg text-xs font-bold text-[#163832] bg-white border border-[#DAF1DE] hover:border-[#8EB69B] flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              <Lock size={11} className="text-[#235347]" />
              <span>Exam Hiatus</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 ${
                selectedCat === 'all'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              All (26)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('events')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'events'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Calendar size={12} /> Events (5)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('finance')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'finance'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Coins size={12} /> Finance (5)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('docs')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'docs'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <FileText size={12} /> Docs (4)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('ops')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'ops'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Activity size={12} /> Activities (4)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCat('admin')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer touch-target-44 flex items-center gap-1 ${
                selectedCat === 'admin'
                  ? 'bg-[#235347] text-white shadow-xs'
                  : 'bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE]'
              }`}
            >
              <Shield size={12} /> Governance (8)
            </button>
          </div>

          {/* Operations List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
            {filteredOperations.map((op) => {
              const isActive = !!currentRolePermissions[op.key];
              return (
                <div
                  key={op.key}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isActive ? 'bg-[#F6FBF7] border-[#8EB69B]/50' : 'bg-white border-[#DAF1DE] opacity-80'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#051F20] truncate">{op.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isActive ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-[#235347] truncate mt-0.5">{op.desc}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => onToggleOperation(op.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 touch-target-44 p-0.5 ${
                      isActive ? 'bg-[#235347]' : 'bg-gray-300'
                    }`}
                    aria-label={`Toggle ${op.label}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                        isActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Institutional Compliance Notice */}
          <div className="pt-2 border-t border-[#DAF1DE] flex items-center justify-between text-xs text-[#235347]">
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-[#8EB69B]" />
              <span>Changes take effect immediately across all client devices.</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#163832]">RBAC v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
