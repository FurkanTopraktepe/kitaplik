import React, { useState, useEffect, useRef } from 'react';
import {
  Book, BookOpen, Clock, Users, Quote, TrendingUp, Award, Plus, Edit2, Trash2,
  ShoppingCart, Share2, Smartphone, Settings, Flame, Search, LayoutGrid,
  Box, Upload, X, Bell, Download, Type, CheckCircle, ChevronLeft, ChevronRight, Monitor, Sparkles, RefreshCw, AlignJustify
} from 'lucide-react';

import EBookReader from './components/EBookReader';
import KidsDashboard from './components/KidsDashboard';
import StatsView from './components/StatsView';
import SocialFeed from './components/SocialFeed';
import LibraryView, { ShoppingListSubView } from './components/LibraryView';
import BookDetail from './components/BookDetail';
import { getEbookFile, storeEbookFile, deleteEbookFile } from './db';

const App = () => {
  // WebRTC P2P Okuma Odası States
  const [rtcPeer, setRtcPeer] = useState(null);
  const [rtcChannel, setRtcChannel] = useState(null);
  const [rtcStatus, setRtcStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const [rtcRole, setRtcRole] = useState(null); // 'host', 'guest'
  const [rtcOffer, setRtcOffer] = useState('');
  const [rtcAnswer, setRtcAnswer] = useState('');
  const [rtcName, setRtcName] = useState('');
  const [rtcChatHistory, setRtcChatHistory] = useState([]);

  const handleRtcMessage = (msg) => {
    if (msg.type === 'HANDSHAKE') {
      setRtcName(msg.name);
      alert(`Bağlantı Başarılı! ${msg.name} ile canlı okuma odası kuruldu.`);
    } else if (msg.type === 'CHAT') {
      setRtcChatHistory(prev => [...prev, {
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } else if (msg.type === 'PAGE_CHANGE') {
      window.dispatchEvent(new CustomEvent('rtcPageChange', { detail: msg.page }));
    }
  };

  const setupDataChannel = (dc) => {
    dc.onopen = () => {
      setRtcStatus('connected');
      const storedProfile = localStorage.getItem('bookshelf_userProfile');
      const profileName = storedProfile ? JSON.parse(storedProfile).name : 'Bir Okur';
      dc.send(JSON.stringify({ type: 'HANDSHAKE', name: profileName }));
    };
    dc.onclose = () => {
      setRtcStatus('disconnected');
      setRtcChannel(null);
      setRtcPeer(null);
    };
    dc.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleRtcMessage(msg);
      } catch (e) {
        console.error("RTC Message Parsing Error:", e);
      }
    };
  };

  const setupPeerConnection = (role) => {
    if (!role) {
      if (rtcPeer) rtcPeer.close();
      setRtcStatus('disconnected');
      setRtcRole(null);
      setRtcChannel(null);
      setRtcPeer(null);
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19002' }]
    });

    setRtcPeer(pc);
    setRtcStatus('connecting');
    setRtcRole(role);

    if (role === 'host') {
      const dc = pc.createDataChannel("chat");
      setupDataChannel(dc);
      setRtcChannel(dc);

      pc.createOffer().then(offer => pc.setLocalDescription(offer));

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          setRtcOffer(btoa(JSON.stringify(pc.localDescription)));
        }
      };
    } else {
      pc.ondatachannel = (event) => {
        const dc = event.channel;
        setupDataChannel(dc);
        setRtcChannel(dc);
      };
    }
  };

  const connectAsHost = (answerBase64) => {
    if (!rtcPeer) return;
    try {
      const answer = JSON.parse(atob(answerBase64));
      rtcPeer.setRemoteDescription(new RTCSessionDescription(answer)).catch(err => {
        console.error("setRemoteDescription error:", err);
        alert("Bağlantı kodu eşleşmedi veya süresi doldu!");
      });
    } catch (err) {
      alert("Geçersiz bağlantı kodu formatı!");
    }
  };

  const connectAsGuest = (offerBase64) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19002' }]
    });
    setRtcPeer(pc);
    setRtcStatus('connecting');
    setRtcRole('guest');

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      setupDataChannel(dc);
      setRtcChannel(dc);
    };

    try {
      const offer = JSON.parse(atob(offerBase64));
      pc.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
        return pc.createAnswer();
      }).then(answer => {
        return pc.setLocalDescription(answer);
      }).catch(err => {
        console.error("Guest WebRTC setup error:", err);
        alert("Odaya bağlanırken hata oluştu. Kodları kontrol edin.");
      });

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          setRtcAnswer(btoa(JSON.stringify(pc.localDescription)));
        }
      };
    } catch (err) {
      alert("Geçersiz bağlantı kodu formatı!");
    }
  };

  const onSendRtcMessage = (text) => {
    if (rtcChannel && rtcStatus === 'connected') {
      const msg = {
        type: 'CHAT',
        sender: userProfile.name,
        text: text
      };
      rtcChannel.send(JSON.stringify(msg));
      setRtcChatHistory(prev => [...prev, {
        sender: userProfile.name,
        text: text,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const [view, setView] = useState('library');
  const [layoutMode, setLayoutMode] = useState(() => {
    const saved = localStorage.getItem('bookshelf_layoutPreference');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  });

  const changeLayoutMode = (mode) => {
    if (mode === 'auto') {
      localStorage.removeItem('bookshelf_layoutPreference');
      setLayoutMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
    } else {
      localStorage.setItem('bookshelf_layoutPreference', mode);
      setLayoutMode(mode);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const savedPref = localStorage.getItem('bookshelf_layoutPreference');
      if (!savedPref) {
        setLayoutMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [mobileTab, setMobileTab] = useState('now-reading'); // 'now-reading', 'library', 'social', 'stats', 'settings'
  const [mobileLibSubTab, setMobileLibSubTab] = useState('shelf'); // 'shelf', 'wishlist'
  const [mobileStatsSubTab, setMobileStatsSubTab] = useState('charts'); // 'charts', 'goals'
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  // Theme State (oak, walnut, white, dark, midnight, forest, paper)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('bookshelf_theme');
    return saved ? JSON.parse(saved) : 'oak';
  });

  const isDark = theme === 'dark' || theme === 'midnight' || theme === 'forest' || theme === 'walnut';

  // Font State (sans, serif, mono)
  const [font, setFont] = useState(() => {
    const saved = localStorage.getItem('bookshelf_font');
    return saved ? JSON.parse(saved) : 'sans';
  });

  // Kids Mode States
  const [isKidsMode, setIsKidsMode] = useState(() => localStorage.getItem('bookshelf_isKidsMode') === 'true');
  const [kidsTheme, setKidsTheme] = useState(() => localStorage.getItem('bookshelf_kidsTheme') || 'mint'); // 'mint', 'lavender', 'peach'
  const [kidsTarget, setKidsTarget] = useState(() => Number(localStorage.getItem('bookshelf_kidsTarget') || '15'));
  const [kidsXp, setKidsXp] = useState(() => Number(localStorage.getItem('bookshelf_kidsXp') || '0'));
  const [kidsPetType, setKidsPetType] = useState(() => localStorage.getItem('bookshelf_kidsPetType') || 'cactus');

  // Dynamic Styles based on Theme
  const getThemeColors = () => {
    if (isKidsMode) {
      switch (kidsTheme) {
        case 'lavender':
          return {
            bg: 'bg-[#F3E5F5]',
            text: 'text-[#4A148C]',
            accent: 'text-[#9C27B0]',
            card: 'bg-[#E1BEE7]',
            border: 'border-[#CE93D8]',
            sidebar: 'bg-[#CE93D8]/80',
            button: 'bg-[#9C27B0] hover:bg-[#7B1FA2] text-white rounded-2xl',
            widget: 'bg-[#E1BEE7] border border-[#CE93D8] shadow-sm rounded-2xl'
          };
        case 'peach':
          return {
            bg: 'bg-[#FFF3E0]',
            text: 'text-[#8D3A00]',
            accent: 'text-[#E65100]',
            card: 'bg-[#FFE0B2]',
            border: 'border-[#FFCC80]',
            sidebar: 'bg-[#FFCC80]/80',
            button: 'bg-[#E65100] hover:bg-[#EF6C00] text-white rounded-2xl',
            widget: 'bg-[#FFE0B2] border border-[#FFCC80] shadow-sm rounded-2xl'
          };
        case 'mint': default:
          return {
            bg: 'bg-[#E8F5E9]',
            text: 'text-[#1B5E20]',
            accent: 'text-[#2E7D32]',
            card: 'bg-[#C8E6C9]',
            border: 'border-[#A5D6A7]',
            sidebar: 'bg-[#A5D6A7]/80',
            button: 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-2xl',
            widget: 'bg-[#C8E6C9] border border-[#A5D6A7] shadow-sm rounded-2xl'
          };
      }
    }

    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-[#121212]',
          text: 'text-[#E5E5E5]',
          accent: 'text-[#BB86FC]',
          card: 'bg-[#1E1E1E]',
          border: 'border-[#333333]',
          sidebar: 'bg-[#1A1A1A]',
          button: 'bg-[#332940] hover:bg-[#453756] text-[#BB86FC]',
          widget: 'bg-[#252525] border border-[#333333]'
        };
      case 'midnight':
        return {
          bg: 'bg-[#0F172A]',
          text: 'text-[#F1F5F9]',
          accent: 'text-[#38BDF8]',
          card: 'bg-[#1E293B]',
          border: 'border-[#334155]',
          sidebar: 'bg-[#020617]',
          button: 'bg-[#0369A1] hover:bg-[#075985] text-white',
          widget: 'bg-[#1E293B] border border-[#38BDF8]/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]'
        };
      case 'forest':
        return {
          bg: 'bg-[#064E3B]',
          text: 'text-[#ECFDF5]',
          accent: 'text-[#34D399]',
          card: 'bg-[#065F46]',
          border: 'border-[#064E3B]',
          sidebar: 'bg-[#022C22]',
          button: 'bg-[#059669] hover:bg-[#047857] text-white',
          widget: 'bg-[#065F46] border border-[#34D399]/30 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
        };
      case 'paper':
        return {
          bg: 'bg-[#FDF6E3]',
          text: 'text-[#657B83]',
          accent: 'text-[#268BD2]',
          card: 'bg-[#EEE8D5]',
          border: 'border-[#D3CBB1]',
          sidebar: 'bg-[#F5EAD2]',
          button: 'bg-[#93A1A1] hover:bg-[#586E75] text-white',
          widget: 'bg-[#EEE8D5] border border-[#D3CBB1]'
        };
      case 'walnut':
        return {
          bg: 'bg-[#2B1B17]',
          text: 'text-[#D7CCC8]',
          accent: 'text-[#8D6E63]',
          card: 'bg-[#3E2723]',
          border: 'border-[#4E342E]',
          sidebar: 'bg-[#1B110E]',
          button: 'bg-[#5D4037] hover:bg-[#4E342E] text-white',
          widget: 'bg-[#3E2723] border border-[#5D4037] shadow-lg'
        };
      case 'white':
        return {
          bg: 'bg-[#F8FAFC]',
          text: 'text-[#0F172A]',
          accent: 'text-[#64748B]',
          card: 'bg-[#FFFFFF]',
          border: 'border-[#E2E8F0]',
          sidebar: 'bg-[#F1F5F9]',
          button: 'bg-[#CBD5E1] hover:bg-[#94A3B8] text-[#1E293B]',
          widget: 'bg-white border border-[#E2E8F0] shadow-sm'
        };
      case 'oak': default:
        return {
          bg: 'bg-[#FEF9EF]',
          text: 'text-[#5C4033]',
          accent: 'text-[#BC6C25]',
          card: 'bg-[#F5E6CC]',
          border: 'border-[#DDB892]',
          sidebar: 'bg-[#E6CCB2]',
          button: 'bg-[#B08968] hover:bg-[#7F5539] text-white',
          widget: 'bg-[#F5E6CC] border border-[#DDB892] shadow-md'
        };
    }
  };

  const themeColors = getThemeColors();

  const fontClasses = {
    'sans': 'font-sans',
    'serif': 'font-serif',
    'mono': 'font-mono'
  };

  useEffect(() => {
    localStorage.setItem('bookshelf_theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('bookshelf_font', JSON.stringify(font));
  }, [font]);

  // Initialize 3D Mode
  const [is3DMode, setIs3DMode] = useState(() => {
    const savedMode = localStorage.getItem('bookshelf_is3DMode');
    return savedMode ? JSON.parse(savedMode) : false; // Default to 2D for cleaner initial load
  });

  const [libraryLayoutMode, setLibraryLayoutMode] = useState(() => {
    return localStorage.getItem('bookshelf_libraryLayoutMode') || 'cover'; // Default to Cover View (Apple Books style)
  });

  const [shelfOrnaments, setShelfOrnaments] = useState(() => {
    const saved = localStorage.getItem('bookshelf_shelfOrnaments');
    return saved ? JSON.parse(saved) : {
      'all': { left: 'plant', right: 'coffee' },
      'want-to-read': { left: 'plant', right: 'none' },
      'reading': { left: 'none', right: 'coffee' },
      'read': { left: 'trophy', right: 'plant' }
    };
  });

  const genres = ['Roman', 'Bilim Kurgu', 'Dünya Klasikleri', 'Kişisel Gelişim', 'Tarih', 'Felsefe', 'Diğer'];

  // Initialize Reading Goals & Streak
  const [readingGoal, setReadingGoal] = useState(() => {
    const saved = localStorage.getItem('bookshelf_readingGoal');
    return saved ? JSON.parse(saved) : 30;
  });

  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const saved = localStorage.getItem('bookshelf_weeklyGoal');
    return saved ? JSON.parse(saved) : 150;
  });

  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const saved = localStorage.getItem('bookshelf_monthlyGoal');
    return saved ? JSON.parse(saved) : 600;
  });

  const [annualGoal, setAnnualGoal] = useState(() => {
    const saved = localStorage.getItem('bookshelf_annualGoal');
    return saved ? JSON.parse(saved) : 20;
  });

  const [challengeName, setChallengeName] = useState(() => {
    const saved = localStorage.getItem('bookshelf_challengeName');
    return saved ? JSON.parse(saved) : `${new Date().getFullYear()} Okuma Hedefi`;
  });

  const [streakData, setStreakData] = useState(() => {
    const saved = localStorage.getItem('bookshelf_streakData');
    const today = new Date().toISOString().split('T')[0];
    const defaultData = { streak: 0, longestStreak: 0, lastReadDate: '', dailyProgress: { date: today, minutes: 0 } };

    if (!saved) return defaultData;

    const data = JSON.parse(saved);
    if (!data.longestStreak) data.longestStreak = data.streak;

    if (data.dailyProgress.date !== today) {
      const lastRead = new Date(data.lastReadDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (data.lastReadDate && data.lastReadDate !== today && data.lastReadDate !== yesterday.toISOString().split('T')[0]) {
        data.streak = 0;
      }
      data.dailyProgress = { date: today, minutes: 0 };
    }

    return data;
  });

  // Collections State
  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('bookshelf_collections');
    return saved ? JSON.parse(saved) : [
      { id: 'favs', name: 'Favorilerim', bookIds: [] },
      { id: 'tobuy', name: 'Alınacaklar', bookIds: [] }
    ];
  });

  const [activeCollection, setActiveCollection] = useState(null);

  useEffect(() => {
    localStorage.setItem('bookshelf_collections', JSON.stringify(collections));
  }, [collections]);

  const createCollection = (name) => {
    if (name) {
      setCollections([...collections, { id: 'col-' + Date.now().toString(), name, bookIds: [] }]);
    }
  };

  const handleDragStart = (e, bookId) => {
    e.dataTransfer.setData('bookId', bookId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, collectionId) => {
    e.preventDefault();
    const bookId = e.dataTransfer.getData('bookId');
    if (!bookId) return;

    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        if (col.bookIds.includes(Number(bookId))) return col;
        if (col.bookIds.includes(String(bookId))) return col;
        return { ...col, bookIds: [...col.bookIds, Number(bookId)] };
      }
      return col;
    }));
  };

  const deleteCollection = (id, e) => {
    e.stopPropagation();
    if (confirm('Koleksiyonu silmek istediğine emin misin?')) {
      setCollections(collections.filter(c => c.id !== id));
      if (activeCollection === id) setActiveCollection(null);
    }
  };

  const toggleBookInCollection = (collectionId, bookId) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        const exists = col.bookIds.includes(bookId);
        if (exists) {
          return { ...col, bookIds: col.bookIds.filter(id => id !== bookId) };
        } else {
          return { ...col, bookIds: [...col.bookIds, bookId] };
        }
      }
      return col;
    }));
  };

  // BookCircle State
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('bookshelf_userProfile');
    return saved ? JSON.parse(saved) : {
      username: 'furkan_okur',
      name: 'Furkan',
      bio: 'Kitapları, kahveyi ve derin felsefi sohbetleri severim. 📚☕',
      city: 'İstanbul',
      targetCount: 30,
      showTarget: true,
      profileVisibility: 'public',
      showStats: true,
      favoriteQuotes: [
        'Kitapsız yaşamak; kör, sağır, dilsiz yaşamaktır.'
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  const [circleUsers, setCircleUsers] = useState(() => {
    const saved = localStorage.getItem('bookshelf_circleUsers');
    return saved ? JSON.parse(saved) : [
      { username: 'ali_okur', name: 'Ali Yılmaz', avatar: '👨‍🦱', bio: 'Tarih ve bilim kurgu meraklısı.', city: 'İstanbul', booksCount: 42, pagesCount: 12400, streak: 12, followed: true, badges: ['🏆', '🔥'], mutualCount: 4 },
      { username: 'zeynep_klasik', name: 'Zeynep Kaya', avatar: '👩‍🦰', bio: 'Klasik edebiyat aşığı. Her gün okurum.', city: 'Ankara', booksCount: 85, pagesCount: 26000, streak: 45, followed: true, badges: ['👑', '🛡️', '🌍'], mutualCount: 6 },
      { username: 'mehmet_bilim', name: 'Mehmet Demir', avatar: '👨‍🚀', bio: 'Bilim kurgu ve popüler bilim.', city: 'İstanbul', booksCount: 31, pagesCount: 9800, streak: 8, followed: false, badges: ['🚀'], mutualCount: 2 },
      { username: 'ayse_kitap', name: 'Ayşe Çelik', avatar: '👩‍⚕️', bio: 'Roman ve kişisel gelişim.', city: 'İzmir', booksCount: 54, pagesCount: 15100, streak: 21, followed: false, badges: ['🧠', '🏆'], mutualCount: 3 },
      { username: 'elif_siir', name: 'Elif Şen', avatar: '👩‍🎨', bio: 'Şiir ve sanat üzerine okuyorum.', city: 'Bursa', booksCount: 19, pagesCount: 4500, streak: 3, followed: false, badges: ['🎨'], mutualCount: 1 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_circleUsers', JSON.stringify(circleUsers));
  }, [circleUsers]);

  const [circleFeed, setCircleFeed] = useState(() => {
    const saved = localStorage.getItem('bookshelf_circleFeed');
    return saved ? JSON.parse(saved) : [
      { id: 1, username: 'ali_okur', name: 'Ali Yılmaz', avatar: '👨‍🦱', type: 'start', bookTitle: 'Hobbit', bookAuthor: 'J.R.R. Tolkien', text: "Yüzüklerin Efendisi öncesi efsanevi maceraya başladım! 🎉", timestamp: '2 saat önce', likes: 5, liked: false, comments: [{ name: 'Zeynep Kaya', text: 'Mükemmel bir seçim! Su gibi akıyor.' }] },
      { id: 2, username: 'zeynep_klasik', name: 'Zeynep Kaya', avatar: '👩‍🦰', type: 'finish', bookTitle: 'Sefiller', bookAuthor: 'Victor Hugo', rating: 5, text: "Muhteşem bir dram. Jean Valjean'ın hikayesi beni derinden etkiledi. Kesinlikle okunmalı! ⭐⭐⭐⭐⭐", timestamp: '4 saat önce', likes: 12, liked: true, comments: [{ name: 'Mehmet Demir', text: 'Ben de listeme ekledim!' }] },
      { id: 3, username: 'mehmet_bilim', name: 'Mehmet Demir', avatar: '👨‍🚀', type: 'quote', bookTitle: 'Dune', bookAuthor: 'Frank Herbert', quote: "Korku aklın katilidir.", text: "Dune serisinden unutulmaz bir alıntı. 🧠✨", timestamp: '1 gün önce', likes: 8, liked: false, comments: [] }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_circleFeed', JSON.stringify(circleFeed));
  }, [circleFeed]);

  const [circleClubs, setCircleClubs] = useState(() => {
    const saved = localStorage.getItem('bookshelf_circleClubs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'club-1',
        name: 'Klasik Edebiyat Kulübü',
        desc: 'Her ay dünya klasiklerinden bir eseri birlikte inceliyoruz.',
        type: 'Açık',
        category: 'Klasikler',
        membersCount: 142,
        joined: true,
        voting: {
          bookOptions: [
            { id: 'opt-1', title: 'İki Şehrin Hikayesi', votes: 34 },
            { id: 'opt-2', title: 'Vadideki Zambak', votes: 21 },
            { id: 'opt-3', title: 'Babalar ve Oğullar', votes: 28 }
          ],
          votedOption: null
        },
        discussions: [
          { name: 'Zeynep Kaya', text: '1. Bölümdeki betimlemeler inanılmazdı.' },
          { name: 'Ali Yılmaz', text: 'Yazarın üslubu dönemi çok iyi yansıtıyor.' }
        ],
        schedule: '15 Şubat: 1-5. Bölümler arası tartışma',
        zoomLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: 'club-2',
        name: 'Bilim Kurgu Severler',
        desc: 'Geleceği, uzayı ve teknolojiyi keşfeden kitaplar.',
        type: 'Açık',
        category: 'Bilim Kurgu',
        membersCount: 89,
        joined: false,
        voting: {
          bookOptions: [
            { id: 'opt-a', title: 'Mülksüzler', votes: 19 },
            { id: 'opt-b', title: 'Fahrenheit 451', votes: 25 },
            { id: 'opt-c', title: 'Vakıf Kurulurken', votes: 12 }
          ],
          votedOption: null
        },
        discussions: [],
        schedule: '20 Şubat: Kitap Seçim Oylaması Sonu',
        zoomLink: 'https://meet.google.com/klm-nopq-rst'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_circleClubs', JSON.stringify(circleClubs));
  }, [circleClubs]);

  const [circleSwaps, setCircleSwaps] = useState(() => {
    const saved = localStorage.getItem('bookshelf_circleSwaps');
    return saved ? JSON.parse(saved) : [
      { id: 'swap-1', title: 'Sapiens', author: 'Yuval Noah Harari', owner: 'ali_okur', avatar: '👨‍🦱', distance: '1.2 km', rating: '4.8', status: 'available' },
      { id: 'swap-2', title: 'Cesur Yeni Dünya', author: 'Aldous Huxley', owner: 'zeynep_klasik', avatar: '👩‍🦰', distance: '3.5 km', rating: '4.9', status: 'available' },
      { id: 'swap-3', title: 'Otostopçunun Galaksi Rehberi', author: 'Douglas Adams', owner: 'mehmet_bilim', avatar: '👨‍🚀', distance: '0.8 km', rating: '4.7', status: 'requested' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_circleSwaps', JSON.stringify(circleSwaps));
  }, [circleSwaps]);

  const [savedPosts, setSavedPosts] = useState(() => {
    const saved = localStorage.getItem('bookshelf_savedPosts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_savedPosts', JSON.stringify(savedPosts));
  }, [savedPosts]);

  const [socialTab, setSocialTab] = useState('feed');

  // Initialize books from localStorage
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('bookshelf_books');
    if (savedBooks) {
      return JSON.parse(savedBooks);
    }
    return [
      {
        id: 1,
        title: 'Suç ve Ceza',
        author: 'Fyodor Dostoyevski',
        genre: 'Dünya Klasikleri',
        cover: '#7B3F3F',
        rating: 5,
        status: 'read',
        review: 'İnsan psikolojisinin derinliklerine inen muhteşem bir eser.',
        highlights: ['İnsan her şeye alışır, alçak!', 'Acı çekmek ve acıyı kabullenmek gerekir.']
      },
      {
        id: 2,
        title: 'Simyacı',
        author: 'Paulo Coelho',
        genre: 'Roman',
        cover: '#8B6F47',
        rating: 4,
        status: 'read',
        review: 'Kişisel efsaneyi aramak üzerine ilham verici bir yolculuk.',
        highlights: ['Evren sana yardım eder, eğer gerçekten bir şey istiyorsan.']
      },
      {
        id: 3,
        title: '1984',
        author: 'George Orwell',
        genre: 'Bilim Kurgu',
        cover: '#5D4037',
        rating: 5,
        status: 'reading',
        review: '',
        highlights: ['Savaş barıştır, özgürlük köleliktir, cehalet güçtür.']
      },
      {
        id: 4,
        title: 'Küçük Prens',
        author: 'Antoine de Saint-Exupéry',
        genre: 'Dünya Klasikleri',
        cover: '#904D5C',
        rating: 0,
        status: 'want-to-read',
        review: '',
        highlights: []
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_is3DMode', JSON.stringify(is3DMode));
  }, [is3DMode]);

  useEffect(() => {
    localStorage.setItem('bookshelf_libraryLayoutMode', libraryLayoutMode);
  }, [libraryLayoutMode]);

  useEffect(() => {
    localStorage.setItem('bookshelf_shelfOrnaments', JSON.stringify(shelfOrnaments));
  }, [shelfOrnaments]);

  useEffect(() => {
    localStorage.setItem('bookshelf_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('bookshelf_readingGoal', JSON.stringify(readingGoal));
  }, [readingGoal]);

  useEffect(() => {
    localStorage.setItem('bookshelf_weeklyGoal', JSON.stringify(weeklyGoal));
  }, [weeklyGoal]);

  useEffect(() => {
    localStorage.setItem('bookshelf_monthlyGoal', JSON.stringify(monthlyGoal));
  }, [monthlyGoal]);

  useEffect(() => {
    localStorage.setItem('bookshelf_annualGoal', JSON.stringify(annualGoal));
  }, [annualGoal]);

  useEffect(() => {
    localStorage.setItem('bookshelf_challengeName', JSON.stringify(challengeName));
  }, [challengeName]);

  useEffect(() => {
    localStorage.setItem('bookshelf_streakData', JSON.stringify(streakData));
  }, [streakData]);

  // Shopping List
  const [shoppingList, setShoppingList] = useState(() => {
    const saved = localStorage.getItem('bookshelf_shoppingList');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('bookshelf_shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Scheduled Theme Mode states
  const [scheduleActive, setScheduleActive] = useState(() => {
    const saved = localStorage.getItem('bookshelf_scheduleActive');
    return saved ? JSON.parse(saved) : false;
  });
  const [scheduleStart, setScheduleStart] = useState(() => {
    const saved = localStorage.getItem('bookshelf_scheduleStart');
    return saved ? JSON.parse(saved) : 20;
  });
  const [scheduleEnd, setScheduleEnd] = useState(() => {
    const saved = localStorage.getItem('bookshelf_scheduleEnd');
    return saved ? JSON.parse(saved) : 6;
  });

  useEffect(() => {
    localStorage.setItem('bookshelf_scheduleActive', JSON.stringify(scheduleActive));
  }, [scheduleActive]);
  useEffect(() => {
    localStorage.setItem('bookshelf_scheduleStart', JSON.stringify(scheduleStart));
  }, [scheduleStart]);
  useEffect(() => {
    localStorage.setItem('bookshelf_scheduleEnd', JSON.stringify(scheduleEnd));
  }, [scheduleEnd]);

  useEffect(() => {
    if (scheduleActive) {
      const currentHour = new Date().getHours();
      let shouldBeDark = false;
      if (scheduleStart > scheduleEnd) {
        shouldBeDark = currentHour >= scheduleStart || currentHour < scheduleEnd;
      } else {
        shouldBeDark = currentHour >= scheduleStart && currentHour < scheduleEnd;
      }
      setTheme(shouldBeDark ? 'dark' : 'oak');
    }
  }, [scheduleActive, scheduleStart, scheduleEnd]);

  // Daily Reading Reminder states
  const [remindersEnabled, setRemindersEnabled] = useState(() => localStorage.getItem('bookshelf_remindersEnabled') === 'true');
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('bookshelf_reminderTime') || '21:00');

  useEffect(() => {
    localStorage.setItem('bookshelf_remindersEnabled', remindersEnabled);
  }, [remindersEnabled]);

  useEffect(() => {
    localStorage.setItem('bookshelf_reminderTime', reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    if (!remindersEnabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMin = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHour}:${currentMin}`;

      if (currentTimeStr === reminderTime) {
        const todayStr = now.toDateString();
        const lastTriggered = localStorage.getItem('bookshelf_lastReminderDate');
        if (lastTriggered !== todayStr) {
          localStorage.setItem('bookshelf_lastReminderDate', todayStr);
          if (Notification.permission === 'granted') {
            new Notification("BookCircle Okuma Vakti!", {
              body: "📖 Günlük okuma hedefini tamamlamak için harika bir zaman. Kitabın seni bekliyor!",
              icon: "icon.jpg"
            });
          }
        }
      }
    };

    const interval = setInterval(checkReminder, 30000);
    checkReminder();

    return () => clearInterval(interval);
  }, [remindersEnabled, reminderTime]);

  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showLogReading, setShowLogReading] = useState(false);
  const [showYearlySummary, setShowYearlySummary] = useState(false);
  const [showShareLibrary, setShowShareLibrary] = useState(false);

  // E-Reader States
  const [activeReaderBook, setActiveReaderBook] = useState(null);
  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [readerFileType, setReaderFileType] = useState(null);
  const [readerFileContent, setReaderFileContent] = useState(null);
  const [readerLoading, setReaderLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('bookshelf_isKidsMode', isKidsMode);
  }, [isKidsMode]);
  useEffect(() => {
    localStorage.setItem('bookshelf_kidsTheme', kidsTheme);
  }, [kidsTheme]);
  useEffect(() => {
    localStorage.setItem('bookshelf_kidsTarget', kidsTarget.toString());
  }, [kidsTarget]);
  useEffect(() => {
    localStorage.setItem('bookshelf_kidsXp', kidsXp.toString());
  }, [kidsXp]);
  useEffect(() => {
    localStorage.setItem('bookshelf_kidsPetType', kidsPetType);
  }, [kidsPetType]);

  // Quote Card Creator State
  const [showQuoteCreator, setShowQuoteCreator] = useState(false);
  const [quoteToShare, setQuoteToShare] = useState(null);
  const [bookForQuote, setBookForQuote] = useState(null);
  const [cardConfig, setCardConfig] = useState({
    bgType: 'gradient',
    bgValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    showBranding: true,
    fontSize: 'text-2xl',
    alignment: 'text-center'
  });

  // Search & Filter State
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter and Sort Logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
    const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;

    const matchesCollection = activeCollection
      ? collections.find(c => c.id === activeCollection)?.bookIds.includes(book.id)
      : true;

    return matchesSearch && matchesStatus && matchesGenre && matchesCollection;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date-desc': return b.id - a.id;
      case 'date-asc': return a.id - b.id;
      case 'rating-desc': return b.rating - a.rating;
      case 'rating-asc': return a.rating - b.rating;
      case 'title-asc': return a.title.localeCompare(b.title);
      case 'title-desc': return b.title.localeCompare(a.title);
      case 'pages-desc': return b.totalPages - a.totalPages;
      case 'pages-asc': return a.totalPages - b.totalPages;
      default: return 0;
    }
  });

  const [logSession, setLogSession] = useState({
    bookId: '',
    type: 'paper',
    minutes: '',
    pages: '',
    mood: '😊',
    note: ''
  });

  const openLogReadingModal = () => {
    const activeBook = books.find(b => b.status === 'reading') || books[0];
    setLogSession({
      bookId: activeBook ? activeBook.id : '',
      type: 'paper',
      minutes: '',
      pages: '',
      mood: '😊',
      note: ''
    });
    setShowLogReading(true);
  };

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: 'Roman',
    cover: '#7B3F3F',
    coverImage: '',
    rating: 0,
    status: 'want-to-read',
    review: '',
    highlights: [],
    totalPages: '',
    currentPage: 0,
    price: ''
  });

  const [newBookFile, setNewBookFile] = useState(null);

  const statusLabels = {
    'want-to-read': 'Okunacak',
    'reading': 'Okunuyor',
    'read': 'Okundu'
  };

  const addBook = () => {
    if (newBook.title && newBook.author) {
      const newBookId = Date.now();
      const bookData = {
        ...newBook,
        id: newBookId,
        hasEbook: newBookFile ? true : false,
        epubPath: newBookFile && !newBookFile.name.endsWith('.pdf') ? 'local' : null,
        pdfPath: newBookFile && newBookFile.name.endsWith('.pdf') ? 'local' : null,
        fileName: newBookFile ? newBookFile.name : null
      };

      if (newBookFile) {
        storeEbookFile(newBookId, newBookFile).then(() => {
          setBooks([...books, bookData]);
          setNewBookFile(null);
        }).catch(err => {
          alert("Dosya kaydedilirken hata oluştu: " + err.message);
          setBooks([...books, bookData]);
          setNewBookFile(null);
        });
      } else {
        setBooks([...books, bookData]);
      }

      setNewBook({
        title: '',
        author: '',
        genre: 'Roman',
        cover: '#7B3F3F',
        coverImage: '',
        rating: 0,
        status: 'want-to-read',
        review: '',
        highlights: [],
        totalPages: '',
        currentPage: 0,
        price: ''
      });
      setShowAddBook(false);
    }
  };

  const deleteBook = (id) => {
    if (window.confirm('Bu kitabı silmek istediğine emin misin?')) {
      setBooks(books.filter(b => b.id !== id));
      if (selectedBook && selectedBook.id === id) {
        setSelectedBook(null);
      }
    }
  };

  const openReader = (book) => {
    setReaderLoading(true);
    setActiveReaderBook(book);
    getEbookFile(book.id).then(file => {
      if (file) {
        setReaderFileContent(file);
        setReaderFileType(book.pdfPath ? 'pdf' : 'epub');
        setReaderModalOpen(true);
      } else {
        alert("E-kitap dosyası bulunamadı. Lütfen detaylar penceresinden tekrar yükleyin.");
      }
      setReaderLoading(false);
    }).catch(err => {
      console.error(err);
      alert("Dosya veritabanından yüklenirken hata oluştu.");
      setReaderLoading(false);
    });
  };

  const updateBook = (id, updates) => {
    setBooks(books.map(book => book.id === id ? { ...book, ...updates } : book));
    if (selectedBook && selectedBook.id === id) {
      setSelectedBook({ ...selectedBook, ...updates });
    }
  };

  const reorderBooks = (draggedBookId, targetBookId) => {
    if (draggedBookId === targetBookId) return;
    setBooks(prevBooks => {
      const result = [...prevBooks];
      const draggedIdx = result.findIndex(b => b.id === draggedBookId);
      const targetIdx = result.findIndex(b => b.id === targetBookId);
      if (draggedIdx === -1 || targetIdx === -1) return prevBooks;
      const [removed] = result.splice(draggedIdx, 1);
      result.splice(targetIdx, 0, removed);
      return result;
    });
  };

  const addHighlight = (bookId, highlight) => {
    if (highlight.trim()) {
      const book = books.find(b => b.id === bookId);
      updateBook(bookId, { highlights: [...(book.highlights || []), highlight] });
    }
  };

  const logReadingTime = () => {
    const minutes = parseInt(logSession.minutes);
    const pages = parseInt(logSession.pages) || 0;
    const bookId = Number(logSession.bookId);

    if (!isNaN(minutes) && minutes > 0 && bookId) {
      const today = new Date().toISOString().split('T')[0];

      const newSession = {
        id: 'sess-' + Date.now(),
        date: today,
        minutes: minutes,
        type: logSession.type,
        pages: logSession.type === 'paper' ? pages : 0,
        mood: logSession.mood,
        note: logSession.note,
        timestamp: Date.now()
      };

      setBooks(prevBooks => prevBooks.map(book => {
        if (book.id === bookId) {
          const prevSessions = book.sessions || [];
          const updatedSessions = [...prevSessions, newSession];

          let newCurrentPage = book.currentPage || 0;
          let newStatus = book.status;

          if (logSession.type === 'paper') {
            newCurrentPage = Math.min(book.totalPages || newCurrentPage + pages, newCurrentPage + pages);
            if (book.totalPages && newCurrentPage >= book.totalPages) {
              newStatus = 'read';
            }
          }

          const paperSessions = updatedSessions.filter(s => s.type === 'paper');
          const totalPagesLogged = paperSessions.reduce((sum, s) => sum + (s.pages || 0), 0);
          const totalMinutesLogged = paperSessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
          const readingSpeed = totalMinutesLogged > 0 ? (totalPagesLogged / totalMinutesLogged) : 0;

          const updatedBook = {
            ...book,
            sessions: updatedSessions,
            currentPage: newCurrentPage,
            status: newStatus,
            readingSpeed: readingSpeed
          };

          if (selectedBook && selectedBook.id === bookId) {
            setSelectedBook(updatedBook);
          }

          return updatedBook;
        }
        return book;
      }));

      const newProgress = (streakData.dailyProgress?.minutes || 0) + minutes;
      let newStreak = streakData.streak;
      let newLastReadDate = streakData.lastReadDate;

      if (newProgress >= readingGoal && (streakData.dailyProgress?.minutes || 0) < readingGoal) {
        if (streakData.lastReadDate !== today) {
          newStreak += 1;
          newLastReadDate = today;

          if (newStreak > (streakData.longestStreak || 0)) {
            streakData.longestStreak = newStreak;
          }
        }
      }

      setStreakData({
        ...streakData,
        streak: newStreak,
        lastReadDate: newLastReadDate,
        dailyProgress: { date: today, minutes: newProgress }
      });

      setLogSession({
        bookId: '',
        type: 'paper',
        minutes: '',
        pages: '',
        mood: '😊',
        note: ''
      });
      setShowLogReading(false);
    }
  };

  const getGoalsProgress = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    let weeklyMinutes = 0;
    let monthlyMinutes = 0;

    books.forEach(b => {
      (b.sessions || []).forEach(s => {
        const sessDate = new Date(s.date);
        if (sessDate >= startOfWeek) {
          weeklyMinutes += s.minutes;
        }
        if (sessDate >= startOfMonth) {
          monthlyMinutes += s.minutes;
        }
      });
    });

    return { weeklyMinutes, monthlyMinutes };
  };

  const getXPInfo = () => {
    let totalPagesRead = books.reduce((sum, b) => {
      if (b.status === 'read') return sum + (b.totalPages || 0);
      return sum + (b.currentPage || 0);
    }, 0);

    let totalAudioMinutes = 0;
    let totalSessions = 0;
    books.forEach(b => {
      if (b.sessions) {
        totalSessions += b.sessions.length;
        b.sessions.forEach(s => {
          if (s.type === 'audio') totalAudioMinutes += s.minutes;
        });
      }
    });

    const xp = (totalPagesRead * 10) + (totalAudioMinutes * 2) + (totalSessions * 50);
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const currentProgressXP = xp - currentLevelXP;
    const levelProgress = xpNeeded > 0 ? (currentProgressXP / xpNeeded) * 100 : 100;

    return { xp, level, currentProgressXP, xpNeeded, levelProgress };
  };

  const getUnlockedBadges = () => {
    const badges = [];
    const xpInfo = getXPInfo();
    const readBooks = books.filter(b => b.status === 'read');
    const allSessions = books.reduce((acc, b) => acc.concat(b.sessions || []), []);
    const audioSessions = allSessions.filter(s => s.type === 'audio');

    badges.push({ id: 'level-2', title: 'Çırak Okur', desc: 'Seviye 2\'ye ulaş.', icon: '🎯', unlocked: xpInfo.level >= 2 });
    badges.push({ id: 'level-5', title: 'Usta Okur', desc: 'Seviye 5\'e ulaş.', icon: '👑', unlocked: xpInfo.level >= 5 });
    badges.push({ id: 'level-10', title: 'Kitap Guardı', desc: 'Seviye 10\'a ulaş.', icon: '🛡️', unlocked: xpInfo.level >= 10 });

    badges.push({ id: 'streak-3', title: 'İstikrarlı Yolcu', desc: '3 günlük okuma serisi yap.', icon: '🔥', unlocked: (streakData.longestStreak || 0) >= 3 || streakData.streak >= 3 });
    badges.push({ id: 'streak-7', title: 'Haftalık Kahraman', desc: '7 günlük okuma serisi yap.', icon: '⚡', unlocked: (streakData.longestStreak || 0) >= 7 || streakData.streak >= 7 });
    badges.push({ id: 'streak-30', title: 'Alışkanlık Canavarı', desc: '30 günlük okuma serisi yap.', icon: '🦾', unlocked: (streakData.longestStreak || 0) >= 30 || streakData.streak >= 30 });

    badges.push({ id: 'first-book', title: 'İlk Zafer', desc: 'İlk kitabını bitir.', icon: '🏆', unlocked: readBooks.length >= 1 });
    badges.push({ id: 'lib-5', title: 'Mini Kitaplık', desc: '5 kitap bitir.', icon: '📚', unlocked: readBooks.length >= 5 });
    badges.push({ id: 'lib-20', title: 'Kültür Elçisi', desc: '20 kitap bitir.', icon: '🌍', unlocked: readBooks.length >= 20 });

    badges.push({ id: 'audio-1', title: 'Ses Meraklısı', desc: 'İlk sesli kitap seansını tamamla.', icon: '🎧', unlocked: audioSessions.length >= 1 });
    badges.push({ id: 'audio-5', title: 'Kulak Misafiri', desc: '5 sesli kitap seansı tamamla.', icon: '📻', unlocked: audioSessions.length >= 5 });

    const maxSpeed = books.reduce((max, b) => {
      if (!b.sessions) return max;
      b.sessions.forEach(s => {
        if (s.type === 'paper' && s.minutes > 0) {
          const speed = s.pages / s.minutes;
          if (speed > max) max = speed;
        }
      });
      return max;
    }, 0);
    badges.push({ id: 'speed-fast', title: 'Hızlı Okur', desc: 'Dakikada 1.5 sayfadan hızlı okuma kaydet.', icon: '🚀', unlocked: maxSpeed >= 1.5 });

    return badges;
  };

  const DEFAULT_QUOTES = [
    { quote: "Kitapsız yaşamak; kör, sağır, dilsiz yaşamaktır.", book: { title: "Özlü Söz", author: "Mustafa Kemal Atatürk" } },
    { quote: "İyi kitaplar okumak, geçmiş yüzyılların en iyi insanlarıyla sohbet etmek gibidir.", book: { title: "Metot Üzerine Konuşma", author: "René Descartes" } },
    { quote: "Bir insanı anlamak istiyorsanız, onun okuduğu kitapları okuyun.", book: { title: "Özlü Söz", author: "Ralph Waldo Emerson" } },
    { quote: "Kelimeler tek başlarına insanı sarhoş edebilir.", book: { title: "Özlü Söz", author: "Rudyard Kipling" } },
    { quote: "Sadece tek bir hayat yaşarız eğer kitap okumazsak; ama binlerce hayat yaşayabiliriz okursak.", book: { title: "Özlü Söz", author: "George R.R. Martin" } },
    { quote: "Yaşamak, kendi kendini hissetmektir.", book: { title: "Yabancı", author: "Albert Camus" } },
    { quote: "Zor zamanlar güçlü insanlar yaratır.", book: { title: "Özlü Söz", author: "G. Michael Hopf" } },
    { quote: "Gerçek yolculuk yeni topraklar bulmak değil, yeni gözlerle bakmaktır.", book: { title: "Kayıp Zamanın İzinde", author: "Marcel Proust" } },
    { quote: "Her şeyin bir güzelliği vardır ama herkes bunu göremez.", book: { title: "Konuşmalar", author: "Konfüçyüs" } }
  ];

  const getAllQuotes = () => {
    const allList = [...DEFAULT_QUOTES];
    books.forEach(b => {
      (b.highlights || []).forEach(h => {
        if (!allList.some(q => q.quote === h)) {
          allList.push({ quote: h, book: b });
        }
      });
    });
    return allList;
  };

  const getQuoteOfTheDay = () => {
    const list = getAllQuotes();
    if (list.length === 0) return null;
    const idx = activeQuoteIndex % list.length;
    return list[Math.abs(idx)];
  };

  const getAIRecommendations = () => {
    const userGenres = books.map(b => b.genre);
    const genreCounts = {};
    userGenres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });

    const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);

    const topGenres = sortedGenres.slice(0, 3);
    if (topGenres.length === 0) topGenres.push('Roman');
    if (topGenres.length === 1) topGenres.push('Bilim Kurgu');
    if (topGenres.length === 2) topGenres.push('Dünya Klasikleri');

    const catalog = {
      'Roman': [
        { title: 'Sefiller', author: 'Victor Hugo', genre: 'Roman' },
        { title: 'Suç ve Ceza', author: 'Fyodor Dostoyevski', genre: 'Roman' },
        { title: 'Yabancı', author: 'Albert Camus', genre: 'Roman' },
        { title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', genre: 'Roman' },
        { title: 'Tutunamayanlar', author: 'Oğuz Atay', genre: 'Roman' },
        { title: 'Saatleri Ayarlama Enstitüsü', author: 'Ahmet Hamdi Tanpınar', genre: 'Roman' }
      ],
      'Bilim Kurgu': [
        { title: 'Dune', author: 'Frank Herbert', genre: 'Bilim Kurgu' },
        { title: 'Vakıf', author: 'Isaac Asimov', genre: 'Bilim Kurgu' },
        { title: 'Cesur Yeni Dünya', author: 'Aldous Huxley', genre: 'Bilim Kurgu' },
        { title: 'Mülksüzler', author: 'Ursula K. Le Guin', genre: 'Bilim Kurgu' },
        { title: 'Fahrenheit 451', author: 'Ray Bradbury', genre: 'Bilim Kurgu' }
      ],
      'Dünya Klasikleri': [
        { title: '1984', author: 'George Orwell', genre: 'Dünya Klasikleri' },
        { title: 'Dönüşüm', author: 'Franz Kafka', genre: 'Dünya Klasikleri' },
        { title: 'Gurur ve Önyargı', author: 'Jane Austen', genre: 'Dünya Klasikleri' },
        { title: 'Karamazov Kardeşler', author: 'Fyodor Dostoyevski', genre: 'Dünya Klasikleri' },
        { title: 'Hayvan Çiftliği', author: 'George Orwell', genre: 'Dünya Klasikleri' }
      ],
      'Kişisel Gelişim': [
        { title: 'Atomik Alışkanlıklar', author: 'James Clear', genre: 'Kişisel Gelişim' },
        { title: 'Etkili İnsanların 7 Alışkanlığı', author: 'Stephen Covey', genre: 'Kişisel Gelişim' },
        { title: 'Dost Kazanma ve İnsanları Etkileme Sanatı', author: 'Dale Carnegie', genre: 'Kişisel Gelişim' },
        { title: 'Düşün ve Zengin Ol', author: 'Napoleon Hill', genre: 'Kişisel Gelişim' }
      ],
      'Tarih': [
        { title: 'Sapiens', author: 'Yuval Noah Harari', genre: 'Tarih' },
        { title: 'Tüfek, Mikrop ve Çelik', author: 'Jared Diamond', genre: 'Tarih' },
        { title: 'İlber Ortaylı ile Tarih Dersleri', author: 'İlber Ortaylı', genre: 'Tarih' },
        { title: 'Kısa Türkiye Tarihi', author: 'Sina Akşin', genre: 'Tarih' }
      ],
      'Felsefe': [
        { title: 'Böyle Buyurdu Zerdüşt', author: 'Friedrich Nietzsche', genre: 'Felsefe' },
        { title: 'Devlet', author: 'Platon', genre: 'Felsefe' },
        { title: 'Kendime Düşünceler', author: 'Marcus Aurelius', genre: 'Felsefe' },
        { title: 'Sorgulayan Denemeler', author: 'Bertrand Russell', genre: 'Felsefe' }
      ],
      'Diğer': [
        { title: 'Simyacı', author: 'Paulo Coelho', genre: 'Diğer' },
        { title: 'Kitap Hırsızı', author: 'Markus Zusak', genre: 'Diğer' },
        { title: 'Küçük Prens', author: 'Antoine de Saint-Exupéry', genre: 'Diğer' }
      ]
    };

    const recs = [];
    topGenres.forEach(genre => {
      const list = catalog[genre] || catalog['Roman'];
      list.forEach(book => {
        const exists = books.some(b => b.title.toLowerCase() === book.title.toLowerCase());
        if (!exists && recs.length < 6) {
          recs.push(book);
        }
      });
    });

    if (recs.length < 6) {
      const allOptions = [...catalog['Roman'], ...catalog['Bilim Kurgu'], ...catalog['Dünya Klasikleri'], ...catalog['Felsefe'], ...catalog['Kişisel Gelişim']];
      for (let book of allOptions) {
        const exists = books.some(b => b.title.toLowerCase() === book.title.toLowerCase());
        const alreadyRec = recs.some(r => r.title.toLowerCase() === book.title.toLowerCase());
        if (!exists && !alreadyRec) {
          recs.push(book);
        }
        if (recs.length >= 6) break;
      }
    }

    return recs;
  };

  const openQuoteCreator = (quote, book) => {
    setQuoteToShare(quote);
    setBookForQuote(book);
    setShowQuoteCreator(true);
  };

  const handleExportQuoteCard = () => {
    const element = document.getElementById('quote-card-preview');
    if (!element || !window.html2canvas) return;

    window.html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: 2
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `alinti-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const exportData = () => {
    const data = {
      books,
      readingGoal,
      streakData,
      theme,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookshelf_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!Array.isArray(data.books)) {
          alert('Geçersiz yedek dosyası formatı!');
          return;
        }

        if (window.confirm('Mevcut verilerin üzerine yazılacak. Emin misiniz?')) {
          setBooks(data.books);
          if (data.readingGoal) setReadingGoal(data.readingGoal);
          if (data.streakData) setStreakData(data.streakData);
          if (data.theme) setTheme(data.theme);
          alert('Veriler başarıyla geri yüklendi!');
        }
      } catch (error) {
        alert('Dosya okunamadı. JSON formatı hatalı olabilir.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const handleImageUpload = (event, targetStateSetter, currentStateOrBook) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        if (typeof targetStateSetter === 'function') {
          if (currentStateOrBook && typeof currentStateOrBook === 'object' && !currentStateOrBook.id) {
            targetStateSetter({ ...currentStateOrBook, coverImage: dataUrl });
          } else {
            targetStateSetter({ coverImage: dataUrl });
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const stats = {
    total: books.length,
    read: books.filter(b => b.status === 'read').length,
    reading: books.filter(b => b.status === 'reading').length,
    totalPages: books.reduce((sum, b) => sum + (Number(b.totalPages) || 0), 0),
    avgRating: books.filter(b => b.rating > 0).length > 0
      ? (books.filter(b => b.rating > 0).reduce((sum, b) => sum + b.rating, 0) / books.filter(b => b.rating > 0).length).toFixed(1)
      : 0,
    totalValue: books.reduce((sum, b) => sum + (Number(b.price) || 0), 0)
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${themeColors.bg} ${isKidsMode ? 'font-["Quicksand",sans-serif]' : fontClasses[font]}`}>
      {isKidsMode ? (
        <KidsDashboard
          books={books}
          onOpenBook={(book) => setSelectedBook(book)}
          kidsXp={kidsXp}
          setKidsXp={setKidsXp}
          kidsTheme={kidsTheme}
          setKidsTheme={setKidsTheme}
          kidsTarget={kidsTarget}
          setKidsTarget={setKidsTarget}
          kidsPetType={kidsPetType}
          setKidsPetType={setKidsPetType}
          isDark={isDark}
          themeColors={themeColors}
          onExitKidsMode={() => {
            setIsKidsMode(false);
            setView('library');
          }}
        />
      ) : (
        layoutMode === 'desktop' ? (
          <div className={`flex-grow flex min-h-0 transition-colors ${themeColors.bg}`}>
            {/* Sidebar */}
            <div className={`hidden md:flex w-64 p-6 flex-col gap-6 border-r sticky top-0 h-screen overflow-y-auto ${themeColors.sidebar} ${themeColors.border}`}>
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 opacity-60 ${themeColors.text}`}>Kitaplığım</h3>
                <div className="space-y-1">
                  <div
                    onClick={() => { setView('library'); setLibraryFilter('all'); setActiveCollection(null); }}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between text-sm transition-colors ${view === 'library' && libraryFilter === 'all' && activeCollection === null ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <span className="flex items-center gap-2"><BookOpen size={18} /> Tüm Kitaplar</span>
                    <span className="text-xs opacity-60">({books.length})</span>
                  </div>
                  <div
                    onClick={() => { setView('library'); setLibraryFilter('reading'); setActiveCollection(null); }}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between text-sm transition-colors ${view === 'library' && libraryFilter === 'reading' && activeCollection === null ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <span className="flex items-center gap-2"><BookOpen size={18} /> Okunuyor</span>
                    <span className="text-xs opacity-60">({books.filter(b => b.status === 'reading').length})</span>
                  </div>
                  <div
                    onClick={() => { setView('library'); setLibraryFilter('want-to-read'); setActiveCollection(null); }}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between text-sm transition-colors ${view === 'library' && libraryFilter === 'want-to-read' && activeCollection === null ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <span className="flex items-center gap-2"><Clock size={18} /> Okunacak</span>
                    <span className="text-xs opacity-60">({books.filter(b => b.status === 'want-to-read').length})</span>
                  </div>
                  <div
                    onClick={() => { setView('library'); setLibraryFilter('read'); setActiveCollection(null); }}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between text-sm transition-colors ${view === 'library' && libraryFilter === 'read' && activeCollection === null ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <span className="flex items-center gap-2"><CheckCircle size={18} /> Okundu</span>
                    <span className="text-xs opacity-60">({books.filter(b => b.status === 'read').length})</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 opacity-60 ${themeColors.text}`}>Gezinti</h3>
                <div className="space-y-1">
                  <div
                    onClick={() => { setView('social'); setActiveCollection(null); setSocialTab('feed'); }}
                    className={`p-2 rounded cursor-pointer flex items-center gap-2 text-sm transition-colors ${view === 'social' ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <Users size={18} /> BookCircle Sosyal
                  </div>
                  <div
                    onClick={() => { setView('highlights'); setActiveCollection(null); }}
                    className={`p-2 rounded cursor-pointer flex items-center gap-2 text-sm transition-colors ${view === 'highlights' ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <Quote size={18} /> Alıntılar
                  </div>
                  <div
                    onClick={() => { setView('stats'); setActiveCollection(null); }}
                    className={`p-2 rounded cursor-pointer flex items-center gap-2 text-sm transition-colors ${view === 'stats' ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <TrendingUp size={18} /> İstatistikler
                  </div>
                  <div
                    onClick={() => { setView('goals'); setActiveCollection(null); }}
                    className={`p-2 rounded cursor-pointer flex items-center gap-2 text-sm transition-colors ${view === 'goals' ? 'bg-black/10 font-bold text-[#7B3F3F]' : `hover:bg-black/5 ${themeColors.text}`}`}
                  >
                    <Award size={18} /> Hedefler & Seviyeler
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <h3 className={`text-xs font-bold uppercase tracking-wider opacity-60 flex justify-between items-center ${themeColors.text}`}>
                  <span>Koleksiyonlar</span>
                  <button
                    onClick={() => {
                      const name = prompt('Yeni koleksiyon adı:');
                      if (name) createCollection(name);
                    }}
                    className="hover:text-[#7B3F3F]"
                  >
                    <Plus size={16} />
                  </button>
                </h3>
                <div className="space-y-1 overflow-y-auto max-h-48 pr-1">
                  {collections.map(col => (
                    <div
                      key={col.id}
                      onClick={() => { setActiveCollection(col.id); setView('library'); }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className={`p-2 rounded cursor-pointer group flex justify-between items-center ${activeCollection === col.id && view === 'library' ? 'bg-black/10' : ''} ${themeColors.text}`}
                    >
                      <span className="truncate">{col.name} <span className="text-xs opacity-60">({col.bookIds.length})</span></span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newName = prompt('Yeni raf adını girin:', col.name);
                            if (newName) {
                              setCollections(prev => prev.map(c => c.id === col.id ? { ...c, name: newName } : c));
                            }
                          }}
                          className="hover:text-orange-500"
                        >
                          <Edit2 size={14} />
                        </button>
                        <Trash2 size={16} className="hover:text-red-500" onClick={(e) => deleteCollection(col.id, e)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`mt-auto pt-4 border-t ${themeColors.border}`}>
                <div
                  onClick={() => { setView('shopping'); setActiveCollection(null); }}
                  className={`p-2 mb-1 rounded cursor-pointer flex items-center gap-2 ${view === 'shopping' ? 'bg-black/10' : ''} ${themeColors.text}`}
                >
                  <ShoppingCart size={20} /> Alışveriş Listesi
                </div>
                <div
                  onClick={() => setShowShareLibrary(true)}
                  className={`p-2 mb-1 rounded cursor-pointer flex items-center gap-2 hover:bg-black/5 ${themeColors.text}`}
                >
                  <Share2 size={20} /> Kütüphanemi Paylaş
                </div>
                <div
                  onClick={() => {
                    changeLayoutMode('mobile');
                    setMobileTab('now-reading');
                    setView('library');
                  }}
                  className={`p-2 mb-1 rounded cursor-pointer flex items-center gap-2 hover:bg-black/5 ${themeColors.text}`}
                >
                  <Smartphone size={20} /> Mobil Sürüm
                </div>
                <div
                  onClick={() => { setView('settings'); setActiveCollection(null); }}
                  className={`p-2 rounded cursor-pointer flex items-center gap-2 ${view === 'settings' ? 'bg-black/10' : ''} ${themeColors.text}`}
                >
                  <Settings size={20} /> Ayarlar
                </div>
              </div>
            </div>

            {/* Desktop Center Pane */}
            <div className="flex-grow flex min-h-0 overflow-hidden">
              <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8 h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className={`text-4xl font-bold flex items-center gap-3 ${themeColors.text}`}>
                      <BookOpen size={40} />
                      BookCircle
                    </h1>

                    <div className="flex items-center gap-4">
                      {/* Streak Widget */}
                      <div className={`flex items-center gap-4 px-4 py-2 rounded-lg ${themeColors.widget}`}>
                        <div className="flex items-center gap-1" title={`${streakData.streak} Günlük Okuma Serisi`}>
                          <Flame size={20} className={`${streakData.streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
                          <span className={`font-bold ${themeColors.text}`}>{streakData.streak}</span>
                        </div>
                        <div className="w-px h-6 bg-current opacity-20"></div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={openLogReadingModal}>
                          <div className="relative w-8 h-8">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-20" />
                              <circle
                                cx="16" cy="16" r="14"
                                stroke="currentColor" strokeWidth="3" fill="none"
                                strokeDasharray={88}
                                strokeDashoffset={88 - (Math.min(streakData.dailyProgress?.minutes || 0, readingGoal) / readingGoal) * 88}
                                className={`${(streakData.dailyProgress?.minutes || 0) >= readingGoal ? 'text-green-500' : 'text-blue-500'} transition-all duration-500`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-[10px] font-bold ${themeColors.text}`}>{Math.round(((streakData.dailyProgress?.minutes || 0) / readingGoal) * 100)}%</span>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold leading-none ${themeColors.text}`}>
                              {streakData.dailyProgress?.minutes || 0} / {readingGoal} dk
                            </span>
                            <span className={`text-[10px] opacity-70 ${themeColors.text}`}>Günlük Hedef</span>
                          </div>
                        </div>
                      </div>

                      {/* Segmented Control for Layout Modes on Desktop */}
                      <div className={`p-1 rounded-xl flex items-center gap-1 border ${isDark ? 'bg-[#2D2620] border-[#4A3B2F]' : 'bg-[#E8DCC8] border-[#C8A882]'}`}>
                        <button
                          onClick={() => { setIs3DMode(false); setLibraryLayoutMode('cover'); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${(!is3DMode && libraryLayoutMode === 'cover') ? 'bg-[#7B3F3F] text-white shadow-sm' : 'opacity-65 hover:opacity-100'}`}
                          title="Kapak Görünümü"
                        >
                          <LayoutGrid size={14} />
                          <span>Kapak</span>
                        </button>
                        <button
                          onClick={() => { setIs3DMode(false); setLibraryLayoutMode('spine'); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${(!is3DMode && libraryLayoutMode === 'spine') ? 'bg-[#7B3F3F] text-white shadow-sm' : 'opacity-65 hover:opacity-100'}`}
                          title="Sırt Görünümü"
                        >
                          <AlignJustify size={14} className="rotate-90" />
                          <span>Sırt</span>
                        </button>
                        <button
                          onClick={() => setIs3DMode(true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${is3DMode ? 'bg-[#7B3F3F] text-white shadow-sm' : 'opacity-65 hover:opacity-100'}`}
                          title="3D Görünüm"
                        >
                          <Box size={14} />
                          <span>3D</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => setShowAddBook(true)}
                        className="px-5 py-2.5 bg-[#7B3F3F] text-white hover:bg-[#5D3030] rounded-lg font-semibold transition-all shadow flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus size={18} />
                        Kitap Ekle
                      </button>

                      {view === 'library' && (
                        <>
                          <div className="relative w-full sm:w-60">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeColors.accent}`} size={16} />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Kitap veya yazar ara..."
                              className={`w-full pl-9 pr-4 py-2 text-xs border rounded ${isDark
                                ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA] placeholder-[#6B5A4A]'
                                : 'border-[#C8A882] bg-[#F5E6D3] text-[#654321] placeholder-[#A0856A]'
                                }`}
                            />
                          </div>

                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className={`p-2 text-xs border rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#F5E6D3] text-[#654321]'}`}
                          >
                            <option value="all">Tüm Durumlar</option>
                            <option value="reading">Okunuyor</option>
                            <option value="want-to-read">Okunacak</option>
                            <option value="read">Okundu</option>
                          </select>

                          <select
                            value={filterGenre}
                            onChange={(e) => setFilterGenre(e.target.value)}
                            className={`p-2 text-xs border rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#F5E6D3] text-[#654321]'}`}
                          >
                            <option value="all">Tüm Türler</option>
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>

                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={`p-2 text-xs border rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#F5E6D3] text-[#654321]'}`}
                          >
                            <option value="date-desc">En Yeni</option>
                            <option value="date-asc">En Eski</option>
                            <option value="rating-desc">Puan (Yüksek)</option>
                            <option value="rating-asc">Puan (Düşük)</option>
                            <option value="pages-desc">Sayfa (Çok)</option>
                            <option value="pages-asc">Sayfa (Az)</option>
                            <option value="title-asc">A-Z</option>
                            <option value="title-desc">Z-A</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto">
                  {view === 'library' && (
                    <LibraryView
                      view={view}
                      books={books}
                      setBooks={setBooks}
                      isDark={isDark}
                      themeColors={themeColors}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      filterGenre={filterGenre}
                      setFilterGenre={setFilterGenre}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      activeCollection={activeCollection}
                      setActiveCollection={setActiveCollection}
                      libraryFilter={libraryFilter}
                      setLibraryFilter={setLibraryFilter}
                      filteredBooks={filteredBooks}
                      is3DMode={is3DMode}
                      setIs3DMode={setIs3DMode}
                      libraryLayoutMode={libraryLayoutMode}
                      shelfOrnaments={shelfOrnaments}
                      setShelfOrnaments={setShelfOrnaments}
                      collections={collections}
                      setCollections={setCollections}
                      createCollection={createCollection}
                      onUpdateCollection={toggleBookInCollection}
                      handleDragOver={handleDragOver}
                      handleDrop={handleDrop}
                      onReorderBooks={reorderBooks}
                      getQuoteOfTheDay={getQuoteOfTheDay}
                      setActiveQuoteIndex={setActiveQuoteIndex}
                      openQuoteCreator={openQuoteCreator}
                      selectedBook={selectedBook}
                      setSelectedBook={setSelectedBook}
                      onOpenReader={openReader}
                      getAIRecommendations={getAIRecommendations}
                      shoppingList={shoppingList}
                      setShoppingList={setShoppingList}
                      onUpdateBook={updateBook}
                      onDeleteBook={deleteBook}
                      storeEbookFile={storeEbookFile}
                      deleteEbookFile={deleteEbookFile}
                      handleImageUpload={handleImageUpload}
                    />
                  )}

                  {view === 'social' && (
                    <SocialFeed
                      books={books}
                      setBooks={setBooks}
                      userProfile={userProfile}
                      setUserProfile={setUserProfile}
                      streakData={streakData}
                      isDark={isDark}
                      themeColors={themeColors}
                      socialTab={socialTab}
                      setSocialTab={setSocialTab}
                      circleFeed={circleFeed}
                      setCircleFeed={setCircleFeed}
                      savedPosts={savedPosts}
                      setSavedPosts={setSavedPosts}
                      circleUsers={circleUsers}
                      setCircleUsers={setCircleUsers}
                      circleSwaps={circleSwaps}
                      setCircleSwaps={setCircleSwaps}
                      circleClubs={circleClubs}
                      setCircleClubs={setCircleClubs}
                      rtcStatus={rtcStatus}
                      rtcRole={rtcRole}
                      rtcOffer={rtcOffer}
                      rtcAnswer={rtcAnswer}
                      rtcName={rtcName}
                      setupPeerConnection={setupPeerConnection}
                      connectAsHost={connectAsHost}
                      connectAsGuest={connectAsGuest}
                    />
                  )}

                  {(view === 'stats' || view === 'goals') && (
                    <StatsView
                      books={books}
                      stats={stats}
                      streakData={streakData}
                      themeColors={themeColors}
                      isDark={isDark}
                      genres={genres}
                      annualGoal={annualGoal}
                      setAnnualGoal={setAnnualGoal}
                      readingGoal={readingGoal}
                      setReadingGoal={setReadingGoal}
                      weeklyGoal={weeklyGoal}
                      setWeeklyGoal={setWeeklyGoal}
                      monthlyGoal={monthlyGoal}
                      setOriginalMonthlyGoal={setMonthlyGoal}
                      challengeName={challengeName}
                      setChallengeName={setChallengeName}
                      subView={view}
                      setShowYearlySummary={setShowYearlySummary}
                      getXPInfo={getXPInfo}
                      getGoalsProgress={getGoalsProgress}
                      getUnlockedBadges={getUnlockedBadges}
                    />
                  )}

                  {view === 'shopping' && (
                    <LibraryView
                      view="shopping"
                      books={books}
                      setBooks={setBooks}
                      isDark={isDark}
                      themeColors={themeColors}
                      collections={collections}
                      shoppingList={shoppingList}
                      setShoppingList={setShoppingList}
                      onUpdateBook={updateBook}
                      onDeleteBook={deleteBook}
                    />
                  )}

                  {view === 'highlights' && (
                    <LibraryView
                      view="highlights"
                      books={books}
                      setBooks={setBooks}
                      isDark={isDark}
                      themeColors={themeColors}
                      openQuoteCreator={openQuoteCreator}
                      setSelectedBook={setSelectedBook}
                    />
                  )}

                  {view === 'settings' && (
                    <div className={`max-w-3xl mx-auto p-8 rounded-lg shadow-lg ${themeColors.card}`}>
                      <h2 className={`text-3xl font-bold mb-8 flex items-center gap-3 ${themeColors.text}`}>
                        <Settings size={32} />
                        Ayarlar ve Özelleştirme
                      </h2>

                      <div className="space-y-10">
                        <div className="bg-gradient-to-r from-teal-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-dashed border-purple-500/30">
                          <h3 className={`text-xl font-black mb-2 flex items-center gap-2 ${themeColors.text}`}>
                            <Sparkles size={20} className="text-teal-500" /> Çocuk Modu (Kids Mode)
                          </h3>
                          <p className={`text-xs mb-4 opacity-85 leading-relaxed font-semibold ${themeColors.text}`}>
                            Uygulamayı çocuklar için oyunlaştırılmış sanal bahçe, XP ödülleri ve pastel tonlara sahip sadeleştirilmiş bir arayüze dönüştürün.
                          </p>
                          <button
                            onClick={() => {
                              setIsKidsMode(true);
                              setView('library');
                            }}
                            className="px-6 py-3.5 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 text-white rounded-2xl font-black text-xs shadow-lg transition-transform hover:scale-[1.02] flex items-center gap-2"
                          >
                            <Sparkles size={16} />
                            <span>Çocuk Modunu Aktifleştir!</span>
                          </button>
                        </div>

                        <div>
                          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${themeColors.text}`}>
                            <LayoutGrid size={24} /> Tema Seçimi
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {[
                              { id: 'oak', name: 'Meşe', color: '#E6CCB2' },
                              { id: 'walnut', name: 'Ceviz', color: '#3E2723' },
                              { id: 'white', name: 'Beyaz', color: '#FFFFFF' },
                              { id: 'dark', name: 'Karanlık', color: '#1A1A1A' },
                              { id: 'midnight', name: 'Gece Yarısı', color: '#020617' },
                              { id: 'forest', name: 'Orman', color: '#022C22' },
                              { id: 'paper', name: 'Kağıt', color: '#F5EAD2' }
                            ].map(t => (
                              <div
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-2 transition-all hover:scale-105 ${theme === t.id ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20' : 'border-transparent hover:bg-black/5'} ${themeColors.card}`}
                              >
                                <div className="w-10 h-10 rounded-full border shadow-inner" style={{ backgroundColor: t.color }}></div>
                                <span className={`text-xs font-bold leading-tight text-center ${themeColors.text}`}>{t.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${themeColors.text}`}>
                            <Type size={24} /> Yazı Tipi
                          </h3>
                          <div className="flex gap-4">
                            {['sans', 'serif', 'mono'].map(f => (
                              <button
                                key={f}
                                onClick={() => setFont(f)}
                                className={`px-6 py-3 rounded-lg border-2 ${font === f ? 'border-[#7B3F3F] bg-[#7B3F3F] text-white' : `border-current ${themeColors.text}`} font-${f}`}
                              >
                                {f === 'sans' ? 'Modern (Sans)' : f === 'serif' ? 'Klasik (Serif)' : 'Teknik (Mono)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${themeColors.text}`}>
                            <Clock size={24} /> Tema Zamanlayıcı (Gece Modu)
                          </h3>
                          <div className={`p-5 rounded-xl border flex flex-col gap-4 bg-black/5 ${themeColors.border}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className={`font-bold text-sm ${themeColors.text}`}>Otomatik Tema Zamanlayıcı</h4>
                               <p className="text-xs opacity-75">Belirlenen saatler arasında koyu temayı otomatik uygula.</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={scheduleActive}
                                onChange={(e) => setScheduleActive(e.target.checked)}
                                className="w-5 h-5 cursor-pointer accent-[#7B3F3F]"
                              />
                            </div>

                            {scheduleActive && (
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-400/20">
                                <div>
                                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Başlangıç Saati (Karanlık)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={scheduleStart}
                                    onChange={(e) => setScheduleStart(Number(e.target.value))}
                                    className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Bitiş Saati (Aydınlık)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={scheduleEnd}
                                    onChange={(e) => setScheduleEnd(Number(e.target.value))}
                                    className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${themeColors.text}`}>
                            <Bell size={24} /> Günlük Okuma Hatırlatıcı
                          </h3>
                          <div className={`p-5 rounded-xl border flex flex-col gap-4 bg-black/5 ${themeColors.border}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className={`font-bold text-sm ${themeColors.text}`}>Günlük Hatırlatıcı Bildirimler</h4>
                                <p className="text-xs opacity-75">Okuma rutininizi sürdürmek için günlük hatırlatma bildirimleri alın.</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={remindersEnabled}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (checked) {
                                    Notification.requestPermission().then(permission => {
                                      if (permission === 'granted') {
                                        setRemindersEnabled(true);
                                      } else {
                                        alert("Bildirim izni reddedildi!");
                                        setRemindersEnabled(false);
                                      }
                                    });
                                  } else {
                                    setRemindersEnabled(false);
                                  }
                                }}
                                className="w-5 h-5 cursor-pointer accent-[#7B3F3F]"
                              />
                            </div>

                            {remindersEnabled && (
                              <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-400/20">
                                <span className={`text-sm font-bold ${themeColors.text}`}>Hatırlatma Saati</span>
                                <input
                                  type="time"
                                  value={reminderTime}
                                  onChange={(e) => setReminderTime(e.target.value)}
                                  className={`p-2 border-2 rounded text-xs font-bold ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${themeColors.text}`}>
                            <Download size={24} /> Veri Yönetimi
                          </h3>
                          <div className="flex gap-4">
                            <button onClick={exportData} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#388E3C] text-white hover:bg-[#2E7D32]">
                              <Download size={20} /> Yedeği İndir (JSON)
                            </button>
                            <label className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1976D2] text-white hover:bg-[#1565C0] cursor-pointer">
                              <Upload size={20} /> Yedeği Yükle
                              <input type="file" accept=".json" onChange={importData} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reader Activity Right Sidebar */}
              <div className={`hidden xl:flex w-72 p-6 flex-col gap-4 border-l h-screen overflow-y-auto flex-shrink-0 ${themeColors.sidebar} ${themeColors.border}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider opacity-70 ${themeColors.text}`}>Okur Aktivitesi</h3>
                <div className="space-y-4">
                  {circleUsers.filter(u => u.followed).map(user => (
                    <div key={user.username} className="flex gap-3 text-xs leading-tight">
                      <span className="text-2xl flex-shrink-0">{user.avatar}</span>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold truncate text-[11px]">{user.name}</span>
                          <span className="text-[8px] opacity-50 flex-shrink-0">3dk önce</span>
                        </div>
                        <p className="text-[10px] opacity-75 truncate flex items-center gap-1">
                          <BookOpen size={10} className="opacity-70" />
                          <span>{user.username === 'zeynep_klasik' ? 'Sefiller' : 'Hobbit'}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[8px] opacity-50">
                          <Flame size={8} className="text-orange-500 fill-orange-500" />
                          <span>{user.streak} Gün Seri</span>
                          <span>•</span>
                          <span>📍 {user.city}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating Return to Mobile Button for narrow screens in forced desktop mode */}
              <button
                onClick={() => {
                  changeLayoutMode('mobile');
                  setMobileTab('now-reading');
                  setView('library');
                }}
                className="md:hidden fixed bottom-6 right-6 z-50 bg-[#7B3F3F] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 text-xs font-bold"
                style={{ boxShadow: '0 8px 24px rgba(123, 63, 63, 0.4)' }}
              >
                <Smartphone size={16} />
                <span>Mobil Sürüme Dön</span>
              </button>
            </div>
          </div>
        ) : (
          /* REAL MOBILE VIEW */
          <div className={`flex-1 flex flex-col min-h-screen relative pb-24 transition-colors ${themeColors.bg} ${themeColors.text}`}>
            <div className="flex-grow overflow-y-auto px-4 pb-28 pt-6">
              {mobileTab === 'now-reading' && (
                <div className="animate-fade-in">
                  <h1 className="text-3xl font-extrabold pb-4 tracking-tight">Şimdi Oku</h1>

                  {/* Daily Goal Progress */}
                  <div
                    onClick={() => { setMobileTab('stats'); setMobileStatsSubTab('goals'); }}
                    className={`p-4 rounded-2xl mb-4 border flex items-center gap-4 cursor-pointer hover:bg-black/5 active:scale-[0.98] transition-all ${isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-[#e8dcc8]/40 border-[#c8a882]/40'}`}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-15 text-orange-500" />
                        <circle
                          cx="24" cy="24" r="21"
                          stroke="currentColor" strokeWidth="4" fill="none"
                          strokeDasharray={132}
                          strokeDashoffset={132 - (Math.min(streakData.dailyProgress?.minutes || 0, readingGoal) / readingGoal) * 132}
                          className="text-orange-500"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{Math.round(((streakData.dailyProgress?.minutes || 0) / readingGoal) * 100)}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase opacity-75">Günlük Hedef</h4>
                      <p className="text-sm font-semibold mt-0.5">{streakData.dailyProgress?.minutes || 0} / {readingGoal} dk okundu</p>
                    </div>
                  </div>

                  {/* Active Book */}
                  {(() => {
                    const activeLibBook = books.find(b => b.status === 'reading') || books[0];
                    if (!activeLibBook) return <p className="text-xs opacity-60">Kitaplık boş.</p>;
                    return (
                      <div className={`p-4 rounded-2xl mb-4 border relative overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-white border-zinc-200 shadow-sm'}`}>
                        <div className="flex gap-4">
                          <div
                            className="w-16 h-24 rounded shadow-md flex-shrink-0"
                            style={{
                              backgroundColor: activeLibBook.cover,
                              backgroundImage: activeLibBook.coverImage ? `url(${activeLibBook.coverImage})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              border: '1px solid rgba(0,0,0,0.1)'
                            }}
                          />
                          <div className="flex-grow min-w-0">
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Şu An Okunuyor</span>
                            <h3 className="font-extrabold text-base truncate mt-0.5 leading-snug">{activeLibBook.title}</h3>
                            <p className="text-xs opacity-75 truncate mt-0.5 leading-none">{activeLibBook.author}</p>
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-[10px] font-bold opacity-60">Sayfa {activeLibBook.currentPage} / {activeLibBook.totalPages || '-'}</span>
                              <span className="text-[10px] font-bold text-green-500">{activeLibBook.totalPages ? Math.round((activeLibBook.currentPage / activeLibBook.totalPages) * 100) : 0}%</span>
                            </div>
                            {activeLibBook.totalPages > 0 && (
                              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${(activeLibBook.currentPage / activeLibBook.totalPages) * 100}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedBook(activeLibBook)}
                          className="w-full mt-4 py-2.5 bg-[#7B3F3F] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Okumaya Devam Et
                        </button>
                      </div>
                    );
                  })()}

                  {/* Daily Quote widget */}
                  {(() => {
                    const dailyQuoteInfo = getQuoteOfTheDay();
                    if (!dailyQuoteInfo) return null;
                    return (
                      <div className={`p-4 rounded-2xl mb-4 border flex items-center justify-between gap-2 ${isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-[#e8dcc8]/30 border-[#c8a882]/30'}`}>
                        <button
                          onClick={() => setActiveQuoteIndex(prev => prev - 1)}
                          className="p-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <div className="flex-1 text-center px-2">
                          <p className="font-serif italic text-xs leading-relaxed">"{dailyQuoteInfo.quote}"</p>
                          <p className="text-[9px] mt-1 opacity-70">— {dailyQuoteInfo.book?.title}</p>
                        </div>
                        <button
                          onClick={() => setActiveQuoteIndex(prev => prev + 1)}
                          className="p-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {mobileTab === 'library' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-extrabold tracking-tight">Kitaplığım</h1>
                    <div className="flex items-center gap-2">
                      {/* Segmented Control for Layout Modes on Mobile */}
                      <div className={`p-0.5 rounded-lg flex items-center border text-[10px] ${isDark ? 'bg-[#2D2620] border-[#4A3B2F]' : 'bg-[#E8DCC8] border-[#C8A882]'}`}>
                        <button
                          onClick={() => setLibraryLayoutMode('cover')}
                          className={`p-1.5 rounded font-bold transition-all flex items-center justify-center ${libraryLayoutMode === 'cover' ? 'bg-[#7B3F3F] text-white shadow-sm' : 'opacity-65'}`}
                          title="Kapak Görünümü"
                        >
                          <LayoutGrid size={12} />
                        </button>
                        <button
                          onClick={() => setLibraryLayoutMode('spine')}
                          className={`p-1.5 rounded font-bold transition-all flex items-center justify-center ${libraryLayoutMode === 'spine' ? 'bg-[#7B3F3F] text-white shadow-sm' : 'opacity-65'}`}
                          title="Sırt Görünümü"
                        >
                          <AlignJustify size={12} className="rotate-90" />
                        </button>
                      </div>
                      <button
                        onClick={() => setShowAddBook(true)}
                        className="p-2 bg-[#7B3F3F] text-white rounded-full flex items-center justify-center shadow"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mb-4">
                    <button
                      onClick={() => setMobileLibSubTab('shelf')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${mobileLibSubTab === 'shelf' ? 'bg-[#7B3F3F] text-white border-[#7B3F3F]' : 'border-gray-400/20'}`}
                    >
                      Raf
                    </button>
                    <button
                      onClick={() => setMobileLibSubTab('wishlist')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${mobileLibSubTab === 'wishlist' ? 'bg-[#7B3F3F] text-white border-[#7B3F3F]' : 'border-gray-400/20'}`}
                    >
                      İstek Listesi
                    </button>
                  </div>

                  {mobileLibSubTab === 'shelf' ? (
                    <LibraryView
                      view="library"
                      books={books}
                      setBooks={setBooks}
                      isDark={isDark}
                      themeColors={themeColors}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      filterGenre={filterGenre}
                      setFilterGenre={setFilterGenre}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      activeCollection={activeCollection}
                      setActiveCollection={setActiveCollection}
                      libraryFilter={libraryFilter}
                      setLibraryFilter={setLibraryFilter}
                      filteredBooks={filteredBooks}
                      is3DMode={is3DMode}
                      setIs3DMode={setIs3DMode}
                      libraryLayoutMode={libraryLayoutMode}
                      shelfOrnaments={shelfOrnaments}
                      setShelfOrnaments={setShelfOrnaments}
                      collections={collections}
                      setCollections={setCollections}
                      createCollection={createCollection}
                      onUpdateCollection={toggleBookInCollection}
                      handleDragOver={handleDragOver}
                      handleDrop={handleDrop}
                      onReorderBooks={reorderBooks}
                      getQuoteOfTheDay={getQuoteOfTheDay}
                      setActiveQuoteIndex={setActiveQuoteIndex}
                      openQuoteCreator={openQuoteCreator}
                      selectedBook={selectedBook}
                      setSelectedBook={setSelectedBook}
                      onOpenReader={openReader}
                      getAIRecommendations={getAIRecommendations}
                      shoppingList={shoppingList}
                      setShoppingList={setShoppingList}
                      onUpdateBook={updateBook}
                      onDeleteBook={deleteBook}
                      storeEbookFile={storeEbookFile}
                      deleteEbookFile={deleteEbookFile}
                      handleImageUpload={handleImageUpload}
                    />
                  ) : (
                    <ShoppingListSubView
                      isDark={isDark}
                      themeColors={themeColors}
                      shoppingList={shoppingList}
                      setShoppingList={setShoppingList}
                      books={books}
                      setBooks={setBooks}
                    />
                  )}
                </div>
              )}

              {mobileTab === 'social' && (
                <SocialFeed
                  books={books}
                  setBooks={setBooks}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  streakData={streakData}
                  isDark={isDark}
                  themeColors={themeColors}
                  socialTab={socialTab}
                  setSocialTab={setSocialTab}
                  circleFeed={circleFeed}
                  setCircleFeed={setCircleFeed}
                  savedPosts={savedPosts}
                  setSavedPosts={setSavedPosts}
                  circleUsers={circleUsers}
                  setCircleUsers={setCircleUsers}
                  circleSwaps={circleSwaps}
                  setCircleSwaps={setCircleSwaps}
                  circleClubs={circleClubs}
                  setCircleClubs={setCircleClubs}
                  rtcStatus={rtcStatus}
                  rtcRole={rtcRole}
                  rtcOffer={rtcOffer}
                  rtcAnswer={rtcAnswer}
                  rtcName={rtcName}
                  setupPeerConnection={setupPeerConnection}
                  connectAsHost={connectAsHost}
                  connectAsGuest={connectAsGuest}
                />
              )}

              {mobileTab === 'stats' && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex justify-center gap-2 mb-2">
                    <button
                      onClick={() => setMobileStatsSubTab('charts')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${mobileStatsSubTab === 'charts' ? 'bg-[#7B3F3F] text-white border-[#7B3F3F]' : 'border-gray-400/20'}`}
                    >
                      İstatistikler
                    </button>
                    <button
                      onClick={() => setMobileStatsSubTab('goals')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border ${mobileStatsSubTab === 'goals' ? 'bg-[#7B3F3F] text-white border-[#7B3F3F]' : 'border-gray-400/20'}`}
                    >
                      Hedefler
                    </button>
                  </div>

                  <StatsView
                    books={books}
                    stats={stats}
                    streakData={streakData}
                    themeColors={themeColors}
                    isDark={isDark}
                    genres={genres}
                    annualGoal={annualGoal}
                    setAnnualGoal={setAnnualGoal}
                    readingGoal={readingGoal}
                    setReadingGoal={setReadingGoal}
                    weeklyGoal={weeklyGoal}
                    setWeeklyGoal={setWeeklyGoal}
                    monthlyGoal={monthlyGoal}
                    setOriginalMonthlyGoal={setOriginalMonthlyGoal => null}
                    challengeName={challengeName}
                    setChallengeName={setChallengeName}
                    subView={mobileStatsSubTab === 'charts' ? 'stats' : 'goals'}
                    setShowYearlySummary={setShowYearlySummary}
                    getXPInfo={getXPInfo}
                    getGoalsProgress={getGoalsProgress}
                    getUnlockedBadges={getUnlockedBadges}
                  />
                </div>
              )}

              {mobileTab === 'settings' && (
                <div className="animate-fade-in space-y-6">
                  <h1 className="text-3xl font-extrabold tracking-tight">Ayarlar</h1>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-teal-500/10 via-purple-500/10 to-pink-500/10 p-5 rounded-2xl border border-dashed border-purple-500/30">
                      <h4 className="font-extrabold text-sm mb-1 flex items-center gap-1.5">
                        <Sparkles size={16} className="text-teal-500" /> Çocuk Modu
                      </h4>
                      <p className="text-[10px] opacity-75 mb-3">Çocuklar için oyunlaştırılmış ve XP odaklı arayüze geçiş yapın.</p>
                      <button
                        onClick={() => {
                          setIsKidsMode(true);
                          setMobileTab('now-reading');
                        }}
                        className="w-full py-2 bg-gradient-to-r from-teal-500 to-pink-500 text-white rounded-xl text-xs font-bold"
                      >
                        Çocuk Modunu Aç
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs mb-2">Tema Seçin</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'oak', name: 'Meşe' },
                          { id: 'walnut', name: 'Ceviz' },
                          { id: 'white', name: 'Beyaz' },
                          { id: 'dark', name: 'Karanlık' },
                          { id: 'midnight', name: 'Gece' },
                          { id: 'forest', name: 'Orman' },
                          { id: 'paper', name: 'Kağıt' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`py-2 rounded-lg text-[9px] font-bold border ${theme === t.id ? 'border-orange-500 bg-[#7B3F3F]/10 text-[#7B3F3F] dark:text-[#E1BEE7]' : 'border-gray-400/20'}`}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs mb-2">Yazı Tipi</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sans', name: 'Modern' },
                          { id: 'serif', name: 'Klasik' },
                          { id: 'mono', name: 'Teknik' }
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setFont(f.id)}
                            className={`py-2 rounded-lg text-xs font-bold border font-${f.id} ${font === f.id ? 'border-orange-500 bg-[#7B3F3F]/10 text-[#7B3F3F] dark:text-[#E1BEE7]' : 'border-gray-400/20'}`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tema Zamanlayıcı */}
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-white border-zinc-200 shadow-sm'} flex flex-col gap-3`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs">Tema Zamanlayıcı</h4>
                          <p className="text-[9px] opacity-75">Koyu temayı otomatik uygula.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={scheduleActive}
                          onChange={(e) => setScheduleActive(e.target.checked)}
                          className="w-5 h-5 cursor-pointer accent-[#7B3F3F]"
                        />
                      </div>
                      {scheduleActive && (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed border-gray-400/20">
                          <div>
                            <label className="block text-[9px] font-bold uppercase opacity-75">Karanlık (Saat)</label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={scheduleStart}
                              onChange={(e) => setScheduleStart(Number(e.target.value))}
                              className={`w-full p-2 text-xs border rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase opacity-75">Aydınlık (Saat)</label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={scheduleEnd}
                              onChange={(e) => setScheduleEnd(Number(e.target.value))}
                              className={`w-full p-2 text-xs border rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Günlük Okuma Hatırlatıcı */}
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-white border-zinc-200 shadow-sm'} flex flex-col gap-3`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs">Okuma Hatırlatıcı</h4>
                          <p className="text-[9px] opacity-75">Her gün okuma bildirimi al.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={remindersEnabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              Notification.requestPermission().then(permission => {
                                if (permission === 'granted') {
                                  setRemindersEnabled(true);
                                } else {
                                  alert("Bildirim izni reddedildi!");
                                  setRemindersEnabled(false);
                                }
                              });
                            } else {
                              setRemindersEnabled(false);
                            }
                          }}
                          className="w-5 h-5 cursor-pointer accent-[#7B3F3F]"
                        />
                      </div>
                      {remindersEnabled && (
                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-400/20">
                          <span className="text-xs font-bold">Hatırlatma Saati</span>
                          <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className={`p-1.5 border rounded text-xs font-bold ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-white text-[#654321]'}`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Veri Yönetimi */}
                    <div className="flex gap-2">
                      <button onClick={exportData} className="flex-1 py-3 bg-[#388E3C] text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1.5">
                        <Download size={14} /> Yedeği İndir
                      </button>
                      <label className="flex-1 py-3 bg-[#1976D2] text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer text-center">
                        <Upload size={14} /> Yedeği Yükle
                        <input type="file" accept=".json" onChange={importData} className="hidden" />
                      </label>
                    </div>

                    {/* Return to Desktop Option */}
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <h4 className="font-bold text-xs mb-2">Görünüm Modu</h4>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => changeLayoutMode('desktop')}
                          className={`w-full py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors ${localStorage.getItem('bookshelf_layoutPreference') === 'desktop' ? 'bg-[#7B3F3F] text-white' : 'bg-black/5 dark:bg-white/10'}`}
                        >
                          <Monitor size={14} /> Masaüstü Görünüm (Zorla)
                        </button>
                        <button
                          onClick={() => changeLayoutMode('mobile')}
                          className={`w-full py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors ${localStorage.getItem('bookshelf_layoutPreference') === 'mobile' ? 'bg-[#7B3F3F] text-white' : 'bg-black/5 dark:bg-white/10'}`}
                        >
                          <Smartphone size={14} /> Mobil Görünüm (Zorla)
                        </button>
                        <button
                          onClick={() => changeLayoutMode('auto')}
                          className={`w-full py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors ${!localStorage.getItem('bookshelf_layoutPreference') ? 'bg-[#7B3F3F] text-white' : 'bg-black/5 dark:bg-white/10'}`}
                        >
                          <RefreshCw size={10} /> Otomatik (Ekrana Göre Uyarla)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Apple Liquid Glass Bottom Navigation Bar */}
            <div className="fixed bottom-5 left-4 right-4 h-16 z-40">
              <div
                className="w-full h-full backdrop-blur-xl border flex items-center justify-around px-2 relative rounded-[24px]"
                style={{
                  backgroundColor: isDark ? 'rgba(30, 30, 30, 0.75)' : 'rgba(255, 255, 255, 0.75)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)'
                }}
              >
                {[
                  { tab: 'now-reading', label: 'Şimdi Oku', icon: BookOpen },
                  { tab: 'library', label: 'Kitaplık', icon: Book },
                  { tab: 'social', label: 'Sosyal', icon: Users },
                  { tab: 'stats', label: 'Analiz', icon: TrendingUp },
                  { tab: 'settings', label: 'Ayarlar', icon: Settings }
                ].map(itm => {
                  const IconComponent = itm.icon;
                  return (
                    <button
                      key={itm.tab}
                      onClick={() => {
                        setMobileTab(itm.tab);
                        setView(itm.tab === 'now-reading' || itm.tab === 'library' ? 'library' : itm.tab);
                      }}
                      className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${mobileTab === itm.tab ? 'text-[#7B3F3F] scale-110 font-bold' : 'opacity-50'}`}
                    >
                      <IconComponent size={20} className="mb-0.5" />
                      <span className="text-[9px] font-sans mt-0.5">{itm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}

      {/* GLOBAL MODALS */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-3xl w-full p-8 relative shadow-2xl ${isDark ? 'bg-[#382E26]' : 'bg-[#D4B896]'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Yeni Kitap Ekle</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Kitap Adı</label>
                  <input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Örn: Nutuk"
                    className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Yazar</label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Örn: M. Kemal Atatürk"
                    className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Tür</label>
                    <select
                      value={newBook.genre}
                      onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                      className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Toplam Sayfa</label>
                    <input
                      type="number"
                      value={newBook.totalPages}
                      onChange={(e) => setNewBook({ ...newBook, totalPages: Number(e.target.value) })}
                      placeholder="350"
                      className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Kitap Fiyatı (₺)</label>
                    <input
                      type="number"
                      value={newBook.price || ''}
                      onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
                      placeholder="Örn: 120"
                      className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Kapak Resmi (URL veya Yükle)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBook.coverImage}
                      onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                      placeholder="https://..."
                      className={`flex-1 p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
                    />
                    <label className={`flex items-center justify-center w-12 rounded cursor-pointer transition-colors ${isDark ? 'bg-[#4A3B2F] hover:bg-[#4D4439] text-[#E8D4BA]' : 'bg-[#C8A882] hover:bg-[#B89872] text-[#654321]'}`}>
                      <Upload size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setNewBook, newBook)}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>E-Kitap Dosyası (EPUB / PDF)</label>
                  {newBookFile ? (
                    <div className={`flex items-center justify-between p-2.5 border-2 border-dashed rounded ${isDark ? 'border-[#7B3F3F]/30 bg-[#2D2620]/30' : 'border-[#7B3F3F]/30 bg-white/50'}`}>
                      <span className="text-xs truncate font-mono max-w-[180px]" title={newBookFile.name}>
                        {newBookFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewBookFile(null)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex items-center justify-center gap-2 p-2.5 border-2 border-dashed rounded cursor-pointer transition-all hover:bg-black/5 ${isDark ? 'border-[#4A3B2F] text-[#E8D4BA]' : 'border-[#C8A882] text-[#654321]'}`}>
                      <Upload size={14} className="opacity-80" />
                      <span className="text-xs font-bold">Dosya Seç (PDF, EPUB)</span>
                      <input
                        type="file"
                        accept=".pdf,.epub"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 50 * 1024 * 1024) {
                              alert("Dosya boyutu 50MB'dan küçük olmalıdır!");
                              return;
                            }
                            setNewBookFile(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full justify-between">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Durum</label>
                  <select
                    value={newBook.status}
                    onChange={(e) => setNewBook({ ...newBook, status: e.target.value })}
                    className={`w-full p-2 border-2 rounded ${isDark ? 'border-[#4A3B2F] bg-[#2D2620] text-[#E8D4BA]' : 'border-[#C8A882] bg-[#E8DCC8] text-[#654321]'}`}
                  >
                    <option value="want-to-read">Okunacak</option>
                    <option value="reading">Okunuyor</option>
                    <option value="read">Okundu</option>
                  </select>
                </div>

                <div className="mt-4 flex-grow">
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-[#E8D4BA]' : 'text-[#654321]'}`}>Kapak Rengi</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#7B3F3F', '#904E5C', '#5D4037', '#6B4423', '#8B6F47', '#4A3428', '#2E4053', '#1E8449', '#D4AC0D', '#A04000', '#212121', '#78909C'].map(color => (
                      <button
                        key={color}
                        onClick={() => setNewBook({ ...newBook, cover: color })}
                        className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${newBook.cover === color ? 'border-white ring-2 ring-[#7B3F3F] scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-auto">
                  <button
                    onClick={() => setShowAddBook(false)}
                    className={`flex-1 py-3 border-2 rounded-lg font-semibold transition-colors ${isDark ? 'border-[#4A3B2F] text-[#E8D4BA] hover:bg-[#4A3B2F]' : 'border-[#C8A882] text-[#654321] hover:bg-[#C8A882]'}`}
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={addBook}
                    className="flex-[2] py-3 bg-[#7B3F3F] text-white rounded-lg font-semibold hover:bg-[#5D3030] transition-colors shadow-lg"
                  >
                    Kitabı Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogReading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-md w-full p-6 relative shadow-2xl ${isDark ? 'bg-[#382E26] text-[#E8D4BA]' : 'bg-[#D4B896] text-[#654321]'}`}>
            <button onClick={() => setShowLogReading(false)} className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity">
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock size={24} className="text-[#8D6E63]" />
              Okuma Kaydı Ekle
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Kitap Seçin</label>
                <select
                  value={logSession.bookId}
                  onChange={(e) => setLogSession({ ...logSession, bookId: e.target.value })}
                  className={`w-full p-2.5 border-2 rounded-lg text-sm bg-transparent border-[#8D6E63]/30 focus:border-[#8D6E63] outline-none ${isDark ? 'bg-[#2D2620]' : 'bg-[#E8DCC8]'}`}
                >
                  <option value="" disabled>Kitap Seçin...</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.status === 'reading' ? 'Okunuyor' : b.status === 'read' ? 'Okundu' : 'Beklemede'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Okuma Tipi</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLogSession({ ...logSession, type: 'paper' })}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs border-2 transition-all ${logSession.type === 'paper' ? 'border-[#7B3F3F] bg-[#7B3F3F]/10 text-[#7B3F3F]' : 'border-gray-400/20 opacity-70'}`}
                  >
                    📖 Normal Kitap
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogSession({ ...logSession, type: 'audio' })}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs border-2 transition-all ${logSession.type === 'audio' ? 'border-[#7B3F3F] bg-[#7B3F3F]/10 text-[#7B3F3F]' : 'border-gray-400/20 opacity-70'}`}
                  >
                    🎧 Sesli Kitap
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Süre (Dk)</label>
                  <input
                    type="number"
                    value={logSession.minutes}
                    onChange={(e) => setLogSession({ ...logSession, minutes: e.target.value })}
                    placeholder="30"
                    className={`w-full p-2.5 border-2 rounded-lg text-sm bg-transparent border-[#8D6E63]/30 focus:border-[#8D6E63] outline-none ${isDark ? 'bg-[#2D2620]' : 'bg-[#E8DCC8]'}`}
                  />
                </div>

                {logSession.type === 'paper' && (
                  <div>
                    <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Okunan Sayfa</label>
                    <input
                      type="number"
                      value={logSession.pages}
                      onChange={(e) => setLogSession({ ...logSession, pages: e.target.value })}
                      placeholder="15"
                      className={`w-full p-2.5 border-2 rounded-lg text-sm bg-transparent border-[#8D6E63]/30 focus:border-[#8D6E63] outline-none ${isDark ? 'bg-[#2D2620]' : 'bg-[#E8DCC8]'}`}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Ruh Hali</label>
                <div className="flex justify-between gap-1">
                  {['😊', '😢', '😮', '😴', '🤩', '🧠'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLogSession({ ...logSession, mood: m })}
                      className={`w-10 h-10 text-lg rounded-full flex items-center justify-center transition-all ${logSession.mood === m ? 'bg-orange-500 scale-110 shadow-md ring-2 ring-orange-500/20' : 'hover:bg-black/5 opacity-60'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase opacity-90">Kısa Notlar</label>
                <textarea
                  value={logSession.note}
                  onChange={(e) => setLogSession({ ...logSession, note: e.target.value })}
                  placeholder="Seans ile ilgili aklında kalanlar..."
                  rows="2"
                  className={`w-full p-2.5 border-2 rounded-lg text-sm bg-transparent border-[#8D6E63]/30 focus:border-[#8D6E63] outline-none ${isDark ? 'bg-[#2D2620]' : 'bg-[#E8DCC8]'}`}
                />
              </div>

              <button
                onClick={logReadingTime}
                disabled={!logSession.bookId || !logSession.minutes}
                className="w-full py-3 bg-[#7B3F3F] text-white rounded-lg font-semibold hover:bg-[#5D3030] disabled:opacity-50 disabled:pointer-events-none transition-colors mt-2 shadow-lg"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuoteCreator && quoteToShare && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className={`rounded-lg max-w-5xl w-full p-8 relative shadow-2xl ${themeColors.card} ${themeColors.border} border-2 max-h-[90vh] overflow-y-auto`}>
            <button onClick={() => setShowQuoteCreator(false)} className={`absolute top-4 right-4 ${themeColors.text} opacity-70 hover:opacity-100 transition-opacity`}>
              <X size={24} />
            </button>

            <h2 className={`text-2xl font-bold mb-6 ${themeColors.text}`}>Alıntı Kartı Oluştur</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h3 className={`text-lg font-semibold mb-4 ${themeColors.text}`}>Önizleme</h3>
                <div
                  id="quote-card-preview"
                  className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center p-12 relative"
                  style={{ background: cardConfig.bgValue }}
                >
                  <div className={`${cardConfig.alignment} space-y-6 max-w-lg`}>
                    <p className={`${cardConfig.fontSize} font-serif italic leading-relaxed`} style={{ color: cardConfig.textColor }}>
                      "{quoteToShare}"
                    </p>
                    {cardConfig.showBranding && bookForQuote && (
                      <div className={`text-sm opacity-80 ${cardConfig.alignment}`} style={{ color: cardConfig.textColor }}>
                        <p className="font-semibold">{bookForQuote.title}</p>
                        <p>{bookForQuote.author}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${themeColors.text}`}>Arka Plan</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Sunset', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                      { name: 'Ocean', value: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)' },
                      { name: 'Forest', value: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)' },
                      { name: 'Fire', value: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)' },
                      { name: 'Night', value: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)' },
                      { name: 'Rose', value: 'linear-gradient(135deg, #ED213A 0%, #93291E 100%)' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setCardConfig({ ...cardConfig, bgValue: preset.value })}
                        className={`p-4 rounded-lg border-2 transition-all ${cardConfig.bgValue === preset.value ? 'border-orange-500 scale-105' : 'border-transparent hover:scale-105'}`}
                        style={{ background: preset.value }}
                      >
                        <span className="text-white text-xs font-semibold drop-shadow-lg">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${themeColors.text}`}>Metin Rengi</h3>
                  <div className="flex gap-3">
                    {['#ffffff', '#000000', '#f59e0b'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setCardConfig({ ...cardConfig, textColor: color })}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${cardConfig.textColor === color ? 'border-orange-500 scale-110' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${themeColors.text}`}>Yazı Boyutu</h3>
                  <div className="flex gap-3">
                    {[
                      { label: 'Küçük', value: 'text-xl' },
                      { label: 'Orta', value: 'text-2xl' },
                      { label: 'Büyük', value: 'text-3xl' }
                    ].map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setCardConfig({ ...cardConfig, fontSize: size.value })}
                        className={`px-4 py-2 rounded-lg transition-all ${cardConfig.fontSize === size.value ? themeColors.button : `${themeColors.card} border ${themeColors.border}`}`}
                      >
                        <span className={themeColors.text}>{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardConfig.showBranding}
                      onChange={(e) => setCardConfig({ ...cardConfig, showBranding: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className={themeColors.text}>Kitap bilgilerini göster</span>
                  </label>
                </div>

                <button
                  onClick={handleExportQuoteCard}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={20} /> Metin Kartını İndir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showYearlySummary && (() => {
        const userGenres = books.map(b => b.genre);
        const genreCounts = {};
        userGenres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
        const dominantGenre = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a])[0] || 'Roman';

        const allSessions = books.reduce((acc, b) => acc.concat(b.sessions || []), []);
        const paperSessions = allSessions.filter(s => s.type === 'paper');
        const totalPaperMinutes = paperSessions.reduce((sum, s) => sum + s.minutes, 0);
        const totalPagesRead = paperSessions.reduce((sum, s) => sum + s.pages, 0);
        const averageSpeed = totalPaperMinutes > 0 ? (totalPagesRead / totalPaperMinutes) : 0.5;

        return (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="max-w-sm w-full relative">
              <button
                onClick={() => setShowYearlySummary(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-black/40 p-2 rounded-full z-10"
              >
                <X size={24} />
              </button>

              <div
                id="yearly-summary-card"
                className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E0B0B] via-[#2D1616] to-[#0D0404] text-white p-6 shadow-2xl relative border border-orange-500/20 aspect-[9/16] flex flex-col justify-between"
                style={{ minHeight: '520px' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">Okuma Kilometre Taşı</span>
                    <span className="text-xs opacity-60 font-semibold">{new Date().getFullYear()} Özeti</span>
                  </div>

                  <div className="pt-2">
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">OKUMA SERÜVENİM</h2>
                    <p className="text-xs opacity-80 mt-1 font-serif">Kelimelerin izinde bir yıl...</p>
                  </div>
                </div>

                <div className="space-y-4 my-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-bold opacity-60">Okunan Kitap</span>
                      <span className="text-2xl font-black text-orange-400 mt-1">{stats.read}</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                      <span className="text-[9px] uppercase font-bold opacity-60">Toplam Sayfa</span>
                      <span className="text-2xl font-black text-red-400 mt-1">{stats.totalPages}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold opacity-60">Favori Türün</span>
                      <h4 className="font-extrabold text-lg mt-0.5 text-purple-400 truncate max-w-[150px]">{dominantGenre}</h4>
                    </div>
                    <Book size={24} className="text-purple-400 opacity-80" />
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold opacity-60">Ortalama Hızın</span>
                      <h4 className="font-extrabold text-lg mt-0.5 text-emerald-400">{averageSpeed.toFixed(2)} sf/dk</h4>
                    </div>
                    <TrendingUp size={24} className="text-emerald-400 opacity-80" />
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold opacity-60">En Uzun Seri</span>
                      <h4 className="font-extrabold text-lg mt-0.5 text-yellow-400">{(streakData.longestStreak || streakData.streak) || 0} Gün</h4>
                    </div>
                    <Flame size={24} className="text-yellow-500 fill-yellow-500/20 opacity-90" />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs opacity-75">
                    <BookOpen size={16} className="text-orange-400" />
                    <span className="font-bold">BookCircle</span>
                  </div>
                  <button
                    onClick={() => {
                      const container = document.getElementById('yearly-summary-card');
                      if (container && window.html2canvas) {
                        window.html2canvas(container, {
                          backgroundColor: null,
                          useCORS: true,
                          scale: 2
                        }).then(canvas => {
                          const link = document.createElement('a');
                          link.download = 'okuma-yillik-ozet.png';
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                        }).catch(err => console.error('Error generating image', err));
                      }
                    }}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-black font-extrabold rounded-lg text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg active:scale-95"
                  >
                    <span>KAYDET / PAYLAŞ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {showShareLibrary && (() => {
        const bookTitles = books.slice(0, 5).map(b => b.title).join(', ');
        const shareText = `Kütüphanemi keşfet! (${books.length} kitap, ${stats.read} okunmuş). En son okuduklarım: ${bookTitles}...`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareText)}`;

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl max-w-sm w-full p-6 relative shadow-2xl ${isDark ? 'bg-[#382E26] text-[#E8D4BA]' : 'bg-[#D4B896] text-[#654321]'}`}>
              <button onClick={() => setShowShareLibrary(false)} className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity">
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Share2 size={24} className="text-[#8D6E63]" />
                Kütüphanemi Paylaş
              </h2>

              <div className="space-y-4 text-center">
                <p className="text-xs opacity-80">Arkadaşların kütüphaneni tarayarak okuduğun kitapları görebilir!</p>

                <div className="bg-white p-3 rounded-lg inline-block shadow-inner mx-auto border border-gray-400/20">
                  <img src={qrUrl} alt="Library Share QR Code" className="w-48 h-48 mx-auto" />
                </div>

                <div className={`p-3 rounded-lg text-xs text-left italic border leading-relaxed bg-black/5 border-[#8D6E63]/25`}>
                  "{shareText}"
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    alert('Kütüphane bilgisi panoya kopyalandı!');
                  }}
                  className="w-full py-2.5 bg-[#7B3F3F] text-white rounded-lg font-semibold hover:bg-[#5D3030] transition-colors"
                >
                  Metni Kopyala
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdate={updateBook}
          onDelete={deleteBook}
          isDark={isDark}
          themeColors={themeColors}
          collections={collections}
          onUpdateCollection={toggleBookInCollection}
          onShareQuote={openQuoteCreator}
          onOpenReader={openReader}
          storeEbookFile={storeEbookFile}
          deleteEbookFile={deleteEbookFile}
          handleImageUpload={handleImageUpload}
        />
      )}

      {readerModalOpen && activeReaderBook && readerFileContent && (
        <EBookReader
          book={activeReaderBook}
          file={readerFileContent}
          fileType={readerFileType}
          isDark={isDark}
          themeColors={themeColors}
          rtcStatus={rtcStatus}
          rtcChannel={rtcChannel}
          rtcChatHistory={rtcChatHistory}
          rtcName={rtcName}
          onSendRtcMessage={onSendRtcMessage}
          onClose={(minutesRead, finalPage) => {
            if (minutesRead > 0) {
              const today = new Date().toLocaleDateString('tr-TR');
              const newSession = {
                id: Date.now(),
                date: today,
                minutes: minutesRead,
                pages: Math.max(0, finalPage - (activeReaderBook.currentPage || 0)),
                type: 'paper',
                mood: '😊'
              };

              const isFinished = finalPage >= activeReaderBook.totalPages;
              const updatedSessions = [...(activeReaderBook.sessions || []), newSession];
              updateBook(activeReaderBook.id, {
                currentPage: finalPage,
                sessions: updatedSessions,
                status: isFinished ? 'read' : 'reading'
              });

              if (isFinished && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }

              setCircleFeed([{
                id: Date.now(),
                username: userProfile.username,
                name: userProfile.name,
                avatar: '📖',
                type: isFinished ? 'finish' : 'thought',
                text: isFinished
                  ? `${activeReaderBook.title} kitabını bitirdi! 🥳`
                  : `${activeReaderBook.title} kitabından ${newSession.pages} sayfa okudu!`,
                timestamp: 'Şimdi',
                likes: 0,
                liked: false,
                comments: [],
                bookTitle: activeReaderBook.title,
                bookAuthor: activeReaderBook.author
              }, ...circleFeed]);

              if (isKidsMode) {
                const earnedXp = newSession.pages * 2 + minutesRead * 5;
                setKidsXp(prev => prev + earnedXp);
                if (navigator.vibrate) {
                  navigator.vibrate([100, 50, 100]);
                }
                alert(`Okuman tamamlandı! 🎉\n${newSession.pages} sayfa ve ${minutesRead} dakika için ${earnedXp} XP kazandın!`);
              }
            }

            setReaderModalOpen(false);
            setActiveReaderBook(null);
            setReaderFileContent(null);
          }}
          onUpdateProgress={(pageNum, totalPages) => {
            updateBook(activeReaderBook.id, {
              currentPage: pageNum,
              totalPages: totalPages
            });
          }}
          onAddHighlight={(text) => {
            addHighlight(activeReaderBook.id, text);
          }}
        />
      )}
    </div>
  );
};

export default App;
