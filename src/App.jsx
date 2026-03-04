import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { saveTauriAuthToken, clearTauriAuthToken, useDeepLink, useTauri } from "./hooks/useTauri";
import SplashScreen from "./components/SplashScreen.jsx";
import LoginForm from "./components/LoginForms.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import MessagesContainer from "./components/containers/MessagesContainer";
import EditMessage from "./components/EditMessages.jsx";
import EditUsers from "./components/EditUsers.jsx";
import Navbar from "./components/Navbar.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateMessage from './components/CreateMessage';
import Dashboard from './components/Dashboard';
import ProjectsContainer from './components/containers/ProjectsContainer';
import CreateProject from './components/CreateProject';
import EditProject from './components/EditProject';
import './styles/datepicker.css';
import GanttBoard from './components/GanttBoard';
import WorkspacesContainer from './components/containers/WorkspacesContainer';
import CreateWorkspace from './components/CreateWorkspace';
import EditWorkspace from './components/EditWorkspace';

function App() {
  const navigate = useNavigate();
  const { isMobile } = useTauri();
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  // Mostrar splash solo si no hay sesión activa y no se vio en esta sesión
  const [showSplash, setShowSplash] = useState(
    () => !localStorage.getItem("token") && !sessionStorage.getItem("splashSeen")
  );

  // Deep links — notificación → navega a la ruta correcta
  useDeepLink(navigate);

  const handleLogin = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    // Persistir token en Tauri Store para que el sync worker lo lea
    saveTauriAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    // Limpiar token del Tauri Store
    clearTauriAuthToken();
  };
  const ultimosMensajes = [
    { id: 1, nombre: "Soporte conexión caja", estado: "pendiente", updated_at: new Date() },
    { id: 2, nombre: "Instalación balanceadora", estado: "completado", updated_at: new Date() },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Splash screen — se muestra antes del login, una vez por sesión */}
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            sessionStorage.setItem('splashSeen', '1');
            setShowSplash(false);
          }}
        />
      )}

      <Navbar token={token} onLogout={handleLogout} />

      <main
        className={`flex justify-center items-center container mx-auto px-4 py-8
          ${isMobile && token ? 'pb-20' : ''}
          ${isMobile ? 'pt-safe' : ''}`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute token={token}>
                <Dashboard
                  token={token}
                  userData={user}
                  isLoading={false}
                  ultimosMensajes={ultimosMensajes}
                  onCrearMensaje={() => window.location.href = `${window.location.origin}/create`}
                  onCrearProyecto={() => window.location.href = `${window.location.origin}/crear-proyecto`}
                  onVerTodosMensajes={() => window.location.href = `${window.location.origin}/mis-mensajes`}
                />
              </PrivateRoute>
            }
          />


          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* Ruta /gantt suelta redirige a proyectos */}
          <Route path="/gantt" element={<Navigate to="/mis-proyectos" replace />} />
          {token && (
            <>
              <Route path="/" element={<PrivateRoute token={token}><Dashboard token={token} /></PrivateRoute>} />
              <Route path="/mis-mensajes" element={<PrivateRoute token={token}><MessagesContainer token={token} /></PrivateRoute>} />
              <Route path="/create" element={<PrivateRoute token={token}><CreateMessage token={token} /></PrivateRoute>} />
              <Route path="/edit/:id" element={<PrivateRoute token={token}><EditMessage token={token} /></PrivateRoute>} />
              <Route path="/mis-proyectos" element={<PrivateRoute token={token}><ProjectsContainer token={token} /></PrivateRoute>} />
              <Route path="/crear-proyecto" element={<PrivateRoute token={token}><CreateProject token={token} /></PrivateRoute>} />
              <Route path="/editar-proyecto/:id" element={<PrivateRoute token={token}><EditProject token={token} /></PrivateRoute>} />
              <Route path="/mis-workspaces" element={<PrivateRoute token={token}><WorkspacesContainer token={token} /></PrivateRoute>} />
              <Route path="/crear-workspace" element={<PrivateRoute token={token}><CreateWorkspace token={token} /></PrivateRoute>} />
              <Route path="/editar-workspace/:id" element={<PrivateRoute token={token}><EditWorkspace token={token} /></PrivateRoute>} />
              <Route
                path="/mis-proyectos/:id/gantt"
                element={
                  <PrivateRoute token={token}>
                    <GanttWrapper />
                  </PrivateRoute>
                }
              />
              {user?.rol === "admin" && (
                <Route path="/admin" element={<PrivateRoute token={token}><EditUsers /></PrivateRoute>} />
              )}
            </>
          )}
        </Routes>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

// Wrapper para extraer :id de la URL y pasarlo como prop a GanttBoard
function GanttWrapper() {
  const { id } = useParams();
  return <GanttBoard proyectoId={id} />;
}

export default App;
