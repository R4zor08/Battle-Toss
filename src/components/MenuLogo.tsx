import React from 'react';

const WingSwoosh: React.FC<{ mirrored?: boolean; gradId: string }> = ({ mirrored, gradId }) => (
  <svg
    className={`menu-wing ${mirrored ? 'menu-wing-mirror' : ''}`}
    viewBox="0 0 48 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden>
    <path
      d="M4 20 C12 8, 28 4, 44 12 L40 16 C26 10, 14 14, 6 20 Z"
      fill={`url(#${gradId})`}
      stroke="rgba(200,210,230,0.6)"
      strokeWidth="0.5"
    />
    <defs>
      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8eef8" />
        <stop offset="50%" stopColor="#a0b0c8" />
        <stop offset="100%" stopColor="#607080" />
      </linearGradient>
    </defs>
  </svg>
);

const PortalIcons: React.FC = () => (
  <svg
    className="menu-portal-icons"
    viewBox="0 0 280 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden>
    <g transform="translate(140, 100)">
      <rect x="-4" y="-55" width="8" height="70" rx="2" fill="#8b6914" transform="rotate(-35)" />
      <polygon points="-18,-55 -4,-70 10,-55" fill="#aaa" transform="rotate(-35)" />
      <rect x="-4" y="-55" width="8" height="70" rx="2" fill="#8b6914" transform="rotate(35)" />
      <polygon points="-18,-55 -4,-70 10,-55" fill="#aaa" transform="rotate(35)" />
    </g>
    <g transform="translate(75, 155)">
      <rect x="-12" y="-20" width="24" height="35" rx="4" fill="#6a2d8a" stroke="#9a4dba" strokeWidth="1.5" />
      <rect x="-6" y="-28" width="12" height="10" rx="2" fill="#888" />
      <ellipse cx="0" cy="-5" rx="8" ry="12" fill="#cc44ff" opacity="0.7" />
    </g>
    <g transform="translate(205, 155)">
      <rect x="-12" y="-20" width="24" height="35" rx="4" fill="#2d6a4a" stroke="#4dba7a" strokeWidth="1.5" />
      <rect x="-6" y="-28" width="12" height="10" rx="2" fill="#888" />
      <ellipse cx="0" cy="-5" rx="8" ry="12" fill="#44ff88" opacity="0.7" />
    </g>
  </svg>
);

const PARTICLE_POSITIONS: { left: string; top: string; delay: string }[] = [
  { left: '12%', top: '18%', delay: '0s' },
  { left: '22%', top: '35%', delay: '0.5s' },
  { left: '8%', top: '55%', delay: '1.2s' },
  { left: '35%', top: '12%', delay: '0.3s' },
  { left: '48%', top: '8%', delay: '1.8s' },
  { left: '62%', top: '15%', delay: '0.7s' },
  { left: '78%', top: '28%', delay: '1.4s' },
  { left: '88%', top: '45%', delay: '0.2s' },
  { left: '72%', top: '58%', delay: '2.1s' },
  { left: '55%', top: '72%', delay: '1s' },
  { left: '30%', top: '68%', delay: '1.6s' },
  { left: '15%', top: '78%', delay: '0.9s' },
  { left: '92%', top: '72%', delay: '2.4s' },
  { left: '42%', top: '42%', delay: '0.4s' },
  { left: '65%', top: '38%', delay: '1.1s' },
  { left: '25%', top: '48%', delay: '1.9s' },
];

export const MenuBackground: React.FC = () => (
  <>
    <div className="menu-bokeh menu-bokeh-warm" aria-hidden />
    <div className="menu-bokeh menu-bokeh-cool" aria-hidden />
    <div className="menu-particles" aria-hidden>
      {PARTICLE_POSITIONS.map((p, i) => (
        <span
          key={i}
          className="menu-particle"
          style={{ left: p.left, top: p.top, animationDelay: p.delay }}
        />
      ))}
    </div>
    <div className="menu-sparkle" aria-hidden />
  </>
);

export const MenuLogo: React.FC = () => (
  <div className="menu-logo-wrap">
    <div className="menu-portal-ring" aria-hidden />
    <div className="menu-portal-glow" aria-hidden />
    <PortalIcons />
    <div className="menu-title-stack">
      <h1 className="menu-title-main">
        <span className="menu-title-battle">BATTLE </span>
        <span className="menu-title-toss">TOSS</span>
      </h1>
      <div className="menu-masters-row">
        <WingSwoosh gradId="wingGradL" />
        <h2 className="menu-title-masters">MASTERS</h2>
        <WingSwoosh mirrored gradId="wingGradR" />
      </div>
    </div>
  </div>
);
