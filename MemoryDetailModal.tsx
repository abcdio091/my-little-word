import React from 'react';
import { Memory } from '../types';

interface MemoryDetailModalProps {
  memory: Memory | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  onClose,
  onToggleFavorite,
  onDeleteMemory,
}) => {
  if (!memory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-10 shadow-2xl border border-[#e8d5c4] bg-[#fffefb] text-[#2b1810] flex flex-col md:flex-row gap-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-[#f4ece1] border border-[#d8c2b0] text-[#2b1810] hover:bg-[#eae0d2] transition-all cursor-pointer shadow-sm"
          title="Tutup Modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Left: Image display */}
        <div className="w-full md:w-1/2 rounded-2xl overflow-hidden aspect-[4/5] relative shadow-lg border border-[#e8d5c4]">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-[#2b1810]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#fffefb] uppercase tracking-wider shadow-md">
            {memory.category}
          </div>
        </div>

        {/* Right: Detail Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs font-extrabold text-[#8c4a27] uppercase tracking-widest">
                {memory.weather} • With {memory.companion}
              </span>
              <button
                onClick={() => onToggleFavorite(memory.id)}
                className="text-amber-600 hover:scale-125 transition-transform p-1 cursor-pointer"
                title="Sukai Memory Ini"
              >
                <span className={`material-symbols-outlined text-2xl ${memory.isFavorite ? 'fill text-amber-600' : 'text-stone-400'}`}>
                  favorite
                </span>
              </button>
            </div>

            <h2 className="font-serif-display text-3xl md:text-4xl font-extrabold text-[#2b1810] leading-tight">
              {memory.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#5c3e2b] uppercase tracking-wider">
              <div className="flex items-center gap-1.5 bg-[#f4ece1] px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-sm text-[#8c4a27]">location_on</span>
                <span>{memory.city}, {memory.country}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#f4ece1] px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-sm text-[#8c4a27]">calendar_month</span>
                <span>{memory.formattedDate || memory.date}</span>
              </div>
            </div>

            {/* Mood Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {memory.moods.map((m) => (
                <span
                  key={m}
                  className="px-3.5 py-1 rounded-full bg-[#2b1810] text-[#fffefb] text-xs font-extrabold shadow-sm"
                >
                  {m}
                </span>
              ))}
            </div>

            <div className="border-t border-[#e8d5c4] my-2"></div>

            {/* Story Text */}
            <div className="space-y-2">
              <h3 className="font-sans text-xs font-extrabold tracking-widest uppercase text-[#8c4a27]">
                Cerita & Kenangan (The Story)
              </h3>
              <p className="font-sans text-base md:text-lg leading-relaxed text-[#2b1810] font-semibold italic">
                "{memory.story}"
              </p>
            </div>

            {/* Small Notes */}
            {memory.notes && (
              <div className="bg-[#f4ece1] p-4 rounded-2xl border border-[#d8c2b0] space-y-1">
                <span className="font-sans text-[10px] font-extrabold tracking-widest uppercase text-[#8c4a27]">
                  Bisikan & Catatan Kecil
                </span>
                <p className="font-sans text-xs italic text-[#3d2618] font-bold">
                  {memory.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex items-center justify-between border-t border-[#e8d5c4]">
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus kenangan ini dari sanctuary Anda?')) {
                  onDeleteMemory(memory.id);
                  onClose();
                }
              }}
              className="text-xs font-extrabold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              <span>Hapus Kenangan</span>
            </button>

            <button
              onClick={onClose}
              className="bg-[#2b1810] text-[#fffefb] px-6 py-2.5 rounded-full text-xs font-extrabold hover:bg-[#422518] transition-all cursor-pointer shadow-md"
            >
              Tutup Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
