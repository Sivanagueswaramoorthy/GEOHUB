import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
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
  EmptyState,
} from '../../../components/shared';

export interface TreasurerHomeViewProps {
  showToast?: (msg: string) => void;
  setSelectedEventId?: (id: string) => void;
  handleOpenPrefilledExpense?: (eventId: string, title: string, category: 'Logistics' | 'Stage' | 'Refreshments' | 'Printing') => void;
}

export const TreasurerHomeView: React.FC<TreasurerHomeViewProps> = () => {
  const { budgetRequests, setActiveTab } = useApp();

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* 1) HeroCard: "Finance", subtitle "Treasury & expenditure", small coin mascot; CTA "Add expense" */}
      <HeroCard
        variant="mint"
        title="Finance"
        subtitle="Treasury & expenditure"
        mascot="coin"
        mascotSize="md"
        chip={<StatusChip status="live" label="Treasury" />}
        action={
          <PillButton
            variant="primary"
            fullWidth
            icon={<Plus size={16} strokeWidth={2.2} />}
            onClick={() => setActiveTab('finance')}
          >
            Add expense
          </PillButton>
        }
      />

      {/* 2) StatTiles: Allocated, Spent, Left */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile
          icon={<DollarSign size={18} strokeWidth={2} />}
          value="₹4.5L"
          label="Allocated"
          footnote="Corpus"
          tint="mint"
          onClick={() => setActiveTab('finance')}
        />
        <StatTile
          icon={<TrendingUp size={18} strokeWidth={2} />}
          value="₹2.27L"
          label="Spent"
          footnote="50.4%"
          tint="amber"
          onClick={() => setActiveTab('finance')}
        />
        <StatTile
          icon={<CheckCircle2 size={18} strokeWidth={2} />}
          value="₹2.23L"
          label="Left"
          footnote="Available"
          tint="sage"
          onClick={() => setActiveTab('finance')}
        />
      </div>

      {/* 3) Budget Request Status Cards (wallet mascot in empty state) */}
      <div className="flex flex-col gap-2.5">
        <SectionHeader
          title="Budget Requests"
          actionLabel="View all"
          onAction={() => setActiveTab('finance')}
        />

        <div className="flex flex-col gap-2">
          {budgetRequests && budgetRequests.length > 0 ? (
            budgetRequests.slice(0, 3).map((req) => (
              <ListRow
                key={req.id}
                icon={<DollarSign size={18} strokeWidth={2} />}
                title={req.teamName || 'Squad Budget Proposal'}
                subtitle={`₹${req.requestedAmount.toLocaleString()} • ${req.reason || 'Allocation request'}`}
                meta={
                  <StatusChip
                    status={
                      req.status === 'approved'
                        ? 'approved'
                        : req.status === 'rejected'
                        ? 'rejected'
                        : 'pending'
                    }
                  />
                }
                onClick={() => setActiveTab('finance')}
              />
            ))
          ) : (
            <div
              className="bg-white border border-[#DAF1DE] p-4 text-center"
              style={{ borderRadius: '24px' }}
            >
              <EmptyState
                mascot="wallet"
                title="No active requests"
                subtitle="All budget disbursements are balanced"
                actionLabel="New proposal"
                onAction={() => setActiveTab('finance')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreasurerHomeView;
