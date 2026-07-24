import React, { useState } from 'react';
import { Place, Memory, ActiveTab } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface PlacesViewProps {
  places: Place[];
  memories: Memory[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectMemory: (memory: Memory) => void;
  onAddDreamDestination: (destination: Place) => void;
  onOpenAddMemoryWithLocation?: (city: string, country: string, lat: number, lng: number) => void;
}

export const PlacesView: React.FC<PlacesViewProps> = ({
  places,
  memories,
  setActiveTab,
  onSelectMemory,
  onAddDreamDestination,
  onOpenAddMemoryWithLocation,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(places[0] || null);
  const [newDreamCountry, setNewDreamCountry] = useState('');
  const [newDreamCity, setNewDreamCity] = useState('');
  const [showAddDream, setShowAddDream] = useState(false);

  const placesWithMemories = places.filter((p) => !p.isDreamDestination);
  const dreamDestinations = places.filter((p) => p.isDreamDestination);

  const filteredMemories = selectedPlace
    ? memories.filter(
        (m) =>
          m.country.toLowerCase() === selectedPlace.country.toLowerCase() ||
          m.city.toLowerCase().includes(selectedPlace.city.toLowerCase())
      )
    : [];

  const handleCreateDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDreamCountry.trim() || !newDreamCity.trim()) return;

    const newPlace: Place = {
      id: `place-dream-${Date.now()}`,
      country: newDreamCountry.trim(),
      city: newDreamCity.trim(),
      memoriesCount: 0,
      lastVisited: 'Dreaming',
      imageUrl:
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop',
      isDreamDestination: true,
      coordinates: {
        lat: 0,
        lng: 0,
        xPercent: Math.floor(Math.random() * 60) + 20,
        yPercent: Math.floor(Math.random() * 50) + 20,
      },
    };

    onAddDreamDestination(newPlace);
    setNewDreamCountry('');
    setNewDreamCity('');
    setShowAddDream(false);
  };

  return (
    <div className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="font-serif-display text-4xl md:text-5xl font-extrabold text-[#2b1810]">
          Sanctuary Map & Destinations
        </h1>
        <p className="font-sans text-sm md:text-base text-[#3d2618] font-bold max-w-2xl">
          Track the corners of the earth you've explored and pin dream destinations for future
          wanderlust.
        </p>
      </header>

      {/* Main Interactive Map Canvas */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-serif-display text-2xl font-extrabold text-[#2b1810]">
            World Footprint Map
          </h2>
          <span className="text-xs font-extrabold text-[#8c4a27]">
            {placesWithMemories.length} Visited Countries • {dreamDestinations.length} Dream Destinations
          </span>
        </div>

        <InteractiveMap
          memories={memories}
          places={places}
          onSelectMemory={onSelectMemory}
          onOpenAddMemoryWithLocation={onOpenAddMemoryWithLocation}
          heightClass="h-[500px]"
        />
      </section>

      {/* Visited Destinations Cards */}
      <section className="space-y-6">
        <h2 className="font-serif-display text-2xl font-extrabold text-[#2b1810]">
          Visited Countries & Regions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placesWithMemories.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className={`glass-card rounded-3xl p-5 cursor-pointer border transition-all bg-[#fffefb] shadow-md ${
                  isSelected
                    ? 'border-[#2b1810] ring-2 ring-[#8c4a27]/40'
                    : 'border-[#e8d5c4] hover:border-[#8c4a27]'
                }`}
              >
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={place.imageUrl}
                    alt={place.country}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 bg-[#2b1810]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-amber-100">
                    {place.memoriesCount} Chapters
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif-display text-xl font-extrabold text-[#2b1810]">
                    {place.country}
                  </h3>
                  <p className="font-sans text-xs text-[#8c4a27] font-bold">{place.city}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filtered Memories for Selected Place */}
      {selectedPlace && (
        <section className="glass-panel p-8 rounded-3xl space-y-6 border border-[#e8d5c4] bg-[#fffefb]/98 shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="font-serif-display text-2xl font-extrabold text-[#2b1810]">
              Memories in {selectedPlace.country}
            </h2>
            <button
              onClick={() => setActiveTab('memories')}
              className="text-xs font-extrabold text-[#8c3b19] hover:underline cursor-pointer"
            >
              View All Memories →
            </button>
          </div>

          {filteredMemories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => onSelectMemory(mem)}
                  className="bg-[#fffefb] p-4 rounded-2xl cursor-pointer hover:shadow-xl transition-all border border-[#e8d5c4] group"
                >
                  <img
                    src={mem.imageUrl}
                    alt={mem.title}
                    className="w-full h-36 object-cover rounded-xl mb-3 group-hover:scale-102 transition-transform"
                  />
                  <h4 className="font-serif-display font-extrabold text-base text-[#2b1810] group-hover:text-[#8c3b19] transition-colors">
                    {mem.title}
                  </h4>
                  <p className="font-sans text-xs text-[#3d2618] italic line-clamp-2 mt-1 font-semibold">
                    "{mem.story}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#5c3e2b] italic font-semibold">
              No memories logged specifically for this destination yet.
            </p>
          )}
        </section>
      )}

      {/* Dream Destinations Bucket List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif-display text-2xl font-extrabold text-[#2b1810]">
              Dream Destinations
            </h2>
            <p className="font-sans text-xs text-[#3d2618] font-bold">
              Places waiting to be written into your story.
            </p>
          </div>

          <button
            onClick={() => setShowAddDream(!showAddDream)}
            className="bg-[#2b1810] text-[#fffefb] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#422518] transition-all flex items-center gap-1 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-rose-300">add</span>
            <span>Pin Dream Place</span>
          </button>
        </div>

        {/* Add Dream Modal Form */}
        {showAddDream && (
          <form
            onSubmit={handleCreateDream}
            className="glass-panel p-6 rounded-3xl space-y-4 border border-amber-300/40 bg-amber-50/20 dark:bg-black/40"
          >
            <h3 className="font-serif-display text-lg font-bold text-[#42617d] dark:text-[#aacae9]">
              Add Dream Destination
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Country (e.g. Iceland)"
                value={newDreamCountry}
                onChange={(e) => setNewDreamCountry(e.target.value)}
                className="diary-input text-sm py-2 text-black dark:text-white"
              />
              <input
                type="text"
                required
                placeholder="City or Region (e.g. Reykjavik)"
                value={newDreamCity}
                onChange={(e) => setNewDreamCity(e.target.value)}
                className="diary-input text-sm py-2 text-black dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDream(false)}
                className="text-xs font-semibold text-gray-500 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#42617d] text-white px-5 py-2 rounded-full text-xs font-semibold"
              >
                Save Destination
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dreamDestinations.map((place) => (
            <div
              key={place.id}
              className="glass-card rounded-3xl p-5 border border-amber-300/30 space-y-3"
            >
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                <img
                  src={place.imageUrl}
                  alt={place.country}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">favorite</span>
                  <span>Dream Place</span>
                </div>
              </div>

              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#101b30] dark:text-white">
                  {place.country}
                </h3>
                <p className="font-sans text-xs text-gray-500">{place.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
