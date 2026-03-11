import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Inicio from './pages/Inicio';
import Registro from './pages/Registro';
import RecuperarPassword from './pages/RecuperarPassword';

// Páginas de Aprendiz
import DiarioPage from './pages/aprendiz/DiarioPage';
import SeguimientoPage from './pages/aprendiz/SeguimientoPage';
import AgendaPage from './pages/aprendiz/AgendaPage';
import PsychobotPage from './pages/aprendiz/PsychobotPage';
import MiCuentaPage from './pages/aprendiz/MiCuentaPage';
import PrivacidadPage from './pages/aprendiz/PrivacidadPage';

// Páginas de Psicólogo
import PsiSeguimientoPage from './pages/psicologo/PsiSeguimientoPage';
import PsiAgendaPage from './pages/psicologo/PsiAgendaPage';
import MiCuentaPsiPage from './pages/psicologo/MiCuentaPsiPage';

// Páginas de Administrador
import GestionPage from './pages/administrador/GestionPage';
import GestionModPage from './pages/administrador/GestionModPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar-password" element={<RecuperarPassword />} />

          {/* Rutas de Aprendiz */}
          <Route 
            path="/diario" 
            element={
              <ProtectedRoute allowedRoles="aprendiz">
                <DiarioPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seguimiento" 
            element={
              <ProtectedRoute allowedRoles="aprendiz">
                <SeguimientoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agenda" 
            element={
              <ProtectedRoute allowedRoles="aprendiz">
                <AgendaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/psychobot" 
            element={
              <ProtectedRoute allowedRoles="aprendiz">
                <PsychobotPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mi-cuenta" 
            element={
              <ProtectedRoute allowedRoles="aprendiz">
                <MiCuentaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/privacidad" 
            element={
              <ProtectedRoute allowedRoles="aprendiz">
                <PrivacidadPage />
              </ProtectedRoute>
            } 
          />

          {/* Rutas de Psicólogo */}
          <Route 
            path="/psi-seguimiento" 
            element={
              <ProtectedRoute allowedRoles="psicologo">
                <PsiSeguimientoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/psi-agenda" 
            element={
              <ProtectedRoute allowedRoles="psicologo">
                <PsiAgendaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mi-cuenta-psi" 
            element={
              <ProtectedRoute allowedRoles="psicologo">
                <MiCuentaPsiPage />
              </ProtectedRoute>
            } 
          />

          {/* Rutas de Administrador */}
          <Route 
            path="/gestion" 
            element={
              <ProtectedRoute allowedRoles="administrador">
                <GestionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gestion-mod" 
            element={
              <ProtectedRoute allowedRoles="administrador">
                <GestionModPage />
              </ProtectedRoute>
            } 
          />

          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
