import React, { useState } from 'react';
import { Rss, Search, Users, Trophy, RefreshCw, Menu, X } from 'lucide-react';

const SocialFeed = ({
  books,
  setBooks,
  userProfile,
  setUserProfile,
  streakData,
  isDark,
  themeColors,
  socialTab,
  setSocialTab,
  circleFeed,
  setCircleFeed,
  savedPosts,
  setSavedPosts,
  circleUsers,
  setCircleUsers,
  circleSwaps,
  setCircleSwaps,
  circleClubs,
  setCircleClubs,
  rtcStatus,
  rtcRole,
  rtcOffer,
  rtcAnswer,
  rtcName,
  setupPeerConnection,
  connectAsHost,
  connectAsGuest
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-0 text-sm overflow-hidden animate-fade-in pb-12 relative">
      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Left Sidebar inside Social View (Collapsible drawer on mobile) */}
      <div className={`
        fixed md:relative top-0 bottom-0 left-0 w-64 p-6 md:p-0
        flex flex-col gap-4 flex-shrink-0
        bg-[#E8DCC8] dark:bg-[#2D2620] md:bg-transparent dark:md:bg-transparent
        border-r md:border-none border-gray-400/20
        h-screen md:h-auto overflow-y-auto
        z-50 md:z-auto transition-transform duration-300
        ${isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        ${isMenuOpen ? 'flex' : 'hidden md:flex'}
      `}>
        {/* Mobile menu header */}
        <div className="md:hidden flex justify-between items-center pb-3 border-b border-gray-400/10 mb-2">
          <span className="font-bold text-xs opacity-75">Menü</span>
          <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Profile Summary Card */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white/80 border-black/10 shadow-sm'} space-y-3`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">👤</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-sm truncate">{userProfile.name}</h3>
              <p className="text-[9px] opacity-60 truncate">@{userProfile.username} • {userProfile.city}</p>
            </div>
            <button
              onClick={() => {
                const name = prompt('İsminiz:', userProfile.name);
                const bio = prompt('Bionuz:', userProfile.bio);
                const city = prompt('Şehriniz:', userProfile.city);
                if (name) {
                  setUserProfile({ ...userProfile, name, bio: bio || '', city: city || '' });
                }
              }}
              className="px-2 py-0.5 bg-[#7B3F3F] text-white rounded text-[8px] font-bold"
            >
              Düzenle
            </button>
          </div>
          <p className="text-[10px] opacity-85 leading-snug">{userProfile.bio}</p>
          <div className="grid grid-cols-3 gap-1.5 text-center bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-gray-400/5 text-[10px]">
            <div>
              <span className="font-bold block">{books.length}</span>
              <span className="text-[8px] opacity-50 uppercase">Kitap</span>
            </div>
            <div>
              <span className="font-bold block">{books.filter(b => b.status === 'read').reduce((sum, b) => sum + (Number(b.totalPages) || 0), 0)}</span>
              <span className="text-[8px] opacity-50 uppercase">Sayfa</span>
            </div>
            <div>
              <span className="font-bold block">{streakData.streak || 0} G</span>
              <span className="text-[8px] opacity-50 uppercase">Seri</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className={`p-2 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white/80 border-black/10 shadow-sm'} space-y-1`}>
          {[
            { id: 'feed', name: 'Aktivite Akışı', icon: Rss },
            { id: 'friends', name: 'Okur Arama & Takip', icon: Search },
            { id: 'clubs', name: 'Okuma Kulüpleri', icon: Users },
            { id: 'leaderboard', name: 'Haftalık Yarışma', icon: Trophy },
            { id: 'swap', name: 'Kitap Takas Pazarı', icon: RefreshCw }
          ].map(sub => {
            const IconComponent = sub.icon;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSocialTab(sub.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2.5 ${socialTab === sub.id ? 'bg-[#7B3F3F] text-white shadow-sm' : `hover:bg-black/5 dark:hover:bg-white/5 ${themeColors.text}`}`}
              >
                <IconComponent size={16} className="opacity-80" />
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel / Social View Content */}
      <div className="flex-grow overflow-y-auto pr-1 flex flex-col min-h-0">
        {/* Mobile Navigation Header for Social Feed */}
        <div className="md:hidden flex items-center justify-between p-3.5 rounded-2xl mb-4 border bg-black/5 dark:bg-white/5 border-gray-400/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 rounded-xl bg-[#7B3F3F] text-white shadow active:scale-95 transition-all flex items-center justify-center"
            >
              <Menu size={16} />
            </button>
            <span className="font-extrabold text-xs">
              {socialTab === 'feed' && 'Aktivite Akışı'}
              {socialTab === 'friends' && 'Okur Arama'}
              {socialTab === 'clubs' && 'Okuma Kulüpleri'}
              {socialTab === 'leaderboard' && 'Haftalık Yarışma'}
              {socialTab === 'swap' && 'Takas Pazarı'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs opacity-80">
            <span className="text-xl">{userProfile.avatar || '👤'}</span>
            <span className="font-extrabold truncate max-w-[90px]">{userProfile.name}</span>
          </div>
        </div>
        {(() => {
          switch (socialTab) {
            case 'feed':
              return (
                <div className="space-y-4 max-w-2xl animate-fade-in">
                  {/* Create Post Bar */}
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white/80 border-black/10 shadow-sm'} flex gap-3 items-center`}>
                    <span className="text-2xl">✍️</span>
                    <input
                      type="text"
                      placeholder="Ne okuyorsunuz, ne düşünüyorsun?..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          const text = e.target.value.trim();
                          setCircleFeed([{
                            id: Date.now(),
                            username: userProfile.username,
                            name: userProfile.name,
                            avatar: '📖',
                            type: 'thought',
                            text: text,
                            timestamp: 'Şimdi',
                            likes: 0,
                            liked: false,
                            comments: []
                          }, ...circleFeed]);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-xs"
                    />
                  </div>

                  {/* Feed Items */}
                  {circleFeed.map(post => (
                    <div key={post.id} className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white/80 border-black/10 shadow-sm'} space-y-3`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{post.avatar}</span>
                          <div>
                            <h4 className="font-bold text-xs">{post.name}</h4>
                            <p className="text-[10px] opacity-60">@{post.username} • {post.timestamp}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full font-bold">
                          {post.type === 'start' ? 'Başladı' : post.type === 'finish' ? 'Bitirdi' : post.type === 'quote' ? 'Alıntı' : 'Düşünce'}
                        </span>
                      </div>
                      
                      <p className="text-xs leading-relaxed">{post.text}</p>
                      
                      {post.type === 'quote' && post.quote && (
                        <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 italic font-serif text-xs">
                          “{post.quote}”
                        </div>
                      )}

                      {post.bookTitle && (
                        <div className="flex justify-between items-center text-[10px] bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-gray-400/5">
                          <div>
                            <span className="font-bold">{post.bookTitle}</span>
                            <span className="opacity-75"> - {post.bookAuthor}</span>
                          </div>
                          <button
                            onClick={() => {
                              const exists = books.some(b => b.title.toLowerCase() === post.bookTitle.toLowerCase());
                              if (exists) {
                                alert("Bu kitap zaten kütüphanenizde var!");
                              } else {
                                setBooks([...books, {
                                  id: Date.now(),
                                  title: post.bookTitle,
                                  author: post.bookAuthor,
                                  genre: 'Roman',
                                  cover: '#7B3F3F',
                                  rating: 0,
                                  status: 'want-to-read',
                                  review: '',
                                  highlights: [],
                                  totalPages: '',
                                  currentPage: 0
                                }]);
                                alert(`"${post.bookTitle}" Okunacak listenize eklendi!`);
                              }
                            }}
                            className="px-2.5 py-1 bg-[#7B3F3F] hover:bg-[#5D3030] text-white rounded font-bold text-[9px]"
                          >
                            + Okuyacağım
                          </button>
                        </div>
                      )}

                      <div className="flex gap-4 pt-2.5 border-t border-gray-400/10 text-xs">
                        <button
                          onClick={() => {
                            setCircleFeed(circleFeed.map(p => {
                              if (p.id === post.id) {
                                return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
                              }
                              return p;
                            }));
                          }}
                          className={`flex items-center gap-1 font-bold ${post.liked ? 'text-red-500' : 'opacity-70'}`}
                        >
                          ❤️ {post.likes}
                        </button>
                        <button
                          onClick={() => {
                            const txt = prompt('Yorumunuz:');
                            if (txt && txt.trim()) {
                              setCircleFeed(circleFeed.map(p => {
                                if (p.id === post.id) {
                                  return { ...p, comments: [...p.comments, { name: userProfile.name, text: txt.trim() }] };
                                }
                                return p;
                              }));
                            }
                          }}
                          className="flex items-center gap-1 opacity-70 font-bold hover:opacity-100"
                        >
                          💭 {post.comments.length} Yorum
                        </button>
                        
                        <button
                          onClick={() => {
                            if (savedPosts.some(s => s.id === post.id)) {
                              setSavedPosts(savedPosts.filter(s => s.id !== post.id));
                              alert("Gönderi kaydedilenlerden kaldırıldı.");
                            } else {
                              setSavedPosts([...savedPosts, post]);
                              alert("Gönderi kaydedildi!");
                            }
                          }}
                          className={`flex items-center gap-1 font-bold ml-auto ${savedPosts.some(s => s.id === post.id) ? 'text-blue-500' : 'opacity-70'}`}
                        >
                          🔖 {savedPosts.some(s => s.id === post.id) ? 'Kaydedildi' : 'Kaydet'}
                        </button>
                      </div>

                      {post.comments.length > 0 && (
                        <div className="pt-2 border-t border-gray-400/5 space-y-1.5 bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                          {post.comments.map((comment, cidx) => (
                            <div key={cidx} className="text-[10px] leading-relaxed">
                              <span className="font-bold">{comment.name}: </span>
                              <span className="opacity-90">{comment.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            case 'friends':
              return (
                <div className="space-y-4 max-w-2xl animate-fade-in">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white border-zinc-200 shadow-sm'} space-y-3`}>
                    <span className="text-[10px] font-bold uppercase opacity-65">Okur Bul & Takip Et</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Okur ara (@username)..."
                        onChange={(e) => {
                          const query = e.target.value.toLowerCase().replace('@', '');
                          const cards = document.querySelectorAll('.friend-card-desk');
                          cards.forEach(c => {
                            const uname = c.getAttribute('data-username');
                            if (uname.includes(query)) {
                              c.classList.remove('hidden');
                            } else {
                              c.classList.add('hidden');
                            }
                          });
                        }}
                        className="flex-1 p-2 text-xs border rounded-lg bg-transparent border-gray-400/25 outline-none"
                      />
                      <button
                        onClick={() => {
                          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://bookcircle.com/profile/${userProfile.username}`;
                          window.open(qrUrl, '_blank');
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px]"
                      >
                        Profil QR Kodumu Göster
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {circleUsers.map(user => (
                        <div
                          key={user.username}
                          data-username={user.username}
                          className="friend-card-desk flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-gray-400/5 transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl">{user.avatar}</span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs truncate leading-snug">{user.name}</h4>
                              <p className="text-[9px] opacity-65 truncate leading-none">@{user.username} • {user.city}</p>
                              <p className="text-[8px] opacity-50 mt-1">{user.mutualCount} ortak kitap</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setCircleUsers(circleUsers.map(u => {
                                  if (u.username === user.username) {
                                    return { ...u, followed: !u.followed };
                                  }
                                  return u;
                                }));
                            }}
                            className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all ${user.followed ? 'bg-zinc-300 text-black' : 'bg-[#7B3F3F] text-white hover:bg-[#5D3030]'}`}
                          >
                            {user.followed ? 'Takiptesin ✓' : 'Takip Et'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            case 'clubs':
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl animate-fade-in">
                  {/* WebRTC Canlı Okuma Odası Paneli */}
                  <div className="col-span-1 md:col-span-2 p-5 rounded-2xl border border-dashed border-[#7B3F3F]/40 bg-[#7B3F3F]/5 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                          <span>👥</span> Canlı Ortak Okuma Odası (WebRTC P2P)
                        </h3>
                        <p className="text-[10px] opacity-75 mt-0.5">Arkadaşınızla doğrudan tarayıcıdan tarayıcıya (P2P) canlı kitap okuyun, sohbet edin ve sayfaları senkronize edin.</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        rtcStatus === 'connected' ? 'bg-green-600 text-white animate-pulse' :
                        rtcStatus === 'connecting' ? 'bg-amber-600 text-white animate-pulse' :
                        'bg-zinc-400 text-white'
                      }`}>
                        {rtcStatus === 'connected' ? `Bağlı: ${rtcName}` : rtcStatus === 'connecting' ? 'Bağlanıyor...' : 'Bağlı Değil'}
                      </span>
                    </div>

                    {rtcStatus === 'disconnected' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                        {/* Host Panel */}
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/60 border-white/10' : 'bg-white/60 border-black/10 shadow-sm'} space-y-3`}>
                          <h4 className="font-bold text-xs flex items-center gap-1">🔑 Oda Kurucu (Host) Ol</h4>
                          <p className="text-[10px] opacity-70">Davet kodu oluşturup arkadaşınıza gönderin.</p>
                          <button
                            onClick={() => setupPeerConnection('host')}
                            className="w-full py-2 bg-[#7B3F3F] text-white rounded-lg font-bold text-[10px] hover:bg-[#5D3030] transition-colors"
                          >
                            Davet Kodu Oluştur
                          </button>

                          {rtcRole === 'host' && rtcOffer && (
                            <div className="space-y-2 mt-2">
                              <label className="block text-[9px] font-bold opacity-80">1. Bu Kodu Kopyala & Arkadaşına Yolla:</label>
                              <textarea
                                readOnly
                                value={rtcOffer}
                                className={`w-full p-2 border rounded font-mono text-[8px] h-16 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(rtcOffer);
                                  alert("Davet kodu kopyalandı!");
                                }}
                                className="w-full py-1 bg-zinc-700 text-white rounded text-[8px] font-bold hover:bg-zinc-600"
                              >
                                Kopyala
                              </button>

                              <label className="block text-[9px] font-bold opacity-80 mt-2">2. Arkadaşının Cevap Kodunu Buraya Yapıştır:</label>
                              <textarea
                                placeholder="Cevap kodunu yapıştırın..."
                                onChange={(e) => connectAsHost(e.target.value.trim())}
                                className={`w-full p-2 border rounded font-mono text-[8px] h-16 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}
                              />
                            </div>
                          )}
                        </div>

                        {/* Guest Panel */}
                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/60 border-white/10' : 'bg-white/60 border-black/10 shadow-sm'} space-y-3`}>
                          <h4 className="font-bold text-xs flex items-center gap-1">🤝 Bir Odaya Katıl (Guest)</h4>
                          <p className="text-[10px] opacity-70">Arkadaşınızdan aldığınız davet kodunu yapıştırıp cevap verin.</p>
                          <textarea
                            placeholder="Davet kodunu yapıştırın..."
                            onChange={(e) => {
                              const code = e.target.value.trim();
                              if (code) connectAsGuest(code);
                            }}
                            className={`w-full p-2 border rounded font-mono text-[8px] h-16 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}
                          />

                          {rtcRole === 'guest' && rtcAnswer && (
                            <div className="space-y-2 mt-2">
                              <label className="block text-[9px] font-bold opacity-80">Şimdi Bu Cevap Kodunu Kopyala & Kurucuya Yolla:</label>
                              <textarea
                                readOnly
                                value={rtcAnswer}
                                className={`w-full p-2 border rounded font-mono text-[8px] h-16 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(rtcAnswer);
                                  alert("Cevap kodu kopyalandı!");
                                }}
                                className="w-full py-1 bg-zinc-700 text-white rounded text-[8px] font-bold hover:bg-zinc-600"
                              >
                                Kopyala
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {rtcStatus === 'connected' && (
                      <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 ${isDark ? 'bg-green-950/20 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                        <span className="text-xl">🟢</span>
                        <p className="font-bold text-center">Tebrikler! @{rtcName} ile Canlı Ortak Okuma Odası Aktif.</p>
                        <p className="text-[10px] opacity-75 text-center">Artık kütüphanenizden bir e-kitap (PDF veya EPUB) açarak okuyabilirsiniz. Sayfa çevirmeleriniz ve alıntılarınız arkadaşınızın ekranında canlı senkronize olacaktır.</p>
                        <button
                          onClick={() => {
                            if (rtcPeer) rtcPeer.close();
                            setupPeerConnection(null);
                          }}
                          className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[9px] transition-colors"
                        >
                          Bağlantıyı Kes
                        </button>
                      </div>
                    )}
                  </div>

                  {circleClubs.map(club => (
                    <div key={club.id} className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white border-zinc-200 shadow-sm'} flex flex-col justify-between space-y-3`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest">{club.category}</span>
                            <h3 className="font-extrabold text-sm mt-0.5">{club.name}</h3>
                          </div>
                          <button
                            onClick={() => {
                              setCircleClubs(circleClubs.map(c => {
                                if (c.id === club.id) {
                                  return { ...c, joined: !c.joined, membersCount: c.joined ? c.membersCount - 1 : c.membersCount + 1 };
                                }
                                return c;
                              }));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${club.joined ? 'bg-green-600 text-white' : 'bg-[#7B3F3F] text-white'}`}
                          >
                            {club.joined ? 'Üyesiniz ✓' : 'Katıl'}
                          </button>
                        </div>
                        <p className="text-[10px] opacity-75 mt-1">{club.desc}</p>
                        <p className="text-[9px] opacity-60 mt-1">👥 {club.membersCount} Üye • {club.type}</p>
                      </div>

                      {club.joined && (
                        <div className="pt-3 border-t border-gray-400/5 space-y-3">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold uppercase opacity-65">Ayın Kitabı Oylaması</span>
                            {club.voting.bookOptions.map(opt => {
                              const totalVotes = club.voting.bookOptions.reduce((s, o) => s + o.votes, 0);
                              const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => {
                                    if (club.voting.votedOption) return;
                                    setCircleClubs(circleClubs.map(c => {
                                      if (c.id === club.id) {
                                        return {
                                          ...c,
                                          voting: {
                                            votedOption: opt.id,
                                            bookOptions: c.voting.bookOptions.map(o => o.id === opt.id ? { ...o, votes: o.votes + 1 } : o)
                                          }
                                        };
                                      }
                                      return c;
                                    }));
                                  }}
                                  className={`p-2 rounded-lg border text-[9px] cursor-pointer relative overflow-hidden transition-all hover:border-orange-500/50 ${club.voting.votedOption === opt.id ? 'border-orange-500 bg-orange-500/5' : 'border-gray-400/10'}`}
                                >
                                  <div className="absolute top-0 bottom-0 left-0 bg-orange-500/10 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                  <div className="relative flex justify-between font-bold">
                                    <span>{opt.title}</span>
                                    <span>{percent}% ({opt.votes} oy)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="flex justify-between items-center text-[9px] bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                            <span className="opacity-75">📅 {club.schedule}</span>
                            <a href={club.zoomLink} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
                              Canlı Toplantı Odanız 📹
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            case 'leaderboard':
              return (
                <div className="space-y-4 max-w-2xl animate-fade-in">
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white border-zinc-200 shadow-sm'} space-y-3`}>
                    <h3 className="font-bold text-sm">Haftalık Okuma Liderlik Tablosu</h3>
                    <p className="text-[10px] opacity-75">Arkadaşınızla bu hafta okuduğunuz sayfa yarışı:</p>
                    
                    <div className="space-y-2">
                      {[
                        { name: 'Zeynep Kaya', avatar: '👩‍🦰', pages: 850, badge: '🏆 1. Sırada' },
                        { name: userProfile.name, avatar: '👤', pages: books.filter(b => b.status === 'read').reduce((sum, b) => sum + (Number(b.totalPages) || 0), 0) + 120, badge: '🥈 2. Sırada' },
                        { name: 'Ali Yılmaz', avatar: '👨‍🦱', pages: 340, badge: '🥉 3. Sırada' },
                        { name: 'Ayşe Çelik', avatar: '👩‍⚕️', pages: 180, badge: '' }
                      ].sort((a, b) => b.pages - a.pages).map((user, idx) => (
                        <div key={idx} className={`flex justify-between items-center p-3 rounded-lg ${user.name === userProfile.name ? 'bg-orange-500/10 border border-orange-500/35 font-extrabold' : 'bg-black/5 dark:bg-white/5 border border-gray-400/5'}`}>
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-xs w-5">{idx + 1}</span>
                            <span className="text-2xl">{user.avatar}</span>
                            <span className="text-xs">{user.name}</span>
                            {user.badge && <span className="text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">{user.badge}</span>}
                          </div>
                          <span className="font-bold text-xs">{user.pages} sayfa</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            case 'swap':
              return (
                <div className="space-y-4 max-w-4xl animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Offer card */}
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white border-zinc-200 shadow-sm'} space-y-3`}>
                      <span className="text-[10px] font-bold uppercase opacity-65">Kitap Takasına Kitap Ekle</span>
                      <p className="text-[10px] opacity-75">Kendi kütüphanenizdeki kitapları fiziksel takasa sunabilirsiniz.</p>
                      <select
                        onChange={(e) => {
                          const bid = e.target.value;
                          if (!bid) return;
                          const book = books.find(b => b.id.toString() === bid);
                          if (book) {
                            setCircleSwaps([...circleSwaps, {
                              id: 'swap-' + Date.now(),
                              title: book.title,
                              author: book.author,
                              owner: userProfile.username,
                              avatar: '👤',
                              distance: '0.0 km (Sen)',
                              rating: '5.0',
                              status: 'available'
                            }]);
                            alert(`"${book.title}" takas listenize eklendi!`);
                          }
                          e.target.value = '';
                        }}
                        className={`w-full p-2 text-xs border rounded-lg bg-transparent border-gray-400/20 focus:border-[#7B3F3F] outline-none ${isDark ? 'bg-[#2d2d2d] text-white' : 'bg-white text-[#654321]'}`}
                      >
                        <option value="">Takas için bir kitap seçin...</option>
                        {books.map(b => (
                          <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                        ))}
                      </select>
                    </div>

                    {/* Swap Items */}
                    <div className="md:col-span-2 space-y-3">
                      {circleSwaps.map(item => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border flex justify-between items-center ${isDark ? 'bg-[#1e1e1e]/90 border-white/10' : 'bg-white border-zinc-200 shadow-sm'}`}
                        >
                          <div>
                            <h4 className="font-bold text-xs">{item.title}</h4>
                            <p className="text-[10px] opacity-75">{item.author}</p>
                            <div className="flex items-center gap-2 mt-2 text-[9px] opacity-60">
                              <span>👤 @{item.owner}</span>
                              <span>•</span>
                              <span>📍 {item.distance}</span>
                              <span>•</span>
                              <span>⭐ {item.rating} Güven Puanı</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (item.status === 'requested') return;
                              if (item.owner === userProfile.username) {
                                setCircleSwaps(circleSwaps.filter(s => s.id !== item.id));
                                alert("Takas ilanı kaldırıldı.");
                              } else {
                                setCircleSwaps(circleSwaps.map(s => s.id === item.id ? { ...s, status: 'requested' } : s));
                                alert(`Takas talebi @${item.owner} kullanıcısına iletildi!`);
                              }
                            }}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${item.status === 'requested' ? 'bg-zinc-400 text-white cursor-not-allowed' : 'bg-[#7B3F3F] text-white hover:bg-[#5D3030]'}`}
                          >
                            {item.status === 'requested' ? 'Talep Edildi' : item.owner === userProfile.username ? 'İlanı Kaldır' : 'Ödünç İste'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

export default SocialFeed;
