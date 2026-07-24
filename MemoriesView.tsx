import React, { useState, useMemo } from 'react';
import { Memory, CategoryType } from '../types';

interface MemoriesViewProps {
  memories: Memory[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectMemory: (memory: Memory) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAddMemory: () => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  memories,
  searchQuery,
  setSearchQuery,
  onSelectMemory,
  onToggleFavorite,
  onOpenAddMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'loved'>('newest');
  const [displayCount, setDisplayCount] = useState<number>(8);

  const categories: CategoryType[] = [
    'All',
    'Travel',
    'Sunset',
    'Nature',
    'Food',
    'Friends',
    'Coffee',
    'Favorites',
  ];

  const filteredMemories = useMemo(() => {
    return memories
      .filter((m) => {
        // Category Filter
        if (selectedCategory === 'Favorites') {
          if (!m.isFavorite) return false;
        } else if (selectedCategory !== 'All') {
          if (m.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchCity = m.city.toLowerCase().includes(q);
          const matchCountry = m.country.toLowerCase().includes(q);
          const matchStory = m.story.toLowerCase().includes(q);
          return matchTitle || matchCity || matchCountry || matchStory;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'loved') {
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        }
        // Default: newest first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [memories, selectedCategory, searchQuery, sortBy]);

  const visibleMemories = filteredMemories.slice(0, displayCount);

  return (
    <div className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header Controls */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif-display text-4xl md:text-5xl font-extrabold text-[#2b1810] mb-2">
            My Memories
          </h1>
          <p className="font-sans text-sm md:text-base text-[#3d2618] font-bold max-w-xl">
            Every moment is a quiet chapter in the story of your life. Explore your personal
            sanctuary of captured feelings.
          </p>
        </div>

        {/* Sort & Quick Add Actions */}
        <div className="flex items-center gap-3 self-start">
          {/* Sorting Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#fffefb] border border-[#d8c2b0] rounded-full px-6 py-2.5 text-xs font-bold text-[#2b1810] hover:bg-white transition-all cursor-pointer pr-10 outline-none shadow-sm"
            >
              <option value="newest" className="text-[#2b1810]">
                Newest First
              </option>
              <option value="oldest" className="text-[#2b1810]">
                Oldest First
              </option>
              <option value="loved" className="text-[#2b1810]">
                Most Loved
              </option>
            </select>
            <span className="material-symbols-outlined text-base absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8c4a27]">
              expand_more
            </span>
          </div>

          <button
            onClick={onOpenAddMemory}
            className="bg-[#2b1810] text-[#fffefb] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#422518] transition-all flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-rose-300">add</span>
            <span className="hidden sm:inline">Add Chapter</span>
          </button>
        </div>
      </header>

      {/* Category Filter Chips */}
      <section className="overflow-x-auto custom-scrollbar flex items-center gap-2.5 pb-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-xs font-extrabold transition-all shadow-sm cursor-pointer ${
                isActive
                  ? 'bg-[#2b1810] text-[#fffefb] shadow-md'
                  : 'bg-[#fffefb] text-[#3d2618] border border-[#d8c2b0] hover:bg-[#f8f1e7]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </section>

      {/* Search Bar Feedback */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-[#fffefb] p-3 px-5 rounded-2xl border border-[#d8c2b0] text-xs font-bold text-[#2b1810] shadow-sm">
          <span>
            Searching for: <strong className="text-[#8c3b19] font-extrabold">"{searchQuery}"</strong> ({filteredMemories.length} results)
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[#8c4a27] hover:text-[#2b1810] underline font-bold cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Masonry Grid */}
      {visibleMemories.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {visibleMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => onSelectMemory(mem)}
              className="break-inside-avoid glass-card rounded-3xl overflow-hidden p-5 group cursor-pointer border border-[#e8d5c4] bg-[#fffefb]/98 shadow-md"
            >
              <div className="relative rounded-2xl overflow-hidden mb-4 shadow-sm">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 max-h-96"
                />
                <div className="absolute top-3 left-3 bg-[#2b1810]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-100 uppercase tracking-wider shadow-sm">
                  {mem.category}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#8c4a27]">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <span>
                      {mem.city}, {mem.country}
                    </span>
                  </div>
                  <span>{mem.weather}</span>
                </div>

                <h3 className="font-serif-display text-xl font-extrabold text-[#2b1810] group-hover:text-[#8c3b19] transition-colors">
                  {mem.title}
                </h3>

                <p className="font-sans text-xs text-[#3d2618] line-clamp-3 italic font-semibold leading-relaxed">
                  "{mem.story}"
                </p>

                <div className="flex justify-between items-center pt-2 border-t border-[#e8d5c4] text-xs font-extrabold text-[#5c3e2b]">
                  <span>{mem.formattedDate || mem.date}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(mem.id);
                    }}
                    className={`p-1 transition-transform hover:scale-125 ${
                      mem.isFavorite ? 'text-amber-600' : 'text-stone-400'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${mem.isFavorite ? 'fill' : ''}`}>
                      favorite
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl p-8 space-y-4 max-w-md mx-auto bg-[#fffefb] border border-[#e8d5c4]">
          <span className="material-symbols-outlined text-5xl text-[#8c4a27]">auto_stories</span>
          <h3 className="font-serif-display text-2xl font-bold text-[#2b1810]">
            No Chapters Found
          </h3>
          <p className="font-sans text-xs text-[#3d2618] font-bold">
            No memories match your active filters or search term. Try switching categories or create a new chapter!
          </p>
          <button
            onClick={onOpenAddMemory}
            className="bg-[#2b1810] text-[#fffefb] px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#422518] transition-all cursor-pointer"
          >
            Create New Memory
          </button>
        </div>
      )}

      {/* Pagination / Load More */}
      {filteredMemories.length > displayCount && (
        <div className="pt-8 flex justify-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 8)}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2b1810] text-[#fffefb] font-bold text-xs hover:bg-[#422518] transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>Load more memories</span>
            <span className="material-symbols-outlined text-base group-hover:translate-y-1 transition-transform">
              keyboard_double_arrow_down
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
