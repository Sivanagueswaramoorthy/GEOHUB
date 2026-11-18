import React from 'react';
import hackerImg from '../../assets/hacker-laptop-clean.png';

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
      className={`relative flex items-end justify-center shrink-0 select-none ${className}`}
      title="SuperAdmin Cyber Security Engine"
    >
      {/* Soft Ambient Mint Glow behind the laptop & hacker */}
      <div
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(218, 241, 222, 0.65) 0%, rgba(218, 241, 222, 0.2) 55%, transparent 75%)',
        }}
        className={`absolute -inset-2.5 rounded-2xl pointer-events-none transition-opacity duration-300 ${
          isPinging ? 'opacity-100 animate-pulse' : 'opacity-70'
        }`}
      />

      {/* Clean Hacker Character Graphic with smooth subtle idle hover */}
      <div className="relative z-10 transition-transform duration-300 hover:scale-102">
        <img
          src={hackerImg}
          alt="SuperAdmin Cyber Hacker Terminal"
          className="w-24 sm:w-28 md:w-32 h-auto object-contain pointer-events-none block drop-shadow-xs"
          loading="eager"
        />
      </div>
    </div>
  );
};

export default AnimatedHackerIllustration;
