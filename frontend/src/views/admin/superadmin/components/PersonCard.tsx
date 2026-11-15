import React from 'react';
import { MoreHorizontal, Mail, Shield, GraduationCap, Phone } from 'lucide-react';
import { botanicalTheme } from '../theme';

export interface PersonItem {
  id: string;
  name: string;
  roll_no: string;
  email: string;
  role: string;
  department?: string;
  post?: string;
  team?: string;
  phone?: string;
  status?: string;
  year_of_study?: string;
}

export interface PersonCardProps {
  person: PersonItem;
  type: 'faculty' | 'student';
  onActionClick: (person: PersonItem) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  type,
  onActionClick,
}) => {
  const initials = person.name
    ? person.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const isFaculty = type === 'faculty';

  return (
    <div
      className="p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3 select-none hover:border-[#8EB69B]"
      style={{
        backgroundColor: '#F6FBF7',
        borderColor: '#DAF1DE',
        boxShadow: botanicalTheme.shadows.card,
      }}
    >
      {/* Top Header: Avatar + Name + ID + ⋯ Action Trigger */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 border shadow-2xs"
            style={{
              backgroundColor: isFaculty ? botanicalTheme.colors.paleMint : '#E0F2FE',
              color: isFaculty ? botanicalTheme.colors.forestDark : '#0369A1',
              borderColor: isFaculty ? botanicalTheme.colors.softSage : '#BAE6FD',
            }}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#051F20] truncate">
              {person.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="font-mono text-xs font-bold text-[#163832] bg-[#DAF1DE] px-1.5 py-0.2 rounded-md border border-[#8EB69B]/40">
                {person.roll_no}
              </span>
              <span
                className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: isFaculty ? '#DAF1DE' : '#F1F5F9',
                  color: isFaculty ? '#163832' : '#334155',
                  borderColor: isFaculty ? '#8EB69B' : '#CBD5E1',
                }}
              >
                {person.post || person.role}
              </span>
            </div>
          </div>
        </div>

        {/* ⋯ Menu Trigger Button (44px min tap target) */}
        <button
          type="button"
          aria-label={`Actions for ${person.name}`}
          onClick={() => onActionClick(person)}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[#235347] hover:text-[#051F20] hover:bg-[#DAF1DE] transition cursor-pointer shrink-0 border border-transparent hover:border-[#8EB69B] touch-target-44"
          title="Open actions"
        >
          <MoreHorizontal size={20} strokeWidth={2.4} />
        </button>
      </div>

      {/* Details Row: Email on its own line + Department / Squad */}
      <div className="pt-2 border-t border-[#DAF1DE]/70 space-y-1 text-xs text-[#235347]">
        <div className="flex items-center gap-1.5 truncate">
          <Mail size={13} className="text-[#8EB69B] shrink-0" />
          <span className="truncate select-text">{person.email}</span>
        </div>

        {person.department && (
          <div className="flex items-center gap-1.5 truncate">
            {isFaculty ? (
              <GraduationCap size={13} className="text-[#8EB69B] shrink-0" />
            ) : (
              <Shield size={13} className="text-[#8EB69B] shrink-0" />
            )}
            <span className="truncate">
              {person.department} {person.year_of_study ? `· ${person.year_of_study}` : ''}
            </span>
          </div>
        )}

        {person.phone && (
          <div className="flex items-center gap-1.5 truncate text-[11px] text-[#52665C]">
            <Phone size={12} className="text-[#8EB69B] shrink-0" />
            <span className="truncate">{person.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
