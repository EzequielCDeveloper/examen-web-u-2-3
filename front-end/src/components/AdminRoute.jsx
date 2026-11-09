import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
