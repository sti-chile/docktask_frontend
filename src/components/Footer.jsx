import React from "react"
import { Link } from "react-router-dom"
import { Github, Linkedin, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import logoColor from "@/assets/DockTI_Logo_Principal.svg"
import logoBlanco from "@/assets/DockTI_Logo_Blanco.svg"

/* Rutas internas: deben existir en App.jsx */
const PRODUCT_LINKS = [
    { label: "Workspaces", to: "/mis-workspaces" },
    { label: "Proyectos", to: "/mis-proyectos" },
    { label: "Tareas", to: "/mis-tareas" },
    { label: "Mensajes", to: "/mis-mensajes" },
    { label: "Vista Gantt", to: "/gantt" },
]

/* Enlaces externos: reemplazar "#" por las URLs definitivas */
const RESOURCE_LINKS = [
    { label: "Documentación", href: "#" },
    { label: "Roadmap", href: "#" },
    { label: "Novedades", href: "#" },
    { label: "Soporte", href: "#" },
]

const LEGAL_LINKS = [
    { label: "Términos y condiciones", href: "#" },
    { label: "Política de privacidad", href: "#" },
    { label: "Cookies", href: "#" },
]

const SOCIAL_LINKS = [
    { label: "GitHub", href: "#", Icon: Github },
    { label: "LinkedIn", href: "#", Icon: Linkedin },
    { label: "Correo", href: "mailto:contacto@dockti.cl", Icon: Mail },
]

const linkClass =
    "text-[15px] text-brand-slate transition-colors hover:text-brand-blue dark:text-muted-foreground dark:hover:text-foreground"

function FooterColumn({ heading, links }) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold tracking-[0.1em] text-brand-ink dark:text-foreground">
                {heading.toUpperCase()}
            </h3>
            <ul className="flex flex-col gap-3">
                {links.map(({ label, to, href }) => (
                    <li key={label}>
                        {to ? (
                            <Link to={to} className={linkClass}>
                                {label}
                            </Link>
                        ) : (
                            <a href={href} className={linkClass}>
                                {label}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default function Footer({
    version = "v0.1.0",
    statusLabel = "Todos los sistemas operativos",
    className,
}) {
    const year = new Date().getFullYear()

    return (
        <footer
            className={cn(
                "w-full border-t border-brand-line bg-brand-surface dark:border-border dark:bg-background",
                className
            )}
        >
            <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-11 px-6 pb-7 pt-14 md:px-10 lg:px-24">
                <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
                    <div className="flex w-full flex-col gap-5 lg:w-[400px] lg:shrink-0">
                        <Link to="/" className="self-start" aria-label="DockTI — Inicio">
                            <img
                                src={logoColor}
                                alt="DockTI · STI Chile"
                                className="h-16 w-auto dark:hidden"
                            />
                            <img
                                src={logoBlanco}
                                alt="DockTI · STI Chile"
                                className="hidden h-16 w-auto dark:block"
                            />
                        </Link>
                        <p className="text-[15px] leading-relaxed text-brand-slate dark:text-muted-foreground">
                            Organizá workspaces, proyectos, ciclos y tareas en un solo lugar.
                            Simple, rápido y sin fricción.
                        </p>
                        <div className="flex gap-3">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-slate transition-colors hover:border-brand-blue hover:text-brand-blue dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-foreground"
                                >
                                    <social.Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-10 sm:flex-row sm:justify-between sm:gap-16">
                        <FooterColumn heading="Producto" links={PRODUCT_LINKS} />
                        <FooterColumn heading="Recursos" links={RESOURCE_LINKS} />
                        <FooterColumn heading="Legal" links={LEGAL_LINKS} />
                    </div>
                </div>

                <div className="h-px w-full bg-brand-line dark:bg-border" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-brand-slate dark:text-muted-foreground">
                        © {year} DockTI · STI Chile. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-5">
                        <span className="flex items-center gap-2 text-[13px] text-brand-slate dark:text-muted-foreground">
                            <span
                                className="h-2 w-2 rounded-full bg-brand-lime"
                                aria-hidden="true"
                            />
                            {statusLabel}
                        </span>
                        <span className="rounded-md border border-brand-line bg-white px-2.5 py-1 text-xs text-brand-slate dark:border-border dark:bg-card dark:text-muted-foreground">
                            {version}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
