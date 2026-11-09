import { useState, useEffect } from "react";
import { Card, Button, Spinner, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const ANIME_QUOTES = [
  {
    quote: "Si no arriesgas nada, no puedes ganar nada.",
    character: "Eren Jaeger",
    anime: "Shingeki no Kyojin",
  },
  {
    quote: "Trabajar duro es inútil para aquellos que no creen en sí mismos.",
    character: "Naruto Uzumaki",
    anime: "Naruto Shippuden",
  },
  {
    quote: "Si no puedes hacer algo, no lo hagas. Concéntrate en lo que sí puedes hacer.",
    character: "Shiroe",
    anime: "Log Horizon",
  },
  {
    quote: "El poder surge en respuesta a una necesidad, no a un deseo.",
    character: "Goku",
    anime: "Dragon Ball Z",
  },
  {
    quote: "Nadie sabe lo que depara el futuro. Por eso su potencial es infinito.",
    character: "Rintaro Okabe",
    anime: "Steins;Gate",
  },
];

export const ThirdPartyWidget = () => {
  const [anime, setAnime] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Consumo de API de Terceros usando fetch() nativo según la rúbrica de la Unidad 3
  const fetchSurpriseAnime = async () => {
    setLoading(true);
    setError(null);
    try {
      // Offset pseudo-aleatorio para seleccionar una recomendación destacada del edge de Kitsu
      const randomOffset = Math.floor(Math.random() * 40);
      const url = `https://kitsu.io/api/edge/anime?sort=-averageRating&page[limit]=1&page[offset]=${randomOffset}`;

      console.log("[ThirdPartyWidget] Consumiendo API externa con fetch():", url);
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.api+json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const json = await response.json();
      if (json.data && json.data.length > 0) {
        setAnime(json.data[0]);
      } else {
        throw new Error("No se obtuvieron registros de la API.");
      }
    } catch (err) {
      console.error("Error al consumir API externa de anime:", err);
      setError("No se pudo cargar la recomendación externa.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextRecommendation = () => {
    setQuoteIndex((prev) => (prev + 1) % ANIME_QUOTES.length);
    fetchSurpriseAnime();
  };

  useEffect(() => {
    fetchSurpriseAnime();
  }, []);

  const currentQuote = ANIME_QUOTES[quoteIndex];
  const attributes = anime?.attributes;

  return (
    <Card className="third-party-widget bg-dark border-secondary border-opacity-50 text-light shadow-lg my-4 overflow-hidden">
      <Card.Header className="bg-black bg-opacity-60 border-secondary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-5">✨</span>
          <h5 className="mb-0 text-white font-weight-bold">
            Recomendación Sorpresa del Catálogo{" "}
            <span className="text-warning">(API Externa vía fetch)</span>
          </h5>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <Badge bg="warning" text="dark" className="px-2 py-1 fw-bold">
            fetch() API
          </Badge>
          <Badge bg="secondary" className="px-2 py-1 font-monospace">
            kitsu.io/api/edge
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        <div className="row g-4 align-items-center">
          {/* Tarjeta de Anime Recomendado */}
          <div className="col-12 col-lg-8">
            {loading ? (
              <div className="py-5 text-center">
                <Spinner animation="border" variant="warning" />
                <p className="text-muted small mt-2">
                  Consultando recomendación en vivo con <code>fetch()</code>...
                </p>
              </div>
            ) : error ? (
              <div className="alert alert-danger py-2 px-3 small">{error}</div>
            ) : anime && attributes ? (
              <div className="d-flex flex-column flex-sm-row gap-3 p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25">
                {attributes.posterImage?.small && (
                  <img
                    src={attributes.posterImage.small}
                    alt={attributes.canonicalTitle}
                    className="rounded shadow-sm"
                    style={{
                      width: "120px",
                      height: "170px",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div className="d-flex flex-column justify-content-between flex-grow-1">
                  <div>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <h4 className="text-warning mb-0 fs-5">
                        {attributes.canonicalTitle}
                      </h4>
                      {attributes.averageRating && (
                        <span className="badge bg-success px-2 py-1">
                          ⭐ {Number(attributes.averageRating).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <span className="badge bg-secondary mb-2">
                      {attributes.subtype?.toUpperCase() || "ANIME"} •{" "}
                      {attributes.episodeCount
                        ? `${attributes.episodeCount} Episodios`
                        : "En emisión"}
                    </span>
                    <p
                      className="text-muted small mb-3"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {attributes.synopsis || "Sin sinopsis disponible."}
                    </p>
                  </div>

                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <Link
                      to={`/anime/${anime.id}`}
                      className="btn btn-warning btn-sm text-dark fw-bold px-3"
                    >
                      Ver Ficha y Reproductor
                    </Link>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleNextRecommendation}
                      className="d-flex align-items-center gap-1"
                    >
                      ↻ Descubrir otro anime
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Cita Otaku Inspiracional */}
          <div className="col-12 col-lg-4">
            <div className="p-3 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="text-muted small text-uppercase font-monospace d-block mb-2">
                  💬 Frase del Día para el Usuario
                </span>
                <blockquote className="blockquote my-2">
                  <p className="fs-6 fst-italic text-light mb-2">
                    "{currentQuote.quote}"
                  </p>
                  <footer className="blockquote-footer text-warning small">
                    {currentQuote.character} ({currentQuote.anime})
                  </footer>
                </blockquote>
              </div>

              <div className="mt-3 pt-2 border-top border-secondary border-opacity-25 text-muted small font-monospace">
                <code>Integración viva: fetch(kitsu.io)</code>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ThirdPartyWidget;
