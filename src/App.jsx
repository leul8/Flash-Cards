import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const containerRef = useRef(null);
  const words = ['Information', 'Apple', 'Computer', 'Program', 'Nature', 'Science', 'Music', 'Travel'];

  useEffect(() => {
    async function loadDeck() {
      const cards = await Promise.all(
        words.map(async word => {
          try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const [entry] = await res.json();
            const defObj = entry.meanings?.[0]?.definitions?.[0];
            return {
              id: word,
              question: word,
              answer: defObj?.definition || 'No definition found.',
            };
          } catch {
            return { id: word, question: word, answer: 'Definition unavailable.' };
          }
        })
      );
      setFlashcards(cards);
      setCurrentIndex(0);
      setShowAnswer(false);
      setShowHint(false);
    }
    loadDeck();

    const onFullScreenChange = () => {
      const fs =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fs);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    document.addEventListener('webkitfullscreenchange', onFullScreenChange);
    document.addEventListener('mozfullscreenchange', onFullScreenChange);
    document.addEventListener('MSFullscreenChange', onFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullScreenChange);
      document.removeEventListener('mozfullscreenchange', onFullScreenChange);
      document.removeEventListener('MSFullscreenChange', onFullScreenChange);
    };
  }, []);

  const total = flashcards.length;

  useEffect(() => {
    if (!isPlaying || total === 0) return;
    const iv = setInterval(() => {
      setCurrentIndex(i => (i + 1) % total);
      setShowAnswer(false);
      setShowHint(false);
    }, 3000);
    return () => clearInterval(iv);
  }, [isPlaying, total]);

  const toggleFavorite = () => setIsFavorite(f => !f);
  const togglePlay = () => setIsPlaying(p => !p);
  const toggleHint = () => setShowHint(h => !h);
  const toggleAnswer = () => setShowAnswer(a => !a);

  const goPrev = () => {
    if (total === 0) return;
    setCurrentIndex(i => (i > 0 ? i - 1 : total - 1));
    setShowAnswer(false);
    setShowHint(false);
  };
  const goNext = () => {
    if (total === 0) return;
    setCurrentIndex(i => (i + 1) % total);
    setShowAnswer(false);
    setShowHint(false);
  };
  const shuffle = () => {
    if (total === 0) return;
    const r = Math.floor(Math.random() * total);
    setCurrentIndex(r);
    setShowAnswer(false);
    setShowHint(false);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!isFullscreen) {
      (el.requestFullscreen ||
       el.webkitRequestFullscreen ||
       el.mozRequestFullScreen ||
       el.msRequestFullscreen
      )?.call(el);
    } else {
      (document.exitFullscreen ||
       document.webkitExitFullscreen ||
       document.mozCancelFullScreen ||
       document.msExitFullscreen
      )?.call(document);
    }
  };

  const card = flashcards[currentIndex] || {};

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center min-h-screen bg-gray-100 p-6"
    >
      <div className="bg-white shadow-lg rounded-lg p-6 w-[40rem] max-w-full max-h-full">
        {/* Flip scene */}
        <div
          className={`flashcard-scene mb-8 h-[300px] ${showAnswer ? 'flipped' : ''}`}
          onClick={toggleAnswer}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleAnswer(); }}
        >
          <div className="flashcard-card bg-gray-50 border border-gray-300 rounded-lg">
            {/* Front face */}
            <div className="flashcard-face flex flex-col justify-center items-center text-center p-12">
              <button
                onClick={e => { e.stopPropagation(); toggleHint(); }}
                className="absolute top-4 left-4 flex items-center space-x-2 text-gray-700 font-semibold text-sm hover:text-yellow-500 transition"
                title="Toggle Hint"
                aria-pressed={showHint}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9.75 17h4.5M12 3c-3.038 0-5.5 2.462-5.5 5.5
                           0 2.49 1.7 4.577 4 5.188V15h3v-1.312
                           c2.3-.61 4-2.698 4-5.188
                           0-3.038-2.462-5.5-5.5-5.5z" />
                </svg>
                <span>Get a hint</span>
              </button>
              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(); }}
                className={`absolute top-4 right-4 transition cursor-pointer hover:text-yellow-400 ${
                  isFavorite ? 'text-yellow-400' : 'text-gray-400'
                }`}
                title={isFavorite ? 'Unfavorite' : 'Favorite'}
                aria-pressed={isFavorite}
              >
                {isFavorite
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor"
                         viewBox="0 0 24 24">
                      <path d="M12 17.27l5.18 3.73-1.64-6.81L21 9.24
                               l-6.91-.59L12 2 9.91 8.65 3 9.24
                               l5.46 4.95-1.64 6.81z"/>
                    </svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 17.27l5.18 3.73-1.64-6.81L21
                               9.24l-6.91-.59L12 2 9.91 8.65
                               3 9.24l5.46 4.95-1.64 6.81z"/>
                    </svg>}
              </button>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {card.question || 'Loading…'}
              </h3>
              {showHint && (
                <p className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded border border-yellow-300 text-sm">
                  Hint: {(card.answer || '').slice(0, 50)}…
                </p>
              )}
            </div>

            {/* Back face */}
            <div className="flashcard-face flashcard-back flex flex-col justify-center items-center text-center p-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {card.answer}
              </h3>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center pt-4 text-gray-600">
          <button onClick={togglePlay} className="hover:text-gray-900 transition" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying
              ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>
                </svg>
              : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>}
          </button>

          <button onClick={shuffle} className="hover:text-gray-900 transition" title="Shuffle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M16 3h5v5M21 3l-8.5 8.5M4 20l7-7 7 7M4 4l7 7"/>
            </svg>
          </button>

          <button
            onClick={goPrev}
            disabled={total === 0}
            className={`rounded-full w-10 h-10 flex items-center justify-center transition focus:outline-none ${
              total === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Previous"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6m0 0l6-6m-6 6l6 6"/>
            </svg>
          </button>

          <div className="text-gray-700 font-semibold select-none">
            {total === 0 ? '0 / 0' : `${currentIndex + 1} / ${total}`}
          </div>

          <button
            onClick={goNext}
            disabled={total === 0}
            className={`rounded-full w-10 h-10 flex items-center justify-center transition focus:outline-none ${
              total === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12m0 0l-6-6m6 6l-6 6"/>
            </svg>
          </button>

          <button onClick={toggleFullscreen} className="hover:text-gray-900 transition" title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            {isFullscreen
              ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M18 14v4h-4M6 10V6h4"/></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 20v-6M4 20h6M20 4h-6M20 4v6"/></svg>}
          </button>
          
        </div>
        <div className="flex justify-between items-center border-t pt-4 text-gray-600 mt-4"></div>
      </div>
    </div>
  );
}

export default App;
