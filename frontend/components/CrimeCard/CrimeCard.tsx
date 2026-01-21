'use client';

import { useRouter } from 'next/navigation';
import { PLATFORMS, Platform, getPlatformIcon } from '../../utils/platforms';
import { AuthService } from '../../services/auth.service';
import { formatTimestamp } from '../../utils/date';

interface Person {
  id: string;
  name: string;
  imageUrl?: string;
  slug: string;
}

interface Crime {
  id: string;
  location?: string;
  crimeImages: string[];
  profileUrl?: string; // Comma-separated platform:url pairs (e.g., "facebook:https://facebook.com/user,instagram:https://instagram.com/user")
  tags?: string[];
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'AI_GENERATED';
  createdAt: string;
  updatedAt: string;
}

interface CrimeCardProps {
  person: Person;
  latestCrime?: Crime | null;
  crimeCount?: number;
}

export function CrimeCard({ person, latestCrime, crimeCount = 0 }: CrimeCardProps) {
  const router = useRouter();

  const handleAddCrime = () => {
    const authService = new AuthService();
    const token = authService.getAccessToken();
    
    if (!token) {
      // Redirect to login if not authenticated
      router.push('/login?redirect=/add-crime?personId=' + encodeURIComponent(person.id));
      return;
    }
    
    router.push(`/add-crime?personId=${person.id}`);
  };

  const handleViewDetails = () => {
    router.push(`/person/${person.slug}`);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNVERIFIED':
        return 'bg-[#8B0000] text-white border-[#DC143C]';
      case 'VERIFIED':
        return 'bg-[#006400] text-white border-[#32CD32]';
      case 'FALSE':
        return 'bg-gray-700 text-gray-300 border-gray-600';
      case 'AI_GENERATED':
        return 'bg-[#4B0082] text-white border-[#9370DB]';
      default:
        return 'bg-[#8B0000] text-white border-[#DC143C]';
    }
  };

  // If no crime data, show person card without crime details
  if (!latestCrime) {
    return (
      <div className="bg-black border-2 border-[#DC143C] rounded-lg shadow-2xl overflow-hidden hover:border-[#FF0000] hover:shadow-[#DC143C]/50 transition-all duration-300">
        {/* Top Header Strip */}
        <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {person.imageUrl ? (
              <img
                src={person.imageUrl}
                alt={person.name}
                className="w-10 h-10 rounded object-cover border border-[#DC143C]/20 cursor-pointer hover:border-[#DC143C]/50 transition-colors"
                onClick={() => window.open(person.imageUrl, '_blank')}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%231a1a1a"/%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded bg-[#1a1a1a] border border-[#DC143C]/20 flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
            )}
            <div>
              <h3 className="font-bold text-white uppercase text-sm tracking-wide">
                {person.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">No crimes reported yet</p>
            </div>
          </div>
          <div className="px-2 py-1 bg-[#8B0000] text-white text-xs font-bold uppercase border border-[#DC143C] rounded">
            NO DATA
          </div>
        </div>

        {/* Main Body */}
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex flex-col items-center">
              {person.imageUrl ? (
                <img
                  src={person.imageUrl}
                  alt={person.name}
                  className="w-full sm:w-32 h-auto sm:h-32 rounded object-cover border-2 border-[#DC143C]/30 mb-2 sm:mb-3 cursor-pointer hover:border-[#DC143C]/60 transition-colors"
                  onClick={() => window.open(person.imageUrl, '_blank')}
                />
              ) : (
                <div className="w-full sm:w-32 aspect-square rounded bg-[#1a1a1a] border-2 border-[#DC143C]/30 flex items-center justify-center mb-2 sm:mb-3">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center border-2 border-[#8B0000] rounded-lg bg-[#0a0a0a] aspect-square sm:aspect-auto sm:h-32">
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">No evidence available</span>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
            <button
              onClick={handleAddCrime}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#8B0000] hover:bg-[#DC143C] text-white font-bold uppercase text-[10px] sm:text-xs tracking-wide rounded transition-all duration-300 shadow-lg shadow-[#DC143C]/20 hover:shadow-[#DC143C]/40 hover:glow-[#DC143C] border border-[#DC143C]/50"
            >
              + ADD MORE CRIME
            </button>
            <button
              onClick={handleViewDetails}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#8B0000] hover:bg-[#DC143C] text-white font-bold uppercase text-[10px] sm:text-xs tracking-wide rounded transition-all duration-300 shadow-lg shadow-[#DC143C]/20 hover:shadow-[#DC143C]/40 hover:glow-[#DC143C] border border-[#DC143C]/50"
            >
              VIEW DETAILS ›
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tags = latestCrime.tags || [];

  return (
    <div className="bg-black border-2 border-[#DC143C] rounded-lg shadow-2xl overflow-hidden hover:border-[#FF0000] hover:shadow-[#DC143C]/50 transition-all duration-300 h-[580px] sm:h-auto flex flex-col">
      {/* Top Header Strip */}
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0">
        {/* Name Row with FB Link */}
        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-0">
          {/* Profile Image */}
          {person.imageUrl ? (
            <img
              src={person.imageUrl}
              alt={person.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover border border-[#DC143C]/20 cursor-pointer hover:border-[#DC143C]/50 transition-colors flex-shrink-0"
              onClick={() => window.open(person.imageUrl, '_blank')}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%231a1a1a"/%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-[#1a1a1a] border border-[#DC143C]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm">👤</span>
            </div>
          )}
          
          {/* Name */}
          <h3 className="font-bold text-white uppercase text-xs sm:text-sm tracking-wide truncate min-w-0">
            {person.name}
          </h3>

          {/* FB Link - After Name */}
          {latestCrime.profileUrl && (() => {
            const profileUrls = latestCrime.profileUrl
              .split(',')
              .map(p => {
                const trimmed = p.trim();
                const firstColon = trimmed.indexOf(':');
                if (firstColon === -1) return null;
                const platform = trimmed.substring(0, firstColon).trim() as Platform;
                const url = trimmed.substring(firstColon + 1).trim();
                if (!PLATFORMS.find(pl => pl.value === platform)) return null;
                return { platform, url };
              })
              .filter((p): p is { platform: Platform; url: string } => p !== null && p.url.length > 0);

            if (profileUrls.length === 0) return null;
            const facebookUrl = profileUrls.find(p => p.platform === 'facebook');
            if (!facebookUrl) return null;

            return (
              <a
                href={facebookUrl.url.startsWith('http') ? facebookUrl.url : `https://${facebookUrl.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-[#1877F2] text-white rounded-full hover:bg-[#166FE5] transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
                title="Facebook"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            );
          })()}
        </div>

        {/* Info Row: Location, Status, Crime Count */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto pb-1 sm:pb-0 sm:mt-3 flex-shrink-0">
          {/* Location */}
          {latestCrime.location && (
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#8B0000] text-white text-[9px] sm:text-xs font-bold uppercase border border-[#DC143C] rounded flex items-center gap-1 sm:gap-1.5 flex-shrink-0 whitespace-nowrap">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate max-w-[100px] sm:max-w-none">{latestCrime.location}</span>
            </div>
          )}

          {/* Status Badge */}
          <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 ${getStatusColor(latestCrime.verificationStatus)} text-[9px] sm:text-xs font-bold uppercase border rounded flex-shrink-0 whitespace-nowrap`}>
            {latestCrime.verificationStatus}
          </div>

          {/* Crime Count */}
          {typeof crimeCount === 'number' && crimeCount > 0 && (
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#8B0000] text-white text-[9px] sm:text-xs font-bold uppercase border border-[#DC143C] rounded flex-shrink-0 whitespace-nowrap">
              {crimeCount} {crimeCount === 1 ? 'Crime' : 'Crimes'}
            </div>
          )}

          {/* Tags - Immediately after Crime Count (max 3) - Desktop only */}
          {tags.length > 0 && tags.slice(0, 3).map((tag, idx) => (
            <div
              key={idx}
              className="hidden sm:flex px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#8B0000] text-white text-[9px] sm:text-xs font-bold uppercase border border-[#DC143C] rounded flex-shrink-0 whitespace-nowrap"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Main Body - Two Column Layout */}
      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start flex-1 min-h-0 overflow-hidden">
        {/* Left Panel - Profile Image */}
        <div className="hidden sm:flex flex-col order-2 sm:order-1">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
            <div className="px-2 py-1 bg-[#8B0000] text-white text-[10px] sm:text-xs font-bold uppercase border border-[#DC143C] rounded flex items-center gap-1.5 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="tracking-wide">
                PROFILE PICTURE
              </span>
            </div>
          </div>
          <div className="w-full aspect-square">
            {person.imageUrl ? (
              <div className="w-full h-full aspect-square relative rounded overflow-hidden border-2 border-[#DC143C]/30 cursor-pointer hover:border-[#DC143C]/60 transition-colors">
                <img
                  src={person.imageUrl}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  onClick={() => window.open(person.imageUrl, '_blank')}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%231a1a1a"/%3E%3C/svg%3E';
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full aspect-square rounded bg-[#1a1a1a] border-2 border-[#DC143C]/30 flex items-center justify-center">
                <span className="text-4xl sm:text-6xl">👤</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Latest Evidence */}
        <div className="flex flex-col order-1 sm:order-2">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2">
            <div className="px-2 py-1 bg-[#8B0000] text-white text-[10px] sm:text-xs font-bold uppercase border border-[#DC143C] rounded flex items-center gap-1.5 sm:gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span className="tracking-wide">
                LATEST EVIDENCE
              </span>
            </div>
            {/* Last Updated - After LATEST EVIDENCE */}
            <span className="text-[9px] sm:text-xs text-white font-bold whitespace-nowrap flex-shrink-0">
              Last Updated: {formatTimestamp(latestCrime.updatedAt)}
            </span>
          </div>
          
          {latestCrime.crimeImages.length > 0 ? (
            <>
              <div className="relative border-2 border-[#8B0000] rounded-lg overflow-hidden bg-[#0a0a0a] aspect-square w-full flex items-center justify-center">
                <img
                  src={latestCrime.crimeImages[0]}
                  alt="Latest evidence"
                  className="max-w-full max-h-full w-auto h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(latestCrime.crimeImages[0], '_blank')}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-xs">Failed to load image</div>';
                    }
                  }}
                />
                {/* Blood drop icon overlay */}
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-[#DC143C] drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v2a1 1 0 01-2 0V9z" />
                  </svg>
                </div>
              </div>
              {/* Tags - Below Crime Image (Mobile only) */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:hidden">
                  {tags.slice(0, 3).map((tag, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-0.5 bg-[#8B0000] text-white text-[9px] font-bold uppercase border border-[#DC143C] rounded whitespace-nowrap"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="border-2 border-[#8B0000] rounded-lg bg-[#0a0a0a] aspect-square w-full flex items-center justify-center relative">
                <span className="text-xs text-gray-500 font-medium">No evidence image</span>
                <div className="absolute top-2 right-2">
                  <svg className="w-5 h-5 text-[#DC143C] drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v2a1 1 0 01-2 0V9z" />
                  </svg>
                </div>
              </div>
              {/* Tags - Below Crime Image (Mobile only) */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:hidden">
                  {tags.slice(0, 3).map((tag, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-0.5 bg-[#8B0000] text-white text-[9px] font-bold uppercase border border-[#DC143C] rounded whitespace-nowrap"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Row - Action Buttons */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={handleAddCrime}
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#8B0000] hover:bg-[#DC143C] text-white font-bold uppercase text-[10px] sm:text-xs tracking-wide rounded transition-all duration-300 shadow-lg shadow-[#DC143C]/20 hover:shadow-[#DC143C]/40 hover:glow-[#DC143C] border border-[#DC143C]/50"
        >
          + ADD MORE CRIME
        </button>
        <button
          onClick={handleViewDetails}
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#8B0000] hover:bg-[#DC143C] text-white font-bold uppercase text-[10px] sm:text-xs tracking-wide rounded transition-all duration-300 shadow-lg shadow-[#DC143C]/20 hover:shadow-[#DC143C]/40 hover:glow-[#DC143C] border border-[#DC143C]/50"
        >
          VIEW DETAILS ›
        </button>
      </div>
    </div>
  );
}
