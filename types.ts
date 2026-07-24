export type ThemeMode = 'sunset' | 'night' | 'aurora' | 'ocean' | 'lavender' | 'morning' | 'afternoon';

export type Companion = 'Myself' | 'Partner' | 'Family' | 'Friends' | 'A Stranger';

export type WeatherType = 'Sunny' | 'Cloudy' | 'Rainy' | 'Windy' | 'Golden' | 'Night';

export type MoodType = 'Happy' | 'Peaceful' | 'Grateful' | 'Excited' | 'Inspired' | 'Loved' | 'Relaxed';

export type CategoryType = 'All' | 'Travel' | 'Sunset' | 'Nature' | 'Food' | 'Friends' | 'Coffee' | 'Favorites';

export interface Memory {
  id: string;
  title: string;
  city: string;
  country: string;
  date: string; // e.g. "2024-10-14" or formatted
  formattedDate?: string;
  story: string;
  notes?: string;
  imageUrl: string;
  weather: WeatherType;
  moods: MoodType[];
  category: string;
  companion: Companion;
  isFavorite: boolean;
  coordinates?: {
    lat: number;
    lng: number;
    xPercent?: number; // for flat map pin placement
    yPercent?: number;
  };
}

export interface Place {
  id: string;
  country: string;
  city: string;
  memoriesCount: number;
  lastVisited: string;
  imageUrl: string;
  isDreamDestination?: boolean;
  coordinates: {
    lat: number;
    lng: number;
    xPercent: number;
    yPercent: number;
  };
}

export type ActiveTab = 'welcome' | 'home' | 'memories' | 'add' | 'places' | 'about';
