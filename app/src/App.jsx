import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { slides } from "./data/slides";
import "./App.css";

/* ------------------------------------------------
   Derive chapter structure from the flat slides array
   ------------------------------------------------ */
function useChapters() {
  return useMemo(() => {
    const chapters = [];
    let current = null;
    slides.forEach((slide, i) => {
      if (slide.type === "title") {
        current = {
          title: slide.subtitle,
          tagline: slide.tagline,
          year: slide.year || "",
          location: slide.location || "",
          part: slide.part || "",
          partNumber: slide.partNumber || 1,
          slideIndex: i,
          points: [],
        };
        chapters.push(current);
      } else if (current) {
        current.points.push({
          number: slide.number,
          heading: slide.heading,
          slideIndex: i,
        });
      }
    });
    return chapters;
  }, []);
}

/* ------------------------------------------------
   Get slides for a specific chapter
   ------------------------------------------------ */
function getChapterSlides(chapters, chapterIndex) {
  const chapter = chapters[chapterIndex];
  if (!chapter) return [];
  const start = chapter.slideIndex;
  const end =
    chapterIndex < chapters.length - 1
      ? chapters[chapterIndex + 1].slideIndex
      : slides.length;
  return slides.slice(start, end);
}

/* ------------------------------------------------
   Landing Page
   ------------------------------------------------ */
