import React, { useState } from 'react';

interface WelcomeOverlayProps {
  onEnter: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipples((prev) => [...prev, { x, y, id: Date.now() }]);

    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const amount = 15;
    const x = (e.clientX / window.innerWidth - 0.5) * amount;
    const y = (e.clientY / window.innerHeight - 0.5) * amount;

    const content = document.getElementById('welcome-content');
    if (content) {
      content.style.transform = `translate(${x}px, ${y}px)`;
      content.style.transition = 'transform 0.1s ease-out';
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div id="welcome-content" className="max-w-2xl flex flex-col items-center z-10">
        {/* Brand Title */}
        <div className="fade-in-entry mb-6">
          <h1 className="font-serif-display text-5xl md:text-7xl text-slate-900 dark:text-slate-50 italic tracking-tight drop-shadow-md select-none font-bold">
            My Little World
          </h1>
        </div>

        {/* Tagline & Button */}
        <div className="fade-in-delayed flex flex-col items-center">
          <p className="font-sans text-lg md:text-xl text-slate-900 dark:text-slate-100 font-semibold mb-10 max-w-md mx-auto leading-relaxed bg-white/50 dark:bg-slate-900/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/70 dark:border-white/20 shadow-sm">
            Every little moment deserves a place to stay.
          </p>

          <button
            id="enter-btn"
            onClick={handleButtonClick}
            className="glass-btn ripple-container rounded-full px-10 py-5 flex items-center justify-center gap-3 group relative cursor-pointer shadow-xl hover:shadow-2xl transition-all border border-white/80 dark:border-white/20 bg-white/85 dark:bg-slate-900/85"
          >
            <span className="font-sans text-xs md:text-sm font-bold tracking-widest uppercase text-slate-900 dark:text-sky-200">
              Enter My World
            </span>
            <span className="material-symbols-outlined text-slate-900 dark:text-sky-200 group-hover:translate-x-1.5 transition-transform font-bold">
              east
            </span>

            {/* Ripple Effects */}
            {ripples.map((r) => (
              <span
                key={r.id}
                className="ripple-effect"
                style={{
                  left: `${r.x}px`,
                  top: `${r.y}px`,
                  width: '300px',
                  height: '300px',
                  marginLeft: '-150px',
                  marginTop: '-150px',
                }}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Footnote */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 fade-in-delayed opacity-50 select-none">
        <p className="font-sans text-[11px] tracking-[0.25em] uppercase text-[#42474d] dark:text-gray-400 font-semibold">
          Your Digital Sanctuary
        </p>
      </div>
    </div>
  );
};
