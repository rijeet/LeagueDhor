'use client';

import { VerificationBadge } from '../VerificationBadge/VerificationBadge';
import { getSourceLinkInfo, getSourceDisplayText } from '../../utils/source-links';
import { formatDate } from '../../utils/date';

interface CrimeTimelineItemProps {
  crime: {
    id: string;
    location?: string;
    crimeImages: string[];
    sources: string[];
    tags?: string[];
    verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'AI_GENERATED';
    createdAt: string;
    updatedAt: string;
  };
}

export function CrimeTimelineItem({ crime }: CrimeTimelineItemProps) {
  return (
    <div className="bg-[#0a0a0a] border-2 border-[#DC143C]/30 rounded-lg shadow-lg shadow-[#DC143C]/10 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">
              {formatDate(crime.createdAt)}
            </span>
            {crime.location && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-400">{crime.location}</span>
              </>
            )}
          </div>
        </div>
        <VerificationBadge status={crime.verificationStatus} />
      </div>

      {crime.crimeImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {crime.crimeImages.map((image, idx) => (
            <img
              key={idx}
              src={image}
              alt={`Crime evidence ${idx + 1}`}
              className="w-full h-32 object-cover rounded border border-[#DC143C]/20"
            />
          ))}
        </div>
      )}

      {crime.sources.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-300 mb-2">Sources:</p>
          <div className="space-y-2">
            {crime.sources.map((source, idx) => {
              const sourceInfo = getSourceLinkInfo(source);
              return (
                <a
                  key={idx}
                  href={source.startsWith('http') ? source : `https://${source}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#DC143C]/30 rounded-md text-xs text-gray-300 hover:bg-[#2a2a2a] hover:border-[#DC143C] transition-all group"
                >
                  <span className="text-sm flex-shrink-0">{sourceInfo.icon}</span>
                  <span className="flex-1">
                    {sourceInfo.label} Link
                  </span>
                  <svg className="w-3 h-3 text-[#DC143C] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
