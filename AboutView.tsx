import React, { useState } from 'react';
import { ActiveTab, Memory } from '../types';

interface AboutViewProps {
  memories: Memory[];
  setActiveTab: (tab: ActiveTab) => void;
  storedPin: string | null;
  onSetPin: (pin: string) => void;
  onLockApp: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  memories,
  setActiveTab,
  storedPin,
  onSetPin,
  onLockApp,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [modalStep, setModalStep] = useState<'create' | 'confirm'>('create');
  const [pinInput, setPinInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const exportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `my-little-world-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleOpenCreatePin = () => {
    setPinInput('');
    setConfirmInput('');
    setPinError('');
    setModalStep('create');
    setShowPinModal(true);
  };

  const handleKeyClick = (num: string) => {
    if (pinError) setPinError('');

    if (modalStep === 'create') {
      const nextPin = pinInput + num;
      if (nextPin.length <= 4) {
        setPinInput(nextPin);
        if (nextPin.length === 4) {
          setConfirmInput('');
          setModalStep('confirm');
        }
      }
    } else if (modalStep === 'confirm') {
      const nextConfirm = confirmInput + num;
      if (nextConfirm.length <= 4) {
        setConfirmInput(nextConfirm);
        if (nextConfirm.length === 4) {
          if (nextConfirm === pinInput) {
            onSetPin(pinInput);
            setShowPinModal(false);
            setSuccessToast('PIN Keamanan Berhasil Disimpan!');
            setTimeout(() => setSuccessToast(''), 4000);
          } else {
            setPinError('PIN tidak cocok! Silakan ketik ulang PIN Anda.');
            setPinInput('');
            setConfirmInput('');
            setModalStep('create');
          }
        }
      }
    }
  };

  const handleDeleteDigit = () => {
    if (modalStep === 'create') {
      setPinInput((prev) => prev.slice(0, -1));
    } else {
      setConfirmInput((prev) => prev.slice(0, -1));
    }
  };

  const currentDisplayLength = modalStep === 'confirm' ? confirmInput.length : pinInput.length;

  return (
    <div className="pt-24 pb-32 px-4 md:px-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] bg-emerald-900 text-emerald-100 px-6 py-3 rounded-full shadow-2xl border border-emerald-500 text-xs font-extrabold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-base text-emerald-300">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="font-serif-display text-4xl sm:text-6xl italic font-extrabold text-[#2b1810] drop-shadow-sm">
          My Little World
        </h1>
        <p className="font-sans text-base sm:text-lg text-[#3d2618] font-bold max-w-lg mx-auto leading-relaxed">
          A calm digital diary where physical intimacy meets fluid glassmorphism.
        </p>
      </section>

      {/* Privacy & Security PIN Lock Section */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl space-y-6 shadow-xl border border-[#e8d5c4] bg-[#fffefb]">
        <div className="flex items-center justify-between border-b border-[#e8d5c4] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-[#2b1810] text-rose-300">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-extrabold text-[#2b1810]">
                Keamanan & Mode Privasi
              </h2>
              <p className="font-sans text-xs text-[#5c3e2b] font-semibold">
                {storedPin
                  ? 'Aplikasi dilindungi PIN 4-digit. Hanya Anda yang dapat membukanya.'
                  : 'Aktifkan Kunci PIN agar tidak ada orang lain yang bisa membuka diary Anda.'}
              </p>
            </div>
          </div>

          {storedPin && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>PIN Aktif</span>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {storedPin ? (
            <div className="flex flex-wrap gap-3 w-full">
              <button
                onClick={onLockApp}
                className="bg-[#2b1810] text-[#fffefb] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#422518] transition-all flex items-center gap-2 cursor-pointer shadow-sm justify-center"
              >
                <span className="material-symbols-outlined text-base text-rose-300">lock</span>
                <span>Kunci Aplikasi Sekarang</span>
              </button>

              <button
                onClick={handleOpenCreatePin}
                className="bg-[#fffefb] border border-[#d8c2b0] text-[#2b1810] px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#f4ece1] transition-all flex items-center gap-2 cursor-pointer shadow-sm justify-center"
              >
                <span className="material-symbols-outlined text-base text-[#8c4a27]">key</span>
                <span>Ganti PIN Rahasia</span>
              </button>

              <button
                onClick={() => setShowDisableModal(true)}
                className="bg-[#f4ece1] text-rose-700 hover:bg-rose-100 border border-rose-300 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer justify-center"
              >
                Nonaktifkan PIN
              </button>
            </div>
          ) : (
            <button
              onClick={handleOpenCreatePin}
              className="bg-[#2b1810] text-[#fffefb] px-6 py-3.5 rounded-full text-xs font-extrabold hover:bg-[#422518] transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-base text-amber-300">shield</span>
              <span>Buat PIN Rahasia Baru</span>
            </button>
          )}
        </div>
      </section>

      {/* Interactive PIN Creation Modal Keypad */}
      {showPinModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#1a0f0a]/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#fffefb] border-2 border-[#d8c2b0] rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative text-[#2b1810]">
            {/* Close Button */}
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 p-2 text-[#8c4a27] hover:bg-[#f4ece1] rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Lock Icon */}
            <div className="mx-auto w-14 h-14 rounded-full bg-[#2b1810] border-2 border-[#8c4a27] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-2xl text-amber-300">key</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-display text-xl font-extrabold text-[#2b1810]">
                {modalStep === 'create' ? 'Buat 4-Digit PIN Rahasia' : 'Konfirmasi PIN Anda'}
              </h3>
              <p className="font-sans text-xs text-[#5c3e2b] font-semibold">
                {modalStep === 'create'
                  ? 'Tekan 4 angka untuk membuat sandi kunci privasi baru.'
                  : 'Ketik ulang 4 angka PIN tadi untuk memastikan.'}
              </p>
            </div>

            {/* PIN Indicator Dots */}
            <div className="flex justify-center items-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = idx < currentDisplayLength;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      isFilled
                        ? 'bg-[#8c3b19] border-[#722e12] scale-110 shadow-[0_0_10px_rgba(140,59,25,0.6)]'
                        : 'bg-[#f4ece1] border-[#d8c2b0]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Error message if any */}
            {pinError && (
              <div className="text-xs font-extrabold text-rose-700 bg-rose-100 py-1.5 px-3 rounded-full border border-rose-300 animate-shake">
                {pinError}
              </div>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyClick(num)}
                  className="w-14 h-14 rounded-full bg-[#f4ece1] border border-[#d8c2b0] text-lg font-extrabold text-[#2b1810] hover:bg-[#2b1810] hover:text-[#fffefb] active:scale-90 transition-all flex items-center justify-center shadow-sm cursor-pointer mx-auto"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleKeyClick('0')}
                className="w-14 h-14 rounded-full bg-[#f4ece1] border border-[#d8c2b0] text-lg font-extrabold text-[#2b1810] hover:bg-[#2b1810] hover:text-[#fffefb] active:scale-90 transition-all flex items-center justify-center shadow-sm cursor-pointer mx-auto"
              >
                0
              </button>
              <button
                onClick={handleDeleteDigit}
                className="w-14 h-14 rounded-full bg-[#f4ece1]/60 border border-[#d8c2b0] text-sm font-bold text-[#8c4a27] hover:bg-rose-100 hover:text-rose-700 active:scale-90 transition-all flex items-center justify-center cursor-pointer mx-auto"
              >
                <span className="material-symbols-outlined text-lg">backspace</span>
              </button>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="text-xs font-bold text-[#8c4a27] hover:underline cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Nonaktifkan PIN */}
      {showDisableModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#1a0f0a]/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#fffefb] border-2 border-[#d8c2b0] rounded-3xl p-6 text-center space-y-5 shadow-2xl relative text-[#2b1810]">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">lock_open</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-display text-lg font-extrabold text-[#2b1810]">
                Nonaktifkan Kunci PIN?
              </h3>
              <p className="font-sans text-xs text-[#5c3e2b] font-semibold leading-relaxed">
                Siapa saja yang memegang perangkat ini nantinya akan dapat melihat diary pribadi Anda.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setShowDisableModal(false)}
                className="px-5 py-2.5 rounded-full border border-[#d8c2b0] text-xs font-bold text-[#2b1810] hover:bg-[#f4ece1] transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onSetPin('');
                  setShowDisableModal(false);
                  setSuccessToast('Kunci PIN telah dinonaktifkan.');
                  setTimeout(() => setSuccessToast(''), 4000);
                }}
                className="px-5 py-2.5 rounded-full bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition-all cursor-pointer shadow-md"
              >
                Ya, Hapus PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Philosophy Card */}
      <section className="glass-panel p-8 sm:p-12 rounded-3xl space-y-6 shadow-xl border border-[#e8d5c4] bg-[#fffefb]">
        <h2 className="font-serif-display text-2xl font-extrabold text-[#2b1810]">
          The Sanctuary Design Philosophy
        </h2>

        <div className="space-y-4 font-sans text-sm sm:text-base leading-relaxed text-[#3d2618] font-semibold">
          <p>
            <strong className="text-[#2b1810] font-bold">Ethereal Sanctuary</strong> is built around emotional resonance, memory preservation, and tactical minimalism. We combine soft glassmorphism, real-time WebGL sky shaders, and timeless serif typography to create an environment that feels like opening a cherished leather journal.
          </p>
          <p>
            Whether you are capturing a quiet coffee in Florence, a sunset over the Sahara, or a warm conversation with a dear friend, every chapter you write is safely guarded here.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#e8d5c4]">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-[#8c4a27] uppercase tracking-wider">
              Typography
            </span>
            <p className="text-xs font-bold text-[#2b1810]">
              Playfair Display & Plus Jakarta Sans
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-[#8c4a27] uppercase tracking-wider">
              Atmosphere
            </span>
            <p className="text-xs font-bold text-[#2b1810]">
              Interactive Fragment Shaders
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-[#8c4a27] uppercase tracking-wider">
              Privacy
            </span>
            <p className="text-xs font-bold text-[#2b1810]">
              100% Local Device Storage
            </p>
          </div>
        </div>
      </section>

      {/* Data Management & Export */}
      <section className="glass-panel p-8 rounded-3xl space-y-4 border border-[#e8d5c4] bg-[#fffefb] shadow-md flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="font-serif-display text-xl font-extrabold text-[#2b1810]">
            Backup Your Sanctuary
          </h3>
          <p className="font-sans text-xs text-[#3d2618] font-bold">
            Export all your {memories.length} chapter memories and photos as a backup JSON file.
          </p>
        </div>

        <button
          onClick={exportData}
          className="bg-[#2b1810] text-[#fffefb] px-6 py-3 rounded-full text-xs font-bold hover:bg-[#422518] transition-all flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-base text-rose-300">download</span>
          <span>Export Backup</span>
        </button>
      </section>

      {/* Footer Return */}
      <div className="text-center">
        <button
          onClick={() => setActiveTab('home')}
          className="text-xs font-extrabold uppercase tracking-widest text-[#8c3b19] hover:text-[#2b1810] hover:underline cursor-pointer"
        >
          ← Return to Dashboard
        </button>
      </div>
    </div>
  );
};

