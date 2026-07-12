import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Upload, Trash2, X, BookOpen, Clock, Share2, ShoppingCart, Quote, LayoutGrid, AlignJustify } from 'lucide-react';

// Plant pot ornament (Custom SVG terracotta plant)
const PlantOrnament = () => (
  <div className="flex flex-col items-center justify-end h-[280px] w-[60px] pb-1 select-none pointer-events-none transition-transform hover:scale-105" title="Siyah Seramik Saksıda Salon Yaprağı">
    <svg className="w-12 h-24 mb-1 overflow-visible" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Terracotta/Ceramic Pot */}
      <path d="M25 140 H75 L70 190 H30 Z" fill="#8d5b4c" stroke="#5d392e" strokeWidth="3" strokeLinejoin="round" />
      <rect x="20" y="130" width="60" height="12" rx="4" fill="#a46d5c" stroke="#5d392e" strokeWidth="3" />
      <ellipse cx="50" cy="132" rx="25" ry="4" fill="#523229" />
      {/* Plant Leaves */}
      {/* Leaf 1 (Left) */}
      <path d="M50 130 C30 110, 10 90, 15 60 C20 30, 45 40, 50 130" fill="#2d6a4f" stroke="#1b4332" strokeWidth="2.5" />
      <path d="M30 92 C25 80, 22 68, 25 60" stroke="#1b4332" strokeWidth="1.5" strokeLinecap="round" />
      {/* Leaf 2 (Right) */}
      <path d="M50 130 C70 110, 90 90, 85 60 C80 30, 55 40, 50 130" fill="#40916c" stroke="#1b4332" strokeWidth="2.5" />
      <path d="M70 92 C75 80, 78 68, 75 60" stroke="#1b4332" strokeWidth="1.5" strokeLinecap="round" />
      {/* Leaf 3 (Center High Leaf) */}
      <path d="M50 130 C45 90, 35 50, 50 15 C65 50, 55 90, 50 130" fill="#52b788" stroke="#1b4332" strokeWidth="2.5" />
      <line x1="50" y1="130" x2="50" y2="25" stroke="#1b4332" strokeWidth="1.5" />
      {/* Leaf 4 (Small Front Leaf) */}
      <path d="M50 130 C40 120, 35 110, 40 95 C45 80, 55 95, 50 130" fill="#74c69d" stroke="#2d6a4f" strokeWidth="2" />
    </svg>
  </div>
);

// Cup/Coffee ornament (Animated Steam Mug)
const CoffeeOrnament = () => (
  <div className="flex flex-col items-center justify-end h-[280px] w-[50px] pb-1 select-none pointer-events-none transition-transform hover:scale-105" title="Sıcak Filtre Kahve Kupası">
    <svg className="w-10 h-16 mb-1 overflow-visible" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Animated Rising Steam paths */}
      <path d="M30 30 Q25 20, 30 10 T25 0" stroke="#a0856a" strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M45 32 Q50 22, 45 12 T50 2" stroke="#a0856a" strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <animate attributeName="stroke-dashoffset" values="30;0" dur="2.5s" repeatCount="indefinite" />
      </path>
      {/* Mug Handle */}
      <path d="M55 60 C75 60, 75 90, 55 90" stroke="#7B3F3F" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Mug Body */}
      <path d="M15 50 H55 V90 C55 100, 15 100, 15 90 Z" fill="#7B3F3F" stroke="#5D3030" strokeWidth="3" strokeLinejoin="round" />
      {/* Liquid inner border */}
      <ellipse cx="35" cy="50" rx="20" ry="5" fill="#f5e6d3" opacity="0.9" />
      <ellipse cx="35" cy="50" rx="17" ry="3.5" fill="#4a2c11" />
    </svg>
  </div>
);

