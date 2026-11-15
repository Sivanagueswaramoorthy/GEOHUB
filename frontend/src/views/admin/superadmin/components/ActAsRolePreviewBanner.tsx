import React from 'react';
import { Repeat, X } from 'lucide-react';
import { botanicalTheme } from '../theme';

export interface ActAsRolePreviewBannerProps {
  roleBadge: string;
  onExitPreview: () => void;
}

export const ActAsRolePreviewBanner: React.FC<ActAsRolePreviewBannerProps> = ({
  roleBadge,
  onExitPreview,
}) => {
  return (
    <aside
      aria-label="Active Role Preview Banner"
      className="sticky top-0 z-50 w-full py-2.5 px-4 bg-[#051F20] text-white flex items-center justify-between gap-3 shadow-md border-b border-[#8EB69B]/40 select-none"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Repeat size={16} className="text-[#DAF1DE] shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="text-xs font-bold truncate">
          Previewing as <strong className="text-[#DAF1DE] underline">{roleBadge}</strong> · Master Authority Active
        </span>
      </div>

      <button
        type="button"
        onClick={onExitPreview}
        className="px-3 py-1 rounded-full text-xs font-bold text-[#051F20] transition cursor-pointer flex items-center gap-1 shrink-0 touch-target-44"
        style={{
          backgroundColor: botanicalTheme.colors.paleMint,
        }}
      >
        <X size={13} strokeWidth={2.4} />
        <span>Exit Preview</span>
      </button>
    </aside>
  );
};

export default ActAsRolePreviewBanner;
