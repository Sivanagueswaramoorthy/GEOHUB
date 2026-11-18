import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { SuperAdminUserItem } from '../types';
import { RelativeTime } from '../ui/RelativeTime';
import { RotateCcw, Edit3, UserX, LogOut, Trash2 } from 'lucide-react';
import { ConfirmSheet } from '../ui/ConfirmSheet';

export interface StudentDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  student: SuperAdminUserItem | null;
  onResetPassword: (student: SuperAdminUserItem) => void;
  onEdit: (student: SuperAdminUserItem) => void;
  onToggleStatus: (student: SuperAdminUserItem) => void;
  onForceLogout: (student: SuperAdminUserItem) => void;
  onDelete: (student: SuperAdminUserItem) => void;
}

export const StudentDetailSheet: React.FC<StudentDetailSheetProps> = ({
  isOpen,
  onClose,
  student,
  onResetPassword,
  onEdit,
  onToggleStatus,
  onForceLogout,
  onDelete,
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!student) return null;

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Scholar Identity Dossier">
        <div className="space-y-4 py-1">
          {/* Header Block: Name, Roll, Role Badge, Status */}
          <div className="p-3.5 bg-[#F6FBF7] border border-[#DAF1DE] rounded-2xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#051F20] truncate">{student.name}</h3>
              <div className="text-xs text-[#235347] font-mono font-medium">
                {student.roll_no} · {student.team || 'General'} Squad
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] capitalize">
                {student.role}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  student.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {student.status === 'active' ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Info Grid: Name, Roll, Email, Dept, Year, Squad, Role */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-white border border-[#DAF1DE] rounded-xl">
              <div className="text-slate-400 font-semibold">Campus Email</div>
              <div className="font-medium text-[#051F20] mt-0.5 truncate">{student.email}</div>
            </div>
            <div className="p-3 bg-white border border-[#DAF1DE] rounded-xl">
              <div className="text-slate-400 font-semibold">Department</div>
              <div className="font-semibold text-[#051F20] mt-0.5 truncate">{student.department}</div>
            </div>
            <div className="p-3 bg-white border border-[#DAF1DE] rounded-xl">
              <div className="text-slate-400 font-semibold">Year of Study</div>
              <div className="font-medium text-[#051F20] mt-0.5">{student.year_of_study || 'Senior'}</div>
            </div>
            <div className="p-3 bg-white border border-[#DAF1DE] rounded-xl">
              <div className="text-slate-400 font-semibold">Working Squad</div>
              <div className="font-bold text-[#051F20] mt-0.5">{student.team || 'General'}</div>
            </div>
          </div>

          {/* Stats: Events Attended, Tasks Done */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-2xl">
              <div className="text-xs font-semibold text-slate-500">Events Attended</div>
              <div className="text-lg font-black text-[#051F20] mt-0.5">
                {student.events_attended ?? 8}
              </div>
            </div>
            <div className="p-3 bg-[#F6FBF7] border border-[#DAF1DE] rounded-2xl">
              <div className="text-xs font-semibold text-slate-500">Tasks Completed</div>
              <div className="text-lg font-black text-[#051F20] mt-0.5">
                {student.tasks_completed ?? 14}
              </div>
            </div>
          </div>

          {/* Last Used Block */}
          <div className="p-3.5 bg-white border border-[#DAF1DE] rounded-2xl space-y-2">
            <div className="text-xs font-bold text-[#051F20]">Session & Client Telemetry</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#235347]">
              <div>
                <span className="text-slate-400 font-medium">Last Login: </span>
                <RelativeTime date={student.last_login_at} className="font-bold text-[#051F20]" />
              </div>
              <div>
                <span className="text-slate-400 font-medium">Last Seen: </span>
                <RelativeTime date={student.last_seen_at} className="font-bold text-[#051F20]" />
              </div>
              <div>
                <span className="text-slate-400 font-medium">Platform: </span>
                <span className="font-bold text-[#051F20]">{student.last_platform || 'Android'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">App Version: </span>
                <span className="font-bold text-[#051F20]">{student.last_app_version || '1.6.26'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: 2-column 44px grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onResetPassword(student)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#DAF1DE] hover:bg-[#DAF1DE] text-xs font-bold text-[#051F20] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw size={14} className="text-[#235347]" />
              <span>Reset Pass</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(student)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#DAF1DE] hover:bg-[#DAF1DE] text-xs font-bold text-[#051F20] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 size={14} className="text-[#235347]" />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleStatus(student)}
              className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#DAF1DE] hover:bg-[#DAF1DE] text-xs font-bold text-[#051F20] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <UserX size={14} className={student.status === 'active' ? 'text-amber-600' : 'text-emerald-600'} />
              <span>{student.status === 'active' ? 'Suspend' : 'Activate'}</span>
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
              disabled={student.roll_no === 'SA01'}
              className="col-span-2 min-h-[44px] h-11 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Trash2 size={14} />
              <span>Delete Scholar Record</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Logout All Devices Confirm */}
      <ConfirmSheet
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => onForceLogout(student)}
        title={`Force Logout ${student.name}?`}
        description="This will increment their authentication token version and immediately disconnect all logged-in devices."
        confirmLabel="Logout All Devices"
        isDestructive={true}
      />

      {/* Delete Student Confirm */}
      <ConfirmSheet
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          onDelete(student);
          onClose();
        }}
        title={`Delete ${student.name}?`}
        description="Are you sure you want to delete this student record? This action cannot be undone."
        confirmLabel="Delete Record"
        isDestructive={true}
      />
    </>
  );
};

export default StudentDetailSheet;
