'use client';

import { useRouter } from 'next/navigation';
import { formatLastUpdated } from '../../utils/date';

interface Crime {
  id: string;
  location?: string;
  profileUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PersonHeaderProps {
  person: {
    id: string;
    name: string;
    imageUrl?: string;
    slug: string;
  };
  crimes?: Crime[];
  tags?: string[];
}

export function PersonHeader({ person, crimes = [], tags = [] }: PersonHeaderProps) {
  const router = useRouter();

  const handleAddCrime = () => {
    router.push(`/add-crime?personId=${person.id}`);
  };

  // Get latest crime for location, profile URL and last updated
  const latestCrime = crimes.length > 0 ? crimes[0] : null;
  const location = latestCrime?.location;
  const lastUpdated = latestCrime ? formatLastUpdated(latestCrime.updatedAt) : null;

  return (
    <div className="bg-[#0a0a0a] border-2 border-[#DC143C]/30 rounded-lg shadow-xl shadow-[#DC143C]/10 p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {/* Profile Picture */}
        {person.imageUrl ? (
          <img
            src={person.imageUrl}
            alt={person.name}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border-2 border-[#DC143C]/30"
          />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-[#1a1a1a] border-2 border-[#DC143C]/30 flex items-center justify-center">
            <span className="text-xl sm:text-2xl">👤</span>
          </div>
        )}

        {/* Username */}
        <div className="flex-1 min-w-[150px]">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white uppercase tracking-wide">{person.name}</h1>
        </div>

        {/* Location (if available) */}
        {location && (
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#8B0000] text-white text-xs sm:text-sm font-bold uppercase border border-[#DC143C] rounded">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="whitespace-nowrap">{location}</span>
          </div>
        )}

        {/* Tags - Show first tag as badge */}
        {tags && tags.length > 0 && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#8B0000] text-white text-xs sm:text-sm font-bold uppercase border border-[#DC143C] rounded">
            {tags[0]}
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
            Last updated: {lastUpdated}
          </div>
        )}
      </div>

      {/* Add More Crime Button */}
      <div className="mt-4 sm:mt-6">
        <button
          onClick={handleAddCrime}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#DC143C] to-[#8B0000] hover:from-[#FF1744] hover:to-[#DC143C] text-white rounded-md font-semibold uppercase text-xs sm:text-sm tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#DC143C]/30 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>+ ADD MORE CRIME</span>
        </button>
      </div>
    </div>
  );
}
