import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMensajesQuery } from '../hooks/useMensajesQuery';
import {
  ChatBubbleLeftIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TourTutorial from '@/components/TourTutorial';

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const { mensajes, loading } = useMensajesQuery(token);

  const onVerTodosMensajes = () => navigate('/mis-mensajes');

  useEffect(() => {
    
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalMensajes = mensajes.length;
  const mensajesPorVencer = mensajes.filter(mensaje => {
    if (!mensaje.expiration_date) return false;
    const fechaExpiracion = new Date(mensaje.expiration_date);
    const ahora = new Date();
    const diasRestantes = (fechaExpiracion - ahora) / (1000 * 60 * 60 * 24);
    return diasRestantes > 0 && diasRestantes <= 7;
  }).length;

  const mensajesPorEstado = {
    pendiente: mensajes.filter(m => m.estado === 'pendiente').length,
    en_progreso: mensajes.filter(m => m.estado === 'en_progreso').length,
    completado: mensajes.filter(m => m.estado === 'completado').length,
    archivado: mensajes.filter(m => m.estado === 'archivado').length,
    por_vencer: mensajes.filter(m => m.estado === 'por_vencer').length
  };

  const stats = [
    {
      name: 'Total de Mensajes',
      value: totalMensajes,
      icon: DocumentTextIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      name: 'Por Vencer',
      value: mensajesPorEstado.por_vencer,
      icon: ExclamationCircleIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      name: 'Pendientes',
      value: mensajesPorEstado.pendiente,
      icon: ClockIcon,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      estado: 'pendiente'
    },
    {
      name: 'En Progreso',
      value: mensajesPorEstado.en_progreso,
      icon: ClockIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      estado: 'en_progreso'
    },
    {
      name: 'Completados',
      value: mensajesPorEstado.completado,
      icon: CheckCircleIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      estado: 'completado'
    },
    {
      name: 'Archivados',
      value: mensajesPorEstado.archivado,
      icon: ArchiveBoxIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      estado: 'archivado'
    }
  ];

  const ultimosMensajes = mensajes.slice(0, 5);
  const [estadoFiltrado, setEstadoFiltrado] = React.useState(null);
  const handleFiltrarPorEstado = (estado) => {
    setEstadoFiltrado(estado);
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <TourTutorial />
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dashboard-title">Dashboard</h1>
            <p className="text-gray-500 mt-1">Resumen de tus mensajes y actividades</p>
          </div>
          <Button onClick={() => navigate('/create')} className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 crear-mensaje-btn" />
            Crear Nuevo Mensaje
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stats-cards">
          {stats.map((stat) => (
            <Card key={stat.name} onClick={() => handleFiltrarPorEstado(stat.estado)} className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
              estadoFiltrado === stat.estado ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {estadoFiltrado && (
            <Card>
              <CardHeader>
                <CardTitle>Mensajes con estado: {estadoFiltrado}</CardTitle>
                <CardDescription>Mostrando resultados filtrados</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEstadoFiltrado(null)}
                  className="mb-4 text-blue-500 hover:text-blue-600"
                >
                  Limpiar filtro
                </Button>

                <ul className="space-y-3">
                  {mensajes
                    .filter((msg) => msg.estado === estadoFiltrado)
                    .map((msg) => (
                      <li key={msg.id} className="border-b pb-2">
                        <div className="font-medium text-gray-800">{msg.nombre}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(msg.updated_at).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

        </div>

        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/mis-mensajes')}
            className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2 link-ver-mensajes-btn"
          >
            <DocumentTextIcon className="h-5 w-5" />
            Ver todos los mensajes
          </Button>
        </div>

        <Card className="ultimos-mensajes">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimos mensajes</CardTitle>
              <CardDescription>Actividades recientes</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onVerTodosMensajes}>
              <EyeIcon className="h-4 w-4 mr-1" />
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            {ultimosMensajes.length === 0 ? (
              <p className="text-gray-500">Aún no tienes mensajes recientes.</p>
            ) : (
              <ul className="space-y-3">
                {ultimosMensajes.map((msg) => (
                  <li key={msg.id} className="border-b pb-2">
                    <div className="font-medium text-gray-800">{msg.nombre}</div>
                    <div className="text-sm text-gray-500">
                      Estado: <span className="font-semibold">{msg.estado}</span> · {new Date(msg.updated_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;