'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../services/auth.service';

export function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const words = ['League', 'Bot', 'Agent', 'Pervert'];
  const finalWord = ' Dhor';
  
  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    if (isTyping && !isDeleting) {
      // Typing forward
      if (displayedText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing current word, wait then start deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else if (isDeleting && !isTyping) {
      // Deleting backward
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next word
        const timeout = setTimeout(() => {
          if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
            setIsTyping(true);
            setIsDeleting(false);
          } else {
            // Cycle back to first word
            setCurrentWordIndex(0);
            setIsTyping(true);
            setIsDeleting(false);
          }
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [displayedText, currentWordIndex, isTyping, isDeleting, words]);

  const handleAddCrime = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const authService = new AuthService();
    const token = authService.getAccessToken();
    
    if (!token) {
      router.push('/login?redirect=' + encodeURIComponent('/add-crime'));
      return;
    }
    
    router.push('/add-crime');
  };

  const handleProfile = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const authService = new AuthService();
    const token = authService.getAccessToken();
    
    if (!token) {
      router.push('/login?redirect=' + encodeURIComponent('/profile'));
      return;
    }
    
    router.push('/profile');
  };

  const handleFeed = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-black border-b border-[#DC143C]/30 sticky top-0 z-50 backdrop-blur-lg bg-black/95 shadow-lg shadow-[#DC143C]/10">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              router.push('/');
            }}
            className="flex items-center gap-2 sm:gap-3 hover:drop-shadow-[0_0_15px_rgba(220,20,60,0.8)] transition-all duration-300 no-underline group"
          >
            <img 
              src="https://ik.imagekit.io/3q7x0peae/crimes/Gemini_Generated_Image_xrf6auxrf6auxrf6-removebg-preview.png"
              alt="League Dhor Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain filter group-hover:brightness-110 transition-all duration-300"
              onError={(e) => {
                // Fallback to text if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = document.createElement('span');
                fallback.className = 'text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#DC143C] via-[#FF1744] to-[#FF6B6B] bg-clip-text text-transparent tracking-wide';
                fallback.textContent = 'League Dhor';
                (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
              }}
            />
            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#DC143C] via-[#FF1744] to-[#FF6B6B] bg-clip-text text-transparent tracking-wide hidden sm:inline min-w-[200px] sm:min-w-[250px] md:min-w-[300px] inline-block">
              <span className="inline-block">
                {displayedText || '\u00A0'}
              </span>
              {displayedText && (
                <span className="inline-block ml-1 font-normal text-white">|</span>
              )}
              <span className="inline-block ml-1">{finalWord}</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a 
              href="/" 
              onClick={handleFeed}
              className="relative text-gray-300 hover:text-white font-semibold transition-all duration-300 no-underline px-3 py-2 group"
            >
              <span className="relative z-10">Feed</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DC143C]/20 to-[#FF1744]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#DC143C] to-[#FF1744] group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(220,20,60,0.8)]"></span>
            </a>
            <a 
              href="/add-crime" 
              onClick={handleAddCrime}
              className="relative text-gray-300 hover:text-white font-semibold transition-all duration-300 no-underline px-3 py-2 group"
            >
              <span className="relative z-10">Add Crime</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DC143C]/20 to-[#FF1744]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#DC143C] to-[#FF1744] group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(220,20,60,0.8)]"></span>
            </a>
            <a 
              href="/profile" 
              onClick={handleProfile}
              className="relative text-gray-300 hover:text-white font-semibold transition-all duration-300 no-underline px-3 py-2 group"
            >
              <span className="relative z-10">Profile</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DC143C]/20 to-[#FF1744]/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#DC143C] to-[#FF1744] group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(220,20,60,0.8)]"></span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-gradient-to-r from-[#DC143C] to-[#FF1744] transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2 shadow-[0_0_10px_rgba(220,20,60,0.8)]' : 'group-hover:shadow-[0_0_8px_rgba(220,20,60,0.6)]'
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-gradient-to-r from-[#DC143C] to-[#FF1744] transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'group-hover:shadow-[0_0_8px_rgba(220,20,60,0.6)]'
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-gradient-to-r from-[#DC143C] to-[#FF1744] transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2 shadow-[0_0_10px_rgba(220,20,60,0.8)]' : 'group-hover:shadow-[0_0_8px_rgba(220,20,60,0.6)]'
              }`}
            ></span>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-2 py-2 border-t border-[#DC143C]/20">
            <a
              href="/"
              onClick={handleFeed}
              className="relative text-gray-300 hover:text-white font-semibold transition-all duration-300 no-underline px-4 py-3 rounded-lg group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Feed
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DC143C]/10 to-[#FF1744]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-[#DC143C] to-[#FF1744] group-hover:w-1 transition-all duration-300 shadow-[0_0_8px_rgba(220,20,60,0.6)]"></span>
            </a>
            <a
              href="/add-crime"
              onClick={handleAddCrime}
              className="relative text-gray-300 hover:text-white font-semibold transition-all duration-300 no-underline px-4 py-3 rounded-lg group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Crime
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DC143C]/10 to-[#FF1744]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-[#DC143C] to-[#FF1744] group-hover:w-1 transition-all duration-300 shadow-[0_0_8px_rgba(220,20,60,0.6)]"></span>
            </a>
            <a
              href="/profile"
              onClick={handleProfile}
              className="relative text-gray-300 hover:text-white font-semibold transition-all duration-300 no-underline px-4 py-3 rounded-lg group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#DC143C]/10 to-[#FF1744]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-[#DC143C] to-[#FF1744] group-hover:w-1 transition-all duration-300 shadow-[0_0_8px_rgba(220,20,60,0.6)]"></span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
