import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Sidebar component que muestra diferentes links según el rol del usuario
 * @param {Object} props
 * @param {string} props.currentPage - Identificador de la página actual para resaltar el link activo
 */
function Sidebar({ currentPage }) {
  const { user } = useAuth();

  // Configuración de navegación por rol
  const navigationByRole = {
    aprendiz: [
      {
        id: "diario",
        label: "Diario de\nEmociones",
        icon: "fa-solid fa-book",
        path: "/diario",
      },
      {
        id: "seguimiento",
        label: "Seguimiento\ndel Diario",
        icon: "fa-solid fa-chart-simple",
        path: "/seguimiento",
      },
      {
        id: "agenda",
        label: "Agenda",
        icon: "fa-solid fa-calendar",
        path: "/agenda",
      },
      {
        id: "psychobot",
        label: "Psychobot",
        icon: "fa-solid fa-comment-dots",
        path: "/psychobot",
      },
    ],
    psicologo: [
      {
        id: "psi-dashboard",
        label: "Dashboard",
        icon: "fa-solid fa-chart-pie",
        path: "/psi-dashboard",
      },
      {
        id: "psi-seguimiento",
        label: "Seguimiento\ndel Diario",
        icon: "fa-solid fa-chart-simple",
        path: "/psi-seguimiento",
      },
      {
        id: "psi-agenda",
        label: "Agenda",
        icon: "fa-solid fa-calendar",
        path: "/psi-agenda",
      },
    ],
    administrador: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "fa-solid fa-chart-pie",
        path: "/dashboard",
      },
      {
        id: "gestion",
        label: "Gestión de\nUsuarios",
        icon: "fa-solid fa-chart-simple",
        path: "/gestion",
      },
    ],
  };

  const navItems = navigationByRole[user?.rol] || [];

  return (
    <div id="layoutSidenav_nav">
      <nav
        className="sb-sidenav accordion sb-sidenav-light-green"
        id="sidenavAccordion"
      >
        <div className="sb-sidenav-menu">
          <div className="nav" style={{ marginTop: "80%", marginLeft: "20px" }}>
            {navItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link active fw-semibold border border-0 rounded-3 me-4 ${isActive || currentPage === item.id ? "bg-dark" : ""
                    }`
                  }
                  style={({ isActive }) =>
                    isActive || currentPage === item.id
                      ? { "--bs-bg-opacity": ".3" }
                      : {}
                  }
                >
                  <div className="sb-nav-link-icon">
                    <i className={item.icon}></i>
                  </div>
                  {item.label.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < item.label.split("\n").length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </NavLink>
                {index < navItems.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
