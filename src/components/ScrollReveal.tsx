
import { useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ children }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if browser supports IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach((reveal) => {
        reveal.classList.add('active');
      });
      return;
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once the animation has played, we can unobserve the element
          observerRef.current?.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    });

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((reveal) => {
      observerRef.current?.observe(reveal);
    });

    return () => {
      if (observerRef.current) {
        reveals.forEach((reveal) => {
          observerRef.current?.unobserve(reveal);
        });
      }
    };
  }, []);

  return <>{children}</>;
};

export default ScrollReveal;
