import React, { useState } from 'react';
import { Memory, WeatherType, MoodType, Companion } from '../types';

interface AddMemoryViewProps {
  onSaveMemory: (memory: Memory) => void;
  onCancel: () => void;
  initialLocation?: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
}

export const AddMemoryView: React.FC<AddMemoryViewProps> = ({ onSaveMemory, onCancel, initialLocation }) => {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState(initialLocation?.city || '');
  const [country, setCountry] = useState(initialLocation?.country || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [companion, setCompanion] = useState<Companion>('Myself');
  const [weather, setWeather] = useState<WeatherType>('Golden');
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>(['Peaceful']);
  const [category, setCategory] = useState('Travel');
  const [story, setStory] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const weatherOptions: { type: WeatherType; icon: string; label: string }[] = [
    { type: 'Sunny', icon: 'sunny', label: 'Sunny' },
    { type: 'Cloudy', icon: 'cloud', label: 'Cloudy' },
    { type: 'Rainy', icon: 'rainy', label: 'Rainy' },
    { type: 'Windy', icon: 'air', label: 'Windy' },
    { type: 'Golden', icon: 'flare', label: 'Golden' },
    { type: 'Night', icon: 'dark_mode', label: 'Night' },
  ];

  const moodOptions: MoodType[] = [
    'Happy',
    'Peaceful',
    'Grateful',
    'Excited',
    'Inspired',
    'Loved',
    'Relaxed',
  ];

  const handleMoodToggle = (mood: MoodType) => {
    if (selectedMoods.includes(mood)) {
      if (selectedMoods.length > 1) {
        setSelectedMoods(selectedMoods.filter((m) => m !== mood));
      }
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const handleImageFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) {
      alert('Please provide a title and story for your memory chapter.');
      return;
    }

    const defaultImage =
      imagePreview ||
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop';

    // Format date string nicely
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = isNaN(dateObj.getTime())
      ? date
      : dateObj.toLocaleDateString('en-US', options);

    const newMemory: Memory = {
      id: `mem-${Date.now()}`,
      title: title.trim(),
      city: city.trim() || 'Sanctuary',
      country: country.trim() || 'Earth',
      date,
      formattedDate,
      story: story.trim(),
      notes: notes.trim(),
      imageUrl: defaultImage,
      weather,
      moods: selectedMoods,
      category: category || 'Travel',
      companion,
      isFavorite: false,
      coordinates: {
        lat: initialLocation?.lat ?? 35.0,
        lng: initialLocation?.lng ?? 135.0,
        xPercent: 50,
        yPercent: 40,
      },
    };

    onSaveMemory(newMemory);
  };

  return (
    <div className="pt-24 pb-32 px-4 md:px-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <section className="mb-10 text-center space-y-2">
        <h1 className="font-serif-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-50">
          Capture a Moment
        </h1>
        <p className="font-sans text-base sm:text-lg text-slate-800 dark:text-slate-200 font-medium italic">
          What's the soul of this story?
        </p>
      </section>

      {/* Main Journal Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-10 md:p-12 rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
      >
        {/* Left Column: Visual Photo & Atmosphere Weather */}
        <div className="lg:col-span-5 space-y-8">
          {/* Photo Drop Area */}
          <div className="space-y-3">
            <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest block">
              Photograph Memory
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative group cursor-pointer w-full aspect-[4/5] rounded-2xl overflow-hidden glass-panel flex flex-col items-center justify-center border-2 border-dashed transition-all ${
                isDragOver
                  ? 'border-blue-700 bg-blue-100/40'
                  : 'border-slate-400/60 dark:border-slate-600 hover:border-blue-700'
              }`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Memory Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageUrl('');
                    }}
                    className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                  <span className="material-symbols-outlined text-5xl text-slate-700 dark:text-slate-200 mb-3 group-hover:scale-110 transition-transform">
                    add_a_photo
                  </span>
                  <p className="font-sans text-xs font-bold text-slate-900 dark:text-slate-100">
                    Drop a photograph here, or click to upload
                  </p>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-1">PNG, JPG, WebP supported</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Optional Image URL Input */}
            <div className="pt-1">
              <input
                type="url"
                placeholder="Or paste an image web URL..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setImagePreview(e.target.value);
                }}
                className="diary-input w-full text-xs py-1.5 text-slate-900 dark:text-slate-100 font-semibold placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Atmosphere Selection */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/80 dark:border-white/10">
            <h3 className="font-serif-display text-lg font-bold text-slate-900 dark:text-slate-50">
              The Atmosphere
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {weatherOptions.map((w) => (
                <button
                  type="button"
                  key={w.type}
                  onClick={() => setWeather(w.type)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all active:scale-95 ${
                    weather === w.type
                      ? 'bg-[#1e3a8a] dark:bg-sky-600 text-white font-bold shadow-md'
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-semibold hover:bg-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl mb-1">{w.icon}</span>
                  <span className="text-[11px] font-sans">{w.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Content & Metadata Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* Memory Title */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                Memory Title *
              </label>
              <input
                type="text"
                required
                placeholder="Something unforgettable..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="diary-input font-serif-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 py-2 italic placeholder:text-slate-400"
              />
            </div>

            {/* City / Place */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                City / Place
              </label>
              <input
                type="text"
                placeholder="Where were you?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="diary-input font-sans text-base text-slate-900 dark:text-slate-100 font-semibold py-1.5 placeholder:text-slate-400"
              />
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                Country
              </label>
              <input
                type="text"
                placeholder="The destination"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="diary-input font-sans text-base text-slate-900 dark:text-slate-100 font-semibold py-1.5 placeholder:text-slate-400"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="diary-input font-sans text-base text-slate-900 dark:text-slate-100 font-semibold py-1.5"
              />
            </div>

            {/* Companion */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                Who were you with?
              </label>
              <select
                value={companion}
                onChange={(e) => setCompanion(e.target.value as Companion)}
                className="diary-input font-sans text-base text-slate-900 dark:text-slate-100 font-bold py-1.5 bg-transparent"
              >
                <option value="Myself" className="text-slate-900 bg-white">
                  Myself
                </option>
                <option value="Partner" className="text-slate-900 bg-white">
                  Partner
                </option>
                <option value="Family" className="text-slate-900 bg-white">
                  Family
                </option>
                <option value="Friends" className="text-slate-900 bg-white">
                  Friends
                </option>
                <option value="A Stranger" className="text-slate-900 bg-white">
                  A Stranger
                </option>
              </select>
            </div>

            {/* Category selection */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                Category
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Travel', 'Sunset', 'Nature', 'Food', 'Friends', 'Coffee'].map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      category === cat
                        ? 'bg-[#1e3a8a] dark:bg-sky-600 text-white'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Emotional Mood Selection */}
          <div className="space-y-3">
            <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest block">
              The Emotional Color (Moods)
            </label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    type="button"
                    key={mood}
                    onClick={() => handleMoodToggle(mood)}
                    className={`px-5 py-2 rounded-full border text-xs font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-sm'
                        : 'border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 hover:bg-white'
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Story & Small Notes Text Areas */}
          <div className="space-y-6 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                The Story *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Write as if you were speaking to your future self..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="diary-input w-full font-sans text-base leading-relaxed pt-2 resize-none placeholder:text-slate-400 font-medium text-slate-900 dark:text-slate-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold text-slate-900 dark:text-sky-200 uppercase tracking-widest">
                Small Notes & Whispers
              </label>
              <textarea
                rows={2}
                placeholder="The scent of pine, the way the light hit the coffee..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="diary-input w-full font-sans text-sm italic pt-1 resize-none placeholder:text-slate-400 font-medium text-slate-900 dark:text-slate-50"
              />
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Cancel & Return
            </button>

            <button
              type="submit"
              className="heart-glow group relative inline-flex items-center gap-3 bg-[#1e3a8a] dark:bg-sky-600 text-white font-serif-display text-lg px-10 py-4 rounded-full overflow-hidden transition-all duration-300 hover:px-12 hover:bg-[#1e40af] cursor-pointer shadow-xl font-bold"
            >
              <span className="material-symbols-outlined fill text-2xl animate-pulse text-rose-300">
                favorite
              </span>
              <span className="relative z-10 font-bold">Save This Memory</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