// Art frame ornament (Custom Scenic Picture Frame)
const MiniArtOrnament = ({ isDark }) => (
  <div className="flex flex-col items-center justify-end h-[280px] w-[80px] pb-1 select-none pointer-events-none">
    <div
      className="w-[70px] h-[95px] mb-2 rounded shadow-lg p-1.5 flex flex-col items-center justify-center transition-all hover:scale-105"
      style={{
        background: '#5c3818',
        border: '5px solid #3c240e',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.5)'
      }}
      title="Minyatür Dağ Manzarası Tablosu"
    >
      <svg className="w-full h-full bg-gradient-to-b from-amber-200 to-amber-500 rounded-sm overflow-hidden" viewBox="0 0 50 80">
        {/* Sun */}
        <circle cx="25" cy="30" r="10" fill="#f97316" />
        {/* Mountain 1 */}
        <polygon points="-10,80 20,45 50,80" fill="#4b5563" opacity="0.9" />
        {/* Mountain 2 */}
        <polygon points="10,80 35,55 70,80" fill="#374151" />
        {/* Pine trees mini silhouettes */}
        <polygon points="5,80 5,75 8,80" fill="#065f46" />
        <polygon points="12,80 12,74 15,80" fill="#065f46" />
      </svg>
    </div>
  </div>
);

const BookCover = ({ book, onClick }) => {
  return (
    <div
      onClick={onClick}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('bookId', book.id);
      }}
      className="relative cursor-pointer transition-all hover:translate-y-[-8px] hover:shadow-2xl flex-shrink-0 rounded-lg overflow-hidden shadow-md group"
      style={{
        width: '110px',
        height: '165px',
        backgroundColor: book.cover,
        border: '1px solid rgba(0,0,0,0.15)',
        boxShadow: '2px 4px 10px rgba(0,0,0,0.2)'
      }}
    >
      {/* Cover Image */}
      {book.coverImage ? (
        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        /* Minimalist text layout on solid cover background */
        <div className="w-full h-full p-2.5 flex flex-col justify-between text-white relative">
          {/* Subtle overlay for realism */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/15 pointer-events-none" />
          {/* Book Spine shadow overlay */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/35 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <h4 className="text-[8px] font-bold uppercase tracking-wider opacity-60 truncate">{book.genre || 'Genel'}</h4>
            <h3 className="text-[10px] font-extrabold line-clamp-3 mt-0.5 leading-tight" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
              {book.title}
            </h3>
          </div>
          
          <div className="relative z-10">
            <p className="text-[8px] opacity-80 font-medium truncate" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.6)' }}>
              {book.author}
            </p>
          </div>
        </div>
      )}

      {/* Badges/Progress indicator on cover */}
      {book.totalPages > 0 && book.currentPage > 0 && book.status === 'reading' && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
          <div
            className="h-full bg-green-500"
            style={{ width: `${Math.min((book.currentPage / book.totalPages) * 100, 100)}%` }}
          />
        </div>
      )}
      {book.borrowedTo && (
        <div className="absolute top-1.5 right-1.5 bg-yellow-500 text-black text-[8px] font-bold px-1 py-0.5 rounded shadow" title={`Ödünçte: ${book.borrowedTo}`}>
          🤝
        </div>
      )}
      {book.rating > 0 && (
        <div className="absolute top-1.5 left-2 bg-black/55 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Star size={8} fill="#FFD700" stroke="#FFD700" />
          <span>{book.rating}</span>
        </div>
      )}
    </div>
  );
};

