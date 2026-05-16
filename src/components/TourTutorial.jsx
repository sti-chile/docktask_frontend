import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const TourTutorial = () => {
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      startTour();
      localStorage.setItem('hasSeenTour', 'true');
    }
    
    const timer = setTimeout(() => setShowHelp(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const startTour = () => {
    const tour = driver({
      showProgress: true,
      allowClose: true,
        steps: [
        {
          element: '.dashboard-title',
          popover: {
            title: 'Panel Principal',
            description: 'Aquí puedes ver un resumen de tus tareas y estadísticas importantes.',
            position: 'bottom'
          }
        },
        {
          element: '.crear-mensaje-btn',
          popover: {
            title: 'Crear Tarea',
            description: 'Haz clic aquí para crear una nueva tarea.',
            position: 'left'
          }
        },
        {
          element: '.stats-cards',
          popover: {
            title: 'Estadísticas',
            description: 'Estas tarjetas muestran el estado actual de tus tareas.',
            position: 'top'
          }
        },
        {
          element: '.ultimos-mensajes',
          popover: {
            title: 'Últimas Tareas',
            description: 'Visualiza las últimas tareas creadas o modificadas.',
            position: 'top'
          }
        },
        {
          element: '.ver-mensajes-btn',
          popover: {
            title: 'Ver Todas',
            description: 'Navega a la vista completa de tareas.',
            position: 'top'
          }
        },
        {
          element: '.ver-proyectos-btn',
          popover: {
            title: 'Ver Proyectos',
            description: 'Navega a la vista completa de proyectos.',
            position: 'top'
          }
        },
        {
          element: '.cerrar-sesion-btn',
          popover: {
            title: 'Cerrar Sesión',
            description: 'Cierra sesión en la aplicación.',
            position: 'top'
          }
        },
        {
          element: '.link-ver-mensajes-btn',
          popover: {
            title: 'Ver Tareas',
            description: 'Navega a la vista de tareas.',
            position: 'top'
          }
        }
      ]
    });

    setTimeout(() => {
      tour.drive();
    }, 500);
};

return (
  <>
    {showHelp && (
      <button
        onClick={startTour}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg transition duration-300"
        title="Ayuda"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>
    )}
  </>
);
};

export default TourTutorial;
