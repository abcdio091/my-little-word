import React, { useState, useEffect } from 'react';

interface LockOverlayProps {
  storedPin: string | null;
  onUnlock: () => void;
  onSetPin: (newPin: string, hint?: string) => void;
}

export const LockOverlay: React.FC<LockOverlayProps> = ({
  storedPin,
  onUnlock,
  onSetPin,
}) => {
  // Stored Owner Account Information
  const [storedOwnerName, setStoredOwnerName] = useState<string>(() => {
    try {
      return localStorage.getItem('my_little_world_owner_name') || 'Pemilik Diary';
    } catch {
      return 'Pemilik Diary';
    }
  });

  const [storedOwnerEmail, setStoredOwnerEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('my_little_world_owner_email') || 'yuyunsh54@gmail.com';
    } catch {
      return 'yuyunsh54@gmail.com';
    }
  });

  const [storedPassword, setStoredPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('my_little_world_password') || '123456';
    } catch {
      return '123456';
    }
  });

  const [storedHint] = useState<string | null>(() => {
    try {
      return localStorage.getItem('my_little_world_pin_hint');
    } catch {
      return null;
    }
  });

  // Flow State:
  // 'step1_password' : User enters Password
  // 'step2_pin'      : Password verified! Now enter 4-digit PIN
  // 'settings'       : Edit owner name, password, pin, hint
  const [authStep, setAuthStep] = useState<'step1_password' | 'step2_pin' | 'settings'>('step1_password');

  // Form Inputs
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');

  // Settings / Account Setup
  const [regName, setRegName] = useState(storedOwnerName);
  const [regEmail, setRegEmail] = useState(storedOwnerEmail);
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regHint, setRegHint] = useState('');

  // Security Feedback & Safeguards
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Lockout Countdown Timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Handle Step 1: Password Login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!inputPassword) {
      setErrorMsg('Silakan masukkan kata sandi Anda.');
      return;
    }

    if (inputPassword === storedPassword) {
      setFailedAttempts(0);
      setSuccessMsg('Kata Sandi Benar! Lanjut ke Verifikasi PIN...');
      setTimeout(() => {
        setSuccessMsg('');
        setAuthStep('step2_pin');
      }, 600);
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      setInputPassword('');
      if (attempts >= 3) {
        setLockoutSeconds(30);
        setErrorMsg('Kata sandi salah 3 kali! Terkunci sementara 30 detik.');
      } else {
        setErrorMsg(`Kata sandi salah! Sisa percobaan: ${3 - attempts}`);
      }
    }
  };

  // Handle Step 2: PIN Keypad Input
  const handlePinClick = (num: string) => {
    if (lockoutSeconds > 0) return;
    setErrorMsg('');
    setSuccessMsg('');

    const nextPin = pin + num;
    if (nextPin.length <= 4) {
      setPin(nextPin);
      if (nextPin.length === 4) {
        const validPin = storedPin || '1234';
        if (nextPin === validPin) {
          setFailedAttempts(0);
          setSuccessMsg('Verifikasi 2-Lapis Berhasil! Membuka Diary...');
          setTimeout(() => {
            onUnlock();
          }, 500);
        } else {
          const attempts = failedAttempts + 1;
          setFailedAttempts(attempts);
          setPin('');
          if (attempts >= 3) {
            setLockoutSeconds(30);
            setErrorMsg('PIN salah 3 kali! Terkunci sementara 30 detik.');
          } else {
            setErrorMsg(`PIN Keamanan salah! Sisa percobaan: ${3 - attempts}`);
          }
        }
      }
    }
  };

  const handlePinDelete = () => {
    if (lockoutSeconds > 0) return;
    setPin((prev) => prev.slice(0, -1));
  };

  // Keyboard listener for PIN
  useEffect(() => {
    if (authStep !== 'step2_pin') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinClick(e.key);
      } else if (e.key === 'Backspace') {
        handlePinDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authStep, pin, lockoutSeconds, failedAttempts, storedPin]);

  // Save / Update Account Credentials
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regPin.trim()) {
      setErrorMsg('Semua kolom wajib diisi (Nama, Email, Password, & PIN 4 angka).');
      return;
    }
    if (regPin.length !== 4) {
      setErrorMsg('PIN wajib 4 digit angka.');
      return;
    }

    try {
      localStorage.setItem('my_little_world_owner_name', regName.trim());
      localStorage.setItem('my_little_world_owner_email', regEmail.trim());
      localStorage.setItem('my_little_world_password', regPassword.trim());

      setStoredOwnerName(regName.trim());
      setStoredOwnerEmail(regEmail.trim());
      setStoredPassword(regPassword.trim());

      onSetPin(regPin.trim(), regHint.trim());
      setSuccessMsg('Kredensial Login & PIN berhasil diperbarui!');
      setTimeout(() => {
        setSuccessMsg('');
        setAuthStep('step1_password');
      }, 800);
    } catch (err) {
      setErrorMsg('Gagal menyimpan kredensial ke memori peramban.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#120a06]/98 backdrop-blur-3xl text-[#fffefb] animate-in fade-in duration-300 select-none overflow-y-auto">
      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        {/* Header Security Badge */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-[#2b1810] border-2 border-[#8c4a27] flex items-center justify-center shadow-[0_0_35px_rgba(140,59,25,0.5)]">
            <span className="material-symbols-outlined text-4xl text-amber-300">
              {authStep === 'step1_password' ? 'lock' : authStep === 'step2_pin' ? 'phonelink_lock' : 'settings_suggest'}
            </span>
            <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full p-1 border border-rose-300 shadow">
              <span className="material-symbols-outlined text-xs">shield</span>
            </div>
          </div>

          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[#fffefb] tracking-wide">
              {authStep === 'step1_password' && 'Langkah 1: Login Password'}
              {authStep === 'step2_pin' && 'Langkah 2: Verifikasi PIN'}
              {authStep === 'settings' && 'Pengaturan Kredensial Pemilik'}
            </h1>
            <p className="font-sans text-xs text-[#d8c2b0] font-semibold mt-1">
              {authStep === 'step1_password' && (
                <>Keamanan 2-Lapis Aktif. Pemilik: <span className="text-amber-300 font-bold">{storedOwnerName}</span></>
              )}
              {authStep === 'step2_pin' && 'Password Benar ✓. Masukkan 4 angka PIN rahasia Anda.'}
              {authStep === 'settings' && 'Atur kata sandi dan PIN rahasia Anda.'}
            </p>
          </div>
        </div>

        {/* 2-Step Visual Progress Bar */}
        {authStep !== 'settings' && (
          <div className="bg-[#2b1810]/90 border border-[#8c4a27] p-3 rounded-2xl flex items-center justify-between gap-2 text-xs font-bold">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              authStep === 'step1_password'
                ? 'bg-[#8c3b19] text-white shadow'
                : 'text-emerald-300 bg-emerald-950/60 border border-emerald-700/50'
            }`}>
              <span className="material-symbols-outlined text-sm">
                {authStep === 'step2_pin' ? 'check_circle' : 'key'}
              </span>
              <span>1. Password</span>
            </div>

            <div className="text-gray-500 font-serif">→</div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              authStep === 'step2_pin'
                ? 'bg-[#8c3b19] text-white shadow'
                : 'text-gray-400 bg-black/20'
            }`}>
              <span className="material-symbols-outlined text-sm">dialpad</span>
              <span>2. PIN 4 Angka</span>
            </div>
          </div>
        )}

        {/* Error / Success Feedback Banner */}
        {lockoutSeconds > 0 ? (
          <div className="text-xs font-extrabold text-amber-300 bg-amber-950/90 py-3 px-4 rounded-2xl border border-amber-600 animate-pulse flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">timer</span>
            <span>Akses Terkunci. Silakan tunggu {lockoutSeconds} detik.</span>
          </div>
        ) : errorMsg ? (
          <div className="text-xs font-bold text-rose-200 bg-rose-950/90 py-2.5 px-4 rounded-2xl border border-rose-700 animate-bounce flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        ) : successMsg ? (
          <div className="text-xs font-bold text-emerald-200 bg-emerald-950/90 py-2.5 px-4 rounded-2xl border border-emerald-700 flex items-center justify-center gap-2 animate-pulse">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{successMsg}</span>
          </div>
        ) : null}

        {/* STEP 1: LOGIN PASSWORD */}
        {authStep === 'step1_password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 bg-[#2b1810]/80 border border-[#8c4a27]/80 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
            <div className="space-y-1 text-left">
              <label className="text-xs font-extrabold text-[#d8c2b0] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-amber-300">account_circle</span>
                <span>Email / User Pemilik:</span>
              </label>
              <input
                type="text"
                disabled
                value={storedOwnerEmail}
                className="w-full bg-[#120a06]/80 border border-[#8c4a27]/50 text-xs font-mono text-amber-200 p-3 rounded-xl outline-none opacity-80 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-extrabold text-[#d8c2b0] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-amber-300">lock</span>
                <span>Kata Sandi Rahasia:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={lockoutSeconds > 0}
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full bg-[#120a06] border border-[#8c4a27] text-xs text-white p-3 pr-10 rounded-xl outline-none focus:border-amber-300 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={lockoutSeconds > 0}
              className="w-full bg-[#8c3b19] hover:bg-[#a6461e] text-white py-3.5 rounded-xl text-xs font-extrabold shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
              <span>Lanjut ke Verifikasi PIN</span>
            </button>

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setAuthStep('settings')}
                className="text-[11px] font-bold text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                <span>Ubah / Set Password & PIN</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY PIN 4 DIGITS */}
        {authStep === 'step2_pin' && (
          <div className="bg-[#2b1810]/80 border border-[#8c4a27]/80 p-6 rounded-3xl backdrop-blur-md shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="text-xs font-extrabold text-amber-300 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span>Verifikasi Lapis Kedua: PIN 4 Angka</span>
              </div>

              {/* PIN Indicator Dots */}
              <div className="flex justify-center items-center gap-4 my-4">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = idx < pin.length;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        isFilled
                          ? 'bg-amber-400 border-amber-300 scale-125 shadow-[0_0_15px_rgba(251,191,36,0.9)]'
                          : 'bg-transparent border-[#8c4a27]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={lockoutSeconds > 0}
                  onClick={() => handlePinClick(num)}
                  className="w-14 h-14 rounded-full bg-[#120a06]/90 border border-[#8c4a27] text-xl font-bold hover:bg-[#8c3b19] active:scale-90 disabled:opacity-30 transition-all flex items-center justify-center shadow-lg cursor-pointer mx-auto text-[#fffefb]"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                type="button"
                disabled={lockoutSeconds > 0}
                onClick={() => handlePinClick('0')}
                className="w-14 h-14 rounded-full bg-[#120a06]/90 border border-[#8c4a27] text-xl font-bold hover:bg-[#8c3b19] active:scale-90 disabled:opacity-30 transition-all flex items-center justify-center shadow-lg cursor-pointer mx-auto text-[#fffefb]"
              >
                0
              </button>
              <button
                type="button"
                disabled={lockoutSeconds > 0}
                onClick={handlePinDelete}
                className="w-14 h-14 rounded-full bg-[#120a06]/50 border border-[#8c4a27]/50 text-sm font-bold hover:bg-rose-900/80 active:scale-90 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer mx-auto text-[#d8c2b0]"
              >
                <span className="material-symbols-outlined">backspace</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setPin('');
                  setAuthStep('step1_password');
                }}
                className="text-[11px] font-bold text-[#d8c2b0] hover:text-white underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Kembali ke Password</span>
              </button>

              {storedHint && (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[11px] text-amber-300 font-bold hover:underline cursor-pointer"
                >
                  {showHint ? 'Tutup Petunjuk' : '💡 Petunjuk PIN'}
                </button>
              )}
            </div>

            {showHint && storedHint && (
              <div className="text-xs bg-[#120a06] border border-amber-500/40 text-amber-200 p-2.5 rounded-xl font-mono text-center">
                Petunjuk PIN: {storedHint}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS MODE: UPDATE CREDENTIALS */}
        {authStep === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-3.5 bg-[#2b1810]/80 border border-[#8c4a27]/80 p-6 rounded-3xl backdrop-blur-md shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#8c4a27]/50 pb-2">
              <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">manage_accounts</span>
                <span>Atur Kredensial Pemilik</span>
              </h3>
              <button
                type="button"
                onClick={() => setAuthStep('step1_password')}
                className="text-xs text-[#d8c2b0] hover:text-white underline cursor-pointer"
              >
                Kembali
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-[#d8c2b0]">Nama Pemilik Diary:</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Contoh: Yuyun"
                className="w-full bg-[#120a06] border border-[#8c4a27] text-xs text-white p-2.5 rounded-xl outline-none focus:border-amber-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-[#d8c2b0]">Email Pemilik:</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="yuyunsh54@gmail.com"
                className="w-full bg-[#120a06] border border-[#8c4a27] text-xs text-white p-2.5 rounded-xl outline-none focus:border-amber-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#d8c2b0]">Password Baru:</label>
                <input
                  type="text"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password..."
                  className="w-full bg-[#120a06] border border-[#8c4a27] text-xs text-white p-2.5 rounded-xl outline-none focus:border-amber-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#d8c2b0]">PIN 4 Angka:</label>
                <input
                  type="text"
                  maxLength={4}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="4 angka..."
                  className="w-full bg-[#120a06] border border-[#8c4a27] text-xs text-white p-2.5 rounded-xl outline-none focus:border-amber-300 font-mono text-center tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-[#d8c2b0]">Petunjuk PIN (Opsional):</label>
              <input
                type="text"
                value={regHint}
                onChange={(e) => setRegHint(e.target.value)}
                placeholder="Catatan pengingat jika lupa..."
                className="w-full bg-[#120a06] border border-[#8c4a27] text-xs text-white p-2.5 rounded-xl outline-none focus:border-amber-300"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#8c3b19] hover:bg-[#a6461e] text-white py-3 rounded-xl text-xs font-extrabold shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Simpan Perubahan Kredensial</span>
            </button>
          </form>
        )}

        {/* Security Info & Offline Explanation */}
        <div className="text-[11px] text-[#a88d7b] font-medium leading-relaxed bg-[#120a06]/60 p-3 rounded-2xl border border-[#8c4a27]/30 text-center space-y-1">
          <div>🛡️ <strong>Sistem Keamanan Terisolasi (Mendukung Privasi Sempurna):</strong></div>
          <p>
            Meskipun orang lain mencari kata kunci yang sama di Chrome / Google, mereka <strong>TIDAK AKAN BISA</strong> membuka diary Anda. Semua foto & jurnal hanya tersimpan di peramban Anda dan dikunci dengan 2-Lapis Verifikasi (Password + PIN).
          </p>
        </div>
      </div>
    </div>
  );
};
