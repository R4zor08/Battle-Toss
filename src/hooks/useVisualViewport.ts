import { useLayoutEffect } from 'react';

const updateViewportVars = () => {
  const root = document.documentElement;
  const vv = window.visualViewport;

  if (vv) {
    root.style.setProperty('--vvw', `${vv.width}px`);
    root.style.setProperty('--vvh', `${vv.height}px`);
    return;
  }

  root.style.setProperty('--vvw', `${window.innerWidth}px`);
  root.style.setProperty('--vvh', `${window.innerHeight}px`);
};

export const useVisualViewport = () => {
  useLayoutEffect(() => {
    updateViewportVars();

    const vv = window.visualViewport;

    vv?.addEventListener('resize', updateViewportVars);
    vv?.addEventListener('scroll', updateViewportVars);
    window.addEventListener('resize', updateViewportVars);
    window.addEventListener('orientationchange', updateViewportVars);

    return () => {
      vv?.removeEventListener('resize', updateViewportVars);
      vv?.removeEventListener('scroll', updateViewportVars);
      window.removeEventListener('resize', updateViewportVars);
      window.removeEventListener('orientationchange', updateViewportVars);
    };
  }, []);
};
