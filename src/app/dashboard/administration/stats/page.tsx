// // app/dashboard/administration/statistiques/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { supabase } from '@/lib/supabase';
// import {
//   FaUsers,
//   FaUserMd,
//   FaFlask,
//   FaPills,
//   FaCalendarCheck,
//   FaExclamationTriangle,
//   FaChartBar,
//   FaChartLine,
//   FaChartPie,
//   FaTrophy,
//   FaMedal,
//   FaStar,
//   FaCalendarAlt,
//   FaClock,
//   FaVenusMars,
//   FaClipboardList,
//   FaStethoscope,
//   FaCheckCircle,
//   FaTimes,
//   FaDownload,
//   FaFilter,
//   FaUser,
// } from 'react-icons/fa';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
// } from 'recharts';

// // Types
// type StatistiquesGenerales = {
//   totalPatients: number;
//   patientsParStatut: { statut: string; count: number }[];
//   patientsParMotif: { motif: string; count: number }[];
//   patientsParSexe: { sexe: string; count: number }[];
//   patientsParTrancheAge: { tranche: string; count: number }[];
//   patientsParJour: { date: string; count: number }[];
//   topMedecins: { id: string; nom: string; matricule: string; count: number }[];
//   topAccueils: { id: string; nom: string; matricule: string; count: number }[];
//   topLaboratoires: { id: string; nom: string; matricule: string; count: number }[];
//   topPharmacies: { id: string; nom: string; matricule: string; count: number }[];
//   tempsMoyenConsultation: number;
//   dureeMoyenneParcours: number;
// };

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// const STATUT_COLORS: { [key: string]: string } = {
//   'accueil': '#3B82F6',
//   'consultation': '#8B5CF6',
//   'laboratoire': '#14B8A6',
//   'pharmacie': '#10B981',
//   'termine': '#059669',
// };

// const MOTIF_COLORS: { [key: string]: string } = {
//   'consultation': '#F97316',
//   'rendez-vous': '#3B82F6',
// };

// const SEXE_COLORS: { [key: string]: string } = {
//   'M': '#3B82F6',
//   'F': '#EC4899',
// };

// const TRANCHE_COLORS = ['#8B5CF6', '#3B82F6', '#14B8A6', '#F97316', '#EC4899'];

// export default function StatistiquesPage() {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [stats, setStats] = useState<StatistiquesGenerales | null>(null);
  
//   // Filtres
//   const [dateDebut, setDateDebut] = useState(() => {
//     const date = new Date();
//     date.setDate(date.getDate() - 30);
//     return date.toISOString().split('T')[0];
//   });
//   const [dateFin, setDateFin] = useState(() => {
//     const date = new Date();
//     return date.toISOString().split('T')[0];
//   });
//   const [periode, setPeriode] = useState('30jours');

//   // État pour les tops
//   const [topLimit, setTopLimit] = useState(5);

//   useEffect(() => {
//     if (user?.role === 'administration') {
//       chargerStatistiques();
//     }
//   }, [user, dateDebut, dateFin]);

//   const handlePeriodeChange = (periode: string) => {
//     setPeriode(periode);
//     const dateFin = new Date();
//     let dateDebut = new Date();

//     switch (periode) {
//       case '7jours':
//         dateDebut.setDate(dateDebut.getDate() - 7);
//         break;
//       case '30jours':
//         dateDebut.setDate(dateDebut.getDate() - 30);
//         break;
//       case '90jours':
//         dateDebut.setDate(dateDebut.getDate() - 90);
//         break;
//       case '365jours':
//         dateDebut.setDate(dateDebut.getDate() - 365);
//         break;
//       default:
//         return;
//     }

//     setDateDebut(dateDebut.toISOString().split('T')[0]);
//     setDateFin(dateFin.toISOString().split('T')[0]);
//   };

//   const chargerStatistiques = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Charger tous les patients dans la période
//       const { data: patients, error: patientsError } = await supabase
//         .from('patients')
//         .select(`
//           *,
//           medecin:envoye_a(id, username, matricule),
//           agent:cree_par(id, username, matricule)
//         `)
//         .gte('created_at', `${dateDebut}T00:00:00`)
//         .lte('created_at', `${dateFin}T23:59:59`)
//         .order('created_at', { ascending: true });

//       if (patientsError) throw patientsError;

//       if (!patients || patients.length === 0) {
//         setStats({
//           totalPatients: 0,
//           patientsParStatut: [],
//           patientsParMotif: [],
//           patientsParSexe: [],
//           patientsParTrancheAge: [],
//           patientsParJour: [],
//           topMedecins: [],
//           topAccueils: [],
//           topLaboratoires: [],
//           topPharmacies: [],
//           tempsMoyenConsultation: 0,
//           dureeMoyenneParcours: 0,
//         });
//         setLoading(false);
//         return;
//       }

//       // Calculer les statistiques
//       const totalPatients = patients.length;

//       // Patients par statut
//       const statutsMap = new Map<string, number>();
//       patients.forEach(p => {
//         statutsMap.set(p.statut, (statutsMap.get(p.statut) || 0) + 1);
//       });
//       const patientsParStatut = Array.from(statutsMap.entries()).map(([statut, count]) => ({
//         statut,
//         count
//       }));

//       // Patients par motif
//       const motifsMap = new Map<string, number>();
//       patients.forEach(p => {
//         motifsMap.set(p.motif_visite, (motifsMap.get(p.motif_visite) || 0) + 1);
//       });
//       const patientsParMotif = Array.from(motifsMap.entries()).map(([motif, count]) => ({
//         motif,
//         count
//       }));

//       // Patients par sexe
//       const sexesMap = new Map<string, number>();
//       patients.forEach(p => {
//         sexesMap.set(p.sexe, (sexesMap.get(p.sexe) || 0) + 1);
//       });
//       const patientsParSexe = Array.from(sexesMap.entries()).map(([sexe, count]) => ({
//         sexe,
//         count
//       }));

