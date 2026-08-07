import { useEffect, useRef } from 'react';

type UseIdleTimeoutProps = {
  onIdle: () => void;
  idleTime?: number; // in milliseconds (default: 15 minutes)
};

export const useIdleTimeout = ({ onIdle, idleTime = 15 * 60 * 1000 }: UseIdleTimeoutProps) => {
  const timeoutRef = useRef<number | NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Update ref to latest callback if it changes, without triggering useEffect
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as NodeJS.Timeout);
      }
      timeoutRef.current = setTimeout(() => {
        onIdleRef.current();
      }, idleTime);
    };

    // Events to monitor for user activity
    const events = ['mousemove', 'keydown', 'wheel', 'scroll', 'touchstart'];

    // Add event listeners
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer for the first time
    resetTimer();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current as NodeJS.Timeout);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [idleTime]); // Notice onIdle is no longer a dependency here!
};
