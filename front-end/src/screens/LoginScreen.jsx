import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { loginApi } from "../api/user";

export const LoginScreen = () => {
  const { login, auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim() || !password) {
      const msg = "Por favor ingresa tanto el correo como la contraseña.";
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      // Conectar formulario de React con endpoint JWT en Django (/api/v1/auth/token/)
      const response = await loginApi({ email: email.trim(), password });
      const { access, refresh } = response;

      // Imprimir token en consola para evidencia requerida en la evaluación
      console.log("==================================================");
      console.log("Token JWT obtenido exitosamente de Django:");
      console.log("Access Token:", access);
      if (refresh) console.log("Refresh Token:", refresh);
      console.log("Respuesta completa de autenticación:", response);
      console.log("==================================================");

      // Guardar token en localStorage y actualizar AuthContext
      if (refresh) {
        localStorage.setItem("anime_refresh", refresh);
      }
      await login(access);

      toast.success("¡Inicio de sesión exitoso! Redirigiendo al Dashboard...");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      const msg = err.message || "Usuario o contraseña incorrecta.";
      setLocalError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("usuario_vip@selectanime.com");
    setPassword("Anime1234!");
    setLocalError("");
    setLoading(true);
    try {
      const response = await loginApi({
        email: "usuario_vip@selectanime.com",
        password: "Anime1234!",
      });
      const { access, refresh } = response;

      console.log("==================================================");
      console.log("Token JWT obtenido exitosamente de Django (Usuario Demo VIP):");
      console.log("Access Token:", access);
      console.log("==================================================");

      if (refresh) {
        localStorage.setItem("anime_refresh", refresh);
      }
      await login(access);

      toast.success("¡Bienvenido Usuario VIP! Redirigiendo...");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Error al autenticar usuario demo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    setEmail("admin@animerecommended.com");
    setPassword("Admin1234!");
    setLocalError("");
    setLoading(true);
    try {
      const response = await loginApi({
        email: "admin@animerecommended.com",
        password: "Admin1234!",
      });
      const { access, refresh } = response;

      console.log("==================================================");
      console.log("Token JWT obtenido exitosamente de Django (Administrador):");
      console.log("Access Token:", access);
      console.log("==================================================");

      if (refresh) {
        localStorage.setItem("anime_refresh", refresh);
      }
      await login(access);

      toast.success("¡Bienvenido Administrador! Redirigiendo...");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Error al autenticar admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="streaming-login-container">
      <div className="streaming-login-box">
        <h1 className="streaming-login-title">Iniciar sesión</h1>

        {localError && (
          <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="streaming-login-form">
          <div className="streaming-input-group mb-3">
            <input
              type="email"
              className="streaming-input"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="streaming-input-group mb-3">
            <input
              type="password"
              className="streaming-input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="streaming-submit-btn mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Autenticando en Django...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>

          <div className="d-flex flex-column gap-2 mb-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="streaming-demo-btn"
              disabled={loading}
            >
              Acceso Rápido Demo (Usuario VIP)
            </button>
            <button
              type="button"
              onClick={handleAdminDemoLogin}
              className="btn btn-outline-warning btn-sm"
              disabled={loading}
            >
              Acceso Administrador (Staff)
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center text-muted small mb-4">
            <label className="d-flex align-items-center gap-2 pointer m-0">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="checkbox-custom"
              />
              Recuérdame
            </label>
            <span className="text-muted">SimpleJWT + AuthContext</span>
          </div>
        </form>

        <div className="streaming-login-switch">
          <p className="text-muted mb-2">
            ¿Primera vez en Anime Recommended?{" "}
            <Link to="/register" className="text-warning text-decoration-none fw-bold">
              Suscríbete ahora (Registro).
            </Link>
          </p>

          <p className="streaming-disclaimer">
            Autenticación conectada al backend REST de Django con tokens JWT (SimpleJWT).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
