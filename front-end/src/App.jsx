import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { AdminLayout, ClientLayout, CommonLayout } from "./layouts";

import HomeScreen from "./screens/HomeScreen";
import ExplorarScreen from "./screens/ExplorarScreen";
import PopularesScreen from "./screens/PopularesScreen";
import MiListaScreen from "./screens/MiListaScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import AnimeScreen from "./screens/AnimeScreen";
import DashboardScreen from "./screens/admin/DashboardScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="app-layout min-vh-100 bg-black text-light">
        <Routes>
          {/* Rutas Públicas de Cliente (ClientLayout) */}
          <Route
            path="/"
            element={
              <ClientLayout>
                <HomeScreen />
              </ClientLayout>
            }
          />
          <Route
            path="/home"
            element={
              <ClientLayout>
                <HomeScreen />
              </ClientLayout>
            }
          />
          <Route
            path="/explorar"
            element={
              <ClientLayout>
                <ExplorarScreen />
              </ClientLayout>
            }
          />
          <Route
            path="/populares"
            element={
              <ClientLayout>
                <PopularesScreen />
              </ClientLayout>
            }
          />
          <Route
            path="/anime/:id"
            element={
              <ClientLayout>
                <AnimeScreen />
              </ClientLayout>
            }
          />

          {/* Rutas Comunes de Autenticación (CommonLayout) */}
          <Route
            path="/login"
            element={
              <CommonLayout>
                <LoginScreen />
              </CommonLayout>
            }
          />
          <Route
            path="/register"
            element={
              <CommonLayout>
                <RegisterScreen />
              </CommonLayout>
            }
          />

          {/* Rutas Protegidas de Usuario (ProtectedRoute) */}
          <Route
            path="/mi-lista"
            element={
              <ProtectedRoute>
                <ClientLayout>
                  <MiListaScreen />
                </ClientLayout>
              </ProtectedRoute>
            }
          />

          {/* Ruta Protegida de Dashboard (AdminLayout & AuthContext) */}
          <Route
            path="/dashboard"
            element={
              <AdminLayout>
                <DashboardScreen />
              </AdminLayout>
            }
          />

          {/* Ruta Comodín 404 */}
          <Route
            path="*"
            element={
              <CommonLayout>
                <NotFoundScreen />
              </CommonLayout>
            }
          />
        </Routes>

        {/* Notificaciones globales react-toastify */}
        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </AuthProvider>
  );
}

export default App;
