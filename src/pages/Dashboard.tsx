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
  const { weeklyDrinks, addDrink, loading: drinksLoading } = useDrinks()
  const { objective, loading: objectiveLoading } = useObjectives()
  const [showForm, setShowForm] = useState(false)

  const handleAddDrink = async (drinkData: CreateDrinkData) => {
    const result = await addDrink(drinkData)
    if (result.success) {
      setShowForm(false)
    }
  }

  const weeklySpent = weeklyDrinks.reduce((sum, drink) => sum + drink.cost, 0)
  const weeklyBudget = objective?.weekly_budget || 0
  const budgetRemaining = Math.max(0, weeklyBudget - weeklySpent)
  const progress = weeklyBudget > 0 ? (budgetRemaining / weeklyBudget) * 100 : 100
  const loading = drinksLoading || objectiveLoading

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
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Ciao, {user?.user_metadata?.username || 'Utente'}! 👋
          </h1>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Questa settimana
              </span>
              <span className="text-sm text-gray-600">
                €{budgetRemaining.toFixed(2)} rimasti
              </span>
            </div>
            <ProgressBar progress={progress} />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            Aggiungi Drink
          </button>
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
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Storico settimanale
          </h2>
          
          {weeklyDrinks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessun drink registrato questa settimana
            </p>
          ) : (
            <div className="space-y-3">
              {weeklyDrinks.map((drink) => (
                <div
                  key={drink.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{drink.type}</p>
                    <p className="text-sm text-gray-600">
                      {drink.location} • {new Date(drink.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-teal-600">
                    €{drink.cost.toFixed(2)}
                  </span>
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