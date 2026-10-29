import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, QrCode, Calendar, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  StatusChip,
  ProgressRing,
  PillButton,
} from '../../components/shared';

export const MyQrView: React.FC = () => {
  const { currentUser, events, showToast } = useApp();

  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [tokenSeed, setTokenSeed] = useState(() => Date.now().toString(36));

  const activeEvent = events.find((e) => e.status === 'live') || events[0] || {
    id: 'event_01',
    title: 'GEO FEST 2026',
    venue: 'Grand Auditorium',
  };

  // 60-second validity timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTokenSeed(Date.now().toString(36));
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setTokenSeed(Date.now().toString(36));
    setSecondsLeft(60);
    showToast('✓ Gate pass token refreshed.');
  };

  const dynamicQrPayload = `GEO-PASS:${activeEvent.id}:${currentUser.uid}:${tokenSeed}:${currentUser.rollNo || '21GEO001'}`;
  const progressPercent = Math.round((secondsLeft / 60) * 100);

  return (
    <div
      className="flex flex-col items-center gap-6 py-2 select-none animate-fadeIn"
      style={{
        background: 'radial-gradient(circle at 50% 30%, rgba(218, 241, 222, 0.7) 0%, rgba(246, 251, 247, 0) 70%), #F6FBF7',
      }}
    >
      {/* 1) Header: 1 headline "Chapter Pass", 1 subtitle "Dynamic gate QR pass" */}
      <div className="text-center">
        <h1
          className="text-2xl font-bold tracking-tight text-[#051F20]"
          style={{ fontSize: '28px', lineHeight: '32px' }}
        >
          Chapter Pass
        </h1>
        <p className="text-xs font-semibold text-[#235347] mt-1">
          Dynamic gate QR pass
        </p>
      </div>

      {/* 2) Large white 24px card over radial mint glow */}
      <div
        className="w-full max-w-sm bg-white p-7 flex flex-col items-center border border-[#DAF1DE] shadow-[0_10px_30px_rgba(5,31,32,0.08)]"
        style={{
          borderRadius: '24px',
        }}
      >
        {/* Active event chip */}
        <div className="mb-4">
          <StatusChip status="live" label={activeEvent.title} />
        </div>

        {/* Server-issued dynamic QR code */}
        <div className="p-4 rounded-3xl bg-[#F6FBF7] border border-[#DAF1DE] shadow-[0_4px_14px_rgba(5,31,32,0.04)] mb-5">
          <QRCodeSVG
            value={dynamicQrPayload}
            size={190}
            level="H"
            fgColor="#051F20"
            bgColor="transparent"
          />
        </div>

        {/* 60s ProgressRing countdown */}
        <div className="flex items-center gap-3 mb-5">
          <ProgressRing
            progress={progressPercent}
            size={44}
            strokeWidth={4}
            label={`${secondsLeft}s`}
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-[#051F20]">Token Countdown</span>
            <span className="text-xs font-medium text-[#235347]">Rotating security key</span>
          </div>
        </div>

        {/* Refresh pass ghost pill */}
        <div className="w-full mb-6">
          <PillButton
            variant="ghost"
            fullWidth
            onClick={handleRefresh}
            icon={<RefreshCw size={14} strokeWidth={2.2} />}
          >
            Refresh pass
          </PillButton>
        </div>

        {/* Scholar ID footer */}
        <div className="w-full pt-4 border-t border-[#DAF1DE] flex items-center justify-between text-xs text-[#235347]">
          <span className="font-bold text-[#051F20]">
            {currentUser.rollNo || '21GEO001'}
          </span>
          <span className="font-medium">
            {currentUser.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyQrView;