//       // Patients par tranche d'âge (données réelles)
//       const tranchesAge = [
//         { min: 0, max: 12, tranche: '0-12 ans' },
//         { min: 13, max: 18, tranche: '13-18 ans' },
//         { min: 19, max: 35, tranche: '19-35 ans' },
//         { min: 36, max: 50, tranche: '36-50 ans' },
//         { min: 51, max: 65, tranche: '51-65 ans' },
//         { min: 66, max: 200, tranche: '65+ ans' },
//       ];

//       const patientsParTrancheAge = tranchesAge.map(tranche => ({
//         tranche: tranche.tranche,
//         count: patients.filter(p => p.age >= tranche.min && p.age <= tranche.max).length
//       })).filter(t => t.count > 0);

//       // Patients par jour
//       const joursMap = new Map<string, number>();
//       patients.forEach(p => {
//         const date = new Date(p.created_at).toISOString().split('T')[0];
//         joursMap.set(date, (joursMap.get(date) || 0) + 1);
//       });
//       const patientsParJour = Array.from(joursMap.entries())
//         .map(([date, count]) => ({ date, count }))
//         .sort((a, b) => a.date.localeCompare(b.date));

//       // Top médecins
//       const medecinsMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
//       patients.forEach(p => {
//         if (p.medecin) {
//           const med = p.medecin as any;
//           const existing = medecinsMap.get(med.id);
//           if (existing) {
//             existing.count++;
//           } else {
//             medecinsMap.set(med.id, {
//               id: med.id,
//               nom: med.username,
//               matricule: med.matricule,
//               count: 1
//             });
//           }
//         }
//       });
//       const topMedecins = Array.from(medecinsMap.values())
//         .sort((a, b) => b.count - a.count)
//         .slice(0, topLimit);

//       // Top agents d'accueil
//       const accueilsMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
//       patients.forEach(p => {
//         if (p.agent) {
//           const agent = p.agent as any;
//           const existing = accueilsMap.get(agent.id);
//           if (existing) {
//             existing.count++;
//           } else {
//             accueilsMap.set(agent.id, {
//               id: agent.id,
//               nom: agent.username,
//               matricule: agent.matricule,
//               count: 1
//             });
//           }
//         }
//       });
//       const topAccueils = Array.from(accueilsMap.values())
//         .sort((a, b) => b.count - a.count)
//         .slice(0, topLimit);

//       // Top laboratoires
//       const patientIds = patients.map(p => p.id);
//       const { data: laboratoires, error: laboError } = await supabase
//         .from('laboratoires')
//         .select('*')
//         .in('patient_id', patientIds);

//       if (laboError) throw laboError;

//       const laboMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
//       if (laboratoires) {
//         for (const labo of laboratoires) {
//           if (labo.cree_par) {
//             const { data: userData } = await supabase
//               .from('users')
//               .select('id, username, matricule')
//               .eq('id', labo.cree_par)
//               .single();

//             if (userData) {
//               const existing = laboMap.get(userData.id);
//               if (existing) {
//                 existing.count++;
//               } else {
//                 laboMap.set(userData.id, {
//                   id: userData.id,
//                   nom: userData.username,
//                   matricule: userData.matricule,
//                   count: 1
//                 });
//               }
//             }
//           }
//         }
//       }
//       const topLaboratoires = Array.from(laboMap.values())
//         .sort((a, b) => b.count - a.count)
//         .slice(0, topLimit);

//       // Top pharmacies
//       const { data: pharmacies, error: pharmaError } = await supabase
//         .from('pharmacies')
//         .select('*')
//         .in('patient_id', patientIds);

//       if (pharmaError) throw pharmaError;

//       const pharmaMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
//       if (pharmacies) {
//         for (const pharma of pharmacies) {
//           if (pharma.cree_par) {
//             const { data: userData } = await supabase
//               .from('users')
//               .select('id, username, matricule')
//               .eq('id', pharma.cree_par)
//               .single();

//             if (userData) {
//               const existing = pharmaMap.get(userData.id);
//               if (existing) {
//                 existing.count++;
//               } else {
//                 pharmaMap.set(userData.id, {
//                   id: userData.id,
//                   nom: userData.username,
//                   matricule: userData.matricule,
//                   count: 1
//                 });
//               }
//             }
//           }
//         }
//       }
//       const topPharmacies = Array.from(pharmaMap.values())
//         .sort((a, b) => b.count - a.count)
//         .slice(0, topLimit);

//       // Temps moyen de parcours
//       const patientsTermines = patients.filter(p => p.statut === 'termine');
//       let tempsMoyenConsultation = 0;
//       let dureeMoyenneParcours = 0;

//       if (patientsTermines.length > 0) {
//         const durees = patientsTermines.map(p => {
//           const debut = new Date(p.created_at).getTime();
//           const fin = new Date(p.updated_at).getTime();
//           return (fin - debut) / (1000 * 60);
//         });
//         dureeMoyenneParcours = Math.round(durees.reduce((a, b) => a + b, 0) / durees.length);
//       }

//       // Taux de consultation
//       const { data: consultations } = await supabase
//         .from('consultations')
//         .select('*')
//         .in('patient_id', patientIds);

//       if (consultations && consultations.length > 0) {
//         tempsMoyenConsultation = Math.round((consultations.length / patients.length) * 100);
//       }

//       setStats({
//         totalPatients,
//         patientsParStatut,
//         patientsParMotif,
//         patientsParSexe,
//         patientsParTrancheAge,
//         patientsParJour,
//         topMedecins,
//         topAccueils,
//         topLaboratoires,
//         topPharmacies,
//         tempsMoyenConsultation,
//         dureeMoyenneParcours,
//       });

