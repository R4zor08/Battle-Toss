import React from 'react';
import { Smartphone } from 'lucide-react';
import { useOrientation } from '../hooks/useOrientation';

export const OrientationPrompt: React.FC = () => {
  const { shouldShowRotatePrompt } = useOrientation();

  if (!shouldShowRotatePrompt) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 text-white px-8 text-center pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Rotate device to landscape">
      <div className="orientation-prompt-icon mb-6 text-yellow-400">
        <Smartphone size={64} strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-wider mb-3">
        Rotate Your Device
      </h2>
      <p className="text-white/70 font-bold max-w-xs leading-relaxed">
        Battle Toss is best played in landscape mode. Turn your phone sideways to
        continue.
      </p>
    </div>
  );
};
