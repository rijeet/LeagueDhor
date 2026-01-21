'use client';

import { CrimeTimelineItem } from './CrimeTimelineItem';

interface Crime {
  id: string;
  location?: string;
  crimeImages: string[];
  sources: string[];
  tags?: string[];
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'AI_GENERATED';
  createdAt: string;
  updatedAt: string;
}

interface CrimeTimelineProps {
  crimes: Crime[];
}

export function CrimeTimeline({ crimes }: CrimeTimelineProps) {
  if (crimes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No crimes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {crimes.map((crime) => (
        <CrimeTimelineItem key={crime.id} crime={crime} />
      ))}
    </div>
  );
}
