import React from "react"
import { cn } from "@/lib/utils"

const SIZE_CLASS = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
}

/**
 * Grupo de tabs tipo "pastilla": fondo gris, la activa queda elevada en blanco.
 *
 * Adaptado de ach-platform (apps/next_front/src/components/shared/pill-tabs.jsx),
 * donde el color de la tab activa venía hardcodeado (`text-[#4D37BC]`, el violeta
 * de ACH). Acá las clases de estado entran por prop con defaults de DockTI.
 *
 * @param {object}   props
 * @param {Array}    props.tabs   [{ value, label, icon?, badge?, disabled? }]
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {string}   [props.activeClassName]   Clases de la tab activa.
 * @param {string}   [props.badgeClassName]    Clases del badge numérico.
 */
export function PillTabs({
    tabs,
    value,
    onChange,
    size = "sm",
    className,
    activeClassName = "bg-white text-brand-blue shadow-sm",
    badgeClassName = "bg-brand-red text-white",
}) {
    return (
        <div role="tablist" className={cn("flex gap-1 rounded-xl bg-gray-100 p-1", className)}>
            {tabs.map((tab) => {
                const Icon = tab.icon
                const activa = value === tab.value
                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={activa}
                        disabled={tab.disabled}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            "flex items-center gap-2 rounded-lg font-medium transition-all",
                            SIZE_CLASS[size],
                            tab.disabled
                                ? "cursor-not-allowed text-gray-300"
                                : activa
                                  ? activeClassName
                                  : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                        {tab.label}
                        {tab.badge > 0 && (
                            <span
                                className={cn(
                                    "ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                                    badgeClassName
                                )}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

export default PillTabs
