import React, { useState } from 'react';
import { History, Search, ShieldCheck, Filter } from 'lucide-react';
import { AuditActionEntry } from '../types';
import { botanicalTheme } from '../theme';

export interface AuditLogListProps {
  logs?: AuditActionEntry[];
}

export const AuditLogList: React.FC<AuditLogListProps> = ({ logs = [] }) => {
  const [filter, setFilter] = useState<'all' | 'modules' | 'faculty' | 'students' | 'security'>('all');
  const [query, setQuery] = useState('');

  // Sample seed logs if none provided
  const initialLogs: AuditActionEntry[] = logs.length > 0 ? logs : [
    {
      id: 'a-1',
      timestamp: 'Today · 12:35 PM',
      actor: 'SuperAdmin (SA01)',
      action: 'Synchronized TiDB Cloud MySQL 3306 Cluster schema',
      target: 'geohub',
      category: 'database',
      status: 'success',
    },
    {
      id: 'a-2',
      timestamp: 'Today · 11:42 AM',
      actor: 'SuperAdmin (SA01)',
      action: 'Verified Module Switchboard health for 9 club departments',
      target: 'modules',
      category: 'modules',
      status: 'success',
    },
    {
      id: 'a-3',
      timestamp: 'Today · 10:15 AM',
      actor: 'SuperAdmin (SA01)',
      action: 'Audited Faculty Advisor institutional credentials',
      target: 'FAC01',
      category: 'faculty',
      status: 'info',
    },
    {
      id: 'a-4',
      timestamp: 'Yesterday · 04:20 PM',
      actor: 'SuperAdmin (SA01)',
      action: 'Enforced cryptographic password policy for scholar onboarding',
      target: 'students',
      category: 'students',
      status: 'success',
    },
  ];

  const filtered = initialLogs.filter((l) => {
    const matchCat = filter === 'all' || l.category === filter;
    const matchQ =
      !query ||
      l.action.toLowerCase().includes(query.toLowerCase()) ||
      l.actor.toLowerCase().includes(query.toLowerCase()) ||
      l.target.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <section
      aria-label="SuperAdmin Audit Trail"
      className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DAF1DE] shadow-sm flex flex-col gap-3.5 select-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#DAF1DE]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: botanicalTheme.colors.paleMint,
              color: botanicalTheme.colors.emeraldSlate,
              borderColor: botanicalTheme.colors.softSage,
            }}
          >
            <History size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#051F20]">
              Governance Audit Ledger
            </h2>
            <p className="text-xs text-[#235347] mt-0.5">
              Cryptographically verified audit trail of all SuperAdmin actions
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['all', 'modules', 'faculty', 'students'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                filter === c
                  ? 'bg-[#163832] text-white'
                  : 'bg-[#F6FBF7] text-[#235347] border border-[#DAF1DE]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-xl bg-[#F6FBF7] border border-[#DAF1DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#051F20]">{entry.action}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#DAF1DE] text-[#163832]">
                  {entry.target}
                </span>
              </div>
              <span className="text-[11px] text-[#235347] block mt-0.5">
                By {entry.actor} · {entry.timestamp}
              </span>
            </div>

            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto shrink-0">
              Verified
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AuditLogList;
