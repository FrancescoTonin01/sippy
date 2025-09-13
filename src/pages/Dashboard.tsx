import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useDrinks } from '../hooks/useDrinks'
import { useObjectives } from '../hooks/useObjectives'
import { DrinkForm } from '../components/DrinkForm'
import { ProgressBar } from '../components/ProgressBar'
import { WeeklyChart } from '../components/WeeklyChart'
import type { CreateDrinkData } from '../api/drinks'

export const Dashboard = () => {
  const { user } = useAuth()
  const { weeklyDrinks, addDrink, removeDrink, loading: drinksLoading } = useDrinks()
  const { objective, loading: objectiveLoading } = useObjectives()
  const [showForm, setShowForm] = useState(false)

  const handleAddDrink = async (drinkData: CreateDrinkData) => {
    const result = await addDrink(drinkData)
    if (result.success) {
      setShowForm(false)
    }
  }

  const handleDeleteDrink = async (drinkId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo drink?')) {
      await removeDrink(drinkId)
    }
  }

  const weeklySpent = weeklyDrinks.reduce((sum, drink) => sum + drink.cost, 0)
  const weeklyBudget = objective?.weekly_budget || 0
  const budgetRemaining = Math.max(0, weeklyBudget - weeklySpent)
  const progress = weeklyBudget > 0 ? (budgetRemaining / weeklyBudget) * 100 : 100
  const loading = drinksLoading || objectiveLoading

  if (loading) {
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
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🍻</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              Hey {user?.user_metadata?.username || 'Sippy'}! 
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Come va il tuo consumo responsabile oggi? 🎯
            </p>
          </div>
          
          <div className="mb-6">
            <div className="bg-gradient-to-br from-teal-50 to-orange-50 dark:from-teal-900/30 dark:to-orange-900/30 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span>📅</span>
                  Settimana corrente
                </span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  €{budgetRemaining.toFixed(2)} disponibili
                </span>
              </div>
              <ProgressBar progress={progress} />
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                <span>💸 Speso: €{weeklySpent.toFixed(2)}</span>
                <span>🎯 Budget: €{weeklyBudget.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🍺</span>
            <span>Traccia un drink</span>
            <span className="text-lg">✨</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <WeeklyChart weeklyDrinks={weeklyDrinks} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              I tuoi drink della settimana
            </h2>
          </div>
          
          {weeklyDrinks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                Settimana pulita! 
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Nessun drink registrato ancora. Keep it up! 💪
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {weeklyDrinks.map((drink) => (
                <div
                  key={drink.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">{drink.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {drink.location} • {new Date(drink.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                      €{drink.cost.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteDrink(drink.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-colors"
                      title="Elimina drink"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {showForm && (
        <DrinkForm
          onSubmit={handleAddDrink}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}