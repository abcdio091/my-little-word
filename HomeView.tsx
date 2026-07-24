import React, { useState, useEffect } from 'react';
import { Memory, Place, ActiveTab } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface HomeViewProps {
  memories: Memory[];
  places: Place[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectMemory: (memory: Memory) => void;
  onToggleFavorite: (id: string) => void;
  onOpenAddMemory: () => void;
  onOpenAddMemoryWithLocation?: (city: string, country: string, lat: number, lng: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  memories,
  places,
  setActiveTab,
  onSelectMemory,
  onToggleFavorite,
  onOpenAddMemory,
  onOpenAddMemoryWithLocation,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [hoveredPlace, setHoveredPlace] = useState<Place | null>(places[0] || null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute greeting dynamically
  const hour = new Date().getHours();
  let greetingText = 'Good Evening';
  let greetingIcon = '🌅';
  let subGreeting = "The sky is painting today's final story.";
  if (hour >= 5 && hour < 12) {
    greetingText = 'Good Morning';
    greetingIcon = '🌄';
    subGreeting = 'The morning light brings new quiet beginnings.';
  } else if (hour >= 12 && hour < 17) {
    greetingText = 'Good Afternoon';
    greetingIcon = '☀️';
    subGreeting = 'Sunlight warms the chapters of your afternoon.';
  } else if (hour >= 21 || hour < 5) {
    greetingText = 'Good Night';
    greetingIcon = '🌙';
    subGreeting = 'Stars watch over your peaceful memories.';
  }

  const favoritesCount = memories.filter((m) => m.isFavorite).length;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [homeSearch, setHomeSearch] = useState<string>('');

  const categories = ['All', 'Favorites', ...Array.from(new Set(memories.map((m) => m.category).filter(Boolean)))];

  const filteredMemories = memories.filter((m) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Favorites'
        ? m.isFavorite
        : m.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !homeSearch ||
      m.title.toLowerCase().includes(homeSearch.toLowerCase()) ||
      m.city.toLowerCase().includes(homeSearch.toLowerCase()) ||
      m.country.toLowerCase().includes(homeSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const recentMemories = filteredMemories.slice(0, 6);
  const featuredMemory = memories.find((m) => m.id === 'mem-1') || memories[0];

  return (
    <div className="pt-24 sm:pt-28 md:pt-32 pb-28 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16 animate-in fade-in duration-500">
      {/* Hero Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
        <div className="space-y-5 max-w-2xl relative w-full">
          {/* Soft Glow Spotlight Behind Title */}
          <div className="absolute -top-10 -left-10 w-72 h-40 bg-white/50 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="space-y-2">
            <h1 className="font-serif-display text-3xl sm:text-5xl md:text-6xl text-[#2b1810] font-extrabold tracking-tight flex flex-wrap items-center gap-2 sm:gap-3 leading-tight drop-shadow-sm">
              <span className="break-words">{greetingText}</span>
              <span className="text-3xl sm:text-5xl md:text-6xl inline-block drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                {greetingIcon}
              </span>
            </h1>
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#2b1810]/90 font-bold leading-relaxed">
              {subGreeting}
            </p>
          </div>

          <div className="flex flex-col space-y-0.5">
            <div className="text-2xl sm:text-4xl font-extrabold tracking-widest text-[#2b1810] font-mono">
              {currentTime || '21:02:02'}
            </div>
            <div className="font-sans text-[11px] sm:text-xs text-[#8c3b19] uppercase tracking-widest italic font-extrabold">
              {currentDate || 'Thursday, July 23, 2026'}
            </div>
          </div>

          <div className="inline-block bg-[#fffefb]/90 backdrop-blur-md border border-[#e8d5c4] rounded-2xl px-5 py-3 shadow-sm max-w-lg">
            <blockquote className="italic text-[#2b1810] font-sans text-xs sm:text-sm font-bold">
              "{featuredMemory ? 'Every sunset is another page of your journey.' : 'A life well remembered is a life well lived.'}"
            </blockquote>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={onOpenAddMemory}
              className="bg-[#2b1810] text-[#fffefb] px-6 py-3 rounded-full font-extrabold text-xs sm:text-sm hover:bg-[#422518] transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-rose-300">add</span>
              <span>✨ Add a Memory</span>
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className="bg-[#fffefb] border border-[#d8c2b0] text-[#2b1810] px-6 py-3 rounded-full font-extrabold text-xs sm:text-sm hover:bg-[#f4ece1] transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#8c3b19]">auto_stories</span>
              <span>📖 Explore Memories</span>
            </button>
          </div>
        </div>

        {/* Bento Statistics Grid */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-80 self-stretch">
          <div
            onClick={() => setActiveTab('memories')}
            className="p-6 rounded-3xl glass-card bg-[#fffefb]/95 border border-[#e8d5c4] flex flex-col items-center justify-center text-center space-y-2 cursor-pointer group hover:border-[#0f766e] shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-4xl text-[#0f766e] fill group-hover:scale-110 transition-transform">
              photo_library
            </span>
            <span className="text-3xl font-serif-display font-extrabold text-[#111d2e]">
              {memories.length}
            </span>
            <span className="font-sans text-[11px] font-extrabold text-[#0d9488] uppercase tracking-wider">
              Memories
            </span>
          </div>

          <div
            onClick={() => setActiveTab('places')}
            className="p-6 rounded-3xl glass-card bg-[#fffefb]/95 border border-[#e8d5c4] flex flex-col items-center justify-center text-center space-y-2 cursor-pointer group hover:border-[#1e40af] shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-4xl text-[#1e40af] fill group-hover:scale-110 transition-transform">
              location_on
            </span>
            <span className="text-3xl font-serif-display font-extrabold text-[#111d2e]">
              {places.length}
            </span>
            <span className="font-sans text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider">
              Places
            </span>
          </div>

          <div
            onClick={() => setActiveTab('memories')}
            className="col-span-2 p-6 rounded-3xl glass-card bg-[#fffefb]/95 border border-[#e8d5c4] flex flex-col items-center justify-center text-center space-y-2 cursor-pointer group hover:border-[#be123c] shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-4xl text-[#be123c] fill group-hover:scale-110 transition-transform">
              favorite
            </span>
            <span className="text-3xl font-serif-display font-extrabold text-[#111d2e]">
              {favoritesCount}
            </span>
            <span className="font-sans text-[11px] font-extrabold text-[#e11d48] uppercase tracking-wider">
              Favorites
            </span>
          </div>
        </div>
      </header>

      {/* World Map Journey Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="space-y-0.5">
            <h2 className="font-serif-display text-2xl md:text-3xl font-extrabold text-[#330808]">
              Peta Dunia & Eksplorasi Lokasi
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#691313] font-bold">
              Cari & telusuri seluruh negara, provinsi, kota, kabupaten, hingga desa & pelosok desa di dunia.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('places')}
            className="text-xs font-extrabold text-[#8c3b19] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Peta Penuh</span>
            <span className="material-symbols-outlined text-sm">east</span>
          </button>
        </div>

        <InteractiveMap
          memories={memories}
          places={places}
          onSelectMemory={onSelectMemory}
          onOpenAddMemoryWithLocation={onOpenAddMemoryWithLocation}
          heightClass="h-[360px]"
        />
      </section>

      {/* Featured Memory ("Do you remember this?") */}
      {featuredMemory && (
        <section className="space-y-4">
          <div className="rounded-3xl overflow-hidden glass-panel flex flex-col md:flex-row shadow-2xl border border-[#e8d5c4] bg-[#fffefb]/98">
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-80 md:h-auto overflow-hidden relative group">
              <img
                src={featuredMemory.imageUrl}
                alt={featuredMemory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute top-4 left-4 bg-[#2b1810]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold text-amber-100 uppercase tracking-wider shadow-md">
                Featured Chapter
              </div>
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-5 bg-[#fffefb]">
              <div className="space-y-1">
                <span className="font-sans text-xs font-extrabold text-[#8c4a27] uppercase tracking-widest block">
                  DO YOU REMEMBER THIS?
                </span>
                <h2 className="font-serif-display text-2xl sm:text-4xl font-extrabold text-[#2b1810]">
                  {featuredMemory.title}
                </h2>
              </div>

              <p className="font-sans text-base sm:text-lg text-[#3d2618] leading-relaxed italic line-clamp-4 font-semibold">
                "{featuredMemory.story}"
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold text-[#5c3e2b] uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#8c4a27]">location_on</span>
                  <span>{featuredMemory.city}, {featuredMemory.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#8c4a27]">calendar_month</span>
                  <span>{featuredMemory.formattedDate || featuredMemory.date}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectMemory(featuredMemory)}
                className="self-start text-[#8c3b19] font-extrabold text-xs sm:text-sm border-b-2 border-[#8c3b19] pb-0.5 hover:text-[#2b1810] hover:border-[#2b1810] transition-colors pt-2 cursor-pointer"
              >
                Read Full Story →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recent Chapters Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h2 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[#2b1810]">
              Recent Chapters & Memories
            </h2>
            <p className="font-sans text-sm text-[#3d2618] font-bold">
              Moments you've captured recently.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Quick Filter Search */}
            <div className="flex items-center bg-[#fffefb] border border-[#d8c2b0] rounded-full px-3.5 py-1.5 shadow-sm w-full sm:w-60">
              <span className="material-symbols-outlined text-base text-[#8c4a27] mr-1.5">search</span>
              <input
                type="text"
                placeholder="Cari judul/lokasi..."
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                className="bg-transparent text-xs text-[#2b1810] font-bold outline-none w-full placeholder:text-[#8c6f5d]"
              />
              {homeSearch && (
                <button onClick={() => setHomeSearch('')} className="text-xs text-[#8c4a27] font-bold ml-1">
                  ×
                </button>
              )}
            </div>

            <button
              onClick={() => setActiveTab('memories')}
              className="text-[#8c3b19] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 group hover:underline cursor-pointer"
            >
              <span>View All ({memories.length})</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Category Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#2b1810] text-[#fffefb] shadow-sm'
                  : 'bg-[#fffefb]/90 border border-[#d8c2b0] text-[#5c3e2b] hover:bg-[#f4ece1]'
              }`}
            >
              {cat === 'Favorites' ? '❤️ Favorit' : cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => onSelectMemory(mem)}
              className="glass-card rounded-3xl overflow-hidden p-4 group cursor-pointer border border-[#e8d5c4] bg-[#fffefb]/95 shadow-md"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 shadow-sm">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-[#2b1810]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-amber-100 uppercase tracking-wider">
                  {mem.category}
                </div>
              </div>

              <div className="px-1 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif-display text-lg font-bold text-[#2b1810] group-hover:text-[#8c3b19] transition-colors line-clamp-1">
                    {mem.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(mem.id);
                    }}
                    className="text-amber-600 p-0.5 hover:scale-110 transition-transform"
                  >
                    <span className={`material-symbols-outlined text-lg ${mem.isFavorite ? 'fill' : ''}`}>
                      favorite
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#5c3e2b] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xs text-[#8c4a27]">location_on</span>
                  <span>
                    {mem.city}, {mem.country} • {mem.formattedDate || mem.date}
                  </span>
                </div>

                <p className="font-sans text-xs text-[#3d2618] line-clamp-2 italic font-semibold leading-relaxed">
                  "{mem.story}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
