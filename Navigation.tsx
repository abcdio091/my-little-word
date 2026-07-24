import React, { useState } from 'react';
import { ActiveTab, ThemeMode } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isAutoTheme?: boolean;
  setIsAutoTheme?: (auto: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddMemory: () => void;
  onOpenDataStorage?: () => void;
  storedPin?: string | null;
  onLockApp?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  isAutoTheme = true,
  setIsAutoTheme,
  searchQuery,
  setSearchQuery,
  onOpenAddMemory,
  onOpenDataStorage,
  storedPin,
  onLockApp,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const themeIcons: Record<ThemeMode, { icon: string; label: string; colorClass: string }> = {
    sunset: { icon: 'wb_twilight', label: 'Sunset Coral', colorClass: 'bg-rose-500' },
    night: { icon: 'dark_mode', label: 'Obsidian Night', colorClass: 'bg-slate-900' },
    aurora: { icon: 'filter_hdr', label: 'Aurora Emerald', colorClass: 'bg-emerald-600' },
    ocean: { icon: 'water_drop', label: 'Deep Ocean', colorClass: 'bg-blue-600' },
    lavender: { icon: 'auto_awesome', label: 'Twilight Lavender', colorClass: 'bg-purple-600' },
    morning: { icon: 'wb_sunny', label: 'Morning Dawn', colorClass: 'bg-amber-400' },
    afternoon: { icon: 'light_mode', label: 'Azure Sky', colorClass: 'bg-sky-400' },
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-[#fefcf8]/95 backdrop-blur-3xl border-b border-[#e8d5c4] shadow-sm flex justify-between items-center transition-all h-16 sm:h-18">
        {/* Brand Logo - Single line, no wrapping */}
        <button
          onClick={() => setActiveTab('home')}
          className="font-serif-display text-xl sm:text-2xl md:text-3xl font-extrabold italic text-transparent bg-clip-text bg-gradient-to-r from-[#3b1206] via-[#8c3210] to-[#b34c11] hover:opacity-90 transition-opacity select-none text-left drop-shadow-sm cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
        >
          My Little World
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => setActiveTab('home')}
            className={`font-sans text-base transition-all duration-300 relative py-1 cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#8c3b19] font-extrabold border-b-2 border-[#8c3b19]'
                : 'text-[#2e3e4e] hover:text-[#8c3b19] font-bold'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`font-sans text-base transition-all duration-300 relative py-1 cursor-pointer ${
              activeTab === 'memories'
                ? 'text-[#8c3b19] font-extrabold border-b-2 border-[#8c3b19]'
                : 'text-[#2e3e4e] hover:text-[#8c3b19] font-bold'
            }`}
          >
            Memories
          </button>
          <button
            onClick={() => setActiveTab('places')}
            className={`font-sans text-base transition-all duration-300 relative py-1 cursor-pointer ${
              activeTab === 'places'
                ? 'text-[#8c3b19] font-extrabold border-b-2 border-[#8c3b19]'
                : 'text-[#2e3e4e] hover:text-[#8c3b19] font-bold'
            }`}
          >
            Places
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`font-sans text-base transition-all duration-300 relative py-1 cursor-pointer ${
              activeTab === 'about'
                ? 'text-[#8c3b19] font-extrabold border-b-2 border-[#8c3b19]'
                : 'text-[#2e3e4e] hover:text-[#8c3b19] font-bold'
            }`}
          >
            About
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Search Toggle */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#f5ebe0] border border-[#d8c2b0] rounded-full px-2.5 py-1 shadow-inner">
                <span className="material-symbols-outlined text-base text-[#8c4a27] mr-1">search</span>
                <input
                  type="text"
                  placeholder="Cari diary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs text-[#2b1810] font-bold outline-none w-28 sm:w-40 placeholder:text-[#8c6f5d]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setActiveTab('memories');
                  }}
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="material-symbols-outlined text-xs text-[#8c4a27] hover:text-[#2b1810] ml-1 cursor-pointer"
                >
                  close
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  if (activeTab !== 'memories') setActiveTab('memories');
                }}
                title="Cari Jurnal"
                className="p-1.5 rounded-full hover:bg-[#f4ece1] text-[#2b1810] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">search</span>
              </button>
            )}
          </div>

          {/* Theme Sky Switcher (Desktop / Tablet) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Sistem Suasana & Waktu Otomatis"
              className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer ${
                isAutoTheme
                  ? 'bg-[#2b1810] border-[#422518] text-[#fffefb] hover:bg-[#422518]'
                  : 'bg-[#f4ece1] border-[#d8c2b0] text-[#2b1810] hover:bg-[#eae0d2]'
              }`}
            >
              {isAutoTheme ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="material-symbols-outlined text-base text-amber-300">
                    schedule
                  </span>
                  <span className="font-extrabold">{themeIcons[theme].label}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base text-[#8c4a27]">
                    {themeIcons[theme].icon}
                  </span>
                  <span className="capitalize">{themeIcons[theme].label}</span>
                </>
              )}
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>

            {showThemeMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#fffefb] backdrop-blur-2xl border border-[#d8c2b0] rounded-2xl shadow-2xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-200"
                onMouseLeave={() => setShowThemeMenu(false)}
              >
                {/* Auto Time Mode Button */}
                <div className="p-2 border-b border-[#e8d5c4]">
                  <button
                    onClick={() => {
                      if (setIsAutoTheme) setIsAutoTheme(true);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col gap-1 ${
                      isAutoTheme
                        ? 'bg-[#2b1810] text-[#fffefb] border-[#2b1810] shadow-md'
                        : 'bg-[#f4ece1]/60 text-[#2b1810] border-[#d8c2b0] hover:bg-[#f4ece1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-extrabold text-xs">
                        <span className="material-symbols-outlined text-sm text-amber-300">
                          schedule
                        </span>
                        <span>⏱️ Mode Waktu Real-Time</span>
                      </div>
                      {isAutoTheme && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
                          Aktif
                        </span>
                      )}
                    </div>
                  </button>
                </div>

                <div className="px-3.5 pt-2 pb-1 text-[10px] font-extrabold tracking-widest uppercase text-[#8c4a27]">
                  Atau Pilih Manual
                </div>
                {(['sunset', 'night', 'aurora', 'ocean', 'lavender', 'morning', 'afternoon'] as ThemeMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setTheme(m);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-[#f4ece1] transition-colors cursor-pointer ${
                      !isAutoTheme && theme === m
                        ? 'font-bold text-[#2b1810] bg-[#f4ece1]'
                        : 'text-[#3d2618]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-base text-[#8c4a27]">
                        {themeIcons[m].icon}
                      </span>
                      <span className="text-xs font-bold">{themeIcons[m].label}</span>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${themeIcons[m].colorClass} shadow-sm border border-white`}></span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Memory Button (Desktop) */}
          <button
            onClick={onOpenAddMemory}
            className="hidden md:flex items-center gap-1.5 bg-[#8c3b19] text-[#fffefb] px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-[#722e12] hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-amber-200">add</span>
            <span>Add Memory</span>
          </button>

          {/* Mobile / Tablet Garis 3 Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#f4ece1] border border-[#d8c2b0] text-[#2b1810] hover:bg-[#eae0d2] transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            title="Menu Utama (Garis 3)"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Logout & Lock Button (Desktop) */}
          {onLockApp && (
            <button
              onClick={onLockApp}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2b1810] text-[#fffefb] hover:bg-[#422518] transition-all active:scale-95 cursor-pointer shadow-sm text-xs font-extrabold border border-[#8c4a27]"
              title="Keluar / Kunci Diary"
            >
              <span className="material-symbols-outlined text-sm text-rose-400">
                lock
              </span>
              <span>Keluar</span>
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE / TABLET MENU DRAWER (GARIS 3 MODAL) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="fixed top-16 right-3 left-3 max-w-sm ml-auto bg-[#fefcf8] border-2 border-[#8c4a27]/60 rounded-3xl shadow-2xl p-5 space-y-5 text-[#2b1810] animate-in slide-in-from-top-5 duration-300">
            {/* Header Drawer */}
            <div className="flex items-center justify-between border-b border-[#e8d5c4] pb-3">
              <div className="font-serif-display font-extrabold text-lg text-[#8c3b19] flex items-center gap-2">
                <span className="material-symbols-outlined">menu_open</span>
                <span>Menu Utama Diary</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-rose-100 text-rose-700 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Navigation Tab Links */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#8c4a27] mb-1">
                Navigasi Halaman
              </div>

              {[
                { id: 'home', label: 'Home (Beranda)', icon: 'home' },
                { id: 'memories', label: 'Memories (Jurnal & Foto)', icon: 'auto_stories' },
                { id: 'places', label: 'Places (Peta Lokasi)', icon: 'public' },
                { id: 'about', label: 'About & Profile Pemilik', icon: 'account_circle' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ActiveTab);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer font-bold text-xs ${
                    activeTab === tab.id
                      ? 'bg-[#8c3b19] text-white shadow-md'
                      : 'bg-[#f4ece1]/70 hover:bg-[#f4ece1] text-[#2b1810]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  onOpenAddMemory();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer font-bold text-xs bg-amber-600 text-white shadow-md mt-2"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Tambah Jurnal Kenangan Baru</span>
              </button>
            </div>

            {/* Theme & Atmosphere Selector */}
            <div className="space-y-2 border-t border-[#e8d5c4] pt-3">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#8c4a27]">
                Pilih Atmosfer & Suasana
              </div>

              <button
                onClick={() => {
                  if (setIsAutoTheme) setIsAutoTheme(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-bold border ${
                  isAutoTheme
                    ? 'bg-[#2b1810] text-[#fffefb] border-[#2b1810]'
                    : 'bg-[#f4ece1] text-[#2b1810] border-[#d8c2b0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-amber-300">
                    schedule
                  </span>
                  <span>⏱️ Mode Waktu Real-Time</span>
                </div>
                {isAutoTheme && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">Aktif</span>}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {(['sunset', 'night', 'aurora', 'ocean'] as ThemeMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setTheme(m);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                      !isAutoTheme && theme === m
                        ? 'bg-[#8c3b19] text-white border-[#8c3b19]'
                        : 'bg-[#f4ece1] text-[#2b1810] border-[#d8c2b0]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{themeIcons[m].icon}</span>
                    <span className="truncate">{themeIcons[m].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions & Security */}
            <div className="border-t border-[#e8d5c4] pt-3 flex gap-2">
              {onOpenDataStorage && (
                <button
                  onClick={() => {
                    onOpenDataStorage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 p-2.5 rounded-xl bg-[#f4ece1] border border-[#d8c2b0] text-[#2b1810] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#8c3b19]">database</span>
                  <span>Data Backup</span>
                </button>
              )}

              {onLockApp && (
                <button
                  onClick={() => {
                    onLockApp();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 p-2.5 rounded-xl bg-[#2b1810] text-rose-300 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <span className="material-symbols-outlined text-base text-rose-400">lock</span>
                  <span>Kunci Diary</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-16 bg-[#fefcf8]/95 backdrop-blur-2xl border-t border-[#e8d5c4] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'home'
              ? 'bg-[#8c3b19]/15 text-[#8c3b19] font-extrabold'
              : 'text-[#5c3e2b]'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${activeTab === 'home' ? 'fill' : ''}`}>
            home
          </span>
          <span className="text-[10px] tracking-wide mt-0.5">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('memories')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'memories'
              ? 'bg-[#8c3b19]/15 text-[#8c3b19] font-extrabold'
              : 'text-[#5c3e2b]'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${activeTab === 'memories' ? 'fill' : ''}`}>
            auto_stories
          </span>
          <span className="text-[10px] tracking-wide mt-0.5">Memories</span>
        </button>

        <button
          onClick={onOpenAddMemory}
          className="flex flex-col items-center justify-center py-1 px-3 text-[#8c3b19] active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl fill text-[#8c3b19]">
            add_circle
          </span>
          <span className="text-[10px] tracking-wide font-extrabold mt-0.5">Tambah</span>
        </button>

        <button
          onClick={() => setActiveTab('places')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'places'
              ? 'bg-[#8c3b19]/15 text-[#8c3b19] font-extrabold'
              : 'text-[#5c3e2b]'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${activeTab === 'places' ? 'fill' : ''}`}>
            public
          </span>
          <span className="text-[10px] tracking-wide mt-0.5">Peta</span>
        </button>
      </nav>
    </>
  );
};
