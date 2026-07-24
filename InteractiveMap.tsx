import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Memory, Place } from '../types';

interface InteractiveMapProps {
  memories: Memory[];
  places: Place[];
  onSelectMemory?: (memory: Memory) => void;
  onSelectPlace?: (place: Place) => void;
  onOpenAddMemoryWithLocation?: (city: string, country: string, lat: number, lng: number) => void;
  heightClass?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    village?: string;
    suburb?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    hamlet?: string;
    neighbourhood?: string;
    state_district?: string;
    region?: string;
    [key: string]: string | undefined;
  };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  memories,
  places,
  onSelectMemory,
  onSelectPlace,
  onOpenAddMemoryWithLocation,
  heightClass = 'h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  } | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'memories' | 'places' | 'dreams'>('all');

  // Custom marker icon creator function
  const createCustomIcon = (type: 'memory' | 'place' | 'dream' | 'temp', label?: string) => {
    let bgColor = '#8c4a27'; // default warm brown
    let iconSymbol = 'location_on';

    if (type === 'dream') {
      bgColor = '#d97706'; // amber
      iconSymbol = 'favorite';
    } else if (type === 'temp') {
      bgColor = '#e11d48'; // rose
      iconSymbol = 'push_pin';
    } else if (type === 'memory') {
      bgColor = '#2b1810';
      iconSymbol = 'photo_camera';
    }

    const html = `
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid #fffefb;
        position: relative;
        cursor: pointer;
        transition: transform 0.2s ease;
      " class="map-custom-marker">
        <span class="material-symbols-outlined" style="font-size: 18px;">${iconSymbol}</span>
        ${
          type === 'temp'
            ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(225, 29, 72, 0.3); animation: ping 1.5s infinite; pointer-events: none;"></div>`
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Default to world view
      const map = L.map(mapContainerRef.current, {
        center: [20, 10],
        zoom: 2,
        minZoom: 2,
        zoomControl: false,
      });

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create a layer group for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapRef.current = map;

      // Click event on map to select any location (down to village/pelosok)
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Reverse Geocode using Nominatim API to detect exact village/city/country
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};

            const village =
              addr.village || addr.suburb || addr.town || addr.hamlet || addr.neighbourhood || '';
            const city =
              addr.city || addr.county || addr.state_district || addr.region || village || 'Unknown City';
            const country = addr.country || 'Unknown Country';

            const placeName = data.display_name || `${city}, ${country}`;

            setSelectedLocation({
              name: placeName,
              city: village ? `${village}, ${city}` : city,
              country,
              lat,
              lng,
            });

            // Set temporary marker
            if (markersLayerRef.current) {
              if (tempMarkerRef.current) {
                markersLayerRef.current.removeLayer(tempMarkerRef.current);
              }
              const tempMarker = L.marker([lat, lng], {
                icon: createCustomIcon('temp'),
              }).addTo(markersLayerRef.current);

              tempMarkerRef.current = tempMarker;
            }
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
        }
      });
    }

    return () => {
      // Cleanup map on unmount if needed
    };
  }, []);

  // Update Markers when memories/places or filter change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();
    tempMarkerRef.current = null;

    // Render Memories
    if (filterMode === 'all' || filterMode === 'memories') {
      memories.forEach((mem) => {
        if (mem.coordinates?.lat && mem.coordinates?.lng) {
          const marker = L.marker([mem.coordinates.lat, mem.coordinates.lng], {
            icon: createCustomIcon('memory'),
          });

          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 max-w-[220px] font-sans';
          popupContent.innerHTML = `
            <div style="border-radius: 12px; overflow: hidden; margin-bottom: 8px; height: 110px;">
              <img src="${mem.imageUrl}" alt="${mem.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="font-size: 10px; font-weight: 800; color: #8c4a27; text-transform: uppercase; margin-bottom: 2px;">
              ${mem.category} • ${mem.city}, ${mem.country}
            </div>
            <div style="font-family: serif; font-size: 15px; font-weight: 800; color: #2b1810; margin-bottom: 4px; line-height: 1.2;">
              ${mem.title}
            </div>
            <p style="font-size: 11px; color: #3d2618; font-style: italic; line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px;">
              "${mem.story}"
            </p>
            <button id="btn-mem-${mem.id}" style="
              width: 100%;
              background: #2b1810;
              color: #fffefb;
              font-size: 11px;
              font-weight: 700;
              padding: 6px 12px;
              border-radius: 20px;
              border: none;
              cursor: pointer;
            ">
              View Memory Story →
            </button>
          `;

          popupContent.querySelector(`#btn-mem-${mem.id}`)?.addEventListener('click', () => {
            if (onSelectMemory) onSelectMemory(mem);
          });

          marker.bindPopup(popupContent);
          layerGroup.addLayer(marker);
        }
      });
    }

    // Render Visited Places & Dream Destinations
    if (filterMode === 'all' || filterMode === 'places' || filterMode === 'dreams') {
      places.forEach((place) => {
        if (filterMode === 'dreams' && !place.isDreamDestination) return;
        if (filterMode === 'places' && place.isDreamDestination) return;

        if (place.coordinates?.lat && place.coordinates?.lng) {
          const type = place.isDreamDestination ? 'dream' : 'place';
          const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
            icon: createCustomIcon(type),
          });

          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 max-w-[200px] font-sans';
          popupContent.innerHTML = `
            <div style="border-radius: 12px; overflow: hidden; margin-bottom: 8px; height: 100px;">
              <img src="${place.imageUrl}" alt="${place.country}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="font-family: serif; font-size: 16px; font-weight: 800; color: #2b1810;">
              ${place.country}
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #8c4a27; margin-bottom: 6px;">
              ${place.city}
            </div>
            <div style="font-size: 11px; color: #5c3e2b; font-weight: 600;">
              ${place.isDreamDestination ? '✨ Dream Destination' : `📖 ${place.memoriesCount} Chapters`}
            </div>
          `;

          marker.bindPopup(popupContent);
          layerGroup.addLayer(marker);
        }
      });
    }
  }, [memories, places, filterMode]);

  // Handle Search Input Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Query OpenStreetMap Nominatim Geocoder API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&addressdetails=1&limit=5`
      );

      if (response.ok) {
        const data: SearchResult[] = await response.json();
        setSearchResults(data);

        if (data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);

          // Fly map directly to target searched location
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 13, { duration: 1.5 });
          }

          // Format Address
          const addr = first.address || {};
          const village =
            addr.village || addr.suburb || addr.town || addr.hamlet || addr.neighbourhood || '';
          const city =
            addr.city || addr.county || addr.state_district || addr.region || village || 'Searched Location';
          const country = addr.country || '';

          setSelectedLocation({
            name: first.display_name,
            city: village ? `${village}, ${city}` : city,
            country,
            lat,
            lng,
          });

          // Add temp pin
          if (markersLayerRef.current) {
            if (tempMarkerRef.current) {
              markersLayerRef.current.removeLayer(tempMarkerRef.current);
            }
            tempMarkerRef.current = L.marker([lat, lng], {
              icon: createCustomIcon('temp'),
            }).addTo(markersLayerRef.current);
          }
        }
      }
    } catch (err) {
      console.error('Search location error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: SearchResult) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);

    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 14, { duration: 1.5 });
    }

    const addr = res.address || {};
    const village =
      addr.village || addr.suburb || addr.town || addr.hamlet || addr.neighbourhood || '';
    const city =
      addr.city || addr.county || addr.state_district || addr.region || village || 'Selected Location';
    const country = addr.country || '';

    setSelectedLocation({
      name: res.display_name,
      city: village ? `${village}, ${city}` : city,
      country,
      lat,
      lng,
    });

    if (markersLayerRef.current) {
      if (tempMarkerRef.current) {
        markersLayerRef.current.removeLayer(tempMarkerRef.current);
      }
      tempMarkerRef.current = L.marker([lat, lng], {
        icon: createCustomIcon('temp'),
      }).addTo(markersLayerRef.current);
    }

    setSearchResults([]);
  };

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
          }

          // Reverse geocode
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            if (response.ok) {
              const data = await response.json();
              const addr = data.address || {};
              const village =
                addr.village || addr.suburb || addr.town || addr.hamlet || addr.neighbourhood || '';
              const city =
                addr.city || addr.county || addr.state_district || addr.region || 'Current Location';
              const country = addr.country || '';

              setSelectedLocation({
                name: data.display_name,
                city: village ? `${village}, ${city}` : city,
                country,
                lat: latitude,
                lng: longitude,
              });

              if (markersLayerRef.current) {
                if (tempMarkerRef.current) {
                  markersLayerRef.current.removeLayer(tempMarkerRef.current);
                }
                tempMarkerRef.current = L.marker([latitude, longitude], {
                  icon: createCustomIcon('temp'),
                }).addTo(markersLayerRef.current);
              }
            }
          } catch (e) {
            console.error('Reverse geocode error:', e);
          }
        },
        (error) => {
          alert('Could not access your location: ' + error.message);
        }
      );
    }
  };

  const resetMapZoom = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([20, 10], 2, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-[#e8d5c4] bg-[#fffefb]">
      {/* Top Search & Filter Bar */}
      <div className="p-4 bg-[#fffefb]/95 backdrop-blur-md border-b border-[#e8d5c4] flex flex-col md:flex-row gap-3 items-center justify-between z-10 relative">
        {/* Real Geocoding Search Box (Country, City, Regency, Village / Desa) */}
        <div className="relative w-full md:w-96">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center bg-[#f4ece1] border border-[#d8c2b0] rounded-full px-3.5 py-2 shadow-inner">
              <span className="material-symbols-outlined text-base text-[#8c4a27] mr-2">search</span>
              <input
                type="text"
                placeholder="Cari desa, kota, kabupaten, negara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-[#2b1810] placeholder:text-[#8c6f5d] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-[#8c4a27] hover:text-[#2b1810]"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-[#2b1810] text-[#fffefb] text-xs font-bold px-4 py-2 rounded-full hover:bg-[#422518] transition-colors cursor-pointer shadow-sm flex items-center gap-1"
            >
              {isSearching ? (
                <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
              ) : (
                <span>Cari</span>
              )}
            </button>
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#fffefb] border border-[#d8c2b0] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              <div className="p-2 text-[10px] font-extrabold uppercase text-[#8c4a27] border-b border-[#e8d5c4]">
                Hasil Pencarian Lokasi
              </div>
              {searchResults.map((res) => (
                <button
                  key={res.place_id}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-3 hover:bg-[#f4ece1] border-b border-[#f4ece1] last:border-none transition-colors text-xs font-bold text-[#2b1810] flex items-start gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-[#8c4a27] mt-0.5">location_on</span>
                  <span className="line-clamp-2">{res.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Badges & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#2b1810] text-[#fffefb] shadow-sm'
                : 'bg-[#f4ece1] text-[#5c3e2b] hover:bg-[#eae0d2]'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterMode('memories')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              filterMode === 'memories'
                ? 'bg-[#2b1810] text-[#fffefb] shadow-sm'
                : 'bg-[#f4ece1] text-[#5c3e2b] hover:bg-[#eae0d2]'
            }`}
          >
            Memory ({memories.length})
          </button>
          <button
            onClick={() => setFilterMode('dreams')}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              filterMode === 'dreams'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#f4ece1] text-[#5c3e2b] hover:bg-[#eae0d2]'
            }`}
          >
            Impian
          </button>

          <button
            onClick={handleLocateMe}
            title="Lokasi Saya Saat Ini"
            className="p-2 rounded-full bg-[#f4ece1] border border-[#d8c2b0] text-[#8c4a27] hover:bg-[#eae0d2] transition-colors cursor-pointer shadow-sm flex items-center justify-center ml-2"
          >
            <span className="material-symbols-outlined text-base">my_location</span>
          </button>

          <button
            onClick={resetMapZoom}
            title="Reset Tampilan Dunia"
            className="p-2 rounded-full bg-[#f4ece1] border border-[#d8c2b0] text-[#8c4a27] hover:bg-[#eae0d2] transition-colors cursor-pointer shadow-sm flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-base">public</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full">
        <div ref={mapContainerRef} className={`w-full ${heightClass} z-0`} />

        {/* Selected / Clicked Location Floating Action Panel */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md bg-[#fffefb]/98 backdrop-blur-2xl p-4 rounded-2xl border border-[#d8c2b0] shadow-2xl z-20 space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#8c4a27]">
                  📍 Lokasi Terdeteksi
                </div>
                <h4 className="font-serif-display text-base font-extrabold text-[#2b1810] line-clamp-2">
                  {selectedLocation.city}, {selectedLocation.country}
                </h4>
                <p className="text-[11px] text-[#5c3e2b] line-clamp-2 italic font-semibold mt-0.5">
                  {selectedLocation.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-[#8c4a27] hover:text-[#2b1810] p-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {onOpenAddMemoryWithLocation && (
              <button
                onClick={() => {
                  onOpenAddMemoryWithLocation(
                    selectedLocation.city,
                    selectedLocation.country,
                    selectedLocation.lat,
                    selectedLocation.lng
                  );
                }}
                className="w-full mt-2 bg-[#2b1810] text-[#fffefb] font-bold text-xs py-2.5 px-4 rounded-full hover:bg-[#422518] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-sm text-rose-300">add_circle</span>
                <span>Tambah Chapter di Lokasi Ini</span>
              </button>
            )}
          </div>
        )}

        {/* Map Legend Footer */}
        <div className="absolute bottom-4 right-4 bg-[#fffefb]/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-[#d8c2b0] text-[10px] font-extrabold text-[#2b1810] space-y-1 shadow-md z-10 pointer-events-none hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2b1810]"></span>
            <span>Memory Disimpan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span>Destinasi Impian</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Lokasi Dipilih (Desa/Kota)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
