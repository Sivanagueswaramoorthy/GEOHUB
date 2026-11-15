import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, Shield, Users2, FileText, DollarSign, Megaphone, UserCheck } from 'lucide-react';
import { UserModel } from '../../types';
import {
  demoSuperAdmin,
  demoFaculty,
  demoAdmin,
  demoManagement,
  demoDocLead,
  demoTreasurer,
  demoTeamAdmin,
  demoVolunteer,
  demoMember,
} from '../../data/mockData';

export interface DemoPersona {
  id: string;
  name: string;
  roleTitle: string;
  description: string;
  user: UserModel;
  initials: string;
  badgeBg: string;
  badgeColor: string;
  icon: React.ReactNode;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'super_admin',
    name: 'System SuperAdmin',
    roleTitle: 'Super Admin',
    description: 'Master platform controls, role credentials & operations matrix',
    user: demoSuperAdmin,
    initials: 'SA',
    badgeBg: '#051F20',
    badgeColor: '#DAF1DE',
    icon: <ShieldCheck size={20} strokeWidth={1.75} className="text-[#DAF1DE]" />,
  },
];

interface DemoRolesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (persona: DemoPersona) => void;
  isAuthenticating?: boolean;
}

export const DemoRolesSheet: React.FC<DemoRolesSheetProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
  isAuthenticating = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isAuthenticating) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-roles-title"
    >
      <div className="sheet-panel" ref={panelRef} style={{ maxWidth: '520px' }}>
        <div className="sheet-drag-handle" aria-hidden="true" />

        <div className="sheet-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
              >
                TESTING ENVIRONMENT
              </span>
            </div>
            <h2 id="demo-roles-title" className="sheet-title">
              Instant Demo Personas
            </h2>
            <p className="sheet-subtitle">
              Select any role to test its verified permissions and navigation suite.
            </p>
          </div>
          <button
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            disabled={isAuthenticating}
            aria-label="Close dialog"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="demo-roles-grid">
          {DEMO_PERSONAS.map((persona) => (
            <button
              key={persona.id}
              type="button"
              disabled={isAuthenticating}
              onClick={() => onSelectPersona(persona)}
              className="demo-role-card"
            >
              <div
                className="demo-role-avatar"
                style={{
                  backgroundColor: persona.badgeBg,
                  color: persona.badgeColor,
                }}
              >
                {persona.initials}
              </div>

              <div className="demo-role-info">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="demo-role-name">{persona.name}</span>
                  <span
                    className="demo-role-badge"
                    style={{
                      backgroundColor: persona.badgeBg,
                      color: persona.badgeColor,
                    }}
                  >
                    {persona.roleTitle}
                  </span>
                  {persona.user.rollNo && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#DAF1DE] text-[#163832] border border-[#8EB69B]">
                      Roll No: {persona.user.rollNo}
                    </span>
                  )}
                </div>
                <p className="demo-role-desc">{persona.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
