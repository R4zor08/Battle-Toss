import { useEffect, useState } from 'react';

const MOBILE_MAX_WIDTH = 768;

const getOrientationState = () => {
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isNarrowViewport = window.innerWidth <= MOBILE_MAX_WIDTH;
  const isMobile = isCoarsePointer || isNarrowViewport;
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
