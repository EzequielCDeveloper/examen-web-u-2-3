import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

export const NotFoundScreen = () => {
  return (
    <Container fluid="xl" className="text-center py-5 my-5">
      <div className="empty-state-box py-5">
        <div className="display-1 font-weight-bold text-warning mb-2">404</div>
        <h2 className="mb-3">Página No Encontrada</h2>
        <p className="text-muted mb-4 max-w-md mx-auto">
          El anime, ruta o contenido que estás buscando no existe o ha sido movido a otra dimensión.
        </p>
        <Link to="/" className="btn-anime-primary">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="me-2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Volver a la Página Principal
        </Link>
      </div>
    </Container>
  );
};

export default NotFoundScreen;
