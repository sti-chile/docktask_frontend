import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"

const { getMock, putMock } = vi.hoisted(() => ({ getMock: vi.fn(), putMock: vi.fn() }))

vi.mock("@/lib/httpClient", () => ({
    httpClient: { get: getMock, put: putMock },
    createHttpClient: () => ({ get: getMock, put: putMock }),
}))

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}))

import { toast } from "react-toastify"
import EditTask from "@/components/EditTasks"

const TAREA = {
    id: 7,
    nombre: "Migrar base",
    descripcion: "detalle",
    start_date: "2026-08-04T10:30:00",
    expiration_date: "2026-08-05T12:00:00",
}

const renderEdit = () =>
    render(
        <MemoryRouter initialEntries={["/edit/7"]}>
            <Routes>
                <Route path="/edit/:id" element={<EditTask token="tok" />} />
            </Routes>
        </MemoryRouter>
    )

describe("EditTask — fechas para el Gantt", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getMock.mockResolvedValue([TAREA])
        putMock.mockResolvedValue({})
    })

    it("carga las fechas existentes recortando los segundos del ISO", async () => {
        renderEdit()

        // La API devuelve "...T10:30:00"; un datetime-local sólo acepta "...T10:30".
        // Sin el recorte, el input se renderiza vacío y se pierde el dato.
        expect(await screen.findByDisplayValue("2026-08-04T10:30")).toBeInTheDocument()
        expect(screen.getByDisplayValue("2026-08-05T12:00")).toBeInTheDocument()
    })

    it("omite expiration_date del payload cuando está vacía y manda start_date null", async () => {
        const user = userEvent.setup()
        renderEdit()
        await screen.findByDisplayValue("2026-08-04T10:30")

        await user.clear(screen.getByLabelText("Fecha de Inicio"))
        await user.clear(screen.getByLabelText("Fecha de Expiración"))
        await user.click(screen.getByRole("button", { name: /guardar cambios/i }))

        await waitFor(() => expect(putMock).toHaveBeenCalledTimes(1))
        const payload = putMock.mock.calls[0][1]
        // El backend hace fromisoformat sobre expiration_date sin chequear vacío:
        // mandar "" devuelve 400. start_date sí acepta null para limpiarse.
        expect(payload).not.toHaveProperty("expiration_date")
        expect(payload.start_date).toBeNull()
    })

    it("no guarda si la fecha de inicio no es anterior a la de expiración", async () => {
        const user = userEvent.setup()
        renderEdit()
        await screen.findByDisplayValue("2026-08-04T10:30")

        const inicio = screen.getByLabelText("Fecha de Inicio")
        await user.clear(inicio)
        await user.type(inicio, "2026-08-09T10:00")
        await user.click(screen.getByRole("button", { name: /guardar cambios/i }))

        expect(toast.error).toHaveBeenCalledWith(
            "La fecha de inicio debe ser anterior a la de expiración"
        )
        expect(putMock).not.toHaveBeenCalled()
    })
})
