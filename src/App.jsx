import React from "react"
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom"
import { saveTauriAuthToken, clearTauriAuthToken, useDeepLink, useTauri } from "./hooks/useTauri"
import { useAuth } from "@/context/AuthContext"
import PickerView from "./components/views/PickerView"
import SplashScreen from "./components/SplashScreen.jsx"
import UpdateChecker from "./components/UpdateChecker.jsx"
import LoginForm from "./components/LoginForms.jsx"
import PrivateRoute from "./components/PrivateRoute.jsx"
import RegisterForm from "./components/RegisterForm.jsx"
import TasksContainer from "./components/containers/TasksContainer"
import ProjectLayout from "./components/layouts/ProjectLayout"
import EditTask from "./components/EditTasks.jsx"
import EditUsers from "./components/EditUsers.jsx"
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import CreateTask from "./components/CreateTask"
import Dashboard from "./components/Dashboard"
import ProjectsContainer from "./components/containers/ProjectsContainer"
import CreateProject from "./components/CreateProject"
import EditProject from "./components/EditProject"
import "./styles/datepicker.css"
import WorkspacesContainer from "./components/containers/WorkspacesContainer"
import CreateWorkspace from "./components/CreateWorkspace"
import EditWorkspace from "./components/EditWorkspace"
import WorkspaceSidebar from "./components/WorkspaceSidebar"
import MusicPlayer from "./components/music/MusicPlayer.jsx"
import MusicLibrary from "./components/music/MusicLibrary.jsx"
import UploadPage from "./components/music/UploadPage.jsx"
import MusicFab from "./components/music/MusicFab.jsx"
import MiniPlayer from "./components/music/MiniPlayer.jsx"
import { MusicProvider } from "./context/MusicContext.jsx"
import CyclesPage from "./components/views/CyclesPage"
import CycleDetailPage from "./components/views/CycleDetailPage"
import ModulesPage from "./components/views/ModulesPage"
import ModuleDetailPage from "./components/views/ModuleDetailPage"

