import React from 'react';
import { Check, ShieldCheck, Shield, FileText, DollarSign, Megaphone, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BottomSheet } from '../shared/BottomSheet';
import { Avatar } from '../shared/Avatar';

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
      role: 'faculty',
      name: 'Dr. Sarah Jenkins',
      title: 'Faculty • Faculty Advisor',
      dept: 'Geography & Geomatics',
      icon: <ShieldCheck size={18} color="#163832" />,
    },
    {
      role: 'coordinator',
      name: 'Alex Rivera',
      title: 'Coordinator • Club President',
      dept: 'Geoinformatics (4th Year)',
      icon: <Shield size={18} color="#163832" />,
    },
    {
      role: 'documentation',
      name: 'Aarav Patel',
      title: 'Documentation Lead • Documentation Squad',
      dept: 'Geoinformatics & Archival Science (3rd Year)',
      icon: <FileText size={18} color="#163832" />,
    },
    {
      role: 'treasurer',
      name: 'Ananya Iyer',
      title: 'Treasurer • Management Squad',
      dept: 'Economics & Financial Analytics (3rd Year)',
      icon: <DollarSign size={18} color="#163832" />,
    },
    {
      role: 'promotion',
      name: 'David Chen',
      title: 'Promotion Lead • Promotion Squad',
      dept: 'Earth Science & Media (3rd Year)',
      icon: <Megaphone size={18} color="#163832" />,
    },
    {
      role: 'student',
      name: 'Maya Patel',
      title: 'Student • Active Member & QR Scanner',
      dept: 'Cartography & Geography (2nd Year)',
      icon: <User size={18} color="#163832" />,
    },
  ];

  return (
    <BottomSheet
      isOpen={isRoleSwitcherOpen}
      onClose={() => setIsRoleSwitcherOpen(false)}
      title="Switch Preview Role"
      subtitle="Preview UI as another role (preview only)"
    >
      <div className="flex flex-col gap-2.5 p-2 select-none">
        {roleOptions.map((opt) => {
          const isSelected = currentUser.role === opt.role;
          return (
            <div
              key={opt.role}
              onClick={() => {
                switchRole(opt.role);
                setIsRoleSwitcherOpen(false);
              }}
              className={`flex items-center justify-between p-3.5 transition-all cursor-pointer pressable border ${
                isSelected
                  ? 'bg-[#DAF1DE] border-[#163832] shadow-[0_4px_14px_rgba(5,31,32,0.06)]'
                  : 'bg-white border-[#DAF1DE] hover:border-[#8EB69B]'
              }`}
              style={{ borderRadius: '16px' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={opt.name} size={40} />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#051F20] truncate">
                      {opt.name}
                    </span>
                    {opt.icon}
                  </div>
                  <span className="text-xs font-semibold text-[#163832] truncate">
                    {opt.title}
                  </span>
                  <span className="text-xs font-medium text-[#235347] truncate">
                    {opt.dept}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#163832] text-white shrink-0 ml-2">
                  <Check size={14} strokeWidth={2.4} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
};

export default RoleSwitcherModal;
