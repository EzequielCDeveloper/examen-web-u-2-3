import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { toggleMyList } from "../redux/actions/anime";
import Anime from "../components/Anime";

const MiListaScreen = () => {
  const dispatch = useDispatch();
  const myList = useSelector((state) => state.myList);

  return (
    <Container fluid="xl" className="mi-lista-screen py-4">
      {/* Header */}
      <div className="my-lista-header my-4">
        <h1 className="display-title">
          Mi <span className="brand-accent">Lista</span>
        </h1>
        <p className="text-muted">
          Tus animes favoritos guardados para ver más tarde o consultar recomendaciones
        </p>
      </div>

      {/* Empty State */}
      {!myList || myList.length === 0 ? (
        <div className="empty-list-card text-center py-5 my-4">
          <div className="empty-list-icon-wrapper mb-3">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="mb-2">Tu lista está vacía</h2>
          <p className="text-muted mb-4 max-w-md mx-auto">
            Explora las tendencias o busca tus animes favoritos y agrégalos a tu lista personal con un solo clic.
          </p>
          <Link to="/explorar" className="btn-anime-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Explorar Animes
          </Link>
        </div>
      ) : (
        /* Grid of Saved Anime */
        <Row className="g-3 g-md-4">
          {myList.map((anime) => (
            <Col key={anime.id} xs={6} sm={4} md={3} lg={3} xl={2}>
              <div className="saved-item-container">
                <button
                  type="button"
                  className="remove-from-list-btn"
                  onClick={() => dispatch(toggleMyList(anime))}
                  title="Eliminar de mi lista"
                  aria-label="Eliminar de mi lista"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <Anime anime={anime} attributes={anime.attributes} />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MiListaScreen;
