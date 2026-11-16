import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { FacultyAdvisorItem } from '../types';
import { RelativeTime } from '../ui/RelativeTime';
import { KeyRound, RotateCcw, Edit3, UserX, LogOut, Trash2 } from 'lucide-react';
import { ConfirmSheet } from '../ui/ConfirmSheet';

export interface FacultyDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: FacultyAdvisorItem | null;
  onGeneratePin: (faculty: FacultyAdvisorItem) => void;
  onResetPassword: (faculty: FacultyAdvisorItem) => void;
  onEdit: (faculty: FacultyAdvisorItem) => void;
  onToggleStatus: (faculty: FacultyAdvisorItem) => void;
  onForceLogout: (faculty: FacultyAdvisorItem) => void;
  onDelete: (faculty: FacultyAdvisorItem) => void;
}

export const FacultyDetailSheet: React.FC<FacultyDetailSheetProps> = ({
  isOpen,
  onClose,
  faculty,
  onGeneratePin,
  onResetPassword,
  onEdit,
  onToggleStatus,
  onForceLogout,
  onDelete,
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!faculty) return null;

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Faculty Advisor Dossier">
        <div className="space-y-4 py-1">
          {/* Header Block: Name, Designation, Status Chip */}
          <div className="p-3.5 bg-[#F7FAF8] border border-[#E3EEE6] rounded-2xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#051F20] truncate">{faculty.name}</h3>
              <div className="text-xs text-[#235347] font-medium">{faculty.designation || 'Advisor'}</div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                faculty.status === 'active'
                  ? 'bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/50'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {faculty.status === 'active' ? 'Active' : 'Suspended'}
            </span>
          </div>

          {/* Info Grid: Department, Email, Phone, Username */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-white border border-[#E3EEE6] rounded-xl">
              <div className="text-slate-400 font-semibold">Staff / Roll No</div>
              <div className="font-mono font-bold text-[#051F20] mt-0.5">{faculty.roll_no}</div>
            </div>
            <div className="p-3 bg-white border border-[#E3EEE6] rounded-xl">
              <div className="text-slate-400 font-semibold">Department</div>
              <div className="font-semibold text-[#051F20] mt-0.5 truncate">{faculty.department}</div>
            </div>
            <div className="p-3 bg-white border border-[#E3EEE6] rounded-xl">
              <div className="text-slate-400 font-semibold">Institutional Email</div>
              <div className="font-medium text-[#051F20] mt-0.5 truncate">{faculty.email}</div>
            </div>
            <div className="p-3 bg-white border border-[#E3EEE6] rounded-xl">
              <div className="text-slate-400 font-semibold">Contact Phone</div>
              <div className="font-medium text-[#051F20] mt-0.5 truncate">{faculty.phone || 'N/A'}</div>
            </div>
          </div>

          {/* "Last Used" Block: Last login, last activity, platform, app version, active sessions count */}
          <div className="p-3.5 bg-white border border-[#E3EEE6] rounded-2xl space-y-2">
            <div className="text-xs font-bold text-[#051F20]">Device & Session Telemetry</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#235347]">
              <div>
                <span className="text-slate-400 font-medium">Last Login: </span>
                <RelativeTime date={faculty.last_login_at} className="font-bold text-[#051F20]" />
              </div>
              <div>
                <span className="text-slate-400 font-medium">Last Activity: </span>
                <RelativeTime date={faculty.last_seen_at} className="font-bold text-[#051F20]" />
              </div>
              <div>
                <span className="text-slate-400 font-medium">Platform: </span>
                <span className="font-bold text-[#051F20]">{faculty.last_platform || 'Android'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">App Version: </span>
                <span className="font-bold text-[#051F20]">{faculty.last_app_version || '1.6.26'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: 2-column 44px grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onGeneratePin(faculty)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#E3EEE6] hover:bg-[#F7FAF8] text-xs font-bold text-[#051F20] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <KeyRound size={14} className="text-[#235347]" />
              <span>Generate PIN</span>
            </button>

            <button
              type="button"
              onClick={() => onResetPassword(faculty)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#E3EEE6] hover:bg-[#F7FAF8] text-xs font-bold text-[#051F20] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw size={14} className="text-[#235347]" />
              <span>Reset Pass</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(faculty)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#E3EEE6] hover:bg-[#F7FAF8] text-xs font-bold text-[#051F20] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 size={14} className="text-[#235347]" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleStatus(faculty)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#E3EEE6] hover:bg-[#F7FAF8] text-xs font-bold text-[#051F20] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <UserX size={14} className={faculty.status === 'active' ? 'text-amber-600' : 'text-emerald-600'} />
              <span>{faculty.status === 'active' ? 'Suspend' : 'Activate'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Logout Devices</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Trash2 size={14} />
              <span>Delete Faculty</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Logout All Devices Confirm */}
      <ConfirmSheet
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => onForceLogout(faculty)}
        title={`Force Logout ${faculty.name}?`}
        description="This will increment their authentication token version and immediately disconnect all logged-in devices."
        confirmLabel="Logout All Devices"
        isDestructive={true}
      />

      {/* Delete Faculty Confirm */}
      <ConfirmSheet
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          onDelete(faculty);
          onClose();
        }}
        title={`Delete ${faculty.name}?`}
        description="Are you sure you want to delete this faculty advisor record? This action cannot be undone."
        confirmLabel="Delete Record"
        isDestructive={true}
      />
    </>
  );
};

export default FacultyDetailSheet;
