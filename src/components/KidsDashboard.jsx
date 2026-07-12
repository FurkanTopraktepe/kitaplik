import React, { useState } from 'react';
import { X } from 'lucide-react';

const PetVisual = ({ type, level }) => {
  // 1-2: Seed, 3-4: Sprout, 5-6: Bud, 7+: Mature/Blooming
  const stage = level <= 2 ? 1 : level <= 4 ? 2 : level <= 6 ? 3 : 4;

  if (type === 'cactus') {
    if (stage === 1) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          <circle cx="100" cy="115" r="14" fill="#81C784" />
          <line x1="100" y1="101" x2="100" y2="92" stroke="#2E7D32" strokeWidth="2.5" />
          <circle cx="95" cy="112" r="1.5" fill="#000" />
          <circle cx="105" cy="112" r="1.5" fill="#000" />
        </svg>
      );
    }
    if (stage === 2) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          <path d="M100 80 C88 80 88 140 100 140 C112 140 112 80 100 80 Z" fill="#4CAF50" />
          <path d="M90 100 L84 96 M110 100 L116 96" stroke="#fff" strokeWidth="1.5" />
          <circle cx="96" cy="95" r="2.5" fill="#fff" />
          <circle cx="104" cy="95" r="2.5" fill="#fff" />
          <circle cx="96" cy="95" r="1" fill="#000" />
          <circle cx="104" cy="95" r="1" fill="#000" />
          <path d="M97 105 Q100 109 103 105" stroke="#000" strokeWidth="1.5" fill="none" />
        </svg>
      );
    }
    if (stage === 3) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-pulse">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          <path d="M100 50 C82 50 82 140 100 140 C118 140 118 50 100 50 Z" fill="#388E3C" />
          <path d="M85 85 Q72 85 72 70 Q72 62 80 62 Q80 75 85 85 Z" fill="#388E3C" />
          <path d="M115 95 Q128 95 128 80 Q128 72 120 72 Q120 85 115 95 Z" fill="#388E3C" />
          <circle cx="93" cy="75" r="3" fill="#fff" />
          <circle cx="107" cy="75" r="3" fill="#fff" />
          <circle cx="93" cy="75" r="1.5" fill="#000" />
          <circle cx="107" cy="75" r="1.5" fill="#000" />
          <path d="M96 85 Q100 90 104 85" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      );
    }
    // Stage 4 (Blooming)
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
        <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
        <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
        {/* Flower */}
        <circle cx="100" cy="22" r="8" fill="#FF4081" />
        <circle cx="88" cy="26" r="6" fill="#FF4081" />
        <circle cx="112" cy="26" r="6" fill="#FF4081" />
        <circle cx="94" cy="15" r="6" fill="#FF4081" />
        <circle cx="106" cy="15" r="6" fill="#FF4081" />
        <circle cx="100" cy="22" r="4" fill="#FFEB3B" />
        {/* Body */}
        <path d="M100 35 C75 35 75 140 100 140 C125 140 125 35 100 35 Z" fill="#2E7D32" />
        <path d="M85 70 Q70 70 70 55 Q70 45 80 45 Q80 60 85 70 Z" fill="#2E7D32" />
        <path d="M115 80 Q130 80 130 65 Q130 55 120 55 Q120 70 115 80 Z" fill="#2E7D32" />
        {/* Spines */}
        <path d="M82 50 L75 48 M118 50 L125 48 M80 85 L73 85 M120 85 L127 85" stroke="#fff" strokeWidth="1.5" />
        {/* Face */}
        <circle cx="92" cy="65" r="3.5" fill="#fff" />
        <circle cx="108" cy="65" r="3.5" fill="#fff" />
        <circle cx="92" cy="65" r="1.5" fill="#000" />
        <circle cx="108" cy="65" r="1.5" fill="#000" />
        <path d="M96 78 Q100 83 104 78" stroke="#000" strokeWidth="2.5" fill="none" />
        <circle cx="85" cy="70" r="3" fill="#FF8A80" />
        <circle cx="115" cy="70" r="3" fill="#FF8A80" />
      </svg>
    );
  }

  if (type === 'daisy') {
    if (stage === 1) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          <path d="M96 140 Q90 120 95 115 Q102 120 96 140 Z" fill="#4CAF50" />
          <path d="M104 140 Q110 120 105 115 Q98 120 104 140 Z" fill="#4CAF50" />
        </svg>
      );
    }
    if (stage === 2) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          <path d="M100 140 Q95 110 100 95" stroke="#4CAF50" strokeWidth="4" fill="none" />
          <path d="M98 120 Q85 115 88 110 Q95 112 98 120 Z" fill="#4CAF50" />
          <path d="M102 110 Q115 105 112 100 Q105 102 102 110 Z" fill="#4CAF50" />
        </svg>
      );
    }
    if (stage === 3) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-pulse">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          <path d="M100 140 Q96 90 100 70" stroke="#4CAF50" strokeWidth="5" fill="none" />
          <path d="M98 110 Q80 105 85 98 Q95 100 98 110 Z" fill="#4CAF50" />
          <path d="M102 95 Q120 90 115 83 Q105 85 102 95 Z" fill="#4CAF50" />
          {/* Bud */}
          <circle cx="100" cy="65" r="12" fill="#81C784" />
          <circle cx="100" cy="65" r="6" fill="#A5D6A7" />
        </svg>
      );
    }
    // Stage 4 (Blooming Daisy)
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
        <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
        <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
        <path d="M100 140 Q96 80 100 55" stroke="#2E7D32" strokeWidth="5" fill="none" />
        <path d="M98 100 Q80 95 85 88 Q95 90 98 100 Z" fill="#2E7D32" />
        <path d="M102 85 Q120 80 115 73 Q105 75 102 85 Z" fill="#2E7D32" />
        {/* Petals */}
        <circle cx="100" cy="35" r="12" fill="#FFF" />
        <circle cx="100" cy="75" r="12" fill="#FFF" />
        <circle cx="80" cy="55" r="12" fill="#FFF" />
        <circle cx="120" cy="55" r="12" fill="#FFF" />
        <circle cx="86" cy="41" r="12" fill="#FFF" />
        <circle cx="114" cy="69" r="12" fill="#FFF" />
        <circle cx="114" cy="41" r="12" fill="#FFF" />
        <circle cx="86" cy="69" r="12" fill="#FFF" />
        {/* Center */}
        <circle cx="100" cy="55" r="16" fill="#FFD54F" />
        <circle cx="95" cy="52" r="2.5" fill="#fff" />
        <circle cx="105" cy="52" r="2.5" fill="#fff" />
        <circle cx="95" cy="52" r="1" fill="#000" />
        <circle cx="105" cy="52" r="1" fill="#000" />
        <path d="M97 60 Q100 64 103 60" stroke="#000" strokeWidth="1.5" fill="none" />
        <circle cx="90" cy="58" r="2" fill="#FF8A80" />
        <circle cx="110" cy="58" r="2" fill="#FF8A80" />
      </svg>
    );
  }

  if (type === 'worm') {
    if (stage === 1) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          {/* Egg shell */}
          <path d="M100 90 C85 90 85 140 100 140 C115 140 115 90 100 90 Z" fill="#ECEFF1" stroke="#CFD8DC" strokeWidth="2" />
          <path d="M86 110 L100 100 L114 110" stroke="#CFD8DC" strokeWidth="2" fill="none" />
          <path d="M96 100 Q100 85 105 92" stroke="#81C784" strokeWidth="5" strokeLinecap="round" fill="none" />
        </svg>
      );
    }
    if (stage === 2) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          {/* Caterpillar */}
          <path d="M85 135 Q100 115 115 135" stroke="#81C784" strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="115" cy="120" r="10" fill="#4CAF50" />
          <circle cx="112" cy="118" r="1.5" fill="#000" />
          <path d="M115 124 Q117 122 119 124" stroke="#000" strokeWidth="1" fill="none" />
        </svg>
      );
    }
    if (stage === 3) {
      return (
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-pulse">
          <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
          <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
          <path d="M75 135 Q90 110 105 135 Q120 110 135 135" stroke="#4CAF50" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="135" cy="115" r="12" fill="#388E3C" />
          {/* Glasses */}
          <circle cx="131" cy="112" r="3" stroke="#FFD54F" strokeWidth="1.5" fill="none" />
          <circle cx="139" cy="112" r="3" stroke="#FFD54F" strokeWidth="1.5" fill="none" />
          <line x1="134" y1="112" x2="136" y2="112" stroke="#FFD54F" strokeWidth="1.5" />
          <circle cx="131" cy="112" r="1" fill="#000" />
          <circle cx="139" cy="112" r="1" fill="#000" />
          {/* Book */}
          <rect x="110" y="125" width="20" height="15" fill="#FF5722" rx="1" />
          <line x1="120" y1="125" x2="120" y2="140" stroke="#fff" />
        </svg>
      );
    }
    // Stage 4 (Butterfly)
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto animate-bounce">
        <rect x="75" y="140" width="50" height="35" rx="6" fill="#8D6E63" />
        <path d="M70 140 H130 V145 H70 Z" fill="#70544C" />
        {/* Wings */}
        <path d="M100 80 Q70 40 50 65 Q40 80 75 95 Q50 120 70 130 Q85 130 100 95 Z" fill="#FF4081" opacity="0.8" />
        <path d="M100 80 Q130 40 150 65 Q160 80 125 95 Q150 120 130 130 Q115 130 100 95 Z" fill="#FF4081" opacity="0.8" />
        <circle cx="65" cy="65" r="6" fill="#FFEB3B" />
        <circle cx="135" cy="65" r="6" fill="#FFEB3B" />
        {/* Body */}
        <path d="M100 130 L100 50" stroke="#FFD54F" strokeWidth="10" strokeLinecap="round" />
        <circle cx="100" cy="45" r="8" fill="#FFC107" />
        <circle cx="97" cy="43" r="1.5" fill="#000" />
        <circle cx="103" cy="43" r="1.5" fill="#000" />
        <path d="M98 48 Q100 50 102 48" stroke="#000" strokeWidth="1" fill="none" />
        {/* Antennas */}
        <path d="M98 38 Q90 28 92 24" stroke="#FFC107" strokeWidth="2" fill="none" />
        <path d="M102 38 Q110 28 108 24" stroke="#FFC107" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  return null;
};

