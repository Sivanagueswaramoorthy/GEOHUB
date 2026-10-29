import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Avatar } from './Avatar';
import { SearchField } from './SearchField';
import { PillButton } from './PillButton';

export interface PersonItem {
  id?: string;
  uid?: string;
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
}) => {
  const initialSelected = selectedIds || selectedUids || [];
  const [currentSelected, setCurrentSelected] = useState<string[]>(initialSelected);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = people.filter((p) =>
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
      maxHeight="80vh"
    >
      <div className="flex flex-col gap-4 p-5 select-none">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or role..."
        />

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto no-scrollbar">
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
                    <span className="text-sm font-bold text-[#051F20]">{person.name}</span>
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

        <div className="flex items-center justify-between pt-2 border-t border-[#DAF1DE]">
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
