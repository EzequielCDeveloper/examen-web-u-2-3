import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import { Spinner, Container } from "react-bootstrap";

export function AdminLayout({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth === undefined) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-black text-light">
        <Spinner animation="border" variant="warning" className="me-2" />
        <span>Verificando sesión con AuthContext...</span>
      </div>
    );
  }

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-layout d-flex flex-column min-vh-100 bg-black text-light">
      <Header />
      <main className="flex-grow-1">
        <Container fluid="xl" className="py-3">
          <div className="badge bg-warning text-dark mb-2 px-3 py-2 fw-bold">
            🛡️ Vista Protegida por AdminLayout & AuthContext
          </div>
          {children}
        </Container>
      </main>
    </div>
  );
}

export default AdminLayout;