//     } catch (err) {
//       console.error('Erreur chargement statistiques:', err);
//       setError('Erreur lors du chargement des statistiques');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExportCSV = () => {
//     if (!stats) return;

//     let csv = 'Catégorie,Valeur\n';
//     csv += `Total Patients,${stats.totalPatients}\n`;
//     csv += `Temps moyen parcours,${stats.dureeMoyenneParcours} min\n`;
//     csv += '\nPatients par statut\n';
//     stats.patientsParStatut.forEach(s => {
//       csv += `${s.statut},${s.count}\n`;
//     });
//     csv += '\nPatients par jour\n';
//     stats.patientsParJour.forEach(j => {
//       csv += `${j.date},${j.count}\n`;
//     });
//     csv += '\nPatients par tranche d\'âge\n';
//     stats.patientsParTrancheAge.forEach(t => {
//       csv += `${t.tranche},${t.count}\n`;
//     });
//     csv += '\nTop médecins\n';
//     stats.topMedecins.forEach(m => {
//       csv += `${m.nom},${m.count}\n`;
//     });

//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `statistiques_${dateDebut}_${dateFin}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // Composant Tooltip personnalisé
//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-4 rounded-lg shadow-lg border border-border">
//           <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
//           {payload.map((entry: any, index: number) => (
//             <p key={index} className="text-sm" style={{ color: entry.color }}>
//               {entry.name}: {entry.value}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   // Fonction pour le label du PieChart avec gestion du undefined
//   const renderPieLabel = ({ name, value, percent }: { name: string; value: number; percent?: number }) => {
//     const percentage = percent !== undefined ? (percent * 100).toFixed(0) : '0';
//     return `${name} (${percentage}%)`;
//   };

//   if (user?.role !== 'administration') {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
//           <FaExclamationTriangle className="mx-auto h-12 w-12 text-warning" />
//           <h3 className="mt-2 text-lg font-medium text-text-dark">Accès non autorisé</h3>
//           <p className="mt-1 text-sm text-gray-500">
//             Cette page est réservée à l'administration.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="text-center py-12">
//           <FaChartBar className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
//           <p className="mt-2 text-gray-500">Chargement des statistiques...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* En-tête */}
//       <div className="sm:flex sm:items-center sm:justify-between mb-8">
//         <div>
//           <h1 className="text-2xl font-semibold text-text-dark flex items-center">
//             <FaChartBar className="mr-3 h-6 w-6 text-primary" />
//             Tableau de bord - Statistiques
//           </h1>
//           <p className="mt-2 text-sm text-gray-500">
//             Analysez les performances et l'activité du centre médical
//           </p>
//         </div>
//         <button
//           onClick={handleExportCSV}
//           className="mt-4 sm:mt-0 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
//         >
//           <FaDownload className="mr-2 h-4 w-4" />
//           Exporter CSV
//         </button>
//       </div>

//       {/* Filtres */}
//       <div className="mb-8 bg-white rounded-lg shadow-sm border border-border p-4">
//         <div className="flex flex-wrap items-center gap-4">
//           <div className="flex items-center space-x-2">
//             <FaFilter className="h-4 w-4 text-gray-400" />
//             <span className="text-sm font-medium text-gray-700">Période:</span>
//           </div>
          
//           <div className="flex rounded-lg border border-border overflow-hidden">
//             {[
//               { value: '7jours', label: '7 jours' },
//               { value: '30jours', label: '30 jours' },
//               { value: '90jours', label: '3 mois' },
//               { value: '365jours', label: '1 an' },
//             ].map((p) => (
//               <button
//                 key={p.value}
//                 onClick={() => handlePeriodeChange(p.value)}
//                 className={`px-3 py-2 text-xs font-medium transition-colors ${
//                   periode === p.value
//                     ? 'bg-primary text-white'
//                     : 'bg-white text-gray-600 hover:bg-gray-50'
//                 } ${p.value !== '7jours' ? 'border-l border-border' : ''}`}
//               >
//                 {p.label}
//               </button>
//             ))}
//             <button
//               onClick={() => setPeriode('custom')}
//               className={`px-3 py-2 text-xs font-medium border-l border-border transition-colors ${
//                 periode === 'custom'
//                   ? 'bg-primary text-white'
//                   : 'bg-white text-gray-600 hover:bg-gray-50'
//               }`}
//             >
//               Personnalisé
//             </button>
//           </div>

//           {periode === 'custom' && (
//             <div className="flex items-center space-x-2">
//               <div className="flex items-center space-x-1">
//                 <FaCalendarAlt className="h-4 w-4 text-gray-400" />
//                 <input
//                   type="date"
//                   value={dateDebut}
//                   onChange={(e) => setDateDebut(e.target.value)}
//                   className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
//                 />
//               </div>
//               <span className="text-gray-400">à</span>
//               <input
//                 type="date"
//                 value={dateFin}
//                 onChange={(e) => setDateFin(e.target.value)}
//                 className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
//               />
//             </div>
//           )}

//           <div className="ml-auto flex items-center space-x-2">
//             <span className="text-sm text-gray-500">Top:</span>
//             <select
//               value={topLimit}
//               onChange={(e) => setTopLimit(parseInt(e.target.value))}
//               className="rounded-lg border border-border px-2 py-1 text-sm"
//             >
//               <option value="3">3</option>
//               <option value="5">5</option>
//               <option value="10">10</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-error">
//           <div className="flex">
//             <FaExclamationTriangle className="h-5 w-5 text-error" />
//             <p className="ml-3 text-sm text-red-700">{error}</p>
//           </div>
//         </div>
//       )}

