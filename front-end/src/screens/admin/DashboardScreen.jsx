import { useState, useEffect } from "react";
import { Container, Table, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import ThirdPartyWidget from "../../components/ThirdPartyWidget";
import SoapViewerWidget from "../../components/SoapViewerWidget";
import { fetchUsersApi, updateUserApi, deleteUserApi } from "../../redux/api/users";

export const DashboardScreen = () => {
  const { auth, logout } = useAuth();
  const currentUser = auth?.me;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const isStaff = Boolean(currentUser?.is_staff);

  useEffect(() => {
    let isMounted = true;
    if (isStaff) {
      fetchUsersApi()
        .then((data) => {
          if (isMounted) {
            setUsers(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            const msg =
              err.response?.data?.detail ||
              "Error al obtener usuarios desde Django.";
            setError(msg);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isStaff]);

  const refreshUsers = async () => {
    if (!isStaff) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsersApi();
      setUsers(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Error al obtener usuarios desde Django.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (targetUser) => {
    setProcessingId(targetUser.id);
    try {
      const updated = await updateUserApi(targetUser.id, {
        is_active: !targetUser.is_active,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: updated.is_active } : u))
      );
      toast.success(
        `Usuario ${targetUser.email} ${updated.is_active ? "activado" : "desactivado"}.`
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo actualizar el estado del usuario.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStaff = async (targetUser) => {
    setProcessingId(targetUser.id);
    try {
      const updated = await updateUserApi(targetUser.id, {
        is_staff: !targetUser.is_staff,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_staff: updated.is_staff } : u))
      );
      toast.success(
        `Rol de ${targetUser.email} actualizado a ${updated.is_staff ? "Staff / Admin" : "Usuario Regular"}.`
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo actualizar el rol del usuario.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      toast.error("No puedes eliminar tu propia cuenta de administrador en sesión.");
      return;
    }
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar permanentemente al usuario ${targetUser.email}?`
    );
    if (!confirmed) return;

    setProcessingId(targetUser.id);
    try {
      await deleteUserApi(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      toast.success(`Usuario ${targetUser.email} eliminado exitosamente de la base de datos.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "No se pudo eliminar el usuario.");
    } finally {
      setProcessingId(null);
    }
  };

  const totalUsers = users.length;
  const staffUsers = users.filter((u) => u.is_staff).length;
  const activeUsers = users.filter((u) => u.is_active).length;

  return (
    <Container fluid="xl" className="dashboard-screen py-4 text-light">
      {/* Welcome Banner con AuthContext */}
      <div className="p-4 rounded-4 bg-gradient-dark border border-secondary border-opacity-50 shadow-lg mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-success px-3 py-1 fs-6">
                ● Sesión Activa (AuthContext)
              </span>
              {isStaff ? (
                <span className="badge bg-warning text-dark px-2 py-1 font-monospace">
                  Rol: Staff / Administrador
                </span>
              ) : (
                <span className="badge bg-secondary px-2 py-1 font-monospace">
                  Rol: Usuario Registrado
                </span>
              )}
            </div>
            <h1 className="display-6 font-weight-bold mb-1">
              Dashboard de Usuario
            </h1>
            <h3 className="text-warning mb-2" id="dashboard-user-greeting">
              Bienvenido, {currentUser?.username || currentUser?.email || "Usuario"}
            </h3>
            <p className="text-muted small mb-0 font-monospace">
              Correo: <span className="text-light">{currentUser?.email}</span> | ID: #{currentUser?.id} | Teléfono: {currentUser?.telefono || "No especificado"}
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={logout}
              className="d-flex align-items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Parte 2: Widget de API de Terceros con fetch() */}
      <ThirdPartyWidget />

      {/* Parte 3: Widget de Consumo SOAP con Zeep en Django */}
      <SoapViewerWidget />

      {/* Sección Administrativa si es Staff */}
      {isStaff && (
        <div className="mt-5 pt-3 border-top border-secondary border-opacity-25">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
              <h2 className="h4 text-warning mb-1">
                Panel de Gestión de Usuarios en Django REST Framework
              </h2>
              <p className="text-muted small mb-0">
                CRUD administrativo protegido con permisos IsAdminUser
              </p>
            </div>

            <Button
              variant="outline-warning"
              size="sm"
              onClick={refreshUsers}
              disabled={loading}
              className="d-flex align-items-center gap-2"
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "↻ Actualizar Usuarios"
              )}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-4">
              <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 text-center">
                <span className="text-muted small">Total Registrados</span>
                <div className="h2 mb-0 text-white font-weight-bold">{totalUsers}</div>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 text-center">
                <span className="text-muted small">Administradores (Staff)</span>
                <div className="h2 mb-0 text-warning font-weight-bold">{staffUsers}</div>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 text-center">
                <span className="text-muted small">Cuentas Activas</span>
                <div className="h2 mb-0 text-success font-weight-bold">{activeUsers}</div>
              </div>
            </div>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading && users.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
              <p className="text-muted mt-3">Consultando CRUD de usuarios en Django...</p>
            </div>
          ) : (
            <div className="table-responsive rounded border border-secondary border-opacity-25">
              <Table hover variant="dark" className="m-0 align-middle">
                <thead className="bg-black text-secondary">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3">Usuario / Email</th>
                    <th className="py-3">Teléfono</th>
                    <th className="py-3 text-center">Rol</th>
                    <th className="py-3 text-center">Estado</th>
                    <th className="py-3">Fecha de Registro</th>
                    <th className="py-3 text-end px-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-3 font-monospace small text-muted">#{u.id}</td>
                      <td>
                        <div className="font-weight-bold text-light">
                          {u.username || "Sin username"}
                        </div>
                        <div className="small text-muted">{u.email}</div>
                      </td>
                      <td className="small text-muted">{u.telefono || "—"}</td>
                      <td className="text-center">
                        {u.is_staff ? (
                          <Badge bg="warning" text="dark">
                            Staff Admin
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Usuario</Badge>
                        )}
                      </td>
                      <td className="text-center">
                        {u.is_active ? (
                          <Badge bg="success">Activo</Badge>
                        ) : (
                          <Badge bg="danger">Inactivo</Badge>
                        )}
                      </td>
                      <td className="small text-muted">
                        {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                      </td>
                      <td className="text-end px-3">
                        <div className="d-inline-flex gap-1">
                          <Button
                            variant={u.is_staff ? "outline-secondary" : "outline-warning"}
                            size="sm"
                            disabled={processingId === u.id || u.id === currentUser?.id}
                            onClick={() => handleToggleStaff(u)}
                            title={u.is_staff ? "Revocar permisos staff" : "Hacer administrador"}
                          >
                            {u.is_staff ? "Quitar Staff" : "Hacer Staff"}
                          </Button>

                          <Button
                            variant={u.is_active ? "outline-secondary" : "outline-success"}
                            size="sm"
                            disabled={processingId === u.id || u.id === currentUser?.id}
                            onClick={() => handleToggleActive(u)}
                            title={u.is_active ? "Desactivar cuenta" : "Activar cuenta"}
                          >
                            {u.is_active ? "Desactivar" : "Activar"}
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            disabled={processingId === u.id || u.id === currentUser?.id}
                            onClick={() => handleDelete(u)}
                            title="Eliminar usuario"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default DashboardScreen;
