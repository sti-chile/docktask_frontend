import React from 'react';
import { Squares2X2Icon, ClipboardDocumentListIcon, CalendarDaysIcon } from '@heroicons/react/24/outline/index.js';

const views = [
  { key: 'board', label: 'Board', icon: Squares2X2Icon },
  { key: 'tasks', label: 'Tasks', icon: ClipboardDocumentListIcon },
  { key: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { key: 'gantt', label: 'Gantt', icon: CalendarDaysIcon },
];

const ViewSwitcher = ({ activeView, onChange }) => (
  <div className="flex space-x-2 mb-6">
    {views.map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-200
          ${activeView === key ? 'bg-primary text-primary-foreground shadow' : 'bg-gray-100 text-gray-700 hover:bg-primary/10'}`}
      >
        <Icon className={`h-5 w-5 ${activeView === key ? 'text-primary-foreground' : 'text-primary'}`} />
        {label}
      </button>
    ))}
  </div>
);

export default ViewSwitcher; 