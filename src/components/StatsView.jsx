import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Trophy, Book, FileText, Flame, Star, Award } from 'lucide-react';

const StatsView = ({
  books,
  stats,
  streakData,
  themeColors,
  isDark,
  genres,
  annualGoal,
  setAnnualGoal,
  readingGoal,
  setReadingGoal,
  weeklyGoal,
  setWeeklyGoal,
  monthlyGoal,
  setMonthlyGoal,
  setOriginalMonthlyGoal,
  challengeName,
  setChallengeName,
  subView,
  setShowYearlySummary,
  getXPInfo,
  getGoalsProgress,
  getUnlockedBadges
}) => {
  const genreChartRef = useRef(null);
  const monthlyChartRef = useRef(null);

  useEffect(() => {
    if (subView === 'stats') {
      const ctx1 = document.getElementById('genreChart');
      const ctx2 = document.getElementById('monthlyChart');

      if (ctx1 && ctx2) {
        if (genreChartRef.current) {
          genreChartRef.current.destroy();
        }
        if (monthlyChartRef.current) {
          monthlyChartRef.current.destroy();
        }

        const genreCounts = genres.reduce((acc, genre) => {
          acc[genre] = books.filter(b => b.genre === genre).length;
          return acc;
        }, {});

        genreChartRef.current = new Chart(ctx1, {
          type: 'radar',
          data: {
            labels: Object.keys(genreCounts),
            datasets: [{
              label: 'Okunan Kitaplar',
              data: Object.values(genreCounts),
              backgroundColor: isDark ? 'rgba(184, 153, 104, 0.2)' : 'rgba(123, 63, 63, 0.2)',
              borderColor: isDark ? '#B89968' : '#7B3F3F',
              pointBackgroundColor: isDark ? '#B89968' : '#7B3F3F',
              pointBorderColor: '#fff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                grid: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                pointLabels: { color: isDark ? '#E8D4BA' : '#654321', font: { size: 10, weight: 'bold' } },
                ticks: { display: false }
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });

        // Set colors for monthly chart based on theme
        const btnColor = isDark ? '#B89968' : '#7B3F3F';
        const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const textColor = isDark ? '#B89968' : '#654321';

        monthlyChartRef.current = new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
            datasets: [{
              label: 'Okunan Kitap',
              data: [2, 1, 3, 4, 2, books.filter(b => b.status === 'read').length],
              backgroundColor: btnColor,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, grid: { color: borderColor }, ticks: { color: textColor } },
              x: { grid: { display: false }, ticks: { color: textColor } }
            }
          }
        });
      }
    }
  }, [subView, books, genres, isDark]);

  if (subView === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-in">
        {/* Summary Cards */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 col-span-full">
          <h3 className={`text-xl font-bold ${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}>Kütüphane Özet Raporu</h3>
          <button
            onClick={() => setShowYearlySummary(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all text-xs flex items-center gap-1.5"
          >
            <Trophy size={14} />
            <span>Yıllık Okuma Özeti</span>
          </button>
        </div>

        <div className={`p-6 rounded-lg shadow-lg ${themeColors.card} ${themeColors.border} border`}>
          <h3 className={`text-lg font-semibold mb-2 ${themeColors.accent}`}>Toplam Kitap</h3>
          <div className="flex justify-between items-end">
            <p className={`text-4xl font-bold ${themeColors.text}`}>{stats.total}</p>
            <Book size={32} className="opacity-20" />
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg ${themeColors.card} ${themeColors.border} border`}>
          <h3 className={`text-lg font-semibold mb-2 ${themeColors.accent}`}>Toplam Sayfa</h3>
          <div className="flex justify-between items-end">
            <p className={`text-4xl font-bold ${themeColors.text}`}>{stats.totalPages}</p>
            <FileText size={32} className="opacity-20" />
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg ${themeColors.card} ${themeColors.border} border`}>
          <h3 className={`text-lg font-semibold mb-2 ${themeColors.accent}`}>En Uzun Seri</h3>
          <div className="flex justify-between items-end">
            <p className={`text-4xl font-bold ${themeColors.text}`}>{streakData.longestStreak || streakData.streak} <span className="text-lg font-normal">gün</span></p>
            <Flame size={32} className="opacity-20 text-orange-500" />
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg ${themeColors.card} ${themeColors.border} border`}>
          <h3 className={`text-lg font-semibold mb-2 ${themeColors.accent}`}>Ort. Puan</h3>
          <div className="flex justify-between items-end">
            <p className={`text-4xl font-bold flex items-center gap-2 ${themeColors.text}`}>
              {stats.avgRating}
            </p>
            <Star size={32} fill="#FFD700" stroke="#FFD700" />
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg ${themeColors.card} ${themeColors.border} border`}>
          <h3 className={`text-lg font-semibold mb-2 ${themeColors.accent}`}>Kitaplık Değeri</h3>
          <div className="flex justify-between items-end">
            <p className={`text-4xl font-bold flex items-center gap-1 ${themeColors.text}`}>
              {stats.totalValue} <span className="text-xl font-normal">₺</span>
            </p>
            <span className="text-2xl opacity-30 select-none">💳</span>
          </div>
        </div>

        {/* Okuma Isı Haritası */}
        <div className={`p-6 rounded-lg shadow-lg col-span-full ${isDark ? 'bg-[#382E26]' : 'bg-[#D4B896]'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}>Okuma Aktivitesi (Son 365 Gün)</h3>
          {(() => {
            const dailyReadingMap = {};
            books.forEach(book => {
              if (book.sessions) {
                book.sessions.forEach(session => {
                  if (session.date) {
                    const d = session.date.substring(0, 10);
                    dailyReadingMap[d] = (dailyReadingMap[d] || 0) + Number(session.minutes || 0);
                  }
                });
              }
            });

            const today = new Date();
            const datesArray = [];
            for (let i = 364; i >= 0; i--) {
              const d = new Date(today);
              d.setDate(today.getDate() - i);
              datesArray.push(d);
            }

            const columns = [];
            let currentWeek = [];
            const startDayOfWeek = datesArray[0].getDay();
            for (let i = 0; i < startDayOfWeek; i++) {
              currentWeek.push(null);
            }

            datesArray.forEach(date => {
              currentWeek.push(date);
              if (currentWeek.length === 7) {
                columns.push(currentWeek);
                currentWeek = [];
              }
            });
            if (currentWeek.length > 0) {
              while (currentWeek.length < 7) {
                currentWeek.push(null);
              }
              columns.push(currentWeek);
            }

            const boxSize = 10;
            const gap = 2;
            const width = columns.length * (boxSize + gap);
            const height = 7 * (boxSize + gap);

            return (
              <div className="overflow-x-auto w-full py-2">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px]">
                  {columns.map((week, colIndex) => (
                    <g key={colIndex} transform={`translate(${colIndex * (boxSize + gap)}, 0)`}>
                      {week.map((date, rowIndex) => {
                        if (!date) return null;
                        const dateStr = date.toISOString().split('T')[0];
                        const minutes = dailyReadingMap[dateStr] || 0;
                        
                        let color = isDark ? '#2d2620' : '#e8dcc8';
                        if (minutes > 0 && minutes <= 10) color = '#9be9a8';
                        else if (minutes > 10 && minutes <= 30) color = '#40c463';
                        else if (minutes > 30 && minutes <= 60) color = '#30a14e';
                        else if (minutes > 60) color = '#216e39';

                        const formattedDate = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

                        return (
                          <rect
                            key={rowIndex}
                            y={rowIndex * (boxSize + gap)}
                            width={boxSize}
                            height={boxSize}
                            rx={1.5}
                            ry={1.5}
                            fill={color}
                            className="cursor-pointer transition-all hover:stroke-[#7B3F3F] hover:stroke-1"
                          >
                            <title>{`${formattedDate}: ${minutes} dakika okundu`}</title>
                          </rect>
                        );
                      })}
                    </g>
                  ))}
                </svg>
              </div>
            );
          })()}
        </div>

        {/* Charts Area */}
        <div className={`p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-3 ${isDark ? 'bg-[#382E26]' : 'bg-[#D4B896]'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}>Tür Dağılımı</h3>
          <div className="h-64 flex justify-center">
            <canvas id="genreChart"></canvas>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-2 ${isDark ? 'bg-[#382E26]' : 'bg-[#D4B896]'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}>Aylık Okuma Aktivitesi</h3>
          <div className="h-64 w-full">
            <canvas id="monthlyChart"></canvas>
          </div>
        </div>

        {/* Challenge & Goals */}
        <div className={`p-6 rounded-lg shadow-lg col-span-1 md:col-span-3 lg:col-span-3 ${isDark ? 'bg-[#382E26]' : 'bg-[#D4B896]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={24} className={`${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`} />
            <input
              type="text"
              value={challengeName}
              onChange={(e) => setChallengeName(e.target.value)}
              className={`text-lg font-semibold bg-transparent border-b-2 border-transparent hover:border-current focus:border-current outline-none w-full transition-all ${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}
            />
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 h-4 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${Math.min((stats.read / annualGoal) * 100, 100)}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>{Math.round((stats.read / annualGoal) * 100)}%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className={`${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}>Okunan: <b>{stats.read}</b> Kitap</span>
            <div className="flex items-center gap-1">
              <span className={`${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}>Hedef:</span>
              <input
                type="number"
                value={annualGoal}
                onChange={(e) => setAnnualGoal(Number(e.target.value))}
                className={`w-16 p-1 text-center border rounded font-bold ${isDark
                  ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
                  : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Daily Goal Input */}
        <div className={`p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-2 ${isDark ? 'bg-[#382E26]' : 'bg-[#D4B896]'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-[#B89968]' : 'text-[#654321]'}`}>Günlük Hedef</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={readingGoal}
              onChange={(e) => setReadingGoal(Number(e.target.value))}
              className={`w-20 p-2 border-2 rounded text-xl font-bold ${isDark
                ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
                : 'border-[#C8A882] bg-white text-[#654321]'
                }`}
            />
            <span className={`text-xl ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>dk</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Goals View
  const xpInfo = getXPInfo();
  const progressInfo = getGoalsProgress();
  const badges = getUnlockedBadges();

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Seviye ve XP Kartı */}
      <div className={`p-6 rounded-xl shadow-lg border ${isDark ? 'bg-[#382E26] border-[#4A3B2F]' : 'bg-[#D4B896] border-[#C8A882]'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Okuma Seviyesi</span>
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>
              Seviye {xpInfo.level}
            </h2>
            <p className="text-xs opacity-75 mt-1 font-sans">Kitap okuyup seanslar kaydettikçe seviye atla!</p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>
              {xpInfo.currentProgressXP} / {xpInfo.xpNeeded} XP
            </span>
            <p className="text-[10px] opacity-60">Toplam XP: {xpInfo.xp}</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-3.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${xpInfo.levelProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Hedefler Bölümü */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Günlük Hedef */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${themeColors.card} ${themeColors.border}`}>
          <div>
            <span className="text-[10px] font-bold opacity-60 uppercase">Günlük Hedef</span>
            <div className="flex justify-between items-baseline mt-1 mb-3">
              <span className="text-2xl font-bold">{progressInfo.dailyMinutes} dk</span>
              <span className="text-xs opacity-70">hedef: {readingGoal} dk</span>
            </div>
            <div className="w-full bg-gray-300/30 rounded-full h-2 overflow-hidden mb-4">
              <div
                className="bg-orange-500 h-full rounded-full"
                style={{ width: `${Math.min((progressInfo.dailyMinutes / (readingGoal || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={readingGoal}
              onChange={(e) => setReadingGoal(Number(e.target.value))}
              className={`w-16 p-1 text-center text-xs border rounded font-bold ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
            />
            <span className="text-xs opacity-80">dk olarak güncelle</span>
          </div>
        </div>

        {/* Haftalık Hedef */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${themeColors.card} ${themeColors.border}`}>
          <div>
            <span className="text-[10px] font-bold opacity-60 uppercase">Haftalık Hedef</span>
            <div className="flex justify-between items-baseline mt-1 mb-3">
              <span className="text-2xl font-bold">{progressInfo.weeklyMinutes} dk</span>
              <span className="text-xs opacity-70">hedef: {weeklyGoal} dk</span>
            </div>
            <div className="w-full bg-gray-300/30 rounded-full h-2 overflow-hidden mb-4">
              <div
                className="bg-green-500 h-full rounded-full"
                style={{ width: `${Math.min((progressInfo.weeklyMinutes / (weeklyGoal || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className={`w-16 p-1 text-center text-xs border rounded font-bold ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
            />
            <span className="text-xs opacity-80">dk olarak güncelle</span>
          </div>
        </div>

        {/* Aylık Hedef */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${themeColors.card} ${themeColors.border}`}>
          <div>
            <span className="text-[10px] font-bold opacity-60 uppercase">Aylık Hedef</span>
            <div className="flex justify-between items-baseline mt-1 mb-3">
              <span className="text-2xl font-bold">{progressInfo.monthlyMinutes} dk</span>
              <span className="text-xs opacity-70">hedef: {monthlyGoal} dk</span>
            </div>
            <div className="w-full bg-gray-300/30 rounded-full h-2 overflow-hidden mb-4">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${Math.min((progressInfo.monthlyMinutes / (monthlyGoal || 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={monthlyGoal}
              onChange={(e) => setOriginalMonthlyGoal ? setOriginalMonthlyGoal(Number(e.target.value)) : setMonthlyGoal(Number(e.target.value))}
              className={`w-16 p-1 text-center text-xs border rounded font-bold ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
            />
            <span className="text-xs opacity-80">dk olarak güncelle</span>
          </div>
        </div>
      </div>

      {/* Rozetler ve Başarımlar */}
      <div>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Rozetler & Başarımlar</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border shadow-sm flex flex-col items-center text-center transition-all ${badge.unlocked
                ? isDark ? 'bg-[#2D2620]/80 border-orange-500/50' : 'bg-orange-500/10 border-orange-500/30'
                : 'opacity-55 scale-95 grayscale'
                }`}
            >
              <span className="text-3xl mb-2">{badge.icon}</span>
              <span className="text-sm font-bold block">{badge.title}</span>
              <span className="text-[10px] opacity-75 mt-1">{badge.desc}</span>
              {badge.unlocked ? (
                <span className="text-[9px] font-bold text-orange-600 bg-orange-200/50 px-2 py-0.5 rounded-full mt-2.5 font-sans">Açıldı</span>
              ) : (
                <span className="text-[9px] font-bold text-gray-500 bg-gray-200/50 px-2 py-0.5 rounded-full mt-2.5 font-sans">Kilitli</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
