import { useState, useEffect, useRef, useCallback } from "react";
import { slides } from "./data/slides";
import "./App.css";

function TitleSlide({ slide }) {
  return (
    <div className="slide slide--title">
      <div className="title-ornament">{"\u2726"}</div>
      <h1 className="title-main">{slide.title}</h1>
      <div className="title-rule" />
      <h2 className="title-chapter">{slide.subtitle}</h2>
      <p className="title-tagline">{slide.tagline}</p>
      <div className="title-spacer" />
      <p className="title-author">{slide.author}</p>
      <p className="title-description">{slide.description}</p>
      <div className="title-ornament title-ornament--bottom">{"\u2726"}</div>
    </div>
  );
}

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
        <img
          src={slide.artwork}
          alt={slide.artworkTitle}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
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

function ProgressDots({ current, total, onDotClick }) {
  return (
    <nav className="progress-dots" aria-label="Slide navigation">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          className={`progress-dot ${i === current ? "active" : ""}`}
          onClick={() => onDotClick(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === current ? "step" : undefined}
        />
      ))}
    </nav>
  );
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const isScrolling = useRef(false);

  const scrollToSlide = useCallback((index) => {
    if (slideRefs.current[index]) {
      isScrolling.current = true;
      slideRefs.current[index].scrollIntoView({ behavior: "smooth" });
      setCurrentSlide(index);
      setTimeout(() => {
        isScrolling.current = false;
      }, 800);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Add visible class for scroll-in animations
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }

          // Update current slide indicator
          if (!isScrolling.current && entry.isIntersecting && entry.intersectionRatio > 0.2) {
            const index = slideRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setCurrentSlide(index);
            }
          }
        });
      },
      { threshold: [0.1, 0.2, 0.5] }
    );

    slideRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app" ref={containerRef}>
      <ProgressDots
        current={currentSlide}
        total={slides.length}
        onDotClick={scrollToSlide}
      />

      <main className="slides-container">
        {slides.map((slide, i) => (
          <section
            key={slide.id}
            ref={(el) => (slideRefs.current[i] = el)}
            className={`slide-wrapper ${i === 0 ? "visible" : ""}`}
          >
            {slide.type === "title" ? (
              <TitleSlide slide={slide} />
            ) : (
              <ContentSlide slide={slide} />
            )}
          </section>
        ))}
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
