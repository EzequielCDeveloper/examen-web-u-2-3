import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getAnime,
  toggleMyList,
  fetchPopularAnime,
  fetchAnimeReviews,
  saveAnimeReview,
  deleteAnimeReview,
} from "../redux/actions/anime";
import { Container, Row, Col, Modal } from "react-bootstrap";
import AnimeRail from "../components/AnimeRail";

const AnimeScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const animeDetails = useSelector((state) => state.animeDetails);
  const myList = useSelector((state) => state.myList);
  const popular = useSelector((state) => state.popular);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const reviewsState = useSelector((state) => state.reviews) || {
    reviews: [],
    count: 0,
    averageRating: null,
    userReview: null,
    saving: false,
  };

  const [activeTab, setActiveTab] = useState("episodes");
  const [showTrailer, setShowTrailer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");

  const hasPopular = Boolean(popular && popular.length > 0);

  useEffect(() => {
    dispatch(getAnime(id));
    dispatch(fetchAnimeReviews(id));
    if (!hasPopular) {
      dispatch(fetchPopularAnime(10));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch, id, hasPopular]);

  const anime = animeDetails?.data;
  const episodes = animeDetails?.episodes || [];
  const genres = animeDetails?.genres || [];
  const loading = animeDetails?.loading;

  if (loading || !anime || !anime.attributes) {
    return (
      <div className="anime-screen-loading py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-muted mt-3">Cargando información del anime...</p>
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

  const poster =
    attributes.posterImage?.large ||
    attributes.posterImage?.medium ||
    attributes.posterImage?.original;

  const title =
    attributes.titles?.en ||
    attributes.titles?.en_jp ||
    attributes.canonicalTitle ||
    "Anime";

  const rating = attributes.averageRating
    ? (parseFloat(attributes.averageRating) / 10).toFixed(1)
    : "8.5";

  const year = attributes.startDate
    ? new Date(attributes.startDate).getFullYear()
    : "N/A";

  const format = attributes.subtype || attributes.showType || "TV";
  const status = attributes.status === "finished" ? "Finalizado" : "En emisión";
  const ageGuide = attributes.ageRatingGuide || attributes.ageRating || "Público general";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentRating =
    userRating ||
    (reviewsState.userReview?.rating
      ? Math.round(reviewsState.userReview.rating / 2)
      : 0);

  const handleStarClick = async (star) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setUserRating(star);
    const score = star * 2;
    const res = await dispatch(
      saveAnimeReview({
        animeId: id,
        rating: score,
        comment: reviewComment || reviewsState.userReview?.comment || "",
      })
    );
    if (res?.success) {
      setReviewFeedback(`Puntuación de ${score}/10 sincronizada con el backend.`);
      setTimeout(() => setReviewFeedback(""), 3000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const scoreToSend = (currentRating || 5) * 2;
    const res = await dispatch(
      saveAnimeReview({
        animeId: id,
        rating: scoreToSend,
        comment: reviewComment,
      })
    );
    if (res?.success) {
      setReviewFeedback("¡Tu reseña se ha publicado exitosamente en el servidor!");
      setTimeout(() => setReviewFeedback(""), 3500);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    await dispatch(deleteAnimeReview(reviewId, id));
    setUserRating(0);
    setReviewComment("");
    setReviewFeedback("Reseña eliminada.");
    setTimeout(() => setReviewFeedback(""), 3000);
  };

  const recommendedList = Array.isArray(popular)
    ? popular.filter((item) => item.id !== anime.id)
    : [];

  return (
    <div className="anime-detail-screen">
      {/* 1. Backdrop Hero Section with full edge fade */}
      <div className="detail-hero-section">
        {backdrop && (
          <img
            src={backdrop}
            alt={title}
            className="detail-hero-backdrop"
          />
        )}
        <div className="detail-hero-gradient" />
      </div>

      {/* 2. Main Content & Meta */}
      <Container fluid="xl" className="detail-content-container">
        {/* Breadcrumb */}
        <nav className="detail-breadcrumb mb-3">
          <Link to="/" className="breadcrumb-link">Inicio</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/explorar" className="breadcrumb-link">Explorar</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{title}</span>
        </nav>

        <Row className="g-4 g-lg-5 align-items-start">
          {/* Left Column: Floating Poster (Sharp Edges) */}
          <Col xs={12} sm={5} md={4} lg={3} className="text-center text-sm-start">
            <div className="detail-poster-wrapper detail-poster-sharp">
              <img
                src={poster}
                alt={title}
                className="detail-poster-img"
              />
              <div className="detail-poster-badges">
                <span className="badge-pill badge-rating">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {rating} / 10
                </span>
                <span className="badge-pill badge-format">{format}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="detail-actions-column mt-3 d-flex flex-column gap-2">
              <button
                type="button"
                onClick={() => dispatch(toggleMyList(anime))}
                className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 ${
                  isSaved ? "btn-anime-saved" : "btn-anime-primary"
                }`}
              >
                {isSaved ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    En Mi Lista
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Añadir a Mi Lista
                  </>
                )}
              </button>

              {attributes.youtubeVideoId && (
                <button
                  type="button"
                  onClick={() => setShowTrailer(true)}
                  className="btn-anime-secondary w-100 justify-content-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Ver Trailer Oficial
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="btn-anime-secondary w-100 justify-content-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {copiedLink ? "Enlace Copiado" : "Compartir Anime"}
              </button>
            </div>
          </Col>

          {/* Right Column: Titles, Metrics & Synopsis */}
          <Col xs={12} sm={7} md={8} lg={9}>
            <div className="detail-header-info">
              <h1 className="detail-title">{title}</h1>
              {attributes.titles?.ja_jp && (
                <p className="detail-original-title">{attributes.titles.ja_jp}</p>
              )}

              {/* Genre Chips */}
              <div className="detail-genres d-flex flex-wrap gap-2 my-3">
                {genres.map((g) => (
                  <span key={g.id} className="genre-badge-chip">
                    {g.attributes?.name}
                  </span>
                ))}
                {genres.length === 0 && (
                  <>
                    <span className="genre-badge-chip">Animación</span>
                    <span className="genre-badge-chip">Aventura</span>
                  </>
                )}
              </div>

              {/* Key Metrics Grid */}
              <div className="detail-metrics-grid my-4">
                <div className="metric-box">
                  <span className="metric-label">Calificación</span>
                  <span className="metric-value accent-gold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="me-1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {rating}
                  </span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Popularidad</span>
                  <span className="metric-value">#{attributes.popularityRank || "Top"}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Episodios</span>
                  <span className="metric-value">{attributes.episodeCount || "En curso"}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Estado</span>
                  <span className="metric-value">{status}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Año</span>
                  <span className="metric-value">{year}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Clasificación</span>
                  <span className="metric-value">{ageGuide}</span>
                </div>
              </div>

              {/* Synopsis */}
              <div className="detail-synopsis-section mb-4">
                <h3 className="section-title">
                  <span className="section-title-indicator" />
                  Sinopsis de la Serie
                </h3>
                <p className="detail-synopsis-text">
                  {attributes.synopsis || attributes.description || "Sin descripción disponible."}
                </p>
              </div>

              {/* Interactive Rating Widget Sincronizado con Backend */}
              <div className="user-rating-widget p-3 mb-4 rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="font-weight-bold">Tu valoración personal:</span>
                  {reviewsState.saving ? (
                    <span className="text-muted small">
                      <span className="spinner-border spinner-border-sm me-1" role="status" />
                      Sincronizando con Django...
                    </span>
                  ) : currentRating > 0 ? (
                    <span className="text-warning small font-weight-bold">
                      {currentRating * 2} / 10 puntos (Guardado)
                    </span>
                  ) : (
                    <span className="text-muted small">Toca una estrella para calificar</span>
                  )}
                </div>

                <div className="stars-wrapper d-inline-flex gap-1 align-items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${currentRating >= star ? "star-active" : ""}`}
                      onClick={() => handleStarClick(star)}
                      aria-label={`Calificar con ${star} estrellas`}
                      disabled={reviewsState.saving}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>

                {reviewFeedback && (
                  <div className="mt-2 text-success small font-weight-bold">
                    ✓ {reviewFeedback}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* 3. Navigation Tabs */}
        <div className="detail-tabs-header mt-5 mb-4 border-bottom border-dark pb-2">
          <div className="d-flex gap-3">
            <button
              type="button"
              className={`detail-tab-btn ${activeTab === "episodes" ? "active" : ""}`}
              onClick={() => setActiveTab("episodes")}
            >
              Capítulos ({episodes.length || attributes.episodeCount || "Lista"})
            </button>
            <button
              type="button"
              className={`detail-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reseñas de la Comunidad ({reviewsState.count})
            </button>
          </div>
        </div>

        {/* Tab 1: Episodes */}
        {activeTab === "episodes" && (
          <div className="episodes-tab-content mb-5">
            {episodes.length === 0 ? (
              <p className="text-muted">
                {attributes.episodeCount
                  ? `Esta serie cuenta con ${attributes.episodeCount} episodios emitidos.`
                  : "Episodios no listados para este título."}
              </p>
            ) : (
              <Row className="g-3">
                {episodes.map((ep) => (
                  <Col key={ep.id} xs={12} md={6}>
                    <div className="episode-card p-3 d-flex gap-3 align-items-center">
                      <div className="episode-thumbnail-box">
                        {ep.attributes?.thumbnail?.original ? (
                          <img
                            src={ep.attributes.thumbnail.original}
                            alt={`Episodio ${ep.attributes.number}`}
                            className="episode-thumb-img"
                          />
                        ) : (
                          <div className="episode-thumb-placeholder">
                            Ep. {ep.attributes?.number}
                          </div>
                        )}
                        <span className="episode-number-badge">
                          EP {ep.attributes?.number}
                        </span>
                      </div>
                      <div className="episode-info">
                        <h4 className="episode-title mb-1">
                          {ep.attributes?.canonicalTitle ||
                            ep.attributes?.titles?.en_us ||
                            `Episodio ${ep.attributes?.number}`}
                        </h4>
                        <p className="episode-synopsis small text-muted mb-0">
                          {ep.attributes?.synopsis
                            ? ep.attributes.synopsis.slice(0, 95) + "..."
                            : "Disponible para reproducir."}
                        </p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Tab 2: Reviews Sincronizadas con Django */}
        {activeTab === "reviews" && (
          <div className="reviews-tab-content mb-5">
            {/* Header con estadísticas comunitarias reales */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 p-3 rounded bg-dark border border-secondary border-opacity-25">
              <div>
                <h4 className="mb-1">Comunidad SelectAnime</h4>
                <p className="text-muted small mb-0">
                  {reviewsState.count > 0
                    ? `${reviewsState.count} reseña${reviewsState.count > 1 ? "s" : ""} registrada${reviewsState.count > 1 ? "s" : ""} en la base de datos.`
                    : "Sé el primero en compartir tu experiencia sobre esta serie."}
                </p>
              </div>
              {reviewsState.averageRating && (
                <div className="text-sm-end mt-2 mt-sm-0">
                  <span className="text-muted small">Promedio Comunidad</span>
                  <div className="h4 text-warning mb-0 font-weight-bold">
                    ★ {reviewsState.averageRating} / 10
                  </div>
                </div>
              )}
            </div>

            {/* Formulario de redacción de reseña */}
            <div className="review-form-box p-3 mb-4 rounded bg-dark border border-secondary border-opacity-25">
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit}>
                  <label htmlFor="review-textarea" className="font-weight-bold mb-2 small text-light">
                    {reviewsState.userReview ? "Editar mi reseña:" : "Escribir una reseña:"}
                  </label>
                  <textarea
                    id="review-textarea"
                    rows="3"
                    className="form-control bg-black text-light border-secondary mb-3"
                    placeholder="Comparte qué te pareció la trama, la animación, personajes o banda sonora..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                      Puntuación seleccionada: <strong>{(currentRating || 5) * 2} / 10</strong>
                    </span>
                    <button
                      type="submit"
                      className="btn-anime-primary btn-sm px-3"
                      disabled={reviewsState.saving}
                    >
                      {reviewsState.saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Guardando...
                        </>
                      ) : reviewsState.userReview ? (
                        "Actualizar Reseña"
                      ) : (
                        "Publicar Reseña"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted small mb-2">
                    ¿Ya viste esta serie? Inicia sesión con tu cuenta para calificarla y publicar tu reseña.
                  </p>
                  <Link to="/login" className="btn-anime-primary btn-sm">
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>

            {/* Listado dinámico de reseñas reales */}
            {reviewsState.reviews && reviewsState.reviews.length > 0 ? (
              <Row className="g-4">
                {reviewsState.reviews.map((rev) => (
                  <Col key={rev.id} xs={12} md={6}>
                    <div className="review-card p-3 rounded h-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="review-avatar">
                              {rev.username ? rev.username.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <strong>{rev.username}</strong>
                              <div className="text-muted small">
                                {rev.created_at
                                  ? new Date(rev.created_at).toLocaleDateString()
                                  : "Reciente"}
                              </div>
                            </div>
                          </div>
                          <span className="text-warning small font-weight-bold">
                            ★ {rev.rating} / 10
                          </span>
                        </div>
                        <p className="text-muted small mb-3">
                          {rev.comment || "Sin comentario escrito, solo calificación por estrellas."}
                        </p>
                      </div>

                      {rev.is_author && (
                        <div className="text-end border-top border-secondary border-opacity-25 pt-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="btn btn-sm text-danger p-0 border-0 bg-transparent"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Eliminar mi reseña
                          </button>
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-4 border border-secondary border-opacity-25 rounded p-4">
                <p className="text-muted mb-0">
                  Aún no hay reseñas registradas para este anime en la base de datos.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. Recommendations Rail */}
        {recommendedList.length > 0 && (
          <AnimeRail
            title="Recomendaciones para Ti"
            animes={recommendedList}
            seeMoreLink="/explorar"
          />
        )}
      </Container>

      {/* Trailer Modal */}
      {attributes.youtubeVideoId && (
        <Modal
          show={showTrailer}
          onHide={() => setShowTrailer(false)}
          size="lg"
          centered
          contentClassName="bg-dark text-white border-secondary"
        >
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title>{title} - Trailer Oficial</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div className="ratio ratio-16x9">
              <iframe
                src={`https://www.youtube.com/embed/${attributes.youtubeVideoId}?autoplay=1`}
                title={`${title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default AnimeScreen;