//       {stats && (
//         <>
//           {/* KPIs */}
//           <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
//             <div className="rounded-lg bg-white p-4 shadow-sm border border-primary/20">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 rounded-full p-2 bg-primary/10">
//                   <FaUsers className="h-5 w-5 text-primary" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-xs font-medium text-gray-500">Total patients</p>
//                   <p className="text-xl font-semibold text-text-dark">{stats.totalPatients}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-lg bg-white p-4 shadow-sm border border-purple-100">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 rounded-full p-2 bg-purple-50">
//                   <FaStethoscope className="h-5 w-5 text-purple-600" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-xs font-medium text-gray-500">Taux de consultation</p>
//                   <p className="text-xl font-semibold text-text-dark">{stats.tempsMoyenConsultation}%</p>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-lg bg-white p-4 shadow-sm border border-teal-100">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 rounded-full p-2 bg-teal-50">
//                   <FaClock className="h-5 w-5 text-teal-600" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-xs font-medium text-gray-500">Temps moyen parcours</p>
//                   <p className="text-xl font-semibold text-text-dark">{stats.dureeMoyenneParcours} min</p>
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-lg bg-white p-4 shadow-sm border border-green-100">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0 rounded-full p-2 bg-green-50">
//                   <FaCheckCircle className="h-5 w-5 text-green-600" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-xs font-medium text-gray-500">Taux de complétion</p>
//                   <p className="text-xl font-semibold text-text-dark">
//                     {stats.totalPatients > 0 
//                       ? Math.round((stats.patientsParStatut.find(s => s.statut === 'termine')?.count || 0) / stats.totalPatients * 100)
//                       : 0}%
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             {/* Courbe d'évolution des patients par jour */}
//             <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//               <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                 <FaChartLine className="mr-2 h-5 w-5 text-primary" />
//                 Évolution des patients
//               </h3>
//               {stats.patientsParJour.length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <AreaChart data={stats.patientsParJour}>
//                     <defs>
//                       <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
//                         <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis 
//                       dataKey="date" 
//                       tickFormatter={(value) => {
//                         const date = new Date(value);
//                         return `${date.getDate()}/${date.getMonth() + 1}`;
//                       }}
//                       tick={{ fontSize: 12 }}
//                     />
//                     <YAxis tick={{ fontSize: 12 }} />
//                     <Tooltip content={<CustomTooltip />} />
//                     <Area 
//                       type="monotone" 
//                       dataKey="count" 
//                       stroke="#3B82F6" 
//                       fillOpacity={1} 
//                       fill="url(#colorPatients)" 
//                       name="Patients"
//                     />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               )}
//             </div>

//             {/* Répartition par statut */}
//             <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//               <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                 <FaChartPie className="mr-2 h-5 w-5 text-primary" />
//                 Répartition par statut
//               </h3>
//               {stats.patientsParStatut.length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={stats.patientsParStatut}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={renderPieLabel}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="count"
//                       nameKey="statut"
//                     >
//                       {stats.patientsParStatut.map((entry, index) => (
//                         <Cell 
//                           key={`cell-${index}`} 
//                           fill={STATUT_COLORS[entry.statut] || COLORS[index % COLORS.length]} 
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               )}
//             </div>

//             {/* Répartition par motif */}
//             <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//               <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                 <FaClipboardList className="mr-2 h-5 w-5 text-primary" />
//                 Répartition par motif de visite
//               </h3>
//               {stats.patientsParMotif.length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={stats.patientsParMotif}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={renderPieLabel}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="count"
//                       nameKey="motif"
//                     >
//                       {stats.patientsParMotif.map((entry, index) => (
//                         <Cell 
//                           key={`cell-${index}`} 
//                           fill={MOTIF_COLORS[entry.motif] || COLORS[index % COLORS.length]} 
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               )}
//             </div>

//             {/* Répartition par sexe */}
//             <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//               <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                 <FaVenusMars className="mr-2 h-5 w-5 text-primary" />
//                 Répartition par sexe
//               </h3>
//               {stats.patientsParSexe.length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={stats.patientsParSexe}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={renderPieLabel}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="count"
//                       nameKey="sexe"
//                     >
//                       {stats.patientsParSexe.map((entry, index) => (
//                         <Cell 
//                           key={`cell-${index}`} 
//                           fill={SEXE_COLORS[entry.sexe] || COLORS[index % COLORS.length]} 
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               )}
//             </div>

//             {/* Patients par statut - Barres */}
//             <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//               <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                 <FaChartBar className="mr-2 h-5 w-5 text-primary" />
//                 Patients par statut
//               </h3>
//               {stats.patientsParStatut.length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={stats.patientsParStatut}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="statut" tick={{ fontSize: 12 }} />
//                     <YAxis tick={{ fontSize: 12 }} />
//                     <Tooltip content={<CustomTooltip />} />
//                     <Bar dataKey="count" name="Nombre" radius={[8, 8, 0, 0]}>
//                       {stats.patientsParStatut.map((entry, index) => (
//                         <Cell 
//                           key={`cell-${index}`} 
//                           fill={STATUT_COLORS[entry.statut] || COLORS[index % COLORS.length]} 
//                         />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>

//             {/* Distribution par âge - Données réelles */}
//             <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//               <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                 <FaUsers className="mr-2 h-5 w-5 text-primary" />
//                 Distribution par âge
//               </h3>
//               {stats.patientsParTrancheAge.length === 0 ? (
//                 <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={stats.patientsParTrancheAge}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="tranche" tick={{ fontSize: 12 }} />
//                     <YAxis tick={{ fontSize: 12 }} />
//                     <Tooltip content={<CustomTooltip />} />
//                     <Bar dataKey="count" name="Patients" radius={[8, 8, 0, 0]}>
//                       {stats.patientsParTrancheAge.map((entry, index) => (
//                         <Cell 
//                           key={`cell-${index}`} 
//                           fill={TRANCHE_COLORS[index % TRANCHE_COLORS.length]} 
//                         />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>

