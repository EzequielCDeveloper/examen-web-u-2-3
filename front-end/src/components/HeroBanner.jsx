import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import { toggleMyList } from "../redux/actions/anime";

const HeroBanner = ({ anime }) => {
  const dispatch = useDispatch();
  const myList = useSelector((state) => state.myList);

  if (!anime || !anime.attributes) {
    return (
      <div className="hero-banner-full hero-banner-skeleton">
        <div className="hero-skeleton-shimmer" />
      </div>
    );
  }

  const { attributes } = anime;
  const isSaved = myList.some((item) => item.id === anime.id);

  const backdrop =
    attributes.coverImage?.original ||
    attributes.coverImage?.large ||
    attributes.posterImage?.original ||
    attributes.posterImage?.large;

  const title =
    attributes.titles?.en ||
    attributes.titles?.en_jp ||
    attributes.canonicalTitle ||
    "Anime Destacado";

  const rating = attributes.averageRating
    ? (parseFloat(attributes.averageRating) / 10).toFixed(1)
    : "8.5";

  const year = attributes.startDate
    ? new Date(attributes.startDate).getFullYear()
    : "2024";

  const format = attributes.subtype || attributes.showType || "TV";
  const ageRating = attributes.ageRating || "14+";

  const handleToggleList = (e) => {
    e.preventDefault();
    dispatch(toggleMyList(anime));
  };

  return (
    <section className="hero-banner-full">
      {/* 100% Horizontal Background Image */}
      {backdrop && (
        <img
          src={backdrop}
          alt={title}
          className="hero-full-backdrop-img"
          loading="eager"
        />
      )}

      {/* Cinematic Vignette: Fading ALL edges to dark (top, bottom, left, right) */}
      <div className="hero-vignette-all" />

      {/* Content Layer with responsive container */}
      <Container fluid="xl" className="hero-content-container">
        <div className="hero-content-box">
          <div className="hero-badges">
            <span className="hero-rank-badge">
              <span className="rank-dot" /> TOP 1 EN TENDENCIAS
            </span>
            <span className="badge-pill badge-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {rating}
            </span>
            <span className="badge-pill badge-format">{format}</span>
            <span className="hero-meta-tag">{year}</span>
            <span className="hero-meta-tag">{ageRating}</span>
          </div>

          <h1 className="hero-title">{title}</h1>

          <p className="hero-synopsis">
            {attributes.synopsis ||
              attributes.description ||
              "Descubre esta increíble historia llena de acción, misterio y aventura en nuestra selección destacada."}
          </p>

          <div className="hero-actions">
            <Link to={`/anime/${anime.id}`} className="btn-anime-primary hero-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Ver Detalles
            </Link>

            <button
              type="button"
              onClick={handleToggleList}
              className={`hero-btn ${isSaved ? "btn-anime-saved" : "btn-anime-secondary"}`}
              aria-label={isSaved ? "Quitar de Mi Lista" : "Añadir a Mi Lista"}
            >
              {isSaved ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  En Mi Lista
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Mi Lista
                </>
              )}
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroBanner;
