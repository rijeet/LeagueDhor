'use client';

import { useEffect, useState } from 'react';

export function CountdownFooter() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Starting date: December 12, 2025, 02:30:00 PM (Bangladesh time - UTC+6)
    // This is a BACKWARD countdown - showing time ELAPSED since the past date
    const startDate = new Date('2025-12-12T14:30:00+06:00').getTime();

    const calculateTimeElapsed = () => {
      const now = new Date().getTime();
      // Calculate difference from past to present (backward countdown)
      const difference = now - startDate;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        // If current time is before start date (shouldn't happen, but safety check)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Calculate immediately on mount
    calculateTimeElapsed();

    // Update every second
    const interval = setInterval(calculateTimeElapsed, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative bg-black border-t-2 border-[#DC143C]/50 mt-auto overflow-hidden">
      {/* Gritty texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DC143C' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Red accent glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#DC143C]/5 via-transparent to-transparent"></div>
      
      <div className="relative container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Bengali Title */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-wide px-2" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
            বিচারহীনতার কাউন্টডাউন
          </h2>
          <div className="h-0.5 sm:h-1 w-20 sm:w-24 md:w-32 mx-auto bg-gradient-to-r from-transparent via-[#DC143C] to-transparent"></div>
        </div>

        {/* Countdown Timer - All in one row */}
        <div className="flex flex-nowrap justify-center items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-6 overflow-x-auto px-2">
          {/* Days */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[#DC143C]/20 blur-xl"></div>
              <div className="relative bg-[#0a0a0a] border-2 border-[#DC143C] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 xl:px-6 xl:py-4 shadow-lg shadow-[#DC143C]/50">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-[#DC143C] tabular-nums whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-1.5 md:mt-2 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
              দিন
            </div>
          </div>

          {/* Separator */}
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-[#DC143C] self-center flex-shrink-0">:</div>

          {/* Hours */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[#DC143C]/20 blur-xl"></div>
              <div className="relative bg-[#0a0a0a] border-2 border-[#DC143C] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 xl:px-6 xl:py-4 shadow-lg shadow-[#DC143C]/50">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-[#DC143C] tabular-nums whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-1.5 md:mt-2 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
              ঘণ্টা
            </div>
          </div>

          {/* Separator */}
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-[#DC143C] self-center flex-shrink-0">:</div>

          {/* Minutes */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[#DC143C]/20 blur-xl"></div>
              <div className="relative bg-[#0a0a0a] border-2 border-[#DC143C] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 xl:px-6 xl:py-4 shadow-lg shadow-[#DC143C]/50">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-[#DC143C] tabular-nums whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-1.5 md:mt-2 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
              মিনিট
            </div>
          </div>

          {/* Separator */}
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-[#DC143C] self-center flex-shrink-0">:</div>

          {/* Seconds */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[#DC143C]/20 blur-xl animate-pulse"></div>
              <div className="relative bg-[#0a0a0a] border-2 border-[#DC143C] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 xl:px-6 xl:py-4 shadow-lg shadow-[#DC143C]/50">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-[#DC143C] tabular-nums whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
            <div className="mt-1 sm:mt-1.5 md:mt-2 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-300 uppercase tracking-wider whitespace-nowrap" style={{ fontFamily: 'Noto Sans Bengali, Arial, sans-serif' }}>
              সেকেন্ড
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