const BookSpine = ({ book, onClick, is3D }) => {
  if (!is3D) {
    return (
      <div
        onClick={onClick}
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('bookId', book.id);
        }}
        className="relative cursor-pointer transition-all hover:translate-y-[-8px] hover:shadow-xl mr-1 mb-2 flex-shrink-0"
        style={{
          width: '60px',
          height: '280px',
          backgroundColor: book.cover,
          borderRadius: '0 4px 4px 0',
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2), 2px 2px 8px rgba(0,0,0,0.15)',
          border: '2px solid rgba(107, 68, 35, 0.3)',
          borderLeft: '6px solid rgba(107, 68, 35, 0.5)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ writingMode: 'vertical-rl' }}>
          <span className="text-xs font-semibold text-white px-2 text-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {book.title}
          </span>
        </div>
        {book.totalPages > 0 && book.currentPage > 0 && book.status === 'reading' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-green-500"
              style={{ width: `${Math.min((book.currentPage / book.totalPages) * 100, 100)}%` }}
            />
          </div>
        )}
        {book.borrowedTo && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-bold px-1 rounded-sm shadow" title={`Ödünçte: ${book.borrowedTo}`}>
            🤝
          </div>
        )}
        {book.rating > 0 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5">
            <Star size={10} fill="#FFD700" stroke="#FFD700" />
            <span className="text-[10px] text-white font-bold">{book.rating}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="book-scene flex-shrink-0"
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('bookId', book.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onClick}
    >
      <div className="book-object">
        <div
          className="book-face-spine shadow-lg"
          style={{
            backgroundColor: book.cover,
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2), -5px 0 10px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            <span className="text-sm font-bold text-white px-2 text-center tracking-wide" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
              {book.title}
            </span>
          </div>

          {book.totalPages > 0 && book.currentPage > 0 && book.status === 'reading' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1.5 h-16 bg-black/30 rounded-full overflow-hidden">
              <div
                className="w-full bg-green-400 absolute bottom-0"
                style={{ height: `${Math.min((book.currentPage / book.totalPages) * 100, 100)}%` }}
              />
            </div>
          )}

          {book.rating > 0 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-0.5">
              <Star size={12} fill="#FFD700" stroke="#FFD700" />
              <span className="text-[10px] text-white font-bold">{book.rating}</span>
            </div>
          )}

          {book.borrowedTo && (
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-bold px-1 rounded-sm shadow-md" title={`Ödünçte: ${book.borrowedTo}`}>
              🤝
            </div>
          )}
        </div>

        <div
          className="book-face-cover shadow-2xl flex flex-col p-6 text-white relative"
          style={{
            backgroundColor: book.cover,
            background: `linear-gradient(135deg, ${book.cover} 0%, #1a1a1a 150%)`,
          }}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-white/20 p-4 m-2 rounded-sm relative overflow-hidden group">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2 leading-tight drop-shadow-md">{book.title}</h3>
                <div className="w-8 h-0.5 bg-white/50 mb-2"></div>
                <p className="text-sm font-medium opacity-90">{book.author}</p>
                <span className="mt-4 text-[10px] uppercase tracking-widest px-2 py-1 bg-white/10 rounded">{book.genre}</span>
              </>
            )}
          </div>

          <div className="mt-auto flex justify-between items-end text-xs font-semibold opacity-80 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1">
              <Star size={14} fill="#FFD700" stroke="none" />
              <span>{book.rating > 0 ? book.rating : '-'} / 5</span>
            </div>
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

