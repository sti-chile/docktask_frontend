// src/components/GanttBoard.jsx
import React, { useEffect, useState } from "react";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createHttpClient } from "@/lib/httpClient";

const GanttBoard = ({ proyectoId, tareas: propsTareas, mensajes: propsMensajes, token }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Modo embedido: recibe tareas directamente
    const source = propsTareas || propsMensajes;
    if (source) {
      const tareasValidas = source
        .filter((m) => m.start_date && m.expiration_date)
        .map((m) => ({
          id: String(m.id),
          name: m.nombre,
          start: new Date(m.start_date),
          end: new Date(m.expiration_date),
          type: "task",
          progress: m.estado === "completado" ? 100 : m.estado === "en_progreso" ? 50 : 0,
          isDisabled: false,
          dependencies: [],
        }));
      if (tareasValidas.length === 0) {
        setError("No hay tareas con fechas asignadas para mostrar en el Gantt.");
      } else {
        setTasks(tareasValidas);
      }
      setLoading(false);
      return;
    }

    // Modo standalone: carga tareas del proyecto
    if (!proyectoId) {
      setError("No se especificó un proyecto.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const api = createHttpClient(token);

    api
      .get(`/api/v1/proyectos/${proyectoId}/tareas`, { signal: controller.signal })
      .then((tareas) => {
        const tareasValidas = tareas
          .filter((m) => m.start_date && m.expiration_date)
          .map((m) => ({
            id: String(m.id),
            name: m.nombre,
            start: new Date(m.start_date),
            end: new Date(m.expiration_date),
            type: "task",
            progress: m.estado === "completado" ? 100 : m.estado === "en_progreso" ? 50 : 0,
            isDisabled: false,
            dependencies: [],
          }));
        if (tareasValidas.length === 0) {
          setError("No hay tareas con fechas asignadas.");
        } else {
          setTasks(tareasValidas);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Error al cargar las tareas para el Gantt.");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [proyectoId, propsTareas, propsMensajes, token]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-6 w-48 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-4 w-full rounded"></div>
            <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
            <div className="bg-gray-200 h-4 w-5/6 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-gray-500">{error}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Asigna fechas de inicio y expiración a tus tareas para visualizarlas en el diagrama de Gantt.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagrama de Gantt</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Gantt tasks={tasks} />
      </CardContent>
    </Card>
  );
};

export default GanttBoard;
