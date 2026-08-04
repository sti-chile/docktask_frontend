import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom"

// El hook es el que traduce el proyecto a `?proyecto_id=` en la request. Lo
// mockeamos para poder afirmar CON QUE proyecto fue invocado.
const { useTareasQueryMock } = vi.hoisted(() => ({ useTareasQueryMock: vi.fn() }))
vi.mock("../../hooks/useTareasQuery", () => ({
    useTareasQuery: (...args) => useTareasQueryMock(...args),
}))

vi.mock("../views/TasksBoardView", () => ({
    default: () => <div>vista board</div>,
}))
vi.mock("../../views/CalendarView", () => ({
    default: () => <div>vista calendario</div>,
}))
vi.mock("../GanttBoard", () => ({
    default: ({ proyectoId }) => <div>gantt del proyecto {String(proyectoId)}</div>,
}))

import TasksContainer from "../containers/TasksContainer"

const TAREAS = [
    { id: 1, nombre: "A", proyecto_id: 7, estado: "pendiente" },
    { id: 2, nombre: "B", proyecto_id: 9, estado: "pendiente" },
]

// Sonda para poder afirmar sobre la URL: MemoryRouter no toca window.location.
const LocationProbe = () => {
    const location = useLocation()
    return <div data-testid="url">{`${location.pathname}${location.search}`}</div>
}

const renderEn = (ruta) => {
    const contenido = (
        <>
            <TasksContainer token="tok" />
            <LocationProbe />
        </>
    )
    return render(
        <MemoryRouter initialEntries={[ruta]}>
            <Routes>
                <Route path="/mis-tareas" element={contenido} />
                <Route path="/mis-proyectos/:id/tareas" element={contenido} />
            </Routes>
        </MemoryRouter>
    )
}

describe("TasksContainer — contexto de proyecto desde la ruta", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useTareasQueryMock.mockReturnValue({
            tareas: TAREAS,
            isLoading: false,
            error: null,
            eliminarTarea: { mutate: vi.fn() },
            cambiarEstado: { mutate: vi.fn() },
            duplicarTarea: { mutate: vi.fn() },
            actualizarFechaExpiracion: { mutate: vi.fn() },
        })
    })

    it("toma el proyecto del path y lo pasa a la query", () => {
        renderEn("/mis-proyectos/7/tareas")

        // Segundo argumento del hook = proyectoId. Esto es lo que termina en
        // `?proyecto_id=7` y hace que el backend filtre.
        expect(useTareasQueryMock).toHaveBeenCalledWith("tok", "7")
    })

    it("tambien acepta el proyecto por query param en /mis-tareas", () => {
        renderEn("/mis-tareas?proyecto_id=9")

        expect(useTareasQueryMock).toHaveBeenCalledWith("tok", "9")
    })

    it("sin contexto de proyecto consulta todas las tareas", () => {
        renderEn("/mis-tareas")

        expect(useTareasQueryMock).toHaveBeenCalledWith("tok", null)
    })
})

describe("TasksContainer — la vista vive en la URL", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useTareasQueryMock.mockReturnValue({
            tareas: TAREAS,
            isLoading: false,
            error: null,
            eliminarTarea: { mutate: vi.fn() },
            cambiarEstado: { mutate: vi.fn() },
            duplicarTarea: { mutate: vi.fn() },
            actualizarFechaExpiracion: { mutate: vi.fn() },
        })
    })

    it("board es la vista por defecto", () => {
        renderEn("/mis-tareas")
        expect(screen.getByText("vista board")).toBeInTheDocument()
    })

    it("abre el Gantt desde ?view=gantt y le pasa el proyecto de la ruta", () => {
        renderEn("/mis-proyectos/7/tareas?view=gantt")

        // Con el proyecto en el Gantt, un contenedor sin filtrar ya no puede
        // mezclar tareas de varios proyectos en el mismo diagrama.
        expect(screen.getByText("gantt del proyecto 7")).toBeInTheDocument()
    })

    it("cambiar de tab escribe la vista en la URL y conserva el proyecto", async () => {
        const user = userEvent.setup()
        renderEn("/mis-proyectos/7/tareas")

        await user.click(screen.getByRole("tab", { name: /calendario/i }))

        expect(screen.getByText("vista calendario")).toBeInTheDocument()
        // Esto es lo que hace que la vista se pueda compartir por link y que
        // "volver atras" te devuelva donde estabas, en vez de resetear a board.
        expect(screen.getByTestId("url")).toHaveTextContent("/mis-proyectos/7/tareas?view=calendar")
    })

    it("volver a board limpia el parametro en vez de dejar basura en la URL", async () => {
        const user = userEvent.setup()
        renderEn("/mis-proyectos/7/tareas?view=gantt")

        await user.click(screen.getByRole("tab", { name: /^board$/i }))

        expect(screen.getByTestId("url")).toHaveTextContent("/mis-proyectos/7/tareas")
        expect(screen.getByTestId("url")).not.toHaveTextContent("view=")
    })

    it("ignora una vista invalida y cae en board", () => {
        renderEn("/mis-tareas?view=inventada")
        expect(screen.getByText("vista board")).toBeInTheDocument()
    })
})
