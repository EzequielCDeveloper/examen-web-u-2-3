import { useSelector } from "react-redux";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Header = () => {
  const { auth, logout } = useAuth();
  const reduxAuth = useSelector((state) => state.auth);
  const myList = useSelector((state) => state.myList);
  const navigate = useNavigate();

  const user = auth?.me || reduxAuth?.user;
  const isAuthenticated = Boolean(auth?.token || reduxAuth?.isAuthenticated);
  const savedCount = Array.isArray(myList) ? myList.length : 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="glass-header">
      <Navbar variant="dark" expand="lg" collapseOnSelect className="py-2">
        <Container fluid="xl">
          <LinkContainer to="/">
            <Navbar.Brand className="brand-title">
              <span>Select</span>
              <span className="brand-accent">Anime</span>
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle
            aria-controls="main-navbar-nav"
            className="border-0 shadow-none text-light"
          />

          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="me-auto ms-lg-4 gap-1">
              <LinkContainer to="/explorar">
                <Nav.Link className="nav-link-custom">Explorar</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/populares">
                <Nav.Link className="nav-link-custom">Populares</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/mi-lista">
                <Nav.Link className="nav-link-custom d-flex align-items-center gap-1">
                  Mi Lista
                  {savedCount > 0 && (
                    <span className="nav-badge-count">{savedCount}</span>
                  )}
                </Nav.Link>
              </LinkContainer>
              {isAuthenticated && (
                <LinkContainer to="/dashboard">
                  <Nav.Link className="nav-link-custom text-warning font-weight-bold d-flex align-items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Dashboard {user?.is_staff ? "(Admin)" : ""}
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>

            {/* Login / Profile CTA */}
            <Nav className="align-items-lg-center mt-3 mt-lg-0 gap-2">
              {isAuthenticated && user ? (
                <div className="d-flex align-items-center gap-2">
                  <LinkContainer to="/dashboard">
                    <Nav.Link className="d-flex align-items-center gap-2 user-nav-pill">
                      <span className="badge bg-warning text-dark font-monospace">
                        {user.username || user.email?.split("@")[0]}
                      </span>
                    </Nav.Link>
                  </LinkContainer>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleLogout}
                    className="py-1 px-2 small text-light"
                  >
                    Salir
                  </Button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn-anime-primary nav-login-btn">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline-warning btn-sm d-none d-sm-inline-block"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
