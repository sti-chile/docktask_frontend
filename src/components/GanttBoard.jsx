// src/components/GanttBoard.jsx
import React, { useRef, useEffect } from "react";
import { Gantt } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const GanttBoard = ({ proyectoId }) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // TODO (Issue #1): reemplazar por fetch a /api/proyectos/:id/mensajes
  const tasks = [
    {
      start: today,
      end: tomorrow,
      name: "Planificar tareas",
      id: "Task1",
      type: "task",
      progress: 20,
      isDisabled: false,
      dependencies: []
    },
    {
      start: new Date(tomorrow),
      end: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
      name: "Ejecutar proyecto",
      id: "Task2",
      type: "task",
      progress: 50,
      dependencies: ["Task1"]
    },
    {
      start: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000),
      end: new Date(tomorrow.getTime() + 5 * 24 * 60 * 60 * 1000),
      name: "Revisión final",
      id: "Task3",
      type: "task",
      progress: 0,
      dependencies: ["Task2"]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            Vista de Diagrama Gantt
            {proyectoId ? ` — Proyecto #${proyectoId}` : " (Simulado)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Gantt
              tasks={tasks}
              viewMode={"Day"}
              listCellWidth={"155px"}
              columnWidth={65}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttBoard;
