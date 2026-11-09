import { useRef } from "react";
import { Link } from "react-router-dom";
import Anime from "./Anime";

const AnimeRail = ({ title, animes = [], seeMoreLink }) => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!animes || animes.length === 0) return null;

  return (
    <section className="anime-rail-section my-4">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-title-indicator" />
          {title}
        </h2>
        {seeMoreLink && (
          <Link to={seeMoreLink} className="see-more-link">
            Ver todo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}
      </div>

      <div className="rail-wrapper">
        {/* Left Arrow */}
        <button
          type="button"
          className="rail-arrow rail-arrow-left"
          onClick={() => handleScroll("left")}
          aria-label="Desplazar a la izquierda"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Scrollable Container */}
        <div className="rail-track" ref={scrollRef}>
          {animes.map((anime) => (
            <div key={anime.id} className="rail-item">
              <Anime anime={anime} attributes={anime.attributes} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          className="rail-arrow rail-arrow-right"
          onClick={() => handleScroll("right")}
          aria-label="Desplazar a la derecha"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default AnimeRail;
