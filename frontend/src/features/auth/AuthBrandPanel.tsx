import React from 'react';
import { QrCode, CalendarCheck2, FileSpreadsheet, Shield } from 'lucide-react';
import { orgConfig } from '../../config/org';

export const AuthBrandPanel: React.FC = () => {
  return (
    <aside className="auth-brand-panel" aria-label="Brand Overview">
      {/* Background Topographic Contour Lines SVG */}
      <svg
        className="brand-panel-topography"
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M-50 150 C 120 180, 240 80, 420 130 C 520 160, 620 280, 650 380"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M-80 220 C 140 250, 260 140, 450 200 C 560 240, 660 360, 700 470"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M-30 300 C 180 340, 300 220, 490 280 C 600 320, 680 440, 720 560"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M-60 390 C 160 430, 320 310, 520 370 C 620 410, 710 520, 750 650"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <path
          d="M-40 480 C 170 510, 340 400, 540 460 C 640 500, 730 610, 780 740"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="480" cy="220" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="480" cy="220" r="70" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Decorative Globe / Topographic Map Outline SVG */}
      <div className="brand-illustration-container" aria-hidden="true">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="200" cy="200" rx="160" ry="60" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" />
          <ellipse cx="200" cy="200" rx="60" ry="160" stroke="currentColor" strokeWidth="1.2" />
          <path d="M40 200 H 360" stroke="currentColor" strokeWidth="1.5" />
          <path d="M200 40 V 360" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M90 110 C 140 130, 160 170, 220 150 C 270 130, 290 90, 330 110"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M80 280 C 130 250, 180 290, 240 260 C 290 230, 320 270, 340 250"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      {/* Top Header */}
      <div className="brand-panel-header">
        <div className="brand-panel-logo-card">
          <img
            src={orgConfig.logoUrl}
            alt={`${orgConfig.orgName} Logo`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div>
          <div className="login-wordmark" style={{ marginBottom: 0 }}>
            <span className="wordmark-dark">{orgConfig.wordmarkPart1}</span>
            <span className="wordmark-brand">{orgConfig.wordmarkPart2}</span>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {orgConfig.department}
          </div>
        </div>
      </div>

      {/* Center Hero Content */}
      <div className="brand-panel-content">
        <h1 className="brand-panel-headline">
          Run your club,<br />end to end.
        </h1>

        <div className="brand-features-list">
          <div className="brand-feature-item">
            <div className="brand-feature-icon" aria-hidden="true">
              <QrCode size={24} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="brand-feature-title">Smart QR attendance</h3>
              <p className="brand-feature-desc">
                High-speed event check-ins with dynamic encrypted gate passes and instant attendance analytics.
              </p>
            </div>
          </div>

          <div className="brand-feature-item">
            <div className="brand-feature-icon" aria-hidden="true">
              <CalendarCheck2 size={24} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="brand-feature-title">Events and duties in one place</h3>
              <p className="brand-feature-desc">
                Organize schedules, assign volunteers across squads, and track execution checkpoints with live updates.
              </p>
            </div>
          </div>

          <div className="brand-feature-item">
            <div className="brand-feature-icon" aria-hidden="true">
              <FileSpreadsheet size={24} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="brand-feature-title">Reports and archives</h3>
              <p className="brand-feature-desc">
                Automated faculty dossiers, transparent treasurer ledger tracking, and synchronized documentation studios.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 flex items-center gap-3 pt-6 border-t border-slate-100 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Shield size={16} strokeWidth={1.75} /> Institutional Portal
        </span>
        <span>Secure Single Sign-On for accredited staff and student leaders.</span>
      </div>
    </aside>
  );
};
