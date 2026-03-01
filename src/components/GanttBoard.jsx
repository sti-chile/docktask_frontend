// src/components/GanttBoard.jsx
import React, { useEffect, useState } from "react";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buildAxios } from "@/api/axiosInstance";

const GanttBoard = ({ proyectoId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!proyectoId) {
      setError("No se especificó un proyecto.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const api = buildAxios(token);

    api
      .get(`/api/proyectos/${proyectoId}/mensajes`)
      .then((res) => {
        const mensajes = res.data;

        const tareasValidas = mensajes
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
          setError("No hay mensajes con fechas asignadas para mostrar en el Gantt.");
        } else {
          setTasks(tareasValidas);
        }
      })
      .catch(() => {
        setError("Error al cargar los mensajes del proyecto.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [proyectoId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Diagrama Gantt del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-gray-500">Cargando tareas...</p>
          )}
          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!loading && !error && tasks.length > 0 && (
            <div className="overflow-auto">
              <Gantt
                tasks={tasks}
                viewMode={"Day"}
                listCellWidth={"155px"}
                columnWidth={65}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttBoard;
