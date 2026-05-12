import React from "react";

/**
 * Footer component común para todas las páginas
 * @param {Object} props
 * @param {boolean} props.showLinks - Si mostrar los links de políticas (default: true)
 */
function Footer({ showLinks = true }) {
  return (
    <footer className="py-4 bg-light mt-auto">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center justify-content-between small">
          <div className="text-muted">Copyright &copy; Psychoway 2025</div>
          {showLinks && (
            <div>
              <a href="#!">Política de Privacidad</a>
              &middot;
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.google.com/document/d/1kQvRLIFX9FSaJszN1-HG33QumTGKF0fL/edit?usp=sharing&ouid=103808419223091016467&rtpof=true&sd=true"
              >
                Marco Legal
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
