import { useLayoutEffect } from 'react';

const updateViewportVars = () => {
  const vv = window.visualViewport;
  if (!vv) return;

  const root = document.documentElement;
  root.style.setProperty('--vvw', `${vv.width}px`);
  root.style.setProperty('--vvh', `${vv.height}px`);
};

export const useVisualViewport = () => {
  useLayoutEffect(() => {
    updateViewportVars();

    const vv = window.visualViewport;
    if (!vv) {
      window.addEventListener('resize', updateViewportVars);
      return () => window.removeEventListener('resize', updateViewportVars);
    }

    vv.addEventListener('resize', updateViewportVars);
    vv.addEventListener('scroll', updateViewportVars);
    window.addEventListener('orientationchange', updateViewportVars);

    return () => {
      vv.removeEventListener('resize', updateViewportVars);
      vv.removeEventListener('scroll', updateViewportVars);
      window.removeEventListener('orientationchange', updateViewportVars);
    };
  }, []);
};
