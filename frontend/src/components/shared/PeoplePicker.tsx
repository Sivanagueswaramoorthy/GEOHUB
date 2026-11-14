import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Avatar } from './Avatar';
import { SearchField } from './SearchField';
import { PillButton } from './PillButton';

export interface PersonItem {
  id?: string;
  uid?: string;
  rollNo?: string;
  name: string;
  role?: string;
  department?: string;
  avatarUrl?: string;
}

export interface PeoplePickerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  people: PersonItem[];
  selectedIds?: string[];
  selectedUids?: string[];
  onConfirm?: (selectedIds: string[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  fullScreen?: boolean;
}

export const PeoplePicker: React.FC<PeoplePickerProps> = ({
  isOpen,
  onClose,
  title = 'Assign Members',
  subtitle = 'Select squad volunteers',
  people,
  selectedIds,
  selectedUids,
  onConfirm,
  onSelectionChange,
  multiSelect = true,
  fullScreen = true,
}) => {
  const initialSelected = selectedIds || selectedUids || [];
  const [currentSelected, setCurrentSelected] = useState<string[]>(initialSelected);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = people.filter((p) =>
    (p.rollNo && p.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.department && p.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    let next: string[];
    if (!multiSelect) {
      next = [id];
    } else if (currentSelected.includes(id)) {
      next = currentSelected.filter((item) => item !== id);
    } else {
      next = [...currentSelected, id];
    }
    setCurrentSelected(next);
    if (onSelectionChange) {
      onSelectionChange(next);
    }
  };

  const handleApply = () => {
    if (onConfirm) {
      onConfirm(currentSelected);
    }
    if (onSelectionChange) {
      onSelectionChange(currentSelected);
    }
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      fullScreen={fullScreen}
      maxHeight="80vh"
    >
      <div className="flex flex-col gap-4 select-none flex-1 min-h-0">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by Roll Number (e.g. 24GEO002) or name..."
        />

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar min-h-0">
          {filteredPeople.map((person) => {
            const personId = person.id || person.uid || '';
            const isSelected = currentSelected.includes(personId);
            return (
              <div
                key={personId}
                onClick={() => toggleSelect(personId)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#DAF1DE]/40 border-[#163832]'
                    : 'bg-white border-[#DAF1DE] hover:border-[#8EB69B]'
                }`}
                style={{ borderRadius: '16px' }}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={person.name} src={person.avatarUrl} size={40} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      {person.rollNo && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#DAF1DE] text-[#051F20] border border-[#8EB69B]/50">
                          {person.rollNo}
                        </span>
                      )}
                      <span className="text-sm font-bold text-[#051F20]">{person.name}</span>
                    </div>
                    {person.role && (
                      <span className="text-xs font-medium text-[#235347]">{person.role}</span>
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-[#163832] border-[#163832] text-white'
                      : 'border-[#8EB69B] bg-white'
                  }`}
                >
                  {isSelected && <Check size={14} strokeWidth={2.4} />}
                </div>
              </div>
            );
          })}
          {filteredPeople.length === 0 && (
            <div className="py-8 text-center text-xs font-semibold text-[#235347]">
              No members found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 pb-1 border-t border-[#DAF1DE] mt-auto shrink-0">
          <span className="text-xs font-bold text-[#235347]">
            {currentSelected.length} selected
          </span>
          <div className="flex gap-2">
            <PillButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </PillButton>
            <PillButton variant="primary" size="sm" onClick={handleApply}>
              Confirm
            </PillButton>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default PeoplePicker;
