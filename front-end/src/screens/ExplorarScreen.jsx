import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExplore } from "../redux/actions/anime";
import { Container, Row, Col } from "react-bootstrap";
import Anime from "../components/Anime";

const CATEGORIES = [
  { label: "Todos", slug: "all" },
  { label: "Acción", slug: "action" },
  { label: "Aventura", slug: "adventure" },
  { label: "Comedia", slug: "comedy" },
  { label: "Drama", slug: "drama" },
  { label: "Fantasía", slug: "fantasy" },
  { label: "Sci-Fi", slug: "sci-fi" },
  { label: "Romance", slug: "romance" },
  { label: "Misterio", slug: "mystery" },
  { label: "Terror", slug: "horror" },
  { label: "Deportes", slug: "sports" },
  { label: "Sobrenatural", slug: "supernatural" },
];

const SORT_OPTIONS = [
  { label: "Más Populares", value: "-user_count" },
  { label: "Mejor Calificados", value: "-average_rating" },
  { label: "Más Recientes", value: "-startDate" },
];

const ExplorarScreen = () => {
  const dispatch = useDispatch();
  const explore = useSelector((state) => state.explore) || { items: [], loading: false, error: null };
  const { items, loading, error } = explore;

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("-user_count");
  const [offset, setOffset] = useState(0);

  const debounceTimer = useRef(null);
  const queryRef = useRef("");

  // Conexión activa a la API: llamada al cambiar categoría o tipo de ordenación
  useEffect(() => {
    dispatch(
      fetchExplore({
        query: queryRef.current.trim(),
        category: selectedCategory,
        sort: selectedSort,
        limit: 20,
        offset: 0,
        append: false,
      })
    );
  }, [dispatch, selectedCategory, selectedSort]);

  const handleSelectCategory = (catSlug) => {
    setSelectedCategory(catSlug);
    setOffset(0);
  };

  const handleSelectSort = (sortValue) => {
    setSelectedSort(sortValue);
    setOffset(0);
  };

  // Manejo de búsqueda en tiempo real con debounce de 350ms hacia la API
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    queryRef.current = value;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setOffset(0);
      dispatch(
        fetchExplore({
          query: value.trim(),
          category: selectedCategory,
          sort: selectedSort,
          limit: 20,
          offset: 0,
          append: false,
        })
      );
    }, 350);
  };

  const handleClearQuery = () => {
    setQuery("");
    queryRef.current = "";
    setOffset(0);
    dispatch(
      fetchExplore({
        query: "",
        category: selectedCategory,
        sort: selectedSort,
        limit: 20,
        offset: 0,
        append: false,
      })
    );
  };

  // Carga paginada real desde la API (batches de 20 elementos)
  const handleLoadMore = () => {
    const nextOffset = offset + 20;
    setOffset(nextOffset);
    dispatch(
      fetchExplore({
        query: query.trim(),
        category: selectedCategory,
        sort: selectedSort,
        limit: 20,
        offset: nextOffset,
        append: true,
      })
    );
  };

  return (
    <Container fluid="xl" className="explorar-screen py-4">
      {/* Header & Search */}
      <div className="explorar-header text-center my-4">
        <h1 className="explorar-title">
          Explora el Catálogo de <span className="brand-accent">Anime</span>
        </h1>
        <p className="explorar-subtitle">
          Búsqueda y filtrado en tiempo real consumiendo la API de Kitsu
        </p>

        {/* Real-time Search Input */}
        <div className="search-form-wrapper mt-4">
          <div className="search-input-box">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar anime por título (ej. Naruto, Attack on Titan, Death Note)..."
              value={query}
              onChange={handleQueryChange}
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearQuery}
                aria-label="Limpiar búsqueda"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Active API Filter) */}
        <div className="genre-chips-container mt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={`genre-chip ${selectedCategory === cat.slug ? "active" : ""}`}
              onClick={() => handleSelectCategory(cat.slug)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar: Results count & Sort select */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center my-4 gap-3 border-bottom border-secondary border-opacity-25 pb-3">
        <span className="results-count">
          {loading && items.length === 0
            ? "Consultando API en vivo..."
            : `${items.length} títulos disponibles`}
        </span>

        <div className="d-flex align-items-center gap-2">
          <label htmlFor="sort-select" className="text-muted small mb-0">
            Ordenar por:
          </label>
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => handleSelectSort(e.target.value)}
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ width: "auto" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid, Loading or Empty State */}
      {loading && items.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-3">Obteniendo animes desde el servidor...</p>
        </div>
      ) : error ? (
        <div className="text-center py-5 text-danger">
          <p>Ocurrió un error al consultar el catálogo: {error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state-box text-center py-5">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3 className="mt-3">No se encontraron títulos</h3>
          <p className="text-muted">Prueba cambiando la palabra clave o el género seleccionado.</p>
        </div>
      ) : (
        <>
          <Row className="g-3 g-md-4">
            {items.map((anime) => (
              <Col key={anime.id} xs={6} sm={4} md={3} lg={3} xl={2}>
                <Anime anime={anime} attributes={anime.attributes} />
              </Col>
            ))}
          </Row>

          {/* Load More Button */}
          <div className="text-center my-5">
            <button
              type="button"
              className="btn-anime-secondary px-4 py-2"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Cargando más...
                </>
              ) : (
                "Cargar más títulos"
              )}
            </button>
          </div>
        </>
      )}
    </Container>
  );
};

export default ExplorarScreen;
