import React from 'react';
import cloudMascot from '../../assets/cloud-mascot.png';
import geoLeafEmblem from '../../assets/geo-leaf-emblem.png';

export interface LoginSceneProps {
  mood?: string;
  isTabVisible?: boolean;
  className?: string;
}

export const LoginScene: React.FC<LoginSceneProps> = ({ className = '' }) => {
  return (
    <section aria-hidden="true" className={`flex flex-col items-center text-center space-y-3 select-none ${className}`}>
      {/* 3D Sprout Cloud Mascot with Gentle Float & Breathing Shadow */}
      <div className="relative flex flex-col items-center justify-center pt-1">
        <div className="mascot-cloud-bob flex items-center justify-center">
          <img
            src={cloudMascot}
            alt="Green Eco Sprout Mascot"
            style={{
              width: '124px',
              height: '124px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 24px rgba(5, 31, 32, 0.12))',
            }}
            className="pointer-events-none select-none"
          />
        </div>
        {/* Soft Breathing Ground Shadow */}
        <div
          className="mascot-cloud-shadow w-24 h-3 rounded-full bg-[#051F20] blur-[4px] -mt-1 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Official Leaf Emblem inside Luxury Glass Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DAF1DE] shadow-[0_2px_8px_rgba(5,31,32,0.04)] select-none">
        <img
          src={geoLeafEmblem}
          alt="Green Eco Organization logo"
          style={{ height: '20px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
          className="select-none"
        />
        <span className="text-xs font-bold text-[#163832] tracking-wide">
          Green Eco Organization
        </span>
      </div>
    </section>
  );
};

export default LoginScene;
