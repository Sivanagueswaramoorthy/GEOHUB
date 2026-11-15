import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  Users,
  DollarSign,
  Megaphone,
  FileText,
  UserCheck,
  User,
  KeyRound,
  Copy,
  Check,
  LogIn,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { UserModel } from '../../types';
import {
  demoSuperAdmin,
  demoAdmin,
  demoManagement,
  demoTreasurer,
  demoTeamAdmin,
  demoDocLead,
  demoMember,
  demoVolunteer,
} from '../../data/mockData';

export interface DemoAccountEntry {
  id: string;
  role: string;
  category: 'executive' | 'leads' | 'members';
  pageName: string;
  pageRoute: string;
  name: string;
  postTitle: string;
  department: string;
  rollNo: string;
  email: string;
  password: string;
  user: UserModel;
  initials: string;
  icon: React.ReactNode;
}

export const DEMO_ACCOUNTS_LIST: DemoAccountEntry[] = [
  {
    id: 'superadmin',
    role: 'Super Admin',
    category: 'executive',
    pageName: 'System SuperAdmin Cockpit',
    pageRoute: '#operations (SuperAdmin Controls)',
    name: 'System SuperAdmin',
    postTitle: 'System Administrator',
    department: 'Platform Governance & IT',
    rollNo: 'SA01',
    email: 'superadmin@college.edu',
    password: 'GeoHub2026!',
    user: demoSuperAdmin,
    initials: 'SA',
    icon: <ShieldCheck size={18} strokeWidth={2} className="text-[#163832]" />,
  },
];

interface DemoCredentialsCardProps {
  onAutoFill: (rollNo: string, password: string) => void;
  onDirectLogin: (user: UserModel) => void;
  isLoading?: boolean;
}

export const DemoCredentialsCard: React.FC<DemoCredentialsCardProps> = ({
  onAutoFill,
  onDirectLogin,
  isLoading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'executive' | 'leads' | 'members'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      }
    } catch {
      // ignore
    }
  };

  const filteredAccounts = DEMO_ACCOUNTS_LIST.filter((account) => {
    const matchesCategory =
      activeCategory === 'all' || account.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      account.name.toLowerCase().includes(query) ||
      account.role.toLowerCase().includes(query) ||
      account.pageName.toLowerCase().includes(query) ||
      account.rollNo.toLowerCase().includes(query) ||
      account.email.toLowerCase().includes(query) ||
      account.postTitle.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return (
    <section
      aria-labelledby="demo-credentials-heading"
      className="w-full bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(5,31,32,0.08)] border border-[#DAF1DE] select-none"
      style={{
        borderRadius: '24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-[#8EB69B]"
            style={{ backgroundColor: '#DAF1DE' }}
          >
            <KeyRound size={20} strokeWidth={2.2} className="text-[#163832]" />
          </div>
          <div>
            <h2
              id="demo-credentials-heading"
              className="text-base font-bold text-[#051F20]"
              style={{ fontSize: '17px', lineHeight: '22px' }}
            >
              All Role Logins & Passwords
            </h2>
            <p className="text-xs font-semibold text-[#235347] mt-0.5">
              Default password:{' '}
              <span className="font-bold text-[#051F20] bg-[#DAF1DE] px-1.5 py-0.5 rounded-md border border-[#8EB69B]">
                admin123
              </span>{' '}
              for all accounts
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DAF1DE] border border-[#8EB69B] text-xs font-bold text-[#163832]">
          <Sparkles size={14} />
          <span>SuperAdmin Master Access</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-2.5 mb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {[
            { id: 'all', label: 'SuperAdmin' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className="transition-all cursor-pointer whitespace-nowrap"
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 600,
                  padding: '6px 12px',
                  minHeight: '44px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? '#163832' : '#DAF1DE',
                  color: isActive ? '#FFFFFF' : '#163832',
                  border: isActive ? '1px solid #0B2B26' : '1px solid #8EB69B',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#DAF1DE] bg-[#F6FBF7]"
          style={{ minHeight: '44px' }}
        >
          <Search size={16} strokeWidth={2} className="text-[#235347] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role, name, roll no (e.g. FAC01, 21GEO010)..."
            className="w-full bg-transparent text-xs font-semibold text-[#051F20] outline-none placeholder-[#8EB69B]"
            style={{ fontSize: '12px' }}
            aria-label="Filter role accounts"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#235347] hover:text-[#051F20] cursor-pointer"
              style={{ fontSize: '12px' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Accounts List */}
      <div className="flex flex-col gap-3">
        {filteredAccounts.map((account) => {
          const isRollCopied = copiedKey === `${account.id}-roll`;
          const isPassCopied = copiedKey === `${account.id}-pass`;

          return (
            <div
              key={account.id}
              className="p-3.5 sm:p-4 rounded-2xl border border-[#DAF1DE] bg-[#F6FBF7] transition-all hover:border-[#8EB69B] flex flex-col gap-2.5"
            >
              {/* Top Row: Page Badge & Person */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border border-[#8EB69B]"
                    style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                  >
                    {account.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[#051F20] truncate">
                        {account.name}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border border-[#8EB69B]"
                        style={{ backgroundColor: '#DAF1DE', color: '#163832' }}
                      >
                        {account.icon}
                        <span>{account.pageName}</span>
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#235347] truncate">
                      {account.postTitle} • {account.department}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Row: Username & Password Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#DAF1DE]">
                {/* Username / Roll No Box */}
                <div
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#DAF1DE]"
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-xs font-semibold text-[#235347]">
                      Username / Reg No:
                    </span>
                    <span className="text-xs font-bold text-[#051F20] font-mono truncate">
                      {account.rollNo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${account.id}-roll`, account.rollNo)}
                    aria-label={`Copy username ${account.rollNo}`}
                    className="p-2 rounded-lg hover:bg-[#DAF1DE] text-[#163832] transition-colors cursor-pointer shrink-0"
                    style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {isRollCopied ? (
                      <Check size={16} className="text-[#163832]" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>

                {/* Password Box */}
                <div
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#DAF1DE]"
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-xs font-semibold text-[#235347]">
                      Password:
                    </span>
                    <span className="text-xs font-bold text-[#051F20] font-mono">
                      {account.password}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${account.id}-pass`, account.password)}
                    aria-label={`Copy password for ${account.name}`}
                    className="p-2 rounded-lg hover:bg-[#DAF1DE] text-[#163832] transition-colors cursor-pointer shrink-0"
                    style={{ minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {isPassCopied ? (
                      <Check size={16} className="text-[#163832]" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Auto-Fill & 1-Tap Login */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onAutoFill(account.rollNo, account.password)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#8EB69B] text-xs font-bold text-[#163832] hover:bg-[#DAF1DE] transition-colors cursor-pointer"
                  style={{ minHeight: '44px', fontSize: '12px' }}
                >
                  <KeyRound size={14} />
                  <span>Auto-Fill Form</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onDirectLogin(account.user)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#163832] border border-[#0B2B26] text-xs font-bold text-white hover:bg-[#0B2B26] transition-colors cursor-pointer shadow-[0_2px_8px_rgba(5,31,32,0.12)]"
                  style={{ minHeight: '44px', fontSize: '12px' }}
                >
                  <LogIn size={14} />
                  <span>1-Tap Login</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredAccounts.length === 0 && (
          <div className="text-center py-6 text-xs font-semibold text-[#235347]">
            No roles found matching "{searchQuery}". Try searching for another term.
          </div>
        )}
      </div>
    </section>
  );
};

