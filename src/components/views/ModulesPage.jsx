// ModulesPage — página principal de módulos dentro de un workspace
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ModuleList from '../modules/ModuleList';

const ModulesPage = () => {
  const { workspaceId } = useParams();
  const { token } = useAuth();
  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <ModuleList token={token} workspaceId={parseInt(workspaceId)} />
    </div>
  );
};

export default ModulesPage;
