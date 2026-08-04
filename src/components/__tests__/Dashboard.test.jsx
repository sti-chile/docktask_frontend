import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

const { useTareasQueryMock } = vi.hoisted(() => ({ useTareasQueryMock: vi.fn() }))
vi.mock("../../hooks/useTareasQuery", () => ({
    useTareasQuery: (...args) => useTareasQueryMock(...args),
}))

// El tour arranca driver.js y toca AuthContext: fuera del alcance de este test.
vi.mock("@/components/TourTutorial", () => ({ default: () => null }))

import Dashboard from "../Dashboard"

const TAREAS = [
    { id: 1, nombre: "A", estado: "pendiente", expiration_date: null },
    { id: 2, nombre: "B", estado: "completado", expiration_date: null },
]

const renderDashboard = () =>
    render(
        <MemoryRouter>
            <Dashboard token="tok" />
        </MemoryRouter>
    )

describe("Dashboard — orden de hooks entre renders", () => {
    beforeEach(() => vi.clearAllMocks())

    it("sobrevive la transicion de cargando a cargado", () => {
        // Primer render: el hook informa loading, el componente hace early return.
        useTareasQueryMock.mockReturnValue({ tareas: [], loading: true, isLoading: true })
        const { rerender } = renderDashboard()

        // Segundo render: ya hay datos y el componente sigue hasta el final.
        // Si un hook vive DESPUES del early return, React aborta con
        // "Rendered more hooks than during the previous render" porque asocia el
        // estado por posicion de llamada y el conteo cambio entre renders.
        useTareasQueryMock.mockReturnValue({ tareas: TAREAS, loading: false, isLoading: false })
        rerender(
            <MemoryRouter>
                <Dashboard token="tok" />
            </MemoryRouter>
        )

        expect(screen.getByText("Dashboard")).toBeInTheDocument()
    })

    it("muestra las tarjetas de estado con los totales ya cargados", () => {
        useTareasQueryMock.mockReturnValue({ tareas: TAREAS, loading: false, isLoading: false })
        renderDashboard()

        expect(screen.getByText("Pendientes")).toBeInTheDocument()
        expect(screen.getByText("Completadas")).toBeInTheDocument()
    })
})
