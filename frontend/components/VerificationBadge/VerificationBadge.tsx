'use client';

type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'FALSE' | 'AI_GENERATED';

interface VerificationBadgeProps {
  status: VerificationStatus;
}

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const config = {
    UNVERIFIED: { 
      label: 'Unverified', 
      icon: '⏳', 
      color: 'bg-gray-100 text-gray-800',
    },
    VERIFIED: { 
      label: 'Verified', 
      icon: '✔', 
      color: 'bg-green-500 text-white',
    },
    FALSE: { 
      label: 'False', 
      icon: '❌', 
      color: 'bg-red-600 text-white',
    },
    AI_GENERATED: { 
      label: 'False AI-generated', 
      icon: '🤖', 
      color: 'bg-amber-700 text-white',
    },
  };

  const { label, icon, color } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${color} shadow-md`}
      title={label}
    >
      <span className="text-xs">{icon}</span>
      <span>{label}</span>
    </span>
  );
}
