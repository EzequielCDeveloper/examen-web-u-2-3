import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTop100 } from "../redux/actions/anime";
import { Container, Row, Col } from "react-bootstrap";
import Anime from "../components/Anime";

const RANGE_TABS = [
  { label: "Top 1 - 100", range: [0, 100] },
  { label: "#1 - #20", range: [0, 20] },
  { label: "#21 - #40", range: [20, 40] },
  { label: "#41 - #60", range: [40, 60] },
  { label: "#61 - #80", range: [60, 80] },
  { label: "#81 - #100", range: [80, 100] },
];

const PopularesScreen = () => {
  const dispatch = useDispatch();
  const top100State = useSelector((state) => state.top100) || {
    items: [],
    loading: false,
    error: null,
  };
  const { items, loading, error } = top100State;

  const [filterSort, setFilterSort] = useState("-user_count");
  const [activeRange, setActiveRange] = useState(0); // 0 = All 100

  useEffect(() => {
    dispatch(fetchTop100(filterSort));
  }, [dispatch, filterSort]);

  const animeList = Array.isArray(items) ? items : [];
  const [startIdx, endIdx] = RANGE_TABS[activeRange].range;
  const visibleList = animeList.slice(startIdx, endIdx);

  const handleRetry = () => {
    dispatch(fetchTop100(filterSort));
  };

  return (
    <Container fluid="xl" className="populares-screen py-4">
      {/* Header */}
      <div className="populares-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center my-4 gap-3">
        <div>
          <h1 className="display-title">
            Top 100 <span className="brand-accent">Populares</span>
          </h1>
          <p className="text-muted mb-0">
            {filterSort === "-user_count"
              ? "El ranking oficial de los 100 animes con mayor audiencia y seguidores"
              : "El ranking oficial de los 100 animes con la más alta calificación crítica"}
          </p>
        </div>

        {/* Filter Tabs: Más Vistos vs Mejor Puntuados */}
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill-btn ${filterSort === "-user_count" ? "active" : ""}`}
            onClick={() => setFilterSort("-user_count")}
          >
            Más Vistos
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${filterSort === "-average_rating" ? "active" : ""}`}
            onClick={() => setFilterSort("-average_rating")}
          >
            Mejor Puntuados
          </button>
        </div>
      </div>

      {/* Sub-bar: Range filter pills and count */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3 border-bottom border-secondary border-opacity-25 pb-3">
        <span className="results-count">
          {loading
            ? "Cargando el ranking Top 100 desde Kitsu..."
            : `Mostrando ${visibleList.length} de ${animeList.length} animes disponibles`}
        </span>

        <div className="d-flex flex-wrap gap-1">
          {RANGE_TABS.map((tab, idx) => (
            <button
              key={tab.label}
              type="button"
              className={`btn btn-sm ${
                activeRange === idx ? "btn-anime-primary" : "btn-anime-secondary"
              } py-1 px-2`}
              style={{ fontSize: "0.75rem" }}
              onClick={() => setActiveRange(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading, Error or Grid state */}
      {loading && animeList.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-3">
            Obteniendo animes con protección de tasa de Kitsu...
          </p>
        </div>
      ) : !loading && error && animeList.length === 0 ? (
        <div className="text-center py-5">
          <div className="alert alert-warning d-inline-block py-3 px-4 text-start">
            <h5 className="mb-2">No se pudo cargar el Top 100</h5>
            <p className="small mb-3 text-muted">
              La API externa de Kitsu experimentó un límite de peticiones o fallo temporal ({error}).
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="btn-anime-primary btn-sm"
            >
              Reintentar Carga
            </button>
          </div>
        </div>
      ) : (
        /* Grid with Real Rank #1 to #100 */
        <Row className="g-3 g-md-4">
          {visibleList.map((anime, index) => {
            const globalRank = startIdx + index + 1;
            const isTop3 = globalRank <= 3;
            return (
              <Col key={anime.id} xs={6} sm={4} md={3} lg={3} xl={2}>
                <div className="ranked-card-container">
                  <span className={`rank-position-badge ${isTop3 ? `rank-${globalRank}` : ""}`}>
                    #{globalRank}
                  </span>
                  <Anime anime={anime} attributes={anime.attributes} />
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default PopularesScreen;
