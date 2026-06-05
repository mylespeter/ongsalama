'use client'

import { useState, useEffect } from 'react'
import { Departement, Faculte } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export default function AdminDepartements() {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ nom: '', code: '', faculte_id: 0 })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: depData, error: depError } = await supabase
        .from('departements')
        .select('*, faculte:facultes(id, nom, code)')
        .order('nom')

      if (depError) throw depError

      const { data: facData, error: facError } = await supabase
        .from('facultes')
        .select('*')
        .order('nom')

      if (facError) throw facError

      setDepartements(depData || [])
      setFacultes(facData || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nom || !formData.code || !formData.faculte_id) {
      alert('Veuillez remplir tous les champs')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('departements')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('departements')
          .insert([formData])

        if (error) throw error
      }

      setFormData({ nom: '', code: '', faculte_id: 0 })
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (dep: Departement) => {
    setFormData({ nom: dep.nom, code: dep.code, faculte_id: dep.faculte_id })
    setEditingId(dep.id)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return

    try {
      const { error } = await supabase
        .from('departements')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
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
          {editingId ? 'Modifier le département' : 'Ajouter un département'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Faculté</label>
            <select
              value={formData.faculte_id}
              onChange={(e) => setFormData(prev => ({ ...prev, faculte_id: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value={0}>-- Choisir une faculté --</option>
              {facultes.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ nom: '', code: '', faculte_id: 0 })
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
        <h3 className="text-lg font-medium mb-4">Liste des départements</h3>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculté</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departements.map((dep) => (
                <tr key={dep.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dep.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dep.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dep.faculte?.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(dep)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(dep.id)}
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
