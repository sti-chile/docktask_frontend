import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"

// El hook toca window.__TAURI__ y APIs de plataforma: lo mockeamos para
// controlar isTauri de forma determinística en cada caso.
const mockUseTauri = vi.fn(() => ({ isTauri: false }))
vi.mock("@/hooks/useTauri", () => ({
    useTauri: () => mockUseTauri(),
}))

// Nada de red en los tests.
vi.mock("@/lib/httpClient", () => ({
    httpClient: { post: vi.fn() },
}))

import LoginForm from "@/components/LoginForms"

const renderLogin = (route = "/login") =>
    render(
        <MemoryRouter initialEntries={[route]}>
            <LoginForm onLogin={vi.fn()} onGuestLogin={vi.fn()} />
        </MemoryRouter>
    )

const revealButton = () => screen.getByRole("button", { name: /iniciar sesión/i })
const usernameInput = () => screen.queryByPlaceholderText("Usuario")

describe("LoginForm — revelado del formulario", () => {
    beforeEach(() => {
        mockUseTauri.mockReturnValue({ isTauri: false })
    })

    it("para un visitante nuevo muestra la invitación y NO el formulario", () => {
        renderLogin()

        expect(screen.getByText("¿Ya tenés cuenta?")).toBeInTheDocument()
        expect(usernameInput()).not.toBeInTheDocument()
    })

    it("revela el formulario al hacer clic en Iniciar sesión", async () => {
        const user = userEvent.setup()
        renderLogin()

        await user.click(revealButton())

        expect(usernameInput()).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument()
    })

    it("mueve el foco al campo de usuario al revelar", async () => {
        const user = userEvent.setup()
        renderLogin()

        await user.click(revealButton())

        expect(usernameInput()).toHaveFocus()
    })
})

describe("LoginForm — Escape", () => {
    beforeEach(() => {
        mockUseTauri.mockReturnValue({ isTauri: false })
    })

    it("cierra el formulario si está vacío", async () => {
        const user = userEvent.setup()
        renderLogin()
        await user.click(revealButton())
        expect(usernameInput()).toBeInTheDocument()

        await user.keyboard("{Escape}")

        expect(usernameInput()).not.toBeInTheDocument()
        expect(screen.getByText("¿Ya tenés cuenta?")).toBeInTheDocument()
    })

    it("NO cierra el formulario si hay datos escritos (no perder el trabajo del usuario)", async () => {
        const user = userEvent.setup()
        renderLogin()
        await user.click(revealButton())
        await user.type(usernameInput(), "javier")

        await user.keyboard("{Escape}")

        expect(usernameInput()).toBeInTheDocument()
        expect(usernameInput()).toHaveValue("javier")
    })
})

describe("LoginForm — quien no es visitante nuevo salta el clic", () => {
    it("con ?expired=1 muestra el formulario directo y sin botón Volver", () => {
        mockUseTauri.mockReturnValue({ isTauri: false })
        renderLogin("/login?expired=1")

        expect(usernameInput()).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /volver/i })).not.toBeInTheDocument()
    })

    it("en la app instalada (Tauri) muestra el formulario y oculta el pitch", () => {
        mockUseTauri.mockReturnValue({ isTauri: true })
        renderLogin()

        expect(usernameInput()).toBeInTheDocument()
        expect(screen.queryByText("¿Ya tenés cuenta?")).not.toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: /probar gratis como invitado/i })
        ).not.toBeInTheDocument()
    })
})