//           {/* Classements TOP */}
//           <div className="mb-8">
//             <h2 className="text-xl font-semibold text-text-dark mb-6 flex items-center">
//               <FaTrophy className="mr-2 h-6 w-6 text-yellow-500" />
//               Classements - Top {topLimit}
//             </h2>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Top Médecins */}
//               <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//                 <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                   <FaUserMd className="mr-2 h-5 w-5 text-purple-600" />
//                   Médecins les plus actifs
//                 </h3>
//                 {stats.topMedecins.length === 0 ? (
//                   <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {stats.topMedecins.map((med, index) => (
//                       <div 
//                         key={med.id}
//                         className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
//                             index === 0 ? 'bg-yellow-100 text-yellow-700' :
//                             index === 1 ? 'bg-gray-200 text-gray-600' :
//                             index === 2 ? 'bg-orange-100 text-orange-700' :
//                             'bg-purple-100 text-purple-700'
//                           }`}>
//                             {index === 0 ? <FaTrophy className="h-5 w-5" /> :
//                              index === 1 ? <FaMedal className="h-5 w-5" /> :
//                              index === 2 ? <FaMedal className="h-5 w-5" /> :
//                              <FaStar className="h-4 w-4" />}
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{med.nom}</p>
//                             <p className="text-xs text-gray-500">{med.matricule}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-lg font-semibold text-purple-600">{med.count}</p>
//                           <p className="text-xs text-gray-400">patients</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Top Agents d'accueil */}
//               <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//                 <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                   <FaUser className="mr-2 h-5 w-5 text-blue-600" />
//                   Agents d'accueil les plus actifs
//                 </h3>
//                 {stats.topAccueils.length === 0 ? (
//                   <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {stats.topAccueils.map((agent, index) => (
//                       <div 
//                         key={agent.id}
//                         className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
//                             index === 0 ? 'bg-yellow-100 text-yellow-700' :
//                             index === 1 ? 'bg-gray-200 text-gray-600' :
//                             index === 2 ? 'bg-orange-100 text-orange-700' :
//                             'bg-blue-100 text-blue-700'
//                           }`}>
//                             {index === 0 ? <FaTrophy className="h-5 w-5" /> :
//                              index === 1 ? <FaMedal className="h-5 w-5" /> :
//                              index === 2 ? <FaMedal className="h-5 w-5" /> :
//                              <FaStar className="h-4 w-4" />}
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{agent.nom}</p>
//                             <p className="text-xs text-gray-500">{agent.matricule}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-lg font-semibold text-blue-600">{agent.count}</p>
//                           <p className="text-xs text-gray-400">patients</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Top Laboratoires */}
//               <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//                 <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                   <FaFlask className="mr-2 h-5 w-5 text-teal-600" />
//                   Techniciens de laboratoire les plus actifs
//                 </h3>
//                 {stats.topLaboratoires.length === 0 ? (
//                   <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {stats.topLaboratoires.map((labo, index) => (
//                       <div 
//                         key={labo.id}
//                         className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-teal-50 transition-colors"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
//                             index === 0 ? 'bg-yellow-100 text-yellow-700' :
//                             index === 1 ? 'bg-gray-200 text-gray-600' :
//                             index === 2 ? 'bg-orange-100 text-orange-700' :
//                             'bg-teal-100 text-teal-700'
//                           }`}>
//                             {index === 0 ? <FaTrophy className="h-5 w-5" /> :
//                              index === 1 ? <FaMedal className="h-5 w-5" /> :
//                              index === 2 ? <FaMedal className="h-5 w-5" /> :
//                              <FaStar className="h-4 w-4" />}
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{labo.nom}</p>
//                             <p className="text-xs text-gray-500">{labo.matricule}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-lg font-semibold text-teal-600">{labo.count}</p>
//                           <p className="text-xs text-gray-400">analyses</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Top Pharmacies */}
//               <div className="bg-white rounded-lg shadow-sm border border-border p-6">
//                 <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
//                   <FaPills className="mr-2 h-5 w-5 text-green-600" />
//                   Pharmaciens les plus actifs
//                 </h3>
//                 {stats.topPharmacies.length === 0 ? (
//                   <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {stats.topPharmacies.map((pharma, index) => (
//                       <div 
//                         key={pharma.id}
//                         className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
//                             index === 0 ? 'bg-yellow-100 text-yellow-700' :
//                             index === 1 ? 'bg-gray-200 text-gray-600' :
//                             index === 2 ? 'bg-orange-100 text-orange-700' :
//                             'bg-green-100 text-green-700'
//                           }`}>
//                             {index === 0 ? <FaTrophy className="h-5 w-5" /> :
//                              index === 1 ? <FaMedal className="h-5 w-5" /> :
//                              index === 2 ? <FaMedal className="h-5 w-5" /> :
//                              <FaStar className="h-4 w-4" />}
//                           </div>
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{pharma.nom}</p>
//                             <p className="text-xs text-gray-500">{pharma.matricule}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-lg font-semibold text-green-600">{pharma.count}</p>
//                           <p className="text-xs text-gray-400">délivrances</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// app/dashboard/administration/statistiques/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  FaUsers,
  FaUserMd,
  FaFlask,
  FaPills,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaTrophy,
  FaMedal,
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaVenusMars,
  FaClipboardList,
  FaStethoscope,
  FaCheckCircle,
  FaTimes,
  FaDownload,
  FaFilter,
  FaUser,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// Types
