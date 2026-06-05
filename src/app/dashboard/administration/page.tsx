// app/dashboard/administration/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Home, Users, Stethoscope, FlaskConical, Pill, Activity } from 'lucide-react';

type DashboardStats = {
  totalPatients: number;
  totalConsultations: number;
  totalExamens: number;
  totalPrescriptions: number;
  totalUsers: number;
  recentActivity: {
    id: number;
    type: string;
    description: string;
    date: string;
  }[];
};

export default function AdministrationDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalConsultations: 0,
    totalExamens: 0,
    totalPrescriptions: 0,
    totalUsers: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'administration') {
      chargerDonnees();
    }
  }, [user]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);

      // Compter les patients
      const { count: patientsCount, error: patientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      if (patientsError) throw patientsError;

      // Compter les consultations
      const { count: consultationsCount, error: consultationsError } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true });

      if (consultationsError) throw consultationsError;

      // Compter les examens de laboratoire
      const { count: laboCount, error: laboError } = await supabase
        .from('laboratoires')
        .select('*', { count: 'exact', head: true });

      if (laboError) throw laboError;

      // Compter les prescriptions
      const { count: pharmacieCount, error: pharmacieError } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact', head: true });

      if (pharmacieError) throw pharmacieError;

      // Compter les utilisateurs
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Récupérer l'activité récente (derniers patients)
      const { data: recentPatients, error: recentError } = await supabase
        .from('patients')
        .select(`
          id,
          nom,
          post_nom,
          prenom,
          statut,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Récupérer l'activité récente (dernières consultations)
      const { data: recentConsultations, error: recentConsultError } = await supabase
        .from('consultations')
        .select(`
          id,
          patient_id,
          created_at,
          patients:patient_id (
            nom,
            post_nom,
            prenom
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentConsultError) throw recentConsultError;

      // Combiner les activités récentes
      const activities = [];

      if (recentPatients) {
        recentPatients.forEach(p => {
          activities.push({
            id: p.id,
            type: 'patient',
            description: `Nouveau patient : ${p.nom} ${p.post_nom} ${p.prenom}`,
            date: p.created_at,
          });
        });
      }

      if (recentConsultations) {
        recentConsultations.forEach(c => {
          const patient = c.patients as any;
          if (patient) {
            activities.push({
              id: c.id,
              type: 'consultation',
              description: `Consultation pour ${patient.nom} ${patient.post_nom} ${patient.prenom}`,
              date: c.created_at,
            });
          }
        });
      }

      // Trier par date et prendre les 5 plus récentes
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const recentActivity = activities.slice(0, 5);

      setStats({
        totalPatients: patientsCount || 0,
        totalConsultations: consultationsCount || 0,
        totalExamens: laboCount || 0,
        totalPrescriptions: pharmacieCount || 0,
        totalUsers: usersCount || 0,
        recentActivity,
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHeures = Math.floor(diffMs / (1000 * 60 * 60));
    const diffJours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHeures < 24) return `Il y a ${diffHeures}h`;
    if (diffJours < 7) return `Il y a ${diffJours}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <Users className="h-5 w-5 text-primary" />;
      case 'consultation':
        return <Stethoscope className="h-5 w-5 text-blue-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-dark">Tableau de bord - Administration</h1>
        <p className="text-gray-500 mt-1">Bienvenue, {user?.username}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-border p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Patients</p>
                <p className="text-2xl font-bold text-text-dark">{stats.totalPatients}</p>
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
                <p className="text-2xl font-bold text-text-dark">{stats.totalConsultations}</p>
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
                <p className="text-2xl font-bold text-text-dark">{stats.totalExamens}</p>
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
                <p className="text-2xl font-bold text-text-dark">{stats.totalPrescriptions}</p>
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
                <p className="text-2xl font-bold text-text-dark">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Activité récente</h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Statistiques rapides</h2>
          {stats.totalPatients === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Patients</span>
                <span className="text-sm font-semibold text-text-dark">{stats.totalPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Consultations</span>
                <span className="text-sm font-semibold text-text-dark">{stats.totalConsultations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Examens</span>
                <span className="text-sm font-semibold text-text-dark">{stats.totalExamens}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Prescriptions</span>
                <span className="text-sm font-semibold text-text-dark">{stats.totalPrescriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Utilisateurs</span>
                <span className="text-sm font-semibold text-text-dark">{stats.totalUsers}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}