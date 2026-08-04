import React from "react"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Encabezado de página con título, descripción opcional, acción y vuelta atrás.
 *
 * Adaptado de ach-platform (apps/next_front/src/components/shared/page-header.jsx).
 * Ahí el color del título venía hardcodeado (`text-[#252850]`, el azul de ACH), lo
 * que ataba el componente a otra marca. Acá el color entra por prop y su default
 * son los tokens de DockTI, así que el mismo componente sirve en cualquier marca
 * sin tocar su código.
 *
 * @param {object}   props
 * @param {string}   props.title
 * @param {string}   [props.description]
 * @param {Function} [props.icon]            Componente de icono (heroicons/lucide).
 * @param {object}   [props.action]          { label, onClick, icon }
 * @param {object}   [props.back]            { label, onClick } para volver atrás.
 * @param {string}   [props.titleClassName]  Color/tipografía del título.
 * @param {node}     [props.children]        Reemplaza a `action` si viene.
 */
export function PageHeader({
    title,
    description,
    icon: Icon,
    action,
    back,
    titleClassName = "text-brand-ink dark:text-white",
    className,
    children,
}) {
    return (
        <div className={cn("flex flex-col gap-3 pb-6", className)}>
            {back && (
                <button
                    type="button"
                    onClick={back.onClick}
                    className="flex items-center gap-1 self-start text-sm text-brand-slate transition-colors hover:text-brand-blue"
                >
                    <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                    {back.label}
                </button>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                    <h1
                        className={cn(
                            "flex items-center gap-2 text-2xl font-bold tracking-tight",
                            titleClassName
                        )}
                    >
                        {Icon && <Icon className="h-6 w-6" aria-hidden="true" />}
                        {title}
                    </h1>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>

                {children ? (
                    <div className="flex gap-2">{children}</div>
                ) : (
                    action && (
                        <Button onClick={action.onClick} className="w-full md:w-auto">
                            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                            {action.label}
                        </Button>
                    )
                )}
            </div>
        </div>
    )
}

export default PageHeader