type StatistiquesGenerales = {
  totalPatients: number;
  patientsParStatut: { statut: string; count: number }[];
  patientsParMotif: { motif: string; count: number }[];
  patientsParSexe: { sexe: string; count: number }[];
  patientsParTrancheAge: { tranche: string; count: number }[];
  patientsParJour: { date: string; count: number }[];
  topMedecins: { id: string; nom: string; matricule: string; count: number }[];
  topAccueils: { id: string; nom: string; matricule: string; count: number }[];
  topLaboratoires: { id: string; nom: string; matricule: string; count: number }[];
  topPharmacies: { id: string; nom: string; matricule: string; count: number }[];
  tempsMoyenConsultation: number;
  dureeMoyenneParcours: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const STATUT_COLORS: { [key: string]: string } = {
  'accueil': '#3B82F6',
  'consultation': '#8B5CF6',
  'laboratoire': '#14B8A6',
  'pharmacie': '#10B981',
  'termine': '#059669',
};

const MOTIF_COLORS: { [key: string]: string } = {
  'consultation': '#F97316',
  'rendez-vous': '#3B82F6',
};

const SEXE_COLORS: { [key: string]: string } = {
  'M': '#3B82F6',
  'F': '#EC4899',
};

const TRANCHE_COLORS = ['#8B5CF6', '#3B82F6', '#14B8A6', '#F97316', '#EC4899'];

export default function StatistiquesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatistiquesGenerales | null>(null);
  
  // Filtres
  const [dateDebut, setDateDebut] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [dateFin, setDateFin] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [periode, setPeriode] = useState('30jours');

  // État pour les tops
  const [topLimit, setTopLimit] = useState(5);

  useEffect(() => {
    if (user?.role === 'administration') {
      chargerStatistiques();
    }
  }, [user, dateDebut, dateFin]);

  const handlePeriodeChange = (periode: string) => {
    setPeriode(periode);
    const dateFin = new Date();
    let dateDebut = new Date();

    switch (periode) {
      case '7jours':
        dateDebut.setDate(dateDebut.getDate() - 7);
        break;
      case '30jours':
        dateDebut.setDate(dateDebut.getDate() - 30);
        break;
      case '90jours':
        dateDebut.setDate(dateDebut.getDate() - 90);
        break;
      case '365jours':
        dateDebut.setDate(dateDebut.getDate() - 365);
        break;
      default:
        return;
    }

    setDateDebut(dateDebut.toISOString().split('T')[0]);
    setDateFin(dateFin.toISOString().split('T')[0]);
  };

  const chargerStatistiques = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger tous les patients dans la période
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select(`
          *,
          medecin:envoye_a(id, username, matricule),
          agent:cree_par(id, username, matricule)
        `)
        .gte('created_at', `${dateDebut}T00:00:00`)
        .lte('created_at', `${dateFin}T23:59:59`)
        .order('created_at', { ascending: true });

      if (patientsError) throw patientsError;

      if (!patients || patients.length === 0) {
        setStats({
          totalPatients: 0,
          patientsParStatut: [],
          patientsParMotif: [],
          patientsParSexe: [],
          patientsParTrancheAge: [],
          patientsParJour: [],
          topMedecins: [],
          topAccueils: [],
          topLaboratoires: [],
          topPharmacies: [],
          tempsMoyenConsultation: 0,
          dureeMoyenneParcours: 0,
        });
        setLoading(false);
        return;
      }

      // Calculer les statistiques
      const totalPatients = patients.length;

      // Patients par statut
      const statutsMap = new Map<string, number>();
      patients.forEach(p => {
        statutsMap.set(p.statut, (statutsMap.get(p.statut) || 0) + 1);
      });
      const patientsParStatut = Array.from(statutsMap.entries()).map(([statut, count]) => ({
        statut,
        count
      }));

      // Patients par motif
      const motifsMap = new Map<string, number>();
      patients.forEach(p => {
        motifsMap.set(p.motif_visite, (motifsMap.get(p.motif_visite) || 0) + 1);
      });
      const patientsParMotif = Array.from(motifsMap.entries()).map(([motif, count]) => ({
        motif,
        count
      }));

      // Patients par sexe
      const sexesMap = new Map<string, number>();
      patients.forEach(p => {
        sexesMap.set(p.sexe, (sexesMap.get(p.sexe) || 0) + 1);
      });
      const patientsParSexe = Array.from(sexesMap.entries()).map(([sexe, count]) => ({
        sexe,
        count
      }));

      // Patients par tranche d'âge (données réelles)
      const tranchesAge = [
        { min: 0, max: 12, tranche: '0-12 ans' },
        { min: 13, max: 18, tranche: '13-18 ans' },
        { min: 19, max: 35, tranche: '19-35 ans' },
        { min: 36, max: 50, tranche: '36-50 ans' },
        { min: 51, max: 65, tranche: '51-65 ans' },
        { min: 66, max: 200, tranche: '65+ ans' },
      ];

      const patientsParTrancheAge = tranchesAge.map(tranche => ({
        tranche: tranche.tranche,
        count: patients.filter(p => p.age >= tranche.min && p.age <= tranche.max).length
      })).filter(t => t.count > 0);

      // Patients par jour
      const joursMap = new Map<string, number>();
      patients.forEach(p => {
        const date = new Date(p.created_at).toISOString().split('T')[0];
        joursMap.set(date, (joursMap.get(date) || 0) + 1);
      });
      const patientsParJour = Array.from(joursMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top médecins
      const medecinsMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
      patients.forEach(p => {
        if (p.medecin) {
          const med = p.medecin as any;
          const existing = medecinsMap.get(med.id);
          if (existing) {
            existing.count++;
          } else {
            medecinsMap.set(med.id, {
              id: med.id,
              nom: med.username,
              matricule: med.matricule,
              count: 1
            });
          }
        }
      });
      const topMedecins = Array.from(medecinsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, topLimit);

      // Top agents d'accueil
      const accueilsMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
      patients.forEach(p => {
        if (p.agent) {
          const agent = p.agent as any;
          const existing = accueilsMap.get(agent.id);
          if (existing) {
            existing.count++;
          } else {
            accueilsMap.set(agent.id, {
              id: agent.id,
              nom: agent.username,
              matricule: agent.matricule,
              count: 1
            });
          }
        }
      });
      const topAccueils = Array.from(accueilsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, topLimit);

      // Top laboratoires
      const patientIds = patients.map(p => p.id);
      const { data: laboratoires, error: laboError } = await supabase
        .from('laboratoires')
        .select('*')
        .in('patient_id', patientIds);

      if (laboError) throw laboError;

      const laboMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
      if (laboratoires) {
        for (const labo of laboratoires) {
          if (labo.cree_par) {
            const { data: userData } = await supabase
              .from('users')
              .select('id, username, matricule')
              .eq('id', labo.cree_par)
              .single();

            if (userData) {
              const existing = laboMap.get(userData.id);
              if (existing) {
                existing.count++;
              } else {
                laboMap.set(userData.id, {
                  id: userData.id,
                  nom: userData.username,
                  matricule: userData.matricule,
                  count: 1
                });
              }
            }
          }
        }
      }
      const topLaboratoires = Array.from(laboMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, topLimit);

      // Top pharmacies
      const { data: pharmacies, error: pharmaError } = await supabase
        .from('pharmacies')
        .select('*')
        .in('patient_id', patientIds);

      if (pharmaError) throw pharmaError;

      const pharmaMap = new Map<string, { id: string; nom: string; matricule: string; count: number }>();
      if (pharmacies) {
        for (const pharma of pharmacies) {
          if (pharma.cree_par) {
            const { data: userData } = await supabase
              .from('users')
              .select('id, username, matricule')
              .eq('id', pharma.cree_par)
              .single();

            if (userData) {
              const existing = pharmaMap.get(userData.id);
              if (existing) {
                existing.count++;
              } else {
                pharmaMap.set(userData.id, {
                  id: userData.id,
                  nom: userData.username,
                  matricule: userData.matricule,
                  count: 1
                });
              }
            }
          }
        }
      }
      const topPharmacies = Array.from(pharmaMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, topLimit);

      // Temps moyen de parcours
      const patientsTermines = patients.filter(p => p.statut === 'termine');
      let tempsMoyenConsultation = 0;
      let dureeMoyenneParcours = 0;

      if (patientsTermines.length > 0) {
        const durees = patientsTermines.map(p => {
          const debut = new Date(p.created_at).getTime();
          const fin = new Date(p.updated_at).getTime();
          return (fin - debut) / (1000 * 60);
        });
        dureeMoyenneParcours = Math.round(durees.reduce((a, b) => a + b, 0) / durees.length);
      }

      // Taux de consultation
      const { data: consultations } = await supabase
        .from('consultations')
        .select('*')
        .in('patient_id', patientIds);

      if (consultations && consultations.length > 0) {
        tempsMoyenConsultation = Math.round((consultations.length / patients.length) * 100);
      }

      setStats({
        totalPatients,
        patientsParStatut,
        patientsParMotif,
        patientsParSexe,
        patientsParTrancheAge,
        patientsParJour,
        topMedecins,
        topAccueils,
        topLaboratoires,
        topPharmacies,
        tempsMoyenConsultation,
        dureeMoyenneParcours,
      });

    } catch (err) {
      console.error('Erreur chargement statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;

    let csv = 'Catégorie,Valeur\n';
    csv += `Total Patients,${stats.totalPatients}\n`;
    csv += `Temps moyen parcours,${stats.dureeMoyenneParcours} min\n`;
    csv += '\nPatients par statut\n';
    stats.patientsParStatut.forEach(s => {
      csv += `${s.statut},${s.count}\n`;
    });
    csv += '\nPatients par jour\n';
    stats.patientsParJour.forEach(j => {
      csv += `${j.date},${j.count}\n`;
    });
    csv += '\nPatients par tranche d\'âge\n';
    stats.patientsParTrancheAge.forEach(t => {
      csv += `${t.tranche},${t.count}\n`;
    });
    csv += '\nTop médecins\n';
    stats.topMedecins.forEach(m => {
      csv += `${m.nom},${m.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques_${dateDebut}_${dateFin}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Composant Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-border">
          <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
const renderPieLabel = (props: any) => {
  const { name, percent } = props;
  const displayName = name || '';
  const percentage = percent !== undefined ? (percent * 100).toFixed(0) : '0';
  return `${displayName} (${percentage}%)`;
};
  if (user?.role !== 'administration') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-warning" />
          <h3 className="mt-2 text-lg font-medium text-text-dark">Accès non autorisé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cette page est réservée à l'administration.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaChartBar className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-2 text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark flex items-center">
            <FaChartBar className="mr-3 h-6 w-6 text-primary" />
            Tableau de bord - Statistiques
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Analysez les performances et l'activité du centre médical
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="mt-4 sm:mt-0 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
        >
          <FaDownload className="mr-2 h-4 w-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Période:</span>
          </div>
          
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { value: '7jours', label: '7 jours' },
              { value: '30jours', label: '30 jours' },
              { value: '90jours', label: '3 mois' },
              { value: '365jours', label: '1 an' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodeChange(p.value)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  periode === p.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                } ${p.value !== '7jours' ? 'border-l border-border' : ''}`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setPeriode('custom')}
              className={`px-3 py-2 text-xs font-medium border-l border-border transition-colors ${
                periode === 'custom'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Personnalisé
            </button>
          </div>

          {periode === 'custom' && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <span className="text-gray-400">à</span>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          )}

          <div className="ml-auto flex items-center space-x-2">
            <span className="text-sm text-gray-500">Top:</span>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(parseInt(e.target.value))}
              className="rounded-lg border border-border px-2 py-1 text-sm"
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-error">
          <div className="flex">
            <FaExclamationTriangle className="h-5 w-5 text-error" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* KPIs */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow-sm border border-primary/20">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full p-2 bg-primary/10">
                  <FaUsers className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total patients</p>
                  <p className="text-xl font-semibold text-text-dark">{stats.totalPatients}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm border border-purple-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full p-2 bg-purple-50">
                  <FaStethoscope className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Taux de consultation</p>
                  <p className="text-xl font-semibold text-text-dark">{stats.tempsMoyenConsultation}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm border border-teal-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full p-2 bg-teal-50">
                  <FaClock className="h-5 w-5 text-teal-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Temps moyen parcours</p>
                  <p className="text-xl font-semibold text-text-dark">{stats.dureeMoyenneParcours} min</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm border border-green-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full p-2 bg-green-50">
                  <FaCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Taux de complétion</p>
                  <p className="text-xl font-semibold text-text-dark">
                    {stats.totalPatients > 0 
                      ? Math.round((stats.patientsParStatut.find(s => s.statut === 'termine')?.count || 0) / stats.totalPatients * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Courbe d'évolution des patients par jour */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                <FaChartLine className="mr-2 h-5 w-5 text-primary" />
                Évolution des patients
              </h3>
              {stats.patientsParJour.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.patientsParJour}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorPatients)" 
                      name="Patients"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Répartition par statut */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                <FaChartPie className="mr-2 h-5 w-5 text-primary" />
                Répartition par statut
              </h3>
              {stats.patientsParStatut.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.patientsParStatut}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="statut"
                    >
                      {stats.patientsParStatut.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUT_COLORS[entry.statut] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Répartition par motif */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                <FaClipboardList className="mr-2 h-5 w-5 text-primary" />
                Répartition par motif de visite
              </h3>
              {stats.patientsParMotif.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.patientsParMotif}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="motif"
                    >
                      {stats.patientsParMotif.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={MOTIF_COLORS[entry.motif] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Répartition par sexe */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                <FaVenusMars className="mr-2 h-5 w-5 text-primary" />
                Répartition par sexe
              </h3>
              {stats.patientsParSexe.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.patientsParSexe}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="sexe"
                    >
                      {stats.patientsParSexe.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SEXE_COLORS[entry.sexe] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Patients par statut - Barres */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                <FaChartBar className="mr-2 h-5 w-5 text-primary" />
                Patients par statut
              </h3>
              {stats.patientsParStatut.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.patientsParStatut}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="statut" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Nombre" radius={[8, 8, 0, 0]}>
                      {stats.patientsParStatut.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUT_COLORS[entry.statut] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribution par âge - Données réelles */}
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                <FaUsers className="mr-2 h-5 w-5 text-primary" />
                Distribution par âge
              </h3>
              {stats.patientsParTrancheAge.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.patientsParTrancheAge}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tranche" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Patients" radius={[8, 8, 0, 0]}>
                      {stats.patientsParTrancheAge.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={TRANCHE_COLORS[index % TRANCHE_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Classements TOP */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-dark mb-6 flex items-center">
              <FaTrophy className="mr-2 h-6 w-6 text-yellow-500" />
              Classements - Top {topLimit}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Médecins */}
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                  <FaUserMd className="mr-2 h-5 w-5 text-purple-600" />
                  Médecins les plus actifs
                </h3>
                {stats.topMedecins.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topMedecins.map((med, index) => (
                      <div 
                        key={med.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {index === 0 ? <FaTrophy className="h-5 w-5" /> :
                             index === 1 ? <FaMedal className="h-5 w-5" /> :
                             index === 2 ? <FaMedal className="h-5 w-5" /> :
                             <FaStar className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{med.nom}</p>
                            <p className="text-xs text-gray-500">{med.matricule}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-purple-600">{med.count}</p>
                          <p className="text-xs text-gray-400">patients</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Agents d'accueil */}
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                  <FaUser className="mr-2 h-5 w-5 text-blue-600" />
                  Agents d'accueil les plus actifs
                </h3>
                {stats.topAccueils.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topAccueils.map((agent, index) => (
                      <div 
                        key={agent.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {index === 0 ? <FaTrophy className="h-5 w-5" /> :
                             index === 1 ? <FaMedal className="h-5 w-5" /> :
                             index === 2 ? <FaMedal className="h-5 w-5" /> :
                             <FaStar className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{agent.nom}</p>
                            <p className="text-xs text-gray-500">{agent.matricule}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">{agent.count}</p>
                          <p className="text-xs text-gray-400">patients</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Laboratoires */}
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                  <FaFlask className="mr-2 h-5 w-5 text-teal-600" />
                  Techniciens de laboratoire les plus actifs
                </h3>
                {stats.topLaboratoires.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topLaboratoires.map((labo, index) => (
                      <div 
                        key={labo.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-teal-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-teal-100 text-teal-700'
                          }`}>
                            {index === 0 ? <FaTrophy className="h-5 w-5" /> :
                             index === 1 ? <FaMedal className="h-5 w-5" /> :
                             index === 2 ? <FaMedal className="h-5 w-5" /> :
                             <FaStar className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{labo.nom}</p>
                            <p className="text-xs text-gray-500">{labo.matricule}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-teal-600">{labo.count}</p>
                          <p className="text-xs text-gray-400">analyses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Pharmacies */}
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
                  <FaPills className="mr-2 h-5 w-5 text-green-600" />
                  Pharmaciens les plus actifs
                </h3>
                {stats.topPharmacies.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucune donnée disponible</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topPharmacies.map((pharma, index) => (
                      <div 
                        key={pharma.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-200 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {index === 0 ? <FaTrophy className="h-5 w-5" /> :
                             index === 1 ? <FaMedal className="h-5 w-5" /> :
                             index === 2 ? <FaMedal className="h-5 w-5" /> :
                             <FaStar className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pharma.nom}</p>
                            <p className="text-xs text-gray-500">{pharma.matricule}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">{pharma.count}</p>
                          <p className="text-xs text-gray-400">délivrances</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}