const KidsDashboard = ({
  books,
  onOpenBook,
  kidsXp,
  setKidsXp,
  kidsTheme,
  setKidsTheme,
  kidsTarget,
  setKidsTarget,
  kidsPetType,
  setKidsPetType,
  isDark,
  themeColors,
  onExitKidsMode
}) => {
  const [kidsTab, setKidsTab] = useState('garden'); // 'garden', 'books'
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [mathProblem, setMathProblem] = useState({ q: '', a: 0 });
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  const level = Math.floor(kidsXp / 100) + 1;
  const xpInLevel = kidsXp % 100;

  const generateMathProblem = () => {
    const num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    setMathProblem({
      q: `${num1} x ${num2} = ?`,
      a: num1 * num2
    });
    setMathAnswer('');
    setMathError(false);
  };

  const handleExitRequest = () => {
    generateMathProblem();
    setShowExitConfirm(true);
  };

  const verifyParentLock = () => {
    if (Number(mathAnswer) === mathProblem.a) {
      setShowExitConfirm(false);
      onExitKidsMode();
    } else {
      setMathError(true);
      setMathAnswer('');
    }
  };

  return (
    <div className={`flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto ${isDark ? 'text-purple-100' : 'text-emerald-900'} pb-24`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/40 dark:bg-black/25 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-bounce">🌟</span>
          <div>
            <h1 className="text-2xl font-black">Merhaba Kitap Kurdu!</h1>
            <p className="text-xs opacity-75 font-semibold">Bugün harika bir okuma günü!</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#7B3F3F]/15 border border-[#7B3F3F]/20 px-5 py-2.5 rounded-2xl flex flex-col items-center">
            <span className="text-xs opacity-65 font-bold uppercase">Skorum</span>
            <span className="text-lg font-black text-[#7B3F3F] dark:text-[#E1BEE7]">{kidsXp} XP</span>
          </div>
          
          <button
            onClick={handleExitRequest}
            className="px-4 py-2.5 bg-zinc-400/20 hover:bg-zinc-400/30 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-black/5"
          >
            <span>🔒 Veli Alanı</span>
          </button>
        </div>
      </div>

      {/* Kids Mode Subtabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setKidsTab('garden')}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${kidsTab === 'garden' ? 'bg-[#7B3F3F] text-white shadow-lg scale-105' : 'bg-white/50 dark:bg-black/10 hover:bg-white/70'}`}
        >
          <span>🌸</span>
          <span>Sanal Bahçem</span>
        </button>
        <button
          onClick={() => setKidsTab('books')}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${kidsTab === 'books' ? 'bg-[#7B3F3F] text-white shadow-lg scale-105' : 'bg-white/50 dark:bg-black/10 hover:bg-white/70'}`}
        >
          <span>📚</span>
          <span>Kitaplarım</span>
        </button>
      </div>

      {/* Tab 1: Virtual Garden */}
      {kidsTab === 'garden' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center animate-fade-in">
          {/* Pet Card */}
          <div className="bg-white/50 dark:bg-black/20 p-8 rounded-3xl border border-white/20 shadow-sm text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-orange-500/10 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-500/20 text-orange-600 dark:text-orange-300">
              Seviye {level}
            </div>

            <PetVisual type={kidsPetType} level={level} />

            <div>
              <h3 className="text-lg font-black capitalize">
                {kidsPetType === 'cactus' ? 'Tombul Kaktüs 🌵' : kidsPetType === 'daisy' ? 'Neşeli Papatya 🌼' : 'Bilge Tırtıl 🐛'}
              </h3>
              <p className="text-xs opacity-75 mt-1 font-semibold">Okudukça büyüyor, seviye atlıyor!</p>
            </div>

            {/* Level progress bar */}
            <div className="space-y-1.5 max-w-xs mx-auto">
              <div className="flex justify-between text-[10px] font-bold opacity-75">
                <span>Sonraki Seviye</span>
                <span>{xpInLevel} / 100 XP</span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${xpInLevel}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Status and Configuration */}
          <div className="space-y-6">
            <div className="bg-white/40 dark:bg-black/10 p-6 rounded-3xl border border-white/15 space-y-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <span>💡</span> Görev Paneli
              </h3>
              <p className="text-xs leading-relaxed font-semibold">
                Evcil hayvanını beslemek ve geliştirmek için her gün e-kitap okumalısın! E-okuyucu ile okuduğun **her sayfa için 2 XP**, okuduğun **her dakika için 5 XP** kazanırsın.
              </p>
              <div className="bg-[#7B3F3F]/10 border border-[#7B3F3F]/20 p-4 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <span className="text-[10px] font-bold opacity-60 block uppercase">Bugünkü Hedefim</span>
                  <span className="text-xs font-black">{kidsTarget} Dakika Okuma</span>
                </div>
              </div>
            </div>

            {/* Character Selection */}
            <div className="bg-white/40 dark:bg-black/10 p-6 rounded-3xl border border-white/15 space-y-3">
              <h3 className="font-extrabold text-sm">Canlı Karakterini Seç</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'cactus', label: 'Kaktüs', emoji: '🌵' },
                  { id: 'daisy', label: 'Papatya', emoji: '🌼' },
                  { id: 'worm', label: 'Tırtıl', emoji: '🐛' }
                ].map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => setKidsPetType(pet.id)}
                    className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all ${kidsPetType === pet.id ? 'border-[#7B3F3F] bg-[#7B3F3F]/10 text-[#7B3F3F] dark:text-[#E1BEE7]' : 'border-gray-400/20 hover:bg-white/30'}`}
                  >
                    <span className="text-xl">{pet.emoji}</span>
                    <span>{pet.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Simplified Book List */}
      {kidsTab === 'books' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black">Okuduğum Kitaplar</h2>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-16 bg-white/40 dark:bg-black/20 rounded-3xl border border-white/20">
              <span className="text-4xl">📚</span>
              <h3 className="font-black text-sm mt-3">Kütüphanen Boş Görünüyor</h3>
              <p className="text-xs opacity-75 mt-1">Okumak istediğin kitapları eklemek için velinden yardım isteyebilirsin!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {books.map(book => {
                const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
                return (
                  <div
                    key={book.id}
                    onClick={() => onOpenBook(book)}
                    className="bg-white/50 dark:bg-black/20 p-4 rounded-3xl border border-white/20 shadow-sm transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div
                        className="aspect-[3/4] w-full rounded-2xl relative overflow-hidden shadow-md"
                        style={{ backgroundColor: book.cover }}
                      >
                        {book.coverImage && (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        )}
                        {book.hasEbook && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-lg text-[9px] font-bold shadow flex items-center gap-0.5">
                            <span>📱</span> E-Okuyucu
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-black text-xs truncate leading-snug">{book.title}</h4>
                        <p className="text-[10px] opacity-75 truncate">{book.author}</p>
                      </div>
                    </div>

                    {book.totalPages > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[9px] font-bold opacity-75">
                          <span>İlerleme</span>
                          <span>%{progress}</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#7B3F3F] h-2 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Parent Lock / Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in text-zinc-900">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl relative border border-gray-100 flex flex-col gap-4 text-center">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X size={20} />
            </button>
            <div className="text-4xl mt-2">🔒</div>
            <div>
              <h3 className="text-md font-black">Ebeveyn Doğrulaması</h3>
              <p className="text-xs opacity-75 mt-1">Bu alana erişmek için aşağıdaki matematik sorusunu çözmelisiniz.</p>
            </div>
            <div className="bg-zinc-100 p-4 rounded-2xl text-xl font-bold font-mono tracking-wider">
              {mathProblem.q}
            </div>
            <input
              type="number"
              pattern="[0-9]*"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              placeholder="Cevap..."
              className={`w-full p-3 border-2 text-center text-sm font-bold rounded-2xl focus:border-[#7B3F3F] outline-none ${mathError ? 'border-red-500' : 'border-zinc-200'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') verifyParentLock();
              }}
            />
            {mathError && (
              <p className="text-[10px] text-red-500 font-bold">Hatalı cevap, lütfen tekrar deneyin.</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 rounded-2xl font-bold text-xs"
              >
                Vazgeç
              </button>
              <button
                onClick={verifyParentLock}
                className="flex-1 py-3 bg-[#7B3F3F] text-white hover:bg-[#5D3030] rounded-2xl font-bold text-xs"
              >
                Kilidi Aç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidsDashboard;
