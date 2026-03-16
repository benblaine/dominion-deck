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
   Chapter Index Overlay
   ------------------------------------------------ */
function ChapterIndex({ chapters, currentSlide, onNavigate, isOpen, onClose }) {
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
            const isActiveChapter =
              currentSlide >= chapter.slideIndex &&
              (ci === chapters.length - 1 || currentSlide < chapters[ci + 1].slideIndex);

            return (
              <div key={ci} className={`index-chapter ${isActiveChapter ? "active" : ""}`}>
                <button
                  className="index-chapter-title"
                  onClick={() => { onNavigate(chapter.slideIndex); onClose(); }}
                >
                  <span className="index-chapter-num">{"" + (ci + 1)}</span>
                  <span className="index-chapter-name">{chapter.title}</span>
                </button>
                <p className="index-chapter-tagline">{chapter.tagline}</p>

                <ol className="index-points">
                  {chapter.points.map((point) => {
                    const isActive = currentSlide === point.slideIndex;
                    return (
                      <li key={point.slideIndex}>
                        <button
                          className={`index-point ${isActive ? "active" : ""}`}
                          onClick={() => { onNavigate(point.slideIndex); onClose(); }}
                        >
                          <span className="index-point-num">{point.number}</span>
                          <span className="index-point-heading">{point.heading}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------
   Fixed top bar with chapter context
   ------------------------------------------------ */
function TopBar({ chapters, currentSlide, onOpenIndex }) {
  const currentChapter = useMemo(() => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentSlide >= chapters[i].slideIndex) return chapters[i];
    }
    return chapters[0];
  }, [chapters, currentSlide]);

  const currentPoint = useMemo(() => {
    const slide = slides[currentSlide];
    if (slide?.type === "title") return null;
    return slide;
  }, [currentSlide]);

  // Calculate overall progress
  const progress = slides.length > 1 ? currentSlide / (slides.length - 1) : 0;

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <button className="top-bar-index-btn" onClick={onOpenIndex} aria-label="Open chapter index">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="0" y1="1" x2="18" y2="1" />
            <line x1="0" y1="7" x2="12" y2="7" />
            <line x1="0" y1="13" x2="15" y2="13" />
          </svg>
        </button>

        <div className="top-bar-context">
          <span className="top-bar-chapter">{currentChapter?.title}</span>
          {currentPoint && (
            <>
              <span className="top-bar-sep">{"\u00B7"}</span>
              <span className="top-bar-point">{currentPoint.number}. {currentPoint.heading}</span>
            </>
          )}
        </div>

        <span className="top-bar-book">Dominion</span>
      </div>

      <div className="top-bar-progress">
        <div className="top-bar-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
    </header>
  );
}

/* ------------------------------------------------
   Chapter divider between chapters
   ------------------------------------------------ */
function ChapterDivider() {
  return (
    <div className="chapter-divider">
      <div className="chapter-divider-line" />
      <div className="chapter-divider-ornament">{"\u2726"}{"\u00A0\u00A0"}{"\u2726"}{"\u00A0\u00A0"}{"\u2726"}</div>
      <div className="chapter-divider-line" />
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
      {isFirst && <h1 className="title-main">{slide.title}</h1>}
      {isFirst && <div className="title-rule" />}
      <h2 className={`title-chapter ${!isFirst ? "title-chapter--large" : ""}`}>{slide.subtitle}</h2>
      <p className="title-tagline">{slide.tagline}</p>
      <div className="title-spacer" />
      {isFirst && <p className="title-author">{slide.author}</p>}
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
  const artworkRef = useRef(null);

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

      <div
        ref={artworkRef}
        className={`slide-artwork ${imageLoaded ? "loaded" : ""}`}
      >
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
   Side Progress (chapter-aware)
   ------------------------------------------------ */
function SideProgress({ chapters, currentSlide, onNavigate }) {
  return (
    <nav className="side-progress" aria-label="Chapter progress">
      {chapters.map((chapter, ci) => {
        const isActiveChapter =
          currentSlide >= chapter.slideIndex &&
          (ci === chapters.length - 1 || currentSlide < chapters[ci + 1].slideIndex);
        const nextChapterStart = ci < chapters.length - 1 ? chapters[ci + 1].slideIndex : slides.length;
        const chapterSlideCount = nextChapterStart - chapter.slideIndex;
        const slideWithinChapter = Math.max(0, currentSlide - chapter.slideIndex);
        const chapterProgress = isActiveChapter
          ? Math.min(1, slideWithinChapter / (chapterSlideCount - 1))
          : currentSlide > chapter.slideIndex ? 1 : 0;

        return (
          <div key={ci} className={`side-chapter ${isActiveChapter ? "active" : ""}`}>
            <button
              className="side-chapter-dot"
              onClick={() => onNavigate(chapter.slideIndex)}
              aria-label={chapter.title}
            />
            <div className="side-chapter-track">
              <div
                className="side-chapter-fill"
                style={{ height: `${chapterProgress * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------
   App
   ------------------------------------------------ */
export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [indexOpen, setIndexOpen] = useState(false);
  const [topBarVisible, setTopBarVisible] = useState(false);
  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const isScrolling = useRef(false);
  const chapters = useChapters();

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

  // Show top bar after scrolling past first viewport
  useEffect(() => {
    const handleScroll = () => {
      setTopBarVisible(window.scrollY > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when index is open
  useEffect(() => {
    if (indexOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
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
  }, []);

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

  // Determine which slides are title slides (for dividers)
  const titleSlideIndices = useMemo(
    () => slides.reduce((acc, s, i) => (s.type === "title" ? [...acc, i] : acc), []),
    []
  );

  return (
    <div className="app" ref={containerRef}>
      <TopBar
        chapters={chapters}
        currentSlide={currentSlide}
        onOpenIndex={() => setIndexOpen(true)}
      />

      <div className={`top-bar-backdrop ${topBarVisible ? "visible" : ""}`} />

      <SideProgress
        chapters={chapters}
        currentSlide={currentSlide}
        onNavigate={scrollToSlide}
      />

      <ChapterIndex
        chapters={chapters}
        currentSlide={currentSlide}
        onNavigate={scrollToSlide}
        isOpen={indexOpen}
        onClose={() => setIndexOpen(false)}
      />

      <main className="slides-container">
        {slides.map((slide, i) => {
          const showDivider = slide.type === "title" && i > 0;
          const isFirst = i === 0;

          return (
            <section
              key={slide.id}
              ref={(el) => (slideRefs.current[i] = el)}
              className={`slide-wrapper ${isFirst ? "visible" : ""}`}
            >
              {showDivider && <ChapterDivider />}
              {slide.type === "title" ? (
                <TitleSlide slide={slide} isFirst={isFirst} />
              ) : (
                <ContentSlide slide={slide} />
              )}
            </section>
          );
        })}
      </main>

      <footer className="app-footer">
        <div className="footer-ornament">{"\u2726"}</div>
        <p>
          Based on <em>Dominion</em> by Tom Holland
        </p>
      </footer>
    </div>
  );
}