function LandingPage({ onOpenBrowser }) {
  return (
    <div className="landing">
      <div className="landing-content">
        <div className="landing-ornament">{"\u2726"}</div>
        <h1 className="landing-title">DOMINION</h1>
        <div className="landing-rule" />
        <p className="landing-subtitle">
          How the Christian Revolution Remade the World
        </p>
        <p className="landing-author">Tom Holland</p>
        <div className="landing-spacer" />
        <p className="landing-description">
          A visual journey through twenty-one chapters of history, from ancient
          Athens to the modern world — told in twelve key moments per chapter,
          each accompanied by a masterwork of art.
        </p>
        <button className="landing-cta" onClick={onOpenBrowser}>
          <span className="landing-cta-text">Explore the Journey</span>
          <span className="landing-cta-arrow">{"\u2192"}</span>
        </button>
        <div className="landing-ornament landing-ornament--bottom">
          {"\u2726"}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------
   Chapter Browser
   ------------------------------------------------ */
function ChapterBrowser({ chapters, onSelectChapter, onBack }) {
  // Group chapters by part
  const parts = useMemo(() => {
    const grouped = {};
    chapters.forEach((ch, i) => {
      const part = ch.part || "OTHER";
      if (!grouped[part]) {
        grouped[part] = { name: part, partNumber: ch.partNumber, chapters: [] };
      }
      grouped[part].chapters.push({ ...ch, globalIndex: i });
    });
    return Object.values(grouped).sort((a, b) => a.partNumber - b.partNumber);
  }, [chapters]);

  return (
    <div className="browser">
      <div className="browser-header">
        <button className="browser-back" onClick={onBack} aria-label="Back to landing">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="14" y1="10" x2="6" y2="10" />
            <polyline points="10,4 6,10 10,16" fill="none" />
          </svg>
        </button>
        <div className="browser-header-center">
          <div className="browser-ornament">{"\u2726"}</div>
          <h1 className="browser-title">Chapters</h1>
          <p className="browser-subtitle">DOMINION</p>
        </div>
      </div>

      <div className="browser-parts">
        {parts.map((part) => (
          <div key={part.name} className="browser-part">
            <div className="browser-part-header">
              <div className="browser-part-line" />
              <h2 className="browser-part-name">
                Part {part.partNumber === 1 ? "I" : part.partNumber === 2 ? "II" : "III"} — {part.name}
              </h2>
              <div className="browser-part-line" />
            </div>

            <div className="browser-chapters">
              {part.chapters.map((ch) => {
                const chNum = ch.globalIndex + 1;
                return (
                  <button
                    key={ch.globalIndex}
                    className="browser-card"
                    onClick={() => onSelectChapter(ch.globalIndex)}
                  >
                    <span className="browser-card-num">{chNum}</span>
                    <div className="browser-card-content">
                      <span className="browser-card-title">{ch.title.replace(/^Chapter \w+ — /, "")}</span>
                      <span className="browser-card-meta">
                        {ch.year}{ch.location ? ` · ${ch.location}` : ""}
                      </span>
                      <span className="browser-card-tagline">{ch.tagline}</span>
                    </div>
                    <span className="browser-card-arrow">{"\u203A"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------
   Chapter Top Bar
   ------------------------------------------------ */
function ChapterTopBar({ chapter, currentPoint, progress, onBack, onOpenIndex }) {
  return (
    <header className="top-bar top-bar--visible">
      <div className="top-bar-inner">
        <button className="top-bar-back-btn" onClick={onBack} aria-label="Back to chapters">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="13" y1="9" x2="5" y2="9" />
            <polyline points="9,3 5,9 9,15" fill="none" />
          </svg>
        </button>

        <button className="top-bar-index-btn" onClick={onOpenIndex} aria-label="Open chapter index">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="0" y1="1" x2="18" y2="1" />
            <line x1="0" y1="7" x2="12" y2="7" />
            <line x1="0" y1="13" x2="15" y2="13" />
          </svg>
        </button>

        <div className="top-bar-context">
          <span className="top-bar-chapter">{chapter?.title}</span>
          {currentPoint && (
            <>
              <span className="top-bar-sep">{"\u00B7"}</span>
              <span className="top-bar-point">
                {currentPoint.number}. {currentPoint.heading}
              </span>
            </>
          )}
        </div>

        <span className="top-bar-book">Dominion</span>
      </div>

      <div className="top-bar-progress">
        <div
          className="top-bar-progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </header>
  );
}

/* ------------------------------------------------
   Chapter Index Overlay (for within-chapter nav)
   ------------------------------------------------ */
function ChapterIndex({
  chapters,
  activeChapterIndex,
  currentSlideLocal,
  onNavigateSlide,
  onNavigateChapter,
  isOpen,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="index-overlay" onClick={onClose}>
      <div className="index-content" onClick={(e) => e.stopPropagation()}>
        <button className="index-close" onClick={onClose} aria-label="Close index">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>

        <div className="index-header">
          <div className="index-ornament">{"\u2726"}</div>
          <h2 className="index-title">Chapters</h2>
          <div className="index-rule" />
        </div>

        <div className="index-chapters">
          {chapters.map((chapter, ci) => {
            const isActiveChapter = ci === activeChapterIndex;

            return (
              <div key={ci} className={`index-chapter ${isActiveChapter ? "active" : ""}`}>
                <button
                  className="index-chapter-title"
                  onClick={() => {
                    onNavigateChapter(ci);
                    onClose();
                  }}
                >
                  <span className="index-chapter-num">{"" + (ci + 1)}</span>
                  <span className="index-chapter-name">{chapter.title}</span>
                </button>
                <p className="index-chapter-tagline">{chapter.tagline}</p>

                {isActiveChapter && (
                  <ol className="index-points">
                    {chapter.points.map((point, pi) => {
                      const isActive = currentSlideLocal === pi + 1;
                      return (
                        <li key={pi}>
                          <button
                            className={`index-point ${isActive ? "active" : ""}`}
                            onClick={() => {
                              onNavigateSlide(pi + 1);
                              onClose();
                            }}
                          >
                            <span className="index-point-num">{point.number}</span>
                            <span className="index-point-heading">{point.heading}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------
   Title Slide
   ------------------------------------------------ */
function TitleSlide({ slide, isFirst }) {
  return (
    <div className={`slide slide--title ${isFirst ? "slide--title-first" : ""}`}>
      <div className="title-ornament">{"\u2726"}</div>
      <h2 className="title-chapter title-chapter--large">{slide.subtitle}</h2>
      <p className="title-tagline">{slide.tagline}</p>
      <div className="title-spacer" />
      <p className="title-description">{slide.description}</p>
      <div className="title-ornament title-ornament--bottom">{"\u2726"}</div>
    </div>
  );
}

/* ------------------------------------------------
   Content Slide
   ------------------------------------------------ */
function ContentSlide({ slide }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="slide slide--content">
      <p className="slide-bridge">{slide.bridge}</p>

      <div className="slide-header">
        <span className="slide-number">{slide.number}</span>
        <div className="slide-number-rule" />
        <h2 className="slide-heading">{slide.heading}</h2>
      </div>

      <div className="slide-body">
        <p>{slide.body}</p>
      </div>

      <div className={`slide-artwork ${imageLoaded ? "loaded" : ""}`}>
        <div className="slide-artwork-frame">
          <img
            src={slide.artwork}
            alt={slide.artworkTitle}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
        <div className="artwork-info">
          <span className="artwork-title">{slide.artworkTitle}</span>
          <span className="artwork-credit">{slide.artworkCredit}</span>
        </div>
      </div>

      <p className="slide-caption">{slide.artworkCaption}</p>

      <div className="slide-map">
        <img src={slide.map} alt="Location map" loading="lazy" />
      </div>
    </div>
  );
}

/* ------------------------------------------------
   Side Progress (within a single chapter)
   ------------------------------------------------ */
function SideProgress({ totalSlides, currentSlide, onNavigate }) {
  return (
    <nav className="side-progress" aria-label="Slide progress">
      {Array.from({ length: totalSlides }, (_, i) => (
        <button
          key={i}
          className={`side-dot ${i === currentSlide ? "active" : ""} ${i < currentSlide ? "passed" : ""}`}
          onClick={() => onNavigate(i)}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </nav>
  );
}

/* ------------------------------------------------
   Chapter Navigation (prev/next at bottom)
   ------------------------------------------------ */
function ChapterNav({ chapters, currentIndex, onNavigate, onBackToBrowser }) {
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="chapter-nav">
      <div className="chapter-nav-divider">
        <div className="chapter-nav-divider-line" />
        <div className="chapter-nav-divider-ornament">{"\u2726"}{"\u00A0\u00A0"}{"\u2726"}{"\u00A0\u00A0"}{"\u2726"}</div>
        <div className="chapter-nav-divider-line" />
      </div>

      <div className="chapter-nav-buttons">
        {prev ? (
          <button className="chapter-nav-btn chapter-nav-btn--prev" onClick={() => onNavigate(currentIndex - 1)}>
            <span className="chapter-nav-label">{"\u2190"} Previous Chapter</span>
            <span className="chapter-nav-name">{prev.title}</span>
          </button>
        ) : (
          <div />
        )}

        <button className="chapter-nav-btn chapter-nav-btn--all" onClick={onBackToBrowser}>
          All Chapters
        </button>

        {next ? (
          <button className="chapter-nav-btn chapter-nav-btn--next" onClick={() => onNavigate(currentIndex + 1)}>
            <span className="chapter-nav-label">Next Chapter {"\u2192"}</span>
            <span className="chapter-nav-name">{next.title}</span>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------
   Chapter View — shows a single chapter
   ------------------------------------------------ */
function ChapterView({ chapters, chapterIndex, onNavigateChapter, onBackToBrowser }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [indexOpen, setIndexOpen] = useState(false);
  const slideRefs = useRef([]);
  const isScrolling = useRef(false);
  const chapterSlides = useMemo(
    () => getChapterSlides(chapters, chapterIndex),
    [chapters, chapterIndex]
  );

  // Reset scroll position when chapter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setCurrentSlide(0);
  }, [chapterIndex]);

  const scrollToSlide = useCallback((index) => {
    if (slideRefs.current[index]) {
      isScrolling.current = true;
      slideRefs.current[index].scrollIntoView({ behavior: "smooth" });
      setCurrentSlide(index);
      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    }
  }, []);

  // Lock body scroll when index is open
  useEffect(() => {
    if (indexOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [indexOpen]);

  // Intersection observer for scroll tracking + reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
          if (
            !isScrolling.current &&
            entry.isIntersecting &&
            entry.intersectionRatio > 0.15
          ) {
            const index = slideRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setCurrentSlide(index);
            }
          }
        });
      },
      { threshold: [0.1, 0.15, 0.3, 0.5] }
    );

    slideRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [chapterIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (indexOpen && e.key === "Escape") {
        setIndexOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [indexOpen]);

  const chapter = chapters[chapterIndex];
  const currentPointSlide = chapterSlides[currentSlide];
  const progress =
    chapterSlides.length > 1
      ? currentSlide / (chapterSlides.length - 1)
      : 0;

  const handleNavigateChapter = (index) => {
    onNavigateChapter(index);
  };

  return (
    <div className="app chapter-view">
      <ChapterTopBar
        chapter={chapter}
        currentPoint={
          currentPointSlide?.type !== "title" ? currentPointSlide : null
        }
        progress={progress}
        onBack={onBackToBrowser}
        onOpenIndex={() => setIndexOpen(true)}
      />

      <SideProgress
        totalSlides={chapterSlides.length}
        currentSlide={currentSlide}
        onNavigate={scrollToSlide}
      />

      <ChapterIndex
        chapters={chapters}
        activeChapterIndex={chapterIndex}
        currentSlideLocal={currentSlide}
        onNavigateSlide={scrollToSlide}
        onNavigateChapter={handleNavigateChapter}
        isOpen={indexOpen}
        onClose={() => setIndexOpen(false)}
      />

      <main className="slides-container">
        {chapterSlides.map((slide, i) => (
          <section
            key={`${chapterIndex}-${i}`}
            ref={(el) => (slideRefs.current[i] = el)}
            className={`slide-wrapper ${i === 0 ? "visible" : ""}`}
          >
            {slide.type === "title" ? (
              <TitleSlide slide={slide} isFirst={false} />
            ) : (
              <ContentSlide slide={slide} />
            )}
          </section>
        ))}
      </main>

      <ChapterNav
        chapters={chapters}
        currentIndex={chapterIndex}
        onNavigate={handleNavigateChapter}
        onBackToBrowser={onBackToBrowser}
      />

      <footer className="app-footer">
        <div className="footer-ornament">{"\u2726"}</div>
        <p>
          Based on <em>Dominion</em> by Tom Holland
        </p>
      </footer>
    </div>
  );
}

/* ------------------------------------------------
   App — View Router
   ------------------------------------------------ */
export default function App() {
  const [view, setView] = useState("landing"); // 'landing' | 'browser' | 'chapter'
  const [activeChapter, setActiveChapter] = useState(0);
  const chapters = useChapters();

  const openBrowser = useCallback(() => {
    setView("browser");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const openChapter = useCallback((index) => {
    setActiveChapter(index);
    setView("chapter");
  }, []);

  const backToLanding = useCallback(() => {
    setView("landing");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const backToBrowser = useCallback(() => {
    setView("browser");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  if (view === "chapter") {
    return (
      <ChapterView
        chapters={chapters}
        chapterIndex={activeChapter}
        onNavigateChapter={openChapter}
        onBackToBrowser={backToBrowser}
      />
    );
  }

  if (view === "browser") {
    return (
      <div className="app">
        <ChapterBrowser
          chapters={chapters}
          onSelectChapter={openChapter}
          onBack={backToLanding}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <LandingPage onOpenBrowser={openBrowser} />
    </div>
  );
}
