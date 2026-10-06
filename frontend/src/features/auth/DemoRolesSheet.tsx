import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, Shield, Users2, FileText, DollarSign, Megaphone, UserCheck } from 'lucide-react';
import { UserModel } from '../../types';
import {
  demoSuperAdmin,
  demoAdmin,
  demoDocLead,
  demoTreasurer,
  demoTeamAdmin,
  demoVolunteer,
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
    id: 'faculty',
    name: 'Dr. Sarah Jenkins',
    roleTitle: 'Faculty Advisor',
    description: 'System oversight, sanctions, club approvals & dossiers',
    user: demoSuperAdmin,
    initials: 'SJ',
    badgeBg: '#FEF3C7',
    badgeColor: '#92400E',
    icon: <ShieldCheck size={18} className="text-amber-700" />,
  },
  {
    id: 'coordinator',
    name: 'Alex Rivera',
    roleTitle: 'Coordinator / Lead',
    description: 'Club leadership, master schedules & roster commands',
    user: demoAdmin,
    initials: 'AR',
    badgeBg: '#EEF2FF',
    badgeColor: '#4338CA',
    icon: <Shield size={18} className="text-indigo-700" />,
  },
  {
    id: 'doc_lead',
    name: 'Aarav Patel',
    roleTitle: 'Documentation Lead',
    description: 'Meeting minutes, templates & digital archives',
    user: demoDocLead,
    initials: 'AP',
    badgeBg: '#F3E8FF',
    badgeColor: '#7E22CE',
    icon: <FileText size={18} className="text-purple-700" />,
  },
  {
    id: 'treasurer_lead',
    name: 'Ananya Iyer',
    roleTitle: 'Treasurer Lead',
    description: 'Ledger records, requisitions, inventory & audits',
    user: demoTreasurer,
    initials: 'AI',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    icon: <DollarSign size={18} className="text-sky-700" />,
  },
  {
    id: 'promo_lead',
    name: 'David Chen',
    roleTitle: 'Promotion Lead',
    description: 'Campaign releases, content calendar & socials',
    user: demoTeamAdmin,
    initials: 'DC',
    badgeBg: '#CCFBF1',
    badgeColor: '#0F766E',
    icon: <Megaphone size={18} className="text-teal-700" />,
  },
  {
    id: 'student_volunteer',
    name: 'Liam Vance',
    roleTitle: 'Student Volunteer',
    description: 'Field verifications, gate passes & QR scans',
    user: demoVolunteer,
    initials: 'LV',
    badgeBg: '#E7F9F1',
    badgeColor: '#064E3B',
    icon: <UserCheck size={18} className="text-emerald-700" />,
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
                style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}
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
            <X size={18} />
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
                <div className="flex items-center gap-2">
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
