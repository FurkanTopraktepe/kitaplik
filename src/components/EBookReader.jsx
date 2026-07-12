import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Quote, MessageSquare } from 'lucide-react';

const EBookReader = ({
  book,
  file,
  fileType,
  onClose,
  onUpdateProgress,
  onAddHighlight,
  isDark,
  themeColors,
  rtcStatus,
  rtcChannel,
  rtcChatHistory,
  rtcName,
  onSendRtcMessage
}) => {
  const [pageNum, setPageNum] = useState(book.currentPage || 1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [epubRendition, setEpubRendition] = useState(null);
  const [fontSize, setFontSize] = useState(100); // percent
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showRtcDrawer, setShowRtcDrawer] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const epubContainerRef = useRef(null);
  const pdfjsLib = window.pdfjsLib;
  const ePub = window.ePub;

  // Timer to track reading seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load File
  useEffect(() => {
    if (!file) return;

    let blobUrl;

    if (fileType === 'pdf') {
      file.arrayBuffer().then(buffer => {
        const typedArray = new Uint8Array(buffer);
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        loadingTask.promise.then(pdf => {
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          const startPage = Math.min(Math.max(book.currentPage || 1, 1), pdf.numPages);
          setPageNum(startPage);
          renderPdfPage(pdf, startPage, scale);
        }).catch(err => {
          console.error("PDF loading error:", err);
          alert("PDF yüklenirken bir hata oluştu.");
        });
      }).catch(err => {
        console.error("PDF arrayBuffer error:", err);
        alert("PDF okunurken bir hata oluştu.");
      });
    } else if (fileType === 'epub') {
      try {
        blobUrl = URL.createObjectURL(file);
        const epubBook = ePub(blobUrl);
        epubBook.ready.then(() => {
          if (!epubContainerRef.current) return;
          const rendition = epubBook.renderTo(epubContainerRef.current, {
            width: "100%",
            height: "100%",
            flow: "paginated",
            stylesheet: isDark ? 'p { color: #E8D4BA !important; }' : 'p { color: #333333 !important; }'
          });
          setEpubRendition(rendition);
          rendition.display();

          // Sizing styling
          rendition.themes.fontSize(`${fontSize}%`);

          // Selection listener
          rendition.on("selected", (cfiRange, contents) => {
            const selectedText = rendition.getRange(cfiRange).toString();
            if (selectedText && selectedText.trim()) {
              if (confirm(`Seçilen metni alıntı olarak eklemek ister misiniz?\n\n"${selectedText}"`)) {
                onAddHighlight(selectedText);
              }
            }
          });

          // Relocated page tracker
          rendition.on("relocated", (location) => {
            if (location.start) {
              const percentage = location.start.percentage;
              const estimatedPage = Math.round(percentage * (book.totalPages || 300)) || 1;
              setPageNum(estimatedPage);
              onUpdateProgress(estimatedPage, book.totalPages || 300);
              if (rtcChannel && rtcStatus === 'connected') {
                rtcChannel.send(JSON.stringify({ type: 'PAGE_CHANGE', page: estimatedPage }));
              }
            }
          });
        }).catch(err => {
          console.error("EPUB ready parsing error:", err);
          alert("EPUB dosyası çözümlenemedi.");
        });
      } catch (err) {
        console.error("EPUB loading error:", err);
        alert("EPUB yüklenirken bir hata oluştu.");
      }
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file, fileType]);

  // WebRTC Remote Page Synchronization Listener
  useEffect(() => {
    const handleRtcPage = (e) => {
      const targetPage = e.detail;
      if (fileType === 'pdf' && pdfDoc) {
        setPageNum(targetPage);
        renderPdfPage(pdfDoc, targetPage, scale);
      } else if (fileType === 'epub' && epubRendition) {
        const percentage = targetPage / (book.totalPages || 300);
        const cfi = epubRendition.book.locations.cfiFromPercentage(percentage);
        if (cfi) epubRendition.display(cfi);
      }
    };
    window.addEventListener('rtcPageChange', handleRtcPage);
    return () => window.removeEventListener('rtcPageChange', handleRtcPage);
  }, [fileType, pdfDoc, epubRendition, scale]);

  // Render PDF page on canvas
  const renderPdfPage = (pdf, pageNumber, currentScale) => {
    if (!pdf) return;
    pdf.getPage(pageNumber).then(page => {
      const canvas = document.getElementById('pdf-render-canvas');
      if (!canvas) return;
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: currentScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext);

      // Update progress
      onUpdateProgress(pageNumber, pdf.numPages);
    });
  };

  // Zoom PDF
  const changeZoom = (delta) => {
    const newScale = Math.min(Math.max(scale + delta, 0.6), 2.5);
    setScale(newScale);
    if (pdfDoc) {
      renderPdfPage(pdfDoc, pageNum, newScale);
    }
  };

  // Navigate PDF Pages
  const handlePdfPageChange = (delta) => {
    if (!pdfDoc) return;
    const newPage = Math.min(Math.max(pageNum + delta, 1), numPages);
    setPageNum(newPage);
    renderPdfPage(pdfDoc, newPage, scale);
    if (rtcChannel && rtcStatus === 'connected') {
      rtcChannel.send(JSON.stringify({ type: 'PAGE_CHANGE', page: newPage }));
    }
  };

  // Navigate EPUB
  const handleEpubNav = (direction) => {
    if (!epubRendition) return;
    if (direction === 'next') {
      epubRendition.next();
    } else {
      epubRendition.prev();
    }
  };

  // EPUB Font sizing
  const changeFontSize = (delta) => {
    const newSize = Math.min(Math.max(fontSize + delta, 60), 200);
    setFontSize(newSize);
    if (epubRendition) {
      epubRendition.themes.fontSize(`${newSize}%`);
    }
  };

  const handleCloseReader = () => {
    const minutesRead = Math.max(1, Math.round(elapsedSeconds / 60));
    onClose(minutesRead, pageNum);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const addNoteHighlight = () => {
    if (noteText.trim()) {
      onAddHighlight(noteText.trim());
      setNoteText('');
      alert("Alıntı başarıyla eklendi!");
      setShowNotesDrawer(false);
    }
  };

  const paperSessions = (book.sessions || []).filter(s => s.type === 'paper');
  const minutesRead = elapsedSeconds / 60;
  const pagesRead = Math.max(0, pageNum - (book.currentPage || 1));
  const totalPagesLogged = paperSessions.reduce((sum, s) => sum + (s.pages || 0), 0) + pagesRead;
  const totalMinutesLogged = paperSessions.reduce((sum, s) => sum + (s.minutes || 0), 0) + minutesRead;
  const bookSpeed = totalMinutesLogged > 0 ? (totalPagesLogged / totalMinutesLogged) : 0.5;
  const remainingPages = Math.max(0, (book.totalPages || 300) - pageNum);
  const remainingMinutes = remainingPages > 0 ? (remainingPages / bookSpeed) : 0;

  const formatMinutesLeft = (mins) => {
    if (mins <= 0) return "Bitti";
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col z-50 animate-fade-in text-white font-sans">
      {/* Reader Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/90 backdrop-blur-md">
        <div>
          <h2 className="font-bold text-sm truncate max-w-[200px] sm:max-w-md">{book.title}</h2>
          <p className="text-[10px] opacity-60 truncate">
            {book.author} • {fileType.toUpperCase()} • Kalan Süre: {formatMinutesLeft(remainingMinutes)} ({bookSpeed.toFixed(2)} sf/dk)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs bg-black/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold font-mono">
            <span>⏱️</span>
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          {rtcStatus === 'connected' && (
            <button
              onClick={() => setShowRtcDrawer(!showRtcDrawer)}
              className={`p-2 hover:bg-white/10 rounded-full transition-colors relative ${showRtcDrawer ? 'text-green-400 bg-white/10' : ''}`}
              title="Canlı Sohbet & Kulüp"
            >
              <MessageSquare size={18} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </button>
          )}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
            title="Alıntı Ekle"
          >
            <Quote size={18} />
          </button>
          <button
            onClick={handleCloseReader}
            className="p-2 hover:bg-white/10 rounded-full transition-colors bg-red-600/30 text-red-400 hover:text-white"
            title="Kapat ve Kaydet"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Reader Content Pane */}
      <div className="flex-grow flex overflow-hidden bg-black relative">
        <div className="flex-1 overflow-hidden relative flex justify-center bg-black">
          {fileType === 'pdf' ? (
            <div className="w-full h-full overflow-auto flex justify-center p-4">
              <canvas id="pdf-render-canvas" className="shadow-2xl max-w-full bg-white"></canvas>
            </div>
          ) : (
            <div className="w-full h-full max-w-3xl px-4 flex flex-col justify-center">
              <div ref={epubContainerRef} id="epub-viewer-container" className="w-full h-[75vh] min-h-[500px] overflow-hidden bg-zinc-950 rounded-2xl p-4 my-4"></div>
            </div>
          )}

          {/* Float E-Reader Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-900/95 border border-white/15 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-md z-10 text-xs">
            {fileType === 'pdf' ? (
              <>
                <button onClick={() => handlePdfPageChange(-1)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold min-w-[60px] text-center">
                  {pageNum} / {numPages || '-'}
                </span>
                <button onClick={() => handlePdfPageChange(1)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <ChevronRight size={16} />
                </button>
                <span className="w-px h-4 bg-white/20"></span>
                <button onClick={() => changeZoom(-0.1)} className="p-1.5 hover:bg-white/10 rounded-lg" title="Küçült">
                  -
                </button>
                <span className="font-mono text-[10px]">{Math.round(scale * 100)}%</span>
                <button onClick={() => changeZoom(0.1)} className="p-1.5 hover:bg-white/10 rounded-lg" title="Büyüt">
                  +
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleEpubNav('prev')} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-bold min-w-[60px] text-center">
                  İlerleme: {pageNum} sf
                </span>
                <button onClick={() => handleEpubNav('next')} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <ChevronRight size={16} />
                </button>
                <span className="w-px h-4 bg-white/20"></span>
                <button onClick={() => changeFontSize(-10)} className="p-1.5 hover:bg-white/10 rounded-lg" title="Yazıyı Küçült">
                  A-
                </button>
                <span className="font-mono text-[10px]">{fontSize}%</span>
                <button onClick={() => changeFontSize(10)} className="p-1.5 hover:bg-white/10 rounded-lg" title="Yazıyı Büyüt">
                  A+
                </button>
              </>
            )}
          </div>
        </div>

        {/* WebRTC Live Chat Sidebar */}
        {rtcStatus === 'connected' && showRtcDrawer && (
          <div className="w-80 h-full border-l border-white/15 bg-zinc-950 flex flex-col flex-shrink-0 animate-fade-in font-sans text-xs">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold flex items-center gap-1.5 text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                  <span>Canlı Okuma Odası</span>
                </h3>
                <p className="text-[10px] opacity-60">@{rtcName} ile bağlantıda</p>
              </div>
              <button onClick={() => setShowRtcDrawer(false)} className="text-white/60 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {rtcChatHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center opacity-40 italic">
                  Henüz mesaj yok.<br />Ortak okuma esnasında buradan yazışabilirsiniz.
                </div>
              ) : (
                rtcChatHistory.map((chat, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center opacity-60 text-[9px] font-bold">
                      <span>{chat.sender}</span>
                      <span>{chat.timestamp}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 leading-relaxed break-words">
                      {chat.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-white/10 bg-zinc-900/40">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mesaj yazın..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      onSendRtcMessage(chatInput.trim());
                      setChatInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl outline-none focus:border-green-500 text-xs text-white"
                />
                <button
                  onClick={() => {
                    if (chatInput.trim()) {
                      onSendRtcMessage(chatInput.trim());
                      setChatInput('');
                    }
                  }}
                  className="px-3 bg-[#7B3F3F] hover:bg-[#5D3030] text-white font-bold rounded-xl transition-colors"
                >
                  Gönder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Drawer */}
        {showNotesDrawer && (
          <div className="absolute right-4 top-20 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-20 animate-fade-in flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h4 className="font-bold text-xs">Bu Sayfadan Alıntı Ekle</h4>
              <button onClick={() => setShowNotesDrawer(false)} className="text-zinc-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Seçtiğin veya beğendiğin bir cümleyi buraya yaz..."
              rows="4"
              className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs outline-none focus:border-[#7B3F3F]"
            />
            <button
              onClick={addNoteHighlight}
              disabled={!noteText.trim()}
              className="w-full py-2 bg-[#7B3F3F] text-white hover:bg-[#5D3030] disabled:opacity-50 disabled:pointer-events-none rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Kaydet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EBookReader;
