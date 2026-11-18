import React from 'react';
import hackerImg from '../../assets/hacker-laptop-transparent.png';

export interface AnimatedHackerIllustrationProps {
  className?: string;
  isPinging?: boolean;
}

export const AnimatedHackerIllustration: React.FC<AnimatedHackerIllustrationProps> = ({
  className = '',
  isPinging = false,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      title="SuperAdmin Cyber Security Engine"
    >
      {/* Ambient Mint Screen Glow radiating behind the hacker */}
      <div
        style={{
          background:
            'radial-gradient(circle, rgba(218, 241, 222, 0.75) 0%, rgba(142, 182, 155, 0.25) 50%, transparent 72%)',
        }}
        className={`absolute -inset-2 rounded-full pointer-events-none transition-all duration-300 ${
          isPinging ? 'scale-125 opacity-100 animate-pulse' : 'scale-100 opacity-60'
        }`}
      />

      {/* Floating Matrix Digital Glyphs */}
      <div className="absolute -top-1 -left-1 font-mono text-xs font-black text-[#163832] animate-pulse pointer-events-none">
        01
      </div>
      <div className="absolute -top-2 right-2 font-mono text-xs font-black text-[#235347] animate-bounce pointer-events-none">
        &gt;_
      </div>
      <div className="absolute bottom-1 -left-2 font-mono text-xs font-bold text-[#8EB69B] opacity-80 pointer-events-none">
        SYS
      </div>

      {/* Hacker Character Image with gentle floating breathing keyframe */}
      <div className="relative z-10 transition-transform duration-300 hover:scale-105">
        <img
          src={hackerImg}
          alt="SuperAdmin Cyber Hacker Terminal"
          className="w-24 h-auto sm:w-28 md:w-32 object-contain drop-shadow-md pointer-events-none"
          loading="eager"
        />

        {/* Laptop Screen Cyber Laser Scanline Beam */}
        <div
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(218, 241, 222, 0.85) 50%, transparent 100%)',
          }}
          className="absolute right-3 bottom-3 w-8 sm:w-10 h-1.5 rounded-full animate-scan-laser pointer-events-none"
        />

        {/* Live Terminal Connection Ping Beacon */}
        <div className="absolute bottom-1.5 right-1.5 flex items-center justify-center">
          <span
            style={{ backgroundColor: '#163832' }}
            className="w-2 h-2 rounded-full ring-2 ring-white shadow-2xs"
          />
          <span
            style={{ backgroundColor: '#8EB69B' }}
            className="absolute w-3.5 h-3.5 rounded-full animate-ping opacity-60 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedHackerIllustration;
