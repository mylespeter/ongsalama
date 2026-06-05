// app/dashboard/administration/page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { Home, Users, Stethoscope, FlaskConical, Pill, Activity } from 'lucide-react';

export default function AdministrationDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-dark">Tableau de bord - Administration</h1>
        <p className="text-gray-500 mt-1">Bienvenue, {user?.username}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Patients</p>
              <p className="text-2xl font-bold text-text-dark">0</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Consultations</p>
              <p className="text-2xl font-bold text-text-dark">0</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Examens</p>
              <p className="text-2xl font-bold text-text-dark">0</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Prescriptions</p>
              <p className="text-2xl font-bold text-text-dark">0</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Pill className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-2xl font-bold text-text-dark">0</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Activité récente</h2>
          <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Statistiques rapides</h2>
          <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
        </div>
      </div>
    </div>
  );
}