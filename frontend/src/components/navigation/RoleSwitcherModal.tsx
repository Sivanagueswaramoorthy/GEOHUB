import React from 'react';
import { Check, ShieldCheck, Shield, Users2, User, QrCode, FileText, DollarSign, Megaphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { AppAvatar } from '../common/AppAvatar';

export const RoleSwitcherModal: React.FC = () => {
  const { currentUser, switchRole, isRoleSwitcherOpen, setIsRoleSwitcherOpen } = useApp();

  const roleOptions: {
    role: UserRole;
    name: string;
    title: string;
    dept: string;
    icon: React.ReactNode;
  }[] = [
    {
      role: 'super_admin',
      name: 'Dr. Sarah Jenkins',
      title: 'Super Admin • Faculty Advisor',
      dept: 'Geography & Geomatics',
      icon: <ShieldCheck size={20} color="#B45309" />,
    },
    {
      role: 'admin',
      name: 'Alex Rivera',
      title: 'Admin • Club President',
      dept: 'Geoinformatics (4th Year)',
      icon: <Shield size={20} color="#4338CA" />,
    },
    {
      role: 'treasurer',
      name: 'Ananya Iyer',
      title: 'Treasurer Lead • Management Squad',
      dept: 'Economics & Financial Analytics (3rd Year)',
      icon: <DollarSign size={20} color="#047857" />,
    },
    {
      role: 'documentation',
      name: 'Aarav Patel',
      title: 'Documentation Lead • Documentation Squad',
      dept: 'Geoinformatics & Archival Science (3rd Year)',
      icon: <FileText size={20} color="#7C3AED" />,
    },
    {
      role: 'team_admin',
      name: 'David Chen',
      title: 'Promotion Lead • Promotion Squad',
      dept: 'Earth Science & Media (3rd Year)',
      icon: <Megaphone size={20} color="#7C3AED" />,
    },
    {
      role: 'member',
      name: 'Maya Patel',
      title: 'Member • Content Writer',
      dept: 'Documentation Team (2nd Year)',
      icon: <User size={20} color="#475569" />,
    },
    {
      role: 'volunteer',
      name: 'Liam Vance',
      title: 'Volunteer • Event Check-in Scanner',
      dept: 'Entertainment Team (3rd Year)',
      icon: <QrCode size={20} color="#BE185D" />,
    },
  ];

  return (
    <Modal
      isOpen={isRoleSwitcherOpen}
      onClose={() => setIsRoleSwitcherOpen(false)}
      title="Switch Demo Role"
      subtitle="Experience GeoHub through different role permissions"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {roleOptions.map((opt) => {
          const isSelected = currentUser.role === opt.role;
          return (
            <div
              key={opt.role}
              onClick={() => switchRole(opt.role)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #0F766E' : '1px solid #E8ECF2',
                backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AppAvatar name={opt.name} size={48} strokeWidth={1.75} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                      {opt.name}
                    </span>
                    {opt.icon}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E', marginTop: '1px' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{opt.dept}</div>
                </div>
              </div>

              {isSelected && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Check size={16} strokeWidth={1.75} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
