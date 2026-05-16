import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { saveTauriAuthToken, clearTauriAuthToken, useDeepLink, useTauri } from "./hooks/useTauri";
import { useAuth } from "@/context/AuthContext";
import SplashScreen from "./components/SplashScreen.jsx";
import UpdateChecker from "./components/UpdateChecker.jsx";
import LoginForm from "./components/LoginForms.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import RegisterForm from "./components/RegisterForm.jsx";
import TasksContainer from "./components/containers/TasksContainer";
import EditTask from "./components/EditTasks.jsx";
import EditUsers from "./components/EditUsers.jsx";
import Navbar from "./components/Navbar.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateTask from './components/CreateTask';
import Dashboard from './components/Dashboard';
import ProjectsContainer from './components/containers/ProjectsContainer';
import CreateProject from './components/CreateProject';
import EditProject from './components/EditProject';
import './styles/datepicker.css';
import GanttBoard from './components/GanttBoard';
import WorkspacesContainer from './components/containers/WorkspacesContainer';
import CreateWorkspace from './components/CreateWorkspace';
import EditWorkspace from './components/EditWorkspace';
import WorkspaceSidebar from './components/WorkspaceSidebar';
import MusicPlayer from './components/music/MusicPlayer.jsx';
import MusicLibrary from './components/music/MusicLibrary.jsx';
import UploadPage from './components/music/UploadPage.jsx';
import MusicFab from './components/music/MusicFab.jsx';
import MiniPlayer from './components/music/MiniPlayer.jsx';
import { MusicProvider } from './context/MusicContext.jsx';

function App() {
  const navigate = useNavigate();
  const { isMobile } = useTauri();
  const { token, user, login, logout } = useAuth();

  // Mostrar splash solo si no hay sesión activa y no se vio en esta sesión
  const [showSplash, setShowSplash] = React.useState(
    () => !token && !sessionStorage.getItem("splashSeen")
  );

  // Deep links — notificación → navega a la ruta correcta
  useDeepLink(navigate);

  const handleLogin = (newToken, newUser) => {
    login(newToken, newUser);
    // Persistir token en Tauri Store para que el sync worker lo lea
    saveTauriAuthToken(newToken);
  };

  const handleLogout = () => {
    logout();
    // Limpiar token del Tauri Store
    clearTauriAuthToken();
  };

  return (
    <MusicProvider>
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de workspaces — solo desktop/web, no APK */}
        {token && !isMobile && <WorkspaceSidebar token={token} />}

        <main
          className={`flex-1 overflow-y-auto px-4 py-8
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
                  onVerTodasLasTareas={() => navigate('/mis-tareas')}
                />
              </PrivateRoute>
            }
          />

          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* Redirecciones de rutas antiguas */}
          <Route path="/gantt" element={<Navigate to="/mis-proyectos" replace />} />
          <Route path="/mis-mensajes" element={<Navigate to="/mis-tareas" replace />} />
          <Route path="/mensajes" element={<Navigate to="/mis-tareas" replace />} />
          {token && (
            <>
              <Route path="/mis-tareas" element={<PrivateRoute token={token}><TasksContainer token={token} /></PrivateRoute>} />
              <Route path="/mis-proyectos/:id/tareas" element={<PrivateRoute token={token}><ProyectoTareasWrapper /></PrivateRoute>} />
              <Route path="/create" element={<PrivateRoute token={token}><CreateTask token={token} /></PrivateRoute>} />
              <Route path="/edit/:id" element={<PrivateRoute token={token}><EditTask token={token} /></PrivateRoute>} />
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
              {/* Música */}
              <Route path="/music" element={<PrivateRoute token={token}><MusicPlayer /></PrivateRoute>} />
              <Route path="/music/player" element={<PrivateRoute token={token}><MusicPlayer /></PrivateRoute>} />
              <Route path="/music/library" element={<PrivateRoute token={token}><MusicLibrary /></PrivateRoute>} />
              <Route path="/music/upload" element={<PrivateRoute token={token}><UploadPage /></PrivateRoute>} />
            </>
          )}
        </Routes>
        </main>
      </div>

      {/* Auto-updater — solo desktop, banner no intrusivo */}
      <UpdateChecker />

      {/* Music FAB — botón flotante para acceder a la música */}
      {token && <MusicFab />}

      {/* Mini-player — persiste la reproducción mientras navegás */}
      {token && <MiniPlayer />}

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
    </MusicProvider>
  );
}

// Wrapper para extraer :id de la URL y pasarlo como prop a GanttBoard
function GanttWrapper() {
  const { id } = useParams();
  const { token } = useAuth();
  return <GanttBoard proyectoId={id} token={token} />;
}

// Wrapper para tareas filtradas por proyecto
function ProyectoTareasWrapper() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => navigate('/mis-proyectos')}
        className="ml-6 mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        ← Volver a proyectos
      </button>
      <TasksContainer token={token} proyectoId={parseInt(id)} />
    </div>
  );
}

export default App;
