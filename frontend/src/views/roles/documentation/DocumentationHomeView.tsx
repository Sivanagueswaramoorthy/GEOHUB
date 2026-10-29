import React from 'react';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Plus,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  ListRow,
  SectionHeader,
} from '../../../components/shared';

export interface DocumentationHomeViewProps {
  docEvents?: any[];
  getCompletionDetails?: (items: any) => { completedCount: number; total: number; percent: number };
  setActiveChecklistEvent?: (ev: any) => void;
  handleOpenTemplateShortcut?: (name: string) => void;
  setActiveMediaItem?: (item: any) => void;
}

export const DocumentationHomeView: React.FC<DocumentationHomeViewProps> = () => {
  const { docTemplates, events, setActiveTab } = useApp();

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Documentation", subtitle "Archival wing", small notebook mascot; CTA "New report" */}
      <HeroCard
        variant="mint"
        title="Documentation"
        subtitle="Archival wing"
        mascot="notebook"
        mascotSize="md"
        chip={<StatusChip status="live" label="Archival Desk" />}
        action={
          <PillButton
            variant="primary"
            fullWidth
            icon={<Plus size={16} strokeWidth={2.2} />}
            onClick={() => setActiveTab('doc_studio')}
          >
            New report
          </PillButton>
        }
      />

      {/* 2) StatTiles: Drafts, Published, MoM due */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<FileText size={18} strokeWidth={2} />}
          value="3"
          label="Drafts"
          footnote="In progress"
          tint="amber"
          onClick={() => setActiveTab('doc_studio')}
        />
        <StatTile
          icon={<CheckCircle2 size={18} strokeWidth={2} />}
          value="9"
          label="Published"
          footnote="Verified"
          tint="mint"
          onClick={() => setActiveTab('operations')}
        />
        <StatTile
          icon={<Calendar size={18} strokeWidth={2} />}
          value="1"
          label="MoM due"
          footnote="Pending"
          tint="sage"
          onClick={() => setActiveTab('meetings')}
        />
      </div>

      {/* 3) Recent Archival Items */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Recent Records"
          actionLabel="Studio"
          onAction={() => setActiveTab('doc_studio')}
        />

        <div className="flex flex-col gap-2">
          {events.slice(0, 3).map((ev) => (
            <ListRow
              key={ev.id}
              icon={<FileText size={18} strokeWidth={2} />}
              title={ev.title}
              subtitle={`${ev.venue} • Dossier ready`}
              meta={<StatusChip status="approved" label="Archived" />}
              onClick={() => setActiveTab('doc_studio')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentationHomeView;
