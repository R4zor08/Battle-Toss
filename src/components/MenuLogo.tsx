import React from 'react';

const WingSwoosh: React.FC<{ mirrored?: boolean; gradId: string }> = ({ mirrored, gradId }) => (
  <svg
    className={`menu-wing ${mirrored ? 'menu-wing-mirror' : ''}`}
    viewBox="0 0 52 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden>
    <path
      d="M2 24 C10 8, 26 3, 48 12 L44 16 C30 9, 16 13, 6 24 Z"
      fill={`url(#${gradId})`}
      stroke="rgba(210,220,240,0.7)"
      strokeWidth="0.6"
    />
    <path
      d="M8 20 C18 10, 32 8, 42 14"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1"
      fill="none"
    />
    <defs>
      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f4f7ff" />
        <stop offset="45%" stopColor="#b0c0d8" />
        <stop offset="100%" stopColor="#5a7088" />
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
    <g transform="translate(140, 72)">
      <rect x="-5" y="-50" width="10" height="62" rx="2" fill="#9a7820" transform="rotate(-38)" />
      <polygon points="-20,-48 -5,-64 10,-48" fill="#c8c8c8" transform="rotate(-38)" />
      <rect x="-5" y="-50" width="10" height="62" rx="2" fill="#9a7820" transform="rotate(38)" />
      <polygon points="-20,-48 -5,-64 10,-48" fill="#c8c8c8" transform="rotate(38)" />
    </g>
    <g transform="translate(88, 118)">
      <rect x="-11" y="-18" width="22" height="32" rx="4" fill="#5a2480" stroke="#a060c8" strokeWidth="1.5" />
      <rect x="-5" y="-26" width="10" height="9" rx="2" fill="#999" />
      <ellipse cx="0" cy="-4" rx="7" ry="10" fill="#d060ff" opacity="0.75" />
    </g>
    <g transform="translate(192, 118)">
      <rect x="-11" y="-18" width="22" height="32" rx="4" fill="#1f6048" stroke="#40a878" strokeWidth="1.5" />
      <rect x="-5" y="-26" width="10" height="9" rx="2" fill="#999" />
      <ellipse cx="0" cy="-4" rx="7" ry="10" fill="#50e890" opacity="0.75" />
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

export const MenuViewportBackground: React.FC = () => (
  <div className="menu-viewport-bg" aria-hidden>
    <div className="menu-bokeh menu-bokeh-bottom" aria-hidden />
    <div className="menu-particles" aria-hidden>
      {PARTICLE_POSITIONS.map((p, i) => (
        <span
          key={i}
          className="menu-particle"
          style={{ left: p.left, top: p.top, animationDelay: p.delay }}
        />
      ))}
    </div>
  </div>
);

export const MenuBackground: React.FC = () => (
  <>
    <div className="menu-portal-burst" aria-hidden />
    <div className="menu-bokeh menu-bokeh-warm" aria-hidden />
    <div className="menu-bokeh menu-bokeh-cool" aria-hidden />
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
