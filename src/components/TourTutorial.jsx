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
            description: 'Aquí puedes ver un resumen de tus mensajes y estadísticas importantes.',
            position: 'bottom'
          }
        },
        {
          element: '.crear-mensaje-btn',
          popover: {
            title: 'Crear Mensaje',
            description: 'Haz clic aquí para crear un nuevo mensaje.',
            position: 'left'
          }
        },
        {
          element: '.stats-cards',
          popover: {
            title: 'Estadísticas',
            description: 'Estas tarjetas muestran el estado actual de tus mensajes.',
            position: 'top'
          }
        },
        {
          element: '.ultimos-mensajes',
          popover: {
            title: 'Últimos Mensajes',
            description: 'Visualiza los últimos mensajes creados o modificados.',
            position: 'top'
          }
        },
        {
          element: '.ver-mensajes-btn',
          popover: {
            title: 'Ver Todos',
            description: 'Navega a la vista completa de mensajes.',
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
            title: 'Ver Mensajes',
            description: 'Navega a la vista de mensajes.',
            position: 'top'
          }
        }
      ]
    });

    setTimeout(() => {
      tour.drive(); // <--- método correcto para iniciar
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

    {/* Mostrar el botón sólo después de que el componente esté montado */}
  </>
);
};

export default TourTutorial;
