// components/admin/AdminAnnees.tsx
'use client'

import { useState, useEffect } from 'react'
import { AnneeAcademique } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export default function AdminAnnees() {
  const [annees, setAnnees] = useState<AnneeAcademique[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ annee: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchAnnees()
  }, [])

  const fetchAnnees = async () => {
    try {
      const { data, error } = await supabase
        .from('annees_academiques')
        .select('*')
        .order('annee', { ascending: false })

      if (error) throw error
      setAnnees(data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.annee) {
      alert('Veuillez remplir le champ année')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('annees_academiques')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('annees_academiques')
          .insert([formData])

        if (error) throw error
      }

      setFormData({ annee: '' })
      setEditingId(null)
      fetchAnnees()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (annee: AnneeAcademique) => {
    setFormData({ annee: annee.annee })
    setEditingId(annee.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette année ?')) return

    try {
      const { error } = await supabase
        .from('annees_academiques')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAnnees()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          {editingId ? 'Modifier l\'année' : 'Ajouter une année académique'}
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Année académique</label>
          <input
            type="text"
            placeholder="2023-2024"
            value={formData.annee}
            onChange={(e) => setFormData({ annee: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ annee: '' })
                setEditingId(null)
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-lg font-medium mb-4">Liste des années académiques</h3>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Année</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {annees.map((annee) => (
                <tr key={annee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{annee.annee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(annee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(annee.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}