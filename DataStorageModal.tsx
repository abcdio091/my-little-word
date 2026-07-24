import React, { useState } from 'react';
import { Memory, Place } from '../types';

interface DataStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  places: Place[];
  onRestoreData: (newMemories: Memory[], newPlaces: Place[]) => void;
  onResetSampleData: () => void;
}

export const DataStorageModal: React.FC<DataStorageModalProps> = ({
  isOpen,
  onClose,
  memories,
  places,
  onRestoreData,
  onResetSampleData,
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'guide' | 'export'>('inspector');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  if (!isOpen) return null;

  // Calculate storage usage
  const memoriesJson = JSON.stringify(memories, null, 2);
  const placesJson = JSON.stringify(places, null, 2);
  const memoriesBytes = new Blob([memoriesJson]).size;
  const placesBytes = new Blob([placesJson]).size;
  const totalKb = ((memoriesBytes + placesBytes) / 1024).toFixed(2);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadBackup = () => {
    const backupData = {
      app: 'My Little World',
      exportDate: new Date().toISOString(),
      memories,
      places,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_little_world_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = () => {
    setImportError('');
    setImportSuccess('');
    try {
      const parsed = JSON.parse(importJsonText);
      let importedMemories: Memory[] = [];
      let importedPlaces: Place[] = [];

      if (Array.isArray(parsed)) {
        importedMemories = parsed;
      } else if (parsed.memories && Array.isArray(parsed.memories)) {
        importedMemories = parsed.memories;
        if (parsed.places && Array.isArray(parsed.places)) {
          importedPlaces = parsed.places;
        }
      } else {
        throw new Error('Format JSON tidak valid. Harus berupa array memori atau objek backup.');
      }

      onRestoreData(importedMemories, importedPlaces);
      setImportSuccess(`Berhasil memulihkan ${importedMemories.length} memori!`);
      setImportJsonText('');
    } catch (err: any) {
      setImportError(err.message || 'Gagal memproses file JSON. Pastikan format sudah benar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fffefb] border border-[#d8c2b0] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2b1810] text-[#fffefb] px-6 py-5 flex items-center justify-between border-b border-[#422518]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-amber-300">
              database
            </span>
            <div>
              <h2 className="font-serif-display text-xl font-extrabold tracking-wide">
                Inspektur Data & Storage
              </h2>
              <p className="text-xs text-rose-100/80 font-sans font-medium">
                Kelola, lihat, & cadangkan data localStorage memori Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e8d5c4] bg-[#f8f1e7] px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inspector'
                ? 'bg-[#fffefb] text-[#2b1810] border-t border-x border-[#e8d5c4] shadow-sm'
                : 'text-[#8c6f5d] hover:text-[#2b1810]'
            }`}
          >
            <span className="material-symbols-outlined text-base">code</span>
            <span>Lihat Data LocalStorage</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-[#fffefb] text-[#2b1810] border-t border-x border-[#e8d5c4] shadow-sm'
                : 'text-[#8c6f5d] hover:text-[#2b1810]'
            }`}
          >
            <span className="material-symbols-outlined text-base">developer_mode</span>
            <span>Cara Cek di Browser DevTools</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'export'
                ? 'bg-[#fffefb] text-[#2b1810] border-t border-x border-[#e8d5c4] shadow-sm'
                : 'text-[#8c6f5d] hover:text-[#2b1810]'
            }`}
          >
            <span className="material-symbols-outlined text-base">cloud_download</span>
            <span>Backup & Import JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2b1810]">
          {/* TAB 1: INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-5">
              {/* Usage Summary Box */}
              <div className="bg-[#f4ece1] border border-[#d8c2b0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2b1810] text-[#fffefb] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">hard_drive</span>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#2b1810]">
                      Ukuran Storage Terpakai: <span className="text-[#8c3b19]">{totalKb} KB</span>
                    </div>
                    <div className="text-xs text-[#6e5141] font-semibold">
                      Total {memories.length} Memori & {places.length} Lokasi Tersimpan di Browser
                    </div>
                  </div>
                </div>
                <button
                  onClick={onResetSampleData}
                  className="px-3.5 py-1.5 rounded-xl border border-[#d8c2b0] bg-white text-xs font-extrabold text-[#8c3b19] hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>Reset Data Sampel</span>
                </button>
              </div>

              {/* Key 1: my_little_world_memories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-extrabold text-[#2b1810]">
                    <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900">
                      Key 1
                    </span>
                    <span>my_little_world_memories</span>
                    <span className="text-gray-500 font-sans">({memories.length} items)</span>
                  </div>
                  <button
                    onClick={() => handleCopy('memories', memoriesJson)}
                    className="px-3 py-1 rounded-lg bg-[#2b1810] text-white text-xs font-extrabold hover:bg-[#422518] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === 'memories' ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedKey === 'memories' ? 'Tersalin!' : 'Salin JSON'}</span>
                  </button>
                </div>
                <pre className="bg-[#1e1b18] text-[#f2e6d8] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-48 border border-[#3d332a] leading-relaxed select-all">
                  {memoriesJson}
                </pre>
              </div>

              {/* Key 2: my_little_world_places */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-extrabold text-[#2b1810]">
                    <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900">
                      Key 2
                    </span>
                    <span>my_little_world_places</span>
                    <span className="text-gray-500 font-sans">({places.length} items)</span>
                  </div>
                  <button
                    onClick={() => handleCopy('places', placesJson)}
                    className="px-3 py-1 rounded-lg bg-[#2b1810] text-white text-xs font-extrabold hover:bg-[#422518] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === 'places' ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedKey === 'places' ? 'Tersalin!' : 'Salin JSON'}</span>
                  </button>
                </div>
                <pre className="bg-[#1e1b18] text-[#f2e6d8] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-36 border border-[#3d332a] leading-relaxed select-all">
                  {placesJson}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed font-semibold">
                💡 Data aplikasi ini disimpan sepenuhnya secara aman di memori lokal peramban Anda (<strong>Browser LocalStorage</strong>). Tidak ada server eksternal yang melacak atau menyimpan foto Anda tanpa izin.
              </div>

              <h3 className="font-serif-display text-base font-extrabold text-[#2b1810]">
                Langkah-Langkah Melihat LocalStorage di Developer Tools Browser:
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-[#f8f1e7] border border-[#d8c2b0] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-[#8c3b19]">
                    <span className="w-6 h-6 rounded-full bg-[#8c3b19] text-white flex items-center justify-center text-xs">
                      1
                    </span>
                    <span>Buka Developer Tools</span>
                  </div>
                  <p className="text-xs text-[#5c3e2b] leading-relaxed">
                    Tekan tombol <code className="bg-white px-1.5 py-0.5 rounded border border-[#d8c2b0] font-mono">F12</code> atau klik kanan di halaman mana saja lalu pilih <code className="bg-white px-1.5 py-0.5 rounded border border-[#d8c2b0] font-mono">Inspeksi / Inspect</code>.
                  </p>
                </div>

                <div className="bg-[#f8f1e7] border border-[#d8c2b0] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-[#8c3b19]">
                    <span className="w-6 h-6 rounded-full bg-[#8c3b19] text-white flex items-center justify-center text-xs">
                      2
                    </span>
                    <span>Pilih Tab Application / Storage</span>
                  </div>
                  <p className="text-xs text-[#5c3e2b] leading-relaxed">
                    Di panel bagian atas DevTools, klik tab <strong>Application</strong> (di Chrome/Edge) atau tab <strong>Storage</strong> (di Firefox).
                  </p>
                </div>

                <div className="bg-[#f8f1e7] border border-[#d8c2b0] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-[#8c3b19]">
                    <span className="w-6 h-6 rounded-full bg-[#8c3b19] text-white flex items-center justify-center text-xs">
                      3
                    </span>
                    <span>Buka Menu Local Storage</span>
                  </div>
                  <p className="text-xs text-[#5c3e2b] leading-relaxed">
                    Di bilah menu sebelah kiri, buka folder <strong>Local Storage</strong> dan klik alamat domain website yang sedang dibuka.
                  </p>
                </div>

                <div className="bg-[#f8f1e7] border border-[#d8c2b0] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-sm text-[#8c3b19]">
                    <span className="w-6 h-6 rounded-full bg-[#8c3b19] text-white flex items-center justify-center text-xs">
                      4
                    </span>
                    <span>Lihat Key & Value</span>
                  </div>
                  <p className="text-xs text-[#5c3e2b] leading-relaxed">
                    Anda akan melihat dua nama kunci utama:
                    <br />
                    • <code className="bg-white px-1 py-0.5 rounded border font-mono">my_little_world_memories</code>
                    <br />• <code className="bg-white px-1 py-0.5 rounded border font-mono">my_little_world_places</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & IMPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Backup Section */}
              <div className="bg-[#f8f1e7] border border-[#d8c2b0] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#8c3b19]">
                    download_for_offline
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2b1810]">
                      Unduh File Cadangan Backup (.json)
                    </h4>
                    <p className="text-xs text-[#6e5141]">
                      Simpan seluruh foto, lokasi, dan jurnal catatan Anda ke dalam file aman di komputer atau HP Anda.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  className="bg-[#2b1810] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs hover:bg-[#422518] transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base text-amber-300">file_download</span>
                  <span>Unduh File Backup Sekarang</span>
                </button>
              </div>

              {/* Import Section */}
              <div className="bg-[#f8f1e7] border border-[#d8c2b0] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#8c3b19]">
                    file_upload
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#2b1810]">
                      Pulihkan / Import Data dari JSON
                    </h4>
                    <p className="text-xs text-[#6e5141]">
                      Tempelkan teks JSON backup untuk mengembalikan data memori Anda.
                    </p>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Tempelkan isi JSON backup di sini..."
                  className="w-full bg-white border border-[#d8c2b0] rounded-xl p-3 text-xs font-mono text-[#2b1810] outline-none focus:border-[#8c3b19]"
                />

                {importError && (
                  <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{importSuccess}</span>
                  </div>
                )}

                <button
                  onClick={handleImportBackup}
                  disabled={!importJsonText.trim()}
                  className="bg-[#8c3b19] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs hover:bg-[#722e12] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">restore</span>
                  <span>Proses Restore Data</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f4ece1] border-t border-[#e8d5c4] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#2b1810] text-[#fffefb] px-6 py-2.5 rounded-xl font-extrabold text-xs hover:bg-[#422518] transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
