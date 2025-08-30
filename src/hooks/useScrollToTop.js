import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  // Handle page refresh and initial load
  useEffect(() => {
    // Scroll to top on initial load
    if (window.scrollY > 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }

    // Handle page refresh
    const handleBeforeUnload = () => {
      // Store current scroll position
      sessionStorage.setItem('scrollPosition', window.scrollY);
    };

    const handleLoad = () => {
      // Clear stored scroll position and scroll to top
      sessionStorage.removeItem('scrollPosition');
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);
};