const ShoppingListSubView = ({ isDark, themeColors, shoppingList, setShoppingList, books, setBooks }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (title.trim()) {
      setShoppingList([...shoppingList, {
        id: Date.now(),
        title: title.trim(),
        author: author.trim() || 'Bilinmeyen Yazar',
        price: price.trim() ? Number(price) : ''
      }]);
      setTitle('');
      setAuthor('');
      setPrice('');
    }
  };

  const list = Array.isArray(shoppingList) ? shoppingList : [];
  const totalPotentialCost = list.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className="space-y-4 text-xs font-sans">
      <form onSubmit={handleAdd} className="space-y-2 mb-4 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-gray-400/10">
        <span className="text-[10px] font-bold uppercase opacity-65">Yeni İstek Ekle</span>
        <input
          type="text"
          placeholder="Kitap Adı..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full p-2 text-xs border rounded-lg bg-transparent border-gray-400/20 focus:border-[#7B3F3F] outline-none ${isDark ? 'text-white bg-[#2d2d2d]/30' : 'text-[#654321]'}`}
          required
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Yazar..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={`flex-1 p-2 text-xs border rounded-lg bg-transparent border-gray-400/20 focus:border-[#7B3F3F] outline-none ${isDark ? 'text-white' : 'text-[#654321]'}`}
          />
          <input
            type="number"
            placeholder="Fiyat (TL)..."
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`w-24 p-2 text-xs border rounded-lg bg-transparent border-gray-400/20 focus:border-[#7B3F3F] outline-none ${isDark ? 'text-white' : 'text-[#654321]'}`}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-[#7B3F3F] text-white hover:bg-[#5D3030] rounded-lg text-xs font-semibold transition-all shadow-sm"
        >
          Ekle
        </button>
      </form>

      {list.length > 0 && (
        <div className="flex justify-between items-center px-1 mb-2">
          <span className="text-[10px] font-bold uppercase opacity-65">Toplam Tutar:</span>
          <span className="text-sm font-extrabold text-green-600 dark:text-green-400">{totalPotentialCost.toFixed(2)} ₺</span>
        </div>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {list.map((item) => (
          <div
            key={item.id}
            className={`flex justify-between items-center p-3 rounded-xl border shadow-sm ${themeColors.widget} ${themeColors.border}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <input
                type="checkbox"
                className="w-4 h-4 rounded cursor-pointer border-2 accent-[#7B3F3F] flex-shrink-0"
                onChange={() => {
                  setBooks([...books, {
                    id: Date.now(),
                    title: item.title,
                    author: item.author,
                    genre: 'Roman',
                    cover: '#7B3F3F',
                    coverImage: '',
                    rating: 0,
                    status: 'want-to-read',
                    review: '',
                    highlights: [],
                    totalPages: '',
                    currentPage: 0,
                    price: item.price || ''
                  }]);
                  setShoppingList(shoppingList.filter(i => i.id !== item.id));
                  alert(`"${item.title}" başarıyla kütüphanenize (Okunacak) eklendi!`);
                }}
                title="Satın al ve kitaplığa ekle"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-xs truncate leading-snug">{item.title}</h4>
                <p className="text-[10px] opacity-75 truncate leading-none mt-0.5">{item.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-xs text-green-600 dark:text-green-400">{item.price ? `${item.price} ₺` : '-'}</span>
              <button
                onClick={() => setShoppingList(shoppingList.filter(i => i.id !== item.id))}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
                title="Sil"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-center py-6 italic text-[11px] opacity-60">Alışveriş listeniz boş. Yukarıdan yeni kitaplar ekleyebilirsiniz!</p>
        )}
      </div>
    </div>
  );
};

const LibraryView = ({
  view,
  books,
  setBooks,
  isDark,
  themeColors,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterGenre,
  setFilterGenre,
  sortBy,
  setSortBy,
  activeCollection,
  setActiveCollection,
  libraryFilter,
  setLibraryFilter,
  filteredBooks,
  is3DMode,
  setIs3DMode,
  libraryLayoutMode = 'cover',
  collections,
  setCollections,
  createCollection,
  onUpdateCollection,
  handleDragOver,
  handleDrop,
  getQuoteOfTheDay,
  setActiveQuoteIndex,
  openQuoteCreator,
  selectedBook,
  setSelectedBook,
  onOpenReader,
  getAIRecommendations,
  shoppingList,
  setShoppingList,
  onUpdateBook,
  onDeleteBook,
  storeEbookFile,
  deleteEbookFile,
  handleImageUpload
}) => {
  const statusLabels = {
    'all': 'Tüm Kitaplar',
    'want-to-read': 'Okunacaklar',
    'reading': 'Okunanlar',
    'read': 'Bitenler'
  };

  if (view === 'shopping') {
    return (
      <div className={`p-8 rounded-lg shadow-lg ${themeColors.card}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-3xl font-bold flex items-center gap-3 ${themeColors.text}`}>
            <ShoppingCart size={32} className="opacity-80" />
            Kitap Alışveriş Listesi
          </h2>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/10 text-orange-700'}`}>
            Tahmini Toplam: {shoppingList.reduce((sum, item) => sum + (Number(item.price) || 0), 0)} ₺
          </span>
        </div>

        {/* Add Item Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const title = e.target.title.value.trim();
            const author = e.target.author.value.trim();
            const price = e.target.price.value.trim();
            if (title && author) {
              setShoppingList([...shoppingList, { id: Date.now(), title, author, price }]);
              e.target.reset();
            }
          }}
          className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border mb-6 ${themeColors.border} bg-black/5`}
        >
          <input
            type="text"
            name="title"
            placeholder="Kitap Adı *"
            required
            className={`p-2 text-sm border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
          />
          <input
            type="text"
            name="author"
            placeholder="Yazar *"
            required
            className={`p-2 text-sm border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
          />
          <input
            type="number"
            name="price"
            placeholder="Fiyat (₺)"
            className={`p-2 text-sm border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#7B3F3F] text-white rounded font-bold hover:bg-[#5D3030] transition-colors text-sm"
          >
            Ekle
          </button>
        </form>

        {/* Items List */}
        <div className="space-y-3">
          {shoppingList.map(item => (
            <div
              key={item.id}
              className={`flex justify-between items-center p-4 rounded-xl border shadow-sm ${themeColors.widget} ${themeColors.border}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded cursor-pointer border-2 accent-[#7B3F3F]"
                  onChange={() => {
                    setBooks([...books, {
                      id: Date.now(),
                      title: item.title,
                      author: item.author,
                      genre: 'Roman',
                      cover: '#7B3F3F',
                      coverImage: '',
                      rating: 0,
                      status: 'want-to-read',
                      review: '',
                      highlights: [],
                      totalPages: '',
                      currentPage: 0,
                      price: item.price || ''
                    }]);
                    setShoppingList(shoppingList.filter(i => i.id !== item.id));
                  }}
                />
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs opacity-75">{item.author}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-green-600 dark:text-green-400">{item.price ? `${item.price} ₺` : '-'}</span>
                <button
                  onClick={() => setShoppingList(shoppingList.filter(i => i.id !== item.id))}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {shoppingList.length === 0 && (
            <p className="text-center py-6 italic text-sm opacity-60">Alışveriş listeniz boş. Yukarıdan yeni kitaplar ekleyebilirsiniz!</p>
          )}
        </div>
      </div>
    );
  }

  if (view === 'highlights') {
    return (
      <div className={`p-8 rounded-lg shadow-lg ${isDark ? 'bg-[#382E26]' : 'bg-[#D4B896]'}`}>
        <h2 className={`text-3xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>
          <Quote size={32} />
          Tüm Alıntılarım
        </h2>
        <div className="space-y-6">
          {books.filter(b => b.highlights && b.highlights.length > 0).map(book => (
            <div key={book.id} className={`border-b-2 pb-6 last:border-b-0 ${isDark ? 'border-[#4A3B2F]' : 'border-[#C8A882]'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>{book.title}</h3>
              <p className={`text-sm mb-3 ${isDark ? 'text-[#B89968]' : 'text-[#8B6F47]'}`}>{book.author}</p>
              <div className="space-y-3">
                {book.highlights.map((highlight, idx) => (
                  <div key={idx} className={`p-4 rounded border-l-4 border-[#7B3F3F] shadow-sm ${isDark ? 'bg-[#2D2620]' : 'bg-[#E8DCC8]'} group`}>
                    <div className="flex justify-between items-start gap-2">
                      <p className={`italic ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'} flex-1`}>"{highlight}"</p>
                      <button
                        onClick={() => openQuoteCreator(highlight, book)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded transition-all text-orange-500"
                        title="Kart Oluştur ve Paylaş"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {books.filter(b => b.highlights && b.highlights.length > 0).length === 0 && (
            <p className="text-center py-10 opacity-70 italic text-sm">Henüz alıntı yapmadınız.</p>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT view === 'library'
  const isFiltering = searchQuery !== '' || filterStatus !== 'all' || filterGenre !== 'all' || sortBy !== 'date-desc' || activeCollection !== null;

  return (
    <div>
      {/* Daily Quote Widget */}
      {(() => {
        const dailyQuoteInfo = getQuoteOfTheDay();
        if (!dailyQuoteInfo) return null;
        return (
          <div className={`mb-6 p-4 rounded-xl shadow-md border flex items-center gap-4 ${isDark ? 'bg-[#382E26] border-[#4A3B2F]' : 'bg-[#E8DCC8] border-[#C8A882]'}`}>
            <button
              onClick={() => setActiveQuoteIndex(prev => prev - 1)}
              className="p-1 px-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 transition-all text-xs font-bold"
              title="Önceki Alıntı"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-3xl text-orange-500 opacity-80 self-start sm:self-center font-serif leading-none flex-shrink-0">“</div>

            <div className="flex-1 min-w-0">
              <p className={`italic font-serif text-sm leading-relaxed ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>
                {dailyQuoteInfo.quote}
              </p>
              <p className="text-xs font-semibold mt-1 opacity-70 hover:underline cursor-pointer truncate" onClick={() => setSelectedBook(dailyQuoteInfo.book)}>
                — {dailyQuoteInfo.book?.title} ({dailyQuoteInfo.book?.author})
              </p>
            </div>

            <button
              onClick={() => openQuoteCreator(dailyQuoteInfo.quote, dailyQuoteInfo.book)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#7B3F3F] text-white hover:bg-[#5D3030] transition-colors whitespace-nowrap hidden sm:inline-block"
            >
              Paylaş
            </button>

            <button
              onClick={() => setActiveQuoteIndex(prev => prev + 1)}
              className="p-1 px-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 transition-all text-xs font-bold"
              title="Sonraki Alıntı"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        );
      })()}

      {isFiltering ? (
        // SEARCH RESULTS VIEW (SINGLE GRID/FLEX)
        <div className={is3DMode && window.innerWidth >= 768 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-[1000px]" : "flex flex-wrap gap-6 justify-center md:justify-start"}>
          {filteredBooks.length === 0 ? (
            <div className={`col-span-full text-center py-10 opacity-70 ${themeColors.text}`}>
              <p className="text-xl italic">Aramanızla eşleşen kitap bulunamadı.</p>
            </div>
          ) : (
            filteredBooks.map(book => {
              const is3DActive = is3DMode && window.innerWidth >= 768;
              if (is3DActive) {
                return (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onClick={() => setSelectedBook(book)}
                    is3D={true}
                  />
                );
              } else if (libraryLayoutMode === 'cover') {
                return (
                  <BookCover
                    key={book.id}
                    book={book}
                    onClick={() => setSelectedBook(book)}
                  />
                );
              } else {
                return (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onClick={() => setSelectedBook(book)}
                    is3D={false}
                  />
                );
              }
            })
          )}
        </div>
      ) : (
        // DEFAULT SHELF VIEW (GROUPED STACK OR UNIFIED CONTAINER)
        (libraryFilter === 'all'
          ? [{ id: 'all', title: 'Tüm Kitaplar', books: books }]
          : [{ id: libraryFilter, title: statusLabels[libraryFilter], books: books.filter(b => b.status === libraryFilter) }]
        ).map(group => {
          const shelfBooks = group.books;
          if (shelfBooks.length === 0) return null;
          const is3DActive = is3DMode && window.innerWidth >= 768;

          return (
            <div key={group.id} className="mb-12 animate-fade-in">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>{group.title}</h2>

              {/* The Cabinet/Shelf Container */}
              <div
                className={`transition-all duration-300 relative ${is3DActive ? 'p-8' : 'p-6 rounded-lg'}`}
                style={is3DActive ? {
                  backgroundColor: isDark ? '#1e140e' : '#f0e6d2',
                  backgroundImage: isDark
                    ? 'radial-gradient(circle at 50% 50%, #3a2e26 0%, #1a120b 90%)'
                    : 'radial-gradient(circle at 50% 50%, #e8dcc8 0%, #c8aa81 90%)',
                  boxShadow: isDark
                    ? 'inset 0 0 60px rgba(0,0,0,0.95), 0 20px 40px rgba(0,0,0,0.6)'
                    : 'inset 0 0 40px rgba(139,69,19,0.2), 0 10px 20px rgba(0,0,0,0.1)',
                  borderStyle: 'solid',
                  borderWidth: '16px',
                  borderTopColor: isDark ? '#3e2b20' : '#e6c8a0',
                  borderLeftColor: isDark ? '#322219' : '#deb887',
                  borderRightColor: isDark ? '#261a12' : '#d2b48c',
                  borderBottomColor: isDark ? '#1e140d' : '#c8aa81',
                  borderBottomWidth: '24px',
                  borderRadius: '4px',
                  minHeight: '340px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  overflow: 'hidden'
                } : {
                  background: isDark
                    ? 'linear-gradient(to bottom, #4A3B2F 0%, #382E26 100%)'
                    : 'linear-gradient(to bottom, #D4B896 0%, #C8A882 100%)',
                  boxShadow: isDark
                    ? 'inset 0 -4px 8px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)'
                    : 'inset 0 -4px 8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {is3DActive && (
                  <>
                    <div className="absolute inset-0 pointer-events-none" style={{
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                    }}></div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5))',
                        zIndex: 0
                      }}
                    ></div>
                  </>
                )}

                <div className={`flex flex-wrap items-end justify-start gap-3 w-full relative z-10 pl-4 pr-12 pb-1 overflow-x-auto min-h-[300px]`}>
                  {is3DActive && <MiniArtOrnament isDark={isDark} />}

                  {shelfBooks.map(book => {
                    if (is3DActive) {
                      return (
                        <BookSpine
                          key={book.id}
                          book={book}
                          onClick={() => setSelectedBook(book)}
                          is3D={true}
                        />
                      );
                    } else if (libraryLayoutMode === 'cover') {
                      return (
                        <BookCover
                          key={book.id}
                          book={book}
                          onClick={() => setSelectedBook(book)}
                        />
                      );
                    } else {
                      return (
                        <BookSpine
                          key={book.id}
                          book={book}
                          onClick={() => setSelectedBook(book)}
                          is3D={false}
                        />
                      );
                    }
                  })}

                  {shelfBooks.length >= 2 && <CoffeeOrnament />}
                  <PlantOrnament />
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* AI Kitap Önerileri */}
      {(() => {
        const recommendations = getAIRecommendations();
        if (recommendations.length === 0) return null;
        return (
          <div className={`mt-10 p-6 rounded-xl shadow-md border ${isDark ? 'bg-[#382E26] border-[#4A3B2F]' : 'bg-[#E8DCC8] border-[#C8A882]'}`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>
              <span>✨ Senin İçin AI Kitap Önerileri</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-lg flex flex-col justify-between border ${themeColors.widget} ${themeColors.border}`}>
                  <div>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{rec.genre}</span>
                    <h4 className="font-bold text-sm truncate mt-1">{rec.title}</h4>
                    <p className="text-xs opacity-75 truncate">{rec.author}</p>
                  </div>
                  <button
                    onClick={() => {
                      setBooks([...books, {
                        id: Date.now() + idx,
                        title: rec.title,
                        author: rec.author,
                        genre: rec.genre,
                        status: 'want-to-read',
                        cover: '#7B3F3F',
                        coverImage: '',
                        rating: 0,
                        review: '',
                        highlights: [],
                        totalPages: '',
                        currentPage: 0,
                        price: ''
                      }]);
                    }}
                    className="mt-3 py-1.5 bg-[#7B3F3F] text-white text-xs font-bold rounded hover:bg-[#5D3030] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>+ Kitaplığıma Ekle</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}


    </div>
  );
};

export default LibraryView;
export { ShoppingListSubView };
