import React, { useEffect, useRef } from 'react';

export interface PageTransitionProps {
  tabKey: string;
  children: React.ReactNode;
  className?: string;
  scrollToTop?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  tabKey,
  children,
  className = '',
  scrollToTop = true,
}) => {
  const prevKeyRef = useRef(tabKey);

  useEffect(() => {
    if (prevKeyRef.current !== tabKey) {
      prevKeyRef.current = tabKey;
      if (scrollToTop && typeof window !== 'undefined') {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          window.scrollTo(0, 0);
        }
      }
    }
  }, [tabKey, scrollToTop]);

  return (
    <div
      key={tabKey}
      data-testid="page-transition-container"
      className={`page-transition-enter w-full ${className}`}
      style={{
        width: '100%',
        minHeight: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;

