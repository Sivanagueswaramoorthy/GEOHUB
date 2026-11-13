import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Lock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { AnimatedNumber, ConfirmDialog } from '../../../components/shared';
import { SquadGrant, grantSquadAccess, revokeSquadAccess } from '../../../core/permissions';

export interface EventPermissionsScreenProps {
  readOnly: boolean;
  grants: SquadGrant[];
  setGrants: React.Dispatch<React.SetStateAction<SquadGrant[]>>;
  onLogAudit: (event: string, action: string) => void;
  currentUser: any;
}

export const EventPermissionsScreen: React.FC<EventPermissionsScreenProps> = ({
  readOnly,
  grants,
  setGrants,
  onLogAudit,
  currentUser,
}) => {
  const [selectedGrantToRevoke, setSelectedGrantToRevoke] = useState<SquadGrant | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantUser, setGrantUser] = useState('Arun Kumar');
  const [grantSquad, setGrantSquad] = useState('documentation');
  const [grantEvent, setGrantEvent] = useState('evt-geotech-2026');
  const [notice, setNotice] = useState<string | null>(null);

  const handleConfirmRevoke = () => {
    if (!selectedGrantToRevoke) return;

    revokeSquadAccess(selectedGrantToRevoke.id);
    setGrants((prev) => prev.filter((g) => g.id !== selectedGrantToRevoke.id));

    onLogAudit(
      selectedGrantToRevoke.eventName || selectedGrantToRevoke.eventId,
      `Revoked WRITE grant for user ${selectedGrantToRevoke.userName} in squad ${selectedGrantToRevoke.squad}`
    );

    setNotice(`Revoked grant for ${selectedGrantToRevoke.userName}.`);
    setSelectedGrantToRevoke(null);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleConfirmGrant = (e: React.FormEvent) => {
    e.preventDefault();
    const created = grantSquadAccess({
      userId: `usr-grantee-${Date.now().toString().slice(-4)}`,
      userName: grantUser,
      squad: grantSquad,
      eventId: grantEvent,
      eventName: grantEvent === 'evt-geotech-2026' ? 'GeoTech 2026' : 'Campus Topo Camp 2026',
      access: 'write',
      grantedBy: currentUser?.name || 'Authorized Lead',
    });

    setGrants((prev) => [...prev, created]);
    onLogAudit(created.eventName || grantEvent, `Granted single-event WRITE access to ${grantUser}`);

    setShowGrantModal(false);
    setNotice(`Granted single-event write access to ${grantUser}.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full max-w-full overflow-hidden">
      {/* 1. Sleek Compact Metric Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Grants</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Lock size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-base sm:text-lg mt-1">
            <AnimatedNumber value={grants.length} /> Active
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Authority</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <Shield size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#163832] text-sm sm:text-base mt-1">
            WRITE Mode
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#DAF1DE] shadow-[0_2px_6px_rgba(5,31,32,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#235347] uppercase tracking-wide">Revocation</span>
            <div className="w-6 h-6 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163832]">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="font-extrabold text-[#051F20] text-sm sm:text-base mt-1">
            Immediate (0s)
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-[#DAF1DE]/40 border border-[#8EB69B] flex flex-col justify-between">
          <span className="text-xs font-bold text-[#163832] uppercase tracking-wide">Delegation</span>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowGrantModal(true)}
              className="mt-1 h-8 px-2.5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs touch-target-44 w-full"
              data-testid="btn-open-grant"
            >
              <Plus size={14} />
              <span>Grant Access</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-2xl bg-[#DAF1DE] border border-[#8EB69B] text-[#051F20] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#163832]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Grants List Card */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-[#DAF1DE] shadow-[0_4px_16px_rgba(5,31,32,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#DAF1DE]/70">
          <h2 className="font-bold text-[#051F20] text-sm sm:text-base">
            Per-Event Single Squad Permissions
          </h2>
          <span className="text-xs font-semibold text-[#235347]">
            Active Grants
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {grants.map((grant) => (
            <div
              key={grant.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#F6FBF7] border border-[#DAF1DE] hover:border-[#8EB69B] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#051F20] text-xs sm:text-sm">
                      {grant.userName || grant.userId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]">
                      Squad: {grant.squad}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#163832] border border-[#DAF1DE]">
                      WRITE Grant
                    </span>
                  </div>

                  <p className="text-xs text-[#235347] mt-1">
                    Bound Event: <strong className="text-[#051F20]">{grant.eventName || grant.eventId}</strong>
                  </p>

                  <p className="text-xs text-[#235347]/80 mt-0.5">
                    Granted by {grant.grantedBy}
                  </p>
                </div>

              {/* Action */}
              <div className="shrink-0 self-end sm:self-center">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setSelectedGrantToRevoke(grant)}
                    className="h-8 px-3 rounded-xl bg-white border border-[#D9534F] text-[#D9534F] text-xs font-bold hover:bg-[#D9534F]/10 active:scale-95 transition-all cursor-pointer"
                    data-testid={`btn-revoke-grant-${grant.id}`}
                  >
                    Revoke Grant
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revocation Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedGrantToRevoke)}
        onClose={() => setSelectedGrantToRevoke(null)}
        onConfirm={handleConfirmRevoke}
        title="Revoke Single-Event Permission"
        message={`Immediately terminate WRITE grant for ${selectedGrantToRevoke?.userName} on "${selectedGrantToRevoke?.eventName}"? The user will immediately revert to READ ONLY.`}
      />

      {/* Grant Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051F20]/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#DAF1DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#051F20] text-base">
                Grant Single-Event WRITE Access
              </h3>
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="w-8 h-8 rounded-full bg-[#F6FBF7] text-[#235347] hover:bg-[#DAF1DE] flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmGrant} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#051F20] mb-1">
                  Recipient Scholar
                </label>
                <input
                  type="text"
                  required
                  value={grantUser}
                  onChange={(e) => setGrantUser(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Squad Context
                  </label>
                  <select
                    value={grantSquad}
                    onChange={(e) => setGrantSquad(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  >
                    <option value="documentation">Documentation</option>
                    <option value="promotion">Promotion</option>
                    <option value="management">Management</option>
                    <option value="treasury">Treasury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#051F20] mb-1">
                    Target Event
                  </label>
                  <select
                    value={grantEvent}
                    onChange={(e) => setGrantEvent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#DAF1DE] text-xs text-[#051F20] bg-[#F6FBF7]"
                  >
                    <option value="evt-geotech-2026">GeoTech 2026</option>
                    <option value="evt-topo-2026">Campus Topo Camp 2026</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="h-10 px-4 rounded-xl border border-[#DAF1DE] text-xs font-bold text-[#235347] hover:bg-[#F6FBF7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#163832] text-white text-xs font-bold hover:bg-[#0B2B26] active:scale-95 cursor-pointer"
                >
                  Confirm Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPermissionsScreen;

