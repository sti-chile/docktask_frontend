// Helper para transformar tareas a eventos para react-big-calendar
export function tareasToCalendarEvents(tareas) {
  if (!Array.isArray(tareas)) return [];
  return tareas
    .filter(t => t.expiration_date)
    .map(t => ({
      id: t.id,
      title: t.nombre || t.descripcion || t.mensaje || 'Tarea',
      start: new Date(t.expiration_date),
      end: new Date(t.expiration_date),
      tarea: t
    }));
}
