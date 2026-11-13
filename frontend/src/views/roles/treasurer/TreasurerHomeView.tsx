import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Plus,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  HeroCard,
  PillButton,
  StatTile,
  StatusChip,
  ListRow,
  SectionHeader,
  EmptyState,
} from '../../../components/shared';

export interface TreasurerHomeViewProps {
  showToast?: (msg: string) => void;
  setSelectedEventId?: (id: string) => void;
  handleOpenPrefilledExpense?: (eventId: string, title: string, category: 'Logistics' | 'Stage' | 'Refreshments' | 'Printing') => void;
}

export const TreasurerHomeView: React.FC<TreasurerHomeViewProps> = () => {
  const { events, budgetRequests, expenses, setActiveTab } = useApp();

  const totalSpent = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalBudget = (events || []).reduce((sum, e) => sum + (Number(e.budget) || 0), 0);
  const available = Math.max(0, totalBudget - totalSpent);

  const formatAmount = (num: number) => {
    if (num <= 0) return '₹0';
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Finance" with "+ Add expense" and QR Scanner */}
      <HeroCard
        variant="mint"
        title="Finance"
        subtitle="Treasury, ledgers & expenditure tracking"
        mascot="coin"
        mascotSize="md"
        chip={<StatusChip status="live" label="Treasury" />}
        action={
          <div className="flex items-center gap-2 w-full">
            <PillButton
              variant="primary"
              fullWidth
              icon={<Plus size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('ledger')}
            >
              + Add expense
            </PillButton>
            <PillButton
              variant="secondary"
              fullWidth
              icon={<QrCode size={16} strokeWidth={1.75} className="lucide" />}
              onClick={() => setActiveTab('scan_qr')}
            >
              QR Scanner
            </PillButton>
          </div>
        }
      />

      {/* 2) StatTiles: Events, Spent, Available, Total - Computed dynamically */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatTile
          icon={<Calendar size={20} strokeWidth={1.75} className="lucide" />}
          value={String(events.length)}
          label="Events"
          footnote="Sponsored"
          tint="mint"
          onClick={() => setActiveTab('events')}
        />
        <StatTile
          icon={<TrendingUp size={20} strokeWidth={1.75} className="lucide" />}
          value={formatAmount(totalSpent)}
          label="Spent"
          footnote="Utilized"
          tint="amber"
          onClick={() => setActiveTab('ledger')}
        />
        <StatTile
          icon={<CheckCircle2 size={20} strokeWidth={1.75} className="lucide" />}
          value={formatAmount(available)}
          label="Available"
          footnote="Remaining"
          tint="sage"
          onClick={() => setActiveTab('ledger')}
        />
        <StatTile
          icon={<DollarSign size={20} strokeWidth={1.75} className="lucide" />}
          value={formatAmount(totalBudget)}
          label="Total"
          footnote="Corpus"
          tint="mint"
          onClick={() => setActiveTab('ledger')}
        />
      </div>

      {/* 3) Budget Requests list - only rendered when requests exist */}
      {budgetRequests && budgetRequests.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <SectionHeader
            title="Budget Requests"
            actionLabel="View all"
            onAction={() => setActiveTab('ledger')}
          />

          <div className="flex flex-col gap-2">
            {budgetRequests.slice(0, 3).map((req) => (
              <ListRow
                key={req.id}
                icon={<DollarSign size={20} strokeWidth={1.75} className="lucide" />}
                title={req.teamName || 'Squad Budget Proposal'}
                subtitle={`₹${(req.requestedAmount || 0).toLocaleString()} • ${req.reason || 'Allocation request'}`}
                meta={
                  <div className="flex items-center gap-2">
                    <StatusChip
                      status={req.status === 'approved' ? 'approved' : 'pending'}
                      label={req.status === 'approved' ? 'Approved' : 'Pending'}
                    />
                    <PillButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('ledger')}
                    >
                      View
                    </PillButton>
                  </div>
                }
                onClick={() => setActiveTab('ledger')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasurerHomeView;