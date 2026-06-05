// app/agent/statistiques/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FaChartBar, FaChartLine, FaChartPie, FaFileAlt,
  FaClock, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaExclamationTriangle, FaCalendarAlt, FaDownload,
  FaFilter, FaMoneyBillWave, FaUserCheck, FaClipboardList,
  FaArrowUp, FaArrowDown, FaMinus
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';

// ==================== TYPES ====================

type StatsPeriode = {
  mois: string;
  total: number;
  en_attente: number;
  en_cours: number;
  expertise: number;
  en_indemnisation: number;
  cloture: number;
  refuse: number;
  delai_moyen: number;
  montant_total: number;
};

type StatsType = {
  total_sinistres: number;
  sinistres_actifs: number;
  sinistres_clotures: number;
  delai_moyen_traitement: number;
  montant_total_indemnisations: number;
  taux_resolution: number;
};

type StatsParType = {
  type: string;
  label: string;
  icon: string;
  nombre: number;
  pourcentage: number;
};

type StatsExpert = {
  nom: string;
  email: string;
  expertises_total: number;
  expertises_en_cours: number;
  expertises_terminees: number;
  delai_moyen: number;
};

type RapportFiltres = {
  dateDebut: string;
  dateFin: string;
  typeSinistre: string;
  statut: string;
};

// ==================== CONSTANTES ====================

const COULEURS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  gray: '#6B7280',
};

const COULEURS_GRAPH = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#6366F1', '#EC4899', '#14B8A6'
];

const TYPES_SINISTRE: Record<string, { label: string; icon: string }> = {
  accident_auto: { label: 'Accident auto', icon: '🚗' },
  vol: { label: 'Vol', icon: '🔫' },
  incendie: { label: 'Incendie', icon: '🔥' },
  degats_eau: { label: 'Dégâts des eaux', icon: '💧' },
  catastrophe_naturelle: { label: 'Catastrophe naturelle', icon: '🌪️' },
  bris_glace: { label: 'Bris de glace', icon: '🪟' },
  responsabilite_civile: { label: 'Responsabilité civile', icon: '⚖️' },
  autre: { label: 'Autre', icon: '📋' },
};

const STATUTS: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: '#F59E0B' },
  en_cours: { label: 'En cours', color: '#3B82F6' },
  expertise: { label: 'Expertise', color: '#8B5CF6' },
  en_indemnisation: { label: 'Indemnisation', color: '#6366F1' },
  cloture: { label: 'Clôturé', color: '#10B981' },
  refuse: { label: 'Refusé', color: '#EF4444' },
};

// ==================== COMPOSANTS ====================

