import { Link } from "react-router-dom";

const Anime = ({ anime, attributes }) => {
  if (!attributes) return null;

  const poster =
    attributes.posterImage?.large ||
    attributes.posterImage?.medium ||
    attributes.posterImage?.original;

  const title =
    attributes.titles?.en ||
    attributes.titles?.en_jp ||
    attributes.canonicalTitle ||
    "Sin título";

  const rating = attributes.averageRating
    ? (parseFloat(attributes.averageRating) / 10).toFixed(1)
    : null;

  const year = attributes.startDate
    ? new Date(attributes.startDate).getFullYear()
    : null;

  const format = attributes.subtype || attributes.showType || "TV";

  return (
    <div className="anime-card-wrapper my-2">
      <Link
        to={`/anime/${anime.id}`}
        className="anime-card anime-card-sharp"
        aria-label={`Ver detalles de ${title}`}
      >
        {/* Top Badges */}
        <div className="anime-badges-top">
          {rating ? (
            <span className="badge-pill badge-rating">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {rating}
            </span>
          ) : (
            <span />
          )}
          <span className="badge-pill badge-format">
            {format}
          </span>
        </div>

        {/* Poster Image (Sin borde redondeado) */}
        {poster && (
          <img
            src={poster}
            alt={title}
            className="anime-poster-img anime-poster-sharp"
            loading="lazy"
          />
        )}

        {/* Gradient Scrim */}
        <div className="anime-card-scrim" />

        {/* Bottom Content */}
        <div className="anime-card-content">
          <h3 className="anime-card-title" title={title}>
            {title}
          </h3>
          <div className="anime-card-meta">
            {year && <span>{year}</span>}
            {year && attributes.episodeCount && (
              <span className="anime-card-meta-dot" />
            )}
            {attributes.episodeCount && (
              <span>{attributes.episodeCount} eps</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Anime;
