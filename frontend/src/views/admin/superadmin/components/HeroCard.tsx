import React from 'react';
import { RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { botanicalTheme } from '../theme';

export interface HeroCardProps {
  onRefresh: () => void;
  isSyncing: boolean;
  onlineModulesCount: number;
  totalModulesCount: number;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  onRefresh,
  isSyncing,
  onlineModulesCount,
  totalModulesCount,
}) => {
  return (
    <section
      aria-label="SuperAdmin Master Status"
      className="rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden select-none"
      style={{
        background: botanicalTheme.gradients.heroDark,
        boxShadow: botanicalTheme.shadows.hero,
        border: '1px solid rgba(218, 241, 222, 0.22)',
      }}
    >
      {/* Ambient Top Glow Orbs */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none opacity-20"
        style={{ background: botanicalTheme.gradients.ambientGlow }}
      />

      <div className="relative z-10 flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar squircle */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0 border"
              style={{
                backgroundColor: botanicalTheme.colors.paleMint,
                color: botanicalTheme.colors.forestDark,
                borderColor: botanicalTheme.colors.softSage,
              }}
            >
              SA
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  SuperAdmin Master Command Cockpit
                </h1>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs"
                  style={{
                    backgroundColor: botanicalTheme.colors.paleMint,
                    color: botanicalTheme.colors.forestDark,
                  }}
                >
                  <ShieldCheck size={12} strokeWidth={2.4} />
                  <span>Master Authority</span>
                </span>
              </div>
              <p
                className="text-xs mt-0.5 leading-relaxed"
                style={{ color: 'rgba(218, 241, 222, 0.9)' }}
              >
                Super Admin · Universal operations governance, dynamic module switches, and institutional provisioning
              </p>
            </div>
          </div>

          {/* Sync / Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isSyncing}
            aria-label="Synchronize data with TiDB Cloud"
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border touch-target-44 shrink-0"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderColor: 'rgba(218, 241, 222, 0.28)',
              color: '#DAF1DE',
            }}
            title="Click to sync with remote TiDB Cloud MySQL"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* Quick status line */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/15">
          <span className="flex items-center gap-1.5" style={{ color: '#8EB69B' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TiDB Cloud (Port 3306) Connected</span>
          </span>
          <span className="font-semibold text-white/90">
            {onlineModulesCount} / {totalModulesCount} Modules Online
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroCard;
