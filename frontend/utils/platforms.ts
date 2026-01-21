export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'snapchat' | 'youtube' | 'other';

export interface ProfileUrl {
  platform: Platform;
  url: string;
}

export const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'snapchat', label: 'Snapchat', icon: '👻' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'other', label: 'Other', icon: '🔗' },
];

export function getPlatformIcon(platform: Platform): string {
  const platformData = PLATFORMS.find(p => p.value === platform);
  return platformData?.icon || '🔗';
}

export function getPlatformLabel(platform: Platform): string {
  const platformData = PLATFORMS.find(p => p.value === platform);
  return platformData?.label || 'Other';
}

export function detectPlatform(url: string): Platform {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) return 'facebook';
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('tiktok.com')) return 'tiktok';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
  if (urlLower.includes('snapchat.com')) return 'snapchat';
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  return 'other';
}
