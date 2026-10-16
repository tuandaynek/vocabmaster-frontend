import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Play,
} from 'lucide-react';
import type { SubTopic } from '../../types/grammarData';
import { useGameSound } from '../../hooks/useGameSound';
import TheorySlideContent from './TheorySlideContent';
import { THEORY_SLIDES } from '../../constants/theoryConstants';

interface TheoryPageProps {
  subTopics: SubTopic[];
  onBackToHub: () => void;
  onStartPractice: () => void;
}

type SlideDirection = 'next' | 'previous';

export default function TheoryPage({ subTopics, onBackToHub, onStartPractice }: TheoryPageProps) {
  const { playSelect } = useGameSound();
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>('next');
  const [speakingExample, setSpeakingExample] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const totalSlides = subTopics.length * THEORY_SLIDES.length;
  const safeTotalSlides = Math.max(1, totalSlides);
  const currentSubTopicIndex = Math.floor(slideIndex / THEORY_SLIDES.length);
  const currentSlideIndex = slideIndex % THEORY_SLIDES.length;
  const currentSubTopic = subTopics[currentSubTopicIndex];
  const currentSlide = THEORY_SLIDES[currentSlideIndex];

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      activeUtterance.current = null;
      window.speechSynthesis.cancel();
    }
  }, []);

  const changeSlide = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= totalSlides || nextIndex === slideIndex) return;
    if (activeUtterance.current && 'speechSynthesis' in window) {
      activeUtterance.current = null;
      window.speechSynthesis.cancel();
      setSpeakingExample(null);
    }
    setDirection(nextIndex > slideIndex ? 'next' : 'previous');
    setSlideIndex(nextIndex);
    playSelect();
  }, [playSelect, slideIndex, totalSlides]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        changeSlide(slideIndex + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        changeSlide(slideIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeSlide, slideIndex]);

  const handleBack = () => {
    playSelect();
    onBackToHub();
  };

  const handlePractice = () => {
    playSelect();
    onStartPractice();
  };

  const speakExample = (sentence: string, exampleIndex: number) => {
    playSelect();
    setSpeechError(null);
    if (!('speechSynthesis' in window)) {
      setSpeechError('Trình duyệt này chưa hỗ trợ phát âm.');
      return;
    }

    activeUtterance.current = null;
    window.speechSynthesis.cancel();
    if (speakingExample === exampleIndex) {
      setSpeakingExample(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    activeUtterance.current = utterance;
    utterance.onstart = () => {
      if (activeUtterance.current === utterance) setSpeakingExample(exampleIndex);
    };
    utterance.onend = () => {
      if (activeUtterance.current === utterance) {
        activeUtterance.current = null;
        setSpeakingExample(null);
      }
    };
    utterance.onerror = () => {
      if (activeUtterance.current === utterance) {
        activeUtterance.current = null;
        setSpeakingExample(null);
        setSpeechError('Không thể phát âm câu này. Hãy thử lại nhé.');
      }
    };
    setSpeakingExample(exampleIndex);
    window.speechSynthesis.speak(utterance);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStartX.current = event.clientX;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointerStartX.current === null) return;
    const distance = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(distance) < 55) return;
    changeSlide(slideIndex + (distance < 0 ? 1 : -1));
  };

  if (!currentSubTopic || !currentSlide) {
    return (
      <main className="grammar-hub flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 p-6">
        <section className="max-w-md rounded-3xl border-2 border-white bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-black text-slate-800">Chưa có nội dung lý thuyết</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Quay lại bản đồ và chọn một chuyên đề để tiếp tục.</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-5 rounded-2xl border-b-4 border-slate-300 bg-slate-100 px-5 py-3 font-black text-slate-700 active:translate-y-1 active:border-b-0"
          >
            Về bản đồ
          </button>
        </section>
      </main>
    );
  }

  const progressPercent = ((slideIndex + 1) / safeTotalSlides) * 100;
  const isFinalSlide = slideIndex === totalSlides - 1;
  const currentSubTopicStart = currentSubTopicIndex * THEORY_SLIDES.length;
  const slideClass = direction === 'next' ? 'theory-slide-enter-next' : 'theory-slide-enter-previous';

  return (
    <main className="grammar-hub min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50/70 px-4 py-6 text-slate-800 md:px-8 md:py-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-3 font-black text-slate-700 shadow-sm transition hover:bg-slate-50 active:translate-y-1 active:border-b-0"
          >
            <ArrowLeft className="h-4 w-4" /> Về bản đồ
          </button>
          <span className="rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-xs font-black text-indigo-700">
            THEORY MODE · {subTopics.length} chuyên đề
          </span>
        </header>

        <section aria-label="Tiến độ bài học" className="rounded-3xl border-2 border-white bg-white/90 p-4 shadow-md shadow-indigo-100/60 backdrop-blur-md md:p-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-slate-500">
            <span className="truncate text-indigo-600">{currentSubTopic.title}</span>
            <span className="shrink-0">Slide {currentSlideIndex + 1} of {THEORY_SLIDES.length}</span>
          </div>
          <div
            role="progressbar"
            aria-label="Tiến độ lý thuyết"
            aria-valuemin={0}
            aria-valuemax={safeTotalSlides}
            aria-valuenow={slideIndex + 1}
            className="h-3 overflow-hidden rounded-full bg-indigo-50 shadow-inner"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-[width] duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: THEORY_SLIDES.length }, (_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index <= currentSlideIndex ? 'bg-indigo-400' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        </section>

        <nav aria-label="Mục lục bài học" className="sticky top-3 z-20 -mx-1 flex gap-2 overflow-x-auto rounded-2xl border border-white/80 bg-white/85 p-2 shadow-lg shadow-indigo-100/50 backdrop-blur-md">
          {THEORY_SLIDES.map((slide, index) => {
            const isCurrentSlide = index === currentSlideIndex;
            return (
              <button
                key={slide.category}
                type="button"
                aria-current={isCurrentSlide ? 'step' : undefined}
                onClick={() => changeSlide(currentSubTopicStart + index)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border-b-2 px-3 py-2 text-xs font-black transition active:translate-y-0.5 sm:text-sm ${
                  isCurrentSlide
                    ? 'border-indigo-700 bg-indigo-500 text-white shadow-md shadow-indigo-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 text-[10px]">{index + 1}</span>
                {slide.category === 'formula' ? 'Công thức' : slide.category === 'usage' ? 'Cách dùng' : slide.category === 'examples' ? 'Ví dụ' : 'Bẫy thường gặp'}
              </button>
            );
          })}
        </nav>

        <section
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { pointerStartX.current = null; }}
          className="overflow-hidden touch-pan-y rounded-3xl border-2 border-white border-b-4 border-b-indigo-200 bg-white/95 shadow-2xl shadow-indigo-100/70 backdrop-blur-md"
        >
          <div key={`${currentSubTopic.id}-${currentSlide.category}`} className={slideClass}>
            <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-500 px-5 py-6 text-white md:px-8 md:py-7">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black tracking-wider text-white/95 backdrop-blur-sm">
                  <BookOpen className="h-3.5 w-3.5" /> {currentSlide.label}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-black text-white/95">
                  Chuyên đề {currentSubTopicIndex + 1}/{subTopics.length}
                </span>
              </div>
              <h1 className="text-2xl font-black md:text-3xl">{currentSubTopic.title}</h1>
              <p className="mt-1 text-sm font-medium text-white/80">{currentSlide.title} · {currentSubTopic.description}</p>
            </div>

            <div className="min-h-[330px] p-5 md:min-h-[390px] md:p-8">
              <TheorySlideContent
                category={currentSlide.category}
                subTopic={currentSubTopic}
                speakingExample={speakingExample}
                speechError={speechError}
                onSpeakExample={speakExample}
              />
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => changeSlide(slideIndex - 1)}
            disabled={slideIndex === 0}
            aria-label="Slide trước"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-1 justify-center gap-2" aria-label={`Chọn slide ${currentSlideIndex + 1} trên ${THEORY_SLIDES.length}`}>
            {Array.from({ length: THEORY_SLIDES.length }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Đến slide ${index + 1} của chuyên đề này`}
                aria-current={index === currentSlideIndex ? 'step' : undefined}
                onClick={() => changeSlide(currentSubTopicStart + index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentSlideIndex ? 'w-8 bg-indigo-500 shadow-md shadow-indigo-200' : 'w-3 bg-indigo-200 hover:bg-indigo-300'
                }`}
              />
            ))}
          </div>

          {isFinalSlide ? (
            <button
              type="button"
              onClick={handlePractice}
              className="theory-practice-cta flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-500 to-teal-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-300/70 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-300 active:translate-y-1 active:border-b-0 sm:px-6 sm:text-base"
            >
              <Play className="h-4 w-4 shrink-0 fill-white" />
              <span className="whitespace-nowrap">Bắt đầu luyện tập Game</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => changeSlide(slideIndex + 1)}
              aria-label={currentSlideIndex === THEORY_SLIDES.length - 1 ? 'Chuyển sang chuyên đề tiếp theo' : 'Slide tiếp theo'}
              className={`flex h-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-indigo-700 bg-indigo-500 text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-600 active:translate-y-1 active:border-b-0 ${
                currentSlideIndex === THEORY_SLIDES.length - 1 ? 'gap-2 rounded-2xl px-4' : 'w-12'
              }`}
            >
              {currentSlideIndex === THEORY_SLIDES.length - 1 && <span className="text-xs font-black sm:text-sm">Chuyên đề tiếp theo</span>}
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </footer>
        <p className="text-center text-xs font-bold text-slate-400">Dùng phím ← → hoặc vuốt để chuyển slide</p>
      </div>
    </main>
  );
}
