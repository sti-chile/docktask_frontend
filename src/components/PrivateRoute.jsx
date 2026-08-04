import React, { useEffect, useRef } from "react"
import { Navigate } from "react-router-dom"

const IDLE_TIME = 30 * 60 * 1000 // 30 minutos de inactividad

const PrivateRoute = ({ token, children }) => {
    const idleTimeoutRef = useRef(null)

    useEffect(() => {
        const resetIdleTimer = () => {
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current)
            }
            idleTimeoutRef.current = setTimeout(() => {
                // Redirigir al login cuando la sesión expire.
                // ?expired=1 sobrevive la recarga completa y le dice al login que
                // muestre el formulario directo, sin el pitch para visitantes nuevos.
                const baseUrl = window.location.origin
                window.location.href = `${baseUrl}/login?expired=1`
            }, IDLE_TIME)
        }

        // Eventos que resetean el timer de inactividad
        const events = ["mousemove", "keypress", "scroll", "touchstart"]
        events.forEach((event) => {
            window.addEventListener(event, resetIdleTimer, { passive: true })
        })

        // Iniciar el timer inicialmente
        resetIdleTimer()

        // Limpiar el timer cuando el componente se desmonte
        return () => {
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current)
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetIdleTimer)
            })
        }
    }, [])

    if (!token) {
        // from: 'private' → el login sabe que no es un visitante nuevo
        return <Navigate to="/login" replace state={{ from: "private" }} />
    }
    return children
}

export default PrivateRoute
