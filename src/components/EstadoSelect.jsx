import React from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  ClockIcon as ClockIconSolid,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";


const EstadoSelect = ({ estado, onChange, disabled = false }) => {
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
      case 'en_progreso':
        return <ClockIconSolid className="h-4 w-4 text-blue-500" />;
      case 'completado':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'archivado':
        return <ArchiveBoxIcon className="h-4 w-4 text-yellow-500" />;
      case 'urgente':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEstadoClasses = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'archivado':
        return 'bg-gray-100 text-gray-800';
      case 'urgente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  

  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={estado}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`block w-full sm:w-auto appearance-none border border-gray-300 rounded-md pl-8 pr-10 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors duration-200 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed'
            : `${getEstadoClasses(estado)} cursor-pointer hover:bg-gray-50`
        }`}
      >
        <option value="pendiente" className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-gray-500 bg-gray-50" />
          Pendiente
        </option>
        <option value="en_progreso" className="flex items-center gap-2">
          <ClockIconSolid className="h-4 w-4 text-blue-500 bg-blue-50" />
          En progreso
        </option>
        <option value="completado" className="flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-500 bg-green-50" />
          Completado
        </option>
        <option value="archivado" className="flex items-center gap-2">
          <ArchiveBoxIcon className="h-4 w-4 text-yellow-500 bg-yellow-50" />
          Archivado
        </option>
        <option value="urgente" className="flex items-center gap-2">
          Urgente
        </option>
      </select>
      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
        {getEstadoIcon(estado)}
      </div>
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 ${disabled ? 'opacity-50' : ''}`} />
      </div>
    </div>
  );
};

export default EstadoSelect; 