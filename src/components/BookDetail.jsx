import React, { useState } from 'react';
import { X, Upload, BookOpen, Trash2, Clock, Quote, Share2, Star, Zap, ArrowLeft, ArrowRight } from 'lucide-react';

const BookDetail = ({
  book,
  onClose,
  onUpdate,
  onDelete,
  isDark,
  themeColors,
  collections,
  onUpdateCollection,
  onShareQuote,
  onOpenReader,
  storeEbookFile,
  deleteEbookFile,
  handleImageUpload,
  onMoveBook
}) => {
  const [newHighlight, setNewHighlight] = useState('');

  const addHighlight = () => {
    if (newHighlight.trim()) {
      onUpdate(book.id, { highlights: [...(book.highlights || []), newHighlight] });
      setNewHighlight('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl ${themeColors.card} ${themeColors.border} border-2`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${themeColors.text} opacity-70 hover:opacity-100 transition-opacity`}
        >
          <X size={24} />
        </button>

        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div
            className="w-32 h-48 rounded shadow-lg flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0"
            style={{
              backgroundColor: book.cover,
              boxShadow: '4px 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            {book.coverImage && (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className={`text-3xl font-bold mb-1 ${themeColors.text}`}>{book.title}</h2>
                <p className={`text-lg mb-2 ${themeColors.accent}`}>{book.author}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${themeColors.button}`}>
                  {book.genre || 'Tür Belirtilmemiş'}
                </span>
              </div>
            </div>

            <div className="mb-4 text-xs font-semibold">
              {book.totalPages > 0 && (
                <div className={`p-2 rounded flex items-center gap-2 mb-2 ${themeColors.widget}`}>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span>İlerleme: Sayfa {book.currentPage || 0} / {book.totalPages}</span>
                      <span>{Math.round(((book.currentPage || 0) / book.totalPages) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#7B3F3F] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((book.currentPage || 0) / book.totalPages) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {book.totalPages > 0 && book.status === 'reading' && (() => {
                const paperSessions = (book.sessions || []).filter(s => s.type === 'paper');
                const totalPagesLogged = paperSessions.reduce((sum, s) => sum + (s.pages || 0), 0);
                const totalMinutesLogged = paperSessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
                const bookSpeed = totalMinutesLogged > 0 ? (totalPagesLogged / totalMinutesLogged) : 0.5;
                const remainingPages = Math.max(0, (book.totalPages || 0) - (book.currentPage || 0));
                const remainingMinutes = remainingPages > 0 ? (remainingPages / bookSpeed) : 0;

                const hours = Math.floor(remainingMinutes / 60);
                const mins = Math.round(remainingMinutes % 60);
                const dailyMinutes = 30;
                const remainingDays = Math.ceil(remainingMinutes / dailyMinutes);

                return (
                  <div className={`mt-2 p-3 rounded text-[11px] font-semibold space-y-1.5 ${themeColors.widget}`}>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider opacity-60">
                      <span>Okuma Hızı Analizi</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-400/10 pb-1">
                      <span>Ortalama Okuma Hızı:</span>
                      <span className="font-bold text-[#8D6E63]">{bookSpeed.toFixed(2)} sayfa/dk</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-400/10 pb-1">
                      <span>Kalan Süre:</span>
                      <span className="font-bold text-[#8D6E63]">
                        {hours > 0 ? `${hours} sa ` : ''}{mins} dk
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tahmini Bitirme Süresi:</span>
                      <span className="font-bold text-[#8D6E63]">{remainingDays} Gün (Günde {dailyMinutes} dk okuma ile)</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Durum</label>
                <select
                  value={book.status}
                  onChange={(e) => onUpdate(book.id, { status: e.target.value })}
                  className={`w-full p-2 border-2 rounded ${isDark
                    ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
                    : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'
                    }`}
                >
                  <option value="want-to-read">Okunacak</option>
                  <option value="reading">Okunuyor</option>
                  <option value="read">Okundu</option>
                </select>
              </div>

              <div className="flex-1">
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Şu Anki Sayfa</label>
                <input
                  type="number"
                  value={book.currentPage || ''}
                  onChange={(e) => onUpdate(book.id, { currentPage: Number(e.target.value) })}
                  placeholder={book.totalPages ? `/ ${book.totalPages}` : '0'}
                  className={`w-full p-2 border-2 rounded ${isDark
                    ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
                    : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'
                    }`}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Kapak Resmi (URL veya Yükle)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={book.coverImage || ''}
                  onChange={(e) => onUpdate(book.id, { coverImage: e.target.value })}
                  placeholder="https://..."
                  className={`flex-1 p-2 border-2 rounded ${isDark
                    ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
                    : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'
                    }`}
                />
                <label className={`flex items-center justify-center w-12 rounded cursor-pointer transition-colors ${isDark
                  ? 'bg-[#4A3B2F] hover:bg-[#4D4439] text-[#E8D4BA]'
                  : 'bg-[#C8A882] hover:bg-[#B89872] text-[#654321]'}`}>
                  <Upload size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, (updates) => onUpdate(book.id, updates), book)}
                  />
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>E-Kitap Dosyası (EPUB / PDF)</label>
              <div className="flex gap-2">
                {book.hasEbook ? (
                  <div className={`flex-1 flex items-center justify-between p-3 border-2 border-dashed rounded-lg ${isDark ? 'border-[#7B3F3F]/30 bg-[#2D2620]/30' : 'border-[#7B3F3F]/30 bg-white/50'}`}>
                    <span className="text-xs truncate font-mono max-w-[200px]" title={book.fileName}>
                      {book.fileName || (book.epubPath ? 'Yüklü (EPUB)' : 'Yüklü (PDF)')}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenReader(book);
                        }}
                        className="px-3 py-1.5 bg-[#7B3F3F] text-white hover:bg-[#5D3030] rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        <BookOpen size={12} />
                        <span>Oku</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('E-kitap dosyasını silmek istediğinizden emin misiniz?')) {
                            deleteEbookFile(book.id).then(() => {
                              onUpdate(book.id, { hasEbook: false, epubPath: null, pdfPath: null, fileName: null });
                            });
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Dosyayı Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3.5 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:bg-black/5 ${isDark ? 'border-[#4A3B2F] text-[#E8D4BA]' : 'border-[#C8A882] text-[#654321]'}`}>
                    <Upload size={16} className="opacity-80" />
                    <span className="text-xs font-bold">E-Kitap Yükle (PDF, EPUB)</span>
                    <input
                      type="file"
                      accept=".pdf,.epub"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const isPdf = file.name.endsWith('.pdf');
                        if (file.size > 50 * 1024 * 1024) {
                          alert("Dosya boyutu çok büyük! Lütfen 50MB'dan küçük bir dosya seçin.");
                          return;
                        }
                        storeEbookFile(book.id, file).then(() => {
                          onUpdate(book.id, {
                            hasEbook: true,
                            epubPath: isPdf ? null : 'local',
                            pdfPath: isPdf ? 'local' : null,
                            fileName: file.name
                          });
                          alert(`"${file.name}" başarıyla kütüphanenize yüklendi!`);
                        }).catch(err => {
                          alert("Dosya kaydedilirken hata oluştu: " + err.message);
                        });
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Kitap Fiyatı (₺)</label>
              <input
                type="number"
                value={book.price || ''}
                onChange={(e) => onUpdate(book.id, { price: e.target.value })}
                placeholder="Örn: 120"
                className={`w-full p-2 border-2 rounded ${isDark
                  ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
                  : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'
                  }`}
              />
            </div>

            <div className={`mb-4 p-4 rounded-xl border ${themeColors.widget} ${themeColors.border}`}>
              <label className={`block text-xs font-bold mb-2 uppercase opacity-90 ${themeColors.text}`}>Ödünç Takipçisi</label>
              {book.borrowedTo ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-75">Ödünç Verilen:</span>
                    <span className="font-bold">{book.borrowedTo}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-75">Tarih:</span>
                    <span className="font-bold">{book.borrowedDate}</span>
                  </div>
                  <button
                    onClick={() => onUpdate(book.id, { borrowedTo: null, borrowedDate: null })}
                    className="w-full mt-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors"
                  >
                    Geri Alındı Olarak İşaretle
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ödünç alan..."
                    id="borrow-name-input"
                    className={`flex-1 p-2 text-xs border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.target.value.trim();
                        if (val) {
                          onUpdate(book.id, {
                            borrowedTo: val,
                            borrowedDate: new Date().toLocaleDateString('tr-TR')
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('borrow-name-input');
                      const val = input ? input.value.trim() : '';
                      if (val) {
                        onUpdate(book.id, {
                          borrowedTo: val,
                          borrowedDate: new Date().toLocaleDateString('tr-TR')
                        });
                        if (input) input.value = '';
                      } else {
                        alert('Lütfen bir isim girin.');
                      }
                    }}
                    className="px-3 py-1 bg-[#7B3F3F] text-white text-xs font-bold rounded hover:bg-[#5D3030] transition-colors"
                  >
                    Ödünç Ver
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Puanım</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={28}
                    className="cursor-pointer transition-all"
                    fill={star <= book.rating ? '#FFD700' : 'none'}
                    stroke={star <= book.rating ? '#FFD700' : '#D2B48C'}
                    onClick={() => onUpdate(book.id, { rating: star })}
                  />
                ))}

                <button
                  onClick={() => onDelete(book.id)}
                  className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors ml-auto"
                  title="Kitabı Sil"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Koleksiyonlarım</label>
              <div className="flex flex-wrap gap-2">
                {collections.map(col => (
                  <label
                    key={col.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border-2 ${col.bookIds.includes(book.id)
                      ? 'bg-[#7B3F3F] border-[#7B3F3F] text-white'
                      : isDark
                        ? 'bg-[#2D2620] border-[#4A3B2F] text-[#E8D4BA] hover:bg-[#322822]'
                        : 'bg-[#E8DCC8] border-[#C8A882] text-[#654321] hover:bg-[#E0D0B8]'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={col.bookIds.includes(book.id)}
                      onChange={() => onUpdateCollection(col.id, book.id)}
                    />
                    <span className="text-xs font-bold">{col.name}</span>
                  </label>
                ))}
                {collections.length === 0 && (
                  <span className="text-xs italic opacity-60 px-2 py-1">Henüz koleksiyon oluşturulmadı.</span>
                )}
              </div>
            </div>

            {onMoveBook && (
              <div className="mb-4">
                <label className={`block text-xs font-bold uppercase opacity-75 mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Kitap Sıralaması (Raf Konumu)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onMoveBook(book.id, 'left')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${isDark ? 'bg-[#2D2620] border-[#4A3B2F] text-[#E8D4BA]' : 'bg-[#E8DCC8] border-[#C8A882] text-[#654321]'}`}
                  >
                    <ArrowLeft size={14} />
                    <span>Sola Taşı</span>
                  </button>
                  <button
                    onClick={() => onMoveBook(book.id, 'right')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${isDark ? 'bg-[#2D2620] border-[#4A3B2F] text-[#E8D4BA]' : 'bg-[#E8DCC8] border-[#C8A882] text-[#654321]'}`}
                  >
                    <span>Sağa Taşı</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>İncelemem</label>
          <textarea
            value={book.review || ''}
            onChange={(e) => onUpdate(book.id, { review: e.target.value })}
            className={`w-full p-3 border-2 rounded min-h-[100px] ${isDark
              ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
              : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'
              }`}
            placeholder="Bu kitap hakkında düşüncelerini yaz..."
          />
        </div>

        <div className="mb-6 border-t pt-4 border-dashed border-gray-400/30">
          <label className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${themeColors.text}`}>
            <Clock size={18} /> Okuma Günlüğü ({(book.sessions || []).length} seans)
          </label>
          {book.sessions && book.sessions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {book.sessions.map((sess) => (
                <div key={sess.id} className={`p-3 rounded-lg border flex flex-col gap-1.5 ${themeColors.widget} ${themeColors.border}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-60">{sess.date}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{sess.mood}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase ${sess.type === 'audio' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                        {sess.type === 'audio' ? 'Sesli' : 'Okuma'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-1 text-[#8D6E63]">
                    <span><Clock size={12} className="inline mr-1 opacity-70" /> {sess.minutes} dk</span>
                    {sess.type === 'paper' && (
                      <>
                        <span><BookOpen size={12} className="inline mr-1 opacity-70" /> {sess.pages} sf</span>
                        <span><Zap size={12} className="inline mr-1 opacity-70 text-yellow-500 fill-yellow-500/20" /> {(sess.pages / (sess.minutes || 1)).toFixed(1)} sf/dk</span>
                      </>
                    )}
                  </div>
                  {sess.note && (
                    <p className="text-[11px] italic opacity-85 mt-1 pt-1 border-t border-gray-400/10">"{sess.note}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-xs italic opacity-60 ${themeColors.text}`}>Henüz okuma seansı kaydedilmemiş.</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={`block text-sm font-semibold flex items-center gap-2 ${themeColors.text}`}>
              <Quote size={18} />
              Altını Çizdiklerim
            </label>
          </div>

          <div className="space-y-3 mb-3">
            {(book.highlights || []).map((highlight, idx) => (
              <div key={idx} className={`p-3 rounded border-l-4 border-orange-500 shadow-sm ${themeColors.widget} group`}>
                <div className="flex justify-between items-start gap-2">
                  <p className={`italic ${themeColors.text} flex-1`}>"{highlight}"</p>
                  <button
                    onClick={() => onShareQuote(highlight, book)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded transition-all text-orange-500"
                    title="Kart Oluştur ve Paylaş"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addHighlight();
                }
              }}
              className={`flex-1 p-2 border-2 rounded ${isDark
                ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]'
                : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'
                }`}
              placeholder="Yeni alıntı ekle..."
            />
            <button
              onClick={addHighlight}
              className="px-4 py-2 bg-[#7B3F3F] text-white rounded hover:bg-[#5D3030] transition-colors"
            >
              Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
