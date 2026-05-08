import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";

/**
 * Navbar component que muestra diferente contenido según el rol del usuario
 * @param {Object} props
 * @param {string} props.pageTitle - Título de la página actual
 * @param {string} props.pageSubtitle - Subtítulo de la página actual
 */
function Navbar({ pageTitle, pageSubtitle }) {
  const { user, logout, authFetch } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user?.rol === "aprendiz" && user?.id_user) {
      // 1. Disparar el check-in proactivo
      authFetch("http://localhost:5000/api/notifications/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id_user })
      }).then(() => {
        // 2. Traer notificaciones
        fetchNotifications();
      }).catch(e => console.error(e));
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await authFetch(`http://localhost:5000/api/notifications/${user.id_user}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReadNotification = async (notif) => {
    try {
      if (!notif.is_read) {
        await authFetch(`http://localhost:5000/api/notifications/${notif.id_notification}/read`, { method: "PUT" });
        setNotifications(prev => prev.map(n => n.id_notification === notif.id_notification ? { ...n, is_read: 1 } : n));
      }
      setShowDropdown(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Colores del ícono según rol
  const iconColors = {
    aprendiz: "#000000ff",
    psicologo: "#000000ff",
    administrador: "#000000ff",
  };

  // Links del dropdown según rol
  const getDropdownItems = () => {
    switch (user?.rol) {
      case "aprendiz":
        return (
          <>
            <li>
              <Link className="dropdown-item" to="/mi-cuenta">
                Ajustes de cuenta
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" to="/" onClick={logout}>
                Cerrar sesión
              </Link>
            </li>
          </>
        );
      case "psicologo":
        return (
          <>
            <li>
              <Link className="dropdown-item" to="/mi-cuenta-psi">
                Ajustes de cuenta
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" to="/" onClick={logout}>
                Cerrar sesión
              </Link>
            </li>
          </>
        );
      case "administrador":
        return (
          <>
            <li>
              <Link className="dropdown-item" to="/" onClick={logout}>
                Cerrar sesión
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <span className="dropdown-item-text">id: {user?.document}</span>
            </li>
          </>
        );
      default:
        return (
          <li>
            <Link className="dropdown-item" to="/" onClick={logout}>
              Cerrar sesión
            </Link>
          </li>
        );
    }
  };

  const iconColor = iconColors[user?.rol] || "rgb(0, 0, 0)";

  return (
    <nav className="sb-topnav navbar navbar-expand navbar-light bg-white">
      {/* Navbar Brand */}
      <div className="navbar-brand bg-light-green ps-3 pt-3">
        <span
          className="text-decoration-none brand-text"
          style={{ color: "white" }}
        >
          Psychoway
        </span>
      </div>

      {/* Sidebar Toggle */}
      <button
        className="btn btn-link btn-sm order-1 order-lg-0 me-0 me-lg-1 ms-lg-4"
        id="sidebarToggle"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Nombre de sección */}
      <div className="navbar-text ms-2 ms-lg-4 p-2 p-lg-4">
        <div className="lh-base">
          <h2 className="fw-semibold m-0 text-dark page-title">{pageTitle}</h2>
          <p className="text m-0 page-subtitle" style={{ color: "#8C8C8D" }}>
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Navbar User Menu & Notifications */}
      <ul className="navbar-nav ms-auto me-0 me-lg-5 align-items-center flex-row gap-3 pe-3">
        {user?.rol === "aprendiz" && (
          <li className="nav-item position-relative">
            <button className="btn btn-link nav-link position-relative p-0 m-0" onClick={() => setShowDropdown(!showDropdown)}>
              <Bell size={24} color="#000" />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize:"0.6rem"}}>
                  {unreadCount}
                </span>
              )}
            </button>
            {showDropdown && (
              <div className="dropdown-menu dropdown-menu-end show shadow rounded-3 border-0 mt-2" style={{width: 320, position: "absolute", right: 0, top: "100%"}}>
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light rounded-top">
                  <h6 className="m-0 fw-bold">Notificaciones</h6>
                </div>
                {notifications.length === 0 ? (
                   <div className="p-4 text-center text-muted small">No tienes notificaciones nuevas.</div>
                ) : (
                  <div style={{maxHeight: 350, overflowY: "auto"}}>
                    {notifications.map(n => (
                      <button key={n.id_notification} className={`dropdown-item text-wrap py-2 border-bottom ${n.is_read ? 'text-muted bg-white' : 'fw-semibold bg-light'}`}
                        onClick={() => handleReadNotification(n)} style={{fontSize: "0.85rem"}}>
                        {n.message}
                        <br/>
                        <small className="text-muted" style={{fontSize: "0.7rem"}}>{new Date(n.created_at).toLocaleDateString()}</small>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        )}
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle text-center"
            id="navbarDropdown"
            href="#!"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i
              className="fa-regular fa-circle-user fa-fw fa-2x"
              style={{ color: iconColor }}
            ></i>{" "}
            {user?.names || "Usuario"}
          </a>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="navbarDropdown"
          >
            {getDropdownItems()}
          </ul>
        </li>
      </ul>
      <style>{`
                .brand-text {
                    font-size: 24px;
                }
                .page-title {
                    font-size: 20px;
                }
                .page-subtitle {
                    font-size: 14px;
                }
                @media (min-width: 992px) {
                    .brand-text {
                        font-size: 40px;
                    }
                    .page-title {
                        font-size: 30px;
                    }
                    .page-subtitle {
                        font-size: 18px;
                    }
                }
            `}</style>
    </nav>
  );
}

export default Navbar;
