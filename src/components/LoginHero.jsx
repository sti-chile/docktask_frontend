import React from "react"
import { Link } from "react-router-dom"
import {
    BuildingOffice2Icon,
    ArrowPathIcon,
    ChartBarIcon,
    PlayCircleIcon,
} from "@heroicons/react/24/outline"
import logoColor from "@/assets/DockTI_Logo_Principal.svg"

const FEATURES = [
    {
        Icon: BuildingOffice2Icon,
        title: "Workspaces por área",
        text: "Trabajo, estudio y proyectos personales separados, cada uno con sus propios proyectos y equipo.",
    },
    {
        Icon: ArrowPathIcon,
        title: "Ciclos y módulos",
        text: "Corta el proyecto en entregas reales y seguí el avance de cada ciclo sin planillas paralelas.",
    },
    {
        Icon: ChartBarIcon,
        title: "Gantt y calendario",
        text: "Mira la línea de tiempo completa: qué se entrega, cuándo y qué depende de qué.",
    },
]

export default function LoginHero({ onGuestLogin }) {
    return (
        // Scrim translúcido: el fondo es una textura con notas manuscritas y el
        // texto chico se vuelve ilegible encima. Deja ver la textura, calma el ruido.
        <div className="flex flex-col gap-8 rounded-2xl bg-white/55 p-6 backdrop-blur-[2px] sm:p-8">
            <img src={logoColor} alt="DockTI · STI Chile" className="h-14 w-auto self-start" />

            <div className="flex flex-col gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate">
                    Gestión de proyectos y tareas
                </span>
                <h1 className="text-3xl font-bold leading-tight text-brand-ink sm:text-4xl lg:text-[2.75rem]">
                    Organiza tu trabajo en ciclos,
                    <br className="hidden sm:block" /> no en listas infinitas.
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-brand-slate sm:text-lg">
                    DockTask junta workspaces, proyectos, ciclos y tareas en un solo lugar, con
                    vista Gantt y calendario para no perder el panorama.
                </p>
            </div>

            <ul className="flex flex-col gap-5">
                {FEATURES.map((f) => (
                    <li key={f.title} className="flex gap-3">
                        <f.Icon
                            className="mt-0.5 h-6 w-6 flex-shrink-0 text-brand-blue"
                            strokeWidth={1.6}
                            aria-hidden="true"
                        />
                        <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-brand-ink">{f.title}</p>
                            <p className="text-sm leading-relaxed text-brand-slate">{f.text}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    onClick={onGuestLogin}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 sm:w-auto sm:self-start"
                >
                    <PlayCircleIcon className="h-5 w-5" aria-hidden="true" />
                    Probar gratis como invitado
                </button>
                <p className="text-sm text-brand-slate">
                    Sin registro ni tarjeta. Sesión demo por 24 h ·{" "}
                    <Link
                        to="/register"
                        className="font-medium text-brand-blue underline-offset-2 hover:underline"
                    >
                        crear una cuenta
                    </Link>
                </p>
            </div>
        </div>
    )
}
