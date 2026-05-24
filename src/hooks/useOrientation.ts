import { useEffect, useState } from 'react';

const getOrientationState = () => {
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isMobile =
    (isCoarsePointer && window.innerWidth <= 1024) || window.innerWidth <= 640;
  const shouldShowRotatePrompt = isMobile && isPortrait;

  return { isMobile, isPortrait, shouldShowRotatePrompt };
};

export const useOrientation = () => {
  const [state, setState] = useState(getOrientationState);

  useEffect(() => {
    const update = () => setState(getOrientationState());

    const portraitMq = window.matchMedia('(orientation: portrait)');
    const coarseMq = window.matchMedia('(pointer: coarse)');

    portraitMq.addEventListener('change', update);
    coarseMq.addEventListener('change', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      portraitMq.removeEventListener('change', update);
      coarseMq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return state;
};
