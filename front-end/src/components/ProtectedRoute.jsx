import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "react-bootstrap";

export const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth === undefined) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-black text-light">
        <Spinner animation="border" variant="warning" className="me-2" />
        <span>Verificando autenticación con AuthContext...</span>
      </div>
    );
  }

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