function App() {
    const navigate = useNavigate()
    const { isMobile } = useTauri()
    const { token, user, login, loginAsGuest, logout } = useAuth()

    // Mostrar splash solo si no hay sesión activa y no se vio en esta sesión
    const [showSplash, setShowSplash] = React.useState(
        () => !token && !sessionStorage.getItem("splashSeen")
    )

    // Deep links — notificación → navega a la ruta correcta
    useDeepLink(navigate)

    const handleLogin = (newToken, newUser) => {
        login(newToken, newUser)
        // Persistir token en Tauri Store para que el sync worker lo lea
        saveTauriAuthToken(newToken)
    }

    const handleGuestLogin = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "https://api.docktask.com"}/api/v1/guest/session`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                }
            )
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al crear sesión demo")
            loginAsGuest(data)
            // Al Dashboard, no a /mis-tareas: el tour de invitado (TourTutorial)
            // sólo está montado ahí y sus pasos apuntan a elementos del Dashboard.
            navigate("/")
        } catch (err) {
            console.error("Guest login error:", err)
        }
    }

    const handleLogout = () => {
        logout()
        // Limpiar token del Tauri Store
        clearTauriAuthToken()
    }

    return (
        <MusicProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Splash screen — se muestra antes del login, una vez por sesión */}
                {showSplash && (
                    <SplashScreen
                        onFinish={() => {
                            sessionStorage.setItem("splashSeen", "1")
                            setShowSplash(false)
                        }}
                    />
                )}

                <Navbar token={token} onLogout={handleLogout} />

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar de workspaces — solo desktop/web, no APK */}
                    {token && !isMobile && <WorkspaceSidebar token={token} />}

                    <main
                        className={`flex-1 overflow-y-auto px-4 py-8
            ${isMobile && token ? "pb-20" : ""}
            ${isMobile ? "pt-safe" : ""}`}
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
                                            onVerTodasLasTareas={() => navigate("/mis-tareas")}
                                        />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/login"
                                element={
                                    <div className="flex min-h-full flex-col">
                                        <LoginForm
                                            onLogin={handleLogin}
                                            onGuestLogin={handleGuestLogin}
                                        />
                                        {/* -mx-4 -mb-8 cancela el padding de <main> para que el footer sangre a los bordes */}
                                        <Footer className="-mx-4 -mb-8" />
                                    </div>
                                }
                            />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/picker" element={<PickerView />} />
                            {/* Redirecciones de rutas antiguas */}
                            <Route
                                path="/gantt"
                                element={<Navigate to="/mis-proyectos" replace />}
                            />
                            <Route
                                path="/mis-mensajes"
                                element={<Navigate to="/mis-tareas" replace />}
                            />
                            <Route
                                path="/mensajes"
                                element={<Navigate to="/mis-tareas" replace />}
                            />
                            {token && (
                                <>
                                    <Route
                                        path="/mis-tareas"
                                        element={
                                            <PrivateRoute token={token}>
                                                <TasksContainer token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    {/* Layout de proyecto: el :id vive en el path,
                                        asi que ninguna vista hija puede perderlo.
                                        Es el equivalente en React Router a los
                                        route groups de Next. */}
                                    <Route
                                        path="/mis-proyectos/:id"
                                        element={
                                            <PrivateRoute token={token}>
                                                <ProjectLayout token={token} />
                                            </PrivateRoute>
                                        }
                                    >
                                        <Route index element={<Navigate to="tareas" replace />} />
                                        <Route
                                            path="tareas"
                                            element={<TasksContainer token={token} />}
                                        />
                                        {/* El Gantt no es una ruta aparte: es una
                                            vista del contenedor de tareas, que ya
                                            filtra por proyecto. Una sola
                                            implementacion, imposible de mezclar. */}
                                        <Route path="gantt" element={<GanttViewRedirect />} />
                                    </Route>
                                    <Route
                                        path="/create"
                                        element={
                                            <PrivateRoute token={token}>
                                                <CreateTask token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/edit/:id"
                                        element={
                                            <PrivateRoute token={token}>
                                                <EditTask token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/mis-proyectos"
                                        element={
                                            <PrivateRoute token={token}>
                                                <ProjectsContainer token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/crear-proyecto"
                                        element={
                                            <PrivateRoute token={token}>
                                                <CreateProject token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/editar-proyecto/:id"
                                        element={
                                            <PrivateRoute token={token}>
                                                <EditProject token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/mis-workspaces"
                                        element={
                                            <PrivateRoute token={token}>
                                                <WorkspacesContainer token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/crear-workspace"
                                        element={
                                            <PrivateRoute token={token}>
                                                <CreateWorkspace token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/editar-workspace/:id"
                                        element={
                                            <PrivateRoute token={token}>
                                                <EditWorkspace token={token} />
                                            </PrivateRoute>
                                        }
                                    />
                                    {user?.rol === "admin" && (
                                        <Route
                                            path="/admin"
                                            element={
                                                <PrivateRoute token={token}>
                                                    <EditUsers />
                                                </PrivateRoute>
                                            }
                                        />
                                    )}
                                    {/* Ciclos */}
                                    <Route
                                        path="/workspace/:workspaceId/cycles"
                                        element={
                                            <PrivateRoute token={token}>
                                                <CyclesPage />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/workspace/:workspaceId/cycles/:cycleId"
                                        element={
                                            <PrivateRoute token={token}>
                                                <CycleDetailPage />
                                            </PrivateRoute>
                                        }
                                    />
                                    {/* Módulos */}
                                    <Route
                                        path="/workspace/:workspaceId/modules"
                                        element={
                                            <PrivateRoute token={token}>
                                                <ModulesPage />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/workspace/:workspaceId/modules/:moduleId"
                                        element={
                                            <PrivateRoute token={token}>
                                                <ModuleDetailPage />
                                            </PrivateRoute>
                                        }
                                    />
                                    {/* Música */}
                                    <Route
                                        path="/music"
                                        element={
                                            <PrivateRoute token={token}>
                                                <MusicPlayer />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/music/player"
                                        element={
                                            <PrivateRoute token={token}>
                                                <MusicPlayer />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/music/library"
                                        element={
                                            <PrivateRoute token={token}>
                                                <MusicLibrary />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/music/upload"
                                        element={
                                            <PrivateRoute token={token}>
                                                <UploadPage />
                                            </PrivateRoute>
                                        }
                                    />
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
    )
}

// El Gantt dejo de ser una ruta propia: es una vista del contenedor de tareas,
// que ya filtra por proyecto. Los enlaces viejos a /mis-proyectos/:id/gantt siguen
// funcionando redirigiendo a la vista, para no romper links compartidos.
function GanttViewRedirect() {
    const { id } = useParams()
    return <Navigate to={`/mis-proyectos/${id}/tareas?view=gantt`} replace />
}

export default App
