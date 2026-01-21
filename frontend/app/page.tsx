'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { List } from 'react-window';
import { PersonService, PersonFeedItem } from '../services/person.service';
import { CrimeCard } from '../components/CrimeCard/CrimeCard';

const ITEM_HEIGHT_MOBILE = 580; // Fixed CrimeCard height for mobile
const ITEM_HEIGHT_DESKTOP = 520; // Fixed CrimeCard height for desktop
const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [feed, setFeed] = useState<PersonFeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [listHeight, setListHeight] = useState(800);
  const [rowHeight, setRowHeight] = useState(ITEM_HEIGHT_MOBILE + 24); // Default to mobile
  const [isMobile, setIsMobile] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const listRef = useRef<any>(null); // Ref for react-window List imperative API

  const personService = new PersonService();

  // Intersection Observer for infinite scroll (Desktop only)
  const { ref: desktopSentinelRef, inView: desktopInView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '200px',
    skip: isMobile,
  });


  // Calculate list height and row height based on viewport
  useEffect(() => {
    const calculateDimensions = () => {
      // Detect mobile vs desktop (using Tailwind's sm breakpoint: 640px)
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, calculate available height for List
        // Account for: header (~60px) + title (~60px) + search (~120px) + margins (~40px)
        const headerHeight = 60;
        const titleHeight = 60;
        const searchHeight = 120;
        const margins = 40;
        const totalFixedHeight = headerHeight + titleHeight + searchHeight + margins;
        setListHeight(window.innerHeight - totalFixedHeight);
      } else {
        // Desktop uses natural height, but we still need listHeight for sentinel positioning
        const headerHeight = 200;
        setListHeight(window.innerHeight - headerHeight);
      }
      
      setRowHeight((mobile ? ITEM_HEIGHT_MOBILE : ITEM_HEIGHT_DESKTOP) + 24);
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // Initial load
  useEffect(() => {
    loadInitialFeed();
  }, []);

  // Reset on filter change
  useEffect(() => {
    if (searchName || selectedTag) {
      // When filtering, we filter client-side from loaded feed
      // Don't reset pagination for client-side filtering
      return;
    }
    // Only reset if filters are cleared
    if (!searchName && !selectedTag && feed.length > 0) {
      setPage(1);
      setFeed([]);
      setHasMore(true);
      loadInitialFeed();
    }
  }, [searchName, selectedTag]);

  const loadInitialFeed = async () => {
    setLoading(true);
    try {
      const response = await personService.getFeed(1, ITEMS_PER_PAGE);
      // Handle both wrapped and unwrapped responses
      if (response && response.data && response.pagination) {
        setFeed(response.data);
        setPage(1);
        setHasMore(response.pagination.hasMore);
      } else if (response && Array.isArray(response)) {
        // Fallback: if response is just an array
        setFeed(response);
        setPage(1);
        setHasMore(false);
      } else {
        console.error('Unexpected response format:', response);
        setFeed([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
      setFeed([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const response = await personService.getFeed(page + 1, ITEMS_PER_PAGE);
      
      // Handle both wrapped and unwrapped responses
      if (response && response.data && response.pagination) {
        // On mobile, react-window will automatically preserve scroll position
        // because we're appending to the array and the List handles it internally
        setFeed(prev => [...prev, ...response.data]);
        setPage(prev => prev + 1);
        setHasMore(response.pagination.hasMore);
      } else if (response && Array.isArray(response)) {
        // Fallback: if response is just an array
        setFeed(prev => [...prev, ...response]);
        setPage(prev => prev + 1);
        setHasMore(false);
      } else {
        console.error('Unexpected response format:', response);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, personService]);

  // Extract all unique tags from the feed
  const allTags = useMemo(() => {
    if (!feed || !Array.isArray(feed)) return [];
    const tagsSet = new Set<string>();
    feed.forEach((item) => {
      if (item?.latestCrime?.tags && Array.isArray(item.latestCrime.tags)) {
        item.latestCrime.tags.forEach((tag) => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim().toUpperCase());
          }
        });
      }
    });
    return Array.from(tagsSet).sort();
  }, [feed]);

  // Filter feed based on search criteria (client-side filtering)
  const filteredFeed = useMemo(() => {
    if (!feed || !Array.isArray(feed)) return [];
    return feed.filter((item) => {
      if (!item || !item.person) return false;
      // Filter by person name
      const nameMatch =
        !searchName ||
        item.person?.name
          ?.toLowerCase()
          .includes(searchName.toLowerCase());

      // Filter by tag
      const tagMatch =
        !selectedTag ||
        item.latestCrime?.tags?.some(
          (tag) => tag?.trim().toUpperCase() === selectedTag.toUpperCase()
        );

      return nameMatch && tagMatch && item.person;
    });
  }, [feed, searchName, selectedTag]);

  // Handle rows rendered callback for mobile infinite scroll
  const handleRowsRendered = useCallback((
    visibleRows: { startIndex: number; stopIndex: number },
    allRows: { startIndex: number; stopIndex: number }
  ) => {
    // For mobile: trigger load more when near the bottom
    if (isMobile && hasMore && !isLoadingMore && !loading && feed.length > 0) {
      const { stopIndex } = visibleRows;
      const totalItems = filteredFeed.length;
      
      // Load more when we're within 3 items of the end
      if (stopIndex >= totalItems - 3) {
        loadMore();
      }
    }
  }, [isMobile, hasMore, isLoadingMore, loading, feed.length, filteredFeed.length, loadMore]);

  // Load more when desktop sentinel is visible
  useEffect(() => {
    if (!isMobile && desktopInView && hasMore && !isLoadingMore && !loading && feed.length > 0) {
      loadMore();
    }
  }, [desktopInView, hasMore, isLoadingMore, loading, feed.length, isMobile, loadMore]);

  // Virtual list item renderer
  const Row = useCallback(({ index, style, ariaAttributes }: { 
    index: number; 
    style: React.CSSProperties;
    ariaAttributes: {
      "aria-posinset": number;
      "aria-setsize": number;
      role: "listitem";
    };
  }) => {
    const item = filteredFeed[index];
    if (!item) return null;

    return (
      <div style={style} className="px-4" {...ariaAttributes}>
        <div className="mb-6">
          <CrimeCard
            person={item.person}
            latestCrime={item.latestCrime}
            crimeCount={item.crimeCount}
          />
        </div>
      </div>
    );
  }, [filteredFeed]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-white uppercase tracking-wide">Crime Feed</h1>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-black border-2 border-[#DC143C]/50 rounded-lg h-[580px] sm:h-[520px] animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-white uppercase tracking-wide border-b-2 border-[#DC143C]/50 pb-4">
          Crime Feed
        </h1>
        
        {/* Search Bar */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
          {/* Name Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-3 bg-[#8B0000] border-2 border-[#DC143C] rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-[#FF0000] focus:bg-[#DC143C] transition-colors"
            />
          </div>
          
          {/* Tag Dropdown */}
          <div className="flex-1 sm:flex-none sm:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-3 bg-[#8B0000] border-2 border-[#DC143C] rounded-lg text-white focus:outline-none focus:border-[#FF0000] focus:bg-[#DC143C] transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#8B0000] text-white">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} className="bg-[#8B0000] text-white">
                  {tag}
                </option>
              ))}
            </select>
          </div>
          
          {/* Clear Filters Button */}
          {(searchName || selectedTag) && (
            <button
              onClick={() => {
                setSearchName('');
                setSelectedTag('');
              }}
              className="px-4 py-3 bg-[#8B0000] hover:bg-[#DC143C] text-white font-bold uppercase text-xs tracking-wide rounded-lg transition-all duration-300 border-2 border-[#DC143C] whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        {(searchName || selectedTag) && (
          <div className="mb-4 text-sm text-gray-400">
            Showing {filteredFeed.length} of {feed.length} results
          </div>
        )}

        {/* Virtual List (Mobile) / Regular List (Desktop) */}
        {filteredFeed.length > 0 ? (
          <>
            {/* Mobile: Virtual Scrolling - Single scroll container */}
            <div className="sm:hidden relative" style={{ height: listHeight, maxHeight: listHeight }}>
              <List
                listRef={listRef}
                rowCount={filteredFeed.length}
                rowHeight={rowHeight}
                rowComponent={Row}
                rowProps={{}}
                style={{ width: '100%', height: listHeight }}
                onRowsRendered={handleRowsRendered}
              />
            </div>
            
            {/* Desktop: Regular List (Natural Heights) */}
            <div className="hidden sm:block">
              <div className="space-y-6">
                {filteredFeed.map((item) => (
                  <CrimeCard
                    key={item.person.id}
                    person={item.person}
                    latestCrime={item.latestCrime}
                    crimeCount={item.crimeCount}
                  />
                ))}
              </div>
              
              {/* Sentinel for infinite scroll (Desktop only) */}
              {hasMore && (
                <div 
                  ref={desktopSentinelRef} 
                  className="h-20 flex items-center justify-center mt-6"
                >
                  {isLoadingMore && (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC143C]"></div>
                  )}
                </div>
              )}
              {!hasMore && feed.length > 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No more crimes to load</p>
                </div>
              )}
            </div>
            
            {/* Mobile: End of list indicator */}
            {isMobile && !hasMore && feed.length > 0 && (
              <div className="sm:hidden text-center py-4 text-gray-400 text-sm">
                <p>No more crimes to load</p>
              </div>
            )}
          </>
        ) : feed.length === 0 ? (
          <div className="bg-black border-2 border-[#DC143C]/50 rounded-xl shadow-2xl shadow-[#DC143C]/10 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-400 text-lg font-medium">No data yet.</p>
              <p className="text-gray-500 text-sm mt-2">Start by adding a crime report</p>
            </div>
          </div>
        ) : (
          <div className="bg-black border-2 border-[#DC143C]/50 rounded-xl shadow-2xl shadow-[#DC143C]/10 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg font-medium">No results found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
