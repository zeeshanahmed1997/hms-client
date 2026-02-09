'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/src/redux/hooks';
import { initializeAuth } from '@/src/redux/slices/authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This looks at localStorage and puts the user back into Redux
    dispatch(initializeAuth());
    setIsMounted(true);
  }, [dispatch]);

  // While the app is "waking up" and checking localStorage, 
  // we show a loading screen so the user doesn't see "Guest"
  if (!isMounted) {
    return (
      <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
        <div className="spinner-grow text-primary mb-3" role="status"></div>
        <h5 className="text-muted fw-light">MediCare HMS Loading...</h5>
      </div>
    ); 
  }

  return <>{children}</>;
}