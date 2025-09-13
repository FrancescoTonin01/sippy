import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useObjectives } from '../hooks/useObjectives'
import { useUserStats } from '../hooks/useUserStats'
import { useTheme } from '../context/ThemeContext'

export const Profile = () => {
  const { user, signOut } = useAuth()
  const { objective, setWeeklyBudget, loading } = useObjectives()
  const { stats, loading: statsLoading, error: statsError } = useUserStats()
  const { theme, toggleTheme } = useTheme()
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

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Profilo
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {user?.user_metadata?.username || 'Utente'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Budget Settimanale
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Budget attuale:</span>
                <span className="font-medium text-teal-600 dark:text-teal-400">
                  €{objective?.weekly_budget?.toFixed(2) || '0.00'}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nuovo budget (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Le Tue Statistiche
          </h3>
          
          {statsError ? (
            <div className="text-red-500 dark:text-red-400 text-sm mb-4">
              Errore nel caricamento delle statistiche: {statsError}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm text-gray-600 mb-1">Spesa Totale</div>
                <div className="text-lg font-bold text-teal-700">
                  €{stats?.totalSpent.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm text-gray-600 mb-1">Media Settimanale</div>
                <div className="text-lg font-bold text-orange-700">
                  €{stats?.averageWeeklyCost.toFixed(2) || '0.00'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="text-2xl mb-2">🍹</div>
                <div className="text-sm text-gray-600 mb-1">Drink Preferito</div>
                <div className="text-sm font-bold text-purple-700 leading-tight">
                  {stats?.favoriteDrink || 'N/A'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="text-2xl mb-2">📍</div>
                <div className="text-sm text-gray-600 mb-1">Luogo Preferito</div>
                <div className="text-sm font-bold text-blue-700 leading-tight">
                  {stats?.mostFrequentLocation || 'N/A'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-sm text-gray-600 mb-1">Giorno Top</div>
                <div className="text-sm font-bold text-green-700 leading-tight">
                  {stats?.peakDrinkingDay || 'N/A'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
                <div className="text-2xl mb-2">🔢</div>
                <div className="text-sm text-gray-600 mb-1">Drink Totali</div>
                <div className="text-lg font-bold text-indigo-700">
                  {stats?.totalDrinks || 0}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Impostazioni
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Tema</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {theme === 'dark' ? 'Scuro' : 'Chiaro'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Cambia
              </button>
            </div>
            
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