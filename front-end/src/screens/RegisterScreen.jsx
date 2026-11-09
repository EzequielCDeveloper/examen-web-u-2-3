import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerApi } from "../api/user";

export const RegisterScreen = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      const msg = "El correo electrónico es obligatorio.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 8) {
      const msg = "La contraseña debe tener al menos 8 caracteres.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (password !== passwordConfirm) {
      const msg = "Las contraseñas no coinciden.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
      };
      if (username.trim()) payload.username = username.trim();
      if (telefono.trim()) payload.telefono = telefono.trim();

      const res = await registerApi(payload);
      toast.success(
        res.message || "¡Usuario registrado exitosamente en Django! Inicia sesión."
      );
      navigate("/login");
    } catch (err) {
      const msg = err.message || "Error al registrar usuario.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="streaming-login-container">
      <div className="streaming-login-box">
        <h1 className="streaming-login-title">Crear nueva cuenta</h1>

        {errorMsg && (
          <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="streaming-login-form">
          <div className="streaming-input-group mb-3">
            <input
              type="text"
              className="streaming-input"
              placeholder="Nombre de usuario (opcional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="streaming-input-group mb-3">
            <input
              type="email"
              className="streaming-input"
              placeholder="Correo electrónico *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="streaming-input-group mb-3">
            <input
              type="tel"
              className="streaming-input"
              placeholder="Teléfono móvil (ej. 5512345678)"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="streaming-input-group mb-3">
            <input
              type="password"
              className="streaming-input"
              placeholder="Contraseña (mínimo 8 caracteres) *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="streaming-input-group mb-3">
            <input
              type="password"
              className="streaming-input"
              placeholder="Confirmar contraseña *"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
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
                Registrando en Django REST...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        <div className="streaming-login-switch">
          <p className="text-muted mb-2">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-warning text-decoration-none fw-bold">
              Inicia sesión aquí.
            </Link>
          </p>

          <p className="streaming-disclaimer">
            Endpoint conectado a /api/v1/auth/register/ con hashing seguro PBKDF2 y validaciones en Django.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
