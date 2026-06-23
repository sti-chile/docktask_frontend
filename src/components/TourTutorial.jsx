import { useEffect, useState, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { QuestionMarkCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

const TourTutorial = () => {
  const [showHelp, setShowHelp] = useState(false);
  const { isGuest } = useAuth();

  const startGuestTour = useCallback(() => {
    const tour = driver({
      showProgress: true,
      allowClose: true,
      overlayColor: 'rgba(0,0,0,0.6)',
      animate: true,
      steps: [
        {
          element: '.dashboard-title',
          popover: {
            title: '🚀 Bienvenido a DockTask',
            description:
              'Estás viendo un workspace de demostración. Aquí puedes explorar todas las funcionalidades de DockTask sin compromiso.',
            position: 'bottom',
          },
        },
        {
          element: '.stats-cards',
          popover: {
            title: '📊 Dashboard en vivo',
            description:
              'Tus tareas se organizan automáticamente con estadísticas en tiempo real. Pendientes, en progreso y completadas, todo visible de un vistazo.',
            position: 'top',
          },
        },
        {
          element: '.ver-proyectos-btn',
          popover: {
            title: '📁 Proyectos con propósito',
            description:
              'Organiza tus tareas en proyectos. Desde estudios universitarios hasta finanzas personales — DockTask se adapta a cualquier área de tu vida.',
            position: 'bottom',
          },
        },
        {
          element: '.sidebar-workspaces',
          popover: {
            title: '🏢 Workspaces',
            description:
              'Separa áreas de tu vida: trabajo, estudios, proyectos personales. Cada workspace es independiente, con sus propios proyectos y tareas.',
            position: 'right',
          },
        },
        {
          element: '.gantt-btn',
          popover: {
            title: '📅 Diagrama de Gantt',
            description:
              'Visualiza tus proyectos en una línea de tiempo. Ideal para planificar entregas, exámenes o hitos importantes.',
            position: 'left',
          },
        },
        {
          element: '.crear-mensaje-btn',
          popover: {
            title: '✏️ Crea tu primera tarea',
            description:
              '¡Anímate a probar! Crea una tarea, asígnale fecha y estado. Todo se guarda en tu sesión de prueba.',
            position: 'left',
          },
        },
        {
          element: '.register-cta',
          popover: {
            title: '💜 Crea tu cuenta gratis',
            description:
              '¿Te gusta lo que ves? Crea tu cuenta gratuita en segundos y lleva tu productividad al siguiente nivel. Tus proyectos, tus tareas, tu control.',
            position: 'top',
            doneBtnText: '¡Crear cuenta gratis!',
          },
        },
      ],
    });

    setTimeout(() => tour.drive(), 500);
  }, []);

  const startUserTour = useCallback(() => {
    const tour = driver({
      showProgress: true,
      allowClose: true,
      steps: [
        {
          element: '.dashboard-title',
          popover: {
            title: 'Panel Principal',
            description:
              'Aquí puedes ver un resumen de tus tareas y estadísticas importantes.',
            position: 'bottom',
          },
        },
        {
          element: '.crear-mensaje-btn',
          popover: {
            title: 'Crear Tarea',
            description: 'Haz clic aquí para crear una nueva tarea.',
            position: 'left',
          },
        },
        {
          element: '.stats-cards',
          popover: {
            title: 'Estadísticas',
            description:
              'Estas tarjetas muestran el estado actual de tus tareas.',
            position: 'top',
          },
        },
        {
          element: '.ultimos-mensajes',
          popover: {
            title: 'Últimas Tareas',
            description:
              'Visualiza las últimas tareas creadas o modificadas.',
            position: 'top',
          },
        },
        {
          element: '.ver-mensajes-btn',
          popover: {
            title: 'Ver Todas',
            description: 'Navega a la vista completa de tareas.',
            position: 'top',
          },
        },
        {
          element: '.ver-proyectos-btn',
          popover: {
            title: 'Ver Proyectos',
            description: 'Navega a la vista completa de proyectos.',
            position: 'top',
          },
        },
        {
          element: '.cerrar-sesion-btn',
          popover: {
            title: 'Cerrar Sesión',
            description: 'Cierra sesión en la aplicación.',
            position: 'top',
          },
        },
        {
          element: '.link-ver-mensajes-btn',
          popover: {
            title: 'Ver Tareas',
            description: 'Navega a la vista de tareas.',
            position: 'top',
          },
        },
      ],
    });

    setTimeout(() => tour.drive(), 500);
  }, []);

  useEffect(() => {
    const key = isGuest ? 'hasSeenGuestTour' : 'hasSeenTour';
    const hasSeen = localStorage.getItem(key);

    if (!hasSeen) {
      // Pequeño delay para que la UI cargue completamente
      const t = setTimeout(() => {
        if (isGuest) {
          startGuestTour();
        } else {
          startUserTour();
        }
        localStorage.setItem(key, 'true');
      }, 1500);
      return () => clearTimeout(t);
    }

    const timer = setTimeout(() => setShowHelp(true), 1000);
    return () => clearTimeout(timer);
  }, [isGuest, startGuestTour, startUserTour]);

  const startTour = isGuest ? startGuestTour : startUserTour;

  return (
    <>
      {showHelp && (
        <button
          onClick={startTour}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg transition duration-300 z-50"
          title="Ayuda"
        >
          <QuestionMarkCircleIcon className="h-6 w-6" />
        </button>
      )}
    </>
  );
};

export default TourTutorial;
