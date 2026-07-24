import React, { useState, useEffect } from 'react';
import { ActiveTab, Memory, Place, ThemeMode } from './types';
import { INITIAL_MEMORIES, INITIAL_PLACES } from './data/mockMemories';
import { ShaderBackground } from './components/ShaderBackground';
import { Navigation } from './components/Navigation';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { HomeView } from './components/HomeView';
import { MemoriesView } from './components/MemoriesView';
import { AddMemoryView } from './components/AddMemoryView';
import { PlacesView } from './components/PlacesView';
import { AboutView } from './components/AboutView';
import { MemoryDetailModal } from './components/MemoryDetailModal';
import { LockOverlay } from './components/LockOverlay';
import { DataStorageModal } from './components/DataStorageModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('welcome');
  // Auto Time-of-Day Sky & Atmosphere System
  const [isAutoTheme, setIsAutoTheme] = useState<boolean>(true);

  const getTimeBasedTheme = (): ThemeMode => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 9) {
      return 'morning';
    } else if (hours >= 9 && hours < 16) {
      return 'afternoon';
    } else if (hours >= 16 && hours < 19) {
      return 'sunset';
    } else {
      return 'night';
    }
  };

  const [theme, setTheme] = useState<ThemeMode>(() => getTimeBasedTheme());

  useEffect(() => {
    if (!isAutoTheme) return;

    const syncTheme = () => {
      const autoMode = getTimeBasedTheme();
      setTheme(autoMode);
    };

    syncTheme();
    const interval = setInterval(syncTheme, 30000); // Sync every 30 seconds with local time

    return () => clearInterval(interval);
  }, [isAutoTheme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [prefilledLocation, setPrefilledLocation] = useState<{
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  } | null>(null);

  // Security Privacy Lock State
  const [storedPin, setStoredPin] = useState<string | null>(() => {
    try {
      return localStorage.getItem('my_little_world_pin');
    } catch {
      return null;
    }
  });

  // ALWAYS START LOCKED on app load so no unauthorized person can view memories
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const handleSetPin = (newPin: string, hint?: string) => {
    if (newPin) {
      localStorage.setItem('my_little_world_pin', newPin);
      if (hint) {
        localStorage.setItem('my_little_world_pin_hint', hint);
      } else {
        localStorage.removeItem('my_little_world_pin_hint');
      }
      setStoredPin(newPin);
    } else {
      localStorage.removeItem('my_little_world_pin');
      localStorage.removeItem('my_little_world_pin_hint');
      setStoredPin(null);
      setIsLocked(false);
    }
  };

  // Persistent Memories State
  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const saved = localStorage.getItem('my_little_world_memories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved memories:', e);
    }
    return INITIAL_MEMORIES;
  });

  // Persistent Places State
  const [places, setPlaces] = useState<Place[]>(() => {
    try {
      const saved = localStorage.getItem('my_little_world_places');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved places:', e);
    }
    return INITIAL_PLACES;
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem('my_little_world_memories', JSON.stringify(memories));
    } catch (e) {
      console.error('Error saving memories:', e);
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem('my_little_world_places', JSON.stringify(places));
    } catch (e) {
      console.error('Error saving places:', e);
    }
  }, [places]);

  // Handlers
  const handleToggleFavorite = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveNewMemory = (newMemory: Memory) => {
    setMemories((prev) => [newMemory, ...prev]);

    // Check if new country/city needs to update places
    setPlaces((prevPlaces) => {
      const existing = prevPlaces.find(
        (p) => p.country.toLowerCase() === newMemory.country.toLowerCase()
      );

      if (existing) {
        return prevPlaces.map((p) =>
          p.id === existing.id ? { ...p, memoriesCount: p.memoriesCount + 1 } : p
        );
      }

      // Add as new place
      const newPlace: Place = {
        id: `place-${Date.now()}`,
        country: newMemory.country,
        city: newMemory.city,
        memoriesCount: 1,
        lastVisited: newMemory.city,
        imageUrl: newMemory.imageUrl,
        coordinates: {
          lat: 0,
          lng: 0,
          xPercent: Math.floor(Math.random() * 60) + 20,
          yPercent: Math.floor(Math.random() * 50) + 20,
        },
      };

      return [...prevPlaces, newPlace];
    });

    setActiveTab('home');
  };

  const handleAddDreamDestination = (newPlace: Place) => {
    setPlaces((prev) => [...prev, newPlace]);
  };

  const handleOpenAddMemoryWithLocation = (city: string, country: string, lat: number, lng: number) => {
    setPrefilledLocation({ city, country, lat, lng });
    setActiveTab('add');
  };

  const handleOpenAddMemoryStandard = () => {
    setPrefilledLocation(null);
    setActiveTab('add');
  };

  const [isDataStorageOpen, setIsDataStorageOpen] = useState(false);

  const handleRestoreData = (newMemories: Memory[], newPlaces: Place[]) => {
    if (newMemories && newMemories.length > 0) setMemories(newMemories);
    if (newPlaces && newPlaces.length > 0) setPlaces(newPlaces);
  };

  const handleResetSampleData = () => {
    setMemories(INITIAL_MEMORIES);
    setPlaces(INITIAL_PLACES);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-[#a2c2e1] selection:text-[#30506a]">
      {/* Privacy PIN Security Lock Screen */}
      {isLocked && (
        <LockOverlay
          storedPin={storedPin}
          onUnlock={() => setIsLocked(false)}
          onSetPin={handleSetPin}
        />
      )}

      {/* Interactive WebGL Shader Canvas Background */}
      <ShaderBackground theme={theme} />

      {/* Welcome Screen Overlay */}
      {activeTab === 'welcome' && (
        <WelcomeOverlay onEnter={() => setActiveTab('home')} />
      )}

      {/* Main Navigation (hidden during welcome screen) */}
      {activeTab !== 'welcome' && (
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={(newTheme) => {
            setTheme(newTheme);
            setIsAutoTheme(false); // Manual override
          }}
          isAutoTheme={isAutoTheme}
          setIsAutoTheme={setIsAutoTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddMemory={() => {
            setPrefilledLocation(null);
            setActiveTab('add');
          }}
          onOpenDataStorage={() => setIsDataStorageOpen(true)}
          storedPin={storedPin}
          onLockApp={() => setIsLocked(true)}
        />
      )}

      {/* App Views Container */}
      <main className="relative z-10 min-h-screen">
        {activeTab === 'home' && (
          <HomeView
            memories={memories}
            places={places}
            setActiveTab={setActiveTab}
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddMemory={handleOpenAddMemoryStandard}
            onOpenAddMemoryWithLocation={handleOpenAddMemoryWithLocation}
          />
        )}

        {activeTab === 'memories' && (
          <MemoriesView
            memories={memories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onToggleFavorite={handleToggleFavorite}
            onOpenAddMemory={handleOpenAddMemoryStandard}
          />
        )}

        {activeTab === 'add' && (
          <AddMemoryView
            onSaveMemory={handleSaveNewMemory}
            onCancel={() => setActiveTab('home')}
            initialLocation={prefilledLocation || undefined}
          />
        )}

        {activeTab === 'places' && (
          <PlacesView
            places={places}
            memories={memories}
            setActiveTab={setActiveTab}
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onAddDreamDestination={handleAddDreamDestination}
            onOpenAddMemoryWithLocation={handleOpenAddMemoryWithLocation}
          />
        )}

        {activeTab === 'about' && (
          <AboutView
            memories={memories}
            setActiveTab={setActiveTab}
            storedPin={storedPin}
            onSetPin={handleSetPin}
            onLockApp={() => setIsLocked(true)}
          />
        )}
      </main>

      {/* Memory Inspect Detail Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onToggleFavorite={handleToggleFavorite}
        onDeleteMemory={handleDeleteMemory}
      />

      {/* Data & LocalStorage Inspector Modal */}
      <DataStorageModal
        isOpen={isDataStorageOpen}
        onClose={() => setIsDataStorageOpen(false)}
        memories={memories}
        places={places}
        onRestoreData={handleRestoreData}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
};

export default App;
