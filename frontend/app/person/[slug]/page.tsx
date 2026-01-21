'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PersonService, Person } from '../../../services/person.service';
import { CrimeService, Crime } from '../../../services/crime.service';
import { PersonHeader } from '../../../components/PersonHeader/PersonHeader';
import { PLATFORMS, Platform, getPlatformIcon } from '../../../utils/platforms';
import { getSourceLinkInfo, getSourceDisplayText } from '../../../utils/source-links';
import { AuthService } from '../../../services/auth.service';
import { formatDate, formatTime } from '../../../utils/date';

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const personService = new PersonService();
    const crimeService = new CrimeService();

    Promise.all([
      personService.getBySlug(slug),
      crimeService.getByPersonSlug(slug),
    ])
      .then(([personData, crimesData]) => {
        setPerson(personData);
        setCrimes(crimesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);


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

  if (loading) {
    return (
      <main className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-[#1a1a1a] rounded-lg h-32 animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!person) {
    return (
      <main className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-[#0a0a0a] rounded-xl shadow-lg border border-[#DC143C]/20 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4 text-gray-400">👤</div>
              <p className="text-gray-300 text-lg font-medium">Person not found.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Get all unique tags from all crimes
  const allTags = Array.from(new Set(crimes.flatMap(crime => crime.tags || [])));

  // Get all unique profile URLs from all crimes
  const allProfileUrls = Array.from(
    new Set(
      crimes
        .flatMap(crime => {
          if (!crime.profileUrl) return [];
          return crime.profileUrl
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
        })
    )
  ).map(p => ({ platform: p.platform, url: p.url }));

  return (
    <main className="min-h-screen bg-black text-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-[#DC143C]/30 hover:border-[#DC143C]/50 rounded-lg transition-all duration-300 group"
        >
          <svg 
            className="w-5 h-5 text-[#DC143C] group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Crime Feed</span>
        </button>

        <PersonHeader person={person} crimes={crimes} tags={allTags} />
        
        {/* Crimes Section */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6 border-b border-[#1a1a1a] pb-4">
            <svg className="w-6 h-6 text-[#DC143C]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
              All Crime Reports
            </h2>
            <span className="text-sm text-gray-400 ml-auto">
              {crimes.length} {crimes.length === 1 ? 'report' : 'reports'}
            </span>
          </div>

          {crimes.length === 0 ? (
            <div className="bg-[#0a0a0a] rounded-xl shadow-lg border border-[#DC143C]/20 p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4 text-gray-400">📋</div>
                <p className="text-gray-300 text-lg font-medium">No crime reports yet.</p>
                <button
                  onClick={() => router.push(`/add-crime?personId=${person.id}`)}
                  className="mt-6 px-6 py-3 bg-[#8B0000] hover:bg-[#DC143C] text-white font-bold uppercase text-sm tracking-wide rounded transition-all duration-300 shadow-lg shadow-[#DC143C]/20 hover:shadow-[#DC143C]/40 border border-[#DC143C]/50"
                >
                  + ADD CRIME REPORT
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {crimes.map((crime, index) => (
                <div
                  key={crime.id}
                  className="bg-[#0a0a0a] border-2 border-[#DC143C]/30 rounded-lg shadow-xl overflow-hidden hover:border-[#DC143C]/50 transition-all duration-300"
                >
                  {/* Crime Header */}
                  <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-[#8B0000] rounded flex items-center justify-center border border-[#DC143C]/30">
                        <span className="text-white font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {crime.location && (
                            <>
                              <svg className="w-4 h-4 text-[#DC143C] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs sm:text-sm text-gray-300">{crime.location}</span>
                            </>
                          )}
                          {crime.tags && crime.tags.length > 0 && (
                            <>
                              <span className="text-gray-600">•</span>
                              <div className="flex flex-wrap gap-1">
                                {crime.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-[#1a1a1a] text-[#32CD32] text-[10px] font-semibold rounded border border-[#32CD32]/30"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">
                            Reported: {formatDate(crime.createdAt)} at {formatTime(crime.createdAt)}
                          </span>
                          {crime.updatedAt !== crime.createdAt && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-[10px] text-white">
                                Updated: {formatTime(crime.updatedAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 ${getStatusColor(crime.verificationStatus)} text-[10px] sm:text-xs font-bold uppercase border rounded flex-shrink-0`}>
                      {crime.verificationStatus}
                    </div>
                  </div>

                  {/* Crime Body */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Evidence Images */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#DC143C]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs sm:text-sm font-bold text-[#DC143C] uppercase tracking-wide">
                            Evidence Images
                          </span>
                        </div>
                        
                        {crime.crimeImages.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {crime.crimeImages.map((image, idx) => (
                              <div
                                key={idx}
                                className="relative border-2 border-[#8B0000] rounded-lg overflow-hidden bg-[#1a1a1a] aspect-video cursor-pointer hover:border-[#DC143C]/60 transition-colors group"
                                onClick={() => window.open(image, '_blank')}
                              >
                                <img
                                  src={image}
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-xs">Failed to load image</div>';
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-2 border-[#8B0000] rounded-lg bg-[#1a1a1a] aspect-video flex items-center justify-center">
                            <span className="text-xs text-gray-500 font-medium">No evidence images</span>
                          </div>
                        )}

                        {/* Sources */}
                        {crime.sources.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-[#32CD32]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                              </svg>
                              <span className="text-xs sm:text-sm font-semibold text-[#32CD32] uppercase">
                                Source / Evidence Links
                              </span>
                            </div>
                            <div className="space-y-2">
                              {crime.sources.map((source, idx) => {
                                const sourceInfo = getSourceLinkInfo(source);
                                return (
                                  <a
                                    key={idx}
                                    href={source.startsWith('http') ? source : `https://${source}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#DC143C]/30 rounded-md hover:border-[#DC143C] hover:bg-[#1a1a1a] transition-all group"
                                  >
                                    <span className="text-base flex-shrink-0">{sourceInfo.icon}</span>
                                    <span className="text-xs sm:text-sm text-gray-300 group-hover:text-white flex-1">
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

                      {/* Profile URLs Sidebar */}
                      <div className="lg:col-span-1">
                        {allProfileUrls.length > 0 && (
                          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-4 h-4 text-[#32CD32]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-semibold text-gray-300 uppercase">
                                Profile Links
                              </span>
                            </div>
                            <div className="space-y-2">
                              {allProfileUrls.map((p, idx) => (
                                <a
                                  key={idx}
                                  href={p.url.startsWith('http') ? p.url : `https://${p.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] hover:bg-[#2a2a2a] rounded border border-[#2a2a2a] hover:border-[#32CD32]/30 transition-colors group"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="text-base">{getPlatformIcon(p.platform)}</span>
                                  <span className="text-xs text-[#32CD32] group-hover:text-[#7CFC00] transition-colors flex-1 truncate">
                                    {PLATFORMS.find(pl => pl.value === p.platform)?.label || 'Link'}
                                  </span>
                                  <svg className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                  </svg>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Crime Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                const authService = new AuthService();
                const token = authService.getAccessToken();
                
                if (!token) {
                  // Redirect to login if not authenticated
                  router.push('/login?redirect=' + encodeURIComponent(`/add-crime?personId=${person.id}`));
                  return;
                }
                
                router.push(`/add-crime?personId=${person.id}`);
              }}
              className="px-6 py-3 bg-[#8B0000] hover:bg-[#DC143C] text-white font-bold uppercase text-sm tracking-wide rounded transition-all duration-300 shadow-lg shadow-[#DC143C]/20 hover:shadow-[#DC143C]/40 border border-[#DC143C]/50"
            >
              + ADD MORE CRIME REPORT
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
