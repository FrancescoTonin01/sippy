import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useObjectives } from '../hooks/useObjectives'

export const Profile = () => {
  const { user, signOut } = useAuth()
  const { objective, setWeeklyBudget, loading } = useObjectives()
  const [budgetInput, setBudgetInput] = useState(
    objective?.weekly_budget?.toString() || ''
  )
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSaveBudget = async () => {
    const budget = parseFloat(budgetInput)
    if (isNaN(budget) || budget < 0) {
      alert('Inserisci un budget valido')
      return
    }

    setSaving(true)
    const result = await setWeeklyBudget(budget)
    setSaving(false)

    if (result.success) {
      setIsEditing(false)
    } else {
      alert(result.error || 'Errore nel salvataggio')
    }
  }

  const handleSignOut = async () => {
    if (confirm('Sei sicuro di voler uscire?')) {
      await signOut()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Profilo
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {user?.user_metadata?.username || 'Utente'}
              </h2>
              <p className="text-sm text-gray-600">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Budget Settimanale
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Budget attuale:</span>
                <span className="font-medium text-teal-600">
                  €{objective?.weekly_budget?.toFixed(2) || '0.00'}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nuovo budget (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="es. 50.00"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBudget}
                      disabled={saving}
                      className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Salvataggio...' : 'Salva'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setBudgetInput(objective?.weekly_budget?.toString() || '')
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Modifica Budget
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Impostazioni
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              Esci dall'Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}