function StatCard({ 
  title, value, icon: Icon, color, tendance, tendanceValeur 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<any>; 
  color: string;
  tendance?: 'up' | 'down' | 'stable';
  tendanceValeur?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {tendanceValeur && (
            <p className={`mt-1 text-sm flex items-center ${
              tendance === 'up' ? 'text-green-600' : 
              tendance === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {tendance === 'up' && <FaArrowUp className="mr-1 h-3 w-3" />}
              {tendance === 'down' && <FaArrowDown className="mr-1 h-3 w-3" />}
              {tendance === 'stable' && <FaMinus className="mr-1 h-3 w-3" />}
              {tendanceValeur}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}: </span>
            <span className="font-medium ml-1">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div className="text-center">
        <FaChartBar className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

// ==================== PAGE PRINCIPALE ====================

export default function StatistiquesPage() {
  const { user } = useAuth();
  const router = useRouter();

  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vue-ensemble' | 'sinistres' | 'delais' | 'experts'>('vue-ensemble');

  // Stats globales
  const [statsGlobales, setStatsGlobales] = useState<StatsType>({
    total_sinistres: 0,
    sinistres_actifs: 0,
    sinistres_clotures: 0,
    delai_moyen_traitement: 0,
    montant_total_indemnisations: 0,
    taux_resolution: 0,
  });

  // Données pour graphiques
  const [statsParMois, setStatsParMois] = useState<StatsPeriode[]>([]);
  const [statsParType, setStatsParType] = useState<StatsParType[]>([]);
  const [statsParStatut, setStatsParStatut] = useState<{ name: string; value: number; color: string }[]>([]);
  const [statsExperts, setStatsExperts] = useState<StatsExpert[]>([]);
  const [delaisTraitement, setDelaisTraitement] = useState<any[]>([]);

  // Filtres
  const [filtres, setFiltres] = useState<RapportFiltres>({
    dateDebut: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    dateFin: format(new Date(), 'yyyy-MM-dd'),
    typeSinistre: '',
    statut: '',
  });

  useEffect(() => {
    if (user && ['admin', 'agent'].includes(user.role || '')) {
      chargerToutesLesStats();
    }
  }, [user]);

  useEffect(() => {
    chargerStatsParPeriode();
  }, [filtres]);

  // ==================== CHARGEMENT ====================

  const chargerToutesLesStats = async () => {
    try {
      setLoading(true);
      await Promise.all([
        chargerStatsGlobales(),
        chargerStatsParPeriode(),
        chargerStatsParType(),
        chargerStatsParStatut(),
        chargerStatsExperts(),
        chargerDelaisTraitement(),
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chargerStatsGlobales = async () => {
    // Total sinistres
    const { count: total } = await supabase
      .from('sinistres')
      .select('id', { count: 'exact', head: true });

    // Sinistres actifs (non clôturés, non refusés)
    const { count: actifs } = await supabase
      .from('sinistres')
      .select('id', { count: 'exact', head: true })
      .not('statut', 'in', '("cloture","refuse")');

    // Sinistres clôturés
    const { count: clotures } = await supabase
      .from('sinistres')
      .select('id', { count: 'exact', head: true })
      .eq('statut', 'cloture');

    // Montant total des indemnisations
    const { data: montants } = await supabase
      .from('sinistres')
      .select('montant_indemnisation')
      .eq('statut', 'cloture')
      .not('montant_indemnisation', 'is', null);

    const montantTotal = (montants || []).reduce((sum, s) => sum + (s.montant_indemnisation || 0), 0);

    // Délai moyen de traitement
    const { data: delais } = await supabase
      .from('sinistres')
      .select('created_at, updated_at')
      .eq('statut', 'cloture');

    let delaiMoyen = 0;
    if (delais && delais.length > 0) {
      const totalJours = delais.reduce((sum, s) => {
        const debut = new Date(s.created_at);
        const fin = new Date(s.updated_at);
        return sum + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24);
      }, 0);
      delaiMoyen = Math.round(totalJours / delais.length);
    }

    setStatsGlobales({
      total_sinistres: total || 0,
      sinistres_actifs: actifs || 0,
      sinistres_clotures: clotures || 0,
      delai_moyen_traitement: delaiMoyen,
      montant_total_indemnisations: montantTotal,
      taux_resolution: total ? Math.round(((clotures || 0) / total) * 100) : 0,
    });
  };

  const chargerStatsParPeriode = async () => {
    const debut = new Date(filtres.dateDebut);
    const fin = new Date(filtres.dateFin);
    
    const mois = eachMonthOfInterval({ start: debut, end: fin });
    
    const statsMensuelles = await Promise.all(
      mois.map(async (date) => {
        const debutMois = startOfMonth(date);
        const finMois = endOfMonth(date);
        
        let query = supabase
          .from('sinistres')
          .select('*', { count: 'exact' })
          .gte('created_at', debutMois.toISOString())
          .lte('created_at', finMois.toISOString());

        if (filtres.typeSinistre) {
          query = query.eq('type_sinistre', filtres.typeSinistre);
        }

        const { data, count } = await query;

        return {
          mois: format(date, 'MMM yyyy', { locale: fr }),
          total: count || 0,
          en_attente: (data || []).filter(s => s.statut === 'en_attente').length,
          en_cours: (data || []).filter(s => s.statut === 'en_cours').length,
          expertise: (data || []).filter(s => s.statut === 'expertise').length,
          en_indemnisation: (data || []).filter(s => s.statut === 'en_indemnisation').length,
          cloture: (data || []).filter(s => s.statut === 'cloture').length,
          refuse: (data || []).filter(s => s.statut === 'refuse').length,
          delai_moyen: 0,
          montant_total: (data || []).reduce((sum, s) => sum + (s.montant_indemnisation || 0), 0),
        };
      })
    );

    setStatsParMois(statsMensuelles);
  };

  const chargerStatsParType = async () => {
    const stats = await Promise.all(
      Object.entries(TYPES_SINISTRE).map(async ([type, info]) => {
        const { count } = await supabase
          .from('sinistres')
          .select('id', { count: 'exact', head: true })
          .eq('type_sinistre', type);

        return {
          type,
          label: info.label,
          icon: info.icon,
          nombre: count || 0,
          pourcentage: 0,
        };
      })
    );

    const total = stats.reduce((sum, s) => sum + s.nombre, 0);
    const statsWithPourcentage = stats.map(s => ({
      ...s,
      pourcentage: total > 0 ? Math.round((s.nombre / total) * 100) : 0,
    }));

    setStatsParType(statsWithPourcentage.sort((a, b) => b.nombre - a.nombre));
  };

  const chargerStatsParStatut = async () => {
    const stats = await Promise.all(
      Object.entries(STATUTS).map(async ([statut, info]) => {
        const { count } = await supabase
          .from('sinistres')
          .select('id', { count: 'exact', head: true })
          .eq('statut', statut);

        return {
          name: info.label,
          value: count || 0,
          color: info.color,
        };
      })
    );

    setStatsParStatut(stats);
  };

  const chargerStatsExperts = async () => {
    const { data: experts } = await supabase
      .from('users')
      .select('id, nom, email')
      .eq('role', 'expert');

    if (experts) {
      const statsExpertsData = await Promise.all(
        experts.map(async (expert) => {
          const { count: total } = await supabase
            .from('expertises')
            .select('id', { count: 'exact', head: true })
            .eq('expert_id', expert.id);

          const { count: enCours } = await supabase
            .from('expertises')
            .select('id', { count: 'exact', head: true })
            .eq('expert_id', expert.id)
            .in('statut', ['planifiee', 'en_cours']);

          const { count: terminees } = await supabase
            .from('expertises')
            .select('id', { count: 'exact', head: true })
            .eq('expert_id', expert.id)
            .eq('statut', 'terminee');

          return {
            nom: expert.nom,
            email: expert.email,
            expertises_total: total || 0,
            expertises_en_cours: enCours || 0,
            expertises_terminees: terminees || 0,
            delai_moyen: 0,
          };
        })
      );

      setStatsExperts(statsExpertsData);
    }
  };

  const chargerDelaisTraitement = async () => {
    const { data } = await supabase
      .from('sinistres')
      .select('created_at, updated_at, statut, numero_dossier')
      .not('statut', 'in', '("en_attente")')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const delais = data.map(s => {
        const debut = new Date(s.created_at);
        const fin = s.statut === 'cloture' || s.statut === 'refuse' 
          ? new Date(s.updated_at) 
          : new Date();
        return {
          dossier: s.numero_dossier,
          statut: STATUTS[s.statut]?.label || s.statut,
          jours: Math.round((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)),
        };
      });

      setDelaisTraitement(delais);
    }
  };

  // ==================== HELPERS ====================

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
      maximumFractionDigits: 0,
    }).format(montant);
  };

  const handleExportCSV = () => {
    // Logique d'export CSV
    alert('Export CSV en cours de développement');
  };

  const handleExportPDF = () => {
    // Logique d'export PDF
    alert('Export PDF en cours de développement');
  };

  // ==================== RENDU ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                <FaChartBar className="mr-3 h-6 w-6 text-blue-600" />
                Statistiques et rapports
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Analysez les performances et suivez les indicateurs clés
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaDownload className="mr-2 h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <FaDownload className="mr-2 h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6 inline-flex">
          {[
            { key: 'vue-ensemble', label: 'Vue d\'ensemble', icon: FaChartPie },
            { key: 'sinistres', label: 'Sinistres', icon: FaFileAlt },
            { key: 'delais', label: 'Délais', icon: FaClock },
            { key: 'experts', label: 'Experts', icon: FaUserCheck },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu par onglet */}
        {activeTab === 'vue-ensemble' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total sinistres"
                value={statsGlobales.total_sinistres}
                icon={FaFileAlt}
                color={COULEURS.primary}
              />
              <StatCard
                title="Sinistres actifs"
                value={statsGlobales.sinistres_actifs}
                icon={FaSpinner}
                color={COULEURS.warning}
              />
              <StatCard
                title="Taux de résolution"
                value={`${statsGlobales.taux_resolution}%`}
                icon={FaCheckCircle}
                color={COULEURS.success}
                tendance="up"
                tendanceValeur="+5% ce mois"
              />
              <StatCard
                title="Délai moyen"
                value={`${statsGlobales.delai_moyen_traitement} jours`}
                icon={FaClock}
                color={COULEURS.indigo}
                tendance="down"
                tendanceValeur="-2 jours"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Évolution mensuelle */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Évolution des sinistres</h3>
                {statsParMois.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={statsParMois}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke={COULEURS.primary} 
                        fill={COULEURS.primary} 
                        fillOpacity={0.1}
                        name="Total"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cloture" 
                        stroke={COULEURS.success} 
                        fill={COULEURS.success} 
                        fillOpacity={0.1}
                        name="Clôturés"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Aucune donnée disponible" />
                )}
              </div>

              {/* Répartition par statut */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Répartition par statut</h3>
                {statsParStatut.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statsParStatut}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statsParStatut.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Aucune donnée disponible" />
                )}
              </div>
            </div>

            {/* Répartition par type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Sinistres par type</h3>
              {statsParType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsParType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="label" 
                      fontSize={12} 
                      width={150}
                      tick={({ x, y, payload }) => (
                        <text x={x} y={y} dy={-4} textAnchor="end" fontSize={12} fill="#374151">
                          {statsParType.find(s => s.label === payload.value)?.icon} {payload.value}
                        </text>
                      )}
                    />
                    <Tooltip />
                    <Bar dataKey="nombre" fill={COULEURS.primary} radius={[0, 4, 4, 0]} name="Nombre">
                      {statsParType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COULEURS_GRAPH[index % COULEURS_GRAPH.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Aucune donnée disponible" />
              )}
            </div>
          </>
        )}

        {activeTab === 'sinistres' && (
          <>
            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={filtres.dateDebut}
                    onChange={(e) => setFiltres({...filtres, dateDebut: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={filtres.dateFin}
                    onChange={(e) => setFiltres({...filtres, dateFin: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type sinistre</label>
                  <select
                    value={filtres.typeSinistre}
                    onChange={(e) => setFiltres({...filtres, typeSinistre: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Tous</option>
                    {Object.entries(TYPES_SINISTRE).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={filtres.statut}
                    onChange={(e) => setFiltres({...filtres, statut: e.target.value})}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Tous</option>
                    {Object.entries(STATUTS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Graphique évolution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Évolution détaillée par statut</h3>
              {statsParMois.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statsParMois}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="en_attente" stackId="a" fill={STATUTS.en_attente.color} name="En attente" />
                    <Bar dataKey="en_cours" stackId="a" fill={STATUTS.en_cours.color} name="En cours" />
                    <Bar dataKey="expertise" stackId="a" fill={STATUTS.expertise.color} name="Expertise" />
                    <Bar dataKey="en_indemnisation" stackId="a" fill={STATUTS.en_indemnisation.color} name="Indemnisation" />
                    <Bar dataKey="cloture" stackId="a" fill={STATUTS.cloture.color} name="Clôturé" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Aucune donnée disponible" />
              )}
            </div>

            {/* Montants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Montants mensuels</h3>
                {statsParMois.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={statsParMois}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="total" fill={COULEURS.primary} name="Nombre" />
                      <Line 
                        type="monotone" 
                        dataKey="montant_total" 
                        stroke={COULEURS.success} 
                        name="Montant (CDF)"
                        yAxisId={1}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Aucune donnée disponible" />
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Taux de clôture</h3>
                {statsParMois.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={statsParMois}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="cloture" 
                        stroke={COULEURS.success} 
                        strokeWidth={2}
                        name="Clôturés"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="refuse" 
                        stroke={COULEURS.danger} 
                        strokeWidth={2}
                        name="Refusés"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Aucune donnée disponible" />
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'delais' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Délai moyen global"
                value={`${statsGlobales.delai_moyen_traitement} jours`}
                icon={FaClock}
                color={COULEURS.indigo}
              />
              <StatCard
                title="Sinistres en attente"
                value={statsGlobales.sinistres_actifs}
                icon={FaSpinner}
                color={COULEURS.warning}
              />
              <StatCard
                title="Taux de résolution"
                value={`${statsGlobales.taux_resolution}%`}
                icon={FaCheckCircle}
                color={COULEURS.success}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Délais par dossier</h3>
                {delaisTraitement.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={delaisTraitement.slice(0, 20)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis type="category" dataKey="dossier" fontSize={11} width={120} />
                      <Tooltip />
                      <Bar dataKey="jours" fill={COULEURS.primary} radius={[0, 4, 4, 0]} name="Jours">
                        {delaisTraitement.slice(0, 20).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.jours > 30 ? COULEURS.danger : entry.jours > 15 ? COULEURS.warning : COULEURS.success} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Aucune donnée disponible" />
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Distribution des délais</h3>
                {delaisTraitement.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '< 7 jours', value: delaisTraitement.filter(d => d.jours <= 7).length, color: COULEURS.success },
                          { name: '7-15 jours', value: delaisTraitement.filter(d => d.jours > 7 && d.jours <= 15).length, color: COULEURS.primary },
                          { name: '15-30 jours', value: delaisTraitement.filter(d => d.jours > 15 && d.jours <= 30).length, color: COULEURS.warning },
                          { name: '> 30 jours', value: delaisTraitement.filter(d => d.jours > 30).length, color: COULEURS.danger },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {[COULEURS.success, COULEURS.primary, COULEURS.warning, COULEURS.danger].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Aucune donnée disponible" />
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'experts' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Performance des experts</h3>
              {statsExperts.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statsExperts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nom" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="expertises_total" fill={COULEURS.primary} name="Total expertises" />
                    <Bar dataKey="expertises_en_cours" fill={COULEURS.warning} name="En cours" />
                    <Bar dataKey="expertises_terminees" fill={COULEURS.success} name="Terminées" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Aucun expert trouvé" />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expert</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">En cours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terminées</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charge</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statsExperts.map(expert => (
                    <tr key={expert.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <FaUserCheck className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{expert.nom}</p>
                            <p className="text-xs text-gray-500">{expert.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expert.expertises_total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {expert.expertises_en_cours}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expert.expertises_terminees}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-600"
                            style={{ 
                              width: `${expert.expertises_total > 0 
                                ? Math.min((expert.expertises_en_cours / expert.expertises_total) * 100, 100) 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}