import React, { useState, useEffect, useRef } from "react"
import {
    UserIcon,
    LockClosedIcon,
    PlayCircleIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
import { httpClient } from "@/lib/httpClient"
import { useTauri } from "@/hooks/useTauri"
import LoginHero from "@/components/LoginHero"
import loginBg from "@/assets/Login_Background.webp"

const LoginForm = ({ onLogin, onGuestLogin }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()
    // En la app instalada (Tauri desktop/Android) no mostramos el pitch:
    // quien ya la instaló no necesita que le expliquemos qué es DockTask.
    const { isTauri } = useTauri()

    // Quien llega redirigido desde una ruta privada (o por sesión expirada) no es
    // un visitante nuevo: le mostramos el formulario directo, sin pedirle un clic.
    const cameFromApp =
        location.state?.from === "private" ||
        new URLSearchParams(location.search).get("expired") === "1"
    const [showLogin, setShowLogin] = useState(isTauri || cameFromApp)
    const usernameRef = useRef(null)

    // Limpiar campos al montar el componente
    useEffect(() => {
        setUsername("")
        setPassword("")
    }, [])

    // Efecto para animar la torta
    useEffect(() => {
        let interval
        if (isLoading) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval)
                        return 100
                    }
                    return prev + 2
                })
            }, 40)
        }
        return () => clearInterval(interval)
    }, [isLoading])

    // Al revelar el formulario, el foco va al primer campo: sin esto, para
    // teclado y lectores de pantalla el formulario "no aparece".
    useEffect(() => {
        if (showLogin) usernameRef.current?.focus()
    }, [showLogin])

    // Escape cierra el formulario SÓLO si está vacío. Es un reveal inline, no un
    // modal: cerrarlo con datos escritos sería perder el trabajo del usuario.
    useEffect(() => {
        if (!showLogin || isTauri || cameFromApp) return
        const onKeyDown = (e) => {
            if (e.key === "Escape" && !username && !password) setShowLogin(false)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [showLogin, isTauri, cameFromApp, username, password])

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setProgress(0)

        try {
            const response = await httpClient.post("/api/v1/login", {
                username,
                password,
            })

            const { access_token: token, usuario: userData } = response

            if (!token || !userData) {
                throw new Error("Respuesta del servidor inválida")
            }

            // Crear objeto de usuario
            const user = {
                username: userData.username,
                rol: userData.rol,
                id: userData.id,
                nombre: userData.nombre,
                apellido: userData.apellido,
            }

            // Notificar éxito (token manejado por AuthContext vía onLogin)
            toast.success("¡Login exitoso!")

            // Limpiar formulario
            setUsername("")
            setPassword("")

            // Notificar al componente padre
            if (onLogin) {
                onLogin(token, user)
            }

            // Redirigir según el rol
            const redirectPath = user.rol === "admin" ? "/admin" : "/mis-tareas"
            navigate(redirectPath)
        } catch (error) {
            const errorMessage = error.message || "Login fallido. Revisa tus credenciales."
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        //DIV contenedor principal del login form
        <div
            className="flex justify-center bg-cover bg-center items-center py-10 min-h-[calc(100vh-4rem)]"
            style={{
                backgroundImage: `url(${loginBg})`,
            }}
        >
            {isLoading && (
                //DIV contenedor del loading
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                {/* Círculo base */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                />
                                {/* Círculo de progreso */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="8"
                                    strokeDasharray={`${progress * 2.83} 283`}
                                    transform="rotate(-90 50 50)"
                                    className="transition-all duration-100 ease-linear"
                                    style={{ transition: "stroke-dashoffset 0.3s ease-in-out" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-blue-500">
                                    {progress}%
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-600">Iniciando sesión...</p>
                    </div>
                </div>
            )}
            {/* Wrapper: en web es split (pitch + form), en la app instalada sólo el form */}
            <div
                className={
                    isTauri
                        ? "w-full max-w-md px-4"
                        : "grid w-full max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8"
                }
            >
                {!isTauri && <LoginHero onGuestLogin={onGuestLogin} />}
                {/* Formulario de login: oculto tras un clic para visitantes nuevos.
                    Aparece en este mismo lugar, no como modal, para conservar el split. */}
                <div className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
                    {!showLogin ? (
                        <div className="flex flex-col gap-3 rounded-lg bg-white/80 p-6 text-center shadow-md backdrop-blur-[2px]">
                            <p className="font-semibold text-brand-ink">¿Ya tenés cuenta?</p>
                            <button
                                type="button"
                                onClick={() => setShowLogin(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 font-medium text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                            >
                                <LockClosedIcon className="h-5 w-5" aria-hidden="true" />
                                Iniciar sesión
                            </button>
                            <p className="text-sm text-brand-slate">
                                ¿Aún no tienes cuenta?{" "}
                                <Link
                                    to="/register"
                                    className="font-medium text-brand-blue underline-offset-2 hover:underline"
                                >
                                    Crear Cuenta
                                </Link>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-md p-6">
                            {!isTauri && !cameFromApp && (
                                <button
                                    type="button"
                                    onClick={() => setShowLogin(false)}
                                    className="mb-4 flex items-center gap-1 text-sm text-brand-slate transition-colors hover:text-brand-blue"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                                    Volver
                                </button>
                            )}
                            <div className="space-y-4">
                                {/* Input de usuario */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        ref={usernameRef}
                                        type="text"
                                        value={username}
                                        placeholder="Usuario"
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoComplete="username"
                                    />
                                </div>

                                {/* Input de contraseña */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        placeholder="Contraseña"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoComplete="current-password"
                                    />
                                </div>

                                {/* Botón de login */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <LockClosedIcon className="h-5 w-5" />
                                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                                </button>
                            </div>

                            {/* Botón de invitado */}
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={onGuestLogin}
                                    disabled={isLoading}
                                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2.5 px-4 rounded-md border border-emerald-200 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <PlayCircleIcon className="h-5 w-5" />
                                    Probar DockTask como invitado
                                </button>
                                <p className="mt-2 text-xs text-gray-400 text-center">
                                    Sin registro, sin compromiso. Sesión demo por 24h.
                                </p>
                            </div>

                            {/* Separador */}
                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex-1 border-t border-gray-200" />
                                <span className="text-sm text-gray-400">o</span>
                                <div className="flex-1 border-t border-gray-200" />
                            </div>

                            {/* Texto de registro */}
                            <div className="mt-4 text-center">
                                <p className="text-gray-600">
                                    ¿Aún no tienes cuenta?{" "}
                                    <Link
                                        to="/register"
                                        className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
                                    >
                                        Crear Cuenta
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            {/* Fin del wrapper */}
        </div>
    )
}

export default LoginForm
