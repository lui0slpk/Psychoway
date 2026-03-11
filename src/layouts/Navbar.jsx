import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar component que muestra diferente contenido según el rol del usuario
 * @param {Object} props
 * @param {string} props.pageTitle - Título de la página actual
 * @param {string} props.pageSubtitle - Subtítulo de la página actual
 */
function Navbar({ pageTitle, pageSubtitle }) {
    const { user, logout } = useAuth();

    // Colores del ícono según rol
    const iconColors = {
        aprendiz: '#000000ff',
        psicologo: '#000000ff',
        administrador: '#000000ff'
    };

    // Links del dropdown según rol
    const getDropdownItems = () => {
        switch (user?.rol) {
            case 'aprendiz':
                return (
                    <>
                        <li><Link className="dropdown-item" to="/mi-cuenta">Ajustes de cuenta</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><Link className="dropdown-item" to="/" onClick={logout}>Cerrar sesión</Link></li>
                    </>
                );
            case 'psicologo':
                return (
                    <>
                        <li><Link className="dropdown-item" to="/mi-cuenta-psi">Ajustes de cuenta</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><Link className="dropdown-item" to="/" onClick={logout}>Cerrar sesión</Link></li>
                    </>
                );
            case 'administrador':
                return (
                    <>
                        <li><Link className="dropdown-item" to="/" onClick={logout}>Cerrar sesión</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><span className="dropdown-item-text">id: {user?.document}</span></li>
                    </>
                );
            default:
                return (
                    <li><Link className="dropdown-item" to="/" onClick={logout}>Cerrar sesión</Link></li>
                );
        }
    };

    const iconColor = iconColors[user?.rol] || 'rgb(0, 0, 0)';

    return (
        <nav className="sb-topnav navbar navbar-expand navbar-light bg-white">
            {/* Navbar Brand */}
            <div className="navbar-brand bg-light-green ps-3 pt-3">
                <span className="text-decoration-none fs-1" style={{ color: 'white', fontSize: '40px' }}>
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
            <div className="navbar-text ms-4 p-4">
                <div className="lh-base">
                    <h2 className="fw-semibold m-0 text-dark" style={{ fontSize: '30px' }}>
                        {pageTitle}
                    </h2>
                    <p style={{ color: '#8C8C8D', fontSize: '18px' }} className="text m-0">
                        {pageSubtitle}
                    </p>
                </div>
            </div>

            {/* Navbar User Menu */}
            <ul className="navbar-nav ms-auto me-0 me-lg-5">
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
                        ></i>
                        {' '}{user?.names || 'Usuario'}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        {getDropdownItems()}
                    </ul>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
