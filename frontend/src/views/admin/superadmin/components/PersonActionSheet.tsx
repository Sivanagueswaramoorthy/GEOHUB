import React, { useState } from 'react';
import { Pencil, KeyRound, ShieldAlert, Trash2, AlertTriangle, Check } from 'lucide-react';
import { CockpitBottomSheet } from './CockpitBottomSheet';
import { PersonItem } from './PersonCard';
import { botanicalTheme } from '../theme';

export interface PersonActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  person: PersonItem | null;
  type: 'faculty' | 'student';
  onEditDetails: (person: PersonItem) => void;
  onResetPassword: (person: PersonItem, newPass: string) => Promise<void>;
  onRevokeAccess: (person: PersonItem) => Promise<void>;
}

export const PersonActionSheet: React.FC<PersonActionSheetProps> = ({
  isOpen,
  onClose,
  person,
  type,
  onEditDetails,
  onResetPassword,
  onRevokeAccess,
}) => {
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isConfirmRevoke, setIsConfirmRevoke] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!person) return null;

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setIsProcessing(true);
    try {
      await onResetPassword(person, newPassword.trim());
      setIsResetMode(false);
      setNewPassword('');
      onClose();
    } catch {
      // error handled by parent toast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeConfirm = async () => {
    setIsProcessing(true);
    try {
      await onRevokeAccess(person);
      setIsConfirmRevoke(false);
      onClose();
    } catch {
      // error handled by parent toast
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CockpitBottomSheet
      isOpen={isOpen}
      onClose={() => {
        setIsResetMode(false);
        setIsConfirmRevoke(false);
        onClose();
      }}
      title={`Manage ${person.name}`}
      subtitle={`${person.roll_no} · ${person.post || person.role} · ${person.email}`}
    >
      <div className="flex flex-col gap-3 py-2 select-none">
        {/* Revoke confirmation state */}
        {isConfirmRevoke ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertTriangle size={16} />
              <span>Are you sure you want to revoke access?</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              This will unconditionally remove <strong>{person.name}</strong> ({person.roll_no}) from the active institutional database in TiDB Cloud.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmRevoke(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeConfirm}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
              >
                {isProcessing ? 'Revoking...' : 'Confirm Revoke'}
              </button>
            </div>
          </div>
        ) : isResetMode ? (
          /* Reset Password form */
          <form onSubmit={handleResetSubmit} className="p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#051F20]">Set New Password</h4>
            <input
              type="text"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter temporary password..."
              className="w-full bg-white border border-[#DAF1DE] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#051F20] outline-none focus:border-[#163832]"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !newPassword.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-[#163832] shadow-sm"
              >
                {isProcessing ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          /* Normal Action Menu */
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditDetails(person);
              }}
              className="p-3.5 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] flex items-center gap-3 transition cursor-pointer text-left touch-target-44 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
                <Pencil size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#051F20] block">Edit Details</span>
                <span className="text-[11px] text-[#235347]">Update name, department, phone, or title</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsResetMode(true)}
              className="p-3.5 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] flex items-center gap-3 transition cursor-pointer text-left touch-target-44 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] text-[#163832] flex items-center justify-center shrink-0">
                <KeyRound size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#051F20] block">Reset Password</span>
                <span className="text-[11px] text-[#235347]">Assign a temporary password for account recovery</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsConfirmRevoke(true)}
              className="p-3.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 flex items-center gap-3 transition cursor-pointer text-left touch-target-44 shadow-2xs text-rose-800"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <Trash2 size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-900 block">Revoke Access</span>
                <span className="text-[11px] text-rose-700">Permanently delete account from database</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </CockpitBottomSheet>
  );
};

export default PersonActionSheet;
