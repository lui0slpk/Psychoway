import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

/**
 * MainLayout - Componente wrapper que combina Navbar, Sidebar, Footer y el contenido
 * @param {Object} props
 * @param {string} props.pageTitle - Título de la página para el navbar
 * @param {string} props.pageSubtitle - Subtítulo de la página para el navbar
 * @param {string} props.currentPage - ID de la página actual para resaltar en sidebar
 * @param {boolean} props.showFooterLinks - Si mostrar links en el footer
 * @param {React.ReactNode} props.children - Contenido de la página
 */
function MainLayout({
  pageTitle,
  pageSubtitle,
  currentPage,
  showFooterLinks = true,
  children,
}) {
  // Efecto para manejar el toggle del sidebar
  useEffect(() => {
    const sidebarToggle = document.getElementById("sidebarToggle");

    const handleToggle = (e) => {
      e.preventDefault();
      document.body.classList.toggle("sb-sidenav-toggled");
      localStorage.setItem(
        "sb|sidebar-toggle",
        document.body.classList.contains("sb-sidenav-toggled"),
      );
    };

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", handleToggle);
    }

    // Restaurar estado del sidebar
    if (localStorage.getItem("sb|sidebar-toggle") === "true") {
      document.body.classList.add("sb-sidenav-toggled");
    }

    return () => {
      if (sidebarToggle) {
        sidebarToggle.removeEventListener("click", handleToggle);
      }
    };
  }, []);

  return (
    <div className="sb-nav-fixed">
      <Navbar pageTitle={pageTitle} pageSubtitle={pageSubtitle} />

      <div id="layoutSidenav">
        <Sidebar currentPage={currentPage} />

        <div id="layoutSidenav_content">
          <main className="bg-light">{children}</main>

          <Footer showLinks={showFooterLinks} />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
