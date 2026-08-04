import React from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { tareasToCalendarEvents } from "../CalendarTasks"

const localizer = momentLocalizer(moment)

const MiniCard = ({ event }) => (
    <div className="bg-white border rounded shadow p-1 text-xs overflow-hidden">
        <div className="font-bold truncate">{event.title}</div>
        <div className="text-gray-500 truncate">
            {event.tarea?.descripcion || event.tarea?.mensaje || ""}
        </div>
    </div>
)

const CalendarView = ({ tareas, mensajes }) => {
    const source = tareas || mensajes
    const events = tareasToCalendarEvents(source)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">
                Calendario de Tareas (por fecha de expiración)
            </h1>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                views={["month"]}
                components={{ event: MiniCard }}
                messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "No hay eventos en este rango",
                    showMore: (total) => `+${total} más`,
                }}
            />
        </div>
    )
}

export default CalendarView
