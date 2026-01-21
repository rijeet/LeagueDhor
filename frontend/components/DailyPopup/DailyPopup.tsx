'use client';

import { useEffect, useState } from 'react';

export function DailyPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popup should be shown after login
    const checkAndShowPopup = () => {
      const shouldShowAfterLogin = localStorage.getItem('showPopupAfterLogin');
      if (shouldShowAfterLogin === 'true') {
        setIsVisible(true);
        localStorage.removeItem('showPopupAfterLogin');
      }
    };

    // Check immediately
    checkAndShowPopup();

    // Listen for custom event (triggered after login/register)
    const handleShowPopup = () => {
      setIsVisible(true);
    };

    window.addEventListener('showPopupAfterLogin', handleShowPopup);
    
    // Also listen for storage events (in case login happens in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showPopupAfterLogin' && e.newValue === 'true') {
        setIsVisible(true);
        localStorage.removeItem('showPopupAfterLogin');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes (in case event doesn't fire)
    const interval = setInterval(checkAndShowPopup, 500);
    
    return () => {
      window.removeEventListener('showPopupAfterLogin', handleShowPopup);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative bg-[#0a0a0a] border-2 border-[#DC143C] rounded-lg shadow-2xl shadow-[#DC143C]/50 p-4 sm:p-6 max-w-md w-full mx-4">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gradient-to-r from-[#DC143C] to-[#8B0000] hover:from-[#FF1744] hover:to-[#DC143C] text-white rounded-full border-2 border-[#DC143C] transition-all duration-300 z-10 shadow-lg shadow-[#DC143C]/30"
          aria-label="Close popup"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="w-full">
          <img
            src="https://ik.imagekit.io/3q7x0peae/crimes/osman8.jpg"
            alt="Daily notice"
            className="w-full h-auto rounded-lg border-2 border-[#DC143C]/50 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
